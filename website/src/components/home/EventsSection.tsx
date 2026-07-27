import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import EditableText from '../../cms/EditableText'
import EditableImage from '../../cms/EditableImage'
import { useContent } from '../../cms/ContentProvider'
import { useEditMode } from '../../cms/EditModeProvider'
import { useCarousel } from '../../hooks/useCarousel'
import { HOME_DEFAULTS } from '../../cms/defaults/home'
import '../../styles/events.css'

const PAGE = 'home'

const ASSETS = {
  shapeBg: '/imgs/Bg.svg',
  frame: '/imgs/Vector (7).svg',
  badge: '/imgs/Ellipse 132.svg',
  arrowPrev: '/imgs/right-arrow 1.svg',
  arrowNext: '/imgs/Vector (4).png',
  banner: '/imgs/bannerevent.svg',
} as const

const GALLERY_SLUG = 'reunions-evenements'

export default function EventsSection() {
  const { t } = useTranslation()
  const { get } = useContent()
  const { isEditMode } = useEditMode()
  const { items: galleryItems } = useCarousel(GALLERY_SLUG)
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  const cmsImage = get('events.image', HOME_DEFAULTS['events.image'] ?? '')
  const useGallery = galleryItems.length > 0

  const slides = useMemo(() => {
    if (useGallery) {
      return galleryItems.map(item => item.image_url).filter(Boolean)
    }
    if (cmsImage) return [cmsImage]
    return []
  }, [galleryItems, cmsImage, useGallery])

  const slideCount = slides.length
  const showArrows = useGallery && slideCount > 1 && !isEditMode

  const prev = useCallback(() => {
    setDirection('prev')
    setCurrent(c => (slideCount > 0 ? (c - 1 + slideCount) % slideCount : 0))
  }, [slideCount])

  const next = useCallback(() => {
    setDirection('next')
    setCurrent(c => (slideCount > 0 ? (c + 1) % slideCount : 0))
  }, [slideCount])

  useEffect(() => {
    if (slideCount > 0 && current >= slideCount) setCurrent(0)
  }, [current, slideCount])

  return (
    <section className=" events" data-cms-section="events">
      <div className="events__main">
      <div className="events__grid">
        <div className="events__visual">
          <div
            className="events__photo-wrap"
            data-direction={showArrows ? direction : undefined}
          >
            <img
              src={ASSETS.shapeBg}
              alt=""
              className="events__shape-bg"
              aria-hidden="true"
            />
            <div className="events__photo-stage">
            {isEditMode ? (
              <EditableImage
                page={PAGE}
                blockKey="events.image"
                className="events__photo events__photo--active"
                alt="Réunions & Événements"
                label="Événements — Image"
              />
            ) : useGallery && slideCount > 0 ? (
              slides.map((src, i) => (
                <img
                  key={`${src}-${i}`}
                  src={src}
                  alt={galleryItems[i]?.image_alt ?? galleryItems[i]?.title ?? 'Réunions & Événements'}
                  className={`events__photo${i === current ? ' events__photo--active' : ''}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              ))
            ) : slideCount > 0 ? (
              <img
                src={slides[0]}
                alt="Réunions & Événements"
                className="events__photo events__photo--active"
                loading="eager"
              />
            ) : (
              <div className="events__photo events__photo--active events__photo--fallback" />
            )}
            </div>
            {showArrows && (
              <>
                <button
                  type="button"
                  className="events__nav events__nav--prev"
                  onClick={prev}
                  aria-label="Image précédente"
                >
                  <img src={ASSETS.arrowPrev} alt="" />
                </button>
                <button
                  type="button"
                  className="events__nav events__nav--next"
                  onClick={next}
                  aria-label="Image suivante"
                >
                  <img src={ASSETS.arrowNext} alt="" />
                </button>
              </>
            )}
            <img
              src={ASSETS.frame}
              alt=""
              className="events__frame"
              aria-hidden="true"
            />
            <img
              src={ASSETS.badge}
              alt=""
              className="events__badge"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="events__content">
          <div className="eyebrow"><span>{t('home.eventsEyebrow')}</span></div>
          <EditableText
            page={PAGE}
            blockKey="events.title"
            as="h2"
            className="events__title"
            fallback={t('home.eventsTitle')}
            label="Événements — Titre"
          />
          <EditableText
            page={PAGE}
            blockKey="events.desc"
            as="p"
            className="events__text"
            multiline
            label="Événements — Description"
          />
          <a href="/seminaire" className="events__cta">
            <span className="events__cta-label">{t('home.eventsCta')}</span>
            <span className="events__cta-icon" aria-hidden="true">
              <img src="/imgs/calendar 5.svg" alt="" />
            </span>
          </a>
        </div>
      </div>
      </div>
      <div className="events__banner">
        <img
          src={ASSETS.banner}
          alt="Golden Carthage Hotel & Residence — Tunis"
          loading="lazy"
        />
      </div>
    </section>
  )
}
