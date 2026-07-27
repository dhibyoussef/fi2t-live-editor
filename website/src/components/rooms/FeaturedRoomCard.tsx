import { Link } from 'react-router-dom'
import type { RoomCategory } from '../../types/api'
import { categoryCover, hasRoomDiscount } from '../../lib/roomCategory'
import { IMG } from '../../lib/localImages'

interface Props {
  category: RoomCategory
  detailPath?: string
  stayQuery?: string
}

const FALLBACK_IMG = IMG.landingRoom

export default function FeaturedRoomCard({ category, detailPath, stayQuery }: Props) {
  const cover = category.media?.find(m => m.is_cover) ?? category.media?.[0]
  const image = categoryCover(category, FALLBACK_IMG)
  const alt = cover?.alt_text || category.name
  const desc = category.description || 'Un tout petit descriptif pour ce type de chambre.'
  const discount = category.discount_percent ?? 0
  const hasDiscount = hasRoomDiscount(discount)

  return (
    <article className="featured-room-card">
      <div className="featured-room-card__media-wrap">
        <div className="featured-room-card__media">
          <img src={image} alt={alt} loading="eager" decoding="async" />
          {hasDiscount && (
            <div className="featured-room-card__promo">
              <span className="featured-room-card__discount">{discount}% Off</span>
              <span className="featured-room-card__promo-label">En Promo</span>
            </div>
          )}
          <div className="featured-room-card__media-actions" aria-label="Actions média">
            <button
              type="button"
              className="featured-room-card__icon-btn featured-room-card__icon-btn--favorite"
              aria-label="Ajouter aux favoris"
            >
              <img src="/imgs/Heart.svg" alt="" aria-hidden="true" />
            </button>
            <span className="featured-room-card__action-line" aria-hidden="true" />
            <button type="button" className="featured-room-card__icon-btn" aria-label="Voir la vidéo">
              <img src="/imgs/video-camera.svg" alt="" aria-hidden="true" />
            </button>
            <span className="featured-room-card__action-line" aria-hidden="true" />
            <button type="button" className="featured-room-card__icon-btn" aria-label="Voir les photos">
              <img src="/imgs/photo-camera.svg" alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="featured-room-card__body">
        <div className="featured-room-card__stars" aria-label="5 étoiles">
          {Array.from({ length: 5 }).map((_, i) => (
            <i key={i} className="fa-solid fa-star" />
          ))}
        </div>
        <h3 className="featured-room-card__title">{category.name}</h3>
        <p className="featured-room-card__desc">{desc}</p>
        <Link
          to={`${detailPath ?? `/chambres/${category.id}/fiche`}${stayQuery ? `?${stayQuery}` : ''}`}
          className="featured-room-card__cta"
        >
          <span className="featured-room-card__cta-label">Découvrir</span>
          <span className="featured-room-card__cta-arrow">
            <i className="fa-solid fa-arrow-right" />
          </span>
        </Link>
      </div>
    </article>
  )
}
