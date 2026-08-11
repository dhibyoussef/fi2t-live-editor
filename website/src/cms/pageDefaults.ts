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
import { mergeArticlesJson } from '../lib/articles'
import { applyFrMediaToBlocks } from './mediaSync'

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

/** Article JSON keys that need per-slug deep merge (card + interview detail). */
const ARTICLE_LIST_KEYS = new Set(['grid.items', 'actualites.items'])

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
 * Also undoes swapped locales (Arabic stored under `fr`, French under `ar`).
 * Real per-locale CMS edits always win when they match the active language.
 */
export function mergePageBlocks(
  page: string,
  apiBlocks: Record<string, string>,
  locale = 'fr',
  /** Optional FR API blocks — forces shared media (img/icon/…) onto EN/AR. */
  frApiBlocks?: Record<string, string>,
): Record<string, string> {
  const frDefaults = PAGE_DEFAULTS[page] ?? {}
  const overlay = getLocaleOverlay(page, locale)
  const merged: Record<string, string> = { ...frDefaults, ...apiBlocks }

  if (locale === 'fr') {
    // Arabic or English content wrongly saved as FR → restore French defaults
    for (const [key, frValue] of Object.entries(frDefaults)) {
      const apiValue = apiBlocks[key]
      if (!apiValue || apiValue === frValue) continue
      if (looksLikeArabic(apiValue) && !looksLikeArabic(frValue)) {
        merged[key] = frValue
        continue
      }
      if (looksLikeEnglishLeak(apiValue, frValue)) {
        merged[key] = frValue
      }
    }
    return merged
  }

  if (Object.keys(overlay).length) {
    for (const [key, overlayValue] of Object.entries(overlay)) {
      const apiValue = apiBlocks[key]
      if (
        !apiValue
        || apiValue === frDefaults[key]
        || looksUntranslatedFrench(apiValue, locale)
        || prefersLocaleOverlay(apiValue, overlayValue, locale)
      ) {
        merged[key] = overlayValue
        continue
      }
      /* EN/AR card lists often omit interview detail — deep-merge by slug. */
      if (ARTICLE_LIST_KEYS.has(key)) {
        merged[key] = mergeArticlesJson(apiValue, overlayValue)
      }
    }
  }

  // Same images / icons / layout media as French (text stays translated).
  const frMerged = frApiBlocks
    ? { ...frDefaults, ...frApiBlocks }
    : frDefaults
  return applyFrMediaToBlocks(merged, frMerged)
}

const AR_SCRIPT = /[\u0600-\u06FF]/
const FR_MARKERS =
  /\b(des|les|pour|avec|dans|sur|une|est|sont|par|aux|du|de la|et|ou|Fédération|syndicat|tourisme|membres|devenir|rejoindre|pourquoi|diversification|objectifs|hébergement|Tourisme|Agences|Adresse|Envoyer|Nom|Contact|Organisation|Actualités)\b|[àâäéèêëïîôùûüç]/iu

function looksLikeArabic(value: string): boolean {
  return AR_SCRIPT.test(value)
}

/** English CMS value under FR locale (e.g. "Health tourism" instead of "Tourisme de santé"). */
function looksLikeEnglishLeak(apiValue: string, frValue: string): boolean {
  if (!frValue.trim() || apiValue === frValue) return false
  const enMarkers =
    /\b(Health|Medical|Tourism|Organization|Who we are|Membership|News|Travel agencies|Cultural|Adventure|Business)\b/
  const frLooksFrench =
    FR_MARKERS.test(frValue)
    || /[àâäéèêëïîôùûüç]/i.test(frValue)
    || /\b(Tourisme|Organisation|Actualités|Qui|Agences|Hébergement|Fédération)\b/.test(frValue)
  return enMarkers.test(apiValue) && frLooksFrench && !enMarkers.test(frValue)
}

/** Prefer overlay when API is clearly not in the target language. */
function prefersLocaleOverlay(apiValue: string, overlayValue: string, locale: string): boolean {
  if (!apiValue.trim() || apiValue === overlayValue) return false
  if (locale === 'ar') {
    // Arabic overlay vs API with no Arabic script → API is untranslated / swapped FR
    if (AR_SCRIPT.test(overlayValue) && !AR_SCRIPT.test(apiValue)) return true
    // Dense French in AR slot even if overlay is mixed (names, numbers)
    if (FR_MARKERS.test(apiValue) && AR_SCRIPT.test(overlayValue)) return true
  }
  if (locale === 'en') {
    if (FR_MARKERS.test(apiValue) && !FR_MARKERS.test(overlayValue)) return true
    if (AR_SCRIPT.test(apiValue) && !AR_SCRIPT.test(overlayValue)) return true
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
    && !AR_SCRIPT.test(value)
  ) {
    return false
  }
  return FR_MARKERS.test(value)
}
