import axios from 'axios'
import { apiBaseUrl } from '../lib/apiBase'

const api = axios.create({
  baseURL: apiBaseUrl(),
  timeout: 12_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Let the browser set multipart boundary — never force application/json on FormData
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }

  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gc_token')
      try {
        // Clear persisted zustand auth so ProtectedRoute cannot stay "logged in"
        localStorage.removeItem('gc-auth')
      } catch { /* ignore */ }
      const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
      const loginPath = `${base}/login`
      if (!window.location.pathname.startsWith(loginPath)) {
        window.location.href = loginPath
      }
    }
    return Promise.reject(error)
  }
)

export { api as apiClient }
export default api
