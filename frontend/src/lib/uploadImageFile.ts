import { apiBaseUrl } from './apiBase'
import { compressImage } from './compressImage'

export type UploadEndpoint = '/admin/carousels/upload-image' | '/admin/content/upload-image'

function uploadFormData(
  endpoint: UploadEndpoint,
  form: FormData,
  onProgress?: (percent: number) => void,
): Promise<{ url: string; path?: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${apiBaseUrl()}${endpoint}`)
    xhr.setRequestHeader('Accept', 'application/json')

    const token = localStorage.getItem('gc_token')
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = e => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      let body: { url?: string; path?: string; message?: string; errors?: Record<string, string[]> } = {}
      try {
        body = JSON.parse(xhr.responseText)
      } catch {
        /* non-JSON */
      }

      if (xhr.status >= 200 && xhr.status < 300 && body.url) {
        resolve({ url: body.url, path: body.path })
        return
      }

      const validation = body.errors?.image?.[0]
      reject(new Error(validation ?? body.message ?? `Erreur serveur (${xhr.status})`))
    }

    xhr.onerror = () => reject(new Error('Erreur réseau lors du téléversement.'))
    xhr.send(form)
  })
}

export async function uploadImageFile(
  file: File,
  endpoint: UploadEndpoint = '/admin/content/upload-image',
  onProgress?: (percent: number) => void,
  onPhase?: (phase: 'compressing' | 'uploading') => void,
): Promise<{ url: string; path?: string; compressed?: boolean }> {
  onPhase?.('compressing')
  const { file: ready, compressed } = await compressImage(file)
  onPhase?.('uploading')

  const form = new FormData()
  form.append('image', ready, ready.name)

  const data = await uploadFormData(endpoint, form, onProgress)
  return { ...data, compressed }
}
