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
