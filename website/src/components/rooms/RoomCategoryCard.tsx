import { Link } from 'react-router-dom'
import type { RoomCategory } from '../../types/api'
import { categoryCover, categoryLabel, capacityLabel, formatPrice, inventoryLabel } from '../../lib/roomCategory'
import { IMG } from '../../lib/localImages'

interface Props {
  category: RoomCategory
  variant?: 'carousel' | 'grid'
  active?: boolean
  onClick?: () => void
}

const FALLBACK_IMG = IMG.landingRoom

export default function RoomCategoryCard({ category, variant = 'grid', active, onClick }: Props) {
  const cover = category.media?.find(m => m.is_cover) ?? category.media?.[0]
  const image = categoryCover(category, FALLBACK_IMG)
  const alt = cover?.alt_text || category.name
  const price = formatPrice(category.price_from)
  const inventory = inventoryLabel(category.room_count ?? 0, category.suite_count ?? 0)
  const capacity = capacityLabel(category.max_adults ?? 0, category.max_children ?? 0)
  const amenities = category.amenities ?? []

  return (
    <article
      className={`room-card${variant === 'carousel' && active ? ' room-card--active' : ''}${variant === 'grid' ? ' room-card--grid' : ''}`}
      onClick={onClick}
      id={`room-${category.id}`}
    >
      <div className="room-card__img">
        <img src={image} alt={alt} loading="lazy" />
        <span className="room-card__badge">{categoryLabel(category.category)}</span>
        {category.surface_m2 ? (
          <span className="room-card__surface">{category.surface_m2} m²</span>
        ) : null}
      </div>
      <div className="room-card__body">
        <h3 className="room-card__name">{category.name}</h3>
        <p className="room-card__desc">{category.description || 'Découvrez ce type de chambre.'}</p>
        <div className="room-card__meta">
          {inventory && <span><i className="fa-solid fa-bed" /> {inventory}</span>}
          {capacity && <span><i className="fa-solid fa-user-group" /> {capacity}</span>}
          {price && <span className="room-card__price">À partir de {price}</span>}
        </div>
        {amenities.length > 0 && (
          <ul className="room-card__amenities">
            {amenities.slice(0, 5).map(a => (
              <li key={a.id}>{a.name}</li>
            ))}
            {amenities.length > 5 && (
              <li className="room-card__amenities-more">+{amenities.length - 5}</li>
            )}
          </ul>
        )}
        <Link
          to={`/chambres/${category.id}/fiche`}
          className="room-card__cta"
          onClick={e => e.stopPropagation()}
        >
          Découvrir <i className="fa-solid fa-arrow-right" />
        </Link>
      </div>
    </article>
  )
}
