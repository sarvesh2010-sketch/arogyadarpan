import { useState, useMemo } from 'react'
import {
  Stethoscope, Pill, FlaskConical, FileText,
  AlertTriangle, Calendar, Heart, Filter, Layers, ExternalLink
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

const eventAccent = {
  diagnosis: 'border-l-4 border-l-cobalt',
  medication: 'border-l-4 border-l-emerald',
  investigation: 'border-l-4 border-l-purple-500',
  consultation: 'border-l-4 border-l-cobalt-light',
  allergy: 'border-l-4 border-l-coral',
  surgery: 'border-l-4 border-l-amber-500',
  default: 'border-l-4 border-l-slate-400',
}

const eventIconBg = {
  diagnosis: 'bg-cobalt-soft text-cobalt',
  medication: 'bg-emerald-soft text-emerald',
  investigation: 'bg-purple-50 text-purple-600',
  consultation: 'bg-blue-50 text-blue-600',
  allergy: 'bg-coral-soft text-coral',
  surgery: 'bg-amber-50 text-amber-600',
  default: 'bg-slate-100 text-slate-600',
}

const dotColors = {
  diagnosis: 'bg-cobalt',
  medication: 'bg-emerald',
  investigation: 'bg-purple-500',
  consultation: 'bg-cobalt-light',
  allergy: 'bg-coral',
  surgery: 'bg-amber-500',
  default: 'bg-slate-400',
}

const CATEGORIES = [
  { id: 'all', label: 'All Timeline Events', icon: Layers },
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
        <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Calendar className="size-6" />
        </div>
        <p className="text-xs font-semibold text-slate-500">No medical timeline events recorded yet</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
          <Filter className="size-3.5 text-slate-400" /> Filter:
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
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer
                ${active
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/80'
                }
              `}
            >
              <Icon className="size-3.5" />
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                active ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Gradient timeline vertical line */}
      <div className="absolute left-[19px] top-16 bottom-4 w-0.5 bg-gradient-to-b from-cobalt via-emerald to-slate-200 rounded-full" />

      {filteredEvents.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400">
          No events found in category "{selectedCategory}".
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event, index) => {
            const type = event.eventType || 'default'
            const Icon = eventIcons[type] || eventIcons.default
            const accentClass = eventAccent[type] || eventAccent.default
            const iconBg = eventIconBg[type] || eventIconBg.default
            const dotColor = dotColors[type] || dotColors.default

            return (
              <div
                key={event.id || index}
                className="relative pl-12 animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Timeline dot */}
                <div className={`absolute left-3.5 top-5 size-3.5 rounded-full ${dotColor} ring-4 ring-white shadow-xs z-10`} />

                {/* Glass Event card */}
                <div className={`glass-card tile-lift p-4 bg-white/95 border border-slate-200/80 shadow-xs ${accentClass}`}>
                  <div className="flex items-start gap-3">
                    <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                      <Icon className="size-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-sm text-slate-900 font-heading">
                          {event.title}
                        </h4>
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                          {event.description}
                        </p>
                      )}
                      {event.sourceDocumentId && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-cobalt font-semibold">
                          <ExternalLink className="size-3" />
                          <span>Source Verified: Document #{event.sourceDocumentId}</span>
                        </div>
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
