import i18n from '../i18n'
import api from '../api/client'

/** Convert flat dot-notation keys → nested object for i18next */
export function unflattenKeys(flat: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.')
    let node = result
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof node[parts[i]] !== 'object' || node[parts[i]] === null) {
        node[parts[i]] = {}
      }
      node = node[parts[i]] as Record<string, unknown>
    }
    node[parts[parts.length - 1]] = value
  }
  return result
}

/** Fetch DB translations and merge into i18next (overrides static locale files). */
export async function syncTranslationsFromDB(): Promise<void> {
  try {
    const { data } = await api.get<Record<string, Record<string, string>>>('/translations/all')
    for (const [locale, flat] of Object.entries(data)) {
      const nested = unflattenKeys(flat)
      i18n.addResourceBundle(locale, 'translation', nested, true, true)
    }
  } catch {
    // Static locale files remain as fallback
  }
}
