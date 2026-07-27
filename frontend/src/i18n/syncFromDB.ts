import i18n from 'i18next'
import api from '../api/client'

/**
 * Convert flat dot-notation keys → nested object for i18next
 *   { 'nav.dashboard': 'Tableau de bord' }
 *   → { nav: { dashboard: 'Tableau de bord' } }
 */
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

/**
 * Fetch all translations from the DB and merge them into i18next.
 * DB values override the static .ts files (admin edits take effect immediately).
 */
export async function syncTranslationsFromDB(): Promise<void> {
  try {
    const { data } = await api.get<Record<string, Record<string, string>>>('/translations/all')
    for (const [locale, flat] of Object.entries(data)) {
      const nested = unflattenKeys(flat)
      i18n.addResourceBundle(locale, 'translation', nested, true /* deep */, true /* overwrite */)
    }
  } catch {
    // Silently fail — static files remain as fallback
  }
}

/**
 * Apply a single locale's flat translations without a round-trip (used after
 * the admin saves changes in the TranslationsPage).
 */
export function applyLocaleOverrides(locale: string, flat: Record<string, string>): void {
  const nested = unflattenKeys(flat)
  i18n.addResourceBundle(locale, 'translation', nested, true, true)
}
