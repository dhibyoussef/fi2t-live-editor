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

/** Prefer a real section band; never outline giant lists / full-bleed images. */
function pickHighlightTargets(section: string): Element[] {
  const band = document.querySelector(`[data-cms-section="${section}"]`)
  if (band) return [band]

  const blocks = [...document.querySelectorAll(`[data-cms-block^="${section}."]`)]
  const compact = blocks.filter((el) => {
    if (el.classList.contains('cms-json-list')) return false
    if (el.tagName === 'IMG') return false
    if (el.classList.contains('cms-editable--image')) return false
    const r = el.getBoundingClientRect()
    return r.height > 0 && r.height < 220 && r.width < 900
  })
  if (compact.length) return compact.slice(0, 3)

  // Fallback: first block only (avoid painting the whole page)
  return blocks.slice(0, 1)
}

export function BuilderPreviewProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const [isEmbed] = useState(isBuilderEmbed)
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [highlightSection, setHighlightSection] = useState<string | null>(null)

  useEffect(() => {
    if (!isEmbed) return

    document.body.classList.add('cms-builder-embed')

    const onMessage = (e: MessageEvent<BuilderPreviewPayload>) => {
      // Accept only messages from the admin CMS origin (or same origin in local proxy)
      const allowed = [window.location.origin]
      try {
        if (document.referrer) allowed.push(new URL(document.referrer).origin)
      } catch { /* ignore */ }
      if (!allowed.includes(e.origin)) return
      if (e.data?.type !== BUILDER_PREVIEW_MSG) return
      if (e.data.overrides) setOverrides(e.data.overrides)
      if ('highlightSection' in e.data) setHighlightSection(e.data.highlightSection)
      if (e.data.locale && e.data.locale !== i18n.language.split('-')[0]) {
        void i18n.changeLanguage(e.data.locale)
      }
      if (e.data.scrollToSection) {
        requestAnimationFrame(() => {
          const sec = e.data.scrollToSection as string
          const target =
            document.querySelector(`[data-cms-section="${sec}"]`)
            || document.querySelector(`[data-cms-block^="${sec}."]`)
            || document.querySelector(`[data-cms-block="${sec}"]`)
          target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }
    }

    window.addEventListener('message', onMessage)
    // Only talk to the known admin origin (never '*')
    const parentOrigin = document.referrer ? (() => {
      try { return new URL(document.referrer).origin } catch { return '*' }
    })() : '*'
    window.parent.postMessage({ type: BUILDER_PREVIEW_READY, page: window.location.pathname }, parentOrigin)

    return () => {
      window.removeEventListener('message', onMessage)
      document.body.classList.remove('cms-builder-embed')
    }
  }, [isEmbed, i18n])

  useEffect(() => {
    if (!isEmbed) return
    document.querySelectorAll('.cms-section-highlight').forEach((el) => {
      el.classList.remove('cms-section-highlight')
    })
    if (!highlightSection) return
    pickHighlightTargets(highlightSection).forEach((el) => {
      el.classList.add('cms-section-highlight')
    })
  }, [isEmbed, highlightSection, overrides])

  return (
    <BuilderPreviewContext.Provider value={{ isEmbed, overrides, highlightSection }}>
      {children}
    </BuilderPreviewContext.Provider>
  )
}

export function useBuilderPreview() {
  return useContext(BuilderPreviewContext)
}
