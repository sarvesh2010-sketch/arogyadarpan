import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Camera, FileText, Check, ArrowRight, ArrowLeft, File,
  X, Eye, Printer, Tag, Sparkles
} from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import ConfidenceBadge from '../../components/ConfidenceBadge'
import DocumentInspectorModal from '../../components/DocumentInspectorModal'
import CameraCaptureModal from '../../components/CameraCaptureModal'
import ScannerModal from '../../components/ScannerModal'
import SessionTimeoutModal from '../../components/SessionTimeoutModal'
import LanguageSelector from '../../components/LanguageSelector'
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
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary-50/20 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl w-full"
      >
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/patient/interview')}
            className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors px-2 py-1 rounded-lg hover:bg-surface-muted"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back', 'Back')}</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
              Step 5 of 6
            </span>
            <LanguageSelector variant="compact" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-500/20">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-heading mb-2">
            {t('uploadDocuments', 'Bring your previous records together')}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
            {t('uploadSubtext', 'Scan prescriptions, laboratory reports or discharge summaries. ArogyaDarpan will organize the information for your doctor.')}
          </p>
        </div>

        {/* Category Selector Chips */}
        <div className="mb-5 bg-surface-raised p-4 rounded-2xl border border-border-light shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">
            <Tag className="w-3.5 h-3.5 text-primary-600" />
            <span>Select Document Type to Add:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DOCUMENT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-primary-500 text-white border-primary-500 shadow-xs'
                    : 'bg-surface border-border-light text-text-secondary hover:border-primary-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3 Dedicated Touch Upload Sources (Camera, Scanner, File Upload) */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-border-light hover:border-teal-500 hover:bg-teal-50/20 transition-all shadow-xs group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <span className="font-bold text-text-primary text-xs sm:text-sm text-center">
              {t('camera', 'Camera')}
            </span>
            <span className="text-[10px] text-text-muted text-center mt-0.5">Live Snapshot</span>
          </button>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-border-light hover:border-emerald-500 hover:bg-emerald-50/20 transition-all shadow-xs group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Printer className="w-6 h-6" />
            </div>
            <span className="font-bold text-text-primary text-xs sm:text-sm text-center">
              {t('scanner', 'Scanner')}
            </span>
            <span className="text-[10px] text-text-muted text-center mt-0.5">Optical Scan</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-border-light hover:border-sky-500 hover:bg-sky-50/20 transition-all shadow-xs group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <span className="font-bold text-text-primary text-xs sm:text-sm text-center">
              {t('uploadFile', 'File Upload')}
            </span>
            <span className="text-[10px] text-text-muted text-center mt-0.5">PDF / JPG / PNG</span>
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

        {/* Document List with Category Badges and OCR Output */}
        <div className="space-y-3.5">
          {documents.map((doc) => {
            const catMeta = DOCUMENT_CATEGORIES.find(c => c.id === doc.category) || DOCUMENT_CATEGORIES[0]
            const docDate = doc.documentDate || doc.extraction?.documentDate
            const stampMeta = doc.extraction?.stampAndSignature
            const drugInteractions = doc.extraction?.drugInteractions || []

            return (
              <Card key={doc.id} className="relative border-border-light">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 border border-primary-200">
                    <File className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <h3 className="font-semibold text-text-primary text-sm truncate">
                          {doc.fileName}
                        </h3>
                        {/* Document Category Badge (Feature 28) */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${catMeta.color}`}>
                          {catMeta.icon} {doc.category || 'Prescription'}
                        </span>
                        {/* Document Extracted Date Badge (Feature 29) */}
                        {docDate && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-muted text-text-secondary border border-border-light shrink-0">
                            📅 {docDate}
                          </span>
                        )}
                        {/* Stamp/Signature Verification Badge (Feature 21) */}
                        {stampMeta?.hasSignature && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            ✍️ {stampMeta.doctorName || 'Signed & Stamped'}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="text-text-muted hover:text-critical transition-colors cursor-pointer p-1 shrink-0"
                        title="Delete Document"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Change Category Selector Dropdown */}
                    <div className="flex items-center gap-2 mb-2 text-xs">
                      <span className="text-text-muted">Type:</span>
                      <select
                        value={doc.category || 'Prescription'}
                        onChange={(e) => handleUpdateCategory(doc.id, e.target.value)}
                        className="text-xs bg-surface-muted px-2 py-1 rounded-lg border border-border-light text-text-primary cursor-pointer font-medium"
                      >
                        {DOCUMENT_CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Processing Bar */}
                    {doc.status === 'processing' && (
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between text-xs text-primary-700 font-medium">
                          <span>{doc.progressStatus || t('processing', 'Processing...')}</span>
                          <span>{ocrProgress[doc.id] || 35}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-300"
                            style={{ width: `${ocrProgress[doc.id] || 35}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Processed Results */}
                    {doc.status === 'processed' && doc.extraction && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-600">
                          <span className="flex items-center gap-1 font-medium">
                            <Check className="w-4 h-4" />
                            {t('processed', 'Document processed')}
                          </span>

                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => setActiveInspectorDoc(doc.extraction)}
                            className="text-primary-600 hover:bg-primary-50 text-xs"
                          >
                            {t('viewSource', 'Inspect Document')}
                          </Button>
                        </div>

                        {/* Drug-Drug Interaction Alert Banner (Feature 27) */}
                        {drugInteractions.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                            <div className="flex items-center gap-1.5 font-bold mb-1">
                              <span>⚠️</span>
                              <span>Clinical Alert: {drugInteractions[0].title}</span>
                            </div>
                            <p className="text-[11px] opacity-90">{drugInteractions[0].mechanism}</p>
                          </div>
                        )}

                        {/* Display Extracted Normalized Medications (Feature 22) */}
                        {doc.extraction.extractedData?.medications?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Prescribed Medicines:</span>
                            {doc.extraction.extractedData.medications.map((item, i) => (
                              <div key={i} className="flex items-center justify-between bg-surface-muted rounded-lg px-3 py-1.5 text-xs">
                                <div>
                                  <span className="font-semibold text-text-primary">💊 {item.name} {item.strength || item.dosage || ''}</span>
                                  <span className="text-text-muted text-[11px] ml-2">({item.frequency || 'Regular'} • {item.duration || '30 days'})</span>
                                </div>
                                <ConfidenceBadge score={item.confidence || 0.94} />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Display Extracted Structured Labs & Abnormal Values (Features 23, 25, 26) */}
                        {doc.extraction.extractedData?.investigations?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Lab Values:</span>
                            {doc.extraction.extractedData.investigations.map((lab, i) => {
                              const isAbnormal = lab.status === 'abnormal' || lab.status === 'critical'
                              return (
                                <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs border ${
                                  isAbnormal ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-surface-muted border-border-light text-text-primary'
                                }`}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">🧪 {lab.test || lab.name}: <strong>{lab.value} {lab.unit}</strong></span>
                                    {isAbnormal && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                                        {lab.abnormalFlag || '↑ Abnormal'}
                                      </span>
                                    )}
                                  </div>
                                  <ConfidenceBadge score={lab.confidence || 0.94} />
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {documents.length === 0 && (
          <Card className="text-center py-8 sm:py-10 border-dashed border-2">
            <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-text-primary font-semibold text-sm">
              No medical documents uploaded yet
            </p>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              Tap Camera, Scanner, or File Upload above to digitize your prescriptions, lab tests, or discharge slips.
            </p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate('/patient/document-review')}
          >
            {t('skip', 'Skip for now')}
          </Button>
          <Button
            size="lg"
            fullWidth
            onClick={handleContinue}
            iconRight={ArrowRight}
          >
            {t('continue', 'Continue to Review')}
          </Button>
        </div>
      </motion.div>

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
    </div>
  )
}
