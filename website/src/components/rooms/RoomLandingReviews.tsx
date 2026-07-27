import { useCallback, useMemo, useState } from 'react'
import { useReviews } from '../../hooks/useReviews'
import EditableText from '../../cms/EditableText'
import type { Review as ApiReview } from '../../types/api'
import '../../styles/room-landing.css'

const PAGE_DEFAULT = 'chambres'

const ASSETS = {
  quote: '/imgs/mainrev.svg',
  arrow: '/imgs/right-arrow 2.svg',
} as const

const VISIBLE_COUNT = 4

type Platform = 'google' | 'tripadvisor'

interface Review {
  text: string
  name: string
  origin: string
  avatar: string
  platform?: Platform
}

const DEFAULT: Review[] = [
  {
    text: 'Très bon accueil au check-in et check-out. Petit déjeuner dès 6h : très bien pour ceux qui ont un avion de bonne heure.',
    name: 'Dominique D.',
    origin: 'Belgique',
    avatar: 'https://i.pravatar.cc/128?img=1',
    platform: 'google',
  },
  {
    text: 'Un très bon hôtel à conseiller avec un superbe staff ! Un service à la clientèle qui est excellent.',
    name: 'Naim G.',
    origin: 'TripAdvisor',
    avatar: 'https://i.pravatar.cc/128?img=5',
    platform: 'tripadvisor',
  },
  {
    text: 'Chambres spacieuses, literie confortable et vue magnifique. Nous reviendrons sans hésiter.',
    name: 'Sophie M.',
    origin: 'France',
    avatar: 'https://i.pravatar.cc/128?img=9',
    platform: 'google',
  },
  {
    text: 'Excellent séjour pour notre séminaire : salles bien équipées et restauration de qualité.',
    name: 'Karim B.',
    origin: 'Tunisie',
    avatar: 'https://i.pravatar.cc/128?img=12',
    platform: 'tripadvisor',
  },
]

function mapApiReview(r: ApiReview): Review {
  return {
    text: r.text,
    name: r.author_name,
    origin: r.origin,
    avatar: r.avatar_url || 'https://i.pravatar.cc/128?img=1',
    platform: r.platform ?? undefined,
  }
}

function inferPlatform(origin: string, explicit?: Platform): Platform | null {
  if (explicit) return explicit
  const v = origin.toLowerCase()
  if (v.includes('google')) return 'google'
  if (v.includes('tripadvisor')) return 'tripadvisor'
  return null
}

function StarRow({ size = 'md' }: { size?: 'md' | 'sm' }) {
  return (
    <div className={`room-landing-reviews__stars room-landing-reviews__stars--${size}`} aria-label="5 sur 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <i key={i} className="fa-solid fa-star" aria-hidden="true" />
      ))}
    </div>
  )
}

function PlatformIcon({ platform }: { platform: Platform }) {
  return platform === 'google'
    ? <i className="fa-brands fa-google" aria-hidden="true" />
    : <i className="fa-brands fa-tripadvisor" aria-hidden="true" />
}

function ReviewCard({ review, variant }: { review: Review; variant: 'featured' | 'secondary' }) {
  const platform = inferPlatform(review.origin, review.platform)

  return (
    <article className={`room-landing-reviews__card room-landing-reviews__card--${variant}`}>
      <div className="room-landing-reviews__card-inner">
        <span className="room-landing-reviews__quote" aria-hidden="true">
          <img src={ASSETS.quote} alt="" />
        </span>
        <img src={review.avatar} alt="" className="room-landing-reviews__avatar" loading="lazy" />

        <div className="room-landing-reviews__content">
          <div className="room-landing-reviews__head">
            <div className="room-landing-reviews__meta">
              <h3 className="room-landing-reviews__name">{review.name}</h3>
              <p className="room-landing-reviews__origin">{review.origin}</p>
            </div>
            <StarRow />
          </div>

          <p className="room-landing-reviews__text">{review.text}</p>

          {platform && (
            <div className="room-landing-reviews__source">
              <span className="room-landing-reviews__platform-icon">
                <PlatformIcon platform={platform} />
              </span>
              <div className="room-landing-reviews__source-meta">
                <StarRow size="sm" />
                <span className="room-landing-reviews__source-label">Reviews</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function splitIntoColumns(items: Review[], columnCount = 2): Review[][] {
  const columns: Review[][] = Array.from({ length: columnCount }, () => [])
  const rowCount = Math.ceil(items.length / columnCount)
  for (let col = 0; col < columnCount; col++) {
    for (let row = 0; row < rowCount; row++) {
      const index = row * columnCount + col
      if (items[index]) columns[col].push(items[index])
    }
  }
  return columns.filter(col => col.length > 0)
}

export default function RoomLandingReviews({ page = PAGE_DEFAULT }: { page?: string }) {
  const { reviews: apiReviews } = useReviews()
  const [offset, setOffset] = useState(0)

  const allReviews = useMemo(() => {
    if (apiReviews.length > 0) return apiReviews.map(mapApiReview)
    return DEFAULT
  }, [apiReviews])

  const visibleReviews = useMemo(() => {
    const count = Math.min(VISIBLE_COUNT, allReviews.length)
    if (count === 0) return []
    return Array.from({ length: count }, (_, i) => allReviews[(offset + i) % allReviews.length])
  }, [allReviews, offset])

  const columns = useMemo(() => splitIntoColumns(visibleReviews, 2), [visibleReviews])

  const canScroll = allReviews.length > 1

  const goNext = useCallback(() => {
    if (!canScroll) return
    setOffset(o => (o + 1) % allReviews.length)
  }, [allReviews.length, canScroll])

  if (!allReviews.length) return null

  return (
    <section className="room-landing-reviews" aria-label="Avis & Réputation">
      <div className="room-landing-reviews__inner">
        <header className="room-landing-reviews__header">
          <EditableText
            page={page}
            blockKey="reviews.title"
            as="h2"
            className="room-landing-reviews__title"
            label="Avis — Titre"
          />
          <EditableText
            page={page}
            blockKey="reviews.subtitle"
            as="p"
            className="room-landing-reviews__sub"
            multiline
            label="Avis — Sous-titre"
          />
        </header>

        <div className="room-landing-reviews__stage">
          <div className="room-landing-reviews__columns">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="room-landing-reviews__column">
                <div className="room-landing-reviews__column-calques" aria-hidden="true">
                  <div className="room-landing-reviews__column-calque room-landing-reviews__column-calque--outer" />
                  <div className="room-landing-reviews__column-calque room-landing-reviews__column-calque--inner" />
                </div>
                <div className="room-landing-reviews__column-stack">
                  {column.map((review, rowIndex) => (
                    <ReviewCard
                      key={`${review.name}-${colIndex}-${rowIndex}-${offset}`}
                      review={review}
                      variant={rowIndex === 0 ? 'featured' : 'secondary'}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {canScroll && (
            <div className="room-landing-reviews__nav">
              <button
                type="button"
                className="room-landing-reviews__nav-btn"
                onClick={goNext}
                aria-label="Avis suivants"
              >
                <img src={ASSETS.arrow} alt="" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
