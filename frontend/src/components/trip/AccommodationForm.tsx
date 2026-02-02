import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { api } from '../../services/api'
import { Accommodation, PlaceSearchResult } from '../../types/trip'
import { Button } from '../common/Button'

interface AccommodationFormProps {
  onSubmit: (accommodation: Omit<Accommodation, 'id' | 'trip_id' | 'created_at'>) => void
  onCancel: () => void
}

export function AccommodationForm({ onSubmit, onCancel }: AccommodationFormProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null)
  const [checkInTime, setCheckInTime] = useState('15:00')
  const [checkOutTime, setCheckOutTime] = useState('11:00')

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const data = await api.searchPlaces(query + ' hotel')
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!selectedPlace) return

    onSubmit({
      name: selectedPlace.name,
      address: selectedPlace.address,
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      google_place_id: selectedPlace.place_id,
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
    })
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for hotel..."
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

      {/* Results */}
      {results.length > 0 && !selectedPlace && (
        <div className="max-h-40 overflow-y-auto space-y-1">
          {results.map((place) => (
            <button
              key={place.place_id}
              onClick={() => setSelectedPlace(place)}
              className="w-full p-2 rounded text-left bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
            >
              <p className="font-medium text-sm">{place.name}</p>
              <p className="text-xs text-slate-400 truncate">{place.address}</p>
            </button>
          ))}
        </div>
      )}

      {/* Selected */}
      {selectedPlace && (
        <div className="space-y-4">
          <div className="p-3 rounded bg-slate-800/50 border border-accent-cyan/30">
            <p className="font-medium">{selectedPlace.name}</p>
            <p className="text-sm text-slate-400">{selectedPlace.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Check-in</label>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Check-out</label>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} variant="primary" size="sm">
              Add Hotel
            </Button>
            <Button onClick={onCancel} variant="ghost" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!selectedPlace && results.length === 0 && (
        <div className="flex gap-2">
          <Button onClick={onCancel} variant="ghost" size="sm">
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
