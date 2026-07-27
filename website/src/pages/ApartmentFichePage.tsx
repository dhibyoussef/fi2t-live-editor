import { useMemo } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import SiteHeader from '../components/layout/SiteHeader'
import BookingBar from '../components/home/BookingBar'
import RoomGallery from '../components/rooms/RoomGallery'
import OtherRoomsSection from '../components/rooms/OtherRoomsSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import { ContentProvider } from '../cms/ContentProvider'
import { useRoomCategories } from '../hooks/useRoomCategories'
import '../styles/room-landing.css'
import '../styles/room-fiche.css'

export default function ApartmentFichePage() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const { categories, loading } = useRoomCategories('APARTMENT')

  const apartmentId = Number(id)
  const apartment = useMemo(
    () => categories.find(c => c.id === apartmentId),
    [categories, apartmentId],
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

  if (!loading && categories.length > 0 && !apartment) {
    return <Navigate to="/appartements" replace />
  }

  if (loading && !apartment) {
    return (
      <>
        <SiteHeader variant="ivory" />
        <p className="room-landing-loading">Chargement...</p>
      </>
    )
  }

  const amenities = apartment?.amenities ?? []
  const surface = apartment?.surface_m2

  return (
    <>
      <SiteHeader variant="ivory" />

      <section className="room-landing-hero room-fiche-hero">
        <div className="room-landing-hero__intro">
          <div className="room-landing-hero__content">
            <p className="room-fiche__eyebrow">
              <Link to="/appartements">Hébergement</Link>
              <span aria-hidden="true"> | </span>
              <span>Appartements</span>
            </p>

            <h1 className="room-fiche__name">{apartment?.name}</h1>

            {surface != null && (
              <div className="room-fiche__surface-block">
                <p className="room-fiche__surface">Superficie {surface}m²</p>
                <hr className="room-fiche__divider" />
              </div>
            )}

            <p className="room-landing-hero__desc room-fiche__desc">
              {apartment?.description ?? 'Appartement élégant et fonctionnel, pensé pour un séjour prolongé dans le confort.'}
            </p>

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
          <RoomGallery media={apartment?.media} alt={apartment?.name ?? 'Appartement'} />
        </div>
      </section>

      <section className="room-landing-pick room-fiche-pick">
        <div className="room-landing-pick__head container">
          <BookingBar defaults={bookingDefaults} />
        </div>
      </section>

      <OtherRoomsSection
        categories={categories}
        currentId={apartmentId}
        stayQuery={stayQuery}
        sectionTitle="Autres appartements"
        detailPath={id => `/appartements/${id}/fiche`}
      />

      <ContentProvider page="home">
        <TestimonialsSection variant="maroon" />
      </ContentProvider>
    </>
  )
}
