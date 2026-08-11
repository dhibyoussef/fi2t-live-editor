import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import api, { setAuthToken } from '../api/client'

interface EditModeContextValue {
  isEditMode: boolean
  isAdmin: boolean
  /** True only for the `super-admin` role (not regular admin). */
  isSuperAdmin: boolean
  user: { name: string; email: string } | null
  exitEditMode: () => void
}

const EditModeContext = createContext<EditModeContextValue>({
  isEditMode: false,
  isAdmin: false,
  isSuperAdmin: false,
  user: null,
  exitEditMode: () => {},
})

const TOKEN_KEY = 'gc_edit_token'

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
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
        const superAdmin = roles.includes('super-admin')
        if (superAdmin || roles.includes('admin')) {
          setIsAdmin(true)
          setIsSuperAdmin(superAdmin)
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

  // CTA / card buttons are <Link> wrappers around editable labels. Block those
  // navigations in edit mode so a click edits the label instead of leaving the page.
  useEffect(() => {
    if (!isEditMode) return

    const onClickCapture = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (!el) return
      if (el.closest('.cms-toolbar, .cms-list-modal, .cms-edit-popup, [data-cms-allow-nav]')) return

      const anchor = el.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return
      if (anchor.hasAttribute('data-cms-allow-nav')) return

      const wrapsEditable = anchor.querySelector(
        '.cms-editable, .cms-percent-edit, .cms-editable--image, .cms-list-image-btn, .cms-edit-popup',
      )
      if (!wrapsEditable) return

      // Cancel navigation only — do not stopPropagation so the editable still receives the click.
      e.preventDefault()
    }

    document.addEventListener('click', onClickCapture, true)
    return () => document.removeEventListener('click', onClickCapture, true)
  }, [isEditMode])

  const exitEditMode = () => {
    sessionStorage.removeItem(TOKEN_KEY)
    setAuthToken(null)
    setIsEditMode(false)
    setIsAdmin(false)
    setIsSuperAdmin(false)
    setUser(null)
  }

  return (
    <EditModeContext.Provider value={{ isEditMode, isAdmin, isSuperAdmin, user, exitEditMode }}>
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode() {
  return useContext(EditModeContext)
}
