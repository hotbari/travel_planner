import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Clock, MapPin, Loader2 } from 'lucide-react'
import { api } from '../../services/api'
import { Place, PlaceSearchResult } from '../../types/trip'
import { Button } from '../common/Button'

interface PlaceSearchProps {
  onAddPlace: (place: Omit<Place, 'id' | 'trip_id' | 'created_at' | 'updated_at'>) => void
}

export function PlaceSearch({ onAddPlace }: PlaceSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null)
  const [duration, setDuration] = useState(60)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const data = await api.searchPlaces(query)
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSelectPlace = (place: PlaceSearchResult) => {
    setSelectedPlace(place)
  }

  const handleAddPlace = () => {
    if (!selectedPlace) return

    onAddPlace({
      name: selectedPlace.name,
      address: selectedPlace.address,
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      google_place_id: selectedPlace.place_id,
      estimated_duration_minutes: duration,
      category: selectedPlace.types?.[0] || undefined,
      priority: 0,
    })

    // Reset
    setSelectedPlace(null)
    setQuery('')
    setResults([])
    setDuration(60)
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a place..."
          className="input-field pr-10"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-white/10"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Search results */}
      <AnimatePresence mode="wait">
        {results.length > 0 && !selectedPlace && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-h-60 overflow-y-auto space-y-1"
          >
            {results.map((place) => (
              <button
                key={place.place_id}
                onClick={() => handleSelectPlace(place)}
                className="w-full p-3 rounded-lg text-left bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <p className="font-medium text-sm">{place.name}</p>
                <p className="text-xs text-slate-400 truncate">{place.address}</p>
                {place.rating && (
                  <span className="text-xs text-amber-400">★ {place.rating}</span>
                )}
              </button>
            ))}
          </motion.div>
        )}

        {/* Selected place form */}
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-slate-800/50 border border-accent-cyan/30"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-accent-cyan/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-accent-cyan" />
              </div>
              <div className="min-w-0">
                <p className="font-medium">{selectedPlace.name}</p>
                <p className="text-sm text-slate-400 truncate">{selectedPlace.address}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">
                <Clock className="w-3 h-3 inline mr-1" />
                Estimated time (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                min={15}
                step={15}
                className="input-field w-32"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddPlace} variant="primary" size="sm">
                <Plus className="w-3 h-3 mr-1" />
                Add Place
              </Button>
              <Button
                onClick={() => setSelectedPlace(null)}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
