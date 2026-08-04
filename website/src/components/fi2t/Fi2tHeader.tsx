import { useState } from 'react'
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
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
]

function Fi2tHeaderInner() {
  const [open, setOpen] = useState(false)
  const { t, i18n: i18nHook } = useTranslation()
  const currentLang = (i18nHook.language || 'fr').split('-')[0]

  const setLang = (code: string) => {
    void i18n.changeLanguage(code)
    localStorage.setItem('fi2t_lang', code)
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
  }

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

          <div className="fi2t-header__langs" role="group" aria-label={t('fi2t.nav.language')}>
            {LANGS.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={`fi2t-header__lang${currentLang === lang.code ? ' is-active' : ''}`}
                onClick={() => setLang(lang.code)}
              >
                {lang.label}
              </button>
            ))}
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
