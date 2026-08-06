import api from '../api/client'

/** Upload an image for Live Editor — never set Content-Type (browser must add multipart boundary). */
export async function uploadWebsiteImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('image', file)
  const { data } = await api.post<{ url: string }>('/admin/content/upload-image', form)
  if (!data?.url) throw new Error('Réponse serveur invalide')
  return data.url
}
