import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SiteHeader from '../components/layout/SiteHeader'
import CountryPicker from '../components/reservation/CountryPicker'
import ReservationModal from '../components/reservation/ReservationModal'
import { useMeetingRooms } from '../hooks/useMeetingRooms'
import {
  MEETING_DISPOSITIONS,
  meetingDispositionCapacity,
  meetingRoomCover,
  meetingRoomGalleryImages,
  SEMINAIRE_HERO_FALLBACK,
} from '../lib/meetingRoom'
import { findPhoneCountry } from '../lib/phoneCountries'
import api from '../api/client'
import '../styles/restaurant-reservation.css'
import '../styles/seminaire-reservation.css'

const EVENT_TYPES = ['Conférence', 'Séminaire', 'Réunion', 'Cocktail', 'Gala', 'Autre']
const YES_NO = ['Oui', 'Non']

const HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00',
]

function findRoomByParams(
  rooms: { id: number; name: string }[],
  roomId: string | null,
  roomName: string | null,
) {
  if (roomId) {
    const byId = rooms.find(r => String(r.id) === roomId)
    if (byId) return byId
  }
  if (roomName) {
    const normalized = roomName.trim().toLowerCase()
    return rooms.find(r => r.name.trim().toLowerCase() === normalized) ?? null
  }
  return null
}

function findDisposition(label: string | null) {
  if (!label) return ''
  const normalized = label.trim().toLowerCase()
  const match = MEETING_DISPOSITIONS.find(
    d => d.label.toLowerCase() === normalized || d.key === normalized,
  )
  return match?.key ?? ''
}

