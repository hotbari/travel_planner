import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Hotel, MapPin, Plus, Calendar, Route, Wand2 } from 'lucide-react'
import { api } from '../../services/api'
import { Trip, Place, Accommodation, DaySchedule } from '../../types/trip'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { PlaceSearch } from '../places/PlaceSearch'
import { PlaceList } from '../places/PlaceList'
import { ItineraryBoard } from '../itinerary/ItineraryBoard'
import { AccommodationForm } from '../trip/AccommodationForm'

type Tab = 'places' | 'itinerary'

export function TripPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tripId = parseInt(id || '0')

  const [trip, setTrip] = useState<Trip | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [itinerary, setItinerary] = useState<DaySchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('places')
  const [showAccommodationForm, setShowAccommodationForm] = useState(false)

  useEffect(() => {
    if (tripId) {
      loadTrip()
    }
  }, [tripId])

  const loadTrip = async () => {
    try {
      const [tripData, placesData, accommodationsData, itineraryData] = await Promise.all([
        api.getTrip(tripId),
        api.getPlaces(tripId),
        api.getAccommodations(tripId),
        api.getItinerary(tripId),
      ])
      setTrip(tripData)
      setPlaces(placesData)
      setAccommodations(accommodationsData)
      setItinerary(itineraryData)
    } catch (error) {
      console.error('Failed to load trip:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlace = async (place: Omit<Place, 'id' | 'trip_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newPlace = await api.createPlace(tripId, place)
      setPlaces([...places, newPlace])
    } catch (error) {
      console.error('Failed to add place:', error)
    }
  }

  const handleRemovePlace = async (placeId: number) => {
    try {
      await api.deletePlace(placeId)
      setPlaces(places.filter(p => p.id !== placeId))
    } catch (error) {
      console.error('Failed to remove place:', error)
    }
  }

  const handleAddAccommodation = async (accommodation: Omit<Accommodation, 'id' | 'trip_id' | 'created_at'>) => {
    try {
      const newAccommodation = await api.createAccommodation(tripId, accommodation)
      setAccommodations([...accommodations, newAccommodation])
      setShowAccommodationForm(false)
    } catch (error) {
      console.error('Failed to add accommodation:', error)
    }
  }

  const handleGenerateItinerary = async () => {
    try {
      await api.generateItinerary(tripId)
      const itineraryData = await api.getItinerary(tripId)
      setItinerary(itineraryData)
      setActiveTab('itinerary')
    } catch (error) {
      console.error('Failed to generate itinerary:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="pixel-loading-bar w-48" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="default" className="text-center p-8">
          <p className="text-slate-400">Trip not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Home
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-secondary/80 backdrop-blur-sm border-b border-white/5 p-4 sticky top-0 z-20"
      >
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quests
          </button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{trip.name}</h1>
                <span className="px-2 py-1 rounded bg-accent-cyan/20 text-accent-cyan text-sm">
                  {trip.country?.greeting}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {trip.country?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {trip.start_date} - {trip.end_date}
                </span>
                <span className="flex items-center gap-1">
                  <Route className="w-3 h-3" />
                  {trip.num_days} days
                </span>
              </div>
            </div>
            <Button
              onClick={handleGenerateItinerary}
              variant="primary"
              disabled={places.length === 0}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Itinerary
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Tabs */}
      <div className="bg-bg-secondary/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('places')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'places'
                  ? 'text-accent-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Places ({places.length})
              {activeTab === 'places' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'itinerary'
                  ? 'text-accent-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Itinerary
              {activeTab === 'itinerary' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {activeTab === 'places' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Place Search & Accommodation */}
            <div className="space-y-6">
              {/* Accommodation */}
              <Card variant="quest">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-pixel text-accent-cyan">
                    <Hotel className="w-4 h-4 inline mr-2" />
                    ACCOMMODATION
                  </h3>
                  {accommodations.length === 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowAccommodationForm(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
                {accommodations.length > 0 ? (
                  <div className="space-y-2">
                    {accommodations.map((acc) => (
                      <div key={acc.id} className="p-3 rounded bg-slate-800/50">
                        <p className="font-medium">{acc.name}</p>
                        <p className="text-sm text-slate-400">{acc.address}</p>
                      </div>
                    ))}
                  </div>
                ) : showAccommodationForm ? (
                  <AccommodationForm
                    onSubmit={handleAddAccommodation}
                    onCancel={() => setShowAccommodationForm(false)}
                  />
                ) : (
                  <p className="text-sm text-slate-500">No accommodation added yet</p>
                )}
              </Card>

              {/* Place Search */}
              <Card variant="quest">
                <h3 className="text-sm font-pixel text-accent-cyan mb-4">
                  <Plus className="w-4 h-4 inline mr-2" />
                  ADD PLACE
                </h3>
                <PlaceSearch onAddPlace={handleAddPlace} />
              </Card>
            </div>

            {/* Right: Place List */}
            <div className="lg:col-span-2">
              <PlaceList places={places} onRemovePlace={handleRemovePlace} />
            </div>
          </div>
        ) : (
          <ItineraryBoard
            trip={trip}
            itinerary={itinerary}
            setItinerary={setItinerary}
          />
        )}
      </div>
    </div>
  )
}
