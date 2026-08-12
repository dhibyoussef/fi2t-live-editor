import axios from 'axios'
import { apiBaseUrl } from '../lib/apiBase'

const api = axios.create({
  baseURL: apiBaseUrl(),
  headers: { Accept: 'application/json' },
})

// Let the browser set the multipart boundary for image uploads.
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type')
    } else if (config.headers) {
      delete (config.headers as Record<string, unknown>)['Content-Type']
    }
  }
  return config
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export default api
