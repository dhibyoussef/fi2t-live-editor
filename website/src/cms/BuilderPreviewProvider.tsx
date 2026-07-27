import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BUILDER_PREVIEW_MSG,
  BUILDER_PREVIEW_READY,
  type BuilderPreviewPayload,
  isBuilderEmbed,
} from './builderPreview'

interface BuilderPreviewContextValue {
  isEmbed: boolean
  overrides: Record<string, string>
  highlightSection: string | null
}

const BuilderPreviewContext = createContext<BuilderPreviewContextValue>({
  isEmbed: false,
  overrides: {},
  highlightSection: null,
})

export function BuilderPreviewProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const [isEmbed] = useState(isBuilderEmbed)
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [highlightSection, setHighlightSection] = useState<string | null>(null)

  useEffect(() => {
    if (!isEmbed) return

    document.body.classList.add('cms-builder-embed')

    const onMessage = (e: MessageEvent<BuilderPreviewPayload>) => {
      if (e.data?.type !== BUILDER_PREVIEW_MSG) return
      if (e.data.overrides) setOverrides(e.data.overrides)
      if ('highlightSection' in e.data) setHighlightSection(e.data.highlightSection)
      if (e.data.locale && e.data.locale !== i18n.language.split('-')[0]) {
        i18n.changeLanguage(e.data.locale)
      }
      if (e.data.scrollToSection) {
        requestAnimationFrame(() => {
          document
            .querySelector(`[data-cms-section="${e.data.scrollToSection}"]`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }
    }

    window.addEventListener('message', onMessage)
    window.parent.postMessage({ type: BUILDER_PREVIEW_READY, page: window.location.pathname }, '*')

    return () => {
      window.removeEventListener('message', onMessage)
      document.body.classList.remove('cms-builder-embed')
    }
  }, [isEmbed, i18n])

  return (
    <BuilderPreviewContext.Provider value={{ isEmbed, overrides, highlightSection }}>
      {children}
    </BuilderPreviewContext.Provider>
  )
}

export function useBuilderPreview() {
  return useContext(BuilderPreviewContext)
}
