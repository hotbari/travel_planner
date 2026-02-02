import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Trash2, GripVertical } from 'lucide-react'
import { Place } from '../../types/trip'
import { Card } from '../common/Card'
import { Button } from '../common/Button'

interface PlaceListProps {
  places: Place[]
  onRemovePlace: (id: number) => void
}

export function PlaceList({ places, onRemovePlace }: PlaceListProps) {
  if (places.length === 0) {
    return (
      <Card variant="default" className="text-center py-12">
        <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No places added yet.</p>
        <p className="text-sm text-slate-500 mt-2">
          Search and add places you want to visit
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-pixel text-accent-cyan">
          <MapPin className="w-4 h-4 inline mr-2" />
          PLACES TO VISIT
        </h3>
        <span className="text-sm text-slate-400">{places.length} places</span>
      </div>

      <AnimatePresence mode="popLayout">
        {places.map((place, index) => (
          <motion.div
            key={place.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card variant="inventory" className="group">
              <div className="flex items-start gap-3">
                {/* Drag handle */}
                <div className="flex-shrink-0 p-1 rounded opacity-30 group-hover:opacity-100 cursor-grab">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                </div>

                {/* Index badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-sm font-mono text-slate-300">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white group-hover:text-accent-cyan transition-colors">
                    {place.name}
                  </h4>
                  <p className="text-sm text-slate-400 truncate">{place.address}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {place.estimated_duration_minutes} min
                    </span>
                    {place.category && (
                      <span className="px-2 py-0.5 rounded bg-slate-700/50">
                        {place.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemovePlace(place.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
