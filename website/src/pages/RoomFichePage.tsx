import { useMemo } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import SiteHeader from '../components/layout/SiteHeader'
import BookingBar from '../components/home/BookingBar'
import RoomGallery from '../components/rooms/RoomGallery'
import OtherRoomsSection from '../components/rooms/OtherRoomsSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import { ContentProvider } from '../cms/ContentProvider'
import { useRoomCategories } from '../hooks/useRoomCategories'
import { filterByAccommodationKind, isSuiteType } from '../lib/accommodationKind'
import '../styles/room-landing.css'
import '../styles/room-fiche.css'

export default function RoomFichePage() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const { categories, loading } = useRoomCategories('ROOM')

  const roomId = Number(id)
  const room = useMemo(
    () => categories.find(c => c.id === roomId),
    [categories, roomId],
  )

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

  const isSuite = room ? isSuiteType(room) : false
  const backPath = isSuite ? '/suites' : '/chambres'
  const backLabel = isSuite ? 'Suites' : 'Chambres'
  const relatedCategories = useMemo(
    () => filterByAccommodationKind(categories, isSuite ? 'suite' : 'chambre'),
    [categories, isSuite],
  )

  if (!loading && categories.length > 0 && !room) {
    return <Navigate to={backPath} replace />
  }

  if (loading && !room) {
    return (
      <>
        <SiteHeader variant="ivory" />
        <p className="room-landing-loading">Chargement...</p>
      </>
    )
  }

  const amenities = room?.amenities ?? []
  const surface = room?.surface_m2

  const defaultDesc = isSuite
    ? "Suite avec 1 grand lit, Salon, Bouilloire, Bouteille d'eau à l'arrivée, IPTV, Wifi gratuit, Balcon, Vue mer, forêt ou jardin, Peignoir de bain, Offre un accès gratuit au salon exécutif et de nombreux avantages (transfert aéroport gratuit, service personnalisé, petit déjeuner buffet)."
    : 'Chambre confortable et élégante, pensée pour un séjour reposant avec tout le confort moderne.'

  return (
    <>
      <SiteHeader variant="ivory" />

      {/* Same hero shell as landing — fiche content only */}
      <section className={`room-landing-hero room-fiche-hero${isSuite ? ' room-fiche-hero--suite' : ''}`}>
        <div className="room-landing-hero__intro">
          <div className="room-landing-hero__content">
            <p className="room-fiche__eyebrow">
              <Link to={backPath}>Hébergement</Link>
              <span aria-hidden="true"> | </span>
              <span>{backLabel}</span>
            </p>

            <h1 className="room-fiche__name">{room?.name}</h1>

            {surface != null && (
              <div className="room-fiche__surface-block">
                <p className="room-fiche__surface">Superficie {surface}m²</p>
                <hr className="room-fiche__divider" />
              </div>
            )}

            <p className="room-landing-hero__desc room-fiche__desc">{room?.description || defaultDesc}</p>

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

            <Link
              to={`/hebergement-reservation?${params.toString()}`}
              className="room-landing-hero__reserve"
            >
              Réserver maintenant
            </Link>
          </div>
        </div>

        <div className="room-landing-hero__media room-fiche-hero__media">
          <RoomGallery media={room?.media} alt={room?.name ?? 'Chambre'} />
        </div>
      </section>

      {/* Same pick shell as landing — white booking strip for fiche */}
      <section className="room-landing-pick room-fiche-pick">
        <div className="room-landing-pick__head container">
          <BookingBar defaults={bookingDefaults} />
        </div>
      </section>

      {/* Replaces landing reviews — autres chambres on Numidian */}
      <OtherRoomsSection
        categories={relatedCategories}
        currentId={roomId}
        stayQuery={stayQuery}
        sectionTitle={isSuite ? 'Autres suites' : 'Autres chambres'}
      />

      <ContentProvider page="home">
        <TestimonialsSection variant="maroon" />
      </ContentProvider>
    </>
  )
}
