const CALENDAR_ICON = '/imgs/calendar 5.svg'

export interface HebergementSummaryBarProps {
  checkin: string
  checkout: string
  adults: number
  children: number
  cartCount: number
  totalAmount: number | null
}

function formatDisplayDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTotal(amount: number | null): string {
  if (amount == null || Number.isNaN(amount)) return '0,000'
  return amount.toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}

function travelersLabel(adults: number, children: number): string {
  const a = `${adults} Adulte${adults > 1 ? 's' : ''}`
  const c = `${children} Enfant${children !== 1 ? 's' : ''}`
  return `${a}, ${c}`
}

export default function HebergementSummaryBar({
  checkin,
  checkout,
  adults,
  children,
  cartCount,
  totalAmount,
}: HebergementSummaryBarProps) {
  return (
    <div className="heb-summary-bar">
      <div className="heb-summary-bar__inner">
        <div className="heb-summary-bar__field">
          <span className="heb-summary-bar__label">Date arrivée</span>
          <span className="heb-summary-bar__value">
            {formatDisplayDate(checkin)}
            <img src={CALENDAR_ICON} alt="" className="heb-summary-bar__icon" aria-hidden="true" />
          </span>
        </div>

        <div className="heb-summary-bar__sep" aria-hidden="true" />

        <div className="heb-summary-bar__field">
          <span className="heb-summary-bar__label">Date départ</span>
          <span className="heb-summary-bar__value">
            {formatDisplayDate(checkout)}
            <img src={CALENDAR_ICON} alt="" className="heb-summary-bar__icon" aria-hidden="true" />
          </span>
        </div>

        <div className="heb-summary-bar__sep" aria-hidden="true" />

        <div className="heb-summary-bar__field">
          <span className="heb-summary-bar__label">Voyageur</span>
          <span className="heb-summary-bar__value heb-summary-bar__value--plain">
            {travelersLabel(adults, children)}
          </span>
        </div>

        <div className="heb-summary-bar__sep" aria-hidden="true" />

        <div className="heb-summary-bar__field">
          <span className="heb-summary-bar__label">Votre panier</span>
          <span className="heb-summary-bar__value heb-summary-bar__value--plain">
            {cartCount} article{cartCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="heb-summary-bar__sep" aria-hidden="true" />

        <div className="heb-summary-bar__field heb-summary-bar__field--total">
          <span className="heb-summary-bar__label">Total</span>
          <span className="heb-summary-bar__total">
            {formatTotal(totalAmount)} <span className="heb-summary-bar__currency">TND</span>
          </span>
        </div>
      </div>
    </div>
  )
}
