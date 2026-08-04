import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
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
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export { api as apiClient }
export default api
