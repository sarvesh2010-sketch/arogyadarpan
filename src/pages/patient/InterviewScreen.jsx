import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Heart, MessageCircle, Volume2, Sun } from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import VoiceRecorder from '../../components/VoiceRecorder'
import CompletenessTracker from '../../components/CompletenessTracker'
import ClinicalSignalCard from '../../components/ClinicalSignalCard'
import SymptomRadarCard from '../../components/SymptomRadarCard'
import AYUSHModeToggle from '../../components/AYUSHModeToggle'
import { useInterview } from '../../hooks/useInterview'
import { useVoiceInput } from '../../hooks/useVoiceInput'
import { COMPLAINT_OPTIONS } from '../../data/questionBank'

export default function InterviewScreen() {
  const navigate = useNavigate()
  const lang = localStorage.getItem('arogya_language') || 'en'
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
    lang: lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : 'en-IN',
    onResult: handleVoiceResult,
  })

  // TTS Read Aloud with Multilingual Hindi & Punjabi Support
  const handleReadAloud = () => {
    if (!currentQuestion) return
    const text = lang === 'hi' && currentQuestion.questionHi ? currentQuestion.questionHi : currentQuestion.question
    const ttsLang = lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : 'en-IN'
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.lang = ttsLang
      window.speechSynthesis.speak(utterance)
    }
  }

  // Safe navigation on completion inside useEffect
  useEffect(() => {
    if (isComplete) {
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
      setTimeout(nextQuestion, 300)
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
    setTimeout(nextQuestion, 300)
  }

  const questionText = lang === 'hi' && currentQuestion.questionHi
    ? currentQuestion.questionHi
    : currentQuestion.question

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
              ArogyaDarpan
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
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-border-light bg-surface-raised">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-text-primary text-lg font-heading">
              Clinical Intake Interview
            </h2>
            <span className="bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-primary-200">
              {mode === 'ayush' ? '🌿 AYUSH Track' : '🩺 Modern Track'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" icon={Volume2} onClick={handleReadAloud}>
              Listen
            </Button>
            <span className="text-sm font-semibold text-text-muted">
              {currentIndex + 1} / {totalQuestions}
            </span>
            <div className="w-36 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </header>

        {/* Question & Interactive Response Area */}
        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <div className="max-w-2xl w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* AI Assistant Banner */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-primary-700 font-heading">ArogyaDarpan Intake AI</span>
                  </div>

                  <span className="text-xs text-text-muted">Speak in English, Hindi or Punjabi</span>
                </div>

                {/* Main Question Heading */}
                <h2 className={`font-bold text-text-primary font-heading mb-8 leading-snug ${isLowLiteracy ? 'text-3xl' : 'text-2xl md:text-3xl'}`}>
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
                  className="mb-8"
                />

                {/* Answer Options based on Type */}
                {currentQuestion.type === 'complaint_select' && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-text-muted mb-3">Speak or select your primary complaint</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {COMPLAINT_OPTIONS.map(opt => (
                        <Card
                          key={opt.id}
                          hover
                          onClick={() => handleComplaintSelect(opt.id)}
                          padding="px-4 py-4"
                          className="flex flex-col items-center text-center gap-2"
                        >
                          <span className="text-3xl">{opt.icon}</span>
                          <span className="font-bold text-text-primary text-sm font-heading">
                            {lang === 'hi' ? opt.labelHi : opt.label}
                          </span>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {currentQuestion.type === 'yes_no' && (
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      size={isLowLiteracy ? 'xl' : 'lg'}
                      onClick={() => handleSelectOption('yes')}
                      className="min-w-[140px]"
                    >
                      {lang === 'hi' ? 'हाँ (Yes)' : 'Yes'}
                    </Button>
                    <Button
                      variant="secondary"
                      size={isLowLiteracy ? 'xl' : 'lg'}
                      onClick={() => handleSelectOption('no')}
                      className="min-w-[140px]"
                    >
                      {lang === 'hi' ? 'नहीं (No)' : 'No'}
                    </Button>
                  </div>
                )}

                {currentQuestion.type === 'single_select' && currentQuestion.options && (
                  <div className="space-y-2.5">
                    {currentQuestion.options.map(opt => (
                      <Card
                        key={opt.value}
                        hover
                        onClick={() => handleSelectOption(opt.value)}
                        padding="px-5 py-4"
                      >
                        <span className="font-bold text-text-primary text-base">
                          {lang === 'hi' && opt.labelHi ? opt.labelHi : opt.label}
                        </span>
                      </Card>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'multi_select' && currentQuestion.options && (
                  <div className="space-y-2.5">
                    {currentQuestion.options.map(opt => (
                      <Card
                        key={opt.value}
                        hover
                        selected={selectedOptions.includes(opt.value)}
                        onClick={() => handleSelectOption(opt.value)}
                        padding="px-5 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedOptions.includes(opt.value)
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedOptions.includes(opt.value) && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="font-bold text-text-primary text-base">
                            {lang === 'hi' && opt.labelHi ? opt.labelHi : opt.label}
                          </span>
                        </div>
                      </Card>
                    ))}
                    <Button
                      size="lg"
                      fullWidth
                      className="mt-4"
                      disabled={selectedOptions.length === 0}
                      onClick={handleSubmitCurrent}
                    >
                      Continue
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
                      className="w-full px-4 py-3.5 rounded-2xl border border-border-light bg-surface-raised text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none font-medium"
                    />
                    <Button
                      size="lg"
                      fullWidth
                      className="mt-4"
                      disabled={!textInput.trim()}
                      onClick={handleSubmitCurrent}
                      iconRight={ArrowRight}
                    >
                      Continue
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
                      className="w-full max-w-xs mb-4 accent-primary-500"
                    />
                    <span className="text-4xl font-extrabold text-primary-600 font-heading mb-6">
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
                      Continue
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="flex items-center justify-between px-8 py-4 border-t border-border-light bg-surface-raised">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={previousQuestion}
            disabled={currentIndex === 0}
          >
            Back
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              submitResponse(currentQuestion.id, '', null, 'skipped')
              nextQuestion()
            }}
          >
            Skip Question
          </Button>
        </footer>
      </main>
    </div>
  )
}
