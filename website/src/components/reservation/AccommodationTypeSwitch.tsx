import { useTranslation } from 'react-i18next'
import {
  ACCOMMODATION_FILTERS,
  accommodationIndexFromType,
  accommodationTypeFromIndex,
  type AccommodationSearchType,
} from '../../lib/accommodationSearch'

interface Props {
  value: AccommodationSearchType
  onChange: (value: AccommodationSearchType) => void
}

export default function AccommodationTypeSwitch({
  value,
  onChange,
}: Props) {
  const { t } = useTranslation()
  const index = accommodationIndexFromType(value)

  const prev = () => {
    onChange(accommodationTypeFromIndex((index - 1 + ACCOMMODATION_FILTERS.length) % ACCOMMODATION_FILTERS.length))
  }

  const next = () => {
    onChange(accommodationTypeFromIndex((index + 1) % ACCOMMODATION_FILTERS.length))
  }

  return (
    <div className="heb-res-control">
      <span className="heb-res-control__label">{t(ACCOMMODATION_FILTERS[index].labelKey)}</span>
      <div className="heb-res-control__arrows">
        <button
          type="button"
          className="heb-res-control__arrow"
          onClick={prev}
          aria-label={t('booking.filtersPrev')}
        >
          <i className="fa-solid fa-chevron-up" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="heb-res-control__arrow"
          onClick={next}
          aria-label={t('booking.filtersNext')}
        >
          <i className="fa-solid fa-chevron-down" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
