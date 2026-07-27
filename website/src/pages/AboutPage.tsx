import { useMemo } from 'react'
import SiteHeader from '../components/layout/SiteHeader'
import AboutGallerySection from '../components/about/AboutGallerySection'
import AboutTimelineSection from '../components/about/AboutTimelineSection'
import AboutAmbitionSection from '../components/about/AboutAmbitionSection'
import { ContentProvider } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditToolbar from '../cms/EditToolbar'
import { useCarousel } from '../hooks/useCarousel'
import '../styles/about-landing.css'

const ABOUT_GALLERY_SLUG = 'about-us-gallery'
const HERO_IMAGE_FALLBACK = '/imgs/aboutus/7MQC9logl5xRL4w4VUpSIaxpfjriJrWWMHTpgfA7.jpg'
const PHOTO_1 = '/imgs/aboutus/VweIs9D3Li9IJpX5EzrW2QbQILMlTJV527M3B82G.jpg'
const PHOTO_2 = '/imgs/aboutus/L2jjTYrddT2T260qadhayCcmX5LkwUuVSewaSNf0.jpg'

function imageByLayout(
  items: { layout?: string | null; image_url: string; image_alt?: string | null }[],
  layout: string,
  fallback: string,
) {
  return items.find(item => item.layout === layout)?.image_url ?? fallback
}

function AboutPageContent() {
  const { items } = useCarousel(ABOUT_GALLERY_SLUG)

  const heroImage = useMemo(
    () => imageByLayout(items, 'hero', HERO_IMAGE_FALLBACK),
    [items],
  )
  const photo1 = useMemo(
    () => imageByLayout(items, 'photo-1', PHOTO_1),
    [items],
  )
  const photo2 = useMemo(
    () => imageByLayout(items, 'photo-2', PHOTO_2),
    [items],
  )

  return (
    <>
      <section className="about-hero" aria-labelledby="about-hero-title">
        <img
          src={heroImage}
          alt="Golden Carthage — vue sur la Méditerranée depuis Gammarth"
          className="about-hero__bg"
          loading="eager"
        />
        <div className="about-hero__overlay" aria-hidden="true" />

        <SiteHeader variant="hero" />

        <div className="about-hero__stage">
          <div className="about-hero__content">
            <EditableText
              page="about"
              blockKey="hero.eyebrow"
              as="p"
              className="about-hero__eyebrow"
              label="Hero — Surtitre"
            />
            <EditableText
              page="about"
              blockKey="hero.title"
              as="h1"
              className="about-hero__title"
              label="Hero — Titre"
            />
          </div>

          <EditableText
            page="about"
            blockKey="hero.desc"
            as="p"
            className="about-hero__desc"
            multiline
            label="Hero — Description"
          />
        </div>
      </section>

      <section className="about-section" aria-labelledby="about-carthage-title">
        <div className="about-section__inner">
          <div className="about-section__photos">
            <img
              className="about-section__photo-1"
              src={photo1}
              alt="Intérieur Golden Carthage"
              loading="lazy"
            />
            <img
              className="about-section__photo-2"
              src={photo2}
              alt="Vue sur Carthage"
              loading="lazy"
            />
          </div>

          <div className="about-section__content">
            <EditableText
              page="about"
              blockKey="carthage.title"
              as="h2"
              className="about-section__title"
              label="Carthage — Titre"
            />
            <div className="about-section__body">
              <EditableText page="about" blockKey="carthage.p1" as="p" label="Carthage — Paragraphe 1" multiline />
              <EditableText page="about" blockKey="carthage.p2" as="p" label="Carthage — Paragraphe 2" multiline />
              <EditableText page="about" blockKey="carthage.p3" as="p" label="Carthage — Paragraphe 3" multiline />
              <EditableText page="about" blockKey="carthage.p4" as="p" label="Carthage — Paragraphe 4" multiline />
            </div>
          </div>
        </div>
      </section>

      <section className="about-banner" aria-labelledby="about-banner-quote">
        <div className="about-banner__inner">
          <img
            src="/logo-figma.svg"
            alt="Golden Carthage"
            className="about-banner__logo"
          />
          <EditableText
            page="about"
            blockKey="banner.quote"
            as="p"
            className="about-banner__quote"
            multiline
            label="Bannière — Citation"
          />
          <EditableText
            page="about"
            blockKey="banner.eyebrow"
            as="p"
            className="about-banner__eyebrow"
            label="Bannière — Surtitre"
          />
        </div>
      </section>

      <AboutGallerySection />
      <AboutTimelineSection />
      <AboutAmbitionSection />
      <EditToolbar />
    </>
  )
}

export default function AboutPage() {
  return (
    <ContentProvider page="about">
      <AboutPageContent />
    </ContentProvider>
  )
}
