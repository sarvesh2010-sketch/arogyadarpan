import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Heart, RefreshCw } from 'lucide-react'
import Button from '../../components/Button'
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
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary-50/20 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full text-center"
      >
        <div className="flex justify-end mb-4">
          <LanguageSelector variant="compact" />
        </div>

        {/* Animated check */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-heading mb-2">
            {t('complete', 'Session Complete')}
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-2">
            {t('completeMessage', 'Your health information has been organized and is ready for your doctor.')}
          </p>
          <p className="text-xs sm:text-sm text-text-muted mb-8">
            {t('completeSub', 'Please proceed to the waiting area. Your doctor will review your information shortly.')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="bg-primary-50/80 rounded-2xl border border-primary-100 p-5 mb-4 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <Heart className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-primary-700 font-heading text-sm">
                {t('appName', 'ArogyaDarpan')}
              </span>
            </div>
            <p className="text-xs text-primary-700 italic">
              {t('aiPrepares', 'AI prepares. AI explains. The doctor decides.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/patient/dashboard')}
              iconRight={ArrowRight}
            >
              View Patient Dashboard
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/doctor')}
              iconRight={ArrowRight}
              className="shadow-lg shadow-primary-500/25"
            >
              {t('doctorDashboard', 'Doctor Dashboard')}
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              fullWidth
              icon={RefreshCw}
              onClick={handleStartNew}
            >
              {t('newPatient', 'New Patient Intake')}
            </Button>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => navigate('/')}
            >
              {t('back', 'Back to Home')}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
