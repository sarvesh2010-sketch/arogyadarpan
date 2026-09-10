import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Check, X, Sparkles, AlertCircle, Volume2, Loader2, MessageSquare, ChevronRight } from 'lucide-react'
import Button from './Button'
import Badge from './Badge'
import { useVoiceInput } from '../hooks/useVoiceInput'
import {
  parseConversationalIntake,
  parseConversationalIntakeWithLlama,
  processMultiTurnConversation,
  buildConversationMessage,
  mergeEntitiesFromMultipleTurns
} from '../services/conversationalAiEngine'

export default function ConversationalVoiceModal({
  isOpen,
  onClose,
  lang = 'en',
  onApplyIntake,
}) {
  const [currentText, setCurrentText] = useState('')
  const [parsedResult, setParsedResult] = useState(null)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [accumulatedEntities, setAccumulatedEntities] = useState({})
  const [followUpQuestions, setFollowUpQuestions] = useState([])
  const [turnCount, setTurnCount] = useState(0)
  const [isIntakeComplete, setIsIntakeComplete] = useState(false)
  const [socratesCoverage, setSocratesCoverage] = useState({})
  const chatEndRef = useRef(null)

  const {
    isListening,
    transcript,
    interimTranscript,
    audioLevel,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput({
    lang,
    continuous: true,
    onResult: (finalText) => {
      const fullText = (currentText + ' ' + finalText).trim()
      setCurrentText(fullText)
    },
  })

  // Process voice input through LLM when user finishes speaking a phrase
  useEffect(() => {
    const textToProcess = currentText.trim()
    if (!textToProcess || textToProcess.length < 4 || isAiThinking || isAiSpeaking) return

    const processInput = async () => {
      setIsAiThinking(true)
      stopListening()

      // Build conversation message
      const userMsg = buildConversationMessage('user', textToProcess)
      const updatedHistory = [...conversationHistory, userMsg]

      try {
        // Use multi-turn LLM processing via Groq
        const result = await processMultiTurnConversation(updatedHistory, lang)

        if (result && result.isLlamaGenerated) {
          const aiReply = result.conversationalReply || (lang === 'hi' ? 'जानकारी के लिए धन्यवाद। कृपया आगे बताएं।' : 'Thank you. Please tell me more.')
          const aiMsg = buildConversationMessage('assistant', aiReply)

          setConversationHistory([...updatedHistory, aiMsg])

          if (result.extractedEntities) {
            setAccumulatedEntities(prev => mergeEntitiesFromMultipleTurns(prev, result.extractedEntities))
          }

          setParsedResult(result)
          setFollowUpQuestions(result.followUpQuestions || [])
          setSocratesCoverage(result.socratesCoverage || {})
          setIsIntakeComplete(result.isIntakeComplete || false)
          setTurnCount(prev => prev + 1)

          // Auto-speak AI reply then re-arm listening for the follow-up answer
          speakAiReply(aiReply, () => {
            if (!result.isIntakeComplete) {
              setCurrentText('')
              resetTranscript()
              startListening()
            }
          })
        } else {
          // Fallback to local parsing
          const localResult = parseConversationalIntake(textToProcess, lang)
          setParsedResult(localResult)
          setConversationHistory(updatedHistory)
          setTurnCount(prev => prev + 1)
        }
      } catch (err) {
        console.warn('LLM processing error, falling back to local:', err)
        const localResult = parseConversationalIntake(textToProcess, lang)
        setParsedResult(localResult)
      } finally {
        setIsAiThinking(false)
        setCurrentText('')
        resetTranscript()
      }
    }

    // Debounce: wait 1.2s after last spoken transcript chunk
    const timer = setTimeout(processInput, 1200)
    return () => clearTimeout(timer)
  }, [currentText, isAiThinking, isAiSpeaking])

  // Also do instant local parsing for real-time preview while speaking
  useEffect(() => {
    const textToParse = (currentText + ' ' + interimTranscript).trim()
    if (textToParse.length > 4 && isListening) {
      const parsed = parseConversationalIntake(textToParse, lang)
      // Only update parsed result if we don't have an LLM result yet
      if (!parsedResult?.isLlamaGenerated || turnCount === 0) {
        setParsedResult(parsed)
      }
    }
  }, [currentText, interimTranscript, lang, isListening])

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory])

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentText('')
      setParsedResult(null)
      setConversationHistory([])
      setAccumulatedEntities({})
      setFollowUpQuestions([])
      setTurnCount(0)
      setIsIntakeComplete(false)
      setSocratesCoverage({})
      resetTranscript()
      startListening()
    } else {
      stopListening()
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [isOpen])

  // AI audio reply with completion callback
  const speakAiReply = (text, onComplete) => {
    if (!text || !('speechSynthesis' in window)) {
      onComplete?.()
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    utterance.rate = 0.95
    utterance.onstart = () => setIsAiSpeaking(true)
    utterance.onend = () => {
      setIsAiSpeaking(false)
      onComplete?.()
    }
    utterance.onerror = () => {
      setIsAiSpeaking(false)
      onComplete?.()
    }
    window.speechSynthesis.speak(utterance)
  }

  const handleSpeakAiReply = () => {
    if (parsedResult?.conversationalReply) {
      speakAiReply(parsedResult.conversationalReply)
    }
  }

  // Handle follow-up question tap
  const handleFollowUpTap = (question) => {
    const questionText = lang === 'hi' ? question.questionTextHi : question.questionTextEn
    speakAiReply(questionText, () => {
      const aiMsg = buildConversationMessage('assistant', questionText)
      setConversationHistory(prev => [...prev, aiMsg])
      setCurrentText('')
      resetTranscript()
      startListening()
    })
  }

  const handleApply = () => {
    if (parsedResult) {
      // Merge accumulated entities into the result
      const finalResult = {
        ...parsedResult,
        accumulatedEntities,
        conversationTurns: turnCount,
        isMultiTurn: turnCount > 1,
      }
      onApplyIntake?.(finalResult)
    }
    onClose()
  }

  if (!isOpen) return null

  // Calculate SOCRATES progress
  const socratesTotal = Object.keys(socratesCoverage).length || 8
  const socratesFilled = Object.values(socratesCoverage).filter(Boolean).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-surface-raised rounded-3xl border border-border-light shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 border-b border-border-light pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-base font-heading">
                {lang === 'hi' ? 'AI बातचीत (बोलकर बताएं)' : 'AI Conversational Intake'}
              </h3>
              <p className="text-xs text-text-muted">
                {lang === 'hi' ? 'बोलिए — AI समझेगा और सवाल पूछेगा' : 'Speak naturally — AI will understand & ask follow-ups'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {turnCount > 0 && (
              <Badge severity="info" size="sm">
                Turn {turnCount}
              </Badge>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-text-muted hover:text-text-primary rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversation Chat View */}
        {conversationHistory.length > 0 && (
          <div className="flex-shrink-0 max-h-40 overflow-y-auto mb-3 space-y-2 border border-border-light rounded-xl p-3 bg-surface-muted">
            {conversationHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white rounded-br-sm'
                      : 'bg-white border border-border-light text-text-primary rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <span className="text-primary-600 font-bold mr-1">🤖 AI:</span>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* Microphone Pulse & Status */}
        <div className="text-center py-4 bg-surface-muted rounded-2xl border border-border-light mb-3 flex-shrink-0">
          <div className="relative inline-flex items-center justify-center mb-2">
            {/* Animated Pulsing Ring proportional to audioLevel */}
            {isListening && (
              <span
                className="absolute w-20 h-20 rounded-full bg-primary-400/30 animate-ping"
                style={{ transform: `scale(${1 + audioLevel / 60})` }}
              />
            )}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isAiThinking}
              className={`
                relative w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer
                ${isAiThinking
                  ? 'bg-amber-500 text-white animate-pulse ring-4 ring-amber-200'
                  : isListening
                    ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white ring-4 ring-rose-200'
                    : 'bg-primary-500 text-white hover:bg-primary-600 ring-4 ring-primary-100'
                }
              `}
            >
              {isAiThinking ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : isListening ? (
                <Mic className="w-7 h-7 animate-pulse" />
              ) : (
                <MicOff className="w-7 h-7" />
              )}
            </button>
          </div>

          <p className="font-bold text-text-primary text-sm mb-0.5">
            {isAiThinking
              ? (lang === 'hi' ? '🧠 AI सोच रहा है...' : '🧠 AI is analyzing...')
              : isListening
                ? (lang === 'hi' ? '🎙️ सुन रहा हूँ... बोलिए' : '🎙️ Listening... Speak naturally')
                : (lang === 'hi' ? 'माइक बंद — टैप करें' : 'Mic paused — tap to start')
            }
          </p>
          {turnCount === 0 && (
            <p className="text-xs text-text-muted italic px-4">
              "{lang === 'hi' ? 'उदा: पेट में दर्द है और कल से उल्टी भी हो रही है' : 'e.g. I have stomach pain and vomiting since yesterday'}"
            </p>
          )}
        </div>

        {/* Live Speech Transcript (current turn) */}
        {(currentText || interimTranscript) && (
          <div className="bg-surface-raised border border-border-light rounded-xl p-3 mb-3 flex-shrink-0">
            <p className="text-xs font-bold text-text-muted uppercase mb-1">
              {lang === 'hi' ? 'लाइव ट्रांसक्रिप्ट:' : 'Live Transcript:'}
            </p>
            <p className="text-sm text-text-primary leading-relaxed font-medium">
              <span>{currentText}</span>
              {interimTranscript && <span className="text-text-muted italic"> {interimTranscript}</span>}
            </p>
          </div>
        )}

        {/* Follow-Up Question Chips */}
        {followUpQuestions.length > 0 && !isAiThinking && (
          <div className="mb-3 flex-shrink-0">
            <p className="text-xs font-bold text-primary-700 mb-1.5 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {lang === 'hi' ? 'AI के अगले सवाल:' : 'AI Follow-Up Questions:'}
            </p>
            <div className="space-y-1.5">
              {followUpQuestions.map((q, idx) => (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => handleFollowUpTap(q)}
                  className="w-full text-left px-3 py-2 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-xl text-xs text-primary-900 font-medium transition-colors cursor-pointer flex items-center gap-2"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                  <span>{lang === 'hi' ? q.questionTextHi : q.questionTextEn}</span>
                  {q.socratesCategory && (
                    <Badge severity="info" size="xs" className="ml-auto flex-shrink-0">
                      {q.socratesCategory}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Extracted Clinical Entities */}
        {parsedResult && (
          <div className="space-y-2 mb-3 flex-shrink-0 overflow-y-auto max-h-48">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                {lang === 'hi' ? 'AI द्वारा पहचानी गई जानकारी' : 'AI Extracted Clinical Facts'}
              </span>
              <div className="flex items-center gap-1.5">
                {parsedResult.isLlamaGenerated && (
                  <Badge severity="success" size="sm">
                    ⚡ Groq AI
                  </Badge>
                )}
                {/* SOCRATES Progress */}
                {socratesFilled > 0 && (
                  <Badge severity="info" size="sm">
                    SOCRATES {socratesFilled}/8
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Primary Complaint */}
              {parsedResult.primaryComplaint && (
                <div className="bg-primary-50/80 border border-primary-200 p-2.5 rounded-xl">
                  <span className="font-bold text-primary-900 block mb-0.5">Main Complaint:</span>
                  <span className="text-primary-800 font-semibold">{parsedResult.primaryComplaint.label}</span>
                </div>
              )}

              {/* Duration */}
              {parsedResult.duration && (
                <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-xl">
                  <span className="font-bold text-amber-900 block mb-0.5">Duration:</span>
                  <span className="text-amber-800 font-semibold">{parsedResult.duration}</span>
                </div>
              )}

              {/* Red Flags */}
              {parsedResult.redFlags?.length > 0 && (
                <div className="col-span-2 bg-red-50/80 border border-red-300 p-2.5 rounded-xl">
                  <span className="font-bold text-red-900 block mb-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Red Flags Detected:
                  </span>
                  <span className="text-red-800 font-semibold">
                    {parsedResult.redFlags.join(' • ')}
                  </span>
                </div>
              )}

              {/* ESI Level */}
              {parsedResult.esiLevel && parsedResult.isLlamaGenerated && (
                <div className={`p-2.5 rounded-xl border ${
                  parsedResult.esiLevel <= 2
                    ? 'bg-red-50 border-red-300'
                    : parsedResult.esiLevel === 3
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-emerald-50 border-emerald-300'
                }`}>
                  <span className="font-bold block mb-0.5" style={{
                    color: parsedResult.esiLevel <= 2 ? '#7f1d1d' : parsedResult.esiLevel === 3 ? '#78350f' : '#064e3b'
                  }}>ESI Triage Level:</span>
                  <span className="font-semibold" style={{
                    color: parsedResult.esiLevel <= 2 ? '#991b1b' : parsedResult.esiLevel === 3 ? '#92400e' : '#065f46'
                  }}>
                    Level {parsedResult.esiLevel} — {
                      ['', 'Resuscitation', 'Emergency', 'Urgent', 'Less Urgent', 'Non-Urgent'][parsedResult.esiLevel]
                    }
                  </span>
                </div>
              )}

              {/* Associated Symptoms */}
              {parsedResult.associatedSymptoms?.length > 0 && (
                <div className={`${parsedResult.esiLevel && parsedResult.isLlamaGenerated ? '' : 'col-span-2'} bg-purple-50/80 border border-purple-200 p-2.5 rounded-xl`}>
                  <span className="font-bold text-purple-900 block mb-0.5">Associated Symptoms:</span>
                  <span className="text-purple-800 font-semibold">
                    {parsedResult.associatedSymptoms.map(s => s.label).join(', ')}
                  </span>
                </div>
              )}

              {/* Extracted Diseases */}
              {parsedResult.diseases?.length > 0 && (
                <div className="col-span-2 bg-blue-50/80 border border-blue-200 p-2.5 rounded-xl">
                  <span className="font-bold text-blue-900 block mb-0.5">Reported Condition:</span>
                  <span className="text-blue-800 font-semibold">
                    {parsedResult.diseases.map(d => `${d.disease} (ICD-10 ${d.icd10})`).join(', ')}
                  </span>
                </div>
              )}

              {/* Extracted Medications */}
              {parsedResult.medications?.length > 0 && (
                <div className="col-span-2 bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-xl">
                  <span className="font-bold text-emerald-900 block mb-0.5">Medication & Dose:</span>
                  <span className="text-emerald-800 font-semibold">
                    {parsedResult.medications.map(m => `${m.medication} ${m.dose} — ${m.frequency}`).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* AI Conversational Response */}
            {parsedResult.conversationalReply && (
              <div className="bg-surface-muted border border-border-light p-3 rounded-xl flex items-start justify-between gap-3 text-xs">
                <p className="text-text-secondary leading-relaxed flex-1">
                  🤖 <span className="font-semibold text-text-primary">AI:</span> {parsedResult.conversationalReply}
                </p>
                <button
                  type="button"
                  onClick={handleSpeakAiReply}
                  className="text-primary-600 hover:text-primary-800 font-semibold flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Speak
                </button>
              </div>
            )}
          </div>
        )}

        {/* Intake Completeness Indicator */}
        {isIntakeComplete && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 mb-3 flex-shrink-0 text-center">
            <p className="text-sm font-bold text-emerald-800 flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" />
              {lang === 'hi' ? 'पर्याप्त जानकारी मिल गई — आगे बढ़ सकते हैं' : 'Sufficient information gathered — ready to proceed'}
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-light flex-shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Check}
            disabled={!parsedResult?.primaryComplaint && !parsedResult?.duration && !parsedResult?.associatedSymptoms?.length}
            onClick={handleApply}
          >
            {lang === 'hi' ? 'लागू करें और आगे बढ़ें' : 'Apply Answers & Continue'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
