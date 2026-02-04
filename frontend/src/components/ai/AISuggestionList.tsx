import { motion } from 'framer-motion';
import { Sparkles, Info } from 'lucide-react';
import { useAIStore } from '../../stores/aiStore';
import { AISuggestionCard } from './AISuggestionCard';

interface AISuggestionListProps {
  className?: string;
}

export function AISuggestionList({ className = '' }: AISuggestionListProps) {
  const { previewData, selectedSuggestions, toggleSuggestion } = useAIStore();

  if (!previewData) return null;

  const { suggested_places } = previewData;

  if (suggested_places.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          p-8 text-center
          bg-gradient-to-b from-slate-800/50 to-slate-900/50
          border border-white/10 rounded-lg
          ${className}
        `}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center">
            <Info className="w-6 h-6 text-text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-1">
              No Suggestions
            </h3>
            <p className="text-sm text-text-secondary">
              AI found your current itinerary is already well-optimized
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-primary" />
          <h3 className="font-semibold text-text-primary">
            AI Recommendations
          </h3>
        </div>
        <span className="text-xs text-text-secondary">
          {selectedSuggestions.size} of {suggested_places.length} selected
        </span>
      </div>

      {/* Selection hint */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="flex items-start gap-2 px-3 py-2 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs"
      >
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Click on cards to toggle selection. Only selected places will be added
          to your itinerary.
        </p>
      </motion.div>

      {/* Cards grid */}
      <div className="grid gap-3">
        {suggested_places.map((place, index) => (
          <AISuggestionCard
            key={index}
            place={place}
            index={index}
            isSelected={selectedSuggestions.has(index)}
            onToggle={toggleSuggestion}
          />
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            suggested_places.forEach((_, idx) => {
              if (!selectedSuggestions.has(idx)) {
                toggleSuggestion(idx);
              }
            });
          }}
          disabled={selectedSuggestions.size === suggested_places.length}
          className="flex-1 px-3 py-2 text-xs font-medium rounded-md bg-slate-800/60 text-text-secondary border border-white/10 hover:bg-slate-700/60 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Select All
        </button>
        <button
          onClick={() => {
            suggested_places.forEach((_, idx) => {
              if (selectedSuggestions.has(idx)) {
                toggleSuggestion(idx);
              }
            });
          }}
          disabled={selectedSuggestions.size === 0}
          className="flex-1 px-3 py-2 text-xs font-medium rounded-md bg-slate-800/60 text-text-secondary border border-white/10 hover:bg-slate-700/60 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Deselect All
        </button>
      </div>
    </div>
  );
}
