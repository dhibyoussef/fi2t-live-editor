const WEBSITE_ORIGIN = import.meta.env.VITE_WEBSITE_ORIGIN ?? 'http://localhost:3002'
const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN as string | undefined)
  ?? (import.meta.env.VITE_APP_PREFIX as string | undefined)
  ?? 'http://localhost:8000'

/** Résout une URL d'image CMS pour l'aperçu admin (chemins relatifs → site public) */
export function resolvePreviewImageUrl(url: string | undefined | null): string {
  if (!url?.trim()) return ''
  if (/^(https?:|data:|blob:)/i.test(url)) return url
  const prefix = (import.meta.env.VITE_APP_PREFIX as string | undefined)?.replace(/\/$/, '') || ''
  if (url.startsWith('/storage/')) {
    if (prefix) return `${prefix}${url}`
    return `${API_ORIGIN}${url}`
  }
  if (url.startsWith('/')) {
    const origin = WEBSITE_ORIGIN.replace(/\/$/, '')
    if (origin && !/localhost|127\.0\.0\.1/.test(origin)) {
      if (prefix && origin.endsWith(prefix)) return `${origin}${url}`
      return `${origin}${url}`
    }
    if (prefix) return `${prefix}${url}`
    return `${origin}${url}`
  }
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
