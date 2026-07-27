import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Users, TrendingUp, Sparkles, Utensils, ArrowUpRight, Clock, ImageIcon, Presentation, BedDouble, Building2, Crown } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import api from '../../api/client'
import {
  ROOM_CATEGORY_ENUM_LABELS,
  accommodationInventoryLabel,
  enumVal,
  splitAccommodationTypes,
} from '../rooms/roomLabels'

const BOOKING_STATUS_FR: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
}

function formatBookingTime(value: string | null | undefined) {
  if (!value) return '—'
  return String(value).slice(0, 5)
}

function StatCard({
  label, value, sub, icon, trend, trendUp, gold,
}: {
  label: string; value: string | number; sub?: string
  icon: React.ReactNode; trend?: string; trendUp?: boolean; gold?: boolean
}) {
  return (
    <div className={`gc-stat-card${gold ? ' gc-stat-card-gold' : ''}`}>
      <div className="gc-stat-top">
        <div>
          <p className="gc-stat-label">{label}</p>
          <p className="gc-stat-value">{value}</p>
          {sub && <p className="gc-stat-sub">{sub}</p>}
        </div>
        <div className="gc-stat-icon">{icon}</div>
      </div>
      {trend && (
        <div className="gc-stat-trend">
          <span className={trendUp ? 'gc-stat-trend-up' : 'gc-stat-trend-down'}>
            <ArrowUpRight size={13} />
          </span>
          <span className={`gc-stat-trend-value ${trendUp ? 'gc-stat-trend-up' : 'gc-stat-trend-down'}`}>{trend}</span>
          <span className="gc-stat-trend-label">vs mois dernier</span>
        </div>
      )}
    </div>
  )
}

const RESERVATIONS = [
  { id: 1, guest: 'Ahmed Mansour',     room: 'Suite Présidentielle',  check_in: '10/06', check_out: '14/06', status: 'confirmed',   amount: '4 800 TND' },
  { id: 2, guest: 'Sophie Durand',     room: 'Deluxe Vue Mer',        check_in: '11/06', check_out: '13/06', status: 'checked_in',  amount: '1 200 TND' },
  { id: 3, guest: 'Marco Rossi',       room: 'Junior Suite',          check_in: '12/06', check_out: '16/06', status: 'pending',     amount: '2 100 TND' },
  { id: 4, guest: 'Fatima Al-Rashidi', room: 'Standard',              check_in: '09/06', check_out: '11/06', status: 'checked_out', amount: '560 TND'   },
  { id: 5, guest: 'Jean-Pierre Martin',room: 'Suite Prestige',        check_in: '14/06', check_out: '18/06', status: 'confirmed',   amount: '3 200 TND' },
]

const ACTIVITY = [
  { msg: 'Nouvelle réservation — Suite Prestige',  time: 'Il y a 2 min',    dot: '#1D9E75' },
  { msg: 'Check-in — Sophie Durand, Deluxe',       time: 'Il y a 15 min',   dot: '#D4A017' },
  { msg: 'Réservation spa annulée',              time: 'Il y a 32 min',   dot: '#C0392B' },
  { msg: 'Paiement reçu — 4 800 TND',            time: 'Il y a 1h',       dot: '#1A6FA8' },
  { msg: 'Check-out — Marco Rossi, Junior Suite', time: 'Il y a 1h 20min', dot: '#B89E72' },
]

const STATUS_FR: Record<string, string> = {
  confirmed: 'Confirmé', checked_in: 'En cours', pending: 'En attente',
  checked_out: 'Terminé', cancelled: 'Annulé',
}

