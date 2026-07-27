export const BUILDER_PREVIEW_MSG = 'gc-builder-preview'
export const BUILDER_PREVIEW_READY = 'gc-builder-preview-ready'

export interface BuilderPreviewPayload {
  type: typeof BUILDER_PREVIEW_MSG
  page: string
  locale: string
  overrides: Record<string, string>
  highlightSection: string | null
  scrollToSection?: string | null
}

export function isBuilderEmbed(): boolean {
  return new URLSearchParams(window.location.search).get('builder_preview') === '1'
}
