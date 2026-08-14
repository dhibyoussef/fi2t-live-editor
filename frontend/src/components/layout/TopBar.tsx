import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, ChevronDown, LogOut, User2, Globe, Inbox } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
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

function relativeTime(iso: string, t: (key: string, opts?: { count: number }) => string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.max(1, Math.round(diff / 60000))
  if (min < 60) return t('forms.time_min', { count: min })
  const h = Math.round(min / 60)
  if (h < 24) return t('forms.time_h', { count: h })
  const d = Math.round(h / 24)
  return t('forms.time_d', { count: d })
}

export default function TopBar({ pageTitle, pageSubtitle }: TopBarProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [langOpen, setLangOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)

  const unreadQ = useQuery({
    queryKey: ['form-submissions-unread'],
    queryFn: () => apiClient.get('/admin/form-submissions/unread').then((r) => r.data as {
      unread: number
      latest: { id: number; type: string; name: string | null; email: string; subject: string | null; created_at: string }[]
    }),
    refetchInterval: 30_000,
  })
  const unread = unreadQ.data?.unread ?? 0
  const latest = unreadQ.data?.latest ?? []

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0]

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
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
    toast.success(t('common.logout_ok'))
  }

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : 'U'

  const closeMenus = () => { setLangOpen(false); setUserOpen(false); setBellOpen(false) }

  return (
    <header className="gc-topbar">
      <div className="gc-topbar-left">
        {(pageTitle || pageSubtitle) && (
          <div className="gc-topbar-title">
            {pageTitle    && <h1>{pageTitle}</h1>}
            {pageSubtitle && <p>{pageSubtitle}</p>}
          </div>
        )}
      </div>

      <div className="gc-topbar-actions">
        <div style={{ position: 'relative' }}>
          <button
            className="gc-icon-btn"
            type="button"
            aria-label="Notifications"
            onClick={() => { setBellOpen(o => !o); setLangOpen(false); setUserOpen(false) }}
          >
            <Bell size={15} />
            {unread > 0 && <span className="gc-badge-dot" />}
          </button>

          {bellOpen && (
            <div className="gc-dropdown forms-notif-dropdown">
              <div className="gc-dropdown-header">
                <p>{t('forms.title')}</p>
                <p>{unread > 0
                  ? (unread > 1 ? t('forms.new_many', { count: unread }) : t('forms.new_one', { count: unread }))
                  : t('forms.notif_none')}</p>
              </div>
              {latest.length === 0 ? (
                <div className="forms-notif-empty">{t('forms.notif_empty')}</div>
              ) : (
                latest.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="gc-dropdown-item forms-notif-item"
                    onClick={() => {
                      closeMenus()
                      navigate('/formulaires')
                    }}
                  >
                    <span className="forms-notif-type">{t(`forms.${item.type}`, { defaultValue: item.type })}</span>
                    <span className="forms-notif-from">{item.name || item.email}</span>
                    <span className="forms-notif-time">{relativeTime(item.created_at, t)}</span>
                  </button>
                ))
              )}
              <button
                type="button"
                className="gc-dropdown-item"
                onClick={() => { closeMenus(); navigate('/formulaires') }}
              >
                <Inbox size={14} />
                {t('forms.notif_all')}
              </button>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button
            className="gc-lang-btn"
            onClick={() => { setLangOpen(o => !o); setUserOpen(false); setBellOpen(false) }}
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

        <div style={{ position: 'relative' }}>
          <button
            className={`gc-user-btn${userOpen ? ' open' : ''}`}
            onClick={() => { setUserOpen(o => !o); setLangOpen(false); setBellOpen(false) }}
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
