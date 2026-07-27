import SiteHeader from '../components/layout/SiteHeader'
import RestaurantLandingCards from '../components/restaurants/RestaurantLandingCards'
import TestimonialsSection from '../components/home/TestimonialsSection'
import { ContentProvider } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditToolbar from '../cms/EditToolbar'
import '../styles/restaurant-landing.css'

const PAGE = 'restaurants'

function RestaurantLandingContent() {
  return (
    <>
      <SiteHeader variant="ivory" />

      <section className="resto-landing" aria-labelledby="resto-landing-title">
        <div className="container resto-landing__inner">
          <header className="resto-landing__head">
            <h1 id="resto-landing-title" className="resto-landing__title">
              <EditableText
                page={PAGE}
                blockKey="intro.title"
                as="span"
                label="Intro — Titre"
              />
            </h1>
            <EditableText
              page={PAGE}
              blockKey="intro.tagline"
              as="p"
              className="resto-landing__tagline"
              label="Intro — Accroche"
            />
            <EditableText
              page={PAGE}
              blockKey="intro.desc"
              as="p"
              className="resto-landing__intro"
              multiline
              label="Intro — Description"
            />
          </header>

          <RestaurantLandingCards />
        </div>
      </section>

      <ContentProvider page="home">
        <TestimonialsSection variant="maroon" />
      </ContentProvider>
      <EditToolbar />
    </>
  )
}

export default function RestaurantLandingPage() {
  return (
    <ContentProvider page={PAGE}>
      <RestaurantLandingContent />
    </ContentProvider>
  )
}
