import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ArrowLeft, Heart, MessageCircle, Volume2, VolumeX, Sun,
  LogOut, FormInput, ListFilter, CheckSquare, Square, Calendar, Hash, Sparkles,
  Stethoscope, Leaf, Activity, Zap
} from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import BionicKioskShell from '../../components/kiosk/BionicKioskShell'
import { EcgLine } from '../../components/kiosk/Telemetry'
import { bionicSymptomTiles } from '../../data/bionicData'
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
    <BionicKioskShell
      activeTrack={mode === 'ayush' ? 'ayush' : 'modern'}
      onTrackChange={(newTrack) => setMode(newTrack === 'ayush' ? 'ayush' : 'allopathic')}
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 select-none">
        {/* ── Left Column: Clinical Questionnaire (7 cols) ── */}
        <section className="xl:col-span-7 flex flex-col justify-between">
          <div>
            {/* Top Title & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                  Clinical Intake{' '}
                  <span className="rounded-2xl bg-lime px-3 py-0.5 text-lime-ink inline-block text-2xl sm:text-3xl font-bold shadow-xs">
                    Interview
                  </span>
                </h1>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  {mode === 'ayush'
                    ? '🌿 AYUSH Track • Dashavidha Pariksha protocol'
                    : '🩺 Allopathic Protocol • SOCRATES pain assessment'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFullForm(!showFullForm)}
                  className="glass-pill px-3 py-1.5 text-xs font-bold text-cobalt border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  {showFullForm ? 'Step View' : 'Full Form'}
                </button>
                <button
                  onClick={() => setIsLowLiteracy(!isLowLiteracy)}
                  className={`glass-pill px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    isLowLiteracy ? 'bg-amber text-slate-900' : 'text-slate-600 border border-slate-200'
                  }`}
                >
                  {isLowLiteracy ? '☀️ Large Font ON' : '☀️ Large Font'}
                </button>
              </div>
            </div>

            {/* FULL FORM VIEW OVERLAY */}
            {showFullForm ? (
              <div className="glass-card p-5 bg-white border border-slate-200/80 shadow-xs max-h-[68vh] overflow-y-auto">
                <ClinicalHistoryFormView
                  responses={responses}
                  onUpdateResponse={(qId, val) => submitResponse(qId, '', val, 'form_edit')}
                  onClose={() => setShowFullForm(false)}
                />
              </div>
            ) : (
              /* STEP QUESTION CARD */
              <div className="glass-card p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs">
                {/* Section Badge & Question Counter */}
                <div className="flex items-center justify-between mb-3">
                  <span className="status-chip bg-cobalt-soft text-cobalt font-bold text-[11px]">
                    {currentQuestion.category || currentQuestion.section || 'QUESTION'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">
                      {currentIndex + 1} / {totalQuestions}
                    </span>
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cobalt rounded-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Question Prompt */}
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading mb-1 leading-snug">
                  {questionText}
                </h2>
                {(currentQuestion.hindi || currentQuestion.questionHi) && (
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mb-5">
                    {currentQuestion.hindi || currentQuestion.questionHi}
                  </p>
                )}

                {/* 1. COMPLAINT SELECTION WITH BIONIC TOUCH TILES */}
                {currentQuestion.type === 'complaint_select' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Touch to answer • स्पर्श करें
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {bionicSymptomTiles.map((tile) => (
                        <button
                          key={tile.id}
                          type="button"
                          onClick={() =>
                            handleComplaintSelect(
                              tile.id === 'chest'
                                ? 'chest_pain'
                                : tile.id === 'fever'
                                ? 'fever'
                                : tile.id === 'breath'
                                ? 'breathing'
                                : tile.id === 'headache'
                                ? 'headache'
                                : tile.id === 'stomach'
                                ? 'stomach_pain'
                                : 'cough'
                            )
                          }
                          className="glass-card tile-lift p-3.5 text-left border border-slate-200/80 bg-white hover:border-cobalt transition-all cursor-pointer shadow-xs flex flex-col justify-between h-28"
                        >
                          <span className="flex size-9 items-center justify-center rounded-xl bg-cobalt-soft text-cobalt">
                            <Activity className="size-4" />
                          </span>
                          <div>
                            <span className="block text-xs sm:text-sm font-bold text-slate-900">
                              {tile.en}
                            </span>
                            <span className="block text-[11px] text-slate-500 font-medium">
                              {tile.hi}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Additional Complaints */}
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 mb-2">OTHER COMPLAINTS:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {COMPLAINT_OPTIONS.filter((c) => !['chest_pain', 'fever', 'breathing', 'headache', 'stomach_pain', 'cough'].includes(c.id)).map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleComplaintSelect(opt.id)}
                            className="glass-card tile-lift p-2.5 text-left text-xs font-bold text-slate-800 border border-slate-200/70 hover:border-cobalt transition cursor-pointer"
                          >
                            <span className="text-base mr-1.5">{opt.icon}</span>
                            {opt.labels && opt.labels[lang] ? opt.labels[lang] : opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SCALE / PAIN SEVERITY SLIDER */}
                {(currentQuestion.type === 'scale' || currentQuestion.id === 'pain_severity' || currentQuestion.id === 'socrates_severity') && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span>1 • Mild / हल्का</span>
                      <span className="text-sm font-black text-white px-3 py-1 rounded-full bg-cobalt shadow-cobalt">
                        {numberInput || '5'} / 10
                      </span>
                      <span>10 • Worst / असहनीय</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={numberInput || 5}
                      onChange={(e) => setNumberInput(e.target.value)}
                      className="w-full accent-[var(--cobalt)] cursor-pointer h-2.5 bg-slate-200 rounded-lg"
                      aria-label="Pain severity slider"
                    />
                    <div className="flex justify-end pt-1">
                      <Button
                        size="md"
                        onClick={() => handleSelectOption(String(numberInput || 5))}
                        className="bg-cobalt text-white shadow-cobalt font-bold text-xs"
                      >
                        Confirm Severity ({numberInput || 5}/10)
                      </Button>
                    </div>
                  </div>
                )}

                {/* 3. YES / NO BUTTONS */}
                {currentQuestion.type === 'yes_no' && (
                  <div className="flex gap-4 justify-center py-4">
                    <button
                      type="button"
                      onClick={() => handleSelectOption('yes')}
                      className="glass-card tile-lift flex-1 max-w-[180px] py-4 rounded-2xl text-center font-bold text-base bg-emerald-soft text-emerald border border-emerald/30 hover:bg-emerald hover:text-white transition cursor-pointer"
                    >
                      {t('yes', 'Yes / हाँ')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectOption('no')}
                      className="glass-card tile-lift flex-1 max-w-[180px] py-4 rounded-2xl text-center font-bold text-base bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                    >
                      {t('no', 'No / नहीं')}
                    </button>
                  </div>
                )}

                {/* 4. SINGLE SELECT OPTIONS */}
                {currentQuestion.type === 'single_select' && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((opt) => {
                      const optLabel = getLocalizedOption(opt, lang)
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelectOption(opt.value)}
                          className="glass-card tile-lift w-full p-3.5 text-left border border-slate-200/80 bg-white hover:border-cobalt transition-all cursor-pointer flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800"
                        >
                          <span>{optLabel}</span>
                          <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-cobalt group-hover:text-white">
                            <ArrowRight className="size-3.5" />
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* 5. MULTI-SELECT OPTIONS */}
                {currentQuestion.type === 'multi_select' && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((opt) => {
                      const optLabel = getLocalizedOption(opt, lang)
                      const isSelected = selectedOptions.includes(opt.value)
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelectOption(opt.value)}
                          className={`glass-card tile-lift w-full p-3.5 text-left transition-all cursor-pointer flex items-center justify-between text-xs sm:text-sm font-semibold ${
                            isSelected
                              ? 'bg-cobalt-soft border-cobalt text-cobalt ring-1 ring-cobalt/30'
                              : 'border-slate-200/80 bg-white text-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <span>{optLabel}</span>
                          <span
                            className={`flex size-5 items-center justify-center rounded-md border ${
                              isSelected ? 'bg-cobalt border-cobalt text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <CheckSquare className="size-3.5" />}
                          </span>
                        </button>
                      )
                    })}
                    <div className="flex justify-end pt-3">
                      <Button
                        size="md"
                        onClick={handleSubmitCurrent}
                        disabled={selectedOptions.length === 0}
                        className="bg-cobalt text-white shadow-cobalt font-bold text-xs"
                      >
                        {t('confirm', 'Confirm Selections')} ({selectedOptions.length})
                      </Button>
                    </div>
                  </div>
                )}

                {/* 6. NUMERIC KEYPAD */}
                {(currentQuestion.type === 'number' || currentQuestion.type === 'numeric_touch') && (
                  <div className="space-y-4">
                    <TouchNumericKeypad
                      value={numberInput}
                      onChange={setNumberInput}
                      onSubmit={handleSubmitCurrent}
                      label={questionText}
                      unit={currentQuestion.unit || ''}
                    />
                  </div>
                )}

                {/* 7. DATE PICKER */}
                {currentQuestion.type === 'date' && (
                  <div className="space-y-4">
                    <TouchDatePicker
                      value={dateValue}
                      onChange={setDateValue}
                      onSubmit={handleSubmitCurrent}
                    />
                  </div>
                )}

                {/* 8. FREE TEXT INPUT */}
                {currentQuestion.type === 'text' && (
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type details or speak into the microphone on the right..."
                      className="w-full p-3 rounded-2xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-cobalt"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="md"
                        onClick={handleSubmitCurrent}
                        disabled={!textInput.trim()}
                        className="bg-cobalt text-white shadow-cobalt font-bold text-xs"
                      >
                        {t('submit', 'Submit Answer')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Controls Bar at bottom of card */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={isSpeaking ? VolumeX : Volume2}
                      onClick={handleReadAloud}
                      className={isSpeaking ? 'text-cobalt bg-cobalt-soft text-xs' : 'text-xs text-slate-600'}
                    >
                      <span>{isSpeaking ? t('stopAudio', 'Stop') : t('readAloud', 'Listen')}</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={previousQuestion}
                      disabled={currentIndex === 0}
                      className="glass-pill px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 disabled:opacity-40 cursor-pointer hover:bg-slate-50"
                    >
                      ← {t('back', 'Back')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        submitResponse(currentQuestion.id, '', null, 'skipped')
                        nextQuestion()
                      }}
                      className="glass-pill px-3 py-1.5 text-xs font-bold text-slate-400 border border-slate-200 cursor-pointer hover:text-slate-600"
                    >
                      {t('skip', 'Skip')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Right Column: Voice Assistant & Telemetry Panel (5 cols) ── */}
        <section className="xl:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Bionic Voice Assistant Card */}
          <div className="glass-card p-5 bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
            <span className="status-chip bg-cobalt-soft text-cobalt mb-2 font-bold text-[10px]">
              AI VOICE ASSISTANT
            </span>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Speak in Hindi or English
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Natural speech recognition with Indian code-switching support
            </p>

            {/* Pulsing Microphone Waveform Component */}
            <div className="my-4 w-full flex justify-center">
              <VoiceRecorder
                isListening={isListening}
                isSupported={isSupported}
                transcript={transcript}
                interimTranscript={interimTranscript}
                onStart={startListening}
                onStop={stopListening}
                error={error}
                className="w-full"
              />
            </div>

            {/* Voice Normalization Match Badge */}
            {voiceMatchStatus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-emerald-soft border border-emerald/30 text-emerald-900 p-2.5 rounded-xl text-left text-xs mb-3"
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="size-2 rounded-full bg-emerald animate-ping" />
                  <span>Voice Matched:</span>
                </div>
                <p className="mt-0.5 text-[11px] truncate">"{voiceMatchStatus.heard}" → {voiceMatchStatus.normalized}</p>
              </motion.div>
            )}

            {/* Conversational Voice AI Trigger Button */}
            <button
              onClick={() => setShowConversationalModal(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cobalt to-cobalt-deep text-white text-xs font-bold shadow-cobalt hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="size-4" />
              <span>Free-Flow Voice Conversation</span>
            </button>
          </div>
        </section>
      </div>

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
    </BionicKioskShell>
  )
}
