import { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRoomCategories } from '../../hooks/useRoomCategories'
import FeaturedRoomCard from '../rooms/FeaturedRoomCard'
import EditableText from '../../cms/EditableText'
import type { AccommodationDisplayKind } from '../../lib/accommodationKind'
import { filterByAccommodationKind } from '../../lib/accommodationKind'
import type { RoomCategory } from '../../types/api'
import { categoryCover } from '../../lib/roomCategory'
import { preloadImages } from '../../lib/dataCache'
import { IMG } from '../../lib/localImages'
import '../../styles/featured-rooms.css'

const PAGE = 'home'

const VISIBLE = 3

const FALLBACK_CHAMBRES: RoomCategory[] = [
  {
    id: 1,
    name: 'Chambre Double',
    category: 'STANDARD',
    accommodation_type: 'ROOM',
    room_count: 5,
    suite_count: 0,
    description: 'Un tout petit descriptif pour la chambre standard.',
    media: [{ id: 1, url: IMG.g1, is_cover: true }],
  },
  {
    id: 2,
    name: 'Chambre Supérieure',
    category: 'SUPERIOR',
    accommodation_type: 'ROOM',
    room_count: 5,
    suite_count: 0,
    description: 'Chambre spacieuse avec vue partielle sur mer.',
    media: [{ id: 2, url: IMG.g4, is_cover: true }],
  },
  {
    id: 3,
    name: 'Deluxe Vue Mer',
    category: 'DELUXE',
    accommodation_type: 'ROOM',
    room_count: 4,
    suite_count: 1,
    description: 'Chambre luxueuse avec vue panoramique sur la Méditerranée.',
    media: [{ id: 3, url: IMG.g3, is_cover: true }],
  },
]

const FALLBACK_SUITES: RoomCategory[] = [
  {
    id: 4,
    name: 'Junior Suite',
    category: 'SUITE_JUNIOR',
    accommodation_type: 'ROOM',
    room_count: 0,
    suite_count: 4,
    description: 'Suite avec salon séparé et vue mer imprenable.',
    media: [{ id: 4, url: IMG.g2, is_cover: true }],
  },
  {
    id: 5,
    name: 'Suite Prestige',
    category: 'SUITE',
    accommodation_type: 'ROOM',
    room_count: 0,
    suite_count: 3,
    description: 'Suite de luxe avec salon et terrasse panoramique.',
    media: [{ id: 5, url: IMG.g6, is_cover: true }],
  },
  {
    id: 6,
    name: 'Suite Présidentielle',
    category: 'PRESIDENTIAL',
    accommodation_type: 'ROOM',
    room_count: 0,
    suite_count: 1,
    description: 'La suite la plus exclusive — 220 m² avec terrasse privée.',
    media: [{ id: 6, url: IMG.g7, is_cover: true }],
  },
]

const FALLBACK_ALL: RoomCategory[] = [
  ...FALLBACK_CHAMBRES,
  ...FALLBACK_SUITES,
  {
    id: 101,
    name: 'Appart Studio',
    category: 'STANDARD',
    accommodation_type: 'APARTMENT',
    description: 'Studio équipé avec kitchenette, idéal pour les séjours prolongés.',
    media: [{ id: 101, url: IMG.g5, is_cover: true }],
  },
  {
    id: 102,
    name: 'Appart 2 Chambres',
    category: 'DELUXE',
    accommodation_type: 'APARTMENT',
    description: 'Appartement spacieux avec salon et vue mer partielle.',
    media: [{ id: 102, url: IMG.g6, is_cover: true }],
  },
]

function detailPathFor(category: RoomCategory): string | undefined {
  if (category.accommodation_type === 'APARTMENT') {
    return `/appartements/${category.id}/fiche`
  }
  return undefined
}

function coverUrls(categories: RoomCategory[]): string[] {
  return categories.map(c => categoryCover(c, '')).filter(Boolean)
}

interface Props {
  showHeader?: boolean
  sectionClassName?: string
  accommodationKind?: AccommodationDisplayKind
}

export default function FeaturedRoomsSection({
  showHeader = true,
  sectionClassName = '',
  accommodationKind,
}: Props) {
  const { t } = useTranslation()
  const { categories: roomCategories, loading: loadingRooms } = useRoomCategories('ROOM')
  const { categories: apartmentCategories, loading: loadingApartments } = useRoomCategories('APARTMENT')
  const [offset, setOffset] = useState(0)
  const [direction, setDirection] = useState<'prev' | 'next'>('next')
  const [hasSlid, setHasSlid] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const categories = useMemo(
    () => (accommodationKind ? roomCategories : [...roomCategories, ...apartmentCategories]),
    [roomCategories, apartmentCategories, accommodationKind],
  )
  const loading = accommodationKind ? loadingRooms : loadingRooms || loadingApartments

  const fallback = accommodationKind === 'chambre'
    ? FALLBACK_CHAMBRES
    : accommodationKind === 'suite'
      ? FALLBACK_SUITES
      : FALLBACK_ALL

  const allCategories = useMemo((): RoomCategory[] => {
    const source = categories.length > 0 ? categories : fallback
    return accommodationKind ? filterByAccommodationKind(source, accommodationKind) : source
  }, [categories, fallback, accommodationKind])

  const count = allCategories.length
  const canSlide = count > VISIBLE

  const visibleCards = useMemo(() => {
    if (count <= VISIBLE) return allCategories
    return Array.from({ length: VISIBLE }, (_, i) => allCategories[(offset + i) % count])
  }, [allCategories, offset, count])

  useEffect(() => {
    preloadImages(coverUrls(allCategories))
  }, [allCategories])

  useEffect(() => {
    if (count <= VISIBLE) return
    const ahead = Array.from({ length: VISIBLE }, (_, i) =>
      categoryCover(allCategories[(offset + VISIBLE + i) % count], ''),
    )
    const behind = Array.from({ length: VISIBLE }, (_, i) =>
      categoryCover(allCategories[(offset - 1 - i + count) % count], ''),
    )
    preloadImages([...ahead, ...behind].filter(Boolean))
  }, [offset, allCategories, count])

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

  return (
    <section className={`section section--maroon featured-rooms${sectionClassName ? ` ${sectionClassName}` : ''}`} data-cms-section="rooms">
      <div className="container">
        {showHeader && (
        <header className="featured-rooms__header">
          <EditableText
            page={PAGE}
            blockKey="rooms.title"
            as="h2"
            className="featured-rooms__title"
            fallback={t('home.roomsTitle')}
            label="Chambres — Titre"
          />
          <EditableText
            page={PAGE}
            blockKey="rooms.desc"
            as="p"
            className="featured-rooms__desc"
            multiline
            fallback={t('home.roomsDesc')}
            label="Chambres — Description"
          />
        </header>
        )}

        {loading && categories.length === 0 ? (
          <div className="featured-rooms__loading">
            <div className="chambres-spinner" />
          </div>
        ) : (
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
                  <FeaturedRoomCard key={cat.id} category={cat} detailPath={detailPathFor(cat)} />
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
        )}
      </div>
    </section>
  )
}
