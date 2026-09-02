import { Mic, MicOff } from 'lucide-react'

export default function VoiceRecorder({
  isListening = false,
  isSupported = true,
  transcript = '',
  interimTranscript = '',
  onStart,
  onStop,
  error,
  className = '',
}) {
  if (!isSupported) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <MicOff className="w-7 h-7 text-text-muted" />
        </div>
        <p className="text-sm text-text-muted">
          Voice input is not supported in this browser.
        </p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Microphone button with pulse animation */}
      <button
        onClick={isListening ? onStop : onStart}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 cursor-pointer
          ${isListening
            ? 'bg-primary-500 text-white animate-breathe'
            : 'bg-primary-50 text-primary-600 hover:bg-primary-100 active:scale-95'
          }
        `}
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
      >
        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-primary-400 opacity-30 animate-ping" />
            <span className="absolute -inset-2 rounded-full border-2 border-primary-300 animate-pulse-ring" />
          </>
        )}
        <Mic className="w-8 h-8 relative z-10" />
      </button>

      {/* Status text */}
      <p className={`mt-4 text-sm font-medium ${isListening ? 'text-primary-600' : 'text-text-muted'}`}>
        {isListening ? 'Listening...' : 'Tap to speak'}
      </p>

      {/* Live transcript */}
      {(transcript || interimTranscript) && (
        <div className="mt-4 max-w-md w-full bg-surface-muted rounded-xl p-4 text-center">
          <p className="text-text-primary leading-relaxed">
            {transcript && <span>"{transcript}"</span>}
            {interimTranscript && (
              <span className="text-text-muted italic"> {interimTranscript}</span>
            )}
          </p>
        </div>
      )}

      {/* Error state */}
      {error === 'microphone_blocked' && (
        <p className="mt-3 text-sm text-critical">
          Microphone access blocked. Please enable it in browser settings.
        </p>
      )}
    </div>
  )
}
