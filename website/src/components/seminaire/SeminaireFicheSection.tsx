import { Link } from 'react-router-dom'
import type { MeetingRoom } from '../../types/api'
import {
  MEETING_DISPOSITIONS,
  meetingDispositionCapacity,
  seminaireReservationUrl,
  type MeetingDisposition,
} from '../../lib/meetingRoom'

interface Props {
  room: MeetingRoom | null
}

interface RowProps {
  disposition: MeetingDisposition
  capacity: string
  reserveHref: string
}

function FicheTechniqueRow({ disposition, capacity, reserveHref }: RowProps) {
  return (
    <div className="fiche-technique__row">
      <div className="fiche-technique__cell-disposition">
        <p className="fiche-technique__disposition-label">Disposition</p>
        <p className="fiche-technique__disposition-name">{disposition.label}</p>
      </div>

      <div className="fiche-technique__cell-icon">
        <img src={disposition.icon} alt={`Disposition ${disposition.label}`} />
      </div>

      <div className="fiche-technique__cell-capacity">
        <div className="fiche-technique__capacity-text">
          <p className="fiche-technique__capacity-label">Capacité</p>
          <p className="fiche-technique__capacity-value">{capacity}</p>
        </div>
        <div className="fiche-technique__btn-wrap">
          <Link to={reserveHref} className="fiche-technique__btn">
            Réserver
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SeminaireFicheSection({ room }: Props) {
  return (
    <section id="sem-fiche-technique" className="fiche-technique" aria-labelledby="fiche-technique-title">
      <div className="container fiche-technique__inner">
        <div className="fiche-technique__brand">
          <img
            src="/logo-figma.svg"
            alt=""
            className="fiche-technique__logo"
            aria-hidden="true"
          />
          <div className="fiche-technique__titles">
            <p className="fiche-technique__label">Salle</p>
            <p className="fiche-technique__name">{room?.name ?? '—'}</p>
          </div>
        </div>

        <h2 id="fiche-technique-title" className="fiche-technique__title">
          Fiche technique
        </h2>

        <div className="fiche-technique__grid-container">
          <div className="fiche-technique__list">
            {MEETING_DISPOSITIONS.map(disposition => (
              <FicheTechniqueRow
                key={disposition.key}
                disposition={disposition}
                capacity={meetingDispositionCapacity(room, disposition)}
                reserveHref={seminaireReservationUrl(room, disposition)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
