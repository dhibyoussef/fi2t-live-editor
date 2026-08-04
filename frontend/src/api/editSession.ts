import { apiClient } from './client'

const WEBSITE_ORIGIN = (import.meta.env.VITE_WEBSITE_URL as string | undefined)?.replace(/\/$/, '')
  || 'http://localhost:3002'

/** Public site origin for Live Editor / Aperçu (never hardcode in callers). */
export function websiteOrigin() {
  return WEBSITE_ORIGIN
}

/**
 * Ask the API for a short-lived Live Editor token.
 * Do not put the long-lived admin `gc_token` in query strings.
 */
export async function createEditSessionToken(): Promise<string> {
  const { data } = await apiClient.post<{ token: string }>('/admin/edit-session')
  if (!data?.token) throw new Error('Impossible de créer la session d’édition')
  return data.token
}

export async function buildLiveEditorUrl(path = '/'): Promise<string> {
  const token = await createEditSessionToken()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${WEBSITE_ORIGIN}${cleanPath}`)
  url.searchParams.set('edit_token', token)
  return url.toString()
}

export async function buildBuilderPreviewUrl(pageSlug: string): Promise<string> {
  const token = await createEditSessionToken()
  const path = pageSlug === 'home' ? '/' : `/${pageSlug}`
  const url = new URL(`${WEBSITE_ORIGIN}${path}`)
  url.searchParams.set('builder_preview', '1')
  url.searchParams.set('edit_token', token)
  return url.toString()
}
