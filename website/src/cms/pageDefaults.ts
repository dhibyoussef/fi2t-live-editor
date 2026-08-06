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
 * For EN/AR: locale overlay fills gaps and replaces untouched FR seed text
 * (or leftover French in the API) so the UI switches language.
 * Real per-locale CMS edits always win.
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
    if (
      !apiValue
      || apiValue === frDefaults[key]
      || looksUntranslatedFrench(apiValue, locale)
      || prefersLocaleOverlay(apiValue, overlayValue, locale)
    ) {
      merged[key] = overlayValue
    }
  }

  return merged
}

const AR_SCRIPT = /[\u0600-\u06FF]/
const FR_MARKERS =
  /\b(des|les|pour|avec|dans|sur|une|est|sont|par|aux|du|de la|et|ou|Fédération|syndicat|tourisme|membres|devenir|rejoindre|pourquoi|diversification|objectifs|hébergement|Tourisme|Agences|Adresse|Envoyer|Nom|Contact|Organisation|Actualités)\b|[àâäéèêëïîôùûüç]/iu

/** Prefer overlay when API is clearly not in the target language. */
function prefersLocaleOverlay(apiValue: string, overlayValue: string, locale: string): boolean {
  if (!apiValue.trim() || apiValue === overlayValue) return false
  if (locale === 'ar') {
    // Arabic overlay vs API with no Arabic script → API is untranslated
    if (AR_SCRIPT.test(overlayValue) && !AR_SCRIPT.test(apiValue)) return true
  }
  if (locale === 'en') {
    if (FR_MARKERS.test(apiValue) && !FR_MARKERS.test(overlayValue)) return true
  }
  return false
}

/** Detect French leftovers that should yield to EN/AR overlays. */
function looksUntranslatedFrench(value: string, locale: string): boolean {
  if (locale === 'fr' || !value.trim()) return false
  // Pure Arabic (no French leftovers) → keep
  if (locale === 'ar' && AR_SCRIPT.test(value) && !FR_MARKERS.test(value)) {
    return false
  }
  // Clean English → keep
  if (
    locale === 'en'
    && /\b(the|and|of|to|for|with|our|is|are)\b/i.test(value)
    && !/[àâäéèêëïîôùûüç]/i.test(value)
  ) {
    return false
  }
  return FR_MARKERS.test(value)
}
