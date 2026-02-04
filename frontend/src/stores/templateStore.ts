import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PlaceTemplate {
  id: string
  name: string
  default_duration_minutes: number
  category?: string
  business_hours_template?: string  // JSON string
  default_cost?: number
  notes_template?: string
  created_at: string
}

interface TemplateStore {
  templates: PlaceTemplate[]
  addTemplate: (template: Omit<PlaceTemplate, 'id' | 'created_at'>) => void
  updateTemplate: (id: string, updates: Partial<PlaceTemplate>) => void
  deleteTemplate: (id: string) => void
  getTemplatesByCategory: (category: string) => PlaceTemplate[]
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: [],

      addTemplate: (template) => {
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9)
        const newTemplate: PlaceTemplate = {
          ...template,
          id,
          created_at: new Date().toISOString(),
        }
        set((state) => ({ templates: [...state.templates, newTemplate] }))
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id ? { ...template, ...updates } : template
          ),
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        }))
      },

      getTemplatesByCategory: (category) => {
        return get().templates.filter((template) => template.category === category)
      },
    }),
    {
      name: 'travel-planner-templates',
    }
  )
)
