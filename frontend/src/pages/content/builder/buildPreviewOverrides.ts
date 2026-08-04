import { HOME_PREVIEW_DEFAULTS } from './homePreviewDefaults'

interface BlockRow {
  key: string
  type: 'text' | 'image' | 'json'
  locales: Record<string, { value: string | null }>
}

interface Section {
  name: string
  blocks: BlockRow[]
}

interface PendingChange {
  section: string
  key: string
  locale: string
  value: string
}

export function buildPreviewOverrides(
  pageSlug: string,
  sections: Section[],
  changes: Record<string, PendingChange>,
  locale: string,
): Record<string, string> {
  const overrides: Record<string, string> = {}

  if (pageSlug === 'home') {
    for (const [key, value] of Object.entries(HOME_PREVIEW_DEFAULTS)) {
      if (value) overrides[key] = value
    }
  }

  for (const sec of sections) {
    for (const block of sec.blocks) {
      // Images stay shared. Text + per-language JSON (`<band>.data`) follow the preview locale.
      const candidates =
        block.type === 'image'
          ? ['_all']
          : block.type === 'json'
            ? [locale, 'fr', '_all']
            : [locale, 'fr']

      let value = ''
      for (const loc of candidates) {
        const changeId = `${sec.name}.${block.key}.${loc}`
        value = changes[changeId]?.value ?? block.locales[loc]?.value ?? ''
        if (value) break
      }

      if (value) {
        overrides[`${sec.name}.${block.key}`] = value
      }
    }
  }

  return overrides
}
