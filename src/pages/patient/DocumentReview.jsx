import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Sparkles, Pill, HeartPulse, FileText, CheckCircle2, Shield, Info } from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Timeline from '../../components/Timeline'
import Badge from '../../components/Badge'
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
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary-50/20 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary font-heading mb-2">
            Your Dynamic Medical Timeline & Report Insights
          </h1>
          <p className="text-text-secondary">
            Summarized specifically for <span className="font-bold text-text-primary">{patient.name || 'Patient'}</span>
          </p>
        </div>

        {/* AI Medical Report Explanation Card */}
        {reportInsights.insights.length > 0 && (
          <Card className="border-2 border-primary-300 bg-surface-raised shadow-md">
            <div className="flex items-center justify-between border-b border-border-light pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-base font-heading">
                    {documents.length > 0 ? 'What Your Medical Report Says (AI Insight)' : 'Clinical Intake Summary & Plain Explanation'}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {documents.length > 0 ? 'Plain-Language Report & Treatment Guidance' : 'Structured analysis based on your intake responses'}
                  </p>
                </div>
              </div>
              <Badge severity="primary" dot size="sm">AI Explained</Badge>
            </div>

            <div className="space-y-4">
              {reportInsights.insights.map((item, idx) => (
                <div key={idx} className="bg-primary-50/50 p-4 rounded-xl border border-primary-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-primary-900 text-sm">{item.title}</h4>
                    {item.status === 'abnormal' && <Badge severity="medium" size="sm">Requires Monitoring</Badge>}
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed">{item.plainText}</p>
                  {item.plainTextHi && (
                    <div className="text-xs text-text-secondary italic bg-white/90 p-2.5 rounded-lg border border-primary-100 flex items-start gap-1.5">
                      <span className="not-italic font-bold text-primary-700 text-[11px] bg-primary-100 px-1.5 py-0.5 rounded">हिन्दी:</span>
                      <span>{item.plainTextHi}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Curative & Medicine Insights */}
              {reportInsights.curativeMedicines.length > 0 && (
                <div className="pt-2 border-t border-border-light">
                  <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-emerald-600" /> Medical & Management Context:
                  </h4>
                  <div className="space-y-2">
                    {reportInsights.curativeMedicines.map((med, idx) => (
                      <div key={idx} className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                        <p className="font-bold text-sm text-emerald-950 mb-0.5">💊 {med.medicine}</p>
                        <p className="mb-1">{med.role}</p>
                        <p className="text-[11px] text-emerald-800 font-medium">🏃 Recommended Lifestyle: {med.lifestyle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-text-muted italic flex items-center gap-1 pt-1">
                <Shield className="w-3.5 h-3.5 text-primary-500" /> AI explains for patient awareness. The consulting doctor makes all final diagnosis and prescription decisions.
              </p>
            </div>
          </Card>
        )}

        {/* Dynamic Timeline */}
        <Card>
          <h3 className="font-bold text-text-primary font-heading text-lg mb-6 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-primary-500" /> Chronological Health History Timeline
          </h3>
          <Timeline events={timeline} />
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button variant="ghost" size="lg" onClick={() => navigate('/patient/documents')}>
            Back
          </Button>
          <Button size="lg" fullWidth onClick={() => navigate('/patient/confirmation')} iconRight={ArrowRight}>
            Continue to Confirmation
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
