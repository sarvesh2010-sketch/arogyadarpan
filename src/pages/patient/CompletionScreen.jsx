import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Heart, RefreshCw, Activity, Stethoscope } from 'lucide-react'
import LanguageSelector from '../../components/LanguageSelector'
import { clearPatientSession } from '../../services/sessionStore'
import { useLanguage } from '../../context/LanguageContext'

export default function CompletionScreen() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const handleStartNew = () => {
    clearPatientSession()
    navigate('/patient/language')
  }

  return (
    <div className="min-h-screen kiosk-canvas text-slate-900 flex flex-col justify-start sm:justify-center items-center px-4 py-6 sm:py-10 pb-28 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card p-6 sm:p-10 rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg max-w-lg w-full text-center"
      >
        <div className="flex justify-end mb-4">
          <LanguageSelector variant="compact" />
        </div>

        {/* Animated check */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="size-20 sm:size-24 rounded-full bg-gradient-to-tr from-emerald to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald/30 text-white"
        >
          <CheckCircle2 className="size-10 sm:size-12" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="status-chip bg-emerald-soft text-emerald font-bold mb-2">
            Intake Successfully Transmitted
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            {t('complete', 'Session Complete')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium mb-2">
            {t('completeMessage', 'Your health information has been organized and is ready for your doctor.')}
          </p>
          <p className="text-xs text-slate-400 mb-6">
            {t('completeSub', 'Please proceed to the waiting area. Your doctor will review your information shortly.')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="bg-cobalt-soft/40 rounded-2xl border border-cobalt/20 p-4 mb-4 shadow-xs">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="size-4 text-cobalt" />
              <span className="font-heading font-extrabold text-slate-900 text-xs">
                {t('appName', 'ArogyaDarpan')} • Bionic Health Nexus
              </span>
            </div>
            <p className="text-[11px] text-slate-500 italic font-medium">
              {t('aiPrepares', 'AI prepares. AI explains. The doctor decides.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            <button
              onClick={() => navigate('/kiosk')}
              className="glass-pill py-3 px-4 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Activity className="size-3.5 text-cobalt" />
              <span>Return to Kiosk</span>
            </button>
            <button
              onClick={() => navigate('/doctor')}
              className="py-3 px-4 rounded-full bg-gradient-to-r from-cobalt to-cobalt-deep text-white text-xs font-bold shadow-cobalt hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Stethoscope className="size-3.5" />
              <span>{t('doctorDashboard', 'Doctor Dashboard')}</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleStartNew}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
            >
              <RefreshCw className="size-3.5" />
              <span>{t('newPatient', 'Start New Intake Session')}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
