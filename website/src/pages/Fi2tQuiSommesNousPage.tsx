import { Link } from 'react-router-dom'
import { ContentProvider } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'
import EditableHeroBackground from '../cms/EditableHeroBackground'
import EditableJsonList from '../cms/EditableJsonList'
import EditToolbar from '../cms/EditToolbar'
import { QUI_SOMMES_NOUS_DEFAULTS } from '../cms/defaults/qui-sommes-nous'

type ValueItem = { title: string; desc: string; icon: string }
type DiversifyItem = { title: string; desc: string }

/** Map legacy icon keys (from older CMS data) to real asset paths. */
const VALUE_ICON_MAP: Record<string, string> = {
  shield: '/images/value-integrity.svg',
  spark: '/images/value-innovation.svg',
  nodes: '/images/value-synergie.svg',
  star: '/images/value-excellence.svg',
  users: '/images/value-representation.svg',
  leaf: '/images/value-durabilite.svg',
}

function resolveValueIcon(icon: string | undefined): string {
  const raw = (icon || '').trim()
  if (!raw) return '/images/value-integrity.svg'
  if (raw.startsWith('/') || raw.startsWith('http') || raw.startsWith('data:')) return raw
  return VALUE_ICON_MAP[raw] ?? `/images/value-${raw}.svg`
}

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as T[] : fallback
  } catch {
    return fallback
  }
}

function normalizeValues(items: ValueItem[]): ValueItem[] {
  return items.map((item) => ({ ...item, icon: resolveValueIcon(item.icon) }))
}

const VALUES_FALLBACK = normalizeValues(parseJsonArray<ValueItem>(QUI_SOMMES_NOUS_DEFAULTS['values.items'], []))
const DIVERSIFY_FALLBACK = parseJsonArray<DiversifyItem>(QUI_SOMMES_NOUS_DEFAULTS['diversify.items'], [])

function QuiSommesNousInner() {
  return (
    <div className="fi2t-about-page">
      <section className="fi2t-page-hero fi2t-page-hero--about">
        {/* Figma composition: BANNER 1 + Rectangle 25 (rgba(0,0,0,0.3)) */}
        <EditableHeroBackground
          page="qui-sommes-nous"
          fallback="/images/qui-sommes-nous-banner.png?v=8"
        />
        <div className="fi2t-page-hero__overlay" aria-hidden="true" />
        <div className="fi2t-page-hero__content">
          <EditableText
            page="qui-sommes-nous"
            blockKey="hero.title"
            as="h1"
            className="fi2t-page-hero__title"
            fallback="Qui sommes-nous"
          />
          <span className="fi2t-page-hero__accent" aria-hidden="true" />
        </div>
      </section>

      <section className="fi2t-about-page__mission">
        <div className="fi2t-about-page__mission-text">
          <EditableText
            page="qui-sommes-nous"
            blockKey="mission.title"
            as="h2"
            className="fi2t-about-page__mission-title"
            fallback="Notre Histoire & Mission"
          />
          <EditableText
            page="qui-sommes-nous"
            blockKey="mission.body"
            as="div"
            multiline
            className="fi2t-about-page__body"
            fallback={QUI_SOMMES_NOUS_DEFAULTS['mission.body']}
          />
        </div>
        <div className="fi2t-about-page__mission-media">
          <EditableImage
            page="qui-sommes-nous"
            blockKey="mission.image"
            className="fi2t-about-page__mission-image"
            alt="FI2T"
            fallback="/images/qui-sommes-nous-mission-card.png?v=1"
          />
        </div>
      </section>

      <section className="fi2t-about-page__values">
        <div className="fi2t-section">
          <EditableText
            page="qui-sommes-nous"
            blockKey="values.title"
            as="h2"
            className="fi2t-about-page__values-title"
            fallback="Nos objectifs"
          />
          <EditableJsonList<ValueItem>
            page="qui-sommes-nous"
            blockKey="values.items"
            label="Objectifs — Cartes"
            className="fi2t-values-grid"
            fallback={VALUES_FALLBACK}
            transform={normalizeValues}
            emptyItem={{
              title: 'NOUVEL OBJECTIF',
              desc: 'Description…',
              icon: '/images/value-integrity.svg',
            }}
            addLabel="Ajouter un objectif"
            fields={[
              { key: 'title', label: 'Titre' },
              { key: 'desc', label: 'Description', multiline: true },
              { key: 'icon', label: 'Icône', image: true },
            ]}
            renderItem={(_item, _index, { editField, editImage }) => (
              <article className="fi2t-value-card">
                <div className="fi2t-value-card__icon-wrap">
                  {editImage('icon', 'fi2t-value-card__icon-img', '')}
                </div>
                {editField('title', 'h3', 'fi2t-value-card__title')}
                {editField('desc', 'p')}
              </article>
            )}
          />
        </div>
      </section>

      <section className="fi2t-about-page__split">
        <div className="fi2t-about-page__diversify">
          <EditableText
            page="qui-sommes-nous"
            blockKey="diversify.title"
            as="h2"
            fallback="Pourquoi diversifier et innover ?"
          />
          <EditableText
            page="qui-sommes-nous"
            blockKey="diversify.intro"
            as="p"
            className="fi2t-about-page__diversify-intro"
            fallback="La diversification des produits touristique n’est pas un luxe, c’est plutôt :"
          />
          <EditableJsonList<DiversifyItem>
            page="qui-sommes-nous"
            blockKey="diversify.items"
            label="Diversification — Points"
            className="fi2t-diversify-list"
            fallback={DIVERSIFY_FALLBACK}
            emptyItem={{ title: 'Nouveau point', desc: 'Description…' }}
            addLabel="Ajouter un point"
            fields={[
              { key: 'title', label: 'Titre' },
              { key: 'desc', label: 'Description', multiline: true },
            ]}
            itemClassName="fi2t-diversify-list__item"
            renderItem={(_item, _index, { editField }) => (
              <>
                <span className="fi2t-diversify-list__check" aria-hidden="true">
                  <img src="/images/check-circle.svg" alt="" />
                </span>
                <div>
                  {editField('title', 'strong')}
                  {editField('desc', 'p')}
                </div>
              </>
            )}
          />
        </div>
        <div className="fi2t-about-page__join">
          <EditableText
            page="qui-sommes-nous"
            blockKey="join.title"
            as="h2"
            fallback="Prêt à rejoindre l'excellence ?"
          />
          <EditableText
            page="qui-sommes-nous"
            blockKey="join.body"
            as="p"
            multiline
            fallback="Contribuez activement à la transformation du tourisme tunisien en devenant membre de notre fédération interprofessionnelle."
          />
          <Link to="/fiche-adhesion" className="fi2t-btn fi2t-btn--light fi2t-about-page__join-btn">
            <EditableText page="qui-sommes-nous" blockKey="join.cta" as="span" fallback="Devenir membre" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default function Fi2tQuiSommesNousPage() {
  return (
    <ContentProvider page="qui-sommes-nous">
      <QuiSommesNousInner />
      <EditToolbar />
    </ContentProvider>
  )
}
