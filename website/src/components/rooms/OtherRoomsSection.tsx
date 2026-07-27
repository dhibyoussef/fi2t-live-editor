import { useMemo, useRef, useState, useEffect } from 'react'
import FeaturedRoomCard from './FeaturedRoomCard'
import type { RoomCategory } from '../../types/api'
import '../../styles/featured-rooms.css'

const VISIBLE = 3

const OTHER_ROOMS_DESC =
  "Chambres, suites et résidences ont été conçues pour offrir une expérience fluide et élégante, entre confort, fonctionnalité et raffinement.\nLumière naturelle, volumes équilibrés et ouvertures sur la mer ou les espaces extérieurs créent une atmosphère propice au repos comme à la concentration.\nUne approche contemporaine de l'hospitalité, pensée pour s'adapter à chaque rythme de séjour."

interface Props {
  categories: RoomCategory[]
  currentId: number
  stayQuery?: string
  sectionTitle?: string
  sectionDesc?: string
  detailPath?: (id: number) => string
}

export default function OtherRoomsSection({
  categories,
  currentId,
  stayQuery,
  sectionTitle = 'Autres chambres',
  sectionDesc = OTHER_ROOMS_DESC,
  detailPath,
}: Props) {
  const others = useMemo(
    () => categories.filter(c => c.id !== currentId),
    [categories, currentId],
  )
  const [offset, setOffset] = useState(0)
  const [direction, setDirection] = useState<'prev' | 'next'>('next')
  const [hasSlid, setHasSlid] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const count = others.length
  const canSlide = count > VISIBLE

  const visible = useMemo(() => {
    if (count <= VISIBLE) return others
    return Array.from({ length: VISIBLE }, (_, i) => others[(offset + i) % count])
  }, [others, offset, count])

  useEffect(() => {
    setOffset(0)
  }, [currentId])

  useEffect(() => {
    if (!hasSlid || !gridRef.current) return
    const el = gridRef.current
    el.classList.remove('featured-rooms__grid--next', 'featured-rooms__grid--prev')
    void el.offsetWidth
    el.classList.add(`featured-rooms__grid--${direction}`)
  }, [offset, direction, hasSlid])

  if (others.length === 0) return null

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
    <section className="room-fiche-others" aria-label={sectionTitle}>
      <div className="container">
        <header className="room-fiche-others__head">
          <h2 className="room-fiche-others__title">{sectionTitle}</h2>
          <p className="room-fiche-others__desc">{sectionDesc}</p>
        </header>

        <div className="featured-rooms__carousel room-fiche-others__carousel">
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
              {visible.map(cat => (
                <FeaturedRoomCard
                  key={cat.id}
                  category={cat}
                  detailPath={detailPath?.(cat.id)}
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
    </section>
  )
}
