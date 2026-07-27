import { useMemo, useState } from 'react'
import type { RoomCategoryMedia } from '../../types/api'

import { IMG } from '../../lib/localImages'

const FALLBACK = IMG.landingRoom

interface Props {
  media?: RoomCategoryMedia[]
  alt: string
}

export default function RoomGallery({ media, alt }: Props) {
  const images = useMemo(() => {
    const urls = (media ?? []).map(m => m.url).filter(Boolean)
    return urls.length > 0 ? urls : [FALLBACK]
  }, [media])

  const [index, setIndex] = useState(0)
  const current = images[index] ?? images[0]
  const thumbs = images.slice(0, 3)

  const prev = () => setIndex(i => (i - 1 + images.length) % images.length)
  const next = () => setIndex(i => (i + 1) % images.length)

  return (
    <div className="room-fiche-gallery">
      <div className="room-fiche-gallery__main">
        <img src={current} alt={alt} className="room-fiche-gallery__hero" loading="eager" />
        {images.length > 1 && (
          <div className="room-fiche-gallery__nav">
            <button type="button" onClick={prev} aria-label="Photo précédente">
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
            <button type="button" onClick={next} aria-label="Photo suivante">
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className="room-fiche-gallery__thumbs" aria-label="Miniatures">
        {thumbs.map((url, i) => (
          <button
            key={`thumb-${i}-${url}`}
            type="button"
            className={`room-fiche-gallery__thumb${index === i ? ' active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Photo ${i + 1}`}
            aria-current={index === i}
          >
            <img src={url} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  )
}
