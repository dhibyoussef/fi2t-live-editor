import type { RoomCategory } from '../../types/api'
import { roomSalePrice } from '../../lib/roomCategory'
import AccommodationTypeSwitch from './AccommodationTypeSwitch'
import {
  accommodationTypeFromIndex,
  type AccommodationSearchType,
} from '../../lib/accommodationSearch'

export type PriceSort = 'asc' | 'desc'

interface Props {
  priceSort: PriceSort
  filterIndex: number
  onPriceSort: (sort: PriceSort) => void
  onAccommodationChange: (type: AccommodationSearchType) => void
}

export function filterAndSortRooms(
  categories: RoomCategory[],
  priceSort: PriceSort,
): RoomCategory[] {
  const list = [...categories]

  list.sort((a, b) => {
    const pa = roomSalePrice(a.price_from, a.discount_percent) ?? Number.MAX_SAFE_INTEGER
    const pb = roomSalePrice(b.price_from, b.discount_percent) ?? Number.MAX_SAFE_INTEGER
    return priceSort === 'asc' ? pa - pb : pb - pa
  })

  return list
}

export default function HebRoomFilters({
  priceSort,
  filterIndex,
  onPriceSort,
  onAccommodationChange,
}: Props) {
  const priceLabel = priceSort === 'asc' ? 'Prix le plus bas' : 'Prix le plus haut'

  return (
    <div className="heb-res-controls">
      <div className="heb-res-control">
        <span className="heb-res-control__label">{priceLabel}</span>
        <div className="heb-res-control__arrows">
          <button
            type="button"
            className={`heb-res-control__arrow${priceSort === 'asc' ? ' heb-res-control__arrow--active' : ''}`}
            onClick={() => onPriceSort('asc')}
            aria-label="Trier par prix croissant"
          >
            <i className="fa-solid fa-chevron-up" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`heb-res-control__arrow${priceSort === 'desc' ? ' heb-res-control__arrow--active' : ''}`}
            onClick={() => onPriceSort('desc')}
            aria-label="Trier par prix décroissant"
          >
            <i className="fa-solid fa-chevron-down" aria-hidden="true" />
          </button>
        </div>
      </div>

      <AccommodationTypeSwitch
        value={accommodationTypeFromIndex(filterIndex)}
        onChange={onAccommodationChange}
      />
    </div>
  )
}
