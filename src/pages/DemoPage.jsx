import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Stethoscope, User, Heart, Zap } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'

export default function DemoPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary-50/30 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl w-full text-center"
      >
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-text-primary font-[family-name:var(--font-heading)]">
            ArogyaDarpan
          </span>
        </div>

        <h1 className="text-4xl font-extrabold text-text-primary font-[family-name:var(--font-heading)] mb-3">
          Quick Demo
        </h1>
        <p className="text-text-secondary mb-10 max-w-md mx-auto">
          Choose a journey to see ArogyaDarpan in action with pre-loaded demo data.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Patient Journey */}
          <Card hover onClick={() => {
            // Set demo patient data
            localStorage.setItem('arogya_language', 'en')
            localStorage.setItem('arogya_patient', JSON.stringify({
              name: 'Rahul Sharma', age: '46', gender: 'Male',
              phone: '9876543210', abhaId: 'ABHA-1234-5678',
            }))
            navigate('/patient/language')
          }} className="text-left">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-text-primary font-[family-name:var(--font-heading)] mb-1">
              Patient Journey
            </h3>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">
              Experience the complete patient flow — from language selection to clinical summary.
            </p>
            <div className="text-xs text-text-muted space-y-1">
              <p>👤 Rahul Sharma, 46 years</p>
              <p>❤️ Chest pain for 3 days</p>
              <p>🎙️ Voice + touch interaction</p>
              <p>📄 Document scanning & OCR</p>
            </div>
          </Card>

          {/* Doctor Dashboard */}
          <Card hover onClick={() => navigate('/doctor')} className="text-left">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
              <Stethoscope className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-text-primary font-[family-name:var(--font-heading)] mb-1">
              Doctor Dashboard
            </h3>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">
              See how doctors review AI-prepared summaries, clinical signals, and verify information.
            </p>
            <div className="text-xs text-text-muted space-y-1">
              <p>🔴 Priority review patient</p>
              <p>🟠 Allergy conflict detection</p>
              <p>📊 Evidence-backed summaries</p>
              <p>✅ Verify / Edit / Reject workflow</p>
            </div>
          </Card>
        </div>

        {/* Golden path */}
        <div className="bg-primary-50/50 rounded-2xl border border-primary-100 p-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-primary-800 font-[family-name:var(--font-heading)]">
              Golden Demo Path
            </h3>
          </div>
          <p className="text-sm text-primary-700 mb-4">
            For the best demo experience, follow the patient journey first, then view the doctor dashboard.
          </p>
          <Button
            size="lg"
            icon={Play}
            onClick={() => {
              localStorage.setItem('arogya_language', 'en')
              localStorage.setItem('arogya_patient', JSON.stringify({
                name: 'Rahul Sharma', age: '46', gender: 'Male',
                phone: '9876543210', abhaId: 'ABHA-1234-5678',
              }))
              navigate('/patient/language')
            }}
          >
            Start Golden Path Demo
          </Button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-sm text-text-muted hover:text-primary-600 transition-colors cursor-pointer"
        >
          ← Back to home
        </button>
      </motion.div>
    </div>
  )
}
