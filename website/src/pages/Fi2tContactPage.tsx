import { FormEvent, useEffect, useMemo, useState } from 'react'
import { ContentProvider, useContent } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableHeroBackground from '../cms/EditableHeroBackground'
import EditableJsonList from '../cms/EditableJsonList'
import EditToolbar from '../cms/EditToolbar'
import { useEditMode } from '../cms/EditModeProvider'
import Fi2tPagination from '../components/fi2t/Fi2tPagination'
import { CONTACT_DEFAULTS } from '../cms/defaults/contact'

type ContactInfoItem = { icon: string; label: string; value: string }

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : fallback
  } catch {
    return fallback
  }
}

const INFO_FALLBACK = parseJsonArray<ContactInfoItem>(CONTACT_DEFAULTS['info.items'], [])
const CONTACT_BANNER = CONTACT_DEFAULTS['hero.image']

function ContactInner() {
  const { get } = useContent()
  const { isEditMode } = useEditMode()
  const [sent, setSent] = useState(false)
  const [infoPage, setInfoPage] = useState(1)
  const infoRaw = get('info.items', CONTACT_DEFAULTS['info.items'])
  const infoItems = useMemo(
    () => parseJsonArray<ContactInfoItem>(infoRaw, INFO_FALLBACK),
    [infoRaw],
  )
  const perPage = Math.max(1, Number.parseInt(get('info.per_page', '3'), 10) || 3)
  const totalPages = Math.max(1, Math.ceil(infoItems.length / perPage))
  const safePage = Math.min(infoPage, totalPages)
  const pageStart = (safePage - 1) * perPage
  const pageEnd = pageStart + perPage

  useEffect(() => {
    if (infoPage > totalPages) setInfoPage(totalPages)
  }, [infoPage, totalPages])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="fi2t-contact-page">
      <section
        className="fi2t-page-hero fi2t-page-hero--contact"
      >
        <EditableHeroBackground
          page="contact"
          fallback={CONTACT_BANNER}
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

      <section className="fi2t-contact">
        <div className="fi2t-contact__info">
          <EditableText
            page="contact"
            blockKey="info.title"
            as="h2"
            fallback="Informations de contact"
          />

          <EditableJsonList<ContactInfoItem>
            page="contact"
            blockKey="info.items"
            label="Coordonnées"
            className="fi2t-contact__list"
            itemClassName={(_item, index) => {
              if (isEditMode || (index >= pageStart && index < pageEnd)) return ''
              return 'is-page-hidden'
            }}
            fallback={INFO_FALLBACK}
            emptyItem={{
              icon: '/images/icon-address.svg',
              label: 'Nouveau contact',
              value: '…',
            }}
            addLabel="Ajouter une coordonnée"
            fields={[
              { key: 'label', label: 'Libellé' },
              { key: 'value', label: 'Valeur', multiline: true },
              { key: 'icon', label: 'Icône', image: true },
            ]}
            renderItem={(_item, _index, { editField, editImage }) => (
              <>
                <span className="fi2t-contact__icon" aria-hidden="true">
                  {editImage('icon', '', '')}
                </span>
                <div>
                  {editField('label', 'strong')}
                  {editField('value', 'p')}
                </div>
              </>
            )}
            renderAfter={() =>
              !isEditMode ? (
                <Fi2tPagination
                  page={safePage}
                  totalPages={totalPages}
                  onPage={setInfoPage}
                  ariaLabel="Pagination des coordonnées"
                  className="fi2t-actu-pagination fi2t-actu-pagination--inline"
                />
              ) : null
            }
          />
        </div>

        <form className="fi2t-contact__form" onSubmit={handleSubmit}>
          <div className="fi2t-contact__form-inner">
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
                <EditableText
                  page="contact"
                  blockKey="form.success"
                  as="span"
                  fallback="Merci — votre message a bien été envoyé."
                />
              </p>
            )}
          </div>
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
