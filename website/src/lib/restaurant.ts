import type { RestaurantOutlet } from '../types/api'

export interface RestaurantCard {
  id?: number
  name: string
  image: string
  images?: string[]
}

export function outletToCard(outlet: RestaurantOutlet): RestaurantCard {
  const images = outlet.images?.length
    ? outlet.images
    : outlet.image
      ? [outlet.image]
      : []

  return {
    id: outlet.id,
    name: outlet.name,
    image: outlet.image ?? images[0] ?? '',
    images,
  }
}

export function restaurantSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}
