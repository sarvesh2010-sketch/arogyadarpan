import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, Camera, FileText, Check, ArrowRight, File, X, Eye, Sparkles } from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import ConfidenceBadge from '../../components/ConfidenceBadge'
import DocumentInspectorModal from '../../components/DocumentInspectorModal'
import { scanMedicalDocument } from '../../services/ocrEngine'

export default function DocumentUpload() {
  const navigate = useNavigate()
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
        progressStatus: 'Scanning document image pixels...',
        extraction: null,
      }

      setDocuments(prev => [...prev, doc])

      try {
        // Run real client-side Tesseract OCR + Medical NLP Parser Engine
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
          d.id === docId ? { ...d, status: 'error', progressStatus: 'Failed to read image clearly' } : d
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
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary-50/20 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
            Bring your previous records together
          </h1>
          <p className="text-text-secondary max-w-md mx-auto">
            Scan prescriptions, lab reports, or discharge summaries.
            ArogyaDarpan uses real in-browser OCR to extract text from your actual documents.
          </p>
        </div>

        {/* Upload Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <Button
            variant="outline"
            size="lg"
            icon={Camera}
            onClick={() => fileInputRef.current?.click()}
          >
            Scan Document
          </Button>
          <Button
            variant="secondary"
            size="lg"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload File
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
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 border border-primary-200">
                  <File className="w-6 h-6 text-primary-600" />
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
                        <span>{doc.progressStatus || 'Scanning image pixels...'}</span>
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
                      <div className="flex items-center justify-between text-sm text-emerald-600 mb-3">
                        <span className="flex items-center gap-1 font-medium">
                          <Check className="w-4 h-4" />
                          OCR Extraction Complete
                        </span>

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => setActiveInspectorDoc(doc.extraction)}
                          className="text-primary-600 hover:bg-primary-50"
                        >
                          Inspect Document & OCR Trace
                        </Button>
                      </div>

                      {/* Display Extracted Items */}
                      <div className="space-y-2">
                        {doc.extraction.extractedData?.medications?.map((item, i) => (
                          <div key={i} className="flex items-center justify-between bg-surface-muted rounded-lg px-3 py-2 text-xs">
                            <span className="font-medium text-text-primary">💊 {item.name} {item.dosage || ''}</span>
                            <ConfidenceBadge score={item.confidence || 0.94} />
                          </div>
                        ))}
                        {doc.extraction.extractedData?.investigations?.map((lab, i) => (
                          <div key={i} className="flex items-center justify-between bg-surface-muted rounded-lg px-3 py-2 text-xs">
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
          <Card className="text-center py-12 border-dashed border-2">
            <Upload className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted font-medium">
              No documents uploaded yet.
              <br />
              <span className="text-xs text-text-muted">Upload any prescription or lab report image (JPG, PNG, PDF)</span>
            </p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate('/patient/document-review')}
          >
            Skip for now
          </Button>
          <Button
            size="lg"
            fullWidth
            onClick={handleContinue}
            iconRight={ArrowRight}
          >
            Continue
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
