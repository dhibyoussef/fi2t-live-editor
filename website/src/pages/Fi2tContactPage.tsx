import { FormEvent, useState } from 'react'
import { ContentProvider, useContent } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'
import EditToolbar from '../cms/EditToolbar'

function ContactInner() {
  const { get } = useContent()
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="fi2t-contact-page">
      <section className="fi2t-page-hero">
        <EditableImage
          page="contact"
          blockKey="hero.image"
          className="fi2t-page-hero__bg"
          alt=""
          fallback="/hero.jpg"
        />
        <div className="fi2t-page-hero__overlay" />
        <div className="fi2t-page-hero__content">
          <EditableText
            page="contact"
            blockKey="hero.title"
            as="h1"
            className="fi2t-page-hero__title"
            fallback="Contact"
          />
          <span className="fi2t-page-hero__accent" aria-hidden="true" />
        </div>
      </section>

      <section className="fi2t-section fi2t-contact">
        <div className="fi2t-contact__info">
          <EditableText
            page="contact"
            blockKey="info.title"
            as="h2"
            fallback="Informations de contact"
          />

          <ul className="fi2t-contact__list">
            <li>
              <span className="fi2t-contact__icon" aria-hidden="true">
                <img src="/images/icon-address.svg" alt="" />
              </span>
              <div>
                <EditableText
                  page="contact"
                  blockKey="info.address_label"
                  as="strong"
                  fallback="Adresse"
                />
                <EditableText
                  page="contact"
                  blockKey="info.address"
                  as="p"
                  multiline
                  fallback={"Rue du Lac Turkana, Les Berges du\nLac 1\n1053 Tunis, Tunisie"}
                />
              </div>
            </li>
            <li>
              <span className="fi2t-contact__icon" aria-hidden="true">
                <img src="/images/icon-phone.svg" alt="" />
              </span>
              <div>
                <EditableText
                  page="contact"
                  blockKey="info.phone_label"
                  as="strong"
                  fallback="Téléphone"
                />
                <EditableText
                  page="contact"
                  blockKey="info.phone"
                  as="p"
                  fallback="+216 29 710 507"
                />
              </div>
            </li>
            <li>
              <span className="fi2t-contact__icon" aria-hidden="true">
                <img src="/images/icon-email.svg" alt="" />
              </span>
              <div>
                <EditableText
                  page="contact"
                  blockKey="info.email_label"
                  as="strong"
                  fallback="Email"
                />
                <EditableText
                  page="contact"
                  blockKey="info.email"
                  as="p"
                  fallback="contact@fi2t.tn"
                />
              </div>
            </li>
          </ul>
        </div>

        <form className="fi2t-contact__form" onSubmit={handleSubmit}>
          <div className="fi2t-contact__row">
            <label className="fi2t-contact__field">
              <EditableText
                page="contact"
                blockKey="form.label_name"
                as="span"
                fallback="NOM COMPLET"
              />
              <input
                type="text"
                name="name"
                placeholder={get('form.placeholder_name', 'Nom et prénom')}
                required
              />
            </label>
            <label className="fi2t-contact__field">
              <EditableText
                page="contact"
                blockKey="form.label_email"
                as="span"
                fallback="ADRESSE EMAIL"
              />
              <input
                type="email"
                name="email"
                placeholder={get('form.placeholder_email', 'nom@exemple.com')}
                required
              />
            </label>
          </div>

          <label className="fi2t-contact__field">
            <EditableText
              page="contact"
              blockKey="form.label_subject"
              as="span"
              fallback="SUJET"
            />
            <input
              type="text"
              name="subject"
              placeholder={get('form.placeholder_subject', 'Ex: Demande de...')}
              required
            />
          </label>

          <label className="fi2t-contact__field fi2t-contact__field--message">
            <EditableText
              page="contact"
              blockKey="form.label_message"
              as="span"
              fallback="MESSAGE"
            />
            <textarea
              name="message"
              rows={4}
              placeholder={get('form.placeholder_message', 'Votre message ici...')}
              required
            />
          </label>

          <button type="submit" className="fi2t-contact__submit">
            <EditableText page="contact" blockKey="form.submit" as="span" fallback="Envoyer" />
          </button>

          {sent && (
            <p className="fi2t-contact__success" role="status">
              Merci — votre message a bien été envoyé.
            </p>
          )}
        </form>
      </section>
    </div>
  )
}

export default function Fi2tContactPage() {
  return (
    <ContentProvider page="contact">
      <ContactInner />
      <EditToolbar />
    </ContentProvider>
  )
}
