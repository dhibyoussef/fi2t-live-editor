import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router-dom'
import { ContentProvider, useContent } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage, { useEditableImageSrc } from '../cms/EditableImage'
import EditableJsonList from '../cms/EditableJsonList'
import EditToolbar from '../cms/EditToolbar'
import { useEditMode } from '../cms/EditModeProvider'
import {
  getGroupementDefaults,
  isGroupementSlug,
  GROUPEMENT_HERO_BY_SLUG,
} from '../cms/defaults/groupements-index'
import type { ChallengeItem, PillarCard, ProposalItem } from '../cms/defaults/groupement-shared'
import { GROUPEMENT_PHOTO_HERO_BY_SLUG } from '../lib/groupement-tree'
import GroupementCustomBody, { hasCustomGroupementLayout } from './groupements/GroupementCustomBody'

type EnjeuLine = { text: string }
type ChallengeRow = { number?: string; title: string; body: string; constat: string }

function sequenceNumber(index: number) {
  return String(index + 1).padStart(2, '0')
}

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : fallback
  } catch {
    return fallback
  }
}

function toEnjeuLines(raw: string, fallback: string[]): EnjeuLine[] {
  const parsed = parseJsonArray<string | EnjeuLine>(raw, fallback)
  return parsed.map((item) => (typeof item === 'string' ? { text: item } : { text: item.text ?? '' }))
}

function formatAccBody(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const boldPrefix = /^(Constat FI2T\s*:|Rôle FI2T\s*:)/i.exec(line)
    if (boldPrefix) {
      const prefix = boldPrefix[1]
      const rest = line.slice(prefix.length)
      return (
        <span key={i}>
          {i > 0 ? '\n' : null}
          <strong>{prefix}</strong>
          {rest}
        </span>
      )
    }
    return (
      <span key={i}>
        {i > 0 ? '\n' : null}
        {line}
      </span>
    )
  })
}

function AccordionItem({
  open,
  onToggle,
  header,
  children,
}: {
  open: boolean
  onToggle: () => void
  header: ReactNode
  children?: ReactNode
}) {
  return (
    <article className={`fi2t-g-acc${open ? ' is-open' : ''}`}>
      <button type="button" className="fi2t-g-acc__head" onClick={onToggle} aria-expanded={open}>
        {header}
        <span className="fi2t-g-acc__chevron" aria-hidden="true">
          ›
        </span>
      </button>
      {open && children ? <div className="fi2t-g-acc__body">{children}</div> : null}
    </article>
  )
}

