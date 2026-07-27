import { Link } from 'react-router-dom'
import { ContentProvider, useContent } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'
import EditToolbar from '../cms/EditToolbar'
import { QUI_SOMMES_NOUS_DEFAULTS } from '../cms/defaults/qui-sommes-nous'

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const VALUE_ICONS: Record<string, string> = {
  shield: 'M12 2L4 5v6c0 5.25 3.4 10.15 8 11.35C16.6 21.15 20 16.25 20 11V5l-8-3z',
  spark: 'M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM5 16l.75 2.25L8 19l-2.25.75L5 22l-.75-2.25L2 19l2.25-.75L5 16z',
  nodes: 'M12 2a3 3 0 100 6 3 3 0 000-6zM5 16a3 3 0 100 6 3 3 0 000-6zM19 16a3 3 0 100 6 3 3 0 000-6zM7.5 15.5l3-5M16.5 15.5l-3-5',
  star: 'M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z',
  users: 'M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5z',
  leaf: 'M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.5 17 9.5 13 17 11V8zM17 8V3h-2v5c4.5-.5 7.5 1.5 9 4-2-1-4.5-2-7-4z',
}

function ValueIcon({ name }: { name?: string }) {
  const path = VALUE_ICONS[name ?? 'shield'] ?? VALUE_ICONS.shield
  return (
    <svg className="fi2t-value-card__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

function QuiSommesNousInner() {
  const { get } = useContent()

  const values = parseJsonArray<{ title: string; desc: string; icon?: string }>(
    get('values.items', '[]'),
    parseJsonArray<{ title: string; desc: string; icon?: string }>(
      QUI_SOMMES_NOUS_DEFAULTS['values.items'],
      [],
    ),
  )

  const diversifyItems = parseJsonArray<{ title: string; desc: string }>(
    get('diversify.items', '[]'),
    parseJsonArray<{ title: string; desc: string }>(
      QUI_SOMMES_NOUS_DEFAULTS['diversify.items'],
      [],
    ),
  )

  return (
    <div className="fi2t-about-page">
      <section className="fi2t-page-hero">
        <EditableImage
          page="qui-sommes-nous"
          blockKey="hero.image"
          className="fi2t-page-hero__bg"
          alt=""
          fallback="/hero.jpg"
        />
        <div className="fi2t-page-hero__overlay" />
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

      <section className="fi2t-section fi2t-about-page__mission">
        <div className="fi2t-about-page__mission-text">
          <EditableText
            page="qui-sommes-nous"
            blockKey="mission.title"
            as="h2"
            fallback="Notre Histoire & Mission"
          />
          <EditableText
            page="qui-sommes-nous"
            blockKey="mission.body"
            as="div"
            multiline
            className="fi2t-about-page__body"
            fallback="La Fédération Interprofessionnelle du Tourisme Tunisien est un syndicat professionnel patronal indépendant fondé en mars 2016."
          />
        </div>
        <div className="fi2t-about-page__mission-media">
          <EditableImage
            page="qui-sommes-nous"
            blockKey="mission.image"
            className="fi2t-about-page__mission-image"
            alt="FI2T"
            fallback="/images/qui-sommes-nous.jpg"
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
          <div className="fi2t-values-grid">
            {values.map((item) => (
              <article key={item.title} className="fi2t-value-card">
                <ValueIcon name={item.icon} />
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fi2t-section fi2t-about-page__split">
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
          <ul className="fi2t-diversify-list">
            {diversifyItems.map((item) => (
              <li key={item.title}>
                <span className="fi2t-diversify-list__check" aria-hidden="true">✓</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
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
