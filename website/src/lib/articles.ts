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

  return {
    ...fromDefaults,
    ...fromCms,
    hero_title: fromCms.hero_title || fromDefaults.hero_title,
    subtitle: fromCms.subtitle || fromDefaults.subtitle,
    quote: fromCms.quote || fromDefaults.quote,
    intro: fromCms.intro || fromDefaults.intro,
    sections: cmsSections ?? defSections,
    source: fromCms.source || fromDefaults.source,
    img: fromCms.img || fromDefaults.img,
  }
}
