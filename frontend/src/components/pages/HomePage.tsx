import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, MapPin, Calendar, Plane } from 'lucide-react'
import { api } from '../../services/api'
import { Trip } from '../../types/trip'
import { Card } from '../common/Card'

export function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const data = await api.getTrips()
      setTrips(data)
    } catch (error) {
      console.error('Failed to load trips:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Plane className="w-8 h-8 text-accent-cyan" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
            Trip Planner
          </h1>
        </div>
        <p className="text-slate-400">
          Plan your adventures like quests in a game
        </p>
      </motion.header>

      {/* New Trip Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <Link to="/trip/new">
          <Card variant="quest" glow className="group cursor-pointer hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent-cyan/20 flex items-center justify-center group-hover:bg-accent-cyan/30 transition-colors">
                <Plus className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Start New Quest</h2>
                <p className="text-sm text-slate-400">Create a new travel plan</p>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* Trips List */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-sm font-pixel text-accent-cyan mb-4">YOUR QUESTS</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="pixel-loading-bar w-32" />
          </div>
        ) : trips.length === 0 ? (
          <Card variant="default" className="text-center py-12">
            <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No trips yet. Start your first adventure!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/trip/${trip.id}`}>
                  <Card variant="inventory" className="group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center text-lg">
                          {trip.country?.greeting?.charAt(0) || '🌍'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-accent-cyan transition-colors">
                            {trip.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {trip.country?.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {trip.num_days} days
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-slate-500">
                        {trip.start_date}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
