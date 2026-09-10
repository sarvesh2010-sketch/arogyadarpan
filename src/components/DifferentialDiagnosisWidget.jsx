import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Check, Sparkles, Activity } from 'lucide-react'
import Badge from './Badge'

const URGENCY_COLORS = {
  critical: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
}

export default function DifferentialDiagnosisWidget({ candidates = [], isLlmGenerated = false, onSelectICD }) {
  const [selectedCode, setSelectedCode] = useState(null)

  if (candidates.length === 0) return null

  return (
    <div className="bg-surface-raised rounded-2xl border border-border-light shadow-card p-5">
      <div className="flex items-center justify-between border-b border-border-light pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary font-heading">
              AI Differential Diagnosis & ICD-10 Candidates
            </h3>
            <p className="text-[11px] text-text-muted">Evidence-Backed Clinical Decision Support</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLlmGenerated ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold font-mono">
              <Sparkles className="w-3 h-3" />
              ⚡ Groq AI
            </span>
          ) : (
            <Badge severity="primary" size="sm" dot>Rule Engine</Badge>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {candidates.map((cand, idx) => (
          <motion.div
            key={cand.icdCode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            onClick={() => setSelectedCode(cand.icdCode)}
            className={`
              p-4 rounded-xl border transition-all cursor-pointer
              ${selectedCode === cand.icdCode
                ? 'border-primary-500 bg-primary-50/50 shadow-xs'
                : 'border-border-light bg-surface-muted hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-primary-600 text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
                  ICD {cand.icdCode}
                </span>
                <h4 className="font-bold text-text-primary text-sm">{cand.disease}</h4>
                {cand.urgency && (
                  <span className={`${URGENCY_COLORS[cand.urgency] || 'bg-slate-400'} text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide`}>
                    {cand.urgency}
                  </span>
                )}
              </div>
              <span className="font-bold text-xs text-primary-700 font-heading flex-shrink-0">
                {cand.probability}% Match
              </span>
            </div>

            {/* Probability Bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full mb-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all"
                style={{ width: `${cand.probability}%` }}
              />
            </div>

            {/* LLM brief explanation (only shown when AI-generated) */}
            {cand.briefExplanation && (
              <p className="text-xs text-text-secondary italic mb-2 leading-relaxed border-l-2 border-primary-300 pl-2">
                {cand.briefExplanation}
              </p>
            )}

            {/* Evidence Bullets */}
            <div className="space-y-1 my-2">
              {(cand.evidence || []).map((ev, eIdx) => (
                <p key={eIdx} className="text-xs text-text-secondary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                  {ev}
                </p>
              ))}
            </div>

            {/* Doctor Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border-light/60 mt-2">
              <span className="text-[11px] text-text-muted">
                Rec. Tests: {(cand.recommendedTests || []).slice(0, 2).join(', ')}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onSelectICD?.(cand) }}
                className="text-xs text-primary-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Accept ICD Code
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
