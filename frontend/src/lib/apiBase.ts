/** API prefix — `/api` locally, `/fi2t/api` on Prodexo (use VITE_API_BASE or VITE_APP_PREFIX). */
export function apiBaseUrl(): string {
  const custom = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '')
  if (custom) return custom
  const appPrefix = (import.meta.env.VITE_APP_PREFIX as string | undefined)?.replace(/\/$/, '')
  if (appPrefix) return `${appPrefix}/api`
  return '/api'
}
