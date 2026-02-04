import { motion } from 'framer-motion';
import { MapPin, Clock, Info, CheckCircle2 } from 'lucide-react';
import type { SuggestedPlace } from '../../types/ai';

interface AISuggestionCardProps {
  place: SuggestedPlace;
  index: number;
  isSelected: boolean;
  onToggle: (index: number) => void;
}

export function AISuggestionCard({
  place,
  index,
  isSelected,
  onToggle,
}: AISuggestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        relative group cursor-pointer
        rounded-lg border backdrop-blur-sm
        transition-all duration-300
        ${isSelected
          ? 'bg-gradient-to-br from-sky-900/40 to-slate-900/40 border-accent-primary/60 shadow-lg shadow-sky-500/20'
          : 'bg-gradient-to-b from-slate-800/70 to-slate-900/70 border-white/10 hover:border-white/20'
        }
      `}
      onClick={() => onToggle(index)}
    >
      {/* Selection indicator */}
      <div
        className={`
          absolute top-3 right-3 z-10
          w-6 h-6 rounded-full
          flex items-center justify-center
          border-2 transition-all duration-300
          ${isSelected
            ? 'bg-accent-primary border-accent-primary shadow-lg shadow-sky-500/40'
            : 'bg-slate-800/80 border-white/20 group-hover:border-accent-primary/40'
          }
        `}
      >
        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
      </div>

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="pr-8">
          <h3 className="font-semibold text-base text-text-primary leading-tight">
            {place.name}
          </h3>
          {place.category && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-slate-700/50 text-text-secondary border border-white/10">
              {place.category}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-text-secondary">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent-secondary" />
            <span className="flex-1 text-xs">
              {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="w-4 h-4 flex-shrink-0 text-accent-secondary" />
            <span className="text-xs">
              ~{place.estimated_duration_minutes} minutes
            </span>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent-primary" />
            <p className="flex-1 text-xs text-text-secondary leading-relaxed italic">
              {place.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      {isSelected && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-accent-primary/60 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-accent-primary/60 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-accent-primary/60 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-accent-primary/60 rounded-br-lg" />
        </>
      )}

      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent-primary/0 to-accent-primary/0 pointer-events-none"
        whileHover={{ from: 'accent-primary/5', to: 'sky-600/5' }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
