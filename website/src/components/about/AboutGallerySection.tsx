import { useMemo, useState } from 'react'
import { useCarousel } from '../../hooks/useCarousel'
import EditableText from '../../cms/EditableText'
import '../../styles/about-gallery.css'

const SLUG = 'about-us-gallery'
const PAGE = 'about'
const PAGE_SLOTS = new Set(['hero', 'photo-1', 'photo-2'])
const MOSAIC_SLOTS = ['1', '2', '3', '4', '5'] as const

const FALLBACK_PHOTOS = [
  '/imgs/aboutus/VaKKZo9WnQpSPTTq4Y7yl3vwnMMhqrdqBKUxcRGD.jpg',
  '/imgs/aboutus/7rXUeju6QOspHisvgMp63ltznlikwR7BLfBH63jv.jpg',
  '/imgs/aboutus/EAZUCKSmPsElbUsXokSXP9YTCtPVgV9f4qMVh56C.jpg',
  '/imgs/aboutus/9pNlA4uDvdWbpE2Hwi8Rakplrg01mm5xw4exDERp.jpg',
  '/imgs/aboutus/PlXIdLntxo4I1hdcipiVafOHqwJAuNyeV1dgTOUO.jpg',
]

type MosaicPhoto = { image: string; alt: string }

function buildMosaicPhotos(
  items: { layout?: string | null; image_url: string; image_alt?: string | null; title?: string | null }[],
): MosaicPhoto[] {
  const pool = items.filter(item => !PAGE_SLOTS.has(item.layout ?? ''))

  return MOSAIC_SLOTS.map((slot, index) => {
    const matched = items.find(item => item.layout === slot) ?? pool[index]
    const fallback = FALLBACK_PHOTOS[index] ?? FALLBACK_PHOTOS[0]

    if (!matched) {
      return { image: fallback, alt: `Golden Carthage — photo ${index + 1}` }
    }

    return {
      image: matched.image_url,
      alt: matched.image_alt ?? matched.title ?? `Golden Carthage — photo ${index + 1}`,
    }
  })
}

export default function AboutGallerySection() {
  const { items } = useCarousel(SLUG)
  const [expanded, setExpanded] = useState(false)

  const mosaicPhotos = useMemo(() => buildMosaicPhotos(items), [items])

  const extraPhotos = useMemo(
    () =>
      items
        .filter(item => !PAGE_SLOTS.has(item.layout ?? ''))
        .map(item => ({
          image: item.image_url,
          alt: item.image_alt ?? item.title ?? 'Golden Carthage',
        })),
    [items],
  )

  const allPhotos = useMemo(() => {
    const seen = new Set<string>()
    const merged: MosaicPhoto[] = []
    for (const photo of [...mosaicPhotos, ...extraPhotos]) {
      if (seen.has(photo.image)) continue
      seen.add(photo.image)
      merged.push(photo)
    }
    return merged
  }, [mosaicPhotos, extraPhotos])

  return (
    <section className="gallery-section-wrap" aria-labelledby="gallery-section-title">
      <div className="gallery-section-wrap__inner">
        <div className="gallery-section">
          <div className="gallery-section__left">
            <div className="gallery-section__text">
              <EditableText
                page={PAGE}
                blockKey="gallery.title"
                as="h2"
                className="gallery-section__title"
                multiline
                label="Galerie — Titre"
              />
              <EditableText
                page={PAGE}
                blockKey="gallery.desc"
                as="p"
                className="gallery-section__desc"
                multiline
                label="Galerie — Description"
              />
            </div>

            <div className="gallery-section__photos-left">
              <div className="gallery-section__stack">
                <img
                  className="gallery-section__img gallery-section__img--1"
                  src={mosaicPhotos[0].image}
                  alt={mosaicPhotos[0].alt}
                  loading="lazy"
                />
                <img
                  className="gallery-section__img gallery-section__img--2"
                  src={mosaicPhotos[1].image}
                  alt={mosaicPhotos[1].alt}
                  loading="lazy"
                />
              </div>
              <img
                className="gallery-section__img gallery-section__img--3"
                src={mosaicPhotos[2].image}
                alt={mosaicPhotos[2].alt}
                loading="lazy"
              />
            </div>
          </div>

          <div className="gallery-section__right">
            <button
              type="button"
              className="gallery-section__btn"
              onClick={() => setExpanded(open => !open)}
              aria-expanded={expanded}
            >
              <EditableText
                page={PAGE}
                blockKey="gallery.cta"
                as="span"
                label="Galerie — Bouton"
              />
            </button>

            <div className="gallery-section__photos-right">
              <img
                className="gallery-section__img gallery-section__img--4"
                src={mosaicPhotos[3].image}
                alt={mosaicPhotos[3].alt}
                loading="lazy"
              />
              <img
                className="gallery-section__img gallery-section__img--5"
                src={mosaicPhotos[4].image}
                alt={mosaicPhotos[4].alt}
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {expanded && allPhotos.length > 0 && (
          <div className="gallery-section__expanded" id="about-gallery-all">
            {allPhotos.map((photo, index) => (
              <figure key={`${photo.image}-${index}`} className="gallery-section__expanded-item">
                <img src={photo.image} alt={photo.alt} loading="lazy" />
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
