const WEBSITE_ORIGIN = import.meta.env.VITE_WEBSITE_ORIGIN ?? 'http://localhost:3002'

/** Résout une URL d'image CMS pour l'aperçu admin (chemins relatifs → site public) */
export function resolvePreviewImageUrl(url: string | undefined | null): string {
  if (!url?.trim()) return ''
  if (/^(https?:|data:)/i.test(url)) return url
  if (url.startsWith('/storage/')) {
    const api = import.meta.env.VITE_API_ORIGIN ?? 'http://localhost:8000'
    return `${api}${url}`
  }
  if (url.startsWith('/')) return `${WEBSITE_ORIGIN}${url}`
  return url
}

export function parseJsonArray<T>(raw: string | undefined, fallback: T[] = []): T[] {
  if (!raw?.trim()) return fallback
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : fallback
  } catch {
    return fallback
  }
}

export function truncateText(text: string, max = 120) {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}
