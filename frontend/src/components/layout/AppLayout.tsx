import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useTranslation } from 'react-i18next'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'nav.dashboard', subtitle: 'pages.dashboard_sub' },
  '/website-content': { title: 'nav.website_content', subtitle: 'pages.content_sub' },
  '/articles': { title: 'nav.articles', subtitle: 'pages.articles_sub' },
  '/formulaires': { title: 'nav.formulaires', subtitle: 'pages.forms_sub' },
  '/users': { title: 'nav.users', subtitle: 'pages.users_sub' },
  '/roles': { title: 'nav.roles', subtitle: 'pages.roles_sub' },
}

export function AppLayout() {
  const location = useLocation()
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)

  const meta = PAGE_TITLES[location.pathname]
  const toggleLabel = collapsed ? t('layout.open_menu') : t('layout.close_menu')

  return (
    <div className={`gc-shell${collapsed ? ' gc-shell--collapsed-collapsed' : ''}`}>
      <div className={`gc-sidebar-wrap${collapsed ? ' collapsed' : ''}`}>
        <Sidebar collapsed={collapsed} />
      </div>

      <button
        type="button"
        className={`gc-toggle-btn${collapsed ? ' gc-toggle-btn--collapsed' : ''}`}
        onClick={() => setCollapsed(c => !c)}
        aria-label={toggleLabel}
        title={toggleLabel}
      >
        {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
      </button>

      <div className="gc-main-wrap">
        <TopBar
          pageTitle={meta ? t(meta.title) : undefined}
          pageSubtitle={meta ? t(meta.subtitle) : undefined}
        />

        <main className="gc-page">
          <div className="gc-page-inner animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
