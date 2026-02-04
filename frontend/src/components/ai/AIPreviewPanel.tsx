import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useAIStore } from '../../stores/aiStore';
import type { Place } from '../../types/trip';
import { AIPreviewDiff } from './AIPreviewDiff';
import { AISuggestionList } from './AISuggestionList';

interface AIPreviewPanelProps {
  places: Place[];
  onApply: () => void;
  className?: string;
}

export function AIPreviewPanel({ places, onApply, className = '' }: AIPreviewPanelProps) {
  const { status, previewData, cancelPreview, selectedSuggestions } = useAIStore();

  const isVisible = status === 'preview' && previewData;

  const handleApply = () => {
    onApply();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelPreview}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`
              fixed top-0 right-0 bottom-0 z-50
              w-full max-w-2xl
              bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800
              border-l border-white/10
              shadow-2xl shadow-black/50
              flex flex-col
              ${className}
            `}
          >
            {/* Header */}
            <div className="relative flex-shrink-0 px-6 py-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      AI Optimization Preview
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Review and apply suggested changes
                    </p>
                  </div>
                </div>
                <button
                  onClick={cancelPreview}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent-primary/50" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-accent-primary/50" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* AI Reasoning */}
              {previewData?.reasoning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-gradient-to-br from-sky-900/30 to-slate-900/30 border border-accent-primary/30"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-text-primary mb-1">
                        AI Analysis
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {previewData.reasoning}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Suggestions */}
              {previewData && previewData.suggested_places.length > 0 && (
                <AISuggestionList />
              )}

              {/* Optimized route preview */}
              {previewData && (
                <AIPreviewDiff
                  originalPlaces={places}
                  dayAssignments={previewData.day_assignments}
                />
              )}
            </div>

            {/* Footer */}
            <div className="relative flex-shrink-0 px-6 py-4 border-t border-white/10 bg-slate-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={cancelPreview}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm bg-slate-800/80 text-text-secondary border border-white/10 hover:bg-slate-700/80 hover:border-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={previewData?.suggested_places.length > 0 && selectedSuggestions.size === 0}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-br from-accent-primary to-sky-600 text-white shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 border border-sky-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Apply Optimization
                </button>
              </div>

              {/* Corner decorations */}
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-accent-primary/50" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-accent-primary/50" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
