/** API prefix — `/api` locally, `/fi2t/api` on Prodexo preprod. */
export function apiBaseUrl(): string {
  const custom = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '')
  if (custom) return custom
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  if (base && base !== '/') return `${base}/api`
  return '/api'
}
