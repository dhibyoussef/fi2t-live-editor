import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import api, { setAuthToken } from '../api/client'

interface EditModeContextValue {
  isEditMode: boolean
  isAdmin: boolean
  user: { name: string; email: string } | null
  exitEditMode: () => void
}

const EditModeContext = createContext<EditModeContextValue>({
  isEditMode: false,
  isAdmin: false,
  user: null,
  exitEditMode: () => {},
})

const TOKEN_KEY = 'gc_edit_token'

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('edit_token')

    if (urlToken) {
      sessionStorage.setItem(TOKEN_KEY, urlToken)
      params.delete('edit_token')
      // Keep builder_preview in the URL so embed mode stays detected.
      const clean = `${window.location.pathname}${params.toString() ? '?' + params : ''}`
      window.history.replaceState({}, '', clean)
    }

    const token = sessionStorage.getItem(TOKEN_KEY)
    if (!token) return

    setAuthToken(token)
    api.get('/auth/me')
      .then(({ data }) => {
        const roles: string[] = Array.isArray(data.roles) ? data.roles : []
        if (roles.includes('super-admin') || roles.includes('admin')) {
          setIsAdmin(true)
          setIsEditMode(true)
          setUser({ name: data.full_name || data.email, email: data.email })
        } else {
          sessionStorage.removeItem(TOKEN_KEY)
          setAuthToken(null)
        }
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY)
        setAuthToken(null)
      })
  }, [])

  const exitEditMode = () => {
    sessionStorage.removeItem(TOKEN_KEY)
    setAuthToken(null)
    setIsEditMode(false)
    setIsAdmin(false)
    setUser(null)
  }

  return (
    <EditModeContext.Provider value={{ isEditMode, isAdmin, user, exitEditMode }}>
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode() {
  return useContext(EditModeContext)
}
