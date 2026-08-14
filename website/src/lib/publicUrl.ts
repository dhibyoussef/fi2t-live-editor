/**
 * Prefix root-relative URLs with Vite `base` (e.g. `/fi2t/` on Prodexo preprod).
 * Leaves absolute http(s) and data URLs unchanged.
 */
export function publicUrl(path: string | undefined | null): string {
  if (!path?.trim()) return ''
  const url = path.trim()
  if (/^(https?:|data:|blob:)/i.test(url)) return url
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  if (!url.startsWith('/')) return `${base}/${url}`.replace(/\/{2,}/g, '/')
  if (base && base !== '' && url.startsWith(`${base}/`)) return url
  if (!base || base === '/') return url
  return `${base}${url}`
}
