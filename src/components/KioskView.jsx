import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mic, QrCode, Stethoscope, Heart, Volume2, Shield, ArrowRight, UserCheck } from 'lucide-react'
import Button from './Button'
import Card from './Card'

export default function KioskView() {
  const navigate = useNavigate()
  const [tokenGenerated, setTokenGenerated] = useState(false)

  const handleStartKiosk = () => {
    localStorage.setItem('arogya_language', 'en')
    localStorage.setItem('arogya_patient', JSON.stringify({
      name: 'OPD Kiosk Patient',
      age: '42',
      gender: 'Male',
      phone: '9876543210',
      abhaId: 'ABHA-9821-4402',
    }))
    navigate('/patient/consent')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-8 select-none">
      {/* Kiosk Top Bar */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-white tracking-tight">
              MediKiosk — Self-Service OPD Intake
            </h1>
            <p className="text-xs text-slate-400">All India Institute of Ayurveda • Ministry of Ayush</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-full font-bold border border-emerald-500/30">
            🟢 KIOSK TERMINAL #04 ONLINE
          </span>
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer">
            Exit Kiosk Mode
          </button>
        </div>
      </header>

      {/* Main Touch Screen Interface */}
      <main className="max-w-4xl mx-auto w-full py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-1.5 rounded-full text-sm font-bold border border-teal-500/30">
              <Mic className="w-4 h-4" /> Touch or Speak to Begin
            </span>
            <h2 className="text-5xl font-extrabold text-white font-heading leading-tight">
              Self-Checkin & Clinical Intake Kiosk
            </h2>
            <p className="text-slate-300 text-lg max-w-xl mx-auto">
              Scan your ABHA QR Code or tap below to record your symptoms and medical history in under 2 minutes.
            </p>
          </div>

          {/* Touch Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-6">
            <Card
              hover
              onClick={handleStartKiosk}
              padding="p-8"
              className="bg-slate-800 border-slate-700 hover:border-teal-400 text-left cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white font-heading mb-2">Voice & Touch Intake</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Record your symptoms naturally in Hindi, English, Punjabi or regional languages.
              </p>
              <span className="text-sm font-bold text-teal-400 flex items-center gap-1">
                Start Patient Intake <ArrowRight className="w-4 h-4" />
              </span>
            </Card>

            <Card
              hover
              onClick={() => setTokenGenerated(true)}
              padding="p-8"
              className="bg-slate-800 border-slate-700 hover:border-teal-400 text-left cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white font-heading mb-2">Scan ABHA Card / Token</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Scan your Ayushman Bharat Health Account QR Code for 1-tap instant check-in.
              </p>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                Scan ABHA Code <ArrowRight className="w-4 h-4" />
              </span>
            </Card>
          </div>

          {/* Token Card Output */}
          {tokenGenerated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 border border-teal-500/50 p-6 rounded-3xl max-w-md mx-auto text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
                <span className="text-xs text-slate-400 font-bold">OPD QUEUE TOKEN GENERATED</span>
                <span className="bg-teal-500 text-slate-900 font-extrabold text-xs px-2.5 py-0.5 rounded">
                  TOKEN #A-104
                </span>
              </div>
              <p className="text-sm text-white font-bold mb-1">Patient: Rahul Sharma (ABHA Linked)</p>
              <p className="text-xs text-slate-300">Department: General Medicine (Room 12)</p>
              <p className="text-xs text-emerald-400 font-medium mt-2">✓ Clinical Intake Completed & Sent to Physician Desktop</p>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Kiosk Footer */}
      <footer className="border-t border-slate-800 pt-6 flex items-center justify-between text-xs text-slate-500">
        <span>DPDP Act 2023 & ABDM Consent Compliant Terminal</span>
        <span>SIH Problem Statement ID: SIH26047</span>
      </footer>
    </div>
  )
}
