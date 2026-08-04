import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import EditableText from '../../cms/EditableText'
import { useContent } from '../../cms/ContentProvider'
import { useReviews } from '../../hooks/useReviews'
import type { Review as ApiReview } from '../../types/api'
import '../../styles/testimonials.css'

const PAGE = 'home'
const ROTATE_MS = 5000
const SLIDE_MS = 800

const ASSETS = {
  quote: '/imgs/mainrev.svg',
  arrow: '/imgs/right-arrow 2.svg',
} as const

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
    <div className={`review-card__stars review-card__stars--${size}`} aria-label="5 sur 5">
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

function ReviewCard({
  review,
  variant,
}: {
  review: Review
  variant: 'featured' | 'secondary'
}) {
  const platform = inferPlatform(review.origin, review.platform)

  return (
    <article className={`review-card review-card--${variant}`}>
      <div className="review-card__inner">
        <div className="review-card__layout">
          <span className="review-card__quote-circle" aria-hidden="true">
            <img src={ASSETS.quote} alt="" />
          </span>
          <img src={review.avatar} alt="" className="review-card__avatar" loading="lazy" />

          <div className="review-card__content">
            <div className="review-card__content-head">
              <div className="review-card__meta">
                <h3 className="review-card__name">{review.name}</h3>
                <p className="review-card__origin">{review.origin}</p>
              </div>
              <StarRow />
            </div>

            <p className="review-card__text">{review.text}</p>

            {platform && (
              <div className="review-card__source">
                <span className="review-card__platform-icon">
                  <PlatformIcon platform={platform} />
                </span>
                <div className="review-card__source-meta">
                  <StarRow size="sm" />
                  <span className="review-card__source-label">Reviews</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export default function TestimonialsSection({ variant = 'default' }: { variant?: 'default' | 'maroon' }) {
  const { getJson } = useContent()
  const { reviews: apiReviews } = useReviews()
  const cmsReviews = getJson<Review[]>('testimonials.reviews', DEFAULT)
  const reviews = useMemo(() => {
    if (apiReviews.length > 0) return apiReviews.map(mapApiReview)
    return cmsReviews
  }, [apiReviews, cmsReviews])
  const count = reviews.length

  const [step, setStep] = useState(0)
  const [instant, setInstant] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const chain = useMemo(() => {
    if (count < 2) return reviews
    return [...reviews, ...reviews]
  }, [reviews, count])

  useEffect(() => {
    setStep(0)
  }, [count])

  const resetAutoTimer = useCallback(() => {
    if (count <= 1) return
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    intervalRef.current = window.setInterval(() => setStep(s => s + 1), ROTATE_MS)
  }, [count])

  const goNext = useCallback(() => {
    if (count <= 1) return
    setStep(s => s + 1)
    resetAutoTimer()
  }, [count, resetAutoTimer])

  useEffect(() => {
    resetAutoTimer()
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    }
  }, [resetAutoTimer])

  useEffect(() => {
    if (count <= 1) return
    if (step >= count) {
      const t = window.setTimeout(() => {
        setInstant(true)
        setStep(0)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setInstant(false))
        })
      }, SLIDE_MS)
      return () => window.clearTimeout(t)
    }
  }, [step, count])

  if (!count) return null

  return (
    <section
      className={`testimonials${variant === 'maroon' ? ' testimonials--maroon' : ''}`}
      aria-label="Avis clients"
      data-cms-section="testimonials"
    >
      <div className="testimonials__main">
        <div className="testimonials__intro">
          <EditableText
            page={PAGE}
            blockKey="testimonials.title"
            as="h2"
            className="testimonials__title"
            label="Avis — Titre"
          />
          <EditableText
            page={PAGE}
            blockKey="testimonials.subtitle"
            as="p"
            className="testimonials__sub"
            multiline
            label="Avis — Sous-titre"
          />
        </div>

        <div className="testimonials__stage">
          <div className="testimonials__display">
            <div className="testimonials__calques" aria-hidden="true">
              <div className="testimonials__calque testimonials__calque--outer" />
              <div className="testimonials__calque testimonials__calque--inner" />
            </div>

            <div className="testimonials__viewport">
              <div
                className={`testimonials__track${instant ? ' testimonials__track--instant' : ''}`}
                style={{ transform: `translate3d(0, calc(-1 * ${step} * var(--review-slot-h)), 0)` }}
              >
                {chain.map((review, i) => {
                  const isVisible = i === step || i === step + 1
                  if (!isVisible) {
                    return <div key={`slot-${i}`} className="testimonials__slot" aria-hidden="true" />
                  }
                  const variant = i === step ? 'featured' as const : 'secondary' as const
                  return (
                    <div key={`slot-${i}-${review.name}`} className="testimonials__slot">
                      <ReviewCard review={review} variant={variant} />
                    </div>
                  )
                })}
              </div>
            </div>

            {count > 1 && (
              <div className="testimonials__nav">
                <button
                  type="button"
                  className="testimonials__nav-btn"
                  onClick={goNext}
                  aria-label="Avis suivant"
                >
                  <img src={ASSETS.arrow} alt="" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