function AccommodationSection({
  title,
  icon,
  items,
  kind,
  manageLink,
  emptyLabel,
}: {
  title: string
  icon: React.ReactNode
  items: any[]
  kind: 'chambre' | 'suite' | 'apartment'
  manageLink: string
  emptyLabel: string
}) {
  const coverOf = (c: any) => c.media?.find((m: any) => m.is_cover) ?? c.media?.[0]
  const activeCount = items.filter(c => c.is_active !== false).length

  return (
    <div className="dash-accom-section">
      <div className="dash-accom-section-head">
        <div className="dash-accom-section-title">
          <span className="dash-accom-section-icon">{icon}</span>
          <div>
            <p className="dash-accom-section-name">{title}</p>
            <p className="dash-accom-section-meta">{activeCount} actif{activeCount !== 1 ? 's' : ''} sur {items.length}</p>
          </div>
        </div>
        <Link to={manageLink} className="dash-table-see-all">Gérer</Link>
      </div>
      <div className="dash-room-types dash-room-types-compact">
        {items.length === 0 ? (
          <p className="dash-room-types-empty">{emptyLabel}</p>
        ) : (
          items.slice(0, 4).map((c: any) => {
            const cover = coverOf(c)
            return (
              <div key={c.id} className="dash-room-type-row">
                <div className="dash-room-type-thumb">
                  {cover?.url ? <img src={cover.url} alt="" /> : <ImageIcon size={16} />}
                </div>
                <div className="dash-room-type-info">
                  <p className="dash-room-type-name">{c.name}</p>
                  <p className="dash-room-type-class">
                    {ROOM_CATEGORY_ENUM_LABELS[enumVal(c.category)] ?? enumVal(c.category)}
                    {' · '}{accommodationInventoryLabel(c, kind)}
                  </p>
                </div>
                <div className="dash-room-type-price">
                  {c.price_from
                    ? `${parseFloat(c.price_from).toLocaleString('fr-TN', { minimumFractionDigits: 0 })} TND`
                    : '—'}
                </div>
                {c.is_active === false
                  ? <Badge status="CANCELLED" />
                  : <span className="dash-room-type-active">Actif</span>}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: categories } = useQuery({
    queryKey: ['room-categories'],
    queryFn: () => api.get('/admin/room-categories').then(r => r.data),
  })

  const { data: meetingBookings } = useQuery({
    queryKey: ['meeting-room-bookings', 'dashboard'],
    queryFn: () => api.get('/admin/meeting-room-bookings?per_page=5').then(r => r.data),
  })

  const { data: pendingMeetingBookings } = useQuery({
    queryKey: ['meeting-room-bookings', 'pending-count'],
    queryFn: () => api.get('/admin/meeting-room-bookings?status=PENDING&per_page=1').then(r => r.data),
  })

  const types = Array.isArray(categories) ? categories : []
  const {
    chambres,
    suites,
    apartments,
    activeChambres,
    activeSuites,
    activeApartments,
    activeChambreUnits,
    activeSuiteUnits,
    activeApartmentUnits,
  } = splitAccommodationTypes(types)
  const recentMeetingBookings = meetingBookings?.data ?? []
  const pendingMeetingCount = pendingMeetingBookings?.meta?.total ?? 0

  return (
    <div className="dash-page">
      <div className="dash-banner">
        <div className="dash-banner-glow" />
        <div className="dash-banner-left">
          <p className="dash-banner-eyebrow">Bienvenue</p>
          <h2 className="dash-banner-title">Golden Carthage Hotel & Resort</h2>
          <p className="dash-banner-sub">
            {activeChambreUnits} chambres · {activeSuiteUnits} suites · {activeApartmentUnits} appartements au catalogue actif
          </p>
        </div>
        <div className="dash-banner-kpi">
          <TrendingUp size={18} color="#D4A017" />
          <div>
            <p className="dash-banner-kpi-value">+8.4 %</p>
            <p className="dash-banner-kpi-label">Revenus mensuels</p>
          </div>
        </div>
      </div>

      <div className="gc-grid-3 dash-accom-stats">
        <StatCard label="Chambres" value={activeChambreUnits} sub={`${activeChambres.length} type${activeChambres.length !== 1 ? 's' : ''} actif${activeChambres.length !== 1 ? 's' : ''}`} icon={<BedDouble size={18}/>} />
        <StatCard label="Suites" value={activeSuiteUnits} sub={`${activeSuites.length} type${activeSuites.length !== 1 ? 's' : ''} actif${activeSuites.length !== 1 ? 's' : ''}`} icon={<Crown size={18}/>} />
        <StatCard label="Appartements" value={activeApartmentUnits} sub={`${activeApartments.length} type${activeApartments.length !== 1 ? 's' : ''} actif${activeApartments.length !== 1 ? 's' : ''}`} icon={<Building2 size={18}/>} />
      </div>

      <div className="gc-grid-3">
        <StatCard label="Réservations" value="128" sub="Ce mois-ci" icon={<CalendarDays size={18}/>} trend="+12 %" trendUp />
        <StatCard label="Clients actifs" value="84" sub="Séjours en cours" icon={<Users size={18}/>} trend="-3 %" />
        <StatCard label="Revenu mensuel" value="148K" sub="TND" icon={<TrendingUp size={18}/>} trend="+8.4 %" trendUp gold />
      </div>

      <div className="dash-mid">
        <div className="dash-mid-left">
          <div className="gc-card">
            <div className="gc-card-header">
              <div className="gc-card-header-left">
                <p className="gc-card-title">Hébergement</p>
              </div>
              <Link to="/accommodation" className="dash-table-see-all">Vue d'ensemble</Link>
            </div>
            <div className="dash-accom-sections">
              <AccommodationSection
                title="Chambres"
                icon={<BedDouble size={16} />}
                items={chambres}
                kind="chambre"
                manageLink="/room-categories?type=ROOM&kind=chambre"
                emptyLabel="Aucune chambre définie."
              />
              <AccommodationSection
                title="Suites"
                icon={<Crown size={16} />}
                items={suites}
                kind="suite"
                manageLink="/room-categories?type=ROOM&kind=suite"
                emptyLabel="Aucune suite définie."
              />
              <AccommodationSection
                title="Appartements"
                icon={<Building2 size={16} />}
                items={apartments}
                kind="apartment"
                manageLink="/room-categories?type=APARTMENT"
                emptyLabel="Aucun appartement défini."
              />
            </div>
          </div>

          <div className="gc-grid-3">
            {[
              { label: 'Spa', value: '14', sub: 'Réservations aujourd\'hui', icon: <Sparkles size={16}/>, color: '#9B59B6', to: '/spa-reservations' },
              { label: 'Restaurant', value: '6', sub: 'Tables réservées', icon: <Utensils size={16}/>, color: '#E67E22', to: '/restaurant-reservations' },
              { label: 'Salles & Événements', value: String(pendingMeetingCount), sub: 'Demandes en attente', icon: <Presentation size={16}/>, color: '#40222F', to: '/events' },
            ].map(item => (
              <Link key={item.label} to={item.to} className="gc-card dash-service-card" style={{ textDecoration: 'none' }}>
                <div className="dash-service-icon" style={{ background: `${item.color}18`, color: item.color }}>{item.icon}</div>
                <p className="dash-service-value">{item.value}</p>
                <p className="dash-service-label">{item.label}</p>
                <p className="dash-service-sub">{item.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="gc-card dash-activity">
          <div className="gc-card-header">
            <p className="gc-card-title">Activité Récente</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#B89E72', fontSize: 11 }}>
              <Clock size={12} /><span>Temps réel</span>
            </div>
          </div>
          <div className="dash-activity-list">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="dash-activity-item">
                <span className="dash-activity-dot" style={{ background: a.dot }} />
                <div>
                  <p className="dash-activity-msg">{a.msg}</p>
                  <p className="dash-activity-time">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="gc-card gc-card-none">
        <div className="dash-table-header">
          <p className="gc-card-title">Réservations Salles & Événements</p>
          <Link to="/events" className="dash-table-see-all">Voir tout →</Link>
        </div>
        <table className="gc-table">
          <thead>
            <tr>{['Client', 'Salle', 'Disposition', 'Date', 'Participants', 'Statut'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {recentMeetingBookings.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ fontSize: 13, color: '#B89E72', padding: '20px' }}>
                  Aucune réservation de salle pour le moment.
                </td>
              </tr>
            ) : (
              recentMeetingBookings.map((r: any) => (
                <tr key={r.id} className="clickable">
                  <td>
                    <div className="gc-user-cell">
                      <div className="gc-avatar gc-avatar-sm">{r.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}</div>
                      <span className="gc-user-cell-name">{r.full_name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#6B6145' }}>{r.meeting_room?.name ?? r.room_name}</td>
                  <td style={{ fontSize: 12, color: '#6B6145' }}>{r.disposition ?? '—'}</td>
                  <td style={{ fontSize: 12, color: '#6B6145' }}>
                    {new Date(r.event_date).toLocaleDateString('fr-FR')}
                    <span style={{ display: 'block', fontSize: 11, color: '#B89E72' }}>{formatBookingTime(r.start_time)}</span>
                  </td>
                  <td style={{ fontSize: 12, color: '#6B6145' }}>{r.participants}</td>
                  <td><Badge status={r.status} dot>{BOOKING_STATUS_FR[r.status] ?? r.status}</Badge></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="gc-card gc-card-none">
        <div className="dash-table-header">
          <p className="gc-card-title">Réservations Récentes</p>
          <Link to="/reservations" className="dash-table-see-all">Voir tout →</Link>
        </div>
        <table className="gc-table">
          <thead>
            <tr>{['Client', 'Type de chambre', 'Arrivée', 'Départ', 'Statut', 'Montant'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {RESERVATIONS.map(r => (
              <tr key={r.id} className="clickable">
                <td>
                  <div className="gc-user-cell">
                    <div className="gc-avatar gc-avatar-sm">{r.guest.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
                    <span className="gc-user-cell-name">{r.guest}</span>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: '#6B6145' }}>{r.room}</td>
                <td style={{ fontSize: 12, color: '#6B6145' }}>{r.check_in}</td>
                <td style={{ fontSize: 12, color: '#6B6145' }}>{r.check_out}</td>
                <td><Badge status={r.status} dot>{STATUS_FR[r.status] ?? r.status}</Badge></td>
                <td style={{ fontWeight: 600, color: '#1C1811' }}>{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
