import { useState, useMemo } from 'react'
import {
  Stethoscope, Pill, FlaskConical, FileText,
  AlertTriangle, Calendar, Heart, Filter, Layers
} from 'lucide-react'

const eventIcons = {
  diagnosis: Heart,
  medication: Pill,
  investigation: FlaskConical,
  consultation: Stethoscope,
  allergy: AlertTriangle,
  surgery: FileText,
  default: Calendar,
}

const eventColors = {
  diagnosis: 'bg-blue-50 text-blue-700 border-blue-200',
  medication: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  investigation: 'bg-purple-50 text-purple-700 border-purple-200',
  consultation: 'bg-primary-50 text-primary-700 border-primary-200',
  allergy: 'bg-red-50 text-red-700 border-red-200',
  surgery: 'bg-amber-50 text-amber-700 border-amber-200',
  default: 'bg-gray-50 text-gray-700 border-gray-200',
}

const dotColors = {
  diagnosis: 'bg-blue-500',
  medication: 'bg-emerald-500',
  investigation: 'bg-purple-500',
  consultation: 'bg-primary-500',
  allergy: 'bg-red-500',
  surgery: 'bg-amber-500',
  default: 'bg-gray-400',
}

const CATEGORIES = [
  { id: 'all', label: 'All Events', icon: Layers },
  { id: 'diagnosis', label: 'Diagnoses', icon: Heart },
  { id: 'medication', label: 'Medications', icon: Pill },
  { id: 'investigation', label: 'Investigations', icon: FlaskConical },
  { id: 'consultation', label: 'Consultations', icon: Stethoscope },
  { id: 'surgery', label: 'Surgeries', icon: FileText },
]

export default function Timeline({ events = [], className = '' }) {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const counts = useMemo(() => {
    const map = { all: events.length }
    events.forEach(e => {
      const type = e.eventType || 'default'
      map[type] = (map[type] || 0) + 1
    })
    return map
  }, [events])

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') return events
    return events.filter(e => (e.eventType || 'default') === selectedCategory)
  }, [events, selectedCategory])

  if (events.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted">No timeline events yet</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-border-light">
        <span className="text-xs font-semibold text-text-muted flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {CATEGORIES.map(cat => {
          const count = counts[cat.id] || 0
          if (cat.id !== 'all' && count === 0) return null
          const active = selectedCategory === cat.id
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer
                ${active
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'bg-surface-muted text-text-secondary hover:text-text-primary hover:bg-surface-raised border border-border-light'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                active ? 'bg-white/20 text-white' : 'bg-border-light text-text-muted'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Vertical line */}
      <div className="absolute left-5 top-16 bottom-2 w-0.5 bg-border-light" />

      {filteredEvents.length === 0 ? (
        <div className="text-center py-8 text-xs text-text-muted">
          No events found in category "{selectedCategory}".
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEvents.map((event, index) => {
          const type = event.eventType || 'default'
          const Icon = eventIcons[type] || eventIcons.default
          const colorClass = eventColors[type] || eventColors.default
          const dotColor = dotColors[type] || dotColors.default

          return (
            <div
              key={event.id || index}
              className="relative pl-14 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Timeline dot */}
              <div className={`absolute left-3.5 top-3 w-3.5 h-3.5 rounded-full ${dotColor} ring-4 ring-surface z-10`} />

              {/* Event card */}
              <div className={`rounded-xl border p-4 ${colorClass}`}>
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{event.title}</h4>
                      <span className="text-xs opacity-70 flex-shrink-0">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm opacity-80">{event.description}</p>
                    )}
                    {event.sourceDocumentId && (
                      <p className="text-xs opacity-50 mt-2">
                        Source: Document #{event.sourceDocumentId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
