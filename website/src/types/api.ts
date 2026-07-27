export interface RoomCategoryMedia {
  id: number
  url: string
  alt_text?: string | null
  is_cover?: boolean
}

export interface RoomCategoryAmenity {
  id: number
  name: string
  icon?: string | null
  category?: string
}

export interface RoomCategory {
  id: number
  name: string
  accommodation_type?: 'ROOM' | 'APARTMENT'
  category: string
  description: string | null
  price_from?: string | number | null
  discount_percent?: number | null
  surface_m2?: number | null
  max_adults?: number
  max_children?: number
  room_count?: number
  suite_count?: number
  is_active?: boolean
  media?: RoomCategoryMedia[]
  amenities?: RoomCategoryAmenity[]
}

export interface CarouselItem {
  id: number
  image_url: string
  image_alt?: string | null
  title?: string | null
  subtitle?: string | null
  description?: string | null
  button_text?: string | null
  button_link?: string | null
  text_position?: string | null
  overlay_opacity?: number | null
  layout?: string | null
  sort_order?: number
}

export interface SpaService {
  id: number
  name: string
  category: string
  description: string | null
  duration_min: number
  price: string | number
  is_couples: boolean
  is_active?: boolean
  media?: RoomCategoryMedia[]
}

export interface Carousel {
  id: number
  slug: string
  type: 'carousel' | 'gallery'
  name: string
  active_items: CarouselItem[]
}

export interface Partner {
  id: number
  name: string
  logo_url: string | null
  sort_order?: number
}

export interface Review {
  id: number
  text: string
  author_name: string
  origin: string
  avatar_url: string | null
  platform: 'google' | 'tripadvisor' | null
  rating: number
  sort_order: number
  is_active: boolean
}

export interface OutletChef {
  id?: number
  name: string
  title?: string | null
  slogan?: string | null
  description?: string | null
  image?: string | null
}

export interface RestaurantOutlet {
  id: number
  name: string
  type: string
  description: string | null
  location: string | null
  opening_time?: string | null
  closing_time?: string | null
  accepts_reservation?: boolean
  image?: string | null
  images?: string[]
  chef?: OutletChef | null
}

export interface MeetingRoom {
  id: number
  name: string
  type: string
  capacity_theatre?: number | null
  capacity_classroom?: number | null
  capacity_banquet?: number | null
  capacity_cocktail?: number | null
  capacity_boardroom?: number | null
  capacity_en_u?: number | null
  capacity_conference?: number | null
  capacity_cabaret?: number | null
  surface_m2: number | string
  height_m?: number | string | null
  description?: string | null
  is_active?: boolean
  amenities?: { id: number; name: string; icon?: string | null }[]
  media?: RoomCategoryMedia[]
}
