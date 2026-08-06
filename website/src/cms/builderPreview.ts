export const BUILDER_PREVIEW_MSG = 'gc-builder-preview'
export const BUILDER_PREVIEW_READY = 'gc-builder-preview-ready'
/** Iframe → parent: queue a draft edit so the admin « Enregistrer » can persist it. */
export const BUILDER_PREVIEW_EDIT = 'gc-builder-preview-edit'
/** Iframe → parent: local pending was saved or discarded. */
export const BUILDER_PREVIEW_SAVED = 'gc-builder-preview-saved'

export interface BuilderPreviewPayload {
  type: typeof BUILDER_PREVIEW_MSG
  page: string
  locale: string
  overrides: Record<string, string>
  highlightSection: string | null
  scrollToSection?: string | null
  device?: 'desktop' | 'tablet' | 'mobile'
}

export interface BuilderPreviewEditPayload {
  type: typeof BUILDER_PREVIEW_EDIT
  page: string
  section: string
  key: string
  locale: string
  blockType: 'text' | 'image' | 'json'
  value: string
  label?: string
}

export interface BuilderPreviewSavedPayload {
  type: typeof BUILDER_PREVIEW_SAVED
  page: string
  /** When true, parent should drop matching draft rows (iframe already persisted). */
  cleared: boolean
}

export function isBuilderEmbed(): boolean {
  return new URLSearchParams(window.location.search).get('builder_preview') === '1'
}
