import { useTranslation } from 'react-i18next'
import EditableText from '../../cms/EditableText'
import { useContent } from '../../cms/ContentProvider'
import { useRestaurants } from '../../hooks/useRestaurants'
import { outletToCard, restaurantSlug, type RestaurantCard } from '../../lib/restaurant'
import { IMG } from '../../lib/localImages'
import '../../styles/restaurants.css'

const PAGE = 'home'
const DEFAULT: RestaurantCard[] = [
  { name: 'CALCUTA', image: IMG.restaurantCalcutta },
  { name: 'EL MONTAZAH', image: IMG.restaurantMontazah },
  { name: 'LA STALLA', image: IMG.restaurantStalla },
]

export default function RestaurantsSection() {
  const { t } = useTranslation()
  const { getJson } = useContent()
  const { restaurants: fromApi } = useRestaurants()
  const cmsCards = getJson<RestaurantCard[]>('restaurants.cards', DEFAULT)
  const RESTAURANTS = fromApi.length > 0
    ? fromApi.map(outletToCard)
    : cmsCards

  return (
    <section className="section restaurants" data-cms-section="restaurants">
      <img
        src="/imgs/bgvictor.svg"
        alt=""
        className="restaurants__bg"
        aria-hidden="true"
      />
      <div className="container restaurants__inner">
        <h2 className="restaurants__heading">{t('home.gastronomyLabel')}</h2>
        <div className="restaurants__title-badge-wrap">
          <div className="restaurants__title-badge">
            <EditableText
              page={PAGE}
              blockKey="restaurants.title"
              as="p"
              className="restaurants__title-badge-text"
              fallback={t('home.restaurantTitle')}
              label="Restaurants — Titre"
            />
          </div>
        </div>
        <EditableText
          page={PAGE}
          blockKey="restaurants.desc"
          as="p"
          className="restaurants__desc"
          multiline
          fallback={t('home.restaurantDesc')}
          label="Restaurants — Description"
        />

        <div className="restaurants__grid">
          {RESTAURANTS.map((r) => (
            <article key={r.name} className="resto-card">
              <div className="resto-card__img">
                <img src={r.image} alt={r.name} loading="lazy" />
                <div className="resto-card__overlay">
                  <span className="resto-card__label">Restaurant</span>
                  <h3 className="resto-card__name">{r.name}</h3>
                  <a href={`/reservation?restaurant=${restaurantSlug(r.name)}`} className="resto-card__cta">
                    <span className="resto-card__cta-label">{t('nav.reservation')}</span>
                    <span className="resto-card__cta-arrow" aria-hidden="true">
                      <i className="fa-solid fa-arrow-right" />
                    </span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
