import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardCheck, Check, Edit3, ArrowRight, AlertTriangle } from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import { getActivePatient, buildDynamicConfirmationItems, getActiveDocuments } from '../../services/sessionStore'

export default function ConfirmationScreen() {
  const navigate = useNavigate()
  const patient = getActivePatient()
  const documents = getActiveDocuments()

  // Dynamically build confirmation items from active interview responses & OCR
  const initialItems = useMemo(() => buildDynamicConfirmationItems(), [])
  const [items, setItems] = useState(initialItems)

  const toggleStatus = (index) => {
    setItems(prev => prev.map((item, i) =>
      i === index
        ? { ...item, status: item.status === 'confirmed' ? 'needs_review' : 'confirmed' }
        : item
    ))
  }

  const hasAllergyConflict = items.some(item => item.label.includes('allergy') && item.status === 'needs_review')

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary-50/20 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto space-y-6"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ClipboardCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
            Let's confirm what we understood
          </h1>
          <p className="text-text-secondary">
            Please review your intake information, <span className="font-bold text-text-primary">{patient.name || 'Patient'}</span>
          </p>
        </div>

        {/* Dynamic Confirmation Cards */}
        <div className="space-y-3">
          {items.map((item, i) => (
            <Card key={i} padding="px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide font-bold mb-0.5">
                    {item.label}
                  </p>
                  <p className="font-bold text-text-primary text-base">{item.value}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'needs_review' && (
                    <Badge severity="medium" dot>Needs confirmation</Badge>
                  )}
                  <button
                    onClick={() => toggleStatus(i)}
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer
                      ${item.status === 'confirmed'
                        ? 'bg-success-light text-success'
                        : 'bg-gray-100 text-text-muted hover:bg-amber-50 hover:text-amber-600'
                      }
                    `}
                  >
                    {item.status === 'confirmed' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Dynamic Allergy Conflict Alert */}
        {hasAllergyConflict && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm mb-1">Allergy Record Verification Required</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your uploaded medical records indicate a documented drug allergy, but your intake response noted no known allergy.
                Your consulting doctor will review this flag during your consultation.
              </p>
            </div>
          </div>
        )}

        <Button
          size="lg"
          fullWidth
          onClick={() => navigate('/patient/complete')}
          iconRight={ArrowRight}
        >
          Confirm Intake & Finish
        </Button>
      </motion.div>
    </div>
  )
}
