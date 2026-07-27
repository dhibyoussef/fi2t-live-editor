import { useTranslation } from 'react-i18next'
import EditableText from '../../cms/EditableText'
import { useContent } from '../../cms/ContentProvider'
import '../../styles/weddings.css'

const PAGE = 'home'

interface WeddingCard {
  icon: string
  text: string
}

const DEFAULT_CARDS: WeddingCard[] = [
  {
    icon: '/imgs/wedding1.svg',
    text: 'Dans un cadre entre mer et colline, Golden Carthage accueille vos événements les plus précieux avec élégance et précision.',
  },
  {
    icon: '/imgs/wedding2.svg',
    text: 'Terrasses panoramiques, espaces raffinés et scénographies sur mesure permettent de donner vie à des moments uniques.',
  },
  {
    icon: '/imgs/wedding3.svg',
    text: "Un service banquet et catering haut de gamme accompagne chaque événement, avec une attention particulière portée aux détails, à la gastronomie et à l'expérience invités.",
  },
]

export default function WeddingsSection() {
  const { t } = useTranslation()
  const { getJson } = useContent()
  const cards = getJson<WeddingCard[]>('weddings.cards', DEFAULT_CARDS)

  return (
    <section className="weddings" aria-label={t('home.weddingsTitle')} data-cms-section="weddings">
      <div className="weddings__top-spacer" aria-hidden="true" />

      <div className="weddings__hero">
        <div className="container weddings__inner">
          <EditableText
            page={PAGE}
            blockKey="weddings.title"
            as="h2"
            className="weddings__title"
            fallback={t('home.weddingsTitle')}
            label="Mariages — Titre"
          />

          <div className="weddings__badge-wrap">
            <div className="weddings__badge">
              <EditableText
                page={PAGE}
                blockKey="weddings.label"
                as="p"
                className="weddings__badge-text"
                fallback={t('home.weddingsLabel')}
                label="Mariages — Surtitre"
              />
            </div>
          </div>

          <div className="weddings__cards">
            {cards.map((card, i) => (
              <article key={i} className="weddings__card">
                <div className="weddings__card-icon">
                  <img src={card.icon} alt="" aria-hidden="true" />
                </div>
                <p className="weddings__card-text">{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="weddings__cta-band">
        <div className="container">
          <a href="/seminaire" className="weddings__cta btn-gold">
            {t('home.weddingsCta')}
          </a>
        </div>
      </div>
    </section>
  )
}
