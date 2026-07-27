export interface User {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  avatar: string | null
  is_active: boolean
  roles: string[]
  permissions: string[]
  created_at: string
}

export interface Role {
  id: number
  name: string
  guard_name: string
  permissions: Permission[]
}

export interface Permission {
  id: number
  name: string
  guard_name: string
}

export interface RoomCategory {
  id: number
  name: string
  accommodation_type?: 'ROOM' | 'APARTMENT'
  category: string
  description: string | null
  room_count?: number
  suite_count?: number
  rooms_count?: number
}

export interface Room {
  id: number
  category_id: number
  name: string
  type: string
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'OUT_OF_ORDER'
  floor: number
  room_number: string
  price_per_night: string
  weekend_price: string | null
  surface_m2: number
  max_adults: number
  max_children: number
  has_balcony: boolean
  smoking: boolean
  category?: RoomCategory
  amenities?: RoomAmenity[]
}

export interface RoomAmenity {
  id: number
  name: string
  icon: string | null
  category: string
}

export interface Client {
  id: number
  first_name: string
  last_name: string
  full_name?: string
  email: string
  phone: string | null
  country: string | null
  city: string | null
  reservations_count?: number
  created_at: string
}

export interface Reservation {
  id: number
  client_id: number
  room_id: number
  check_in: string
  check_out: string
  nights: number
  adults: number
  children: number
  price_per_night: string
  total_price: string
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED'
  rate_type: string
  special_requests: string | null
  client?: Client
  room?: Room
  payment?: Payment
  created_at: string
}

export interface Payment {
  id: number
  reservation_id: number
  amount: string
  method: string
  status: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'
  transaction_id: string | null
  paid_at: string | null
}

export interface MeetingRoom {
  id: number
  name: string
  type: string
  surface_m2: string
  capacity_theatre: number | null
  capacity_banquet: number | null
  price_full_day: string | null
  price_half_day: string | null
  is_active: boolean
}

export interface EventReservation {
  id: number
  client_id: number
  meeting_room_id: number
  event_name: string
  event_type: string
  event_date: string
  start_time: string
  end_time: string
  guests_count: number
  total_price: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  client?: Client
  meetingRoom?: MeetingRoom
  created_at: string
}

export interface Outlet {
  id: number
  name: string
  type: string
  description: string | null
  opening_time: string | null
  closing_time: string | null
  capacity: number | null
  is_active: boolean
  menus_count?: number
}

export interface Menu {
  id: number
  outlet_id: number
  name: string
  type: string
  is_active: boolean
  outlet?: Outlet
}

export interface Staff {
  id: number
  staff_type_id: number
  outlet_id: number | null
  first_name: string
  last_name: string
  title: string | null
  role: string
  is_featured: boolean
  is_active: boolean
  staffType?: { name: string; department: string }
  outlet?: Outlet
}

export interface SpaService {
  id: number
  name: string
  category: string
  duration_min: number
  price: string
  is_couples: boolean
  is_active: boolean
}

export interface SpaReservation {
  id: number
  client_id: number
  service_id: number
  appointment_date: string
  appointment_time: string
  persons: number
  total_price: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DONE'
  client?: Client
  service?: SpaService
  created_at: string
}

export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
