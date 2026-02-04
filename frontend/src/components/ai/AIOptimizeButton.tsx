import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useAIStore } from '../../stores/aiStore';

interface AIOptimizeButtonProps {
  tripId: number;
  disabled?: boolean;
  className?: string;
}

export function AIOptimizeButton({ tripId, disabled, className = '' }: AIOptimizeButtonProps) {
  const { status, requestOptimization, error } = useAIStore();

  const isLoading = status === 'loading';
  const isDisabled = disabled || isLoading;

  const handleClick = () => {
    requestOptimization(tripId);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <motion.button
        onClick={handleClick}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        className={`
          relative w-full px-5 py-3 rounded-lg
          font-semibold text-sm transition-all duration-300
          flex items-center justify-center gap-2.5
          ${isDisabled
            ? 'bg-slate-800/40 text-text-muted cursor-not-allowed border border-white/5'
            : 'bg-gradient-to-br from-accent-primary via-sky-500 to-accent-primary text-white shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 border border-sky-400/50'
          }
        `}
      >
        {/* Background glow effect */}
        {!isDisabled && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: ['-200%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Icon and text */}
        <div className="relative flex items-center gap-2.5">
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Optimizing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Get AI Suggestion</span>
            </>
          )}
        </div>

        {/* Corner decorations (only when active) */}
        {!isDisabled && (
          <>
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/40 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
          </>
        )}
      </motion.button>

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-start gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-xs"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{error.message}</p>
            {error.retryAfter && (
              <p className="text-red-400/70 mt-0.5">
                Please wait {error.retryAfter} seconds
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
