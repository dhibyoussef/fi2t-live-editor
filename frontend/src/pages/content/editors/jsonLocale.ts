/**
 * Decide which locale keys a JSON block is stored under.
 *
 * Most FI2T lists (objectifs, groupements…) are shared (`_all`).
 * The Figma groupement bands (`<band>.data`) are per-language so EN/AR
 * translations stay editable independently of FR.
 */

export const TEXT_LOCALES = [
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'ar', flag: '🇹🇳', name: 'العربية' },
] as const

export type JsonLocale = 'fr' | 'en' | 'ar' | '_all'

export function isLocalizedJson(block: {
  key: string
  locales: Record<string, unknown>
}): boolean {
  if (block.key === 'data') return true
  return TEXT_LOCALES.some((l) => l.code in block.locales)
}

export function jsonLocales(block: {
  key: string
  locales: Record<string, unknown>
}): JsonLocale[] {
  return isLocalizedJson(block) ? TEXT_LOCALES.map((l) => l.code) : ['_all']
}

/** Prefer the active UI locale, then FR, then `_all`, then anything present. */
export function pickJsonLocale(
  block: { key: string; locales: Record<string, unknown> },
  preferred = 'fr',
): JsonLocale {
  const available = jsonLocales(block)
  if (available.includes(preferred as JsonLocale)) return preferred as JsonLocale
  if (available.includes('fr')) return 'fr'
  return available[0] ?? '_all'
}
