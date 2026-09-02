import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Volume2, Lock, FileCheck } from 'lucide-react'
import Button from '../../components/Button'

export default function ConsentScreen() {
  const [agreed, setAgreed] = useState(false)
  const [consentOptions, setConsentOptions] = useState({
    historyCollection: true,
    documentOCR: true,
    abdmSync: true,
  })
  const navigate = useNavigate()
  const lang = localStorage.getItem('arogya_language') || 'en'

  const handleReadAloud = () => {
    let text = 'ArogyaDarpan is compliant with the Digital Personal Data Protection Act 2023. We collect your clinical history and digitize your medical records solely for your current doctor consultation. Your data is handled securely and can be revoked at any time.'
    let ttsLang = 'en-IN'

    if (lang === 'hi') {
      text = 'आरोग्यदर्पण डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023 के अनुरूप है। हम आपके डॉक्टर परामर्श के लिए आपके स्वास्थ्य रिकॉर्ड सुरक्षित रूप से एकत्रित करते हैं।'
      ttsLang = 'hi-IN'
    } else if (lang === 'pa') {
      text = 'ਅਰੋਗਿਆ ਦਰਪਣ ਡਿਜੀਟਲ ਪਰਸਨਲ ਡੇਟਾ ਪ੍ਰੋਟੈਕਸ਼ਨ ਐਕਟ 2023 ਦੇ ਅਨੁਕੂਲ ਹੈ। ਅਸੀਂ ਤੁਹਾਡੇ ਡਾਕਟਰ ਦੀ ਸਲਾਹ ਲਈ ਤੁਹਾਡੇ ਸਿਹਤ ਰਿਕਾਰਡ ਇਕੱਠੇ ਕਰਦੇ ਹਾਂ।'
      ttsLang = 'pa-IN'
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.lang = ttsLang
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleContinue = () => {
    localStorage.setItem('arogya_consent', JSON.stringify({
      grantedAt: new Date().toISOString(),
      dpdpCompliant: true,
      options: consentOptions,
    }))
    navigate('/patient')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary-50/20 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 mb-3">
            <Lock className="w-3.5 h-3.5" /> DPDP Act 2023 & ABDM Consent Compliant
          </span>
          <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
            Consent & Privacy Framework
          </h1>
          <p className="text-sm text-text-secondary">
            Your health data is protected under national digital health standards
          </p>
        </div>

        <div className="bg-surface-raised rounded-3xl border border-border-light shadow-card p-8 mb-6 space-y-6">
          <p className="text-text-primary text-base leading-relaxed">
            ArogyaDarpan / MediKiosk collects and digitizes your health information solely to prepare a structured clinical summary for your consulting physician.
          </p>

          {/* Granular Consent Checklist */}
          <div className="space-y-3 bg-surface-muted p-4 rounded-2xl border border-border-light text-sm">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-text-primary">1. Clinical History Elicitation</span>
              <input
                type="checkbox"
                checked={consentOptions.historyCollection}
                onChange={(e) => setConsentOptions(prev => ({ ...prev, historyCollection: e.target.checked }))}
                className="w-4 h-4 accent-primary-500 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-text-primary">2. Medical Document OCR Digitization</span>
              <input
                type="checkbox"
                checked={consentOptions.documentOCR}
                onChange={(e) => setConsentOptions(prev => ({ ...prev, documentOCR: e.target.checked }))}
                className="w-4 h-4 accent-primary-500 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-text-primary">3. Push Record to Hospital HIS / ABHA ID</span>
              <input
                type="checkbox"
                checked={consentOptions.abdmSync}
                onChange={(e) => setConsentOptions(prev => ({ ...prev, abdmSync: e.target.checked }))}
                className="w-4 h-4 accent-primary-500 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="bg-primary-50 rounded-xl p-4 border border-primary-200 text-xs text-primary-800 space-y-1">
            <p className="font-bold flex items-center gap-1"><FileCheck className="w-4 h-4 text-primary-600" /> Data Security Guarantee:</p>
            <p>• Your session data is processed securely and can be revoked at any time.</p>
            <p>• All physician summaries require final doctor verification before permanent filing.</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group pt-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer accent-primary-500"
            />
            <span className="text-text-primary font-bold text-sm group-hover:text-primary-600 transition-colors">
              I understand and grant explicit consent to proceed
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            icon={Volume2}
            onClick={handleReadAloud}
            className="flex-shrink-0"
          >
            Read Aloud
          </Button>
          <Button
            size="lg"
            fullWidth
            disabled={!agreed}
            onClick={handleContinue}
          >
            Grant Consent & Continue
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
