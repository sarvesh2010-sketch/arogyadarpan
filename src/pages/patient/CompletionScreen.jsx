import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Heart, RefreshCw } from 'lucide-react'
import Button from '../../components/Button'
import { clearPatientSession } from '../../services/sessionStore'

export default function CompletionScreen() {
  const navigate = useNavigate()

  const handleStartNew = () => {
    clearPatientSession()
    navigate('/patient/language')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary-50/20 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full text-center"
      >
        {/* Animated check */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-text-primary font-heading mb-3">
            Session Complete / सत्र पूर्ण
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed mb-2">
            Your health information has been organized and is ready for your doctor.
          </p>
          <p className="text-text-muted mb-10">
            Please proceed to the waiting area. Your doctor will review your information shortly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="bg-primary-50 rounded-xl border border-primary-100 p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-primary-700 font-heading">
                ArogyaDarpan
              </span>
            </div>
            <p className="text-sm text-primary-600 italic">
              AI prepares. AI explains. The doctor decides.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/doctor')}
            iconRight={ArrowRight}
          >
            View Doctor Dashboard
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              fullWidth
              icon={RefreshCw}
              onClick={handleStartNew}
            >
              New Patient Intake
            </Button>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
