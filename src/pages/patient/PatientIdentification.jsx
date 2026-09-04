import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, ArrowRight, ArrowLeft, Phone, CreditCard, Calendar,
  Droplet, MapPin, AlertCircle, Search, CheckCircle2, RotateCcw,
  Sparkles, ShieldCheck, HeartHandshake, UserCheck
} from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import LanguageSelector from '../../components/LanguageSelector'
import { useLanguage } from '../../context/LanguageContext'
import {
  generatePatientId,
  saveRegisteredPatient,
  getRegisteredPatients,
  findPatientByIdentifier,
  hasActiveSession,
  clearPatientSession,
  getActiveInterviewState
} from '../../services/sessionStore'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const RELATIONSHIPS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Guardian', 'Friend / Relative', 'Other']

export default function PatientIdentification() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  // Tab: 'register' | 'login'
  const [activeTab, setActiveTab] = useState('register')
  const [hasExistingSession, setHasExistingSession] = useState(false)
  const [generatedId, setGeneratedId] = useState(() => generatePatientId())

  // Toggle between Age input vs Date of Birth input
  const [useDob, setUseDob] = useState(false)

  // Registration Form State
  const [form, setForm] = useState(() => {
    try {
      const stored = localStorage.getItem('arogya_patient')
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          patientId: parsed.patientId || '',
          name: parsed.name || '',
          age: parsed.age || '',
          dob: parsed.dob || '',
          gender: parsed.gender || '',
          phone: parsed.phone || '',
          bloodGroup: parsed.bloodGroup || '',
          address: parsed.address || '',
          pincode: parsed.pincode || '',
          emergencyContact: parsed.emergencyContact || '',
          emergencyPhone: parsed.emergencyPhone || '',
          relationship: parsed.relationship || '',
          abhaId: parsed.abhaId || '',
        }
      }
    } catch (e) { /* ignore */ }
    return {
      patientId: '',
      name: '',
      age: '',
      dob: '',
      gender: '',
      phone: '',
      bloodGroup: '',
      address: '',
      pincode: '',
      emergencyContact: '',
      emergencyPhone: '',
      relationship: '',
      abhaId: '',
    }
  })

  // Returning Patient Login Search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchAttempted, setSearchAttempted] = useState(false)

  const registeredList = useMemo(() => getRegisteredPatients(), [activeTab])

  // Check for in-progress session
  useEffect(() => {
    setHasExistingSession(hasActiveSession())
  }, [])

  // Auto-calculate age from DOB
  const handleDobChange = (dobValue) => {
    setForm(prev => {
      let calculatedAge = prev.age
      if (dobValue) {
        const birthDate = new Date(dobValue)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        if (age >= 0 && age <= 125) {
          calculatedAge = String(age)
        }
      }
      return { ...prev, dob: dobValue, age: calculatedAge }
    })
  }

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Handle New Patient Registration Submit
  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    const patientProfile = {
      ...form,
      patientId: form.patientId || generatedId,
      registeredAt: new Date().toISOString()
    }

    // Save to registered patients registry
    saveRegisteredPatient(patientProfile)
    // Save to active patient session
    localStorage.setItem('arogya_patient', JSON.stringify(patientProfile))

    navigate('/patient/interview')
  }

  // Handle Returning Patient Search
  const handleSearch = (e) => {
    if (e) e.preventDefault()
    setSearchAttempted(true)
    const found = findPatientByIdentifier(searchQuery)
    setSearchResult(found)
  }

  // Select Returning Patient
  const handleSelectReturningPatient = (patient) => {
    const activeProfile = {
      ...patient,
      isReturningPatient: true,
      lastVisitLoaded: true,
    }
    localStorage.setItem('arogya_patient', JSON.stringify(activeProfile))
    navigate('/patient/interview')
  }

  // Resume In-Progress Session
  const handleResumeSession = () => {
    const savedState = getActiveInterviewState()
    if (savedState && savedState.isComplete) {
      navigate('/patient/documents')
    } else {
      navigate('/patient/interview')
    }
  }

  // Clear In-Progress Session to start clean
  const handleClearSession = () => {
    clearPatientSession()
    setHasExistingSession(false)
    setForm({
      patientId: '',
      name: '',
      age: '',
      dob: '',
      gender: '',
      phone: '',
      bloodGroup: '',
      address: '',
      pincode: '',
      emergencyContact: '',
      emergencyPhone: '',
      relationship: '',
      abhaId: '',
    })
    setGeneratedId(generatePatientId())
  }

  const canContinueRegistration = form.name.trim() && form.age && form.gender && form.phone.length === 10

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary-50/20 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl w-full"
      >
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/patient/consent')}
            className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors px-2 py-1 rounded-lg hover:bg-surface-muted"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back', 'Back')}</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
              Step 3 of 6
            </span>
            <LanguageSelector variant="compact" />
          </div>
        </div>

        {/* In-Progress Session Resume Alert */}
        <AnimatePresence>
          {hasExistingSession && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 bg-gradient-to-r from-amber-50 to-primary-50 border border-amber-200/80 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text-primary text-sm font-heading">
                    {t('activeSessionFound', 'An active session in progress was detected')}
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5 mb-3">
                    You have saved interview responses or documents from your current visit. Would you like to resume where you left off?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="primary" onClick={handleResumeSession} iconRight={ArrowRight}>
                      {t('resumeSession', 'Resume Session')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleClearSession} icon={RotateCcw}>
                      {t('startFresh', 'Start Fresh Intake')}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-500/20">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-heading mb-1.5">
            {t('patientRegistration', 'Patient Registration & Check-in')}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            {t('patientSubtitle', 'Please enter your identification details or log in as a returning patient')}
          </p>
        </div>

        {/* Mode Tabs: New Patient vs Existing Patient */}
        <div className="flex p-1 bg-surface-muted rounded-2xl border border-border-light mb-6 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('newRegistration', 'New Patient Registration')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{t('existingPatient', 'Existing Patient Login')}</span>
          </button>
        </div>

        {/* TAB 1: NEW PATIENT REGISTRATION */}
        {activeTab === 'register' && (
          <Card className="mb-6">
            <form onSubmit={handleRegisterSubmit} className="space-y-4 sm:space-y-5">
              {/* Generated Patient ID Banner */}
              <div className="flex items-center justify-between bg-primary-50/60 border border-primary-200/70 px-4 py-2.5 rounded-xl text-xs sm:text-sm">
                <span className="font-semibold text-primary-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary-600" />
                  {t('patientId', 'Patient ID')}:
                </span>
                <span className="font-mono font-bold text-primary-700 bg-white px-2.5 py-1 rounded-lg border border-primary-200 shadow-xs">
                  {form.patientId || generatedId}
                </span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  {t('name', 'Full Name')} *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder={t('namePlaceholder', 'e.g. Rahul Sharma')}
                  className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Age / Date of Birth Selector with toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                    {useDob ? t('dob', 'Date of Birth') : t('age', 'Age (Years)')} *
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseDob(!useDob)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-semibold cursor-pointer underline"
                  >
                    {useDob ? t('toggleToAge', 'Enter Age Instead') : t('toggleToDob', 'Enter Date of Birth')}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {useDob ? (
                    <div>
                      <input
                        type="date"
                        required
                        max={new Date().toISOString().split('T')[0]}
                        value={form.dob}
                        onChange={(e) => handleDobChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                      />
                      {form.age && (
                        <p className="text-xs text-primary-600 font-medium mt-1">
                          Calculated Age: {form.age} years
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="number"
                        required
                        value={form.age}
                        onChange={(e) => updateField('age', e.target.value)}
                        placeholder="46"
                        min="1"
                        max="125"
                        className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  )}

                  {/* Gender */}
                  <div>
                    <select
                      required
                      value={form.gender}
                      onChange={(e) => updateField('gender', e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-border-light bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer text-sm"
                    >
                      <option value="">{t('selectGender', 'Select Gender')} *</option>
                      <option value="Male">{t('male', 'Male')}</option>
                      <option value="Female">{t('female', 'Female')}</option>
                      <option value="Other">{t('other', 'Other')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Phone & Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-text-muted" /> {t('phone', 'Phone Number')} *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                    placeholder={t('phonePlaceholder', '10-digit mobile number')}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-rose-500" /> {t('bloodGroup', 'Blood Group')}
                  </label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => updateField('bloodGroup', e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-border-light bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer text-sm"
                  >
                    <option value="">{t('selectBloodGroup', 'Select Blood Group (optional)')}</option>
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Basic Demographics: Address & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-text-muted" /> {t('address', 'Address / City')}
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder={t('addressPlaceholder', 'e.g. Model Town, Jaipur')}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    {t('pincode', 'PIN Code')}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, ''))}
                    placeholder="302015"
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              {/* Emergency Contact & Relationship */}
              <div className="p-3.5 bg-surface-muted/50 rounded-2xl border border-border-light space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                  <HeartHandshake className="w-4 h-4 text-primary-600" />
                  <span>{t('emergencyContact', 'Emergency Contact (Optional)')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      value={form.emergencyContact}
                      onChange={(e) => updateField('emergencyContact', e.target.value)}
                      placeholder={t('emergencyContactPlaceholder', 'Contact Name')}
                      className="w-full px-3 py-2.5 rounded-xl border border-border-light bg-surface text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={form.emergencyPhone}
                      onChange={(e) => updateField('emergencyPhone', e.target.value.replace(/\D/g, ''))}
                      placeholder={t('emergencyPhone', 'Phone Number')}
                      className="w-full px-3 py-2.5 rounded-xl border border-border-light bg-surface text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <select
                      value={form.relationship}
                      onChange={(e) => updateField('relationship', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border-light bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    >
                      <option value="">{t('selectRelationship', 'Relationship')}</option>
                      {RELATIONSHIPS.map(rel => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ABHA ID */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-text-muted" /> {t('abhaId', 'ABHA ID')}
                  </span>
                  <span className="text-text-muted font-normal text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.abhaId}
                  onChange={(e) => updateField('abhaId', e.target.value)}
                  placeholder={t('abhaPlaceholder', 'e.g. ABHA-1234-5678')}
                  className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Continue Button */}
              <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={!canContinueRegistration}
                iconRight={ArrowRight}
                className="mt-4 shadow-lg shadow-primary-500/20"
              >
                {t('continue', 'Continue to Clinical Interview')}
              </Button>
            </form>
          </Card>
        )}

        {/* TAB 2: EXISTING PATIENT LOGIN / RETURNING PATIENT */}
        {activeTab === 'login' && (
          <div className="space-y-5">
            <Card>
              <form onSubmit={handleSearch} className="space-y-3">
                <label className="block text-sm font-medium text-text-primary">
                  {t('searchPatient', 'Search by Mobile, Patient ID, or ABHA ID')}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('searchPatientPlaceholder', 'Enter 10-digit mobile, ID, or ABHA')}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="md">
                    {t('search', 'Search')}
                  </Button>
                </div>
              </form>

              {/* Search Results Display */}
              {searchAttempted && (
                <div className="mt-4 pt-4 border-t border-border-light">
                  {searchResult ? (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <h3 className="font-bold text-text-primary text-base font-heading">
                              {searchResult.name}
                            </h3>
                            <p className="text-xs text-text-muted">
                              {searchResult.patientId} • {searchResult.age} yrs • {searchResult.gender} • Blood Group: {searchResult.bloodGroup || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          Returning Record
                        </span>
                      </div>

                      <div className="text-xs text-text-secondary space-y-1 mb-4 bg-white/80 p-3 rounded-xl border border-emerald-100">
                        <p><span className="font-semibold">Phone:</span> {searchResult.phone}</p>
                        {searchResult.address && <p><span className="font-semibold">Address:</span> {searchResult.address}</p>}
                        {searchResult.pastMedicalHistory && (
                          <p><span className="font-semibold">Past History:</span> {searchResult.pastMedicalHistory.join(', ')}</p>
                        )}
                        {searchResult.pastSurgicalHistory && (
                          <p><span className="font-semibold">Past Surgeries:</span> {searchResult.pastSurgicalHistory.join(', ')}</p>
                        )}
                        {searchResult.knownAllergies && (
                          <p><span className="font-semibold text-critical">Allergies:</span> {searchResult.knownAllergies.join(', ')}</p>
                        )}
                      </div>

                      <Button
                        size="md"
                        fullWidth
                        onClick={() => handleSelectReturningPatient(searchResult)}
                        iconRight={ArrowRight}
                      >
                        {t('continue', 'Continue Intake with this Profile')}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-text-muted">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                      <p className="text-sm font-medium text-text-primary mb-1">
                        {t('patientNotFound', 'No patient record found')}
                      </p>
                      <p className="text-xs text-text-secondary max-w-sm mx-auto mb-4">
                        Please verify the mobile number or ID, or register as a new patient.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('register')}>
                        {t('newRegistration', 'Register as New Patient')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Quick Demo Returning Patients */}
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">
                {t('recentPatients', 'Registered Patients Registry (Tap to Quick Load)')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {registeredList.map(pat => (
                  <Card
                    key={pat.patientId}
                    hover
                    onClick={() => handleSelectReturningPatient(pat)}
                    padding="p-3.5"
                    className="cursor-pointer border-border-light hover:border-primary-400 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-text-primary text-sm font-heading">{pat.name}</span>
                      <span className="text-xs font-mono font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                        {pat.patientId}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {pat.age} yrs • {pat.gender} • {pat.phone}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-primary-600 font-semibold">
                      <span>Select Record</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
