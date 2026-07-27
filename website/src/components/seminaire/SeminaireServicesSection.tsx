import { Link } from 'react-router-dom'
import { useContent } from '../../cms/ContentProvider'
import EditableImage from '../../cms/EditableImage'
import EditableText from '../../cms/EditableText'

const PAGE = 'seminaire'

interface FeatureCardData {
  icon: string
  title: string
  text: string
  variant: 'numidian' | 'bordeaux' | 'marine' | 'noir'
}

const DEFAULT_CARDS: FeatureCardData[] = [
  {
    icon: '/imgs/Servicebanquet.svg',
    title: 'Service Banquet',
    text: 'Une équipe expérimentée à votre entière disposition et pour vous proposer une très grande variété de services annexes (Restauration - Pauses café - Cocktails...',
    variant: 'numidian',
  },
  {
    icon: '/imgs/disponibilite.svg',
    title: 'Disponibilité',
    text: 'Pour la tenue de vos événements, le Golden Carthage Hotel vous propose plus de 10 salles suffisamment flexibles pour être aménagées en différents styles (Ecole - theatre - U shape - Cocktail..)',
    variant: 'bordeaux',
  },
  {
    icon: '/imgs/equipements.svg',
    title: 'Équipements',
    text: 'Équipements audiovisuel et sonorisation fournis sur demande.',
    variant: 'marine',
  },
  {
    icon: '/imgs/businesscenter.svg',
    title: 'Business Center',
    text: 'Nous mettons à votre disposition un business center totalement équipé.',
    variant: 'noir',
  },
]

function FeatureCard({ icon, title, text, variant }: FeatureCardData) {
  return (
    <article className={`feature-card feature-card--${variant}`}>
      <span className="feature-card__notch" aria-hidden="true" />
      <div className="feature-card__surface">
        <div className="feature-card__header">
          <div className="feature-card__icon-box">
            <img src={icon} alt="" aria-hidden="true" />
          </div>
          <div className="feature-card__icon-bg" aria-hidden="true" />
        </div>
        <div className="feature-card__body">
          <h3 className="feature-card__title">{title}</h3>
          <p className="feature-card__text">{text}</p>
        </div>
      </div>
    </article>
  )
}

export default function SeminaireServicesSection() {
  const { getJson } = useContent()
  const cards = getJson<FeatureCardData[]>('services.cards', DEFAULT_CARDS)

  return (
    <section className="sem-services" aria-label="Nos services événementiels">
      <div className="sem-services__inner">
        <div className="sem-services__photo-wrap">
          <EditableImage
            page={PAGE}
            blockKey="services.image"
            className="sem-services__photo"
            alt="Salle de conférence Golden Carthage"
            fallback="/imgs/coj755JYjt8GFUIA6KZsd6VQz5yNxpiyZyIfJDVE.jpg"
            label="Services — Photo"
          />
        </div>

        <div className="sem-services__panel">
          <div className="sem-services__panel-content">
            <div className="sem-services__grid">
              {cards.map(card => (
                <FeatureCard key={card.title} {...card} />
              ))}
            </div>

            <div className="sem-services__actions">
              <Link to="/seminaire/reservation" className="sem-services__btn sem-services__btn--gold">
                <EditableText page={PAGE} blockKey="services.cta_event" as="span" label="Services — Bouton" />
              </Link>
              <Link
                to="/contact"
                className="sem-services__btn sem-services__btn--calendar"
                aria-label="Planifier un événement"
              >
                <img src="/imgs/calendar%205.svg" alt="" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
