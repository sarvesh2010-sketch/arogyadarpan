import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ArrowLeft, Heart, MessageCircle, Volume2, VolumeX, Sun,
  LogOut, FormInput, ListFilter, CheckSquare, Square, Calendar, Hash, Sparkles
} from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import VoiceRecorder from '../../components/VoiceRecorder'
import AudioControlsBar from '../../components/AudioControlsBar'
import ConversationalVoiceModal from '../../components/ConversationalVoiceModal'
import RedFlagAlertModal from '../../components/RedFlagAlertModal'
import CompletenessTracker from '../../components/CompletenessTracker'
import ClinicalSignalCard from '../../components/ClinicalSignalCard'
import SymptomRadarCard from '../../components/SymptomRadarCard'
import AYUSHModeToggle from '../../components/AYUSHModeToggle'
import LanguageSelector from '../../components/LanguageSelector'
import TouchNumericKeypad from '../../components/TouchNumericKeypad'
import TouchDatePicker from '../../components/TouchDatePicker'
import SessionTimeoutModal from '../../components/SessionTimeoutModal'
import ClinicalHistoryFormView from '../../components/ClinicalHistoryFormView'
import { useInterview } from '../../hooks/useInterview'
import { useVoiceInput } from '../../hooks/useVoiceInput'
import { useSessionTimeout } from '../../hooks/useSessionTimeout'
import { useLanguage } from '../../context/LanguageContext'
import { COMPLAINT_OPTIONS, getLocalizedQuestion, getLocalizedOption } from '../../data/questionBank'
import { clearPatientSession } from '../../services/sessionStore'
import { normalizeVoiceInput } from '../../services/voiceNormalizationEngine'
import { evaluateRedFlags } from '../../services/redFlagRules'

