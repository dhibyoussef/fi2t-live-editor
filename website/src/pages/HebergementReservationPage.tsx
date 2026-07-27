import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SiteHeader from '../components/layout/SiteHeader'
import HebergementSummaryBar from '../components/reservation/HebergementSummaryBar'
import HebRoomFilters, { filterAndSortRooms, type PriceSort } from '../components/reservation/HebRoomFilters'
import { useCarousel } from '../hooks/useCarousel'
import { useRoomCategories } from '../hooks/useRoomCategories'
import {
  ACCOMMODATION_PARAM,
  accommodationFicheBase,
  accommodationIndexFromType,
  categoryAccommodationType,
  filterCategoriesByAccommodation,
  parseAccommodationType,
  type AccommodationSearchType,
} from '../lib/accommodationSearch'
import { accommodationKindOf } from '../lib/accommodationKind'
import { categoryCover, formatPrice, hasRoomDiscount, roomSalePrice } from '../lib/roomCategory'
import { nightsBetween } from '../lib/stayDates'
import { IMG } from '../lib/localImages'
import '../styles/hebergement-reservation.css'

const FALLBACK_BANNER = IMG.heroHome
const FALLBACK_ROOM = IMG.landingRoom
const FALLBACK_APARTMENT = IMG.g5

interface CartItem {
  roomId: number
  name: string
  pricePerNight: number
}

