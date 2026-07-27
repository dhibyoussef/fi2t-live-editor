import { Link } from 'react-router-dom'
import { ContentProvider, useContent } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'
import EditableJsonList from '../cms/EditableJsonList'
import EditToolbar from '../cms/EditToolbar'
import { GROUPEMENTS, type GroupementItem } from '../lib/groupements'
import { ORGANISATION_DEFAULTS } from '../cms/defaults/organisation'

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function OrganisationInner() {
  const { get } = useContent()

  const stats = parseJsonArray<{ value: string; label: string }>(
    get('stats.items', '[]'),
    parseJsonArray(ORGANISATION_DEFAULTS['stats.items'], []),
  )

  const board = parseJsonArray<{ name: string; role: string; image?: string }>(
    get('board.members', '[]'),
    parseJsonArray(ORGANISATION_DEFAULTS['board.members'], []),
  )

  const staff = parseJsonArray<{ initials: string; name: string; role: string }>(
    get('headquarters.staff', '[]'),
    parseJsonArray(ORGANISATION_DEFAULTS['headquarters.staff'], []),
  )

  const regions = parseJsonArray<{ name: string; region: string }>(
    get('regional.items', '[]'),
    parseJsonArray(ORGANISATION_DEFAULTS['regional.items'], []),
  )

  const mid = Math.ceil(regions.length / 2)
  const regionsCol1 = regions.slice(0, mid)
  const regionsCol2 = regions.slice(mid)

  return (
    <div className="fi2t-org-page">
      <section className="fi2t-page-hero">
        <EditableImage
          page="organisation"
          blockKey="hero.image"
          className="fi2t-page-hero__bg"
          alt=""
          fallback="/hero.jpg"
        />
        <div className="fi2t-page-hero__overlay" />
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

      <section className="fi2t-section fi2t-org-stats">
        {stats.map((item) => (
          <article key={item.label} className="fi2t-org-stat">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </section>

      <section className="fi2t-section fi2t-org-board">
        <EditableText
          page="organisation"
          blockKey="board.title"
          as="h2"
          className="fi2t-org-board__title"
          fallback="Composition Actuelle"
        />
        <div className="fi2t-org-board__grid">
          {board.map((member) => (
            <article key={member.name} className="fi2t-org-member">
              <div className="fi2t-org-member__photo">
                {member.image ? (
                  <img src={member.image} alt={member.name} />
                ) : (
                  <span className="fi2t-org-member__placeholder" aria-hidden="true">👤</span>
                )}
              </div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="fi2t-org-hq">
        <div className="fi2t-org-hq__inner fi2t-section">
          <EditableText
            page="organisation"
            blockKey="headquarters.title"
            as="h3"
            className="fi2t-org-hq__title"
            fallback="Le bureau du siège de la Fi2T"
          />
          <div className="fi2t-org-hq__staff">
            {staff.map((person) => (
              <article key={person.name} className="fi2t-org-staff">
                <span className="fi2t-org-staff__initials">{person.initials}</span>
                <div>
                  <strong>{person.name}</strong>
                  <p>{person.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fi2t-section fi2t-org-regional">
        <EditableText
          page="organisation"
          blockKey="regional.title"
          as="h2"
          fallback="Les Bureaux Régionaux"
        />
        <div className="fi2t-org-regional__layout">
          <div className="fi2t-org-regional__lists">
            <ul>
              {regionsCol1.map((item) => (
                <li key={item.name}>
                  <strong>{item.name}</strong>
                  <span>{item.region}</span>
                </li>
              ))}
            </ul>
            <ul>
              {regionsCol2.map((item) => (
                <li key={item.name}>
                  <strong>{item.name}</strong>
                  <span>{item.region}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="fi2t-org-regional__map">
            <EditableImage
              page="organisation"
              blockKey="regional.map_image"
              className="fi2t-org-regional__map-img"
              alt="Carte de la Tunisie"
              fallback="/hero.jpg"
            />
            <EditableText
              page="organisation"
              blockKey="regional.map_label"
              as="p"
              className="fi2t-org-regional__map-label"
              fallback="11 Bureaux Régionaux"
            />
          </div>
        </div>
      </section>

      <section className="fi2t-section fi2t-org-groupements">
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
          shared
          fallback={GROUPEMENTS}
          emptyItem={{ label: 'Nouveau groupement', slug: '', icon: '/images/icon1.png' }}
          addLabel="Ajouter un groupement"
          fields={[
            { key: 'label', label: 'Nom' },
            { key: 'slug', label: 'Slug (URL)' },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          renderItem={(item, _index, { editable, editField, editImage }) => {
            const card = (
              <>
                <div className="fi2t-org-group-card__icon">
                  {editImage('icon', undefined, item.label)}
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

export default function Fi2tOrganisationPage() {
  return (
    <ContentProvider page="organisation">
      <OrganisationInner />
      <EditToolbar />
    </ContentProvider>
  )
}
