import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SiteHeader from '../components/layout/SiteHeader'
import ApartmentLandingPick from '../components/apartments/ApartmentLandingPick'
import TestimonialsSection from '../components/home/TestimonialsSection'
import { ContentProvider } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditToolbar from '../cms/EditToolbar'
import { useRoomCategories } from '../hooks/useRoomCategories'
import { categoryCover } from '../lib/roomCategory'
import { IMG } from '../lib/localImages'
import '../styles/apartment-landing.css'
import '../styles/hebergement-reservation.css'

const PAGE = 'appartements'
const FALLBACK_COVER = IMG.g5

export default function ApartmentLandingPage() {
  const [params] = useSearchParams()
  const { categories, loading } = useRoomCategories('APARTMENT')

  const bookingDefaults = {
    checkin: params.get('checkin') ?? undefined,
    checkout: params.get('checkout') ?? undefined,
    adults: params.has('adults') ? Number(params.get('adults')) : undefined,
    children: params.has('children') ? Number(params.get('children')) : undefined,
  }

  const stayQuery = useMemo(() => {
    const q = new URLSearchParams()
    if (bookingDefaults.checkin) q.set('checkin', bookingDefaults.checkin)
    if (bookingDefaults.checkout) q.set('checkout', bookingDefaults.checkout)
    if (bookingDefaults.adults != null) q.set('adults', String(bookingDefaults.adults))
    if (bookingDefaults.children != null) q.set('children', String(bookingDefaults.children))
    return q.toString()
  }, [bookingDefaults])

  const cover = categoryCover(
    categories[0] ?? { id: 0, name: '', category: '', description: null },
    FALLBACK_COVER,
  )

  if (loading && categories.length === 0) {
    return (
      <>
        <SiteHeader variant="ivory" />
        <p className="apt-landing-loading">Chargement...</p>
      </>
    )
  }

  return (
    <>
      <SiteHeader variant="ivory" />

      <ContentProvider page={PAGE}>
      <section className="apt-landing-hero">
        <div className="apt-landing-hero__intro">
          <div className="apt-landing-hero__content">
            <div className="apt-landing-hero__brand">
              <img src="/logo-figma.svg" alt="" className="apt-landing-hero__logo" aria-hidden="true" />
              <div className="apt-landing-hero__titles">
                <EditableText
                  page={PAGE}
                  blockKey="hero.label"
                  as="p"
                  className="apt-landing-hero__label"
                  label="Hero — Label"
                />
                <EditableText
                  page={PAGE}
                  blockKey="hero.title"
                  as="h1"
                  className="apt-landing-hero__name"
                  label="Hero — Titre"
                />
              </div>
            </div>

            <EditableText
              page={PAGE}
              blockKey="hero.tagline"
              as="p"
              className="apt-landing-hero__tagline"
              multiline
              label="Hero — Accroche"
            />

            <EditableText
              page={PAGE}
              blockKey="hero.desc"
              as="p"
              className="apt-landing-hero__desc"
              multiline
              label="Hero — Description"
            />

            <div className="apt-landing-stats">
              <div className="apt-landing-stat apt-landing-stat--gold">
                <img src="/imgs/bgvictor.svg" alt="" className="apt-landing-stat__bg" aria-hidden="true" />
                <EditableText
                  page={PAGE}
                  blockKey="stats.apartments_count"
                  as="span"
                  className="apt-landing-stat__value"
                  fallback="18"
                  label="Nombre d'appartements"
                />
                <span className="apt-landing-stat__label">Appartements</span>
              </div>
              <div className="apt-landing-stat apt-landing-stat--outline">
                <img src="/imgs/bgvictor.svg" alt="" className="apt-landing-stat__bg" aria-hidden="true" />
                <EditableText
                  page={PAGE}
                  blockKey="stats.surface"
                  as="span"
                  className="apt-landing-stat__value"
                  fallback="100m²"
                  label="Superficie"
                />
                <span className="apt-landing-stat__label">Superficie</span>
              </div>
            </div>

            <Link
              to={`/hebergement-reservation?${params.toString()}`}
              className="apt-landing-hero__reserve"
            >
              <EditableText page={PAGE} blockKey="hero.reserve" as="span" label="Hero — Bouton réserver" />
            </Link>
          </div>
        </div>

        <div className="apt-landing-hero__media">
          <img src={cover} alt="Appartements Golden Carthage" loading="eager" />
        </div>
      </section>

      <ApartmentLandingPick bookingDefaults={bookingDefaults} stayQuery={stayQuery} />
      <EditToolbar />
      </ContentProvider>

      <ContentProvider page="home">
        <TestimonialsSection variant="maroon" />
      </ContentProvider>
    </>
  )
}
