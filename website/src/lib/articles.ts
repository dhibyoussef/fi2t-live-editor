export type ArticleSection = {
  question: string
  answer: string
}

export type ArticleItem = {
  slug: string
  title: string
  desc: string
  date: string
  img: string
  hero_title?: string
  subtitle?: string
  quote?: string
  intro?: string
  sections?: ArticleSection[]
  source?: string
}

export function parseArticles(raw: string, fallback: ArticleItem[]): ArticleItem[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export function findArticleBySlug(items: ArticleItem[], slug: string): ArticleItem | undefined {
  return items.find((item) => item.slug === slug)
}

/** URL-safe slug from a French title. */
export function slugifyArticleTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'nouvel-article'
}

export function uniqueArticleSlug(base: string, existing: ArticleItem[]): string {
  const root = slugifyArticleTitle(base)
  if (!existing.some((a) => a.slug === root)) return root
  let n = 2
  while (existing.some((a) => a.slug === `${root}-${n}`)) n += 1
  return `${root}-${n}`
}

/** Full article stub for Live Editor “Ajouter un article” (card + detail fields). */
export function createEmptyArticle(
  existing: ArticleItem[],
  overrides: Partial<ArticleItem> = {},
): ArticleItem {
  const title = overrides.title?.trim() || 'Nouvel article'
  const slug = overrides.slug?.trim() || uniqueArticleSlug(title, existing)
  const today = new Date()
  const date =
    overrides.date?.trim() ||
    today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return {
    slug,
    title,
    desc: overrides.desc?.trim() || 'Résumé de l’article…',
    date,
    img: overrides.img || '/images/act1.png?v=6',
    hero_title: overrides.hero_title ?? title,
    subtitle: overrides.subtitle ?? '',
    quote: overrides.quote ?? '',
    intro: overrides.intro ?? 'Introduction de l’article…',
    sections: overrides.sections ?? [
      { question: 'Question 1', answer: 'Réponse…' },
      { question: 'Question 2', answer: 'Réponse…' },
    ],
    source: overrides.source ?? 'Source : Fi2T',
  }
}

const FR_DETAIL_MARKERS =
  /\b(des|les|pour|avec|dans|sur|une|est|sont|Fédération|tourisme|Président|Question|Réponse|Source|profite|modèle|économie)\b|[àâäéèêëïîôùûüçœ]/iu

function looksFrenchDetail(value?: string): boolean {
  if (!value?.trim()) return false
  return FR_DETAIL_MARKERS.test(value)
}

function sectionsLookFrench(sections?: ArticleSection[]): boolean {
  if (!sections?.length) return false
  return looksFrenchDetail(sections.map((s) => `${s.question}\n${s.answer}`).join('\n'))
}

function pickLocalizedField(
  cmsValue: string | undefined,
  defaultValue: string | undefined,
): string | undefined {
  if (!cmsValue) return defaultValue
  if (
    defaultValue
    && looksFrenchDetail(cmsValue)
    && !looksFrenchDetail(defaultValue)
  ) {
    return defaultValue
  }
  return cmsValue || defaultValue
}

/** Prefer CMS fields; fill missing detail (hero/quote/sections/…) from defaults. */
export function mergeArticleDetail(
  fromCms: ArticleItem | undefined,
  fromDefaults: ArticleItem | undefined,
): ArticleItem | undefined {
  if (!fromCms && !fromDefaults) return undefined
  if (!fromCms) return fromDefaults
  if (!fromDefaults) return fromCms

  const cmsSections = fromCms.sections?.length ? fromCms.sections : undefined
  const defSections = fromDefaults.sections?.length ? fromDefaults.sections : undefined
  let sections = cmsSections ?? defSections
  if (
    cmsSections
    && defSections
    && sectionsLookFrench(cmsSections)
    && !sectionsLookFrench(defSections)
  ) {
    sections = defSections
  }

  return {
    ...fromDefaults,
    ...fromCms,
    hero_title: pickLocalizedField(fromCms.hero_title, fromDefaults.hero_title),
    subtitle: pickLocalizedField(fromCms.subtitle, fromDefaults.subtitle),
    quote: pickLocalizedField(fromCms.quote, fromDefaults.quote),
    intro: pickLocalizedField(fromCms.intro, fromDefaults.intro),
    sections,
    source: pickLocalizedField(fromCms.source, fromDefaults.source),
    img: fromCms.img || fromDefaults.img,
  }
}

/**
 * Deep-merge article lists by slug: keep CMS card/text edits, fill missing
 * detail fields (sections, quote, intro…) from the locale overlay/defaults.
 */
export function mergeArticlesBySlug(
  fromCms: ArticleItem[],
  fromDefaults: ArticleItem[],
): ArticleItem[] {
  if (!fromCms.length) return fromDefaults
  if (!fromDefaults.length) return fromCms

  const defaultsBySlug = new Map(fromDefaults.map((item) => [item.slug, item]))
  const seen = new Set<string>()
  const merged: ArticleItem[] = []

  for (const cmsItem of fromCms) {
    seen.add(cmsItem.slug)
    const detail = mergeArticleDetail(cmsItem, defaultsBySlug.get(cmsItem.slug))
    if (detail) merged.push(detail)
  }

  for (const defItem of fromDefaults) {
    if (seen.has(defItem.slug)) continue
    merged.push(defItem)
  }

  return merged
}

/** JSON string helper for CMS `grid.items` locale merge. */
export function mergeArticlesJson(cmsRaw: string, defaultsRaw: string): string {
  const cms = parseArticles(cmsRaw, [])
  const defaults = parseArticles(defaultsRaw, [])
  if (!defaults.length) return cmsRaw
  if (!cms.length) return defaultsRaw
  return JSON.stringify(mergeArticlesBySlug(cms, defaults))
}