export default function HebergementReservationPage() {
  const { t } = useTranslation()
  const [params, setSearchParams] = useSearchParams()
  const accommodation = parseAccommodationType(params.get(ACCOMMODATION_PARAM))
  const filterIndex = accommodationIndexFromType(accommodation)
  const { items: heroItems } = useCarousel('home-hero')
  const { categories, loading } = useRoomCategories()
  const [cart, setCart] = useState<CartItem[]>([])
  const [priceSort, setPriceSort] = useState<PriceSort>('asc')

  const bannerImage = heroItems[0]?.image_url ?? FALLBACK_BANNER
  const checkin = params.get('checkin') ?? ''
  const checkout = params.get('checkout') ?? ''
  const adults = Number(params.get('adults') ?? 2)
  const children = Number(params.get('children') ?? 0)
  const nights = nightsBetween(checkin, checkout)

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.pricePerNight * nights, 0),
    [cart, nights],
  )

  const addToCart = (roomId: number, name: string, pricePerNight: number | null) => {
    if (pricePerNight == null) return
    setCart(prev => [...prev, { roomId, name, pricePerNight }])
  }

  const categoriesByType = useMemo(
    () => filterCategoriesByAccommodation(categories, accommodation),
    [categories, accommodation],
  )

  const displayedCategories = useMemo(
    () => filterAndSortRooms(categoriesByType, priceSort),
    [categoriesByType, priceSort],
  )

  const hasResults = categories.length > 0
  const hasFilteredResults = displayedCategories.length > 0

  const setAccommodation = (type: AccommodationSearchType) => {
    setCart([])
    const next = new URLSearchParams(params)
    if (type === 'ALL') next.delete(ACCOMMODATION_PARAM)
    else next.set(ACCOMMODATION_PARAM, type)
    setSearchParams(next, { replace: true })
  }

  const stayQuery = useMemo(() => {
    const q = new URLSearchParams()
    if (checkin) q.set('checkin', checkin)
    if (checkout) q.set('checkout', checkout)
    q.set('adults', String(adults))
    q.set('children', String(children))
    if (accommodation !== 'ALL') q.set(ACCOMMODATION_PARAM, accommodation)
    return q.toString()
  }, [checkin, checkout, adults, children, accommodation])

  const fichePath = (roomId: number, itemType: 'ROOM' | 'APARTMENT') =>
    `${accommodationFicheBase(itemType)}/${roomId}/fiche${stayQuery ? `?${stayQuery}` : ''}`

  return (
    <>
      <SiteHeader variant="ivory" />

      <section className="heb-res-banner">
        <img src={bannerImage} alt="Hébergement Golden Carthage" className="heb-res-banner__bg" />
        <div className="heb-res-banner__overlay" aria-hidden="true" />
        <div className="heb-res-banner__booking">
          <HebergementSummaryBar
            checkin={checkin}
            checkout={checkout}
            adults={adults}
            children={children}
            cartCount={cart.length}
            totalAmount={cartTotal}
          />
        </div>
      </section>

      <section className="heb-res-page">
        <div className="container">
          <header className="heb-res-head">
            <h1 className="heb-res-title">{t('booking.selectAccommodation')}</h1>
            <div className="heb-res-head__right">
              <HebRoomFilters
                priceSort={priceSort}
                filterIndex={filterIndex}
                onPriceSort={setPriceSort}
                onAccommodationChange={setAccommodation}
              />
            </div>
          </header>

          {loading ? (
            <p className="heb-res-state">Chargement des hébergements...</p>
          ) : !hasResults ? (
            <p className="heb-res-state">Aucun hébergement disponible.</p>
          ) : !hasFilteredResults ? (
            <p className="heb-res-state">{t('booking.noAccommodationFilter')}</p>
          ) : (
            <div className="heb-card-list">
              {displayedCategories.map((room) => {
                const itemType = categoryAccommodationType(room.accommodation_type)
                const kind = accommodationKindOf(room)
                const isApartment = kind === 'apartment'
                const isSuite = kind === 'suite'
                const discount = room.discount_percent ?? 0
                const hasDiscount = hasRoomDiscount(discount)
                const saleAmount = roomSalePrice(room.price_from, discount)
                const oldPriceLabel = hasDiscount && room.price_from
                  ? formatPrice(room.price_from)
                  : null
                const newPriceLabel = saleAmount != null
                  ? formatPrice(saleAmount)
                  : null

                return (
                  <article className="heb-card" key={room.id}>
                    <Link to={fichePath(room.id, itemType)} className="heb-card__media heb-card__media-link">
                      <img
                        src={categoryCover(room, isApartment ? FALLBACK_APARTMENT : FALLBACK_ROOM)}
                        alt={room.name}
                      />
                      {hasDiscount && (
                        <div className="heb-card__media-promo">
                          <span className="heb-card__media-discount">
                            {discount}% Off
                          </span>
                          <span className="heb-card__media-promo-label">En Promo</span>
                        </div>
                      )}
                      <div className="heb-card__media-actions" aria-label="Actions média">
                        <button
                          type="button"
                          className="heb-card__media-action heb-card__media-action--favorite"
                          aria-label="Ajouter aux favoris"
                          onClick={e => e.preventDefault()}
                        >
                          <img src="/imgs/Heart.svg" alt="" aria-hidden="true" />
                        </button>
                        <span className="heb-card__media-action-line" aria-hidden="true" />
                        <button
                          type="button"
                          className="heb-card__media-action"
                          aria-label="Voir la vidéo"
                          onClick={e => e.preventDefault()}
                        >
                          <img src="/imgs/video-camera.svg" alt="" aria-hidden="true" />
                        </button>
                        <span className="heb-card__media-action-line" aria-hidden="true" />
                        <button
                          type="button"
                          className="heb-card__media-action"
                          aria-label="Voir les photos"
                          onClick={e => e.preventDefault()}
                        >
                          <img src="/imgs/photo-camera.svg" alt="" aria-hidden="true" />
                        </button>
                      </div>
                    </Link>

                    <div className="heb-card__desc">
                      <div className="heb-card__stars" aria-label="5 étoiles">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i key={i} className="fa-solid fa-star" aria-hidden="true" />
                        ))}
                      </div>
                      <h2 className="heb-card__title">
                        <Link to={fichePath(room.id, itemType)} className="heb-card__title-link">
                          {room.name}
                        </Link>
                      </h2>
                      <div className="heb-card__amenities-wrapper">
                        <ul className="heb-card__amenities">
                          {(room.amenities ?? []).slice(0, 6).map(a => (
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
                        <ul className="heb-card__amenities">
                          {(room.amenities ?? []).slice(6, 12).map(a => (
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
                      </div>
                      <h3 className="heb-card__details-label">
                        {isApartment
                          ? t('booking.apartmentDetails')
                          : isSuite
                            ? t('booking.suiteDetails')
                            : t('booking.roomDetails')}
                      </h3>
                    </div>

                    <div className="heb-card__price">
                      {hasDiscount && (
                        <div className="heb-card__discount-row">
                          <span className="heb-card__discount-badge">{discount}% Off</span>
                          {oldPriceLabel && (
                            <p className="heb-card__old">{oldPriceLabel}</p>
                          )}
                        </div>
                      )}
                      <p className="heb-card__new">
                        {newPriceLabel ?? 'Prix sur demande'}
                      </p>
                      <p className="heb-card__nuit">par Nuit</p>
                      <p className="heb-card__taxes">Y compris les taxes et frais</p>
                      <button
                        type="button"
                        className="heb-card__cta"
                        onClick={() => addToCart(room.id, room.name, saleAmount)}
                        disabled={saleAmount == null}
                      >
                        Réserver maintenant
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
