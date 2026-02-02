import axios from 'axios'
import {
  Country,
  Trip,
  TripCreate,
  Place,
  PlaceSearchResult,
  Accommodation,
  DaySchedule,
} from '../types/trip'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {
  // Countries
  async getCountries(): Promise<Country[]> {
    const { data } = await client.get('/countries')
    return data
  },

  async getCountryGreeting(code: string): Promise<{ greeting: string }> {
    const { data } = await client.get(`/countries/${code}/greeting`)
    return data
  },

  // Trips
  async getTrips(): Promise<Trip[]> {
    const { data } = await client.get('/trips')
    return data
  },

  async getTrip(id: number): Promise<Trip> {
    const { data } = await client.get(`/trips/${id}`)
    return data
  },

  async createTrip(trip: TripCreate): Promise<Trip> {
    const { data } = await client.post('/trips', trip)
    return data
  },

  async updateTrip(id: number, trip: Partial<TripCreate>): Promise<Trip> {
    const { data } = await client.put(`/trips/${id}`, trip)
    return data
  },

  async deleteTrip(id: number): Promise<void> {
    await client.delete(`/trips/${id}`)
  },

  // Accommodations
  async getAccommodations(tripId: number): Promise<Accommodation[]> {
    const { data } = await client.get(`/accommodations/trips/${tripId}/accommodations`)
    return data
  },

  async createAccommodation(
    tripId: number,
    accommodation: Omit<Accommodation, 'id' | 'trip_id' | 'created_at'>
  ): Promise<Accommodation> {
    const { data } = await client.post(
      `/accommodations/trips/${tripId}/accommodations`,
      accommodation
    )
    return data
  },

  async deleteAccommodation(id: number): Promise<void> {
    await client.delete(`/accommodations/${id}`)
  },

  // Places
  async getPlaces(tripId: number): Promise<Place[]> {
    const { data } = await client.get(`/places/trips/${tripId}/places`)
    return data
  },

  async createPlace(
    tripId: number,
    place: Omit<Place, 'id' | 'trip_id' | 'created_at' | 'updated_at'>
  ): Promise<Place> {
    const { data } = await client.post(`/places/trips/${tripId}/places`, place)
    return data
  },

  async updatePlace(id: number, place: Partial<Place>): Promise<Place> {
    const { data } = await client.put(`/places/${id}`, place)
    return data
  },

  async deletePlace(id: number): Promise<void> {
    await client.delete(`/places/${id}`)
  },

  async searchPlaces(
    query: string,
    location?: { lat: number; lng: number }
  ): Promise<PlaceSearchResult[]> {
    const { data } = await client.post('/places/search', {
      query,
      location,
      radius: 50000,
    })
    return data
  },

  // Itinerary
  async getItinerary(tripId: number): Promise<DaySchedule[]> {
    const { data } = await client.get(`/itinerary/trips/${tripId}/itinerary`)
    return data
  },

  async generateItinerary(tripId: number): Promise<void> {
    await client.post(`/itinerary/trips/${tripId}/itinerary/generate`)
  },

  async reorderItinerary(
    tripId: number,
    dayNumber: number,
    itemIds: number[]
  ): Promise<void> {
    await client.post('/itinerary/reorder', {
      trip_id: tripId,
      day_number: dayNumber,
      item_ids: itemIds,
      recalculate_routes: true,
    })
  },

  async moveItineraryItem(
    tripId: number,
    itemId: number,
    fromDay: number,
    toDay: number,
    newSequence: number
  ): Promise<void> {
    await client.post('/itinerary/move', {
      trip_id: tripId,
      item_id: itemId,
      from_day: fromDay,
      to_day: toDay,
      new_sequence: newSequence,
      recalculate_routes: true,
    })
  },
}
