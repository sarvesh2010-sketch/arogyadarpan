import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, X, Sparkles, Loader2, Send, MessageSquare, CheckCircle2, ArrowRight, RotateCcw
} from 'lucide-react'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { parseConversationalIntakeWithLlama, parseConversationalIntake } from '../services/conversationalAiEngine'

/**
 * OtherComplaintModal
 * Shown when patient taps "Other Complaint" on the chief complaint screen.
 * Accepts free-form voice OR typed text, sends to Groq for structuring,
 * and returns a structured { complaintLabel, complaintId, followUpQuestions } to the parent.
 */
export default function OtherComplaintModal({
  isOpen,
  onClose,
  onSubmit,
  lang = 'en',
}) {
  const [typedText, setTypedText] = useState('')
  const [combinedText, setCombinedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [structuredResult, setStructuredResult] = useState(null)
  const [phase, setPhase] = useState('input')
  const [groqError, setGroqError] = useState(null)
  const textareaRef = useRef(null)
  const isHindi = lang === 'hi'

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput({
    lang,
    continuous: true,
    onResult: (finalText) => {
      setCombinedText(prev => (prev + ' ' + finalText).trim())
    },
  })

  const displayText = combinedText || typedText
  const interimDisplay = isListening && interimTranscript ? interimTranscript : ''

  useEffect(() => {
    if (isOpen) {
      setTypedText('')
      setCombinedText('')
      setStructuredResult(null)
      setGroqError(null)
      setPhase('input')
      resetTranscript?.()
      setTimeout(() => textareaRef.current?.focus(), 200)
    } else {
      if (isListening) stopListening()
    }
  }, [isOpen])

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript?.()
      startListening()
    }
  }

  const handleTextChange = (e) => {
    setTypedText(e.target.value)
    setCombinedText(e.target.value)
  }

  const handleSubmitToGroq = async () => {
    const inputText = displayText.trim()
    if (!inputText) return
    if (isListening) stopListening()
    setPhase('thinking')
    setIsProcessing(true)
    setGroqError(null)
    try {
      const result = await parseConversationalIntakeWithLlama(inputText, lang, [])
      const complaintLabel = result?.primaryComplaint?.label || result?.chiefComplaint || inputText.slice(0, 60)
      const complaintId = result?.primaryComplaint?.id || ('custom_' + inputText.slice(0, 20).toLowerCase().replace(/\s+/g, '_'))
      const followUpQuestions = result?.followUpQuestions || []
      const aiReply = result?.conversationalReply || ''
      setStructuredResult({
        rawText: inputText,
        complaintLabel,
        complaintId,
        followUpQuestions,
        aiReply,
        duration: result?.duration || null,
        severity: result?.severity || null,
        associatedSymptoms: result?.associatedSymptoms || [],
        isAiStructured: result?.isLlamaGenerated || false,
      })
      setPhase('result')
    } catch (err) {
      console.error('[OtherComplaintModal] Groq error:', err)
      const fallback = parseConversationalIntake(displayText, lang)
      setStructuredResult({
        rawText: displayText,
        complaintLabel: fallback?.primaryComplaint?.label || displayText.slice(0, 60),
        complaintId: fallback?.primaryComplaint?.id || 'other_custom',
        followUpQuestions: [],
        aiReply: isHindi ? 'आपकी बात नोट कर ली गई है।' : 'Your complaint has been noted.',
        isAiStructured: false,
      })
      setGroqError('AI unavailable — using local parser.')
      setPhase('result')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirm = () => {
    if (structuredResult) {
      onSubmit(structuredResult)
      onClose()
    }
  }

  const handleRetry = () => {
    setPhase('input')
    setStructuredResult(null)
    setGroqError(null)
    setCombinedText('')
    setTypedText('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        key="other-complaint-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          key="other-complaint-modal"
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <MessageSquare className="size-4" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-slate-900 text-base leading-tight">
                  {isHindi ? 'अपनी समस्या बताएं' : 'Describe Your Complaint'}
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  {isHindi ? 'बोलकर या लिखकर बताएं — AI समझेगा' : 'Speak or type — Groq AI will understand and structure it'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="px-5 py-4">
            {phase === 'input' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  disabled={!isSupported}
                  className={"w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer border-2 " + (isListening ? 'bg-red-50 border-red-400 text-red-600 animate-pulse shadow-md' : 'bg-violet-50 border-violet-300 text-violet-700 hover:bg-violet-100') + " disabled:opacity-40 disabled:cursor-not-allowed"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="size-5" />
                      {isHindi ? 'सुनना बंद करें' : 'Stop Listening'}
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    </>
                  ) : (
                    <>
                      <Mic className="size-5" />
                      {isHindi ? '🎙️ बोलकर बताएं' : '🎙️ Tap to Speak Your Complaint'}
                    </>
                  )}
                </button>

                {isListening && interimDisplay && (
                  <div className="px-3 py-2 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-700 italic animate-pulse">
                    {interimDisplay}…
                  </div>
                )}

                {combinedText && (
                  <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                    ✓ Heard: "{combinedText}"
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    {isHindi ? 'या लिखें' : 'or type below'}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    rows={3}
                    value={combinedText || typedText}
                    onChange={handleTextChange}
                    placeholder={isHindi ? 'जैसे: कल से पेट में दर्द है और उल्टी भी हो रही है…' : 'e.g. I have a burning sensation in my stomach since yesterday with nausea…'}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none placeholder:text-slate-400 leading-relaxed transition"
                  />
                  {displayText && (
                    <button
                      type="button"
                      onClick={() => { setCombinedText(''); setTypedText('') }}
                      className="absolute top-2.5 right-2.5 size-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 text-xs cursor-pointer transition"
                    >
                      x
                    </button>
                  )}
                </div>

                {voiceError && (
                  <p className="text-xs text-amber-600 font-medium">
                    Microphone unavailable. Please type your complaint below.
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSubmitToGroq}
                  disabled={!displayText.trim()}
                  className="w-full py-3.5 rounded-2xl font-heading font-bold text-white text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                >
                  <Sparkles className="size-4" />
                  {isHindi ? 'AI से समझाएं' : 'Analyze with Groq AI'}
                  <Send className="size-4" />
                </button>
              </div>
            )}

            {phase === 'thinking' && (
              <div className="py-10 flex flex-col items-center gap-4 text-center">
                <div className="size-16 rounded-3xl bg-gradient-to-tr from-violet-100 to-indigo-100 flex items-center justify-center">
                  <Loader2 className="size-8 text-violet-600 animate-spin" />
                </div>
                <div>
                  <p className="font-heading font-bold text-slate-900 text-base">
                    {isHindi ? 'AI सोच रहा है…' : 'Groq AI is structuring your complaint…'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {isHindi ? 'Clinical format में तैयार कर रहे हैं' : 'Converting to clinical SOCRATES format'}
                  </p>
                </div>
                <div className="text-xs font-mono text-violet-700 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-200">
                  Groq llama-3.3-70b
                </div>
              </div>
            )}

            {phase === 'result' && structuredResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className={"px-2.5 py-1 rounded-full text-[10px] font-bold border " + (structuredResult.isAiStructured ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200')}>
                    {structuredResult.isAiStructured ? 'Groq AI Structured' : 'Local Parser'}
                  </div>
                  {groqError && <span className="text-[10px] text-amber-600">{groqError}</span>}
                </div>

                {structuredResult.aiReply && (
                  <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-200">
                    <p className="text-xs text-violet-800 font-medium leading-relaxed">
                      {structuredResult.aiReply}
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-white border-2 border-violet-300 shadow-sm space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chief Complaint — Structured</p>
                  <p className="font-heading font-extrabold text-slate-900 text-lg">{structuredResult.complaintLabel}</p>
                  {structuredResult.duration && (
                    <p className="text-xs text-slate-600">Duration: <strong>{structuredResult.duration}</strong></p>
                  )}
                  {structuredResult.severity && (
                    <p className="text-xs text-slate-600">Severity: <strong>{structuredResult.severity} / 10</strong></p>
                  )}
                  {structuredResult.associatedSymptoms && structuredResult.associatedSymptoms.length > 0 && (
                    <p className="text-xs text-slate-600">
                      Associated: <strong>{structuredResult.associatedSymptoms.map(s => s.label || s).join(', ')}</strong>
                    </p>
                  )}
                </div>

                {structuredResult.followUpQuestions && structuredResult.followUpQuestions.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Follow-Up Questions</p>
                    {structuredResult.followUpQuestions.slice(0, 3).map((q, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="size-5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-xs text-slate-700 font-medium leading-snug">{typeof q === 'string' ? q : q.question || q.text || String(q)}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="size-3.5" />
                    {isHindi ? 'फिर से बताएं' : 'Re-enter'}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <CheckCircle2 className="size-4" />
                    {isHindi ? 'शिकायत दर्ज करें' : 'Confirm and Proceed'}
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}