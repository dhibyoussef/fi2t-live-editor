import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
import { useSiteSettings, phoneHref } from '../../cms/SiteSettingsProvider'
import { useSiteNav, type NavNode } from '../../hooks/useSiteNav'
import { navSubpathMatch, RESERVATION_URL, isNavItemActive } from '../../lib/siteNavConfig'
import { preloadImages } from '../../lib/dataCache'
import '../../styles/site-header.css'

const LANGS = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
]

interface Props {
  variant?: 'hero' | 'page' | 'ivory'
}

function NavLinkItem({
  item,
  matchSubpaths = false,
  onNavigate,
}: {
  item: NavNode
  matchSubpaths?: boolean
  onNavigate?: () => void
}) {
  const location = useLocation()
  const isExternal = item.url.startsWith('http')
  const active = !isExternal && isNavItemActive(item, location.pathname, location.search)
  const className = `site-header__link${active ? ' active' : ''}`

  if (isExternal) {
    return (
      <a
        href={item.url}
        className="site-header__link"
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
      end={!matchSubpaths}
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

function NavDropdown({ item }: { item: NavNode }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const hasChildren = (item.children?.length ?? 0) > 0
  const close = () => setOpen(false)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (dropdownRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  if (!hasChildren) return <NavLinkItem item={item} matchSubpaths={subpathMatch(item.url)} />

  return (
    <div
      ref={dropdownRef}
      className={`site-header__dropdown${open ? ' open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <NavLinkItem
        item={item}
        matchSubpaths={subpathMatch(item.url)}
        onNavigate={close}
      />
      <div className="site-header__dropdown-menu" role="menu">
        {item.children!.map((child: NavNode) => (
          <NavLinkItem
            key={child.id}
            item={child}
            matchSubpaths={subpathMatch(child.url)}
            onNavigate={close}
          />
        ))}
      </div>
    </div>
  )
}

export default function SiteHeader({ variant = 'hero' }: Props) {
  const { t } = useTranslation()
  const { get } = useSiteSettings()
  const nav = useSiteNav()

  const address = get('settings.address')
  const phone = get('settings.phone')
  const email = get('settings.email')
  const socialFacebook = get('settings.social_facebook')
  const socialInstagram = get('settings.social_instagram')
  const socialYoutube = get('settings.social_youtube')

  useEffect(() => {
    preloadImages(['/logo-figma.svg'])
  }, [])

  const setLang = (code: string) => {
    i18n.changeLanguage(code)
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
  }

  return (
    <header className={`site-header site-header--${variant}`}>
      <div className="site-header__topbar">
        <div className="container site-header__topbar-inner">
          <div className="site-header__contacts">
            {address && (
              <span>
                <i className="fa-solid fa-location-dot" />
                {address}
              </span>
            )}
            {email && (
              <a href={`mailto:${email}`}>
                <i className="fa-regular fa-envelope" />
                {email}
              </a>
            )}
            {phone && (
              <a href={phoneHref(phone)}>
                <i className="fa-solid fa-phone" />
                {phone}
              </a>
            )}
          </div>
          <div className="site-header__topbar-right">
            <span className="site-header__follow">{t('topbar.follow')}</span>
            <div className="site-header__social">
              {socialFacebook && (
                <a href={socialFacebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="fa-brands fa-facebook-f" />
                </a>
              )}
              {socialInstagram && (
                <a href={socialInstagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fa-brands fa-instagram" />
                </a>
              )}
              {socialYoutube && (
                <a href={socialYoutube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <i className="fa-brands fa-youtube" />
                </a>
              )}
            </div>
            <div className="site-header__langs">
              {LANGS.map(l => (
                <button
                  key={l.code}
                  className={i18n.language === l.code ? 'active' : ''}
                  onClick={() => setLang(l.code)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container site-header__nav-row">
        <Link to="/" className="site-header__logo">
          <img
            src="/logo-figma.svg"
            alt="Golden Carthage — Hôtel & Résidence"
            className="site-header__logo-mark"
            fetchPriority="high"
            decoding="async"
          />
        </Link>

        <div className="site-header__menu">
          <nav className="site-header__nav site-header__nav--main" aria-label="Navigation principale">
            {nav.map(item => (
              <NavDropdown key={item.id} item={item} />
            ))}
          </nav>

          <div className="site-header__actions">
            <button type="button" className="site-header__search-btn" aria-label={t('booking.search')}>
              <i className="fa-solid fa-magnifying-glass" />
            </button>
            <Link to={RESERVATION_URL} className="site-header__reserve">
              {t('nav.reservation')}
            </Link>
          </div>
        </div>
        <div className="site-header__mobile-cta">
          <Link to={RESERVATION_URL} className="site-header__reserve site-header__reserve--mobile">
            {t('nav.reservation')}
          </Link>
        </div>
      </div>
    </header>
  )
}
