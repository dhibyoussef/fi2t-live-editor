import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, ShieldCheck, Settings, ExternalLink,
  Globe, LayoutTemplate, Languages, Newspaper, Inbox,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/client'
import { adminAsset } from '../../lib/adminAsset'
import { useAuthStore } from '../../store/authStore'
import { buildLiveEditorUrl } from '../../api/editSession'
import toast from 'react-hot-toast'

type NavItem = {
  to: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  label: string
  external?: boolean
  end?: boolean
}

type NavGroup = {
  groupKey: string
  items: NavItem[]
}

const nav: NavGroup[] = [
  {
    groupKey: 'principal',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'nav.dashboard', end: true },
    ],
  },
  {
    groupKey: 'website',
    items: [
      { to: '/website-content', icon: LayoutTemplate, label: 'nav.website_content' },
      { to: '/articles', icon: Newspaper, label: 'nav.articles' },
      { to: '/translations', icon: Languages, label: 'nav.translations' },
      { to: '__website_edit__', icon: Globe, label: 'nav.website_edit', external: true },
    ],
  },
  {
    groupKey: 'admin',
    items: [
      { to: '/formulaires', icon: Inbox, label: 'nav.formulaires' },
      { to: '/users', icon: ShieldCheck, label: 'nav.users' },
      { to: '/roles', icon: Settings, label: 'nav.roles' },
    ],
  },
]

interface SidebarProps { collapsed?: boolean }

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const { t } = useTranslation()
  const token = useAuthStore((s) => s.token)
  const unreadQ = useQuery({
    queryKey: ['form-submissions-unread'],
    queryFn: () => api.get('/admin/form-submissions/unread').then((r) => r.data as { unread: number }),
    refetchInterval: 30_000,
    enabled: Boolean(token),
  })
  const unread = unreadQ.data?.unread ?? 0

  const openWebsiteEdit = async () => {
    if (!token) return
    try {
      const url = await buildLiveEditorUrl('/')
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      toast.error('Impossible d’ouvrir le Live Editor — reconnectez-vous')
    }
  }

  return (
    <aside className={`gc-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="gc-sidebar-logo">
        {collapsed ? (
          <img
            src={adminAsset('logo.png')}
            alt="FI2T"
            className="gc-sidebar-brand gc-sidebar-brand--mark"
          />
        ) : (
          <>
            <img
              src={adminAsset('logo.png')}
              alt="FI2T — Fédération Interprofessionnelle du Tourisme Tunisien"
              className="gc-sidebar-brand"
            />
            <div className="gc-sidebar-logo-text">
              <p className="gc-sidebar-logo-sub">CMS Live Editor</p>
            </div>
          </>
        )}
      </div>

      <nav className="gc-sidebar-nav">
        {nav.map((group, index) => (
          <div key={group.groupKey} className="gc-nav-group">
            {index > 0 && <div className="gc-nav-divider" aria-hidden="true" />}
            {!collapsed && (
              <p className="gc-nav-group-label">{t(`navGroups.${group.groupKey}`, group.groupKey)}</p>
            )}
            <div className="gc-nav-group-items">
              {group.items.map(item => {
                const Icon = item.icon
                const itemClass = 'gc-nav-item'

                if (item.to === '__website_edit__') {
                  return (
                    <button
                      key={item.to}
                      type="button"
                      className={itemClass}
                      title={collapsed ? t(item.label) : undefined}
                      onClick={openWebsiteEdit}
                    >
                      <Icon className="gc-nav-icon" size={16} />
                      {!collapsed && <span className="gc-nav-label">{t(item.label)}</span>}
                      {!collapsed && <ExternalLink size={12} className="gc-nav-external" />}
                    </button>
                  )
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    title={collapsed ? t(item.label) : undefined}
                    className={({ isActive }) =>
                      `${itemClass}${isActive ? ' active' : ''}`
                    }
                  >
                    <Icon className="gc-nav-icon" size={16} />
                    {!collapsed && <span className="gc-nav-label">{t(item.label)}</span>}
                    {!collapsed && item.to === '/formulaires' && unread > 0 && (
                      <span className="gc-nav-badge">{unread > 99 ? '99+' : unread}</span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
