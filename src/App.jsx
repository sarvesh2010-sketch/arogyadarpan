import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Pages
import LandingPage from './pages/LandingPage'
import DemoPage from './pages/DemoPage'
import KioskView from './components/KioskView'

// Patient Journey
import LanguageSelection from './pages/patient/LanguageSelection'
import ConsentScreen from './pages/patient/ConsentScreen'
import PatientIdentification from './pages/patient/PatientIdentification'
import InterviewScreen from './pages/patient/InterviewScreen'
import DocumentUpload from './pages/patient/DocumentUpload'
import DocumentReview from './pages/patient/DocumentReview'
import ConfirmationScreen from './pages/patient/ConfirmationScreen'
import CompletionScreen from './pages/patient/CompletionScreen'

// Doctor Dashboard
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import PatientDetail from './pages/doctor/PatientDetail'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing & Kiosk */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/kiosk" element={<KioskView />} />

        {/* Patient Journey */}
        <Route path="/patient/language" element={<LanguageSelection />} />
        <Route path="/patient/consent" element={<ConsentScreen />} />
        <Route path="/patient" element={<PatientIdentification />} />
        <Route path="/patient/interview" element={<InterviewScreen />} />
        <Route path="/patient/documents" element={<DocumentUpload />} />
        <Route path="/patient/document-review" element={<DocumentReview />} />
        <Route path="/patient/timeline" element={<Navigate to="/patient/document-review" replace />} />
        <Route path="/patient/confirmation" element={<ConfirmationScreen />} />
        <Route path="/patient/complete" element={<CompletionScreen />} />

        {/* Doctor Dashboard */}
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/patients" element={<Navigate to="/doctor" replace />} />
        <Route path="/doctor/patient/:id" element={<PatientDetail />} />
        <Route path="/doctor/patient/:id/timeline" element={<PatientDetail />} />
        <Route path="/doctor/patient/:id/documents" element={<PatientDetail />} />
        <Route path="/doctor/patient/:id/review" element={<PatientDetail />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
