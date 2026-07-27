import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
import { useSiteNav, type NavNode } from '../../hooks/useSiteNav'
import { navSubpathMatch, RESERVATION_URL, isNavItemActive } from '../../lib/siteNavConfig'
import '../../styles/mobile-bottom-nav.css'

const LANGS = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
] as const

const QUICK_LINKS = [
  { to: '/', icon: 'fa-solid fa-house', labelKey: 'nav.home' as const },
  { to: '/chambres', icon: 'fa-solid fa-bed', labelKey: 'nav.hebergement' as const },
  { to: '/spa', icon: 'fa-solid fa-spa', labelKey: 'nav.spa' as const },
  { to: '/contact', icon: 'fa-solid fa-envelope', labelKey: 'nav.contact' as const },
]

function SheetLink({
  item,
  onNavigate,
  nested = false,
}: {
  item: NavNode
  onNavigate: () => void
  nested?: boolean
}) {
  const location = useLocation()
  const isExternal = item.url.startsWith('http')
  const active = !isExternal && isNavItemActive(item, location.pathname, location.search)
  const className = `mobile-bottom-nav__sheet-link${nested ? ' mobile-bottom-nav__sheet-link--child' : ''}${active ? ' active' : ''}`

  if (isExternal) {
    return (
      <a
        href={item.url}
        className="mobile-bottom-nav__sheet-link"
        target={item.open_in_new_tab ? '_blank' : undefined}
        rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}
        onClick={onNavigate}
      >
        {item.label}
      </a>
    )
  }

  return (
    <NavLink
      to={item.url}
      end={!subpathMatch(item.url)}
      className={className}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
    >
      {item.label}
    </NavLink>
  )
}

function subpathMatch(url: string): boolean {
  return navSubpathMatch(url)
}

export default function MobileBottomNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const nav = useSiteNav()
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    setSheetOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sheetOpen])

  const setLang = (code: string) => {
    i18n.changeLanguage(code)
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
  }

  const closeSheet = () => setSheetOpen(false)

  return (
    <>
      <div
        className={`mobile-bottom-nav__backdrop${sheetOpen ? ' open' : ''}`}
        aria-hidden={!sheetOpen}
        onClick={closeSheet}
      />

      <div className={`mobile-bottom-nav__sheet${sheetOpen ? ' open' : ''}`} aria-hidden={!sheetOpen}>
        <div className="mobile-bottom-nav__sheet-head">
          <span className="mobile-bottom-nav__sheet-title">{t('nav.menu')}</span>
          <button
            type="button"
            className="mobile-bottom-nav__sheet-close"
            aria-label={t('nav.closeMenu')}
            onClick={closeSheet}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <nav className="mobile-bottom-nav__sheet-nav" aria-label={t('nav.menu')}>
          {nav.map(item => (
            <div key={item.id}>
              <SheetLink item={item} onNavigate={closeSheet} />
              {item.children?.map(child => (
                <SheetLink key={child.id} item={child} onNavigate={closeSheet} nested />
              ))}
            </div>
          ))}
        </nav>
        <div className="mobile-bottom-nav__langs">
          {LANGS.map(l => (
            <button
              key={l.code}
              type="button"
              className={i18n.language === l.code ? 'active' : ''}
              onClick={() => setLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <nav className="mobile-bottom-nav" aria-label={t('nav.mobileNav')}>
        {QUICK_LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `mobile-bottom-nav__item${isActive ? ' active' : ''}`
            }
          >
            <i className={link.icon} aria-hidden="true" />
            <span>{t(link.labelKey)}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className={`mobile-bottom-nav__item mobile-bottom-nav__item--menu${sheetOpen ? ' active' : ''}`}
          aria-expanded={sheetOpen}
          aria-label={t('nav.menu')}
          onClick={() => setSheetOpen(o => !o)}
        >
          <i className={`fa-solid ${sheetOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true" />
          <span>{t('nav.menu')}</span>
        </button>
        <Link to={RESERVATION_URL} className="mobile-bottom-nav__reserve">
          {t('nav.reservation')}
        </Link>
      </nav>
    </>
  )
}
