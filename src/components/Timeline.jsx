import {
  Stethoscope, Pill, FlaskConical, FileText,
  AlertTriangle, Calendar, Heart
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
  diagnosis: 'bg-blue-50 text-blue-600 border-blue-200',
  medication: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  investigation: 'bg-purple-50 text-purple-600 border-purple-200',
  consultation: 'bg-primary-50 text-primary-600 border-primary-200',
  allergy: 'bg-red-50 text-red-600 border-red-200',
  surgery: 'bg-orange-50 text-orange-600 border-orange-200',
  default: 'bg-gray-50 text-gray-600 border-gray-200',
}

const dotColors = {
  diagnosis: 'bg-blue-500',
  medication: 'bg-emerald-500',
  investigation: 'bg-purple-500',
  consultation: 'bg-primary-500',
  allergy: 'bg-red-500',
  surgery: 'bg-orange-500',
  default: 'bg-gray-400',
}

export default function Timeline({ events = [], className = '' }) {
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
      {/* Vertical line */}
      <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border-light" />

      <div className="space-y-6">
        {events.map((event, index) => {
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
