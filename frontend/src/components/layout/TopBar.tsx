import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, ChevronDown, LogOut, User2, Globe } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../api/client'
import toast from 'react-hot-toast'

const LANGUAGES = [
  { code: 'fr', label: 'FR', full: 'Français' },
  { code: 'en', label: 'EN', full: 'English'  },
  { code: 'ar', label: 'AR', full: 'العربية'  },
]

interface TopBarProps {
  pageTitle?:    string
  pageSubtitle?: string
}

export default function TopBar({ pageTitle, pageSubtitle }: TopBarProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [langOpen, setLangOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0]

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    setLangOpen(false)
  }

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout', undefined, { timeout: 4000 })
    } catch {
      /* still clear local session */
    }
    logout()
    navigate('/login', { replace: true })
    toast.success('Déconnexion réussie')
  }

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : 'U'

  return (
    <header className="gc-topbar">
      {/* Page title */}
      <div className="gc-topbar-left">
        {(pageTitle || pageSubtitle) && (
          <div className="gc-topbar-title">
            {pageTitle    && <h1>{pageTitle}</h1>}
            {pageSubtitle && <p>{pageSubtitle}</p>}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="gc-topbar-actions">
        {/* Bell */}
        <button className="gc-icon-btn">
          <Bell size={15} />
          <span className="gc-badge-dot" />
        </button>

        {/* Language */}
        <div style={{ position: 'relative' }}>
          <button
            className="gc-lang-btn"
            onClick={() => { setLangOpen(o => !o); setUserOpen(false) }}
          >
            <Globe size={13} />
            <span>{currentLang.label}</span>
            <ChevronDown size={11} style={{ opacity: 0.6, transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {langOpen && (
            <div className="gc-dropdown" style={{ minWidth: 130 }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  className={`gc-dropdown-item${lang.code === i18n.language ? ' active' : ''}`}
                  onClick={() => changeLanguage(lang.code)}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.5, width: 22, flexShrink: 0 }}>
                    {lang.label}
                  </span>
                  {lang.full}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="gc-topbar-divider" />

        {/* User */}
        <div style={{ position: 'relative' }}>
          <button
            className={`gc-user-btn${userOpen ? ' open' : ''}`}
            onClick={() => { setUserOpen(o => !o); setLangOpen(false) }}
          >
            <div className="gc-user-avatar">{initials}</div>
            <div className="gc-user-info">
              <p className="gc-user-info-name">
                {user ? `${user.first_name} ${user.last_name}` : 'Utilisateur'}
              </p>
              <p className="gc-user-info-role">
                {user?.roles?.[0] ?? 'Admin'}
              </p>
            </div>
            <ChevronDown
              size={12}
              style={{ color: '#00A98D', transform: userOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          </button>

          {userOpen && (
            <div className="gc-dropdown" style={{ minWidth: 200 }}>
              <div className="gc-dropdown-header">
                <p>{user ? `${user.first_name} ${user.last_name}` : ''}</p>
                <p>{user?.email}</p>
              </div>
              <button
                className="gc-dropdown-item"
                onClick={() => { setUserOpen(false); navigate('/users') }}
              >
                <User2 size={14} />
                {t('common.profile')}
              </button>
              <button
                className="gc-dropdown-item danger"
                onClick={handleLogout}
              >
                <LogOut size={14} />
                {t('common.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
