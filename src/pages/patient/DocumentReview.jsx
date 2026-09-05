import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, ArrowLeft, Clock, Sparkles, Pill, HeartPulse,
  Shield, CheckCircle2, AlertCircle, FileText, Activity
} from 'lucide-react'
import BionicKioskShell from '../../components/kiosk/BionicKioskShell'
import Timeline from '../../components/Timeline'
import { buildDynamicTimeline, getActiveDocuments, getActivePatient, getActiveResponses } from '../../services/sessionStore'
import { generateReportInsights } from '../../services/reportInsightEngine'

export default function DocumentReview() {
  const navigate = useNavigate()
  const patient = getActivePatient()
  const documents = getActiveDocuments()
  const responses = getActiveResponses()

  // Dynamically build timeline events from active user interview & uploaded documents
  const timeline = useMemo(() => buildDynamicTimeline(), [])

  // Dynamically generate report insights for uploaded documents or active interview responses
  const reportInsights = useMemo(() => {
    if (documents.length > 0) {
      const primaryDoc = documents[0] || {}
      return generateReportInsights(primaryDoc.extraction || primaryDoc)
    }

    // If no document was uploaded, generate insights from patient's active responses
    const chiefComplaint = responses.find(r => r.questionId === 'chief_complaint')?.structuredValue || ''
    const pastMed = responses.find(r => r.questionId === 'past_medical')?.structuredValue || []
    const meds = responses.find(r => r.questionId === 'current_medications')?.structuredValue || ''

    return generateReportInsights({
      extractedData: {
        diagnosis: Array.isArray(pastMed) ? pastMed : [pastMed],
        medications: meds ? [{ name: meds }] : [],
        symptoms: chiefComplaint ? [{ label: chiefComplaint }] : [],
      },
    })
  }, [documents, responses])

  return (
    <BionicKioskShell>
      <div className="space-y-6 select-none max-w-5xl mx-auto pb-8">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Medical Timeline &{' '}
              <span className="rounded-2xl bg-cobalt px-3 py-0.5 text-white inline-block text-2xl sm:text-3xl font-bold shadow-xs">
                AI Synthesis
              </span>
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Chronological Health History & Plain-Language Clinical Insights for <strong className="text-slate-900">{patient.name || 'Patient'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/patient/documents')}
              className="glass-pill px-3.5 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Documents</span>
            </button>
            <button
              onClick={() => navigate('/patient/confirmation')}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-cobalt to-cobalt-deep text-white text-xs font-bold shadow-cobalt hover:brightness-110 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Confirm & Lock Intake</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* AI Medical Report Insights Card */}
        {reportInsights.insights.length > 0 && (
          <div className="glass-card p-6 bg-gradient-to-br from-white via-white to-cobalt-soft/20 border-2 border-cobalt/30 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-cobalt-soft text-cobalt flex items-center justify-center shrink-0">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">
                    {documents.length > 0 ? 'What Your Medical Records Say (AI Plain-Language Translation)' : 'Clinical Intake Summary & Explanation'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {documents.length > 0 ? 'Extracted from uploaded records with cross-verified drug and biomarker checks' : 'Synthesized automatically from your clinical triage questions'}
                  </p>
                </div>
              </div>
              <span className="status-chip bg-cobalt-soft text-cobalt font-bold">
                ✨ AI Verified Insights
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reportInsights.insights.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <Activity className="size-3.5 text-cobalt" />
                      {item.title}
                    </h4>
                    {item.status === 'abnormal' && (
                      <span className="status-chip bg-coral-soft text-coral font-bold text-[10px]">
                        Requires Care
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {item.plainText}
                  </p>
                  {item.plainTextHi && (
                    <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60 flex items-start gap-1.5">
                      <span className="font-bold text-cobalt text-[10px] bg-cobalt-soft px-1.5 py-0.5 rounded shrink-0">
                        हिन्दी:
                      </span>
                      <span className="leading-snug">{item.plainTextHi}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Curative & Medicine Insights */}
            {reportInsights.curativeMedicines.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Pill className="size-4 text-emerald" /> Clinical Care & Management Plan:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {reportInsights.curativeMedicines.map((med, idx) => (
                    <div key={idx} className="bg-emerald-soft/50 p-3 rounded-2xl border border-emerald/20 text-xs text-emerald-950">
                      <p className="font-bold text-xs text-emerald-900 mb-1 flex items-center gap-1">
                        💊 {med.medicine}
                      </p>
                      <p className="text-[11px] text-emerald-800 mb-1 leading-snug">{med.role}</p>
                      <p className="text-[10px] text-emerald-700 font-bold bg-white/70 px-2 py-1 rounded-lg border border-emerald/10">
                        🏃 Lifestyle Note: {med.lifestyle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <Shield className="size-3.5 text-cobalt shrink-0" />
              <span>
                AI assists by providing plain-language explanations. The treating physician verifies all diagnoses and prescribes final therapy.
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Chronological Timeline */}
        <div className="glass-card p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Clock className="size-5 text-cobalt" />
                Chronological Medical Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Longitudinal record generated from ABHA history, uploaded prescriptions, and current intake.
              </p>
            </div>
            <span className="status-chip bg-emerald-soft text-emerald font-bold">
              {timeline.length} Documented Milestones
            </span>
          </div>

          <Timeline events={timeline} />
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 pb-6">
          <button
            onClick={() => navigate('/patient/documents')}
            className="w-full sm:w-auto glass-pill px-4 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Uploads</span>
          </button>

          <button
            onClick={() => navigate('/patient/confirmation')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl sm:rounded-full bg-gradient-to-r from-cobalt to-cobalt-deep text-white text-xs sm:text-sm font-bold shadow-cobalt hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 text-center"
          >
            <span>Proceed to Confirmation & Doctor Triage</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </BionicKioskShell>
  )
}
