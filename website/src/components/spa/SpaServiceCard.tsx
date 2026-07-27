import { Link } from 'react-router-dom'
import type { SpaService } from '../../types/api'
import { formatDuration, formatSpaPrice, spaCategoryLabel } from '../../lib/spaService'

interface Props {
  service: SpaService
}

export default function SpaServiceCard({ service }: Props) {
  const price = formatSpaPrice(service.price)

  return (
    <article className="spa-card">
      <div className="spa-card__head">
        <span className="spa-card__category">{spaCategoryLabel(service.category)}</span>
        {service.is_couples && (
          <span className="spa-card__couples"><i className="fa-solid fa-heart" /> Duo</span>
        )}
      </div>
      <h3 className="spa-card__name">{service.name}</h3>
      {service.description && (
        <p className="spa-card__desc">{service.description}</p>
      )}
      <div className="spa-card__meta">
        <span><i className="fa-regular fa-clock" /> {formatDuration(service.duration_min)}</span>
        {price && <span className="spa-card__price">{price}</span>}
      </div>
      <Link
        to={`/spa/reservation?experience=${encodeURIComponent(service.name)}`}
        className="spa-card__cta"
      >
        Réserver <i className="fa-solid fa-arrow-right" />
      </Link>
    </article>
  )
}
