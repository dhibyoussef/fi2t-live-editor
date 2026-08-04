import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('gc_token', token)
        set({
          user: {
            ...user,
            roles: Array.isArray(user.roles) ? user.roles : [],
            permissions: Array.isArray(user.permissions) ? user.permissions : [],
          },
          token,
        })
      },
      logout: () => {
        localStorage.removeItem('gc_token')
        set({ user: null, token: null })
      },
      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false
        if (user.roles.includes('super-admin')) return true
        return user.permissions?.includes(permission) ?? false
      },
      hasRole: (role) => {
        const { user } = get()
        return user?.roles?.includes(role) ?? false
      },
    }),
    { name: 'gc-auth' }
  )
)
