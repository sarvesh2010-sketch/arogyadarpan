import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mic, QrCode, Heart, ArrowRight } from 'lucide-react'
import Card from './Card'
import LanguageSelector from './LanguageSelector'
import { useLanguage } from '../context/LanguageContext'

export default function KioskView() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [tokenGenerated, setTokenGenerated] = useState(false)

  const handleStartKiosk = () => {
    localStorage.setItem('arogya_patient', JSON.stringify({
      name: 'OPD Kiosk Patient',
      age: '42',
      gender: 'Male',
      phone: '9876543210',
      abhaId: 'ABHA-9821-4402',
    }))
    navigate('/patient/language')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6 sm:p-8 select-none">
      {/* Kiosk Top Bar */}
      <header className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight">
              {t('appName', 'ArogyaDarpan')} — MediKiosk
            </h1>
            <p className="text-xs text-slate-400">All India Institute of Medical Sciences • National Health Authority</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSelector variant="compact" />
          <span className="hidden sm:inline-block bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-full font-bold border border-emerald-500/30">
            🟢 KIOSK ONLINE
          </span>
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer">
            Exit Kiosk
          </button>
        </div>
      </header>

      {/* Main Touch Screen Interface */}
      <main className="max-w-4xl mx-auto w-full py-8 sm:py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 sm:space-y-8"
        >
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border border-teal-500/30">
              <Mic className="w-4 h-4" /> {t('speakOrChoose', 'Touch or Speak to Begin')}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-heading leading-tight">
              Self-Checkin & Clinical Intake Kiosk
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto">
              Scan your ABHA QR Code or tap below to record your symptoms and medical history in under 2 minutes.
            </p>
          </div>

          {/* Touch Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto pt-4">
            <Card
              hover
              onClick={handleStartKiosk}
              padding="p-6 sm:p-8"
              className="bg-slate-800 border-slate-700 hover:border-teal-400 text-left cursor-pointer group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-heading mb-1.5">Voice & Touch Intake</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Record your symptoms naturally in 10+ Indian languages with voice AI assistance.
              </p>
              <span className="text-sm font-bold text-teal-400 flex items-center gap-1">
                {t('startPatient', 'Start Patient Intake')} <ArrowRight className="w-4 h-4" />
              </span>
            </Card>

            <Card
              hover
              onClick={() => setTokenGenerated(true)}
              padding="p-6 sm:p-8"
              className="bg-slate-800 border-slate-700 hover:border-teal-400 text-left cursor-pointer group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <QrCode className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-heading mb-1.5">Scan ABHA Card / Token</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Scan your Ayushman Bharat Health Account QR Code for 1-tap instant check-in.
              </p>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                {tokenGenerated ? 'Token #OPD-204 Verified' : 'Scan ABHA Card'} <ArrowRight className="w-4 h-4" />
              </span>
            </Card>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 pt-4 text-center text-xs text-slate-500">
        {t('aiPrepares', 'AI prepares. AI explains. The doctor decides.')}
      </footer>
    </div>
  )
}
