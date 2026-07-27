import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
import '../../styles/topbar.css'

const LANGUAGES = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
]

export default function TopBar() {
  const { t } = useTranslation()

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
  }

  return (
    <div className="topbar">
      <div className="container topbar__inner">
        <div className="topbar__left">
          <a href="mailto:info@goldencarthage.com" className="topbar__item">
            <i className="fa-regular fa-envelope" />
            <span>info@goldencarthage.com</span>
          </a>
          <a href="tel:+21671913000" className="topbar__item">
            <i className="fa-solid fa-phone" />
            <span>+216.71.913.000</span>
          </a>
          <span className="topbar__item topbar__item--no-link">
            <i className="fa-solid fa-location-dot" />
            <span>Avenue de la Promenade - Gammarth</span>
          </span>
        </div>
        <div className="topbar__right">
          <span className="topbar__follow">{t('topbar.follow')}</span>
          <div className="topbar__social">
            <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f" /></a>
            <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
            <a href="#" aria-label="YouTube"><i className="fa-brands fa-youtube" /></a>
          </div>
          <div className="topbar__lang">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`topbar__lang-btn${i18n.language === lang.code ? ' active' : ''}`}
                onClick={() => changeLanguage(lang.code)}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