export default function SeminaireReservationPage() {
  const { t } = useTranslation()
  const { rooms } = useMeetingRooms()
  const [params] = useSearchParams()

  const paramRoomId = params.get('room')
  const paramRoomName = params.get('salle')
  const paramDisposition = params.get('disposition')

  const initialRoom = useMemo(
    () => findRoomByParams(rooms, paramRoomId, paramRoomName),
    [rooms, paramRoomId, paramRoomName],
  )

  const [roomId, setRoomId] = useState('')
  const [dispositionKey, setDispositionKey] = useState(() => findDisposition(paramDisposition))
  const [imageIndex, setImageIndex] = useState(0)
  const [participants, setParticipants] = useState('20')
  const [countryIso, setCountryIso] = useState('tn')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (initialRoom) setRoomId(String(initialRoom.id))
  }, [initialRoom])

  useEffect(() => {
    const key = findDisposition(paramDisposition)
    if (key) setDispositionKey(key)
  }, [paramDisposition])

  const selectedRoom = rooms.find(r => String(r.id) === roomId) ?? null
  const selectedDisposition = MEETING_DISPOSITIONS.find(d => d.key === dispositionKey) ?? null
  const selectedCountry = findPhoneCountry(countryIso)
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const galleryImages = useMemo(
    () => meetingRoomGalleryImages(selectedRoom, meetingRoomCover(selectedRoom, SEMINAIRE_HERO_FALLBACK)),
    [selectedRoom],
  )

  const currentImage = galleryImages[imageIndex] ?? galleryImages[0] ?? SEMINAIRE_HERO_FALLBACK

  const prevImage = () => {
    if (galleryImages.length <= 1) return
    setImageIndex(i => (i - 1 + galleryImages.length) % galleryImages.length)
  }

  const nextImage = () => {
    if (galleryImages.length <= 1) return
    setImageIndex(i => (i + 1) % galleryImages.length)
  }

  useEffect(() => {
    setImageIndex(0)
  }, [roomId])

  const participantsCount = useMemo(() => {
    const n = parseInt(participants, 10)
    if (Number.isNaN(n) || n < 1) return 20
    return Math.min(2000, n)
  }, [participants])

  const capacityHint = selectedRoom && selectedDisposition
    ? meetingDispositionCapacity(selectedRoom, selectedDisposition)
    : null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    const fullName = String(fd.get('nom_complet') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const phone = String(fd.get('telephone') ?? '').trim()
    const date = String(fd.get('date') ?? '').trim()
    const startTime = String(fd.get('heure_debut') ?? '').trim()
    const roomVal = String(fd.get('salle') ?? '').trim()

    if (!fullName || !email || !phone || !date || !startTime || !roomVal) {
      setShowSuccess(false)
      setErrorMessage(t('seminaireReservation.errorRequired'))
      setShowError(true)
      return
    }

    const room = rooms.find(r => String(r.id) === roomVal)
    const disposition = MEETING_DISPOSITIONS.find(d => d.key === String(fd.get('disposition') ?? ''))

    setShowError(false)
    setShowSuccess(false)
    setSubmitting(true)

    try {
      await api.post('/meeting-room-bookings/public', {
        meeting_room_id: room?.id ?? null,
        room_name: room?.name ?? roomVal,
        disposition: disposition?.label ?? null,
        full_name: fullName,
        email,
        phone,
        country_code: selectedCountry.dial,
        event_date: date,
        start_time: startTime,
        end_time: String(fd.get('heure_fin') ?? '').trim() || null,
        event_type: String(fd.get('event_type') ?? '').trim() || null,
        participants: participantsCount,
        needs_catering: String(fd.get('needs_catering') ?? '').trim() || null,
        needs_av_equipment: String(fd.get('needs_av_equipment') ?? '').trim() || null,
        is_hotel_resident: String(fd.get('is_hotel_resident') ?? '').trim() || null,
        company_name: String(fd.get('company_name') ?? '').trim() || null,
        comments: String(fd.get('comments') ?? '').trim() || null,
      })
      form.reset()
      setParticipants('20')
      setCountryIso('tn')
      if (initialRoom) setRoomId(String(initialRoom.id))
      if (dispositionKey) setDispositionKey(dispositionKey)
      setShowSuccess(true)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const errors = axiosErr.response?.data?.errors
      const first = errors ? Object.values(errors).flat().find((m): m is string => typeof m === 'string') : undefined
      setShowSuccess(false)
      setErrorMessage(
        first
          ?? (typeof axiosErr.response?.data?.message === 'string' ? axiosErr.response.data.message : null)
          ?? t('seminaireReservation.errorGeneric'),
      )
      setShowError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <SiteHeader variant="ivory" />

      <section className="resto-reservation seminaire-reservation">
        <div className="container resto-reservation__inner">
          <div className="resto-reservation__visual">
            <div className="resto-reservation__img-wrap">
              <img
                src={currentImage}
                alt={selectedRoom?.name ?? 'Salle de réunion'}
                className="resto-reservation__img"
                width={370}
                height={485}
              />
              <div className="resto-reservation__img-nav">
                <button
                  type="button"
                  className="resto-reservation__img-nav-btn"
                  onClick={prevImage}
                  aria-label={t('reservation.prevPhoto')}
                  disabled={galleryImages.length <= 1}
                >
                  <i className="fa-solid fa-arrow-left" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="resto-reservation__img-nav-btn"
                  onClick={nextImage}
                  aria-label={t('reservation.nextPhoto')}
                  disabled={galleryImages.length <= 1}
                >
                  <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div className="resto-reservation__content">
            <header className="resto-reservation__header">
              <div className="resto-reservation__header-text">
                <span className="resto-reservation__eyebrow">{t('seminaireReservation.eyebrow')}</span>
                <h1 className="resto-reservation__title">{t('seminaireReservation.title')}</h1>
              </div>
              {(selectedRoom || selectedDisposition) && (
                <div className="resto-reservation__picker">
                  {selectedRoom && (
                    <span className="resto-reservation__picker-name">{selectedRoom.name}</span>
                  )}
                  {selectedDisposition && (
                    <div className="seminaire-reservation__meta">
                      <span className="seminaire-reservation__chip">
                        <img src={selectedDisposition.icon} alt="" aria-hidden="true" />
                        {selectedDisposition.label}
                        {capacityHint && capacityHint !== '—' && (
                          <span>· {capacityHint} {t('seminaireReservation.persons')}</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </header>

            <form className="resto-reservation__form" onSubmit={handleSubmit}>
              <div className="resto-reservation__row resto-reservation__row--2">
                <input
                  id="sem-nom"
                  name="nom_complet"
                  type="text"
                  autoComplete="name"
                  className="resto-reservation__input"
                  placeholder={t('seminaireReservation.placeholderFullName')}
                />
                <div className="resto-reservation__phone">
                  <CountryPicker value={countryIso} onChange={setCountryIso} />
                  <span className="resto-reservation__phone-divider" aria-hidden="true">|</span>
                  <input
                    id="sem-tel"
                    name="telephone"
                    type="tel"
                    autoComplete="tel-national"
                    className="resto-reservation__phone-input"
                    placeholder={t('seminaireReservation.placeholderPhone')}
                  />
                </div>
              </div>

              <div className="resto-reservation__row resto-reservation__row--2">
                <input
                  id="sem-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="resto-reservation__input"
                  placeholder={t('seminaireReservation.placeholderEmail')}
                />
                <input
                  id="sem-company"
                  name="company_name"
                  type="text"
                  autoComplete="organization"
                  className="resto-reservation__input"
                  placeholder={t('seminaireReservation.placeholderCompany')}
                />
              </div>

              <div className="resto-reservation__row resto-reservation__row--2">
                <select
                  id="sem-salle"
                  name="salle"
                  className="resto-reservation__input resto-reservation__select"
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                >
                  <option value="">{t('seminaireReservation.selectRoom')}</option>
                  {rooms.map(room => (
                    <option key={room.id} value={String(room.id)}>
                      {room.name}
                    </option>
                  ))}
                </select>
                <select
                  id="sem-disposition"
                  name="disposition"
                  className="resto-reservation__input resto-reservation__select"
                  value={dispositionKey}
                  onChange={e => setDispositionKey(e.target.value)}
                >
                  <option value="">{t('seminaireReservation.selectDisposition')}</option>
                  {MEETING_DISPOSITIONS.map(d => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                      {selectedRoom && meetingDispositionCapacity(selectedRoom, d) !== '—'
                        ? ` (${meetingDispositionCapacity(selectedRoom, d)})`
                        : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="resto-reservation__row resto-reservation__row--3">
                <div className="resto-reservation__input-icon resto-reservation__input-icon--right">
                  <input
                    id="sem-date"
                    name="date"
                    type="date"
                    min={minDate}
                    className="resto-reservation__input"
                  />
                  <img src="/imgs/calendar 5.svg" alt="" className="resto-reservation__icon" aria-hidden="true" />
                </div>
                <div className="resto-reservation__input-icon resto-reservation__input-icon--right">
                  <select id="sem-heure-debut" name="heure_debut" className="resto-reservation__input resto-reservation__select" defaultValue="">
                    <option value="">{t('seminaireReservation.startTime')}</option>
                    {HOURS.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <img src="/imgs/hour.svg" alt="" className="resto-reservation__icon" aria-hidden="true" />
                </div>
                <div className="resto-reservation__input-icon resto-reservation__input-icon--right">
                  <select id="sem-heure-fin" name="heure_fin" className="resto-reservation__input resto-reservation__select" defaultValue="">
                    <option value="">{t('seminaireReservation.endTime')}</option>
                    {HOURS.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <img src="/imgs/hour.svg" alt="" className="resto-reservation__icon" aria-hidden="true" />
                </div>
              </div>

              <div className="resto-reservation__row resto-reservation__row--3">
                <select id="sem-event-type" name="event_type" className="resto-reservation__input resto-reservation__select" defaultValue="">
                  <option value="">{t('seminaireReservation.eventType')}</option>
                  {EVENT_TYPES.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <select id="sem-catering" name="needs_catering" className="resto-reservation__input resto-reservation__select" defaultValue="">
                  <option value="">{t('seminaireReservation.catering')}</option>
                  {YES_NO.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <select id="sem-av" name="needs_av_equipment" className="resto-reservation__input resto-reservation__select" defaultValue="">
                  <option value="">{t('seminaireReservation.avEquipment')}</option>
                  {YES_NO.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="resto-reservation__row resto-reservation__row--2">
                <input
                  id="sem-participants"
                  name="participants"
                  type="number"
                  min={1}
                  max={2000}
                  inputMode="numeric"
                  value={participants}
                  onChange={e => setParticipants(e.target.value)}
                  className="resto-reservation__input"
                  placeholder={t('seminaireReservation.placeholderParticipants')}
                  aria-label={t('seminaireReservation.placeholderParticipants')}
                />
                <select id="sem-resident" name="is_hotel_resident" className="resto-reservation__input resto-reservation__select" defaultValue="">
                  <option value="">{t('seminaireReservation.hotelResident')}</option>
                  {YES_NO.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="resto-reservation__row">
                <textarea
                  id="sem-comments"
                  name="comments"
                  rows={3}
                  className="resto-reservation__input resto-reservation__textarea"
                  placeholder={t('seminaireReservation.comments')}
                />
              </div>

              <div className="resto-reservation__row">
                <button
                  type="submit"
                  className="resto-reservation__submit resto-reservation__submit--seminaire"
                  disabled={submitting}
                >
                  {submitting ? t('seminaireReservation.submitting') : t('seminaireReservation.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <ReservationModal
        showSuccess={showSuccess}
        showError={showError}
        errorMessage={errorMessage}
        onClose={() => { setShowSuccess(false); setShowError(false) }}
        successKey="seminaireReservation.successTitle"
        successMessageKey="seminaireReservation.successMessage"
      />
    </>
  )
}
