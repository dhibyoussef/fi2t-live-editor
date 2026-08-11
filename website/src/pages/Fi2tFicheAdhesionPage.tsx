import { FormEvent, useEffect, useMemo, useState } from 'react'
import { ContentProvider, useContent } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'
import EditableHeroBackground from '../cms/EditableHeroBackground'
import EditableJsonList from '../cms/EditableJsonList'
import EditablePositioned from '../cms/EditablePositioned'
import EditToolbar from '../cms/EditToolbar'
import { useEditMode } from '../cms/EditModeProvider'
import Fi2tPagination from '../components/fi2t/Fi2tPagination'
import { FICHE_ADHESION_DEFAULTS } from '../cms/defaults/fiche-adhesion'
import api from '../api/client'

type ReasonItem = { title: string; desc: string }

/** Clean desert plate — no baked title / blur artifacts */
const HERO_IMAGE = '/images/desert-banner.jpg?v=1'
const REASONS_PER_PAGE = 5

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : fallback
  } catch {
    return fallback
  }
}

function parsePos(raw: string, fallback: { right?: number; bottom?: number }) {
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    return fallback
  }
}

const REASONS_FALLBACK = parseJsonArray<ReasonItem>(
  FICHE_ADHESION_DEFAULTS['adherer.reasons'],
  [],
)

