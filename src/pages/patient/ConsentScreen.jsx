import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Volume2, VolumeX, Lock, FileCheck, ArrowLeft, ArrowRight } from 'lucide-react'
import Button from '../../components/Button'
import LanguageSelector from '../../components/LanguageSelector'
import { useLanguage } from '../../context/LanguageContext'

export default function ConsentScreen() {
  const [agreed, setAgreed] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [consentOptions, setConsentOptions] = useState({
    historyCollection: true,
    documentOCR: true,
    abdmSync: true,
  })
  const navigate = useNavigate()
  const { lang, t, speechLocale } = useLanguage()

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const textToSpeak = `${t('consentText')} ${t('consentDetail')}`
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.rate = 0.95
    utterance.lang = speechLocale

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const handleContinue = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    localStorage.setItem('arogya_consent', JSON.stringify({
      grantedAt: new Date().toISOString(),
      dpdpCompliant: true,
      options: consentOptions,
    }))
    navigate('/patient')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary-50/20 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/patient/language')}
            className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors px-2 py-1 rounded-lg hover:bg-surface-muted"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back', 'Back')}</span>
          </button>
          <LanguageSelector variant="compact" />
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 mb-2">
            <Lock className="w-3.5 h-3.5" /> DPDP Act 2023 & ABDM Consent Compliant
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-heading mb-1.5">
            {t('consentTitle', 'Consent & Privacy Framework')}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            {t('consentSubtitle', 'Your health data is protected under national digital health standards')}
          </p>
        </div>

        <div className="bg-surface-raised rounded-3xl border border-border-light shadow-card p-6 sm:p-7 mb-6 space-y-5">
          <p className="text-text-primary text-sm sm:text-base leading-relaxed">
            {t('consentText')}
          </p>

          {/* Granular Consent Checklist */}
          <div className="space-y-3 bg-surface-muted p-4 rounded-2xl border border-border-light text-xs sm:text-sm">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-text-primary">{t('consent1')}</span>
              <input
                type="checkbox"
                checked={consentOptions.historyCollection}
                onChange={(e) => setConsentOptions(prev => ({ ...prev, historyCollection: e.target.checked }))}
                className="w-4 h-4 accent-primary-500 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-text-primary">{t('consent2')}</span>
              <input
                type="checkbox"
                checked={consentOptions.documentOCR}
                onChange={(e) => setConsentOptions(prev => ({ ...prev, documentOCR: e.target.checked }))}
                className="w-4 h-4 accent-primary-500 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-text-primary">{t('consent3')}</span>
              <input
                type="checkbox"
                checked={consentOptions.abdmSync}
                onChange={(e) => setConsentOptions(prev => ({ ...prev, abdmSync: e.target.checked }))}
                className="w-4 h-4 accent-primary-500 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="bg-primary-50/80 rounded-xl p-3.5 border border-primary-200 text-xs text-primary-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5"><FileCheck className="w-4 h-4 text-primary-600" /> Data Security Guarantee:</p>
            <p>• {t('consentDetail')}</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group pt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer accent-primary-500"
            />
            <span className="text-text-primary font-bold text-xs sm:text-sm group-hover:text-primary-600 transition-colors">
              {t('consentAgree', 'I understand and agree to continue')}
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            icon={isSpeaking ? VolumeX : Volume2}
            onClick={handleReadAloud}
            className={`flex-shrink-0 ${isSpeaking ? 'bg-primary-100 border-primary-400 text-primary-800' : ''}`}
          >
            {isSpeaking ? t('stopAudio', 'Stop') : t('readAloud', 'Read aloud')}
          </Button>
          <Button
            size="lg"
            fullWidth
            disabled={!agreed}
            onClick={handleContinue}
            className="flex items-center justify-center gap-2"
          >
            <span>{t('continue', 'Continue')}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
