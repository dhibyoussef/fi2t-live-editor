import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import EditableText from '../../cms/EditableText'
import { useContent } from '../../cms/ContentProvider'
import { useSiteSettings } from '../../cms/SiteSettingsProvider'
import { useCarousel } from '../../hooks/useCarousel'
import '../../styles/gallery.css'

const PAGE = 'home'
const SLIDE_MS = 5000

const DEFAULT_PHOTOS = [
  { image: '/imgs/g1.jpg' },
  { image: '/imgs/g2.jpg' },
  { image: '/imgs/g3.jpg' },
  { image: '/imgs/g4.jpg' },
  { image: '/imgs/g5.jpg' },
]

export default function GallerySection() {
  const { t } = useTranslation()
  const { getJson } = useContent()
  const { get: getSetting } = useSiteSettings()
  const { items: galleryItems } = useCarousel('home-gallery')
  const instagramUrl = getSetting('settings.instagram_gallery_url', 'https://instagram.com')

  const cmsPhotos = getJson<{ image: string; alt?: string }[]>('gallery.photos', DEFAULT_PHOTOS)

  const photos = useMemo(() => {
    if (galleryItems.length > 0) {
      return galleryItems.map(item => ({
        image: item.image_url,
        alt: item.image_alt ?? item.title ?? '',
      }))
    }
    return cmsPhotos.map((p, i) => ({
      image: p.image,
      alt: p.alt ?? `Photo ${i + 1}`,
    }))
  }, [galleryItems, cmsPhotos])

  const [activeIndex, setActiveIndex] = useState(0)
  const [offsetX, setOffsetX] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  const measureOffset = useCallback((idx: number) => {
    const wrap = wrapRef.current
    const row = rowRef.current
    if (!wrap || !row || photos.length === 0) return 0

    const item = row.children[idx] as HTMLElement | undefined
    if (!item) return 0

    const maxScroll = row.scrollWidth - wrap.clientWidth
    if (maxScroll <= 0) return 0

    const centered = item.offsetLeft - (wrap.clientWidth - item.offsetWidth) / 2
    return Math.max(0, Math.min(centered, maxScroll))
  }, [photos.length])

  useEffect(() => {
    setActiveIndex(0)
  }, [photos.length])

  useEffect(() => {
    setOffsetX(measureOffset(activeIndex))
  }, [activeIndex, photos, measureOffset])

  useEffect(() => {
    const row = rowRef.current
    if (!row) return

    const sync = () => setOffsetX(measureOffset(activeIndex))
    sync()

    const imgs = row.querySelectorAll('img')
    imgs.forEach(img => img.addEventListener('load', sync))
    return () => imgs.forEach(img => img.removeEventListener('load', sync))
  }, [photos, activeIndex, measureOffset])

  useEffect(() => {
    const update = () => setOffsetX(measureOffset(activeIndex))
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [activeIndex, measureOffset])

  useEffect(() => {
    if (photos.length <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      setActiveIndex(i => (i + 1) % photos.length)
    }, SLIDE_MS)

    return () => window.clearInterval(id)
  }, [photos.length])

  return (
    <section className="gallery" aria-label="Golden Carthage en Photos" data-cms-section="gallery">
      <img
        src="/imgs/bgvictor.svg"
        alt=""
        className="gallery__calque"
        aria-hidden="true"
      />

      <div className="gallery__inner">
        <EditableText
          page={PAGE}
          blockKey="gallery.title"
          as="h2"
          className="gallery__title"
          fallback={t('home.galleryTitle')}
          label="Galerie — Titre"
        />

        <div className="gallery__row-wrap" ref={wrapRef}>
          <div
            className="gallery__row"
            ref={rowRef}
            style={{ transform: `translate3d(-${offsetX}px, 0, 0)` }}
          >
            {photos.map((p, i) => (
              <a
                key={`${p.image}-${i}`}
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`gallery__item${i === activeIndex ? ' gallery__item--active' : ''}`}
                aria-label={`${p.alt} — Instagram`}
              >
                <img src={p.image} alt={p.alt} loading="lazy" />
                <span className="gallery__overlay" aria-hidden="true">
                  <i className="fa-brands fa-instagram" />
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="gallery__cta">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="gallery__cta-btn btn-gold"
          >
            {t('home.galleryInstagram')}
          </a>
        </div>
      </div>
    </section>
  )
}
