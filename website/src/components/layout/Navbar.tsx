import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSiteNav } from '../../hooks/useSiteNav'
import { navSubpathMatch, RESERVATION_URL } from '../../lib/siteNavConfig'
import '../../styles/navbar.css'

export default function Navbar() {
  const { t } = useTranslation()
  const nav = useSiteNav()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-text">
            <span className="navbar__logo-main">Golden Carthage</span>
            <span className="navbar__logo-sub">Hôtel & Résidence</span>
          </div>
        </Link>

        <nav className={`navbar__nav${menuOpen ? ' navbar__nav--open' : ''}`}>
          {nav.map(link => (
            <NavLink
              key={link.id}
              to={link.url}
              end={!navSubpathMatch(link.url)}
              className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          <Link to={RESERVATION_URL} className="btn btn-primary navbar__cta">
            {t('nav.reservation')}
          </Link>
          <button
            className="navbar__hamburger"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`hamburger__bar${menuOpen ? ' open' : ''}`} />
            <span className={`hamburger__bar${menuOpen ? ' open' : ''}`} />
            <span className={`hamburger__bar${menuOpen ? ' open' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  )
}
