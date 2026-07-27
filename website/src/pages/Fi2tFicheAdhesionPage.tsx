import { FormEvent, useState } from 'react'
import { ContentProvider, useContent } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'
import EditToolbar from '../cms/EditToolbar'
import { FICHE_ADHESION_DEFAULTS } from '../cms/defaults/fiche-adhesion'

type Benefit = { title: string; desc: string }

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function FicheInner() {
  const { get } = useContent()
  const [sent, setSent] = useState(false)

  const benefits = parseJsonArray<Benefit>(
    get('benefits.items', '[]'),
    parseJsonArray(FICHE_ADHESION_DEFAULTS['benefits.items'], []),
  )

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="fi2t-adhesion-page">
      <section className="fi2t-page-hero">
        <EditableImage
          page="fiche-adhesion"
          blockKey="hero.image"
          className="fi2t-page-hero__bg"
          alt=""
          fallback="/hero.jpg"
        />
        <div className="fi2t-page-hero__overlay" />
        <div className="fi2t-page-hero__content">
          <EditableText
            page="fiche-adhesion"
            blockKey="hero.title"
            as="h1"
            className="fi2t-page-hero__title"
            fallback="Fiche adhésion"
          />
          <span className="fi2t-page-hero__accent" aria-hidden="true" />
        </div>
      </section>

      <section className="fi2t-section fi2t-adhesion-intro">
        <EditableText
          page="fiche-adhesion"
          blockKey="intro.title"
          as="h2"
          fallback="Rejoignez la FI2T"
        />
        <EditableText
          page="fiche-adhesion"
          blockKey="intro.body"
          as="p"
          multiline
          fallback={FICHE_ADHESION_DEFAULTS['intro.body']}
        />
      </section>

      <section className="fi2t-section fi2t-adhesion-benefits">
        <EditableText
          page="fiche-adhesion"
          blockKey="benefits.title"
          as="h2"
          fallback="Pourquoi adhérer ?"
        />
        <div className="fi2t-adhesion-benefits__grid">
          {benefits.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="fi2t-section fi2t-adhesion-form-wrap">
        <EditableText
          page="fiche-adhesion"
          blockKey="form.title"
          as="h2"
          fallback="Demande d’adhésion"
        />
        <form className="fi2t-contact__form fi2t-adhesion-form" onSubmit={handleSubmit}>
          <div className="fi2t-contact__row">
            <label className="fi2t-contact__field">
              <EditableText page="fiche-adhesion" blockKey="form.label_org" as="span" fallback="RAISON SOCIALE" />
              <input type="text" name="org" placeholder={get('form.placeholder_org', 'Nom de votre structure')} required />
            </label>
            <label className="fi2t-contact__field">
              <EditableText page="fiche-adhesion" blockKey="form.label_contact" as="span" fallback="NOM DU CONTACT" />
              <input type="text" name="contact" placeholder={get('form.placeholder_contact', 'Nom et prénom')} required />
            </label>
          </div>
          <div className="fi2t-contact__row">
            <label className="fi2t-contact__field">
              <EditableText page="fiche-adhesion" blockKey="form.label_email" as="span" fallback="ADRESSE EMAIL" />
              <input type="email" name="email" placeholder={get('form.placeholder_email', 'nom@exemple.com')} required />
            </label>
            <label className="fi2t-contact__field">
              <EditableText page="fiche-adhesion" blockKey="form.label_phone" as="span" fallback="TÉLÉPHONE" />
              <input type="tel" name="phone" placeholder={get('form.placeholder_phone', '+216 XX XXX XXX')} required />
            </label>
          </div>
          <label className="fi2t-contact__field">
            <EditableText page="fiche-adhesion" blockKey="form.label_activity" as="span" fallback="ACTIVITÉ / GROUPEMENT" />
            <input type="text" name="activity" placeholder={get('form.placeholder_activity', 'Ex: Agences de voyages')} required />
          </label>
          <label className="fi2t-contact__field fi2t-contact__field--message">
            <EditableText page="fiche-adhesion" blockKey="form.label_message" as="span" fallback="MESSAGE" />
            <textarea name="message" rows={4} placeholder={get('form.placeholder_message', 'Présentez brièvement votre activité…')} required />
          </label>
          <button type="submit" className="fi2t-contact__submit">
            <EditableText page="fiche-adhesion" blockKey="form.submit" as="span" fallback="Envoyer la demande" />
          </button>
          {sent && (
            <p className="fi2t-contact__success" role="status">
              Merci — votre demande d’adhésion a bien été envoyée.
            </p>
          )}
        </form>
      </section>
    </div>
  )
}

export default function Fi2tFicheAdhesionPage() {
  return (
    <ContentProvider page="fiche-adhesion">
      <FicheInner />
      <EditToolbar />
    </ContentProvider>
  )
}
