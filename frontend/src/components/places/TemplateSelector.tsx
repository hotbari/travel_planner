import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Bookmark, Trash2, Clock, Tag, AlertCircle, X, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { Button } from '../common/Button'

export interface PlaceTemplate {
  id: string
  name: string
  category: string
  default_duration_minutes: number
  business_hours_template?: string
  default_cost?: string
  notes_template?: string
}

interface TemplateSelectorProps {
  onSelect: (template: PlaceTemplate) => void
  onClose: () => void
}

const STORAGE_KEY = 'travel_planner_place_templates'

export function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<PlaceTemplate[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Load templates from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setTemplates(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }, [])

  // Save templates to localStorage
  const saveTemplates = (updatedTemplates: PlaceTemplate[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates))
      setTemplates(updatedTemplates)
    } catch (error) {
      console.error('Failed to save templates:', error)
    }
  }

  const handleSelect = (template: PlaceTemplate) => {
    setSelectedId(template.id)
    setTimeout(() => {
      onSelect(template)
      onClose()
    }, 200)
  }

  const handleDelete = (id: string) => {
    const updated = templates.filter(t => t.id !== id)
    saveTemplates(updated)
    setDeleteConfirmId(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex-shrink-0 relative px-6 py-4 border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-primary/10 border border-accent-primary/30">
                <Sparkles className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Place Templates</h2>
                <p className="text-xs text-slate-400 mt-0.5">Quick-fill places with saved templates</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {templates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="p-4 rounded-full bg-slate-800/50 border border-white/5 mb-4">
                <Bookmark className="w-12 h-12 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Templates Yet</h3>
              <p className="text-sm text-slate-400 max-w-md">
                Templates will be saved when you use the "Save as Template" option while creating places.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-3">
              <AnimatePresence mode="popLayout">
                {templates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className={clsx(
                      'relative group rounded-lg p-4 border backdrop-blur-sm',
                      'transition-all duration-200 cursor-pointer',
                      selectedId === template.id
                        ? 'bg-accent-primary/10 border-accent-primary shadow-glow-sky'
                        : 'bg-slate-800/60 border-white/10 hover:bg-slate-800/80 hover:border-accent-primary/50'
                    )}
                    onClick={() => handleSelect(template)}
                  >
                    {/* Content */}
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={clsx(
                        'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                        'border transition-colors',
                        selectedId === template.id
                          ? 'bg-accent-primary/20 border-accent-primary/50'
                          : 'bg-slate-700/50 border-slate-600/50 group-hover:border-accent-primary/30'
                      )}>
                        <Bookmark className={clsx(
                          'w-5 h-5 transition-colors',
                          selectedId === template.id ? 'text-accent-primary' : 'text-slate-400'
                        )} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className={clsx(
                          'font-medium mb-1 transition-colors',
                          selectedId === template.id ? 'text-accent-primary' : 'text-white group-hover:text-accent-secondary'
                        )}>
                          {template.name}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          {template.category && (
                            <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700/50 border border-slate-600/30">
                              <Tag className="w-3 h-3" />
                              {template.category}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {template.default_duration_minutes} min
                          </span>
                          {template.default_cost && (
                            <span className="font-mono">
                              {template.default_cost}
                            </span>
                          )}
                        </div>

                        {template.notes_template && (
                          <p className="mt-2 text-xs text-slate-500 line-clamp-1">
                            {template.notes_template}
                          </p>
                        )}
                      </div>

                      {/* Delete button */}
                      <div className="flex-shrink-0">
                        {deleteConfirmId === template.id ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(template.id)}
                              className="text-xs px-2 py-1"
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs px-2 py-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteConfirmId(template.id)
                            }}
                            className={clsx(
                              'p-2 rounded transition-all',
                              'opacity-0 group-hover:opacity-100',
                              'hover:bg-red-500/10 hover:text-red-400',
                              'text-slate-400'
                            )}
                            title="Delete template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Corner decorations */}
                    <div className={clsx(
                      'absolute top-0 left-0 w-2 h-2 border-t border-l rounded-tl-lg transition-colors',
                      selectedId === template.id ? 'border-accent-primary/50' : 'border-accent-primary/20'
                    )} />
                    <div className={clsx(
                      'absolute top-0 right-0 w-2 h-2 border-t border-r rounded-tr-lg transition-colors',
                      selectedId === template.id ? 'border-accent-primary/50' : 'border-accent-primary/20'
                    )} />
                    <div className={clsx(
                      'absolute bottom-0 left-0 w-2 h-2 border-b border-l rounded-bl-lg transition-colors',
                      selectedId === template.id ? 'border-accent-primary/50' : 'border-accent-primary/20'
                    )} />
                    <div className={clsx(
                      'absolute bottom-0 right-0 w-2 h-2 border-b border-r rounded-br-lg transition-colors',
                      selectedId === template.id ? 'border-accent-primary/50' : 'border-accent-primary/20'
                    )} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        {templates.length > 0 && (
          <div className="flex-shrink-0 px-6 py-3 border-t border-white/10 bg-slate-900/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <AlertCircle className="w-4 h-4" />
              <span>Click a template to quick-fill place details</span>
            </div>
          </div>
        )}

        {/* Modal corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent-primary/50 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-accent-primary/50 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-accent-primary/50 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-accent-primary/50 rounded-br-lg" />
      </motion.div>
    </motion.div>
  )
}

// Helper function to save a new template (export for use in PlaceForm)
export function saveTemplate(template: Omit<PlaceTemplate, 'id'>): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const existing: PlaceTemplate[] = stored ? JSON.parse(stored) : []

    const newTemplate: PlaceTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    }

    const updated = [...existing, newTemplate]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save template:', error)
  }
}
