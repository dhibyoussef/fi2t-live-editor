import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ContentProvider, useContent } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'
import EditableHeroBackground from '../cms/EditableHeroBackground'
import EditableJsonList from '../cms/EditableJsonList'
import EditToolbar from '../cms/EditToolbar'
import { useEditMode } from '../cms/EditModeProvider'
import { GROUPEMENTS, type GroupementItem } from '../lib/groupements'
import { ORGANISATION_DEFAULTS } from '../cms/defaults/organisation'
import { publicUrl } from '../lib/publicUrl'

type BoardMember = { name: string; role: string; image: string }
type StaffMember = { initials: string; name: string; role: string }
type RegionItem = { name: string; region: string }

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as T[] : fallback
  } catch {
    return fallback
  }
}

const BOARD_FALLBACK = parseJsonArray<BoardMember>(ORGANISATION_DEFAULTS['board.members'], [])
const STAFF_FALLBACK = parseJsonArray<StaffMember>(ORGANISATION_DEFAULTS['headquarters.staff'], [])
const REGION_FALLBACK = parseJsonArray<RegionItem>(ORGANISATION_DEFAULTS['regional.items'], [])

/** Rows shown before the list has to be expanded — the artboard's 4×2 grid. */
const REGIONAL_VISIBLE_ROWS = 8

