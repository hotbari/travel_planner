import { motion } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';
import { useAIStore } from '../../stores/aiStore';

interface AIModeSelectorProps {
  className?: string;
}

export function AIModeSelector({ className = '' }: AIModeSelectorProps) {
  const { mode, setMode } = useAIStore();

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-medium text-text-primary">AI Mode</label>

      <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900/50 rounded-lg border border-white/5">
        {/* Optimize Only */}
        <motion.button
          onClick={() => setMode('optimize_only')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative px-4 py-3 rounded-md font-medium text-sm transition-all duration-300
            ${mode === 'optimize_only'
              ? 'bg-gradient-to-br from-accent-primary to-sky-600 text-white shadow-lg shadow-sky-500/30'
              : 'bg-slate-800/40 text-text-secondary hover:bg-slate-800/60 border border-white/5'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <Zap className={`w-4 h-4 ${mode === 'optimize_only' ? 'text-white' : 'text-text-muted'}`} />
            <span>Optimize Only</span>
          </div>

          {mode === 'optimize_only' && (
            <>
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/40 rounded-tl-md" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/40 rounded-tr-md" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/40 rounded-bl-md" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/40 rounded-br-md" />
            </>
          )}
        </motion.button>

        {/* Suggest + Optimize */}
        <motion.button
          onClick={() => setMode('suggest_and_optimize')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative px-4 py-3 rounded-md font-medium text-sm transition-all duration-300
            ${mode === 'suggest_and_optimize'
              ? 'bg-gradient-to-br from-accent-primary to-sky-600 text-white shadow-lg shadow-sky-500/30'
              : 'bg-slate-800/40 text-text-secondary hover:bg-slate-800/60 border border-white/5'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className={`w-4 h-4 ${mode === 'suggest_and_optimize' ? 'text-white' : 'text-text-muted'}`} />
            <span>Suggest + Optimize</span>
          </div>

          {mode === 'suggest_and_optimize' && (
            <>
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/40 rounded-tl-md" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/40 rounded-tr-md" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/40 rounded-bl-md" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/40 rounded-br-md" />
            </>
          )}
        </motion.button>
      </div>

      {/* Description */}
      <motion.p
        key={mode}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-text-secondary leading-relaxed px-1"
      >
        {mode === 'optimize_only'
          ? 'Reorder existing places for optimal travel efficiency'
          : 'Add AI-powered recommendations and optimize the entire route'}
      </motion.p>
    </div>
  );
}
