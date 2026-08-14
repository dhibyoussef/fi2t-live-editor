/**
 * Prefix root-relative CMS URLs with the app path (`/fi2t` on preprod).
 * Admin BASE_URL is `/fi2t/admin/` so storage must use VITE_APP_PREFIX, not BASE_URL.
 */
export function publicUrl(path: string | undefined | null): string {
  if (!path?.trim()) return ''
  const url = path.trim()
  if (/^(https?:|data:|blob:)/i.test(url)) return url
  const prefix = (import.meta.env.VITE_APP_PREFIX as string | undefined)?.replace(/\/$/, '') || ''
  if (!url.startsWith('/')) return prefix ? `${prefix}/${url}` : url
  if (prefix && url.startsWith(`${prefix}/`)) return url
  return prefix ? `${prefix}${url}` : url
}