export default function InterviewScreen() {
  const navigate = useNavigate()
  const { lang, t, speechLocale, currentLanguageMeta } = useLanguage()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showFullForm, setShowFullForm] = useState(false)
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false)

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
    resetInterview,
  } = useInterview()

  const [textInput, setTextInput] = useState('')
  const [numberInput, setNumberInput] = useState('')
  const [selectedOptions, setSelectedOptions] = useState([])
  const [dropdownValue, setDropdownValue] = useState('')
  const [dateValue, setDateValue] = useState('')

  // Speech Rate & Volume States for Accessible TTS (elderly & low-literacy)
  const [speechRate, setSpeechRate] = useState(isLowLiteracy ? 0.75 : 0.92)
  const [volume, setVolume] = useState(1.0)

  // Conversational Voice AI Modal & Red-Flag States
  const [showConversationalModal, setShowConversationalModal] = useState(false)
  const [acknowledgedRedFlags, setAcknowledgedRedFlags] = useState([])

  // Evaluate real-time Red Flags across current responses
  const redFlagEvaluation = useMemo(() => {
    return evaluateRedFlags(responses)
  }, [responses])

  const activeRedFlag = redFlagEvaluation.topAlert
  const isRedFlagOpen = Boolean(
    activeRedFlag &&
    activeRedFlag.priority === 'critical' &&
    !acknowledgedRedFlags.includes(activeRedFlag.id)
  )

  // Inactivity Timeout Tracker (3-minute idle kiosk timeout)
  const {
    isWarning: isTimeoutWarning,
    secondsLeft: timeoutSecondsLeft,
    resetTimeout
  } = useSessionTimeout({
    idleMinutes: 3,
    warningSeconds: 30,
    onTimeout: () => {
      clearPatientSession()
      navigate('/patient/language')
    },
    enabled: !isComplete
  })

  const [voiceMatchStatus, setVoiceMatchStatus] = useState(null)

  const handleVoiceResult = useCallback((transcriptText) => {
    setTextInput(prev => (prev ? prev + ' ' + transcriptText : transcriptText).trim())

    if (currentQuestion) {
      const norm = normalizeVoiceInput(transcriptText, currentQuestion)
      if (norm && norm.confidence >= 0.88 && norm.structuredValue !== undefined && norm.matchedOption) {
        setVoiceMatchStatus({
          active: true,
          heard: transcriptText,
          normalized: Array.isArray(norm.structuredValue) ? norm.structuredValue.join(', ') : String(norm.structuredValue),
          explanation: norm.explanation
        })

        if (currentQuestion.type === 'yes_no' || currentQuestion.type === 'complaint_select' || currentQuestion.type === 'single_select' || currentQuestion.type === 'dropdown') {
          submitResponse(currentQuestion.id, transcriptText, norm.structuredValue, 'voice')
          setTimeout(() => {
            setVoiceMatchStatus(null)
            nextQuestion()
          }, 900)
        } else if (currentQuestion.type === 'number') {
          setNumberInput(String(norm.structuredValue))
        } else if (currentQuestion.type === 'multi_select') {
          setSelectedOptions(Array.isArray(norm.structuredValue) ? norm.structuredValue : [norm.structuredValue])
        }
      }
    }
  }, [currentQuestion, submitResponse, nextQuestion])

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

  // Sync state when question changes
  useEffect(() => {
    setTextInput('')
    setNumberInput('')
    setSelectedOptions([])
    setDropdownValue('')
    setDateValue('')
  }, [currentQuestion?.id])

  // Dynamic Multi-Language Speech Synthesis (TTS)
  const handleReadAloud = (customRate = speechRate, customVol = volume) => {
    if (!currentQuestion || !('speechSynthesis' in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const questionToSpeak = getLocalizedQuestion(currentQuestion, lang)
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(questionToSpeak)
    utterance.rate = customRate
    utterance.volume = customVol
    utterance.lang = speechLocale

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  // Handle Free Conversational Natural Speech AI Intake
  const handleApplyConversationalIntake = (intakeData) => {
    if (!intakeData) return

    // 1. Primary complaint
    if (intakeData.primaryComplaint?.id) {
      submitResponse('chief_complaint', intakeData.rawTranscript, intakeData.primaryComplaint.id, 'voice')
    }

    // 2. Duration / Onset
    if (intakeData.duration) {
      submitResponse('socrates_onset', intakeData.duration, intakeData.duration, 'voice')
    }

    // 3. Associated symptoms
    if (intakeData.associatedSymptoms && intakeData.associatedSymptoms.length > 0) {
      const symVals = intakeData.associatedSymptoms.map(s => s.id)
      submitResponse('socrates_associations', intakeData.associatedSymptoms.map(s => s.label).join(', '), symVals, 'voice')
    }

    // 4. Severity
    if (intakeData.severity) {
      submitResponse('socrates_severity', String(intakeData.severity), intakeData.severity, 'voice')
    }

    // 5. Current medications if detected
    if (intakeData.medications && intakeData.medications.length > 0) {
      const medStr = intakeData.medications.map(m => `${m.medication} ${m.dose || ''}`).join(', ')
      submitResponse('current_medications', medStr, medStr, 'voice')
    }

    // 6. Diseases if detected
    if (intakeData.diseases && intakeData.diseases.length > 0) {
      const disList = intakeData.diseases.map(d => d.name)
      submitResponse('past_medical', disList.join(', '), disList, 'voice')
    }

    setShowConversationalModal(false)
    setTimeout(nextQuestion, 500)
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

  const handleEndSession = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    clearPatientSession()
    navigate('/')
  }

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
    else if (currentQuestion.type === 'dropdown' || currentQuestion.type === 'select') value = dropdownValue
    else if (currentQuestion.type === 'date') value = dateValue

    submitResponse(currentQuestion.id, textInput || transcript, value, 'touch')
    setTextInput('')
    setNumberInput('')
    setSelectedOptions([])
    setDropdownValue('')
    setDateValue('')
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

        {/* Structured Form View vs Step-by-Step Toggle */}
        <div className="bg-primary-50/50 p-3 rounded-2xl border border-primary-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-primary-900">
            <FormInput className="w-4 h-4 text-primary-600" />
            <span>Form View</span>
          </div>
          <button
            onClick={() => setShowFullForm(!showFullForm)}
            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-primary-200 text-primary-700 shadow-xs cursor-pointer hover:bg-primary-50"
          >
            {showFullForm ? 'Step View' : 'Full Form'}
          </button>
        </div>

        {/* AYUSH & Modern Mode Selector */}
        <AYUSHModeToggle currentMode={mode} onChangeMode={setMode} />

        {/* Mode-Specific Insight Card */}
        {mode === 'ayush' ? (
          <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-4 space-y-2.5 text-xs text-emerald-950 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
              <span className="text-base">🌿</span>
              <span>Dashavidha Pariksha Track</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Assessing constitutional bio-energies (Tridosha), digestive fire (Agni), tissue excellence (Dhatu Sara), and natural mental resilience (Sattva).
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-semibold text-emerald-900">
              <div className="bg-white/80 px-2 py-1 rounded-lg border border-emerald-100">⚖️ Tridosha State</div>
              <div className="bg-white/80 px-2 py-1 rounded-lg border border-emerald-100">🔥 Agni Capacity</div>
              <div className="bg-white/80 px-2 py-1 rounded-lg border border-emerald-100">🌾 Dhatu Vitality</div>
              <div className="bg-white/80 px-2 py-1 rounded-lg border border-emerald-100">🧘 Sattva Mental</div>
            </div>
          </div>
        ) : (
          /* AI Symptom & Allopathic Triage Radar */
          <SymptomRadarCard triageData={triageData} />
        )}

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
            <span className={`hidden sm:inline-block text-xs px-2.5 py-1 rounded-full font-semibold border ${
              mode === 'ayush'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-primary-50 text-primary-700 border-primary-200'
            }`}>
              {mode === 'ayush' ? '🌿 AYUSH Track (Dashavidha Pariksha)' : '🩺 Modern Allopathic Track'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
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
            <div className="w-16 sm:w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {/* End Session Button */}
            <button
              onClick={() => setShowEndSessionConfirm(true)}
              className="flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-critical transition-colors px-2.5 py-1.5 rounded-lg border border-border-light hover:border-red-200 cursor-pointer"
              title="End kiosk session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('endSession', 'End')}</span>
            </button>
          </div>
        </header>

        {/* FULL CLINICAL HISTORY FORM MODAL / OVERLAY */}
        {showFullForm ? (
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
            <ClinicalHistoryFormView
              responses={responses}
              onUpdateResponse={(qId, val) => submitResponse(qId, '', val, 'form_edit')}
              onClose={() => setShowFullForm(false)}
            />
          </div>
        ) : (
          /* STEP-BY-STEP QUESTION & RESPONSE AREA */
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
                  <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-primary-700 font-heading">
                        ArogyaDarpan Voice AI
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Conversational Voice AI Trigger */}
                      <button
                        type="button"
                        onClick={() => setShowConversationalModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
                        title="Speak naturally in Hindi or English (AI extracts all symptoms)"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'प्राकृतिक बातचीत (Voice AI)' : 'Conversational Voice AI'}</span>
                      </button>

                      <span className="text-xs text-text-muted bg-surface-muted px-2.5 py-1 rounded-full border border-border-light">
                        🎙️ {currentLanguageMeta.flag} {currentLanguageMeta.native}
                      </span>
                    </div>
                  </div>

                  {/* Main Question Heading */}
                  <h2 className={`font-bold text-text-primary font-heading mb-4 leading-snug ${isLowLiteracy ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl md:text-3xl'}`}>
                    {questionText}
                  </h2>

                  {/* Accessible Audio Controls Bar (Repeat, Slow Speech 0.75x, Volume) */}
                  <AudioControlsBar
                    onRepeatQuestion={() => handleReadAloud(speechRate, volume)}
                    isSpeaking={isSpeaking}
                    volume={volume}
                    onVolumeChange={(val) => setVolume(val)}
                    speechRate={speechRate}
                    onSpeechRateChange={(val) => {
                      setSpeechRate(val)
                      handleReadAloud(val, volume)
                    }}
                    className="mb-4"
                  />

                  {/* Voice Recorder with Animated Waveform */}
                  <VoiceRecorder
                    isListening={isListening}
                    isSupported={isSupported}
                    transcript={transcript}
                    interimTranscript={interimTranscript}
                    onStart={startListening}
                    onStop={stopListening}
                    error={error}
                    className="mb-4"
                  />

                  {/* Real-time Voice Normalization Match Indicator */}
                  {voiceMatchStatus && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-4 bg-teal-50 border border-teal-200 text-teal-900 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                        <span>🎙️ <strong>Voice Recognized:</strong> "{voiceMatchStatus.heard}" → <strong>Matched:</strong> {voiceMatchStatus.normalized}</span>
                      </div>
                      <span className="font-bold text-teal-700">Auto-Selecting...</span>
                    </motion.div>
                  )}

                  {/* 1. COMPLAINT SELECT */}
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

                  {/* 2. YES / NO BUTTONS */}
                  {currentQuestion.type === 'yes_no' && (
                    <div className="flex gap-4 justify-center">
                      <Button
                        variant="outline"
                        size={isLowLiteracy ? 'xl' : 'lg'}
                        onClick={() => handleSelectOption('yes')}
                        className="min-w-[140px] border-2 hover:border-primary-500 text-base"
                      >
                        {t('yes', 'Yes')}
                      </Button>
                      <Button
                        variant="secondary"
                        size={isLowLiteracy ? 'xl' : 'lg'}
                        onClick={() => handleSelectOption('no')}
                        className="min-w-[140px] text-base"
                      >
                        {t('no', 'No')}
                      </Button>
                    </div>
                  )}

                  {/* 3. SINGLE SELECT CARDS */}
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

                  {/* 4. MULTI-SELECT CHECKBOXES */}
                  {currentQuestion.type === 'multi_select' && currentQuestion.options && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-text-muted px-1">
                        <span>Select all that apply:</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOptions(currentQuestion.options.map(o => o.value))}
                            className="text-primary-600 hover:underline cursor-pointer"
                          >
                            Select All
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => setSelectedOptions([])}
                            className="text-text-muted hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {currentQuestion.options.map(opt => {
                          const optLabel = getLocalizedOption(opt, lang)
                          const isSelected = selectedOptions.includes(opt.value)
                          return (
                            <Card
                              key={opt.value}
                              hover
                              selected={isSelected}
                              onClick={() => handleSelectOption(opt.value)}
                              padding="px-4 py-3.5"
                              className="cursor-pointer transition-all border"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-primary-500 border-primary-500 text-white'
                                    : 'border-gray-300 bg-white'
                                }`}>
                                  {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-transparent" />}
                                </div>
                                <span className="font-semibold text-text-primary text-sm sm:text-base">
                                  {optLabel}
                                </span>
                              </div>
                            </Card>
                          )
                        })}
                      </div>

                      <Button
                        size="lg"
                        fullWidth
                        className="mt-4 shadow-md shadow-primary-500/20"
                        disabled={selectedOptions.length === 0}
                        onClick={handleSubmitCurrent}
                        iconRight={ArrowRight}
                      >
                        {t('continue', 'Continue')} ({selectedOptions.length} selected)
                      </Button>
                    </div>
                  )}

                  {/* 5. DROPDOWN SELECTION */}
                  {(currentQuestion.type === 'dropdown' || currentQuestion.type === 'select') && currentQuestion.options && (
                    <div className="space-y-4 max-w-md mx-auto">
                      <div className="relative">
                        <select
                          value={dropdownValue}
                          onChange={(e) => setDropdownValue(e.target.value)}
                          className="w-full px-4 py-4 rounded-2xl border-2 border-border-light bg-surface-raised text-text-primary text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer shadow-sm"
                        >
                          <option value="">-- Choose an option --</option>
                          {currentQuestion.options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {getLocalizedOption(opt, lang)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button
                        size="lg"
                        fullWidth
                        disabled={!dropdownValue}
                        onClick={handleSubmitCurrent}
                        iconRight={ArrowRight}
                      >
                        {t('continue', 'Continue')}
                      </Button>
                    </div>
                  )}

                  {/* 6. DATE SELECTION */}
                  {currentQuestion.type === 'date' && (
                    <div>
                      <TouchDatePicker
                        value={dateValue}
                        onChange={(val) => setDateValue(val)}
                        onSubmit={(val) => {
                          setDateValue(val)
                          submitResponse(currentQuestion.id, '', val, 'touch')
                          nextQuestion()
                        }}
                      />
                    </div>
                  )}

                  {/* 7. NUMERIC KEYPAD & SLIDER */}
                  {currentQuestion.type === 'number' && (
                    <div>
                      <TouchNumericKeypad
                        value={numberInput || 5}
                        min={currentQuestion.min || 1}
                        max={currentQuestion.max || 10}
                        unit={currentQuestion.unit || '/10'}
                        placeholder="5"
                        onChange={(val) => setNumberInput(String(val))}
                        onSubmit={(val) => {
                          submitResponse(currentQuestion.id, '', val, 'touch')
                          setNumberInput('')
                          nextQuestion()
                        }}
                      />
                    </div>
                  )}

                  {/* 8. FREE TEXT INPUT */}
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <footer className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-t border-border-light bg-surface-raised">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={previousQuestion}
            disabled={currentIndex === 0 || showFullForm}
          >
            {t('previous', 'Back')}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullForm(!showFullForm)}
              className="text-xs hidden sm:flex"
            >
              {showFullForm ? 'Back to Steps' : 'View Full Form'}
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                submitResponse(currentQuestion.id, '', null, 'skipped')
                nextQuestion()
              }}
              disabled={showFullForm}
            >
              {t('skip', 'Skip Question')}
            </Button>
          </div>
        </footer>
      </main>

      {/* Inactivity Warning Countdown Modal */}
      <SessionTimeoutModal
        isOpen={isTimeoutWarning}
        secondsLeft={timeoutSecondsLeft}
        onStay={resetTimeout}
        onEndSession={handleEndSession}
      />

      {/* Explicit End Session Confirmation Modal */}
      <AnimatePresence>
        {showEndSessionConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-border-light"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-text-primary text-lg font-heading mb-1.5">
                {t('endSession', 'End Kiosk Session?')}
              </h3>
              <p className="text-xs text-text-secondary mb-5">
                {t('endSessionConfirm', 'Are you sure you want to end this session? Unsaved responses will be cleared for patient privacy.')}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() => setShowEndSessionConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleEndSession}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Yes, End
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Multilingual Conversational Voice AI Modal */}
      <ConversationalVoiceModal
        isOpen={showConversationalModal}
        onClose={() => setShowConversationalModal(false)}
        onApplyIntake={handleApplyConversationalIntake}
        lang={lang}
      />

      {/* Non-Diagnostic Red-Flag Clinical Safety Alert Modal */}
      <RedFlagAlertModal
        isOpen={isRedFlagOpen}
        alertData={activeRedFlag}
        lang={lang}
        onClose={() => {
          if (activeRedFlag) {
            setAcknowledgedRedFlags(prev => [...prev, activeRedFlag.id])
          }
        }}
        onAcknowledge={() => {
          if (activeRedFlag) {
            setAcknowledgedRedFlags(prev => [...prev, activeRedFlag.id])
          }
        }}
      />
    </div>
  )
}
