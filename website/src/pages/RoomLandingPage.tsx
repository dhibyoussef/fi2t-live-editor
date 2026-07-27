import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SiteHeader from '../components/layout/SiteHeader'
import BookingBar from '../components/home/BookingBar'
import FeaturedRoomsSection from '../components/home/FeaturedRoomsSection'
import RoomLandingReviews from '../components/rooms/RoomLandingReviews'
import { ContentProvider } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'
import EditToolbar from '../cms/EditToolbar'
import { useRoomCategories } from '../hooks/useRoomCategories'
import { filterByAccommodationKind } from '../lib/accommodationKind'
import type { AccommodationDisplayKind } from '../lib/accommodationKind'
import { uniqueAmenities } from '../lib/roomCategory'
import '../styles/room-landing.css'

type LandingKind = 'chambre' | 'suite'

const LANDING_STATS: Array<{
  blockKey: string
  fallback: string
  label: string
  variant: 'blue' | 'gold' | 'purple'
}> = [
  { blockKey: 'stats.rooms_count', fallback: '243', label: 'Chambres', variant: 'blue' },
  { blockKey: 'stats.suites_count', fallback: '21', label: 'Suites', variant: 'gold' },
  { blockKey: 'stats.surface', fallback: '100m²', label: 'Superficie', variant: 'purple' },
]

const LANDING_CONFIG: Record<
  LandingKind,
  {
    page: string
    accommodationKind: AccommodationDisplayKind
    reservationParam: 'CHAMBRE' | 'SUITE'
    imageAlt: string
    heroImageFallback: string
  }
> = {
  chambre: {
    page: 'chambres',
    accommodationKind: 'chambre',
    reservationParam: 'CHAMBRE',
    imageAlt: 'Chambres Golden Carthage',
    heroImageFallback: '/imgs/landingroom.jpg',
  },
  suite: {
    page: 'suites',
    accommodationKind: 'suite',
    reservationParam: 'SUITE',
    imageAlt: 'Suites Golden Carthage',
    heroImageFallback: '/imgs/suites.jpg',
  },
}

function RoomLandingContent({
  kind,
  bookingDefaults,
  params,
  amenities,
}: {
  kind: LandingKind
  bookingDefaults: {
    checkin?: string
    checkout?: string
    adults?: number
    children?: number
  }
  params: URLSearchParams
  amenities: ReturnType<typeof uniqueAmenities>
}) {
  const config = LANDING_CONFIG[kind]
  const PAGE = config.page

  const reserveQuery = useMemo(() => {
    const q = new URLSearchParams(params)
    q.set('accommodation', config.reservationParam)
    return q.toString()
  }, [params, config.reservationParam])

  return (
    <>
      <section className={`room-landing-hero${kind === 'suite' ? ' room-landing-hero--suite' : ''}`}>
        <div className="room-landing-hero__intro">
          <div className="room-landing-hero__content">
            <div className="room-landing-hero__brand">
              <img src="/logo-figma.svg" alt="" className="room-landing-hero__logo" aria-hidden="true" />
              <div className="room-landing-hero__titles">
                <EditableText
                  page={PAGE}
                  blockKey="hero.label"
                  as="p"
                  className="room-landing-hero__label"
                  label="Hero — Label"
                />
                <EditableText
                  page={PAGE}
                  blockKey="hero.title"
                  as="h1"
                  className="room-landing-hero__name"
                  label="Hero — Titre"
                />
              </div>
            </div>

            <EditableText
              page={PAGE}
              blockKey="hero.tagline"
              as="p"
              className="room-landing-hero__tagline"
              multiline
              label="Hero — Accroche"
            />

            <EditableText
              page={PAGE}
              blockKey="hero.desc"
              as="p"
              className="room-landing-hero__desc"
              multiline
              label="Hero — Description"
            />

            {amenities.length > 0 && (
              <ul className="room-landing-hero__amenities">
                {amenities.map(a => (
                  <li key={a.id}>
                    {a.icon && (a.icon.startsWith('/') || a.icon.startsWith('http')) ? (
                      <img src={a.icon} alt="" aria-hidden="true" />
                    ) : (
                      <i className={a.icon || 'fa-solid fa-check'} aria-hidden="true" />
                    )}
                    <span>{a.name}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="room-landing-stats">
              {LANDING_STATS.map(stat => (
                <div
                  key={stat.blockKey}
                  className={`room-landing-stat room-landing-stat--${stat.variant}`}
                >
                  <img src="/imgs/bgvictor.svg" alt="" className="room-landing-stat__bg" aria-hidden="true" />
                  <EditableText
                    page={PAGE}
                    blockKey={stat.blockKey}
                    as="span"
                    className="room-landing-stat__value"
                    fallback={stat.fallback}
                    label={stat.label}
                  />
                  <span className="room-landing-stat__label">{stat.label}</span>
                </div>
              ))}
            </div>

            <Link to={`/hebergement-reservation?${reserveQuery}`} className="room-landing-hero__reserve">
              <EditableText page={PAGE} blockKey="hero.reserve" as="span" label="Hero — Bouton réserver" />
            </Link>
          </div>
        </div>

        <div className="room-landing-hero__media">
          <EditableImage
            page={PAGE}
            blockKey="hero.image"
            className="room-landing-hero__media-img"
            alt={config.imageAlt}
            fallback={config.heroImageFallback}
            label="Hero — Image"
          />
        </div>
      </section>

      <section className="room-landing-pick">
        <div className="room-landing-pick__head container">
          <EditableText
            page={PAGE}
            blockKey="pick.title"
            as="h2"
            className="room-landing-pick__title"
            label="Section — Titre choix"
          />
          <BookingBar defaults={bookingDefaults} />
        </div>

        <ContentProvider page="home">
          <FeaturedRoomsSection
            showHeader={false}
            accommodationKind={config.accommodationKind}
          />
        </ContentProvider>
      </section>

      <RoomLandingReviews page={PAGE} />
      <EditToolbar />
    </>
  )
}

interface Props {
  kind?: LandingKind
}

export default function RoomLandingPage({ kind = 'chambre' }: Props) {
  const [params] = useSearchParams()
  const config = LANDING_CONFIG[kind]
  const { categories, loading } = useRoomCategories('ROOM')

  const filteredCategories = useMemo(
    () => filterByAccommodationKind(categories, config.accommodationKind),
    [categories, config.accommodationKind],
  )

  const bookingDefaults = {
    checkin: params.get('checkin') ?? undefined,
    checkout: params.get('checkout') ?? undefined,
    adults: params.has('adults') ? Number(params.get('adults')) : undefined,
    children: params.has('children') ? Number(params.get('children')) : undefined,
  }

  const amenities = useMemo(() => uniqueAmenities(filteredCategories), [filteredCategories])

  if (loading && categories.length === 0) {
    return (
      <>
        <SiteHeader variant="ivory" />
        <p className="room-landing-loading">Chargement...</p>
      </>
    )
  }

  return (
    <>
      <SiteHeader variant="ivory" />
      <ContentProvider page={config.page}>
        <RoomLandingContent
          kind={kind}
          bookingDefaults={bookingDefaults}
          params={params}
          amenities={amenities}
        />
      </ContentProvider>
    </>
  )
}
