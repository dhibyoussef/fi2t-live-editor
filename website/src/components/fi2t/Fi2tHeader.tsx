import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
import { ContentProvider } from '../../cms/ContentProvider'
import EditableImage from '../../cms/EditableImage'

const NAV = [
  { to: '/', key: 'home', end: true },
  { to: '/qui-sommes-nous', key: 'about' },
  { to: '/organisation', key: 'organisation' },
  { to: '/actualites', key: 'news' },
  { to: '/fiche-adhesion', key: 'membership' },
  { to: '/contact', key: 'contact' },
] as const

const LANGS = [
  { code: 'fr', label: 'FR', full: 'Français' },
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'ar', label: 'AR', full: 'العربية' },
] as const

function Fi2tHeaderInner() {
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const { t, i18n: i18nHook } = useTranslation()
  const currentLang = (i18nHook.language || 'fr').split('-')[0]
  const current = LANGS.find((l) => l.code === currentLang) ?? LANGS[0]

  const setLang = (code: string) => {
    void i18n.changeLanguage(code)
    localStorage.setItem('fi2t_lang', code)
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
    setLangOpen(false)
    setOpen(false)
  }

  useEffect(() => {
    if (!langOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [langOpen])

  return (
    <header className="fi2t-header">
      <div className="fi2t-header__inner">
        <Link to="/" className="fi2t-header__logo" onClick={() => setOpen(false)}>
          <EditableImage
            page="global"
            blockKey="header.logo"
            label="Logo du site"
            alt="FI2T"
            fallback="/logo.png"
          />
        </Link>

        <nav className={`fi2t-header__nav ${open ? 'is-open' : ''}`}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) => `fi2t-header__link${isActive ? ' is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {t(`fi2t.nav.${item.key}`)}
            </NavLink>
          ))}

          <div className="fi2t-header__langs" ref={langRef}>
            <button
              type="button"
              className="fi2t-header__lang-btn"
              aria-expanded={langOpen}
              aria-haspopup="listbox"
              aria-label={t('fi2t.nav.language')}
              onClick={() => setLangOpen((v) => !v)}
            >
              <span>{current.label}</span>
              <i className="fa-solid fa-chevron-down" aria-hidden="true" />
            </button>
            {langOpen && (
              <ul className="fi2t-header__lang-menu" role="listbox" aria-label={t('fi2t.nav.language')}>
                {LANGS.map((lang) => (
                  <li key={lang.code} role="option" aria-selected={currentLang === lang.code}>
                    <button
                      type="button"
                      className={`fi2t-header__lang-option${currentLang === lang.code ? ' is-active' : ''}`}
                      onClick={() => setLang(lang.code)}
                    >
                      <span>{lang.full}</span>
                      <span className="fi2t-header__lang-code">{lang.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        <button
          type="button"
          className="fi2t-header__burger"
          aria-label={open ? t('nav.closeMenu') : t('nav.menu')}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}

export default function Fi2tHeader() {
  return (
    <ContentProvider page="global">
      <Fi2tHeaderInner />
    </ContentProvider>
  )
}
