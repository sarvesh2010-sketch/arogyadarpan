import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Bell, PhoneCall, ShieldAlert, X, Check, ArrowRight } from 'lucide-react'
import Button from './Button'

export default function RedFlagAlertModal({
  isOpen,
  onClose,
  alertData,
  onAcknowledge,
  lang = 'en',
}) {
  // Play subtle warning audio chime on mount if permitted
  useEffect(() => {
    if (isOpen) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (AudioCtx) {
          const ctx = new AudioCtx()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15) // A5
          gain.gain.setValueAtTime(0.15, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 0.4)
        }
      } catch { /* ignore audio failure */ }
    }
  }, [isOpen])

  if (!isOpen || !alertData) return null

  const isHindi = lang === 'hi'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/70 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-surface-raised rounded-3xl border-2 border-red-500 shadow-2xl max-w-lg w-full p-6 text-center relative overflow-hidden"
      >
        {/* Flashing Alert Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 animate-pulse" />

        {/* Emergency Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-red-50">
          <ShieldAlert className="w-9 h-9 animate-bounce" />
        </div>

        {/* Non-Diagnostic Safety Heading */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          {isHindi ? 'तत्काल नैदानिक चेतावनी' : 'Immediate Clinical Safety Alert'}
        </span>

        <h2 className="text-xl sm:text-2xl font-extrabold text-red-700 font-heading mb-2">
          {alertData.publicAlertMessage || 'Potential emergency symptoms detected. Please alert clinical staff.'}
        </h2>

        {isHindi && (
          <p className="text-sm font-semibold text-red-800 mb-3">
            संभावित आपातकालीन लक्षण पाए गए हैं। कृपया तुरंत स्वास्थ्य कर्मियों को सूचित करें।
          </p>
        )}

        {/* Patient Action Instructions */}
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 text-left mb-5 space-y-2 text-xs sm:text-sm text-red-900">
          <div className="flex items-start gap-2.5">
            <Bell className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed font-medium">
              {isHindi
                ? 'कृपया तुरंत नज़दीकी नर्सिंग डेस्क, ट्राइएज स्टाफ या सुरक्षा कर्मी को सूचित करें।'
                : 'Please alert the nearest triage nurse, OPD reception staff, or duty doctor immediately.'
              }
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed text-text-secondary text-xs">
              {isHindi
                ? 'आपके दर्ज किए गए लक्षणों को आपातकालीन समीक्षा के लिए ओपीडी डॉक्टर के डैशबोर्ड पर भेज दिया गया है।'
                : 'A priority alert flag has been added to your token for the on-duty emergency doctor.'
              }
            </p>
          </div>
        </div>

        {/* Staff Guidance / Non-diagnostic note */}
        <p className="text-[11px] text-text-muted mb-6">
          🛡️ <strong>Safety Disclaimer:</strong> This system does not diagnose. It identifies potential clinical red-flags for urgent assessment by trained medical professionals.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="danger"
            size="lg"
            icon={PhoneCall}
            onClick={() => {
              onAcknowledge?.()
              onClose()
            }}
            className="w-full sm:w-auto shadow-lg shadow-red-500/20"
          >
            {isHindi ? 'स्टाफ को सूचित कर दिया गया है' : 'I Have Alerted Clinical Staff'}
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto text-xs"
          >
            {isHindi ? 'प्रश्न जारी रखें' : 'Continue Intake Questions'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
