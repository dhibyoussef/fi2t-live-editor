import { Link } from 'react-router-dom'
import { useContent } from '../../cms/ContentProvider'
import EditableText from '../../cms/EditableText'

const PAGE = 'spa'

interface DiscoverCard {
  label: string
  offerName: string
  description: string
  image: string
  href: string
}

const DEFAULT_CARDS: DiscoverCard[] = [
  {
    label: 'Installations',
    offerName: 'Espace Aquatique',
    description:
      'Piscine intérieure, hammam, sauna et bains de vapeur dans un écrin architectural inspiré des thermes antiques.',
    image: '/imgs/KKd2aPj4KZ44MTcQsU0c24RDfi69Z0TSr5wEx9yQ.png',
    href: '/spa/reservation',
  },
  {
    label: 'Expériences',
    offerName: 'Rituel Antonin',
    description:
      'Un parcours sensoriel sur mesure : purifier, détendre, régénérer grâce aux huiles et argiles de terroir tunisien.',
    image: '/imgs/18c664ce74adabf4e4e86461c06d92ef78a5ee4b.png',
    href: '/spa/reservation',
  },
  {
    label: 'Forfait',
    offerName: 'Escapade Bien-Être',
    description:
      'Une journée complète à deux : accès aux installations, soin signature et pause détente pour un moment hors du temps.',
    image: '/imgs/JS222xFAL5iWCgTX6mnYFTjdvVjt7V3iDHcxKcCc.jpg',
    href: '/spa/reservation',
  },
]

export default function SpaDiscoverSection() {
  const { getJson } = useContent()
  const cards = getJson<DiscoverCard[]>('discover.cards', DEFAULT_CARDS)

  return (
    <section className="spa-discover" aria-labelledby="spa-discover-title">
      <div className="spa-discover__inner">
        <EditableText
          page={PAGE}
          blockKey="discover.title"
          as="h2"
          className="spa-discover__title"
          multiline
          label="Découvrir — Titre"
        />

        <div className="spa-discover__grid">
          {cards.map(card => (
            <article key={card.label} className="spa-discover__card" tabIndex={0}>
              <img
                src={card.image}
                alt=""
                className="spa-discover__card-img"
                loading="lazy"
              />

              <div className="spa-discover__card-top" aria-hidden="true">
                <span className="spa-discover__card-label">{card.label}</span>
              </div>

              <div className="spa-discover__card-overlay">
                <div className="spa-discover__card-overlay-head">
                  <span className="spa-discover__card-label">{card.label}</span>
                  <h3 className="spa-discover__card-offer">{card.offerName}</h3>
                </div>

                <div className="spa-discover__card-overlay-foot">
                  <p className="spa-discover__card-desc">{card.description}</p>
                  <Link to={card.href} className="spa-discover__card-btn">
                    <EditableText page={PAGE} blockKey="discover.card_cta" as="span" label="Carte — Bouton" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
