import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Calendar, Sparkles } from 'lucide-react'
import { api } from '../../services/api'
import { Country } from '../../types/trip'
import { Card } from '../common/Card'
import { Button } from '../common/Button'

export function NewTripPage() {
  const navigate = useNavigate()
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadCountries()
  }, [])

  const loadCountries = async () => {
    try {
      const data = await api.getCountries()
      setCountries(data)
    } catch (error) {
      console.error('Failed to load countries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCountry || !name || !startDate || !endDate) return

    setCreating(true)
    try {
      const trip = await api.createTrip({
        name,
        country_code: selectedCountry.code,
        start_date: startDate,
        end_date: endDate,
      })
      navigate(`/trip/${trip.id}`)
    } catch (error) {
      console.error('Failed to create trip:', error)
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quests
        </button>
        <h1 className="text-2xl font-bold text-white">Start New Quest</h1>
        <p className="text-slate-400">Choose your destination and dates</p>
      </motion.header>

      <div className="max-w-2xl mx-auto">
        {/* Greeting Display */}
        <AnimatePresence mode="wait">
          {selectedCountry && (
            <motion.div
              key={selectedCountry.code}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8 text-center"
            >
              <Card variant="hud" glow className="inline-block px-8 py-6">
                <p className="text-slate-400 text-sm mb-2">
                  In {selectedCountry.name}, we say...
                </p>
                <motion.h2
                  key={selectedCountry.greeting}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent"
                >
                  {selectedCountry.greeting}
                </motion.h2>
                {selectedCountry.local_name && (
                  <p className="text-slate-500 text-sm mt-2">
                    {selectedCountry.local_name}
                  </p>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Country Selection */}
          <Card variant="default">
            <label className="block text-sm font-pixel text-accent-cyan mb-4">
              <MapPin className="w-4 h-4 inline mr-2" />
              DESTINATION
            </label>
            {loading ? (
              <div className="pixel-loading-bar w-full" />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => setSelectedCountry(country)}
                    className={`p-3 rounded-lg text-left transition-all ${
                      selectedCountry?.code === country.code
                        ? 'bg-accent-cyan/20 border-accent-cyan/50 border'
                        : 'bg-slate-800/50 border-slate-700/50 border hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="block font-medium text-sm">{country.name}</span>
                    <span className="block text-xs text-slate-500 mt-1">
                      {country.greeting}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Trip Name */}
          <Card variant="default">
            <label className="block text-sm font-pixel text-accent-cyan mb-4">
              <Sparkles className="w-4 h-4 inline mr-2" />
              QUEST NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tokyo Spring Adventure"
              className="input-field"
              required
            />
          </Card>

          {/* Dates */}
          <Card variant="default">
            <label className="block text-sm font-pixel text-accent-cyan mb-4">
              <Calendar className="w-4 h-4 inline mr-2" />
              DATES
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="input-field"
                  required
                />
              </div>
            </div>
            {startDate && endDate && (
              <p className="text-sm text-slate-400 mt-4">
                {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} nights,{' '}
                {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
              </p>
            )}
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!selectedCountry || !name || !startDate || !endDate || creating}
          >
            {creating ? (
              <>
                <span className="pixel-loading-bar w-4 h-4 mr-2" />
                Creating...
              </>
            ) : (
              'Begin Quest'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
