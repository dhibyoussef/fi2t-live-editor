import { useState, useMemo, useRef, useEffect } from 'react'
import { useRoomCategories } from '../../hooks/useRoomCategories'
import FeaturedRoomCard from '../rooms/FeaturedRoomCard'
import BookingBar, { type BookingBarDefaults } from '../home/BookingBar'
import { filterAndSortRooms } from '../reservation/HebRoomFilters'
import type { RoomCategory } from '../../types/api'
import { categoryCover } from '../../lib/roomCategory'
import { preloadImages } from '../../lib/dataCache'
import { IMG } from '../../lib/localImages'
import '../../styles/featured-rooms.css'
import '../../styles/hebergement-reservation.css'

const VISIBLE = 3

const FALLBACK_CATEGORIES: RoomCategory[] = [
  {
    id: 101,
    name: 'Appart Studio',
    category: 'STANDARD',
    accommodation_type: 'APARTMENT',
    description: 'Studio équipé avec kitchenette, idéal pour les séjours prolongés.',
    media: [{ id: 1, url: IMG.g5, is_cover: true }],
  },
  {
    id: 102,
    name: 'Appart 2 Chambres',
    category: 'DELUXE',
    accommodation_type: 'APARTMENT',
    description: 'Appartement spacieux avec salon et vue mer partielle.',
    media: [{ id: 2, url: IMG.g6, is_cover: true }],
  },
]

function coverUrls(categories: RoomCategory[]): string[] {
  return categories.map(c => categoryCover(c, '')).filter(Boolean)
}

interface Props {
  bookingDefaults?: BookingBarDefaults
  stayQuery?: string
}

export default function ApartmentLandingPick({ bookingDefaults, stayQuery }: Props) {
  const { categories, loading } = useRoomCategories('APARTMENT')
  const [offset, setOffset] = useState(0)
  const [direction, setDirection] = useState<'prev' | 'next'>('next')
  const [hasSlid, setHasSlid] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const allCategories = useMemo(
    (): RoomCategory[] => (categories.length > 0 ? categories : FALLBACK_CATEGORIES),
    [categories],
  )

  const filtered = useMemo(
    () => filterAndSortRooms(allCategories, 'asc'),
    [allCategories],
  )

  const count = filtered.length
  const canSlide = count > VISIBLE

  const visibleCards = useMemo(() => {
    if (count <= VISIBLE) return filtered
    return Array.from({ length: VISIBLE }, (_, i) => filtered[(offset + i) % count])
  }, [filtered, offset, count])

  useEffect(() => {
    preloadImages(coverUrls(allCategories))
  }, [allCategories])

  useEffect(() => {
    if (count <= VISIBLE) return
    const ahead = Array.from({ length: VISIBLE }, (_, i) =>
      categoryCover(filtered[(offset + VISIBLE + i) % count], ''),
    )
    const behind = Array.from({ length: VISIBLE }, (_, i) =>
      categoryCover(filtered[(offset - 1 - i + count) % count], ''),
    )
    preloadImages([...ahead, ...behind].filter(Boolean))
  }, [offset, filtered, count])

  useEffect(() => {
    if (!hasSlid || !gridRef.current) return
    const el = gridRef.current
    el.classList.remove('featured-rooms__grid--next', 'featured-rooms__grid--prev')
    void el.offsetWidth
    el.classList.add(`featured-rooms__grid--${direction}`)
  }, [offset, direction, hasSlid])

  const prev = () => {
    setDirection('prev')
    setHasSlid(true)
    setOffset(o => (o - 1 + count) % count)
  }
  const next = () => {
    setDirection('next')
    setHasSlid(true)
    setOffset(o => (o + 1) % count)
  }

  const apartmentPath = (id: number) => `/appartements/${id}/fiche`

  return (
    <section className="apt-landing-pick">
      <div className="apt-landing-pick__head container">
        <header className="heb-res-head apt-landing-pick__toolbar">
          <h2 className="apt-landing-pick__title">Choisir un Appartement</h2>
          <div className="heb-res-head__right apt-landing-pick__filters">
           
          </div>
        </header>
        <BookingBar defaults={bookingDefaults} />
      </div>

      {loading && categories.length === 0 ? (
        <div className="featured-rooms__loading">
          <div className="chambres-spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="apt-landing-pick__empty container">Aucun appartement ne correspond à ce filtre.</p>
      ) : (
        <div className="container">
          <div className="featured-rooms featured-rooms--landing apt-landing-pick__carousel">
            <div className="featured-rooms__carousel">
              <button
                type="button"
                className="featured-rooms__arrow featured-rooms__arrow--prev"
                onClick={prev}
                disabled={!canSlide}
                aria-label="Précédent"
              >
                <i className="fa-solid fa-chevron-left" />
              </button>

              <div className="featured-rooms__viewport">
                <div ref={gridRef} className="featured-rooms__grid">
                  {visibleCards.map(cat => (
                    <FeaturedRoomCard
                      key={cat.id}
                      category={cat}
                      detailPath={apartmentPath(cat.id)}
                      stayQuery={stayQuery}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="featured-rooms__arrow featured-rooms__arrow--next"
                onClick={next}
                disabled={!canSlide}
                aria-label="Suivant"
              >
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
