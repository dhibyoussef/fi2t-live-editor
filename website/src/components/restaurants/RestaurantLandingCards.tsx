import { Link } from 'react-router-dom'
import { useRestaurants } from '../../hooks/useRestaurants'
import { restaurantSlug } from '../../lib/restaurant'

import { IMG } from '../../lib/localImages'

export interface RestaurantLandingItem {
  id?: number
  name: string
  description: string
  image: string
}

const FALLBACK_IMAGE = IMG.restaurantCalcutta

const DEFAULT_RESTAURANTS: RestaurantLandingItem[] = [
  {
    name: 'La Stalla',
    description: 'Restaurant Italien de style campagnard',
    image: IMG.restaurantStalla,
  },
  {
    name: 'El Montazah',
    description: 'Cuisine tunisienne et Internationale',
    image: IMG.restaurantMontazah,
  },
  {
    name: 'Calcutta',
    description: 'Spécialités Indiennes',
    image: IMG.restaurantCalcutta,
  },
]

const BG_VARIANTS = ['navy', 'purple', 'navy', 'purple'] as const

function outletToLandingItem(outlet: {
  id: number
  name: string
  description: string | null
  image?: string | null
  images?: string[]
}): RestaurantLandingItem {
  const image =
    outlet.image ??
    outlet.images?.[0] ??
    FALLBACK_IMAGE

  return {
    id: outlet.id,
    name: outlet.name,
    description: outlet.description ?? '',
    image,
  }
}

export default function RestaurantLandingCards() {
  const { restaurants: fromApi } = useRestaurants()

  const items =
    fromApi.length > 0
      ? fromApi.map(outletToLandingItem)
      : DEFAULT_RESTAURANTS

  return (
    <div className="resto-landing__grid">
      {items.map((restaurant, index) => {
        const variant = BG_VARIANTS[index % BG_VARIANTS.length]
        return (
          <article
            key={restaurant.id ?? restaurant.name}
            className={`resto-landing-card resto-landing-card--${variant}`}
          >
            <div className="resto-landing-card__media">
              <img
                src={restaurant.image || FALLBACK_IMAGE}
                alt={restaurant.name}
                loading="lazy"
              />
            </div>
            <div className="resto-landing-card__body">
              <span className="resto-landing-card__label">Restaurant</span>
              <h3 className="resto-landing-card__name">{restaurant.name}</h3>
              {restaurant.description && (
                <p className="resto-landing-card__desc">{restaurant.description}</p>
              )}
              <Link
                to={`/restaurants/${restaurantSlug(restaurant.name)}`}
                className="resto-landing-card__cta"
              >
                En savoir plus
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}
