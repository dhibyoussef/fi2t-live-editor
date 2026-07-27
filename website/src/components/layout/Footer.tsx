import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSiteSettings, phoneHref } from '../../cms/SiteSettingsProvider'
import '../../styles/footer.css'

const APP_STORE_BADGE = '/imgs/App Store.svg'
const GOOGLE_PLAY_BADGE = '/imgs/Google Play.svg'
const SEND_ICON = '/imgs/send.svg'

export default function Footer() {
  const { t } = useTranslation()
  const { get } = useSiteSettings()
  const [email, setEmail] = useState('')

  const footerLogo = get('footer.logo', '/imgs/GCH.svg')
  const hotelName = get('settings.hotel_name', 'Golden Carthage')
  const about = get('footer.about')
  const newsletterPlaceholder = get('footer.newsletter_placeholder', t('footer.newsletterPlaceholder'))
  const address = get('settings.address')
  const phone = get('settings.phone')
  const emailContact = get('settings.email')
  const copyright = t('footer.copyright')

  const socials = [
    { url: get('settings.social_instagram'), icon: 'fa-brands fa-instagram', label: 'Instagram' },
    { url: get('settings.social_facebook'), icon: 'fa-brands fa-facebook-f', label: 'Facebook' },
    { url: get('settings.social_youtube'), icon: 'fa-brands fa-youtube', label: 'YouTube' },
  ].filter(s => s.url)

  const appStore = get('settings.app_store_url')
  const googlePlay = get('settings.google_play_url')

  const handleNewsletter = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    window.location.href = `mailto:${emailContact}?subject=${encodeURIComponent('Newsletter')}&body=${encodeURIComponent(email)}`
  }

  return (
    <footer className="footer">
      <div className="container footer__grid">
        {/* Colonne 1 — Logo, description, newsletter, réseaux */}
        <div className="footer__col footer__col--brand">
          <Link to="/" className="footer__logo">
            <img src={footerLogo} alt={hotelName} className="footer__logo-img" />
          </Link>
          {about && <p className="footer__about">{about}</p>}
          <form className="footer__newsletter" onSubmit={handleNewsletter}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={newsletterPlaceholder}
              aria-label={newsletterPlaceholder}
            />
            <button type="submit" aria-label={t('footer.newsletterSubmit')}>
              <img src={SEND_ICON} alt="" width={14} height={14} />
            </button>
          </form>
          {socials.length > 0 && (
            <div className="footer__social">
              {socials.map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Colonne 2 — Liens utiles */}
        <div className="footer__col footer__col--links">
          <h4>{t('footer.usefulLinks')}</h4>
          <ul className="footer__links">
            <li><Link to="/mentions-legales">{t('footer.legalMentions')}</Link></li>
            <li><Link to="/cgv">{t('footer.cgv')}</Link></li>
            <li><Link to="/donnees-personnelles">{t('footer.personalData')}</Link></li>
            <li><Link to="/cgu">{t('footer.cgu')}</Link></li>
            <li><Link to="/contact">{t('footer.contact')}</Link></li>
          </ul>
        </div>

        {/* Colonne 3 — Contact & apps */}
        <div className="footer__col footer__col--contact">
          <h4>{t('footer.contactTitle')}</h4>
          <ul className="footer__contact-list">
            {address && (
              <li>
                <i className="fa-solid fa-location-dot" />
                <span>{address}</span>
              </li>
            )}
            {phone && (
              <li>
                <i className="fa-solid fa-phone" />
                <a href={phoneHref(phone)}>{phone}</a>
              </li>
            )}
            {emailContact && (
              <li>
                <i className="fa-regular fa-envelope" />
                <a href={`mailto:${emailContact}`}>{emailContact}</a>
              </li>
            )}
          </ul>
          <hr className="footer__divider" />
          <div className="footer__stores">
            {appStore ? (
              <a href={appStore} target="_blank" rel="noopener noreferrer" aria-label="App Store">
                <img src={APP_STORE_BADGE} alt="Download on the App Store" />
              </a>
            ) : (
              <span className="footer__stores-badge">
                <img src={APP_STORE_BADGE} alt="Download on the App Store" />
              </span>
            )}
            {googlePlay ? (
              <a href={googlePlay} target="_blank" rel="noopener noreferrer" aria-label="Google Play">
                <img src={GOOGLE_PLAY_BADGE} alt="Get it on Google Play" />
              </a>
            ) : (
              <span className="footer__stores-badge">
                <img src={GOOGLE_PLAY_BADGE} alt="Get it on Google Play" />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <span>{copyright}</span>
        </div>
      </div>
    </footer>
  )
}
