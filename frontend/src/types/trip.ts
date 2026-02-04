export interface Country {
  id: number
  code: string
  name: string
  name_ko?: string
  local_name?: string
  greeting: string
  timezone: string
}

export interface Trip {
  id: number
  name: string
  country_id: number
  country?: Country
  start_date: string
  end_date: string
  num_nights: number
  num_days: number
  preferred_transport_mode?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface TripCreate {
  name: string
  country_code: string
  start_date: string
  end_date: string
  notes?: string
}

export interface Accommodation {
  id: number
  trip_id: number
  name: string
  address?: string
  latitude: number
  longitude: number
  check_in_time: string
  check_out_time: string
  notes?: string
  created_at: string
}

export interface Place {
  id: number
  trip_id: number
  name: string
  address?: string
  latitude: number
  longitude: number
  estimated_duration_minutes: number
  estimated_cost?: number
  business_hours?: string
  open_days?: string
  category?: string
  priority: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface ItineraryItem {
  id: number
  trip_id: number
  day_number: number
  sequence_order: number
  item_type: 'accommodation_start' | 'accommodation_end' | 'place' | 'travel'
  place_id?: number
  accommodation_id?: number
  start_time: string
  end_time?: string
  travel_mode?: string
  travel_duration_minutes?: number
  travel_distance_meters?: number
  travel_polyline?: string
  notes?: string
  place?: Place
  accommodation?: Accommodation
}

export interface DaySchedule {
  day_number: number
  date: string
  day_type: 'arrival' | 'middle' | 'departure'
  items: ItineraryItem[]
}

export interface RouteResult {
  distance_meters: number
  duration_minutes: number
  polyline?: string
  estimated?: boolean
}

export interface BatchRouteResult {
  routes: Array<{
    from_index: number
    to_index: number
    distance_meters: number
    duration_minutes: number
    polyline?: string
  }>
  total_distance_meters: number
  total_duration_minutes: number
}

export interface PlaceSearchResult {
  place_id: string
  name: string
  latitude: number
  longitude: number
  address?: string
  types?: string[]
  rating?: number
}