function OrganisationInner() {
  const { get } = useContent()
  const { isEditMode } = useEditMode()
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [regionsExpanded, setRegionsExpanded] = useState(false)

  const groupements = parseJsonArray<GroupementItem>(
    get('groupements.items', groupementsJsonSafe()),
    GROUPEMENTS,
  )
  const regions = parseJsonArray<RegionItem>(
    get('regional.items', ORGANISATION_DEFAULTS['regional.items']),
    REGION_FALLBACK,
  )
  // Editors need every row reachable inline, so the list never stays collapsed in edit mode.
  const canCollapseRegions = regions.length > REGIONAL_VISIBLE_ROWS && !isEditMode
  const showAllRegions = !canCollapseRegions || regionsExpanded
  /* Auto-calculated KPIs — not editable (avoids stale/fake numbers). */
  const autoGroupements = String(Math.max(groupements.length, 1)).padStart(2, '0')
  const autoRegions = String(Math.max(regions.length, 1)).padStart(2, '0')
  const autoYears = String(Math.max(1, new Date().getFullYear() - 2016)).padStart(2, '0')

  const stats = useMemo(() => ([
    {
      value: autoGroupements,
      labelKey: 'stats.label_groupements',
      label: get('stats.label_groupements', 'GROUPEMENTS'),
    },
    {
      value: autoRegions,
      labelKey: 'stats.label_regions',
      label: get('stats.label_regions', 'RÉGIONS'),
    },
    {
      value: autoYears,
      labelKey: 'stats.label_mandate',
      label: get('stats.label_mandate', 'ANS'),
    },
  ]), [autoGroupements, autoRegions, autoYears, get])

  return (
    <div className="fi2t-org-page">
      <section className="fi2t-page-hero fi2t-page-hero--org" data-cms-section="hero">
        <EditableHeroBackground
          page="organisation"
          fallback="/images/qui-sommes-nous-banner.png?v=8"
        />
        <div className="fi2t-page-hero__overlay" aria-hidden="true" />
        <div className="fi2t-page-hero__content">
          <EditableText
            page="organisation"
            blockKey="hero.title"
            as="h1"
            className="fi2t-page-hero__title"
            fallback="Organisation"
          />
          <span className="fi2t-page-hero__accent" aria-hidden="true" />
        </div>
      </section>

      <section className="fi2t-org-stats" data-cms-section="stats">
        {stats.map((item) => (
          <article key={item.labelKey} className="fi2t-org-stat">
            <span className="fi2t-org-stat__value" title="Calculé automatiquement">
              {item.value}
            </span>
            <EditableText
              page="organisation"
              blockKey={item.labelKey}
              as="span"
              className="fi2t-org-stat__label"
              fallback={item.label}
            />
          </article>
        ))}
      </section>

      <section className="fi2t-org-board" data-cms-section="board">
        <EditableText
          page="organisation"
          blockKey="board.title"
          as="h2"
          className="fi2t-org-board__title"
          fallback="Composition Actuelle"
        />
        <EditableJsonList<BoardMember>
          page="organisation"
          blockKey="board.members"
          label="Bureau — Membres"
          className="fi2t-org-board__grid"
          fallback={BOARD_FALLBACK}
          emptyItem={{ name: 'Nouveau membre', role: 'RÔLE', image: '' }}
          addLabel="Ajouter un membre"
          fields={[
            { key: 'name', label: 'Nom' },
            { key: 'role', label: 'Rôle' },
            { key: 'image', label: 'Photo', image: true },
          ]}
          renderItem={(item, _index, { editField, editImage }) => (
            <article className="fi2t-org-member">
              <div className={`fi2t-org-member__photo${!item.image ? ' is-empty' : ''}`}>
                {editImage('image', 'fi2t-org-member__photo-img', item.name || '')}
                {!item.image && (
                  <span className="fi2t-org-member__placeholder" aria-hidden="true">
                    <img src={publicUrl('/images/org-person-placeholder.svg')} alt="" />
                  </span>
                )}
              </div>
              {editField('name', 'h3')}
              {editField('role', 'p')}
            </article>
          )}
        />
      </section>

      <section className="fi2t-org-hq" data-cms-section="headquarters">
        <div className="fi2t-org-hq__inner">
          <EditableText
            page="organisation"
            blockKey="headquarters.title"
            as="h3"
            className="fi2t-org-hq__title"
            fallback="Le bureau du siège de la Fi2T"
          />
          <EditableJsonList<StaffMember>
            page="organisation"
            blockKey="headquarters.staff"
            label="Siège — Équipe"
            className="fi2t-org-hq__staff"
            fallback={STAFF_FALLBACK}
            emptyItem={{ initials: 'XX', name: 'Nouveau collaborateur', role: 'Poste' }}
            addLabel="Ajouter un collaborateur"
            fields={[
              { key: 'initials', label: 'Initiales' },
              { key: 'name', label: 'Nom' },
              { key: 'role', label: 'Fonction' },
            ]}
            renderItem={(_item, _index, { editField }) => (
              <article className="fi2t-org-staff">
                {editField('initials', 'span', 'fi2t-org-staff__initials')}
                <div>
                  {editField('name', 'strong')}
                  {editField('role', 'p')}
                </div>
              </article>
            )}
          />
        </div>
      </section>

      <section className="fi2t-org-regional" data-cms-section="regional">
        <EditableText
          page="organisation"
          blockKey="regional.title"
          as="h2"
          fallback="Les Bureaux Régionaux"
        />
        <div className="fi2t-org-regional__layout">
          <div className="fi2t-org-regional__list-wrap">
            <EditableJsonList<RegionItem>
              page="organisation"
              blockKey="regional.items"
              label="Bureaux régionaux"
              className="fi2t-org-regional__lists"
              fallback={REGION_FALLBACK}
              emptyItem={{ name: 'Nouveau responsable', region: 'Région' }}
              addLabel="Ajouter un bureau"
              fields={[
                { key: 'name', label: 'Responsable' },
                { key: 'region', label: 'Région' },
              ]}
              itemClassName={(item, index) => [
                'fi2t-org-regional__row',
                activeRegion === item.region ? 'is-active' : '',
                index >= REGIONAL_VISIBLE_ROWS && !showAllRegions ? 'is-collapsed' : '',
              ].filter(Boolean).join(' ')}
              renderItem={(item, _index, { editField }) => (
                <button
                  type="button"
                  className="fi2t-org-regional__row-btn"
                  aria-pressed={activeRegion === item.region}
                  onClick={() =>
                    setActiveRegion((current) => (current === item.region ? null : item.region))
                  }
                >
                  {editField('name', 'strong')}
                  {editField('region', 'span')}
                </button>
              )}
            />
            <div className="fi2t-org-regional__more">
              {canCollapseRegions && (
                <button
                  type="button"
                  className={`fi2t-org-regional__chevron${regionsExpanded ? ' is-expanded' : ''}`}
                  aria-expanded={regionsExpanded}
                  aria-label={regionsExpanded ? 'Voir moins' : 'Voir plus'}
                  onClick={() => setRegionsExpanded((open) => !open)}
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="fi2t-org-regional__map">
            <EditableImage
              page="organisation"
              blockKey="regional.map_image"
              className="fi2t-org-regional__map-img"
              alt="Bureaux Régionaux"
              fallback="/images/org-regional-map-card.png?v=2"
            />
            <div className="fi2t-org-regional__map-content">
              <img
                className="fi2t-org-regional__map-icon"
                src={publicUrl('/images/org-map-icon.svg?v=2')}
                alt=""
                aria-hidden="true"
              />
              <p className="fi2t-org-regional__map-label">
                <span>{regions.length}</span>{' '}
                <EditableText
                  page="organisation"
                  blockKey="regional.map_label"
                  as="span"
                  fallback="Bureaux Régionaux"
                />
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="fi2t-org-groupements" data-cms-section="groupements">
        <EditableText
          page="organisation"
          blockKey="groupements.title"
          as="h2"
          className="fi2t-org-groupements__title"
          fallback="Les Groupements Professionnels"
        />
        <EditableJsonList<GroupementItem>
          page="organisation"
          blockKey="groupements.items"
          label="Groupements — Cartes"
          className="fi2t-org-groupements__grid"
          shared={false}
          fallback={GROUPEMENTS}
          emptyItem={{ label: 'Nouveau groupement', slug: '', icon: '/images/icon1.png?v=5' }}
          addLabel="Ajouter un groupement"
          fields={[
            { key: 'label', label: 'Nom' },
            { key: 'slug', label: 'Slug (URL)' },
            { key: 'icon', label: 'Icône', image: true, iconPick: true },
          ]}
          renderItem={(item, _index, { editable, editField, editImage }) => {
            const card = (
              <>
                <div className="fi2t-org-group-card__icon">
                  {editImage('icon', 'fi2t-org-group-card__icon-img', '')}
                </div>
                {editField('label', 'p')}
              </>
            )

            if (editable || !item.slug) {
              return <div className="fi2t-org-group-card">{card}</div>
            }

            return (
              <Link to={`/${item.slug}`} className="fi2t-org-group-card">
                {card}
              </Link>
            )
          }}
        />
      </section>
    </div>
  )
}

function groupementsJsonSafe() {
  try {
    return JSON.stringify(GROUPEMENTS)
  } catch {
    return '[]'
  }
}

export default function Fi2tOrganisationPage() {
  return (
    <ContentProvider page="organisation">
      <OrganisationInner />
      <EditToolbar />
    </ContentProvider>
  )
}
