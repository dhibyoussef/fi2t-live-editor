import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FormEvent, useState } from 'react'
import EditableText from '../../cms/EditableText'
import { ContentProvider, useContentBlock } from '../../cms/ContentProvider'
import EditToolbar from '../../cms/EditToolbar'
import { useEditMode } from '../../cms/EditModeProvider'
import api from '../../api/client'
import { publicUrl } from '../../lib/publicUrl'

const FOOTER_LINKS = [
  { key: 'apropos', href: '/' },
  { key: 'about', href: '/qui-sommes-nous' },
  { key: 'news_short', href: '/actualites' },
  { key: 'organisation', href: '/organisation' },
  { key: 'membership', href: '/fiche-adhesion' },
  { key: 'contact', href: '/contact' },
] as const

function SocialIcon({ name }: { name: 'facebook' | 'x' | 'linkedin' }) {
  if (name === 'facebook') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
      </svg>
    )
  }
  if (name === 'x') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.9 2H22l-6.8 7.8L23 22h-6.5l-5.1-6.7L5.7 22H2.5l7.3-8.4L1 2h6.7l4.6 6.1L18.9 2zm-1.1 18h1.8L6.3 3.9H4.4L17.8 20z" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.5 8.5A2.5 2.5 0 1 1 6.5 3.5a2.5 2.5 0 0 1 0 5zM4.5 10.5h4V20.5h-4zM13.5 10.3c-1.5 0-2.5.8-2.9 1.6V10.5h-4v10h4v-5.3c0-1.4.7-2.3 1.9-2.3 1.1 0 1.6.8 1.6 2.3v5.3h4v-5.7c0-3-1.6-4.5-4.6-4.5z" />
    </svg>
  )
}

function FooterEmail() {
  const { value } = useContentBlock('global', 'footer.email', {
    type: 'text',
    fallback: 'contact.fi2t@fit-tunisie.org',
  })
  const email = String(value || '').trim()
  const href = email.includes('@') ? `mailto:${email}` : undefined

  return (
    <a href={href} className="fi2t-footer__email">
      <EditableText page="global" blockKey="footer.email" as="span" fallback="contact.fi2t@fit-tunisie.org" />
    </a>
  )
}

function FooterInner() {
  const { t } = useTranslation()
  const { isEditMode } = useEditMode()
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const submitNewsletter = async (e: FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    setNewsletterStatus('loading')
    try {
      await api.post('/forms/newsletter', { email: newsletterEmail.trim(), website: '' })
      setNewsletterStatus('ok')
      setNewsletterEmail('')
    } catch {
      setNewsletterStatus('err')
    }
  }

  return (
    <footer className="fi2t-footer">
      {isEditMode && <EditToolbar onlyWhenPending />}
      <div className="fi2t-footer__grid">
        <div>
          <img src={publicUrl('/images/logo-white.png')} alt="FI2T" className="fi2t-footer__logo" />
          <EditableText
            page="global"
            blockKey="footer.about"
            as="p"
            className="fi2t-footer__about"
            multiline
            fallback="La Fédération Interprofessionnelle du Tourisme Tunisien œuvre pour le rayonnement et la modernisation du secteur."
          />
        </div>

        <div>
          <h4>{t('fi2t.footer.navigation')}</h4>
          <ul>
            {FOOTER_LINKS.map((item) => (
              <li key={item.href}>
                <Link to={item.href}>{t(`fi2t.nav.${item.key}`)}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="fi2t-footer__contact">
          <h4>{t('fi2t.footer.contact')}</h4>
          <EditableText
            page="global"
            blockKey="footer.address"
            as="p"
            multiline
            fallback={"Résidence MERIEM - Appt N°2 -\nLes Berges du Lac 1\n1053 Tunis, Tunisie"}
          />
          <div className="fi2t-footer__phones">
            <a href="tel:+21629710507" className="fi2t-footer__phone">
              <EditableText page="global" blockKey="footer.phone_1" as="span" fallback="+216 29 710 507" />
            </a>
            <a href="tel:+21624940022" className="fi2t-footer__phone">
              <EditableText page="global" blockKey="footer.phone_2" as="span" fallback="+216 24 940 022" />
            </a>
          </div>
          <FooterEmail />
        </div>

        <div className="fi2t-footer__newsletter-wrap">
          <h4>{t('fi2t.footer.newsletter')}</h4>
          <EditableText
            page="global"
            blockKey="footer.newsletter"
            as="p"
            fallback="Restez informé de nos dernières initiatives."
          />
          <form className="fi2t-footer__newsletter" onSubmit={submitNewsletter}>
            <label className="fi2t-page-hero__title--sr" aria-hidden="true">
              Site web
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <input
              type="email"
              name="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder={t('fi2t.footer.emailPlaceholder')}
              aria-label={t('fi2t.footer.emailPlaceholder')}
              required
              disabled={newsletterStatus === 'loading'}
            />
            <button type="submit" aria-label={t('fi2t.footer.newsletter')} disabled={newsletterStatus === 'loading'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M22 2L11 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
          {newsletterStatus === 'ok' && (
            <p className="fi2t-footer__newsletter-msg" role="status">
              {t('fi2t.footer.newsletterSuccess', { defaultValue: 'Merci — inscription enregistrée.' })}
            </p>
          )}
          {newsletterStatus === 'err' && (
            <p className="fi2t-footer__newsletter-msg" role="alert">
              {t('fi2t.footer.newsletterError', { defaultValue: 'Impossible d’envoyer pour le moment.' })}
            </p>
          )}
        </div>
      </div>

      <div className="fi2t-footer__social">
        <a href="https://facebook.com" target="_blank" rel="noreferrer noopener" aria-label="Facebook">
          <SocialIcon name="facebook" />
        </a>
        <a href="https://x.com" target="_blank" rel="noreferrer noopener" aria-label="X">
          <SocialIcon name="x" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn">
          <SocialIcon name="linkedin" />
        </a>
      </div>
    </footer>
  )
}

export default function Fi2tFooter() {
  return (
    <ContentProvider page="global">
      <FooterInner />
    </ContentProvider>
  )
}
