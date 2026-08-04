import { HOME_DEFAULTS } from './defaults/home'
import { CONTACT_DEFAULTS } from './defaults/contact'
import { QUI_SOMMES_NOUS_DEFAULTS } from './defaults/qui-sommes-nous'
import { ORGANISATION_DEFAULTS } from './defaults/organisation'
import { ACTUALITES_DEFAULTS } from './defaults/actualites'
import { FICHE_ADHESION_DEFAULTS } from './defaults/fiche-adhesion'
import { getGroupementDefaults, GROUPEMENT_SLUGS } from './defaults/groupements-index'
import { HOME_AR, HOME_EN } from './defaults/locales/home'
import { PAGE_AR, PAGE_EN } from './defaults/locales/pages'
import { GROUPEMENT_AR, GROUPEMENT_EN } from './defaults/locales/groupements'

const PAGE_DEFAULTS: Record<string, Record<string, string>> = {
  home: HOME_DEFAULTS,
  contact: CONTACT_DEFAULTS,
  'qui-sommes-nous': QUI_SOMMES_NOUS_DEFAULTS,
  organisation: ORGANISATION_DEFAULTS,
  actualites: ACTUALITES_DEFAULTS,
  'fiche-adhesion': FICHE_ADHESION_DEFAULTS,
  global: {
    'header.logo': '/logo.png',
    'settings.tagline': 'Fédération Interprofessionnelle du Tourisme Tunisien',
    'footer.about':
      'La Fédération Interprofessionnelle du Tourisme Tunisien œuvre pour le rayonnement et la modernisation du secteur.',
    'footer.newsletter': 'Restez informé de nos dernières initiatives.',
    'footer.address': "Résidence MERIEM - Appt N°2 -\nLes Berges du Lac 1\n1053 Tunis, Tunisie",
  },
}

for (const slug of GROUPEMENT_SLUGS) {
  PAGE_DEFAULTS[slug] = getGroupementDefaults(slug)
}

const LOCALE_OVERLAYS: Record<string, Record<string, Record<string, string>>> = {
  en: { home: HOME_EN, ...PAGE_EN, ...GROUPEMENT_EN },
  ar: { home: HOME_AR, ...PAGE_AR, ...GROUPEMENT_AR },
}

export function getLocaleOverlay(page: string, locale: string): Record<string, string> {
  if (locale === 'fr') return {}
  return LOCALE_OVERLAYS[locale]?.[page] ?? {}
}

export function getPageDefaults(page: string, locale = 'fr'): Record<string, string> {
  const base = PAGE_DEFAULTS[page] ?? {}
  if (locale === 'fr') return { ...base }
  return { ...base, ...getLocaleOverlay(page, locale) }
}

/**
 * Merge API blocks with defaults for the active locale.
 * For EN/AR: if the API value is missing or still equal to the FR default
 * (typical when content is stored as locale `_all`), keep the locale overlay
 * so the UI switches language immediately.
 */
export function mergePageBlocks(
  page: string,
  apiBlocks: Record<string, string>,
  locale = 'fr',
): Record<string, string> {
  const frDefaults = PAGE_DEFAULTS[page] ?? {}
  const overlay = getLocaleOverlay(page, locale)
  const merged: Record<string, string> = { ...frDefaults, ...apiBlocks }

  if (locale === 'fr' || !Object.keys(overlay).length) {
    return merged
  }

  for (const [key, overlayValue] of Object.entries(overlay)) {
    const apiValue = apiBlocks[key]
    const leftoverFrench =
      !!apiValue &&
      locale !== 'fr' &&
      /\b(des|les|pour|avec|dans|auprès|opérateurs|intérêts|compétences|positionner|passer|renforcer|favoriser|formation|tourisme)\b/i.test(
        apiValue,
      )
    if (!apiValue || apiValue === frDefaults[key] || leftoverFrench) {
      merged[key] = overlayValue
    }
  }

  return merged
}
