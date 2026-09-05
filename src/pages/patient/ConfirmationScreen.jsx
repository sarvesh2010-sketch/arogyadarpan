import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardCheck, Check, Edit3, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react'
import LanguageSelector from '../../components/LanguageSelector'
import { getActivePatient, buildDynamicConfirmationItems } from '../../services/sessionStore'
import { useLanguage } from '../../context/LanguageContext'

export default function ConfirmationScreen() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const patient = getActivePatient()

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

  const hasAllergyConflict = items.some(item => item.label.toLowerCase().includes('allergy') && item.status === 'needs_review')

  return (
    <div className="min-h-screen kiosk-canvas text-slate-900 px-4 sm:px-6 py-6 sm:py-12 pb-28 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/patient/document-review')}
            className="glass-pill px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>{t('back', 'Back')}</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="status-chip bg-cobalt-soft text-cobalt font-bold">
              Step 5 of 6 • पुष्टि
            </span>
            <LanguageSelector variant="compact" />
          </div>
        </div>

        <div className="text-center">
          <div className="size-16 rounded-2xl bg-gradient-to-tr from-cobalt to-cobalt-deep flex items-center justify-center mx-auto mb-3 shadow-cobalt text-white">
            <ClipboardCheck className="size-8" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
            {t('letsConfirm', "Let's confirm what we understood")}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {t('confirmSubtext', 'Please review your intake information before sending to the doctor')}, <strong className="text-slate-900">{patient.name || 'Patient'}</strong>
          </p>
        </div>

        {/* Dynamic Confirmation Cards */}
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="glass-card tile-lift p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">
                  {item.label}
                </p>
                <p className="font-bold text-slate-900 text-sm sm:text-base font-heading">{item.value}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.status === 'needs_review' && (
                  <span className="status-chip bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                    {t('needsVerification', 'Needs confirmation')}
                  </span>
                )}
                <button
                  onClick={() => toggleStatus(i)}
                  className={`
                    size-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs
                    ${item.status === 'confirmed'
                      ? 'bg-emerald text-white'
                      : 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                    }
                  `}
                >
                  {item.status === 'confirmed' ? (
                    <Check className="size-5 stroke-[2.5]" />
                  ) : (
                    <Edit3 className="size-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Allergy Conflict Alert */}
        {hasAllergyConflict && (
          <div className="bg-coral-soft/50 rounded-2xl border border-coral/30 p-4 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="size-5 text-coral mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-coral-deep text-xs uppercase tracking-wide mb-1">
                Allergy Record Verification Required
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Your uploaded medical records indicate a documented drug allergy, but your intake response noted no known allergy.
                Your consulting doctor will review this flag during your consultation.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/patient/complete')}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-cobalt to-cobalt-deep text-white font-bold text-sm shadow-cobalt hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{t('confirmFinish', 'Confirm & Send to Doctor')}</span>
          <ArrowRight className="size-4" />
        </button>
      </motion.div>
    </div>
  )
}
