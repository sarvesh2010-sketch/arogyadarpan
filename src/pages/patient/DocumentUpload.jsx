import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, Camera, FileText, Check, ArrowRight, ArrowLeft, File, X, Eye } from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import ConfidenceBadge from '../../components/ConfidenceBadge'
import DocumentInspectorModal from '../../components/DocumentInspectorModal'
import LanguageSelector from '../../components/LanguageSelector'
import { scanMedicalDocument } from '../../services/ocrEngine'
import { useLanguage } from '../../context/LanguageContext'

export default function DocumentUpload() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const fileInputRef = useRef(null)
  const [documents, setDocuments] = useState([])
  const [activeInspectorDoc, setActiveInspectorDoc] = useState(null)
  const [ocrProgress, setOcrProgress] = useState({})

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      const doc = {
        id: docId,
        fileName: file.name,
        file,
        status: 'processing',
        progressStatus: t('processing', 'Scanning document image pixels...'),
        extraction: null,
      }

      setDocuments(prev => [...prev, doc])

      try {
        const ocrResult = await scanMedicalDocument(file, (prog) => {
          setOcrProgress(prev => ({ ...prev, [docId]: prog.progress }))
          setDocuments(prev => prev.map(d =>
            d.id === docId ? { ...d, progressStatus: prog.status } : d
          ))
        })

        setDocuments(prev => prev.map(d =>
          d.id === docId
            ? { ...d, status: 'processed', extraction: ocrResult }
            : d
        ))
      } catch (err) {
        console.error('OCR scan failed:', err)
        setDocuments(prev => prev.map(d =>
          d.id === docId ? { ...d, status: 'error', progressStatus: t('ocrFailed', 'Failed to read image clearly') } : d
        ))
      }
    }
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
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/patient/interview')}
            className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors px-2 py-1 rounded-lg hover:bg-surface-muted"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back', 'Back')}</span>
          </button>
          <LanguageSelector variant="compact" />
        </div>

        <div className="text-center mb-8">
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

        {/* Upload Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <Button
            variant="outline"
            size="lg"
            icon={Camera}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('scanDocument', 'Scan Document')}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('uploadFile', 'Upload File / Photo')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Document List with Real OCR extraction */}
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="relative">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 border border-primary-200">
                  <File className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-text-primary text-sm truncate">
                      {doc.fileName}
                    </h3>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="text-text-muted hover:text-critical transition-colors cursor-pointer p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

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

                  {doc.status === 'processed' && doc.extraction && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-600 mb-2.5">
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

                      {/* Display Extracted Items */}
                      <div className="space-y-1.5">
                        {doc.extraction.extractedData?.medications?.map((item, i) => (
                          <div key={i} className="flex items-center justify-between bg-surface-muted rounded-lg px-3 py-1.5 text-xs">
                            <span className="font-medium text-text-primary">💊 {item.name} {item.dosage || ''}</span>
                            <ConfidenceBadge score={item.confidence || 0.94} />
                          </div>
                        ))}
                        {doc.extraction.extractedData?.investigations?.map((lab, i) => (
                          <div key={i} className="flex items-center justify-between bg-surface-muted rounded-lg px-3 py-1.5 text-xs">
                            <span className="font-medium text-text-primary">🧪 {lab.name}: {lab.value} {lab.unit}</span>
                            <ConfidenceBadge score={lab.confidence || 0.94} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {documents.length === 0 && (
          <Card className="text-center py-10 sm:py-12 border-dashed border-2">
            <Upload className="w-9 h-9 text-text-muted mx-auto mb-2" />
            <p className="text-text-muted font-medium text-sm">
              No documents uploaded yet.
              <br />
              <span className="text-xs text-text-muted">Upload any prescription or lab report image (JPG, PNG, PDF)</span>
            </p>
          </Card>
        )}

        {/* Actions */}
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
            {t('continue', 'Continue')}
          </Button>
        </div>
      </motion.div>

      {/* Document Inspector Modal */}
      <DocumentInspectorModal
        isOpen={Boolean(activeInspectorDoc)}
        onClose={() => setActiveInspectorDoc(null)}
        documentData={activeInspectorDoc}
      />
    </div>
  )
}