function GroupementEditableBody({
  slug,
  defaults,
}: {
  slug: string
  defaults: Record<string, string>
}) {
  const [openChallenge, setOpenChallenge] = useState(0)
  const [openProposal, setOpenProposal] = useState(0)
  const { isEditMode } = useEditMode()
  const { i18n } = useTranslation()
  const lang = (i18n.language || 'fr').split('-')[0]
  const photoHero = GROUPEMENT_PHOTO_HERO_BY_SLUG[slug]
  const bakedHero = !isEditMode && !photoHero ? GROUPEMENT_HERO_BY_SLUG[slug] : undefined
  const photoFallback = photoHero ? `${photoHero}?v=5` : (defaults['hero.image'] ?? '/hero.jpg')
  const heroImgSrc = useEditableImageSrc(slug, 'hero.image', photoFallback)
  const enjeuxImgSrc = useEditableImageSrc(slug, 'enjeux.image', '/images/groupement-enjeux.jpg')
  const constatPrefix =
    lang === 'ar' ? 'ملاحظة FI2T :' : lang === 'en' ? 'FI2T finding:' : 'Constat FI2T :'

  const pillarsFallback = parseJsonArray<PillarCard>(defaults['positioning.pillars'] ?? '[]', [])
  const challengesFallback = parseJsonArray<ChallengeItem>(defaults['challenges.items'] ?? '[]', []).map((c) => ({
    title: c.title,
    body: c.body,
    constat: c.constat ?? '',
  }))
  const enjeuxFallback = toEnjeuLines(defaults['enjeux.items'] ?? '[]', [])
  const proposalsFallback = parseJsonArray<ProposalItem>(defaults['proposals.items'] ?? '[]', [])

  return (
    <>
      {bakedHero ? (
        <section className="fi2t-page-hero fi2t-page-hero--groupement fi2t-page-hero--groupement-baked" data-cms-section="hero">
          <img src={bakedHero} alt="" className="fi2t-page-hero__bg fi2t-page-hero__bg--baked" />
          <div className="fi2t-page-hero__content">
            <h1 className="fi2t-page-hero__title fi2t-page-hero__title--sr">
              {defaults['hero.title'] ?? slug}
            </h1>
          </div>
        </section>
      ) : (
        <section className="fi2t-g-hero" aria-label="Bannière" data-cms-section="hero">
          <div className="fi2t-g-hero-media">
            <img
              className="fi2t-g-hero-media__img"
              src={heroImgSrc}
              alt=""
              loading="eager"
              data-cms-page={slug}
              data-cms-block="hero.image"
            />
            {photoHero ? (
              <span className="fi2t-g-hero-media__scrim" aria-hidden="true" />
            ) : (
              <div className="fi2t-page-hero__overlay" style={{ pointerEvents: 'none' }} />
            )}
            {isEditMode ? (
              <EditableImage
                page={slug}
                blockKey="hero.image"
                variant="chip"
                label="Image bannière"
                className="fi2t-g-hero-media__edit"
                fallback={photoFallback}
              />
            ) : null}
          </div>
          <div
            className="fi2t-g-hero-title"
            onClick={(e) => e.stopPropagation()}
          >
            <EditableText
              page={slug}
              blockKey="hero.title"
              as="h1"
              className="fi2t-g-hero-title__text"
              label="Titre bannière"
              fallback={defaults['hero.title'] ?? slug}
            />
            <span className="fi2t-g-hero-title__accent" aria-hidden="true" />
          </div>
        </section>
      )}

      <section className="fi2t-section fi2t-g-positioning" data-cms-section="positioning">
        <div className="fi2t-g-positioning__text">
          <EditableText
            page={slug}
            blockKey="positioning.title"
            as="h2"
            fallback="Positionnement FI2T"
          />
          <EditableText
            page={slug}
            blockKey="positioning.body"
            as="p"
            multiline
            fallback={defaults['positioning.body'] ?? ''}
          />
        </div>
        <EditableJsonList<PillarCard>
          page={slug}
          blockKey="positioning.pillars"
          label="Piliers"
          className="fi2t-g-pillars"
          fallback={pillarsFallback}
          emptyItem={{ title: 'Nouveau pilier', icon: '/images/g-icon-structure.svg' }}
          addLabel="Ajouter un pilier"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          renderItem={(_item, _index, { editField, editImage }) => (
            <article className="fi2t-g-pillar">
              {editImage('icon', 'fi2t-g-pillar__icon', '')}
              {editField('title', 'h3')}
            </article>
          )}
        />
      </section>

      <section className="fi2t-g-challenges" data-cms-section="challenges">
        <div className="fi2t-section">
          <EditableText
            page={slug}
            blockKey="challenges.title"
            as="h2"
            className="fi2t-g-section-title"
            fallback="Positionnement FI2T"
          />
          <EditableJsonList<ChallengeRow>
            page={slug}
            blockKey="challenges.items"
            label="Défis"
            className="fi2t-g-acc-list"
            fallback={challengesFallback}
            transform={(items) =>
              items.map(({ number: _storedNumber, ...item }) => item as ChallengeRow)
            }
            emptyItem={{ title: 'Nouveau défi', body: '', constat: '' }}
            addLabel="Ajouter un défi"
            fields={[
              { key: 'title', label: 'Titre' },
              { key: 'body', label: 'Texte', multiline: true },
              { key: 'constat', label: 'Constat', multiline: true },
            ]}
            renderItem={(item, index, { editable, editField }) => (
              <AccordionItem
                open={openChallenge === index}
                onToggle={() => setOpenChallenge((v) => (v === index ? -1 : index))}
                header={
                  <>
                    <span className="fi2t-g-acc__num">{sequenceNumber(index)}</span>
                    {editable ? editField('title', 'span', 'fi2t-g-acc__title') : <span className="fi2t-g-acc__title">{item.title}</span>}
                  </>
                }
              >
                {editable ? editField('body', 'p', 'fi2t-g-acc__text') : <div className="fi2t-g-acc__text">{formatAccBody(item.body)}</div>}
                {(editable || item.constat) && (
                  editable
                    ? editField('constat', 'p', 'fi2t-g-acc__constat')
                    : (
                      <p className="fi2t-g-acc__constat">
                        <strong>{constatPrefix}</strong>
                        {' '}
                        {item.constat.replace(/^(Constat FI2T|FI2T finding|ملاحظة FI2T)\s*:?\s*/i, '')}
                      </p>
                    )
                )}
              </AccordionItem>
            )}
          />
        </div>
      </section>

      <section className="fi2t-section fi2t-g-enjeux" data-cms-section="enjeux">
        <div className="fi2t-g-enjeux__media">
          <img
            src={enjeuxImgSrc}
            alt=""
            className="fi2t-g-enjeux__image"
            loading="lazy"
            data-cms-page={slug}
            data-cms-block="enjeux.image"
          />
          {isEditMode ? (
            <EditableImage
              page={slug}
              blockKey="enjeux.image"
              variant="chip"
              label="Image enjeux"
              className="fi2t-g-enjeux__edit-chip"
              fallback="/images/groupement-enjeux.jpg"
            />
          ) : null}
        </div>
        <div>
          <EditableText
            page={slug}
            blockKey="enjeux.title"
            as="h2"
            fallback="Enjeux stratégiques"
          />
          <EditableJsonList<EnjeuLine>
            page={slug}
            blockKey="enjeux.items"
            label="Enjeux"
            className="fi2t-g-enjeux__list"
            transform={(items) =>
              (items as unknown[]).map((item) =>
                typeof item === 'string'
                  ? { text: item }
                  : { text: String((item as EnjeuLine)?.text ?? '') },
              )
            }
            fallback={enjeuxFallback}
            emptyItem={{ text: 'Nouvel enjeu…' }}
            addLabel="Ajouter un enjeu"
            fields={[{ key: 'text', label: 'Texte', multiline: true }]}
            itemClassName="fi2t-g-enjeux__item"
            renderItem={(_item, _index, { editField }) => (
              <li>{editField('text', 'span')}</li>
            )}
          />
        </div>
      </section>

      <section className="fi2t-g-proposals" data-cms-section="proposals">
        <div className="fi2t-section">
          <EditableText
            page={slug}
            blockKey="proposals.title"
            as="h2"
            className="fi2t-g-section-title"
            fallback="Propositions stratégiques"
          />
          <EditableJsonList<ProposalItem>
            page={slug}
            blockKey="proposals.items"
            label="Propositions"
            className="fi2t-g-acc-list fi2t-g-acc-list--proposals"
            fallback={proposalsFallback}
            emptyItem={{ title: 'Nouvelle proposition', body: '' }}
            addLabel="Ajouter une proposition"
            fields={[
              { key: 'title', label: 'Titre' },
              { key: 'body', label: 'Texte', multiline: true },
            ]}
            renderItem={(item, index, { editable, editField }) => (
              <AccordionItem
                open={openProposal === index}
                onToggle={() => setOpenProposal((v) => (v === index ? -1 : index))}
                header={
                  editable
                    ? editField('title', 'span', 'fi2t-g-acc__title fi2t-g-acc__title--teal')
                    : <span className="fi2t-g-acc__title fi2t-g-acc__title--teal">{item.title}</span>
                }
              >
                {editable ? editField('body', 'p', 'fi2t-g-acc__text') : <div className="fi2t-g-acc__text">{formatAccBody(item.body)}</div>}
              </AccordionItem>
            )}
          />
        </div>
      </section>
    </>
  )
}

function GroupementInner({ slug }: { slug: string }) {
  useContent()
  const defaults = getGroupementDefaults(slug)
  // Real HTML pages only — never a full-page screenshot.
  const useCustom = hasCustomGroupementLayout(slug)
  const isAgences = slug === 'agences-de-voyages'

  useEffect(() => {
    document.body.classList.remove('fi2t-design-face-page')
  }, [slug])

  const pageMod = isAgences
    ? 'fi2t-groupement-page--agences'
    : useCustom
      ? `fi2t-groupement-page--custom fi2t-groupement-page--${slug}`
      : `fi2t-groupement-page--${slug}`

  return (
    <div className={`fi2t-groupement-page ${pageMod}`} data-cms-page={slug}>
      {useCustom ? (
        <GroupementCustomBody slug={slug} />
      ) : (
        <GroupementEditableBody slug={slug} defaults={defaults} />
      )}
    </div>
  )
}

export default function Fi2tGroupementPage() {
  const { slug = '' } = useParams<{ slug: string }>()

  if (!isGroupementSlug(slug)) {
    return <Navigate to="/" replace />
  }

  return (
    <ContentProvider page={slug}>
      <GroupementInner slug={slug} />
      <EditToolbar />
    </ContentProvider>
  )
}
