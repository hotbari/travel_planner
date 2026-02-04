import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { MapPin, Clock, DollarSign, Tag, Calendar, FileText, Snowflake, Save, Upload, X } from 'lucide-react'
import clsx from 'clsx'

export interface PlaceFormData {
  name: string
  latitude: number
  longitude: number
  estimated_duration_minutes: number
  estimated_cost?: number
  category?: string
  business_hours?: string
  notes?: string
}

export interface PlaceTemplate {
  id: string
  name: string
  default_duration_minutes: number
  category?: string
  business_hours_template?: string
  default_cost?: number
  notes_template?: string
}

interface Place {
  id: string
  name: string
  latitude: number
  longitude: number
  estimated_duration_minutes: number
  estimated_cost?: number
  category?: string
  business_hours?: string
  notes?: string
}

interface PlaceFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (place: PlaceFormData) => void
  initialPosition?: { lat: number; lng: number }
  editingPlace?: Place
  templates?: PlaceTemplate[]
  onSaveTemplate?: (template: PlaceTemplate) => void
}

const CATEGORIES = [
  'Restaurant',
  'Cafe',
  'Attraction',
  'Museum',
  'Shopping',
  'Park',
  'Temple/Shrine',
  'Beach',
  'Other'
]

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function PlaceForm({
  isOpen,
  onClose,
  onSubmit,
  initialPosition,
  editingPlace,
  templates = [],
  onSaveTemplate
}: PlaceFormProps) {
  const { t } = useTranslation()

  // Form state
  const [formData, setFormData] = useState<PlaceFormData>({
    name: '',
    latitude: initialPosition?.lat || 0,
    longitude: initialPosition?.lng || 0,
    estimated_duration_minutes: 60,
    estimated_cost: undefined,
    category: '',
    business_hours: '',
    notes: ''
  })

  // UI state
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [businessHoursMode, setBusinessHoursMode] = useState<'json' | 'visual'>('visual')
  const [visualHours, setVisualHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
    Monday: { open: '09:00', close: '18:00', closed: false },
    Tuesday: { open: '09:00', close: '18:00', closed: false },
    Wednesday: { open: '09:00', close: '18:00', closed: false },
    Thursday: { open: '09:00', close: '18:00', closed: false },
    Friday: { open: '09:00', close: '18:00', closed: false },
    Saturday: { open: '10:00', close: '17:00', closed: false },
    Sunday: { open: '10:00', close: '17:00', closed: false }
  })

  // Initialize form data when editing or position changes
  useEffect(() => {
    if (editingPlace) {
      setFormData({
        name: editingPlace.name,
        latitude: editingPlace.latitude,
        longitude: editingPlace.longitude,
        estimated_duration_minutes: editingPlace.estimated_duration_minutes,
        estimated_cost: editingPlace.estimated_cost,
        category: editingPlace.category || '',
        business_hours: editingPlace.business_hours || '',
        notes: editingPlace.notes || ''
      })

      // Parse visual hours if available
      if (editingPlace.business_hours) {
        try {
          const parsed = JSON.parse(editingPlace.business_hours)
          setVisualHours(parsed)
        } catch (e) {
          // Invalid JSON, ignore
        }
      }
    } else if (initialPosition) {
      setFormData(prev => ({
        ...prev,
        latitude: initialPosition.lat,
        longitude: initialPosition.lng
      }))
    }
  }, [editingPlace, initialPosition])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Convert visual hours to JSON if in visual mode
    let businessHoursData = formData.business_hours
    if (businessHoursMode === 'visual') {
      businessHoursData = JSON.stringify(visualHours)
    }

    onSubmit({
      ...formData,
      business_hours: businessHoursData
    })
    handleClose()
  }

  const handleClose = () => {
    // Reset form
    setFormData({
      name: '',
      latitude: initialPosition?.lat || 0,
      longitude: initialPosition?.lng || 0,
      estimated_duration_minutes: 60,
      estimated_cost: undefined,
      category: '',
      business_hours: '',
      notes: ''
    })
    setShowTemplates(false)
    setShowSaveTemplate(false)
    setTemplateName('')
    onClose()
  }

  const loadTemplate = (template: PlaceTemplate) => {
    setFormData(prev => ({
      ...prev,
      estimated_duration_minutes: template.default_duration_minutes,
      category: template.category || '',
      business_hours: template.business_hours_template || '',
      estimated_cost: template.default_cost,
      notes: template.notes_template || ''
    }))

    if (template.business_hours_template) {
      try {
        const parsed = JSON.parse(template.business_hours_template)
        setVisualHours(parsed)
      } catch (e) {
        // Invalid JSON
      }
    }

    setShowTemplates(false)
  }

  const saveAsTemplate = () => {
    if (!templateName.trim() || !onSaveTemplate) return

    const businessHoursData = businessHoursMode === 'visual'
      ? JSON.stringify(visualHours)
      : formData.business_hours

    onSaveTemplate({
      id: `template-${Date.now()}`,
      name: templateName,
      default_duration_minutes: formData.estimated_duration_minutes,
      category: formData.category,
      business_hours_template: businessHoursData,
      default_cost: formData.estimated_cost,
      notes_template: formData.notes
    })

    setShowSaveTemplate(false)
    setTemplateName('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingPlace ? t('common.edit') + ' ' + t('place.add') : t('place.add')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Frost decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
          <Snowflake className="w-full h-full text-sky-300 animate-spin" style={{ animationDuration: '20s' }} />
        </div>

        {/* Template actions */}
        {(templates.length > 0 || onSaveTemplate) && (
          <div className="flex gap-2 mb-4">
            {templates.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Load Template
              </Button>
            )}
            {onSaveTemplate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveTemplate(!showSaveTemplate)}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Template
              </Button>
            )}
          </div>
        )}

        {/* Template selector */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-slate-900/50 border border-sky-500/20 rounded-lg space-y-2">
                <p className="text-xs text-slate-400 mb-2">Select a template:</p>
                {templates.map(template => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => loadTemplate(template)}
                    className="w-full text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 rounded transition-colors text-sm"
                  >
                    <div className="font-medium text-white">{template.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {template.category && <span className="mr-2">{template.category}</span>}
                      <span>{template.default_duration_minutes} min</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save as template */}
        <AnimatePresence>
          {showSaveTemplate && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-slate-900/50 border border-sky-500/20 rounded-lg space-y-2">
                <label className="block text-xs text-slate-400 mb-2">Template name:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Tokyo Restaurant"
                    className="input-field flex-1 text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveAsTemplate}
                    disabled={!templateName.trim()}
                  >
                    Save
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveTemplate(false)
                      setTemplateName('')
                    }}
                    className="p-2 rounded hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name field */}
        <div className="form-group">
          <label className="form-label">
            <MapPin className="w-4 h-4 inline mr-2" />
            {t('place.name')}
            <span className="text-red-400 ml-1">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Tokyo Tower"
            required
            className="input-field"
          />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label text-sm">Latitude</label>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
              required
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label className="form-label text-sm">Longitude</label>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
              required
              className="input-field"
            />
          </div>
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">
            <Tag className="w-4 h-4 inline mr-2" />
            {t('place.category')}
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input-field"
          >
            <option value="">Select category...</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Duration and Cost */}
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">
              <Clock className="w-4 h-4 inline mr-2" />
              {t('place.duration')}
            </label>
            <input
              type="number"
              value={formData.estimated_duration_minutes}
              onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value) || 0 })}
              min="1"
              required
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <DollarSign className="w-4 h-4 inline mr-2" />
              {t('place.cost')}
            </label>
            <input
              type="number"
              value={formData.estimated_cost || ''}
              onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value ? parseFloat(e.target.value) : undefined })}
              min="0"
              step="0.01"
              placeholder="Optional"
              className="input-field"
            />
          </div>
        </div>

        {/* Business Hours */}
        <div className="form-group">
          <div className="flex items-center justify-between mb-2">
            <label className="form-label">
              <Calendar className="w-4 h-4 inline mr-2" />
              {t('place.businessHours')}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBusinessHoursMode('visual')}
                className={clsx(
                  'px-2 py-1 text-xs rounded transition-all',
                  businessHoursMode === 'visual'
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                Visual
              </button>
              <button
                type="button"
                onClick={() => setBusinessHoursMode('json')}
                className={clsx(
                  'px-2 py-1 text-xs rounded transition-all',
                  businessHoursMode === 'json'
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                JSON
              </button>
            </div>
          </div>

          {businessHoursMode === 'json' ? (
            <textarea
              value={formData.business_hours}
              onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
              placeholder='{"Monday": {"open": "09:00", "close": "18:00"}, ...}'
              rows={3}
              className="input-field font-mono text-sm"
            />
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto p-3 bg-slate-900/30 border border-slate-700/50 rounded-lg">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!visualHours[day]?.closed}
                    onChange={(e) => setVisualHours({
                      ...visualHours,
                      [day]: { ...visualHours[day], closed: !e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-300 w-24">{day}</span>
                  {!visualHours[day]?.closed ? (
                    <>
                      <input
                        type="time"
                        value={visualHours[day]?.open || '09:00'}
                        onChange={(e) => setVisualHours({
                          ...visualHours,
                          [day]: { ...visualHours[day], open: e.target.value }
                        })}
                        className="input-field text-sm px-2 py-1"
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="time"
                        value={visualHours[day]?.close || '18:00'}
                        onChange={(e) => setVisualHours({
                          ...visualHours,
                          [day]: { ...visualHours[day], close: e.target.value }
                        })}
                        className="input-field text-sm px-2 py-1"
                      />
                    </>
                  ) : (
                    <span className="text-sm text-slate-500 italic">Closed</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">
            <FileText className="w-4 h-4 inline mr-2" />
            {t('place.notes')}
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional notes..."
            rows={3}
            className="input-field"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
          >
            {editingPlace ? t('common.save') : t('common.add')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>

      <style>{`
        .form-group {
          position: relative;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgb(226 232 240);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }

        /* Frost crystal decorations on focus */
        .input-field:focus {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(56, 189, 248, 0.02) 100%);
          box-shadow:
            0 0 0 1px rgba(14, 165, 233, 0.5),
            0 0 20px rgba(14, 165, 233, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        /* Animated gradient border on select */
        select.input-field {
          cursor: pointer;
        }

        /* Custom scrollbar for hours list */
        .space-y-2.max-h-64::-webkit-scrollbar {
          width: 6px;
        }

        .space-y-2.max-h-64::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 3px;
        }

        .space-y-2.max-h-64::-webkit-scrollbar-thumb {
          background: rgba(14, 165, 233, 0.3);
          border-radius: 3px;
        }

        .space-y-2.max-h-64::-webkit-scrollbar-thumb:hover {
          background: rgba(14, 165, 233, 0.5);
        }

        /* Time input styling */
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(0.7) sepia(1) saturate(3) hue-rotate(180deg);
          cursor: pointer;
        }

        /* Checkbox styling */
        input[type="checkbox"] {
          cursor: pointer;
          transition: all 0.2s;
        }

        input[type="checkbox"]:checked {
          background-color: rgb(14, 165, 233);
          border-color: rgb(14, 165, 233);
        }

        input[type="checkbox"]:hover {
          border-color: rgb(56, 189, 248);
        }
      `}</style>
    </Modal>
  )
}
