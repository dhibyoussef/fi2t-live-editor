import { Link } from 'react-router-dom'
import SiteHeader from '../components/layout/SiteHeader'
import SpaDiscoverSection from '../components/spa/SpaDiscoverSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import { ContentProvider } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'
import EditToolbar from '../cms/EditToolbar'
import '../styles/spa-landing.css'

const PAGE = 'spa'

function SpaLandingContent() {
  return (
    <>
      <SiteHeader variant="ivory" />

      <section className="spa-landing" aria-labelledby="spa-landing-title">
        <div className="spa-landing__layout">
          <div className="spa-landing__content">
            <img
              src="/imgs/bgvictor.svg"
              alt=""
              className="spa-landing__calque"
              aria-hidden="true"
            />

            <div className="spa-landing__content-inner">
              <div className="spa-landing__brand">
                <img
                  src="/logo-figma.svg"
                  alt=""
                  className="spa-landing__logo"
                  aria-hidden="true"
                />
                <EditableText
                  page={PAGE}
                  blockKey="intro.eyebrow"
                  as="p"
                  className="spa-landing__eyebrow"
                  label="Intro — Surtitre"
                />
              </div>

              <EditableText
                page={PAGE}
                blockKey="intro.title"
                as="h1"
                className="spa-landing__title"
                multiline
                label="Intro — Titre"
              />

              <EditableText
                page={PAGE}
                blockKey="intro.desc"
                as="div"
                className="spa-landing__text"
                multiline
                label="Intro — Description"
              />

              <div className="spa-landing__actions">
                <Link to="/spa/reservation" className="spa-landing__cta">
                  <span className="spa-landing__cta-label">
                    <EditableText page={PAGE} blockKey="intro.cta" as="span" label="Intro — Bouton" />
                  </span>
                  <span className="spa-landing__cta-icon" aria-hidden="true">
                    <img src="/imgs/calendar%205.svg" alt="" />
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="spa-landing__brochure">
            <EditableText
              page={PAGE}
              blockKey="intro.brochure_title"
              as="p"
              className="spa-landing__brochure-title"
              label="Brochure — Titre"
            />
            <Link to="/spa/soins" className="spa-landing__brochure-btn">
              <EditableText page={PAGE} blockKey="intro.brochure_cta" as="span" label="Brochure — Bouton" />
            </Link>
          </div>

          <div className="spa-landing__visual">
            <EditableImage
              page={PAGE}
              blockKey="intro.image"
              className="spa-landing__visual-img"
              alt="Soin spa Antonin — Golden Carthage"
              fallback="/imgs/f9tyXY2BI8BEtH3UmsH0ZfNhIjZ2DI2rTwhqHQgP.jpg"
              label="Intro — Image"
            />
          </div>
        </div>
      </section>

      <SpaDiscoverSection />

      <ContentProvider page="home">
        <TestimonialsSection variant="maroon" />
      </ContentProvider>
      <EditToolbar />
    </>
  )
}

export default function SpaLandingPage() {
  return (
    <ContentProvider page={PAGE}>
      <SpaLandingContent />
    </ContentProvider>
  )
}
