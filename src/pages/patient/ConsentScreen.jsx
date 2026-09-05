import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Volume2, VolumeX, Lock, FileCheck, ArrowLeft, ArrowRight, Check } from 'lucide-react'
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
    <div className="min-h-screen kiosk-canvas text-slate-900 flex flex-col justify-start sm:justify-center items-center px-4 py-6 sm:py-10 pb-28 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/patient/language')}
            className="glass-pill px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>{t('back', 'Back')}</span>
          </button>
          <LanguageSelector variant="compact" />
        </div>

        <div className="text-center mb-6">
          <div className="size-16 rounded-2xl bg-gradient-to-tr from-cobalt to-cobalt-deep flex items-center justify-center mx-auto mb-3 shadow-cobalt text-white">
            <ShieldCheck className="size-8" />
          </div>
          <span className="status-chip bg-emerald-soft text-emerald font-bold mb-2">
            <Lock className="size-3.5" /> DPDP Act 2023 & ABDM Consent Compliant
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
            {t('consentTitle', 'Consent & Privacy Framework')}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {t('consentSubtitle', 'Your health data is protected under national digital health standards')}
          </p>
        </div>

        <div className="glass-card rounded-3xl border border-slate-200/80 bg-white/95 shadow-md p-6 sm:p-7 mb-6 space-y-5">
          <p className="text-slate-700 text-sm leading-relaxed font-medium">
            {t('consentText')}
          </p>

          {/* Granular Consent Checklist */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-slate-800">{t('consent1')}</span>
              <input
                type="checkbox"
                checked={consentOptions.historyCollection}
                onChange={(e) => setConsentOptions(prev => ({ ...prev, historyCollection: e.target.checked }))}
                className="size-4 accent-cobalt rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-slate-800">{t('consent2')}</span>
              <input
                type="checkbox"
                checked={consentOptions.documentOCR}
                onChange={(e) => setConsentOptions(prev => ({ ...prev, documentOCR: e.target.checked }))}
                className="size-4 accent-cobalt rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-slate-800">{t('consent3')}</span>
              <input
                type="checkbox"
                checked={consentOptions.abdmSync}
                onChange={(e) => setConsentOptions(prev => ({ ...prev, abdmSync: e.target.checked }))}
                className="size-4 accent-cobalt rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="bg-cobalt-soft/50 rounded-xl p-3.5 border border-cobalt/20 text-xs text-cobalt-deep space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <FileCheck className="size-4 text-cobalt" /> Data Security Guarantee:
            </p>
            <p className="font-medium">• {t('consentDetail')}</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group pt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-5 rounded border-slate-300 text-cobalt focus:ring-cobalt cursor-pointer accent-cobalt"
            />
            <span className="text-slate-900 font-bold text-xs sm:text-sm group-hover:text-cobalt transition-colors">
              {t('consentAgree', 'I understand and agree to continue')}
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReadAloud}
            className={`glass-pill px-4 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              isSpeaking
                ? 'bg-cobalt-soft text-cobalt border border-cobalt/40 animate-pulse'
                : 'text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isSpeaking ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            <span>{isSpeaking ? t('stopAudio', 'Stop') : t('readAloud', 'Read aloud')}</span>
          </button>

          <button
            disabled={!agreed}
            onClick={handleContinue}
            className={`flex-1 py-3 rounded-full text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer ${
              agreed
                ? 'bg-gradient-to-r from-cobalt to-cobalt-deep text-white shadow-cobalt hover:brightness-110'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{t('continue', 'Continue')}</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
