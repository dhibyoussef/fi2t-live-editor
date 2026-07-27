import { useTranslation } from 'react-i18next'
import { useState, useEffect, useCallback, useRef } from 'react'
import SiteHeader from '../layout/SiteHeader'
import BookingBar from './BookingBar'
import EditableText from '../../cms/EditableText'
import { useEditMode } from '../../cms/EditModeProvider'
import { useContent, useContentBlock } from '../../cms/ContentProvider'
import { useCarousel } from '../../hooks/useCarousel'
import { preloadImages } from '../../lib/dataCache'
import { HOME_DEFAULTS } from '../../cms/defaults/home'
import {
  carouselSlideUrls,
  cmsFallbackSlides,
  getInitialHeroSlides,
  normalizeSlideUrl,
  preloadSlide,
  slideListsEqual,
  HERO_SLIDE_KEYS,
} from '../../lib/heroSlides'
import api from '../../api/client'
import '../../styles/hero.css'

const PAGE = 'home'

export default function HeroSection() {
  const { t } = useTranslation()
  const { get } = useContent()
  const { isEditMode } = useEditMode()
  const { items: carouselItems, loading: carouselLoading } = useCarousel('home-hero')
  const [slides, setSlides] = useState(getInitialHeroSlides)
  const [current, setCurrent] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const slidesRef = useRef(slides)
  slidesRef.current = slides

  const slideCount = Math.max(slides.length, 1)
  const activeItem = carouselItems[current]

  const next = useCallback(
    () => setCurrent(c => (c + 1) % slideCount),
    [slideCount],
  )

  useEffect(() => {
    if (slideCount <= 1) return
    const timer = setInterval(next, 7000)
    return () => clearInterval(timer)
  }, [next, slideCount])

  useEffect(() => {
    if (current >= slideCount) setCurrent(0)
  }, [current, slideCount])

  useEffect(() => {
    if (slides.length) preloadImages(slides)
  }, [slides])

  // Resolve slides when carousel API finishes — avoid CMS → carousel flash on load
  useEffect(() => {
    if (carouselLoading) return

    const fromCarousel = carouselSlideUrls(carouselItems)
    const fromCms = cmsFallbackSlides(get)
    const nextSlides = fromCarousel.length > 0 ? fromCarousel : fromCms

    if (!nextSlides.length) return
    if (slideListsEqual(slidesRef.current, nextSlides)) return

    let cancelled = false

    preloadSlide(nextSlides[0]).then(() => {
      if (cancelled) return
      setSlides(prev => (slideListsEqual(prev, nextSlides) ? prev : nextSlides))
    })

    return () => {
      cancelled = true
    }
  }, [carouselLoading, carouselItems, get])

  return (
    <section className="hero" data-cms-section="hero">
      {slides.length > 0 ? (
        slides.map((img, i) => (
          <div
            key={normalizeSlideUrl(img)}
            className={`hero__slide${i === current ? ' hero__slide--active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))
      ) : (
        <div className="hero__slide hero__slide--active hero__slide--fallback" />
      )}

      <div
        className="hero__overlay"
        style={{
          background: activeItem?.overlay_opacity != null
            ? `rgba(0, 0, 0, ${activeItem.overlay_opacity / 100})`
            : undefined,
        }}
      />

      <SiteHeader variant="hero" />

      <div className="container hero__body">
        <div className="hero__rating hero-animate">
          <div className="stars" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <i key={i} className="fa-solid fa-star" />
            ))}
          </div>
          <EditableText
            page={PAGE}
            blockKey="hero.rating"
            as="span"
            className="hero__rating-text"
            fallback={HOME_DEFAULTS['hero.rating'] || t('home.heroRating')}
            label="Hero — Sous-titre 5 étoiles"
          />
        </div>

        <div className="hero__title-block hero-animate hero-animate--delay-1">
          <EditableText
            page={PAGE}
            blockKey="hero.headline"
            as="h1"
            className="hero__title"
            multiline
            fallback={HOME_DEFAULTS['hero.headline'] || t('home.heroHeadline')}
            label="Hero — Titre principal"
          />
        </div>

        <div className="hero__booking hero-animate hero-animate--delay-2">
          <BookingBar />
        </div>

        <EditableText
          page={PAGE}
          blockKey="hero.intro"
          as="p"
          className="hero__intro hero-animate hero-animate--delay-3"
          multiline
          fallback={HOME_DEFAULTS['hero.intro'] || t('home.heroIntro')}
          label="Hero — Introduction"
        />
      </div>

      {slideCount > 1 && (
        <div className="hero__dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero__dot${i === current ? ' active' : ''}`}
              onClick={() => {
                if (isEditMode && !carouselItems.length) fileRef.current?.click()
                else setCurrent(i)
              }}
              aria-label={isEditMode ? `Modifier slide ${i + 1}` : `Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {isEditMode && !carouselItems.length && (
        <SlideUploader slideKey={HERO_SLIDE_KEYS[current] ?? HERO_SLIDE_KEYS[0]} page={PAGE} fileRef={fileRef} />
      )}
    </section>
  )
}

function SlideUploader({
  slideKey, page, fileRef,
}: {
  slideKey: string
  page: string
  fileRef: React.RefObject<HTMLInputElement>
}) {
  const { update } = useContentBlock(page, slideKey, { type: 'image', label: `Hero — ${slideKey}` })

  return (
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      hidden
      onChange={async e => {
        const file = e.target.files?.[0]
        if (!file) return
        const form = new FormData()
        form.append('image', file)
        try {
          const { data } = await api.post('/admin/content/upload-image', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          update(data.url)
        } catch {
          alert('Erreur upload')
        }
        e.target.value = ''
      }}
    />
  )
}
