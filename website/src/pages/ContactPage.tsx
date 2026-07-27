import { useSearchParams } from 'react-router-dom'
import CmsPageHero from '../components/layout/CmsPageHero'
import { ContentProvider } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditToolbar from '../cms/EditToolbar'
import { useSiteSettings, phoneHref } from '../cms/SiteSettingsProvider'

import { IMG } from '../lib/localImages'

const PAGE = 'contact'

function ContactPageContent() {
  const [params] = useSearchParams()
  const subjectDefault = params.get('subject') ?? ''
  const { get } = useSiteSettings()
  const address = get('settings.address')
  const phone = get('settings.phone')
  const phone2 = get('settings.phone_secondary')
  const email = get('settings.email')
  const emailRes = get('settings.email_reservations')

  const coords = [
    address && { icon: 'fa-solid fa-location-dot', label: 'Adresse', value: address, href: undefined },
    phone && { icon: 'fa-solid fa-phone', label: 'Téléphone', value: phone, href: phoneHref(phone) },
    phone2 && { icon: 'fa-solid fa-phone', label: 'Téléphone', value: phone2, href: phoneHref(phone2) },
    email && { icon: 'fa-regular fa-envelope', label: 'Email', value: email, href: `mailto:${email}` },
    emailRes && emailRes !== email && { icon: 'fa-regular fa-envelope', label: 'Réservations', value: emailRes, href: `mailto:${emailRes}` },
  ].filter(Boolean) as { icon: string; label: string; value: string; href?: string }[]

  return (
    <>
      <CmsPageHero
        page={PAGE}
        eyebrow="Nous contacter"
        title="Contactez-nous"
        subtitle="Notre équipe est à votre disposition 24h/24 et 7j/7"
        image={IMG.contactHero}
      />
      <section className="section section--navy">
        <div className="container contact-grid">
          <div>
            <EditableText
              page={PAGE}
              blockKey="coords.title"
              as="h2"
              className="section-title section-title--gold page-section-title-left"
              label="Coordonnées — Titre"
            />
            <div className="contact-list">
              {coords.map((item, i) => (
                <div key={`${item.label}-${i}`} className="contact-item">
                  <div className="contact-item__icon">
                    <i className={item.icon} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{item.label}</div>
                    {item.href ? (
                      <a href={item.href} style={{ fontSize: 14, color: 'var(--color-cream)' }}>{item.value}</a>
                    ) : (
                      <div style={{ fontSize: 14, color: 'var(--color-cream)' }}>{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <EditableText
              page={PAGE}
              blockKey="form.title"
              as="h2"
              className="section-title section-title--gold page-section-title-left"
              label="Formulaire — Titre"
            />
            <form className="contact-form">
              <div className="contact-field">
                <label>
                  <EditableText page={PAGE} blockKey="form.label_name" as="span" label="Label — Nom" />
                </label>
                <input />
              </div>
              <div className="contact-field">
                <label>
                  <EditableText page={PAGE} blockKey="form.label_email" as="span" label="Label — Email" />
                </label>
                <input type="email" />
              </div>
              <div className="contact-field">
                <label>
                  <EditableText page={PAGE} blockKey="form.label_subject" as="span" label="Label — Sujet" />
                </label>
                <input
                  name="subject"
                  defaultValue={subjectDefault}
                />
              </div>
              <div className="contact-field">
                <label>
                  <EditableText page={PAGE} blockKey="form.label_message" as="span" label="Label — Message" />
                </label>
                <textarea rows={5} />
              </div>
              <button type="submit" className="btn-gold" style={{ alignSelf: 'flex-start' }}>
                <EditableText page={PAGE} blockKey="form.submit" as="span" label="Bouton — Envoyer" />
              </button>
            </form>
          </div>
        </div>
      </section>
      <EditToolbar />
    </>
  )
}

export default function ContactPage() {
  return (
    <ContentProvider page={PAGE}>
      <ContactPageContent />
    </ContentProvider>
  )
}