function FicheInner() {
  const { get } = useContent()
  const { isEditMode } = useEditMode()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [reasonsPage, setReasonsPage] = useState(1)

  const reasonsRaw = get('adherer.reasons', FICHE_ADHESION_DEFAULTS['adherer.reasons'])
  const reasons = useMemo(
    () => parseJsonArray<ReasonItem>(reasonsRaw, REASONS_FALLBACK),
    [reasonsRaw],
  )
  const perPage = Math.max(
    1,
    Number.parseInt(get('adherer.per_page', String(REASONS_PER_PAGE)), 10) || REASONS_PER_PAGE,
  )
  const totalPages = Math.max(1, Math.ceil(reasons.length / perPage))
  const safePage = Math.min(reasonsPage, totalPages)
  const pageStart = (safePage - 1) * perPage
  const pageEnd = pageStart + perPage

  useEffect(() => {
    if (reasonsPage > totalPages) setReasonsPage(totalPages)
  }, [reasonsPage, totalPages])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isEditMode) return
    setSending(true)
    setSendError('')
    setSent(false)
    const fd = new FormData(e.currentTarget)
    try {
      await api.post('/forms/adhesion', {
        org: String(fd.get('org') || ''),
        contact: String(fd.get('contact') || ''),
        email: String(fd.get('email') || ''),
        phone: String(fd.get('phone') || ''),
        activity: String(fd.get('activity') || ''),
        message: String(fd.get('message') || ''),
      })
      setSent(true)
      e.currentTarget.reset()
    } catch {
      setSendError(get('form.error', FICHE_ADHESION_DEFAULTS['form.error'] ?? 'Impossible d’envoyer la demande pour le moment. Réessayez plus tard.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fi2t-adhesion-page" data-cms-page="fiche-adhesion">
      <section className="fi2t-page-hero fi2t-page-hero--adhesion" data-cms-page="fiche-adhesion" data-cms-section="hero">
        <EditableHeroBackground
          page="fiche-adhesion"
          fallback={HERO_IMAGE}
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

      <section className="fi2t-section fi2t-adhesion-intro" data-cms-page="fiche-adhesion" data-cms-section="intro">
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

      <section className="fi2t-section fi2t-adhesion-adherer" data-cms-page="fiche-adhesion" data-cms-section="adherer">
        <div className="fi2t-adherer fi2t-adhesion-adherer__grid">
          <div className="fi2t-adherer__media">
            <EditableImage
              page="fiche-adhesion"
              blockKey="adherer.image"
              className="fi2t-adherer__image"
              alt=""
              fallback={FICHE_ADHESION_DEFAULTS['adherer.image']}
            />
            <EditablePositioned
              page="fiche-adhesion"
              blockKey="adherer.badge_pos"
              label="Badge 50+ — Position"
              className="fi2t-adherer__badge"
              fallback={parsePos(FICHE_ADHESION_DEFAULTS['adherer.badge_pos'], {
                right: -26,
                bottom: -41,
              })}
            >
              <EditableText
                page="fiche-adhesion"
                blockKey="adherer.badge"
                as="p"
                className="fi2t-stat-badge"
                multiline
                fallback={"50+\nMEMBRES ACTIFS"}
              />
            </EditablePositioned>
          </div>

          <div className="fi2t-adherer__content">
            <EditableText
              page="fiche-adhesion"
              blockKey="adherer.title"
              as="h2"
              fallback="Pourquoi adhérer à la Fi2T ?"
            />
            <EditableJsonList<ReasonItem>
              page="fiche-adhesion"
              blockKey="adherer.reasons"
              label="Avantages adhésion"
              className="fi2t-reasons"
              itemClassName={(_item, index) => {
                const base = 'fi2t-reasons__item'
                if (isEditMode || (index >= pageStart && index < pageEnd)) return base
                return `${base} is-page-hidden`
              }}
              fallback={REASONS_FALLBACK}
              emptyItem={{ title: 'Nouveau bénéfice', desc: 'Description…' }}
              addLabel="Ajouter un bénéfice"
              fields={[
                { key: 'title', label: 'Titre' },
                { key: 'desc', label: 'Description', multiline: true },
              ]}
              renderItem={(_item, _index, { editField }) => (
                <>
                  <img
                    src="/images/adherer-check.svg"
                    alt=""
                    className="fi2t-reasons__check"
                    width={20}
                    height={20}
                    aria-hidden="true"
                  />
                  <div>
                    {editField('title', 'strong')}
                    {editField('desc', 'span')}
                  </div>
                </>
              )}
              renderAfter={() =>
                !isEditMode ? (
                  <Fi2tPagination
                    page={safePage}
                    totalPages={totalPages}
                    onPage={setReasonsPage}
                    ariaLabel="Pagination des avantages"
                    className="fi2t-actu-pagination fi2t-actu-pagination--inline"
                  />
                ) : null
              }
            />
          </div>
        </div>
      </section>

      <section className="fi2t-section fi2t-adhesion-form-wrap" data-cms-page="fiche-adhesion" data-cms-section="form">
        <EditableText
          page="fiche-adhesion"
          blockKey="form.title"
          as="h2"
          className="fi2t-adhesion-form-wrap__title"
          fallback="Demande d’adhésion"
        />
        <form className="fi2t-contact__form fi2t-adhesion-form" onSubmit={handleSubmit}>
          <div className="fi2t-contact__form-inner">
            <div className="fi2t-contact__row">
              <label className="fi2t-contact__field">
                <EditableText
                  page="fiche-adhesion"
                  blockKey="form.label_org"
                  as="span"
                  fallback="RAISON SOCIALE"
                />
                <input
                  type="text"
                  name="org"
                  placeholder={get('form.placeholder_org', 'Nom de votre structure')}
                  required
                />
              </label>
              <label className="fi2t-contact__field">
                <EditableText
                  page="fiche-adhesion"
                  blockKey="form.label_contact"
                  as="span"
                  fallback="NOM DU CONTACT"
                />
                <input
                  type="text"
                  name="contact"
                  placeholder={get('form.placeholder_contact', 'Nom et prénom')}
                  required
                />
              </label>
            </div>
            <div className="fi2t-contact__row">
              <label className="fi2t-contact__field">
                <EditableText
                  page="fiche-adhesion"
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
              <label className="fi2t-contact__field">
                <EditableText
                  page="fiche-adhesion"
                  blockKey="form.label_phone"
                  as="span"
                  fallback="TÉLÉPHONE"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder={get('form.placeholder_phone', '+216 XX XXX XXX')}
                  required
                />
              </label>
            </div>
            <label className="fi2t-contact__field">
              <EditableText
                page="fiche-adhesion"
                blockKey="form.label_activity"
                as="span"
                fallback="ACTIVITÉ / GROUPEMENT"
              />
              <input
                type="text"
                name="activity"
                placeholder={get('form.placeholder_activity', 'Ex: Agences de voyages')}
                required
              />
            </label>
            <label className="fi2t-contact__field fi2t-contact__field--message">
              <EditableText
                page="fiche-adhesion"
                blockKey="form.label_message"
                as="span"
                fallback="MESSAGE"
              />
              <textarea
                name="message"
                rows={4}
                placeholder={get(
                  'form.placeholder_message',
                  'Présentez brièvement votre activité…',
                )}
                required
              />
            </label>
            <button type="submit" className="fi2t-contact__submit" disabled={sending || isEditMode}>
              <EditableText
                page="fiche-adhesion"
                blockKey="form.submit"
                as="span"
                fallback="Envoyer la demande"
              />
            </button>
            {sendError && (
              <p className="fi2t-contact__success" role="alert" style={{ color: '#b42318' }}>
                {sendError}
              </p>
            )}
            {sent && (
              <p className="fi2t-contact__success" role="status">
                <EditableText
                  page="fiche-adhesion"
                  blockKey="form.success"
                  as="span"
                  fallback="Merci — votre demande d’adhésion a bien été envoyée."
                />
              </p>
            )}
          </div>
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
