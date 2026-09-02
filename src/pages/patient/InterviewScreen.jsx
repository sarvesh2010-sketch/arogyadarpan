import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Heart, MessageCircle, Volume2, VolumeX, Sun } from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import VoiceRecorder from '../../components/VoiceRecorder'
import CompletenessTracker from '../../components/CompletenessTracker'
import ClinicalSignalCard from '../../components/ClinicalSignalCard'
import SymptomRadarCard from '../../components/SymptomRadarCard'
import AYUSHModeToggle from '../../components/AYUSHModeToggle'
import LanguageSelector from '../../components/LanguageSelector'
import { useInterview } from '../../hooks/useInterview'
import { useVoiceInput } from '../../hooks/useVoiceInput'
import { useLanguage } from '../../context/LanguageContext'
import { COMPLAINT_OPTIONS, getLocalizedQuestion, getLocalizedOption } from '../../data/questionBank'

export default function InterviewScreen() {
  const navigate = useNavigate()
  const { lang, t, speechLocale, currentLanguageMeta } = useLanguage()
  const [isSpeaking, setIsSpeaking] = useState(false)

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    responses,
    isComplete,
    completeness,
    completenessPercent,
    triageData,
    mode,
    setMode,
    isLowLiteracy,
    setIsLowLiteracy,
    submitResponse,
    nextQuestion,
    previousQuestion,
  } = useInterview()

  const [textInput, setTextInput] = useState('')
  const [numberInput, setNumberInput] = useState('')
  const [selectedOptions, setSelectedOptions] = useState([])

  const handleVoiceResult = useCallback((transcriptText) => {
    setTextInput(prev => (prev ? prev + ' ' + transcriptText : transcriptText).trim())
  }, [])

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
  } = useVoiceInput({
    lang: speechLocale,
    onResult: handleVoiceResult,
  })

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Dynamic Multi-Language Speech Synthesis (TTS)
  const handleReadAloud = () => {
    if (!currentQuestion || !('speechSynthesis' in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const questionToSpeak = getLocalizedQuestion(currentQuestion, lang)
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(questionToSpeak)
    utterance.rate = 0.92
    utterance.lang = speechLocale

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  // Safe navigation on completion
  useEffect(() => {
    if (isComplete) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
      localStorage.setItem('arogya_responses', JSON.stringify(responses))
      localStorage.setItem('arogya_triage', JSON.stringify(triageData))
      navigate('/patient/documents')
    }
  }, [isComplete, responses, triageData, navigate])

  if (isComplete || !currentQuestion) return null

  const handleSelectOption = (value) => {
    if (currentQuestion.type === 'multi_select') {
      setSelectedOptions(prev =>
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : [...prev, value]
      )
    } else {
      submitResponse(currentQuestion.id, '', value, 'touch')
      setTextInput('')
      setNumberInput('')
      setSelectedOptions([])
      setTimeout(nextQuestion, 250)
    }
  }

  const handleSubmitCurrent = () => {
    let value = ''
    if (currentQuestion.type === 'text') value = textInput
    else if (currentQuestion.type === 'number') value = parseInt(numberInput, 10) || numberInput
    else if (currentQuestion.type === 'multi_select') value = selectedOptions

    submitResponse(currentQuestion.id, textInput || transcript, value, textInput ? 'touch' : 'voice')
    setTextInput('')
    setNumberInput('')
    setSelectedOptions([])
    nextQuestion()
  }

  const handleComplaintSelect = (complaintId) => {
    submitResponse('chief_complaint', '', complaintId, 'touch')
    setTextInput('')
    setTimeout(nextQuestion, 250)
  }

  const questionText = getLocalizedQuestion(currentQuestion, lang)

  return (
    <div className={`min-h-screen bg-surface flex ${isLowLiteracy ? 'text-lg' : ''}`}>
      {/* Sidebar — Completeness & AI Symptom Radar */}
      <aside className="hidden lg:flex w-96 border-r border-border-light bg-surface-raised p-6 flex-col overflow-y-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-text-primary text-xl font-heading tracking-tight">
              {t('appName', 'ArogyaDarpan')}
            </span>
          </div>

          <button
            onClick={() => setIsLowLiteracy(!isLowLiteracy)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
              isLowLiteracy ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-surface-muted text-text-secondary border-border-light hover:bg-gray-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            {isLowLiteracy ? 'Simple Mode ON' : 'Simple Mode'}
          </button>
        </div>

        {/* Universal Language Switcher */}
        <div className="bg-surface-muted/60 p-3 rounded-2xl border border-border-light flex items-center justify-between">
          <span className="text-xs font-semibold text-text-secondary">{t('switchLanguage', 'Language')}</span>
          <LanguageSelector variant="compact" />
        </div>

        {/* AYUSH & Modern Mode Selector */}
        <AYUSHModeToggle currentMode={mode} onChangeMode={setMode} />

        {/* AI Symptom & Triage Radar */}
        <SymptomRadarCard triageData={triageData} />

        {/* Completeness Tracker */}
        <CompletenessTracker
          categories={completeness}
          percent={completenessPercent}
        />

        {/* Active Clinical Alerts */}
        {triageData.signals.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Clinical Priority Alerts ({triageData.signals.length})
            </h4>
            {triageData.signals.map((signal, i) => (
              <ClinicalSignalCard
                key={i}
                severity={signal.severity}
                message={signal.message}
                detail={signal.detail}
                disclaimer={signal.disclaimer}
                currentValue={signal.currentValue}
                previousValue={signal.previousValue}
              />
            ))}
          </div>
        )}
      </aside>

      {/* Main Interview Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-border-light bg-surface-raised">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-text-primary text-base sm:text-lg font-heading">
              {t('healthInterview', 'Clinical Intake Interview')}
            </h2>
            <span className="hidden sm:inline-block bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-primary-200">
              {mode === 'ayush' ? '🌿 AYUSH Track' : '🩺 Modern Track'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelector variant="compact" className="lg:hidden" />
            <Button
              variant="ghost"
              size="sm"
              icon={isSpeaking ? VolumeX : Volume2}
              onClick={handleReadAloud}
              className={isSpeaking ? 'text-primary-600 bg-primary-50' : ''}
            >
              <span className="hidden sm:inline">{isSpeaking ? t('stopAudio', 'Stop') : t('readAloud', 'Listen')}</span>
            </Button>
            <span className="text-xs sm:text-sm font-semibold text-text-muted whitespace-nowrap">
              {currentIndex + 1} / {totalQuestions}
            </span>
            <div className="w-20 sm:w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </header>

        {/* Question & Interactive Response Area */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 overflow-y-auto">
          <div className="max-w-2xl w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {/* AI Assistant Banner */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-primary-700 font-heading">
                      ArogyaDarpan Voice AI
                    </span>
                  </div>

                  <span className="text-xs text-text-muted bg-surface-muted px-2.5 py-1 rounded-full border border-border-light">
                    🎙️ {currentLanguageMeta.flag} {currentLanguageMeta.native}
                  </span>
                </div>

                {/* Main Question Heading */}
                <h2 className={`font-bold text-text-primary font-heading mb-6 leading-snug ${isLowLiteracy ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl md:text-3xl'}`}>
                  {questionText}
                </h2>

                {/* Voice Recorder with Animated Waveform */}
                <VoiceRecorder
                  isListening={isListening}
                  isSupported={isSupported}
                  transcript={transcript}
                  interimTranscript={interimTranscript}
                  onStart={startListening}
                  onStop={stopListening}
                  error={error}
                  className="mb-6"
                />

                {/* Answer Options based on Type */}
                {currentQuestion.type === 'complaint_select' && (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm font-medium text-text-muted mb-3">
                      {t('speakOrChoose', 'Speak or select your primary complaint')}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                      {COMPLAINT_OPTIONS.map(opt => {
                        const optLabel = opt.labels && opt.labels[lang] ? opt.labels[lang] : opt.label
                        return (
                          <Card
                            key={opt.id}
                            hover
                            onClick={() => handleComplaintSelect(opt.id)}
                            padding="px-3 py-3.5"
                            className="flex flex-col items-center text-center gap-1.5 cursor-pointer hover:border-primary-400 hover:shadow-md transition-all"
                          >
                            <span className="text-2xl sm:text-3xl">{opt.icon}</span>
                            <span className="font-bold text-text-primary text-xs sm:text-sm font-heading line-clamp-2">
                              {optLabel}
                            </span>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {currentQuestion.type === 'yes_no' && (
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      size={isLowLiteracy ? 'xl' : 'lg'}
                      onClick={() => handleSelectOption('yes')}
                      className="min-w-[130px] border-2 hover:border-primary-500"
                    >
                      {t('yes', 'Yes')}
                    </Button>
                    <Button
                      variant="secondary"
                      size={isLowLiteracy ? 'xl' : 'lg'}
                      onClick={() => handleSelectOption('no')}
                      className="min-w-[130px]"
                    >
                      {t('no', 'No')}
                    </Button>
                  </div>
                )}

                {currentQuestion.type === 'single_select' && currentQuestion.options && (
                  <div className="space-y-2.5">
                    {currentQuestion.options.map(opt => {
                      const optLabel = getLocalizedOption(opt, lang)
                      return (
                        <Card
                          key={opt.value}
                          hover
                          onClick={() => handleSelectOption(opt.value)}
                          padding="px-5 py-3.5"
                          className="cursor-pointer hover:border-primary-400 transition-all"
                        >
                          <span className="font-semibold text-text-primary text-sm sm:text-base">
                            {optLabel}
                          </span>
                        </Card>
                      )
                    })}
                  </div>
                )}

                {currentQuestion.type === 'multi_select' && currentQuestion.options && (
                  <div className="space-y-2.5">
                    {currentQuestion.options.map(opt => {
                      const optLabel = getLocalizedOption(opt, lang)
                      const isSelected = selectedOptions.includes(opt.value)
                      return (
                        <Card
                          key={opt.value}
                          hover
                          selected={isSelected}
                          onClick={() => handleSelectOption(opt.value)}
                          padding="px-5 py-3.5"
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-primary-500 border-primary-500'
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="font-semibold text-text-primary text-sm sm:text-base">
                              {optLabel}
                            </span>
                          </div>
                        </Card>
                      )
                    })}
                    <Button
                      size="lg"
                      fullWidth
                      className="mt-4"
                      disabled={selectedOptions.length === 0}
                      onClick={handleSubmitCurrent}
                    >
                      {t('continue', 'Continue')}
                    </Button>
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <div>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={currentQuestion.placeholder || 'Describe your symptoms or voice answers above...'}
                      rows={3}
                      className="w-full px-4 py-3.5 rounded-2xl border border-border-light bg-surface-raised text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
                    />
                    <Button
                      size="lg"
                      fullWidth
                      className="mt-3"
                      disabled={!textInput.trim()}
                      onClick={handleSubmitCurrent}
                      iconRight={ArrowRight}
                    >
                      {t('continue', 'Continue')}
                    </Button>
                  </div>
                )}

                {currentQuestion.type === 'number' && (
                  <div className="flex flex-col items-center">
                    <input
                      type="range"
                      min={currentQuestion.min || 1}
                      max={currentQuestion.max || 10}
                      value={numberInput || 5}
                      onChange={(e) => setNumberInput(e.target.value)}
                      className="w-full max-w-xs mb-4 accent-primary-500 cursor-pointer"
                    />
                    <span className="text-4xl font-extrabold text-primary-600 font-heading mb-5">
                      {numberInput || 5} / {currentQuestion.max || 10}
                    </span>
                    <Button
                      size="lg"
                      onClick={() => {
                        submitResponse(currentQuestion.id, '', parseInt(numberInput || '5', 10), 'touch')
                        setNumberInput('')
                        nextQuestion()
                      }}
                      iconRight={ArrowRight}
                    >
                      {t('continue', 'Continue')}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-t border-border-light bg-surface-raised">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={previousQuestion}
            disabled={currentIndex === 0}
          >
            {t('previous', 'Back')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              submitResponse(currentQuestion.id, '', null, 'skipped')
              nextQuestion()
            }}
          >
            {t('skip', 'Skip Question')}
          </Button>
        </footer>
      </main>
    </div>
  )
}
