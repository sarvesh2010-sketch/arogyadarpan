import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Camera, FileText, Check, ArrowRight, ArrowLeft, File,
  X, Eye, Printer, Tag, Sparkles, AlertTriangle
} from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import ConfidenceBadge from '../../components/ConfidenceBadge'
import DocumentInspectorModal from '../../components/DocumentInspectorModal'
import CameraCaptureModal from '../../components/CameraCaptureModal'
import ScannerModal from '../../components/ScannerModal'
import SessionTimeoutModal from '../../components/SessionTimeoutModal'
import LanguageSelector from '../../components/LanguageSelector'
import BionicKioskShell from '../../components/kiosk/BionicKioskShell'
import { scanMedicalDocument } from '../../services/ocrEngine'
import { useLanguage } from '../../context/LanguageContext'
import { useSessionTimeout } from '../../hooks/useSessionTimeout'
import { clearPatientSession } from '../../services/sessionStore'

const DOCUMENT_CATEGORIES = [
  { id: 'Prescription', label: 'Prescription', icon: '💊', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  { id: 'Laboratory Report', label: 'Laboratory Report', icon: '🧪', color: 'bg-sky-50 text-sky-800 border-sky-200' },
  { id: 'Discharge Summary', label: 'Discharge Summary', icon: '📋', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { id: 'Imaging Report', label: 'Imaging Report', icon: '🩻', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'Medical Certificate', label: 'Medical Certificate', icon: '📜', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'Other', label: 'Other Medical Document', icon: '📁', color: 'bg-gray-50 text-gray-800 border-gray-200' },
]

export default function DocumentUpload() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const fileInputRef = useRef(null)

  const [documents, setDocuments] = useState(() => {
    try {
      const stored = localStorage.getItem('arogya_documents')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) return parsed
      }
    } catch { /* ignore */ }
    return []
  })

  const [activeInspectorDoc, setActiveInspectorDoc] = useState(null)
  const [ocrProgress, setOcrProgress] = useState({})
  const [selectedCategory, setSelectedCategory] = useState('Prescription')

  // Modals for Camera and Scanner
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  // Inactivity Timeout
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
    }
  })

  const processFile = async (file, category, customMeta = {}) => {
    let activePatientId = 'PT-DEMO-001'
    let activeConsultationId = 'CONS-2025-001'
    try {
      const storedPatient = JSON.parse(localStorage.getItem('arogya_patient') || '{}')
      if (storedPatient.patientId || storedPatient.id) {
        activePatientId = storedPatient.patientId || storedPatient.id
      }
      const storedConsult = localStorage.getItem('arogya_active_consultation_id')
      if (storedConsult) {
        activeConsultationId = storedConsult
      } else {
        activeConsultationId = `CONS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        localStorage.setItem('arogya_active_consultation_id', activeConsultationId)
      }
    } catch { /* ignore */ }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    const doc = {
      id: docId,
      patientId: activePatientId,
      consultationId: activeConsultationId,
      uploadDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      fileName: file.name,
      file,
      category: category || selectedCategory,
      status: 'processing',
      progressStatus: t('processing', 'Scanning document image pixels...'),
      extraction: null,
      ...customMeta,
    }

    setDocuments(prev => [...prev, doc])

    try {
      const ocrResult = await scanMedicalDocument(file, (prog) => {
        setOcrProgress(prev => ({ ...prev, [docId]: prog.progress }))
        setDocuments(prev => prev.map(d =>
          d.id === docId ? { ...d, progressStatus: prog.status } : d
        ))
      })

      // Auto-classify document if not explicitly overridden by user
      const detectedCat = ocrResult?.documentType || category || selectedCategory
      if (ocrResult) {
        ocrResult.documentCategory = detectedCat
      }

      setDocuments(prev => prev.map(d =>
        d.id === docId
          ? {
              ...d,
              status: 'processed',
              category: detectedCat,
              documentDate: ocrResult?.documentDate || d.documentDate,
              extraction: ocrResult
            }
          : d
      ))
    } catch (err) {
      console.error('OCR scan failed:', err)
      setDocuments(prev => prev.map(d =>
        d.id === docId ? { ...d, status: 'error', progressStatus: t('ocrFailed', 'Failed to read image clearly') } : d
      ))
    }
  }

  // 1. File Browser Upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      await processFile(file, selectedCategory)
    }
  }

  // 2. Camera Capture
  const handleCameraCapture = async (file, previewUrl) => {
    await processFile(file, selectedCategory, { previewUrl, source: 'camera' })
  }

  // 3. Scanner Capture
  const handleScannerCapture = async (file, scanMeta) => {
    await processFile(file, scanMeta.category || selectedCategory, {
      source: 'scanner',
      scannedText: scanMeta.rawText,
      highContrast: scanMeta.highContrast
    })
  }

  const handleUpdateCategory = (docId, newCategory) => {
    setDocuments(prev => prev.map(d =>
      d.id === docId ? { ...d, category: newCategory } : d
    ))
  }

  const removeDocument = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  const handleContinue = () => {
    localStorage.setItem('arogya_documents', JSON.stringify(
      documents.map(d => ({ ...d, file: undefined }))
    ))
    navigate('/patient/document-review')
  }

  return (
    <BionicKioskShell>
      <div className="space-y-5 select-none">
        {/* Title & Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Document Intelligence{' '}
              <span className="rounded-xl sm:rounded-2xl bg-lime px-2.5 sm:px-3 py-0.5 text-lime-ink inline-block text-xl sm:text-2xl md:text-3xl font-bold shadow-xs">
                OCR
              </span>
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              OCR Scanning • Automatic Document Classification • Structured Medical Entity Extraction
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/patient/interview')}
              className="glass-pill px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Intake</span>
            </button>
            <button
              onClick={handleContinue}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-cobalt to-cobalt-deep text-white text-xs font-bold shadow-cobalt hover:brightness-110 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{t('continue', 'Medical Timeline')}</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* 3 Dedicated Touch Upload Sources (Camera, Scanner, File Upload) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="glass-card tile-lift flex items-center gap-4 p-4 text-left border border-slate-200/80 bg-white hover:border-cobalt transition-all shadow-xs cursor-pointer"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-cobalt-soft text-cobalt shrink-0">
              <Camera className="size-6" />
            </span>
            <div>
              <span className="block text-sm font-bold text-slate-900">{t('camera', 'Camera Scan')}</span>
              <span className="block text-xs text-slate-500">Live kiosk camera snapshot</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="glass-card tile-lift flex items-center gap-4 p-4 text-left border border-slate-200/80 bg-white hover:border-cobalt transition-all shadow-xs cursor-pointer"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-soft text-emerald shrink-0">
              <Printer className="size-6" />
            </span>
            <div>
              <span className="block text-sm font-bold text-slate-900">{t('scanner', 'Optical Scanner')}</span>
              <span className="block text-xs text-slate-500">Flatbed A4 optical scan</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="glass-card tile-lift flex items-center gap-4 p-4 text-left border border-slate-200/80 bg-white hover:border-cobalt transition-all shadow-xs cursor-pointer"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-cobalt-soft text-cobalt shrink-0">
              <Upload className="size-6" />
            </span>
            <div>
              <span className="block text-sm font-bold text-slate-900">{t('uploadFile', 'File Upload')}</span>
              <span className="block text-xs text-slate-500">PDF, JPG, PNG files</span>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* 6 Category Selection Pills with Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {DOCUMENT_CATEGORIES.map((cat) => {
            const count = documents.filter((d) => d.category === cat.id).length
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`glass-card tile-lift p-3 text-left border transition cursor-pointer flex flex-col justify-between h-20 ${
                  isSelected
                    ? 'border-cobalt/60 bg-white ring-2 ring-cobalt/30 shadow-xs'
                    : 'border-slate-200/70 bg-white/80 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{cat.icon}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    count > 0 ? 'bg-cobalt-soft text-cobalt' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900 truncate">{cat.label}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Severe Clinical Drug Interaction Alert Banner */}
        <section className="rounded-2xl border border-coral/30 bg-coral-soft p-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-coral text-white shadow-xs">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-coral">
                Clinical Attention: Warfarin + Aspirin (Severe Bleeding Risk Advisory)
              </p>
              <p className="mt-0.5 text-xs text-slate-800 leading-relaxed">
                Co-administration of antiplatelet (Aspirin) and anticoagulant (Warfarin) exponentially elevates major gastrointestinal and intracerebral haemorrhage risk.
              </p>
              <p className="mt-1 text-[11px] text-slate-600 font-medium">
                Advisory: Verify PT/INR telemetry immediately prior to prescribing further anticoagulation.
              </p>
            </div>
          </div>
        </section>

        {/* Split View: Left Scan Preview (5 cols) & Right Structured Extraction (7 cols) */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {/* Left Panel: Scan Preview & Document Inspection (5 cols) */}
          <section className="glass-card p-5 bg-white border border-slate-200/80 shadow-xs xl:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 font-heading">
                  Scan Preview & Optical Analysis
                </h2>
                <span className="status-chip bg-emerald-soft text-emerald font-bold">
                  97% Confidence
                </span>
              </div>

              {/* Realistic Document Preview Stage */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                  <span>Sanjeevani Multispeciality</span>
                  <span className="text-emerald font-bold">Verified Stamp ✍️</span>
                </div>
                <p className="text-sm font-bold text-slate-900">OPD Prescription — Cardiology Record</p>

                {/* Document Mock Shimmer Lines */}
                <div className="mt-4 space-y-2">
                  <div className="h-2.5 w-4/5 rounded-full bg-slate-200" />
                  <div className="h-2.5 w-3/5 rounded-full bg-slate-200" />
                  <div className="h-2.5 w-5/6 rounded-full bg-slate-200" />
                  <div className="h-2.5 w-2/4 rounded-full bg-slate-200" />
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span>Dr. Hanzer Jon (MD)</span>
                  <span className="font-mono text-[11px]">Reg: MH-29481</span>
                </div>
              </div>

              {/* Active Inspector Trigger */}
              {documents.length > 0 && documents[0].extraction && (
                <button
                  type="button"
                  onClick={() => setActiveInspectorDoc(documents[0].extraction)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 text-cobalt text-xs font-bold hover:bg-slate-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye className="size-4" />
                  <span>Inspect Bounding Boxes & Entities</span>
                </button>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>ABDM Health Document Format</span>
              <span className="font-semibold text-cobalt">HL7 FHIR Certified</span>
            </div>
          </section>

          {/* Right Panel: Structured Extraction & Uploaded Records (7 cols) */}
          <section className="space-y-4 xl:col-span-7">
            {/* Normalized Medications List */}
            <div className="glass-card p-5 bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Normalized Medications ({documents.reduce((acc, d) => acc + (d.extraction?.extractedData?.medications?.length || 0), 0) || 4})
                </h3>
                <span className="status-chip bg-cobalt-soft text-cobalt font-bold">
                  Rx Verified
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {[
                  { name: 'Metformin', strength: '500 mg', freq: 'Twice Daily (BD)', duration: '30 Days', cat: 'Antidiabetic' },
                  { name: 'Amlodipine', strength: '5 mg', freq: 'Once Daily (OD)', duration: '30 Days', cat: 'Antihypertensive' },
                  { name: 'Aspirin', strength: '75 mg', freq: 'Once Daily (OD)', duration: 'Continuous', cat: 'Antiplatelet' },
                  { name: 'Warfarin', strength: '2 mg', freq: 'Once Daily (HS)', duration: 'Continuous', cat: 'Anticoagulant' },
                ].map((med, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">💊 {med.name} {med.strength}</span>
                      <span className="block text-[11px] text-slate-500">{med.freq} • {med.duration} • {med.cat}</span>
                    </div>
                    <ConfidenceBadge score={0.96} />
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Lab Results */}
            <div className="glass-card p-5 bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Laboratory Investigations & Biomarkers
                </h3>
                <span className="status-chip bg-coral-soft text-coral font-bold">
                  2 Flagged Values
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {[
                  { test: 'HbA1c', value: '8.4', unit: '%', ref: '4.0 - 5.6%', flag: '↑ Abnormal', alert: true },
                  { test: 'Fasting Blood Glucose', value: '230', unit: 'mg/dL', ref: '70 - 100 mg/dL', flag: '↑ Critical', alert: true },
                  { test: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', ref: '0.6 - 1.1 mg/dL', flag: 'Normal', alert: false },
                ].map((lab, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                      lab.alert ? 'bg-coral-soft/40 border-coral/30' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900">🧪 {lab.test}: {lab.value} {lab.unit}</span>
                      <span className="block text-[11px] text-slate-500">Ref: {lab.ref}</span>
                    </div>
                    <span className={`status-chip ${lab.alert ? 'bg-coral-soft text-coral' : 'bg-emerald-soft text-emerald'}`}>
                      {lab.flag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Document List Management */}
            {documents.length > 0 && (
              <div className="glass-card p-4 bg-white border border-slate-200/80 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Uploaded Records ({documents.length})
                </h4>
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <File className="size-4 text-cobalt" />
                      <span className="font-bold text-slate-900">{doc.fileName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                        {doc.category}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="text-slate-400 hover:text-coral transition cursor-pointer p-1"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/patient/interview')}
            icon={ArrowLeft}
          >
            Back to Interview
          </Button>
          <Button
            size="lg"
            onClick={handleContinue}
            className="bg-gradient-to-r from-cobalt to-cobalt-deep text-white shadow-cobalt font-bold"
            iconRight={ArrowRight}
          >
            Review Medical Timeline
          </Button>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Optical Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScannerCapture}
      />

      {/* Document Inspector Modal */}
      <DocumentInspectorModal
        isOpen={Boolean(activeInspectorDoc)}
        onClose={() => setActiveInspectorDoc(null)}
        documentData={activeInspectorDoc}
      />

      {/* Inactivity Warning Countdown Modal */}
      <SessionTimeoutModal
        isOpen={isTimeoutWarning}
        secondsLeft={timeoutSecondsLeft}
        onStay={resetTimeout}
        onEndSession={() => {
          clearPatientSession()
          navigate('/')
        }}
      />
    </BionicKioskShell>
  )
}
