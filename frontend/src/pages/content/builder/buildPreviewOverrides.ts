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
      const loc = block.type === 'text' ? locale : '_all'
      const changeId = `${sec.name}.${block.key}.${loc}`
      const value =
        changes[changeId]?.value
        ?? block.locales[loc]?.value
        ?? block.locales['_all']?.value
        ?? ''

      if (value) {
        overrides[`${sec.name}.${block.key}`] = value
      }
    }
  }

  return overrides
}
