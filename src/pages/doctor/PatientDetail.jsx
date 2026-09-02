import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Heart, User, Calendar, Phone, FileText,
  ClipboardList, Clock, Pill, FlaskConical, AlertTriangle,
  Users, Cigarette, Wine, Download, ExternalLink, Check, X,
  Activity, Eye, Sparkles, Code, Leaf, Shield, Brain
} from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import ConfidenceBadge from '../../components/ConfidenceBadge'
import ClinicalSignalCard from '../../components/ClinicalSignalCard'
import VerificationButtons from '../../components/VerificationButtons'
import Timeline from '../../components/Timeline'
import EvidenceDrawer from '../../components/EvidenceDrawer'
import DocumentInspectorModal from '../../components/DocumentInspectorModal'
import DrugSafetyBanner from '../../components/DrugSafetyBanner'
import DifferentialDiagnosisWidget from '../../components/DifferentialDiagnosisWidget'
import { getDemoPatient } from '../../data/demoPatients'
import { prepareFHIRBundle } from '../../services/abdmService'
import { generateDifferentialDiagnosis } from '../../services/differentialEngine'

const tabs = [
  { id: 'summary', label: 'Structured Summary', icon: ClipboardList },
  { id: 'ayush', label: 'Dashavidha Pariksha', icon: Leaf },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'documents', label: 'OCR Records', icon: FileText },
  { id: 'interview', label: 'Intake Transcript', icon: Users },
]

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('summary')
  const [sectionStatuses, setSectionStatuses] = useState({})
  const [acceptedICD, setAcceptedICD] = useState(null)

  // Evidence Drawer & Document Inspector Modal states
  const [activeEvidence, setActiveEvidence] = useState(null)
  const [activeInspectorDoc, setActiveInspectorDoc] = useState(null)
  const [fhirModalOpen, setFhirModalOpen] = useState(false)

  const patient = getDemoPatient(id) || getDemoPatient('demo-001')
  const { summary, clinicalSignals, timeline, documents, interviewResponses = [] } = patient
  
  // Dynamic HL7 FHIR Bundle generated from active patient object
  const fhirBundle = useMemo(() => prepareFHIRBundle(patient), [patient])

  // AI Differential Diagnoses Generator
  const differentials = useMemo(() => generateDifferentialDiagnosis(patient), [patient])

  const handleVerify = (section) => {
    setSectionStatuses(prev => ({ ...prev, [section]: 'doctor_confirmed' }))
  }
  const handleReject = (section) => {
    setSectionStatuses(prev => ({ ...prev, [section]: 'rejected' }))
  }

  const openEvidence = (title, snippet, documentName, type = 'document') => {
    setActiveEvidence({
      title,
      snippet,
      documentName,
      type,
      confidence: 0.96,
      source: documentName || 'Patient Voice Response',
      timestamp: '12 May 2025',
    })
  }

  // Derive SOCRATES framework breakdown dynamically from interview responses if available
  const socrates = useMemo(() => {
    const findVal = (qId) => {
      const resp = interviewResponses.find(r => r.questionId === qId)
      if (!resp) return null
      return Array.isArray(resp.structuredValue) ? resp.structuredValue.join(', ') : resp.structuredValue || resp.originalResponse
    }

    return {
      site: findVal('socrates_site') || findVal('sp_site') || 'Substernal / Center of chest',
      onset: findVal('socrates_onset') || findVal('f_onset') || findVal('sp_onset') || '3 days ago (Sudden onset)',
      character: findVal('socrates_character') || findVal('sp_character') || 'Heavy squeezing pressure (Dull pressure)',
      radiation: findVal('socrates_radiation') || 'Radiates to left arm and shoulder',
      associations: findVal('socrates_associations') || findVal('f_associations') || 'Breathlessness, sweating',
      timecourse: findVal('socrates_timecourse') || 'Episodic, triggered by walking',
      exacerbating: findVal('socrates_exacerbating') || findVal('sp_meal_relation') || 'Worse with exertion; better with rest',
      severity: (findVal('socrates_severity') || findVal('f_severity') || findVal('sp_severity') || '7') + ' / 10',
    }
  }, [interviewResponses])

  const dashavidha = {
    prakriti: 'Vata-Pitta Dvandvaja',
    vikriti: 'Vata-Pitta Vriddhi (Ruksha & Ushna vitiation)',
    sara: 'Rakta & Mamsa Sara',
    samhanana: 'Madhyama Samhanana (Moderate Build)',
    satmya: 'Madhyama Satmya',
    sattva: 'Madhyama Sattva',
    aharaShakti: 'Visham Agni (Irregular Appetite & Digestion)',
    vyayamaShakti: 'Avara Vyayama Shakti (Low Physical Endurance)',
    vaya: `${patient.age || '46'} years (Madhyama Vaya)`,
    koshtha: 'Krura Koshtha (Prone to constipation)',
  }

  const activeMeds = summary.medications ? summary.medications.map(m => m.name) : ['Metformin 500 mg', 'Amoxicillin']
  const activeAllergies = summary.allergies ? (summary.allergies.historicalRecord ? [summary.allergies.historicalRecord] : ['Penicillin']) : []

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-surface-raised border-b border-border-light px-8 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/doctor')}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1 rounded-lg hover:bg-surface-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-text-primary font-heading text-lg">
                ArogyaDarpan / MediKiosk Workbench
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={Code}
              onClick={() => setFhirModalOpen(true)}
            >
              FHIR Bundle JSON
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => setFhirModalOpen(true)}
            >
              Export to ABDM
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column — Patient Vitals & Triage Signals */}
          <div className="col-span-4 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Patient Profile Card */}
              <Card>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3 text-primary-700 text-xl font-bold font-heading border border-primary-200">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h2 className="text-lg font-bold text-text-primary font-heading">
                    {patient.name}
                  </h2>
                  <p className="text-xs text-text-muted font-medium">{patient.age} yrs • {patient.gender} • ABHA: {patient.abhaId || 'ABHA-9821-1102'}</p>
                </div>

                <div className="space-y-2.5 text-xs border-t border-border-light pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</span>
                    <span className="font-semibold text-text-primary">{patient.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Department</span>
                    <span className="font-semibold text-text-primary">{patient.consultation?.department || 'General Medicine'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Triage ESI</span>
                    <Badge severity={clinicalSignals.some(s => s.severity === 'critical') ? 'critical' : 'success'} dot size="sm">
                      {clinicalSignals.some(s => s.severity === 'critical') ? 'ESI Level 2 — Emergency' : 'ESI Level 4 — Routine'}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Drug Safety & Contraindication Matrix */}
              <DrugSafetyBanner medications={activeMeds} allergies={activeAllergies} />

              {/* Triage Signals */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Clinical Priority Signals ({clinicalSignals.length})
                  </h3>
                  <span className="text-[10px] text-primary-600 font-semibold">Rules Engine</span>
                </div>

                {clinicalSignals.map((signal, i) => (
                  <ClinicalSignalCard
                    key={i}
                    severity={signal.severity}
                    message={signal.message}
                    detail={signal.detail}
                    disclaimer={signal.type === 'red_flag' ? signal.disclaimer || 'This is an alert for healthcare staff. It is not a diagnosis.' : undefined}
                    currentValue={signal.currentValue}
                    previousValue={signal.previousValue}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column — Tabbed Clinical View */}
          <div className="col-span-8 space-y-6">
            {/* AI Differential Diagnosis Widget */}
            <DifferentialDiagnosisWidget
              candidates={differentials}
              onSelectICD={(cand) => setAcceptedICD(cand)}
            />

            {acceptedICD && (
              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 flex items-center justify-between text-xs text-emerald-900">
                <span className="font-bold">✓ Doctor Accepted Diagnosis: ICD {acceptedICD.icdCode} — {acceptedICD.disease}</span>
                <Badge severity="success" size="sm">EHR Populated</Badge>
              </div>
            )}

            {/* Tab Nav */}
            <div className="flex items-center gap-1 bg-surface-raised rounded-2xl border border-border-light p-1.5 shadow-xs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-heading
                    transition-all cursor-pointer
                    ${activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* STRUCTURED SUMMARY TAB (Exact SIH Sequence) */}
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <Card padding="px-6 py-4" className="flex items-center justify-between border-l-4 border-l-primary-500">
                    <div>
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">SIH Compliant History Format</span>
                      <h3 className="font-bold text-text-primary text-base font-heading">
                        Pre-Consultation Clinical Intake Draft
                      </h3>
                    </div>
                    <Badge severity="success" dot size="md">
                      Draft Ready for Physician Verification
                    </Badge>
                  </Card>

                  {/* 1. Chief Complaint */}
                  <SummarySection
                    title="1. Chief Complaint"
                    content={summary.chiefComplaint}
                    source="Patient ASR / Touch Intake"
                    status={sectionStatuses.chiefComplaint}
                    onConfirm={() => handleVerify('chiefComplaint')}
                    onReject={() => handleReject('chiefComplaint')}
                    onViewSource={() => openEvidence('Chief Complaint', summary.chiefComplaint, 'Patient Voice Transcript', 'voice')}
                  />

                  {/* 2. HPI — SOCRATES Framework Breakdown */}
                  <Card>
                    <div className="flex items-center justify-between mb-3 border-b border-border-light pb-2">
                      <h3 className="font-bold text-text-primary font-heading text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        2. History of Present Illness (SOCRATES Framework)
                      </h3>
                      <VerificationButtons status={sectionStatuses.hpi} onConfirm={() => handleVerify('hpi')} onReject={() => handleReject('hpi')} />
                    </div>

                    <p className="text-sm text-text-secondary mb-4 leading-relaxed">{summary.hpi}</p>

                    {/* SOCRATES Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-surface-muted p-3.5 rounded-xl border border-border-light">
                      <div><span className="font-bold text-text-primary">Site:</span> {socrates.site}</div>
                      <div><span className="font-bold text-text-primary">Onset:</span> {socrates.onset}</div>
                      <div><span className="font-bold text-text-primary">Character:</span> {socrates.character}</div>
                      <div><span className="font-bold text-text-primary">Radiation:</span> {socrates.radiation}</div>
                      <div><span className="font-bold text-text-primary">Associations:</span> {socrates.associations}</div>
                      <div><span className="font-bold text-text-primary">Time Course:</span> {socrates.timecourse}</div>
                      <div><span className="font-bold text-text-primary">Exacerbating:</span> {socrates.exacerbating}</div>
                      <div><span className="font-bold text-text-primary">Severity:</span> <span className="font-bold text-red-600">{socrates.severity}</span></div>
                    </div>
                  </Card>

                  {/* 3. Past Medical & Surgical History */}
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-text-primary font-heading text-base">3. Past Medical & Surgical History</h3>
                      <VerificationButtons status={sectionStatuses.pastHistory} onConfirm={() => handleVerify('pastHistory')} onReject={() => handleReject('pastHistory')} />
                    </div>
                    {summary.pastHistory?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-surface-muted rounded-xl px-4 py-2.5 mb-2 text-sm">
                        <span className="font-bold text-text-primary">{item.condition} (Since {item.since})</span>
                        <button onClick={() => openEvidence(item.condition, `${item.condition} documented at District Hospital`, 'Discharge_Summary_2024.pdf', 'document')} className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                          <Eye className="w-3.5 h-3.5" /> Source Document
                        </button>
                      </div>
                    ))}
                  </Card>

                  {/* 4. Drug & Allergy History */}
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-text-primary font-heading text-base flex items-center gap-2">
                        <Pill className="w-4 h-4 text-primary-500" /> 4. Drug & Allergy History
                      </h3>
                      <VerificationButtons status={sectionStatuses.medications} onConfirm={() => handleVerify('medications')} onReject={() => handleReject('medications')} />
                    </div>

                    <div className="space-y-2 mb-3">
                      {summary.medications?.map((med, i) => (
                        <div key={i} className="flex items-center justify-between bg-surface-muted rounded-xl px-4 py-2.5 text-sm">
                          <div>
                            <span className="font-bold text-text-primary">{med.name}</span>
                            <span className="text-xs text-text-muted ml-2">{med.frequency}</span>
                          </div>
                          <ConfidenceBadge score={med.confidence || 0.96} />
                        </div>
                      ))}
                    </div>

                    {summary.allergies?.status === 'conflict' && (
                      <ClinicalSignalCard
                        severity="high"
                        message="Allergy Information Conflict"
                        currentValue={summary.allergies.currentResponse}
                        previousValue={summary.allergies.historicalRecord}
                      />
                    )}
                  </Card>

                  {/* 5. Family History */}
                  <SummarySection
                    title="5. Family History"
                    content={summary.familyHistory || 'Father had coronary artery disease at age 52'}
                    status={sectionStatuses.familyHistory}
                    onConfirm={() => handleVerify('familyHistory')}
                    onReject={() => handleReject('familyHistory')}
                  />

                  {/* 6. Personal & Lifestyle History (Ahara-Vihara) */}
                  <Card>
                    <h3 className="font-bold text-text-primary font-heading text-base mb-3">6. Personal & Lifestyle History (Ahara-Vihara)</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs bg-surface-muted p-3.5 rounded-xl">
                      <div><span className="font-bold text-text-primary">Smoking:</span> Quit 2 years ago (Ex-smoker)</div>
                      <div><span className="font-bold text-text-primary">Alcohol:</span> Occasional social use</div>
                      <div><span className="font-bold text-text-primary">Ahara (Diet):</span> Mixed diet, irregular meal timings</div>
                      <div><span className="font-bold text-text-primary">Vihara (Lifestyle):</span> Moderate physical activity, desk work</div>
                    </div>
                  </Card>

                  {/* 7. Review of Systems (ROS) */}
                  <Card>
                    <h3 className="font-bold text-text-primary font-heading text-base mb-3">7. Review of Systems (ROS)</h3>
                    <div className="space-y-2 text-xs">
                      <div className="bg-surface-muted p-2.5 rounded-lg flex justify-between">
                        <span className="font-bold text-text-primary">Cardiovascular:</span>
                        <span className="text-text-secondary">Chest pain, exertional dyspnea, diaphoresis</span>
                      </div>
                      <div className="bg-surface-muted p-2.5 rounded-lg flex justify-between">
                        <span className="font-bold text-text-primary">Respiratory:</span>
                        <span className="text-text-secondary">Shortness of breath on exertion; no chronic cough</span>
                      </div>
                    </div>
                  </Card>

                  {/* 8. Prior Investigations Summary */}
                  {summary.investigations?.length > 0 && (
                    <Card>
                      <h3 className="font-bold text-text-primary font-heading text-base flex items-center gap-2 mb-3">
                        <FlaskConical className="w-4 h-4 text-purple-500" /> 8. Prior Investigations Summary
                      </h3>
                      {summary.investigations.map((inv, i) => (
                        <div key={i} className="flex items-center justify-between bg-surface-muted rounded-xl px-4 py-2.5 mb-2 text-sm">
                          <div>
                            <span className="font-bold text-text-primary">{inv.name}: {inv.value}</span>
                            <span className="text-xs text-text-muted ml-2">({inv.date})</span>
                          </div>
                          <Badge severity={inv.status === 'abnormal' ? 'medium' : 'success'} size="sm">
                            {inv.status === 'abnormal' ? 'Abnormal' : 'Normal'}
                          </Badge>
                        </div>
                      ))}
                    </Card>
                  )}
                </div>
              )}

              {/* DASHAVIDHA PARIKSHA (AYUSH TAB) */}
              {activeTab === 'ayush' && (
                <Card>
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-border-light">
                    <div className="flex items-center gap-2.5">
                      <Leaf className="w-6 h-6 text-emerald-600" />
                      <div>
                        <h3 className="font-bold text-text-primary text-lg font-heading">
                          Dashavidha Pariksha (10-Fold Ayurvedic Assessment)
                        </h3>
                        <p className="text-xs text-text-muted">AIIA / Ministry of Ayush Clinical Protocol</p>
                      </div>
                    </div>
                    <Badge severity="success" dot size="sm">AYUSH Validated</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-xl">
                      <span className="font-bold text-emerald-900 block mb-1">1. Prakriti (Constitution):</span>
                      <p className="text-emerald-800">{dashavidha.prakriti}</p>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-xl">
                      <span className="font-bold text-emerald-900 block mb-1">2. Vikriti (Current Imbalance):</span>
                      <p className="text-emerald-800">{dashavidha.vikriti}</p>
                    </div>
                    <div className="bg-surface-muted p-3.5 rounded-xl border border-border-light">
                      <span className="font-bold text-text-primary block mb-1">3. Sara (Tissue Excellence):</span>
                      <p className="text-text-secondary">{dashavidha.sara}</p>
                    </div>
                    <div className="bg-surface-muted p-3.5 rounded-xl border border-border-light">
                      <span className="font-bold text-text-primary block mb-1">4. Samhanana (Compactness):</span>
                      <p className="text-text-secondary">{dashavidha.samhanana}</p>
                    </div>
                    <div className="bg-surface-muted p-3.5 rounded-xl border border-border-light">
                      <span className="font-bold text-text-primary block mb-1">5. Satmya (Adaptability):</span>
                      <p className="text-text-secondary">{dashavidha.satmya}</p>
                    </div>
                    <div className="bg-surface-muted p-3.5 rounded-xl border border-border-light">
                      <span className="font-bold text-text-primary block mb-1">6. Sattva (Mental Endurance):</span>
                      <p className="text-text-secondary">{dashavidha.sattva}</p>
                    </div>
                    <div className="bg-surface-muted p-3.5 rounded-xl border border-border-light">
                      <span className="font-bold text-text-primary block mb-1">7. Ahara Shakti (Agni):</span>
                      <p className="text-text-secondary">{dashavidha.aharaShakti}</p>
                    </div>
                    <div className="bg-surface-muted p-3.5 rounded-xl border border-border-light">
                      <span className="font-bold text-text-primary block mb-1">8. Vyayama Shakti (Stamina):</span>
                      <p className="text-text-secondary">{dashavidha.vyayamaShakti}</p>
                    </div>
                    <div className="bg-surface-muted p-3.5 rounded-xl border border-border-light">
                      <span className="font-bold text-text-primary block mb-1">9. Vaya (Age Stage):</span>
                      <p className="text-text-secondary">{dashavidha.vaya}</p>
                    </div>
                    <div className="bg-surface-muted p-3.5 rounded-xl border border-border-light">
                      <span className="font-bold text-text-primary block mb-1">10. Koshtha (Bowel Habit):</span>
                      <p className="text-text-secondary">{dashavidha.koshtha}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* TIMELINE TAB */}
              {activeTab === 'timeline' && (
                <Card>
                  <h3 className="font-bold text-text-primary font-heading text-base mb-6">Unified Patient Medical Timeline</h3>
                  <Timeline events={timeline} />
                </Card>
              )}

              {/* OCR RECORDS TAB */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <Card key={doc.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-200">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-text-primary text-base font-heading">{doc.fileName}</h4>
                            <p className="text-xs text-text-muted">{doc.documentType} • {doc.documentDate}</p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => setActiveInspectorDoc(doc)}
                        >
                          Inspect Document & OCR Text
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* INTAKE TRANSCRIPT TAB */}
              {activeTab === 'interview' && (
                <div className="space-y-3">
                  {interviewResponses.map((resp, i) => (
                    <Card key={i} padding="px-5 py-4">
                      <p className="text-xs font-semibold text-text-muted mb-1">{resp.question}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-text-primary text-sm">
                            {Array.isArray(resp.structuredValue) ? resp.structuredValue.join(', ') : String(resp.structuredValue)}
                          </p>
                          {resp.originalResponse && (
                            <p className="text-xs text-text-muted italic mt-1">"{resp.originalResponse}"</p>
                          )}
                        </div>
                        <Badge severity="neutral" size="sm">
                          {resp.inputMethod === 'voice' ? '🎙️ Voice Input' : '👆 Touch Choice'}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Slide-over Evidence Drawer */}
      <EvidenceDrawer
        isOpen={Boolean(activeEvidence)}
        onClose={() => setActiveEvidence(null)}
        evidenceData={activeEvidence}
        onVerify={() => handleVerify('chiefComplaint')}
      />

      {/* Document Inspector Modal */}
      <DocumentInspectorModal
        isOpen={Boolean(activeInspectorDoc)}
        onClose={() => setActiveInspectorDoc(null)}
        documentData={activeInspectorDoc}
      />

      {/* FHIR Bundle JSON Viewer Modal */}
      {fhirModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-raised rounded-3xl border border-border-light shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4 border-b border-border-light pb-3">
              <h3 className="font-bold text-text-primary text-base font-heading flex items-center gap-2">
                <Code className="w-5 h-5 text-primary-600" /> Standardized ABDM FHIR Bundle JSON (HL7 R4)
              </h3>
              <button onClick={() => setFhirModalOpen(false)} className="p-1 text-text-muted hover:text-text-primary cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <pre className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-xs font-mono max-h-96 overflow-y-auto leading-relaxed">
              {JSON.stringify(fhirBundle, null, 2)}
            </pre>
            <div className="mt-4 flex justify-end">
              <Button size="md" onClick={() => setFhirModalOpen(false)}>
                Close Viewer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummarySection({ title, content, source, status, onConfirm, onReject, onViewSource }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-text-primary font-heading text-base">{title}</h3>
        <VerificationButtons status={status} onConfirm={onConfirm} onReject={onReject} />
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{content}</p>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-light text-xs">
        <span className="text-text-muted">Source: {source}</span>
        {onViewSource && (
          <button onClick={onViewSource} className="text-primary-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer">
            <Eye className="w-3.5 h-3.5" /> Inspect Evidence
          </button>
        )}
      </div>
    </Card>
  )
}
