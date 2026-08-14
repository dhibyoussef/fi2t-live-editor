import api from '../api/client'
import { compressImage } from '../lib/compressImage'

function axiosUploadMessage(err: unknown): string {
  const ax = err as {
    response?: { data?: { message?: string; errors?: { image?: string[] } } }
    message?: string
  }
  return ax.response?.data?.errors?.image?.[0]
    ?? ax.response?.data?.message
    ?? (err instanceof Error ? err.message : 'Erreur lors du téléversement.')
}

/** Upload an image for Live Editor — never set Content-Type (browser must add multipart boundary). */
export async function uploadWebsiteImage(file: File): Promise<string> {
  const { file: ready } = await compressImage(file)
  const form = new FormData()
  form.append('image', ready, ready.name)
  try {
    const { data } = await api.post<{ url: string }>('/admin/content/upload-image', form, {
      timeout: 60_000,
    })
    if (!data?.url) throw new Error('Réponse serveur invalide')
    return data.url
  } catch (err) {
    throw new Error(axiosUploadMessage(err))
  }
}
