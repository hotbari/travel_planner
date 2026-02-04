import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../common/Button'
import { MapPin, Check, X } from 'lucide-react'

interface ClickToPlaceProps {
  position: { lat: number; lng: number } | null
  onConfirm: (position: { lat: number; lng: number }) => void
  onCancel: () => void
}

export function ClickToPlace({ position, onConfirm, onCancel }: ClickToPlaceProps) {
  if (!position) return null

  const handleConfirm = () => {
    onConfirm(position)
  }

  // Format coordinates with 4 decimal precision
  const formattedLat = position.lat.toFixed(4)
  const formattedLng = position.lng.toFixed(4)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -10 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
          mass: 0.8,
        }}
        className="click-to-place-popup"
      >
        {/* Geometric border decoration */}
        <div className="absolute -inset-[2px] bg-gradient-to-br from-accent-primary/40 via-accent-secondary/20 to-transparent rounded-lg blur-sm pointer-events-none" />

        {/* Main content container */}
        <div className="relative bg-slate-900/95 backdrop-blur-md rounded-lg border border-accent-primary/30 shadow-2xl overflow-hidden">
          {/* Top accent line */}
          <div className="h-1 bg-gradient-to-r from-transparent via-accent-primary to-transparent" />

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Header with icon */}
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                className="p-1.5 rounded-md bg-accent-primary/20 border border-accent-primary/40"
              >
                <MapPin className="w-4 h-4 text-accent-primary" strokeWidth={2.5} />
              </motion.div>

              <motion.h3
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-sm font-semibold text-white tracking-wide"
              >
                Add place here?
              </motion.h3>
            </div>

            {/* Coordinates display */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 px-3 py-2 bg-slate-800/60 rounded border border-slate-700/50"
            >
              <div className="flex-1 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Lat:</span>
                <span className="text-accent-secondary font-medium">{formattedLat}</span>
              </div>
              <div className="w-px h-4 bg-slate-700/50" />
              <div className="flex-1 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Lng:</span>
                <span className="text-accent-secondary font-medium">{formattedLng}</span>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex gap-2"
            >
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirm}
                className="flex-1 gap-1.5 text-xs font-semibold tracking-wide"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                Yes
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={onCancel}
                className="flex-1 gap-1.5 text-xs font-semibold tracking-wide"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                Cancel
              </Button>
            </motion.div>
          </div>

          {/* Bottom corner accents */}
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-accent-primary/20 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-accent-primary/20 rounded-br-lg" />
        </div>

        {/* Pixelated glow effect */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-accent-primary/30 blur-md rounded-full" />
      </motion.div>
    </AnimatePresence>
  )
}
