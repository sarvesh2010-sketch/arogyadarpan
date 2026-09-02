// ============================
// ArogyaDarpan — Dynamic Session Data Store
// Manages live patient session responses, OCR extractions, and timeline construction
// ============================

import { getDemoPatient } from '../data/demoPatients'

const CLINICAL_LABEL_MAP = {
  // Complaints
  chest_pain: 'Chest Pain',
  fever: 'Fever',
  cough: 'Cough',
  stomach_pain: 'Abdominal Pain',
  headache: 'Headache',
  back_pain: 'Back Pain',
  breathing: 'Breathing Difficulty',
  other: 'General Health Complaint',

  // Onset & Durations
  gradual_1day: '1 day ago (Gradual onset)',
  sudden_today: 'Today (Sudden onset)',
  '2_3_days': '2-3 days ago',
  '1_2_days': '1-2 days ago',
  '3_5_days': '3-5 days ago',
  '1_week': 'About 1 week ago',
  today: 'Today',
  '1_day': 'Yesterday',
  more: 'More than a week ago',
  chronic: 'Ongoing for weeks / Chronic',

  // Sites
  center: 'Center of chest (Substernal)',
  left: 'Left side of chest',
  right: 'Right side of chest',
  diffuse: 'Entire chest area',
  upper_center: 'Upper center abdomen (Epigastric)',
  upper_right: 'Upper right abdomen (Right Hypochondrium)',
  around_navel: 'Around navel (Periumbilical)',
  lower_right: 'Lower right abdomen (RIF)',
  lower_left: 'Lower left abdomen (LIF)',

  // Character
  squeezing: 'Heavy / Squeezing pressure (Dull pressure)',
  sharp: 'Sharp / Stabbing pain',
  burning: 'Burning sensation / Acidity',
  throbbing: 'Throbbing / Pulsating',
  cramping: 'Cramping / Colicky',
  dull_ache: 'Dull constant ache',

  // Radiation
  left_arm: 'Radiates to left arm & shoulder',
  jaw_neck: 'Radiates to jaw & neck',
  back: 'Radiates to back',
  none: 'No radiation (localized)',

  // Associations & Symptoms
  breathlessness: 'Shortness of breath (Dyspnea)',
  sweating: 'Profuse sweating (Diaphoresis)',
  nausea: 'Nausea / Vomiting',
  dizziness: 'Dizziness / Lightheadedness',
  headache: 'Headache',
  body_ache: 'Body ache & Joint stiffness',
  rash: 'Skin rash',
  vomiting: 'Vomiting',
  loose_stools: 'Loose stools / Diarrhea',
  burning_urine: 'Burning urination (Dysuria)',
  constipation: 'Constipation',
  blood_stool: 'Blood in stool',
  bloating: 'Bloating / Gas',

  // Patterns & Modifiers
  constant: 'Constant / Continuous',
  episodic: 'Episodic / Comes in waves',
  exertional: 'Triggered by walking / physical exertion',
  exertion_worse: 'Worse with exertion / climbing stairs',
  respiration_worse: 'Worse with deep breath or coughing',
  rest_better: 'Better with rest',
  antacid_better: 'Better with antacids',
  worse_after_meal: 'Worse after eating',
  better_after_meal: 'Better after eating',
  worse_empty_stomach: 'Worse on empty stomach',
  no_relation: 'No clear relation to meals',

  // Grades
  low_grade: 'Low grade (99-100°F)',
  moderate: 'Moderate (100-102°F)',
  high: 'High (102-104°F)',
  very_high: 'Very High (>104°F with rigors)',
  continuous: 'Continuous / Always present',
  intermittent: 'Comes and goes (Intermittent)',
  evening_rise: 'Rises in evening / night',
  with_chills: 'With shaking chills (Rigors)',

  // Medical History
  diabetes: 'Type 2 Diabetes Mellitus',
  hypertension: 'Essential Hypertension (High BP)',
  heart_disease: 'Coronary Artery Disease',
  asthma: 'Asthma / COPD',
  thyroid: 'Hypothyroidism',
  cancer: 'Cancer history',
  stroke: 'Stroke / Cerebrovascular Disease',

  // Social / Habits
  never: 'Never',
  current: 'Currently active',
  quit_recent: 'Quit within last 2 years',
  quit_long: 'Quit >2 years ago (Ex-smoker)',
  occasional: 'Occasional (social use)',
  regular: 'Regular use',
  quit: 'Quit',
  yes: 'Yes',
  no: 'No',
}

/**
 * Format any clinical enum / value into human readable text
 */
export function formatClinicalValue(val) {
  if (val === null || val === undefined) return 'Not reported'
  if (Array.isArray(val)) {
    return val.map(item => CLINICAL_LABEL_MAP[item] || String(item).replace(/_/g, ' ')).join(', ')
  }
  if (typeof val === 'string') {
    return CLINICAL_LABEL_MAP[val] || val.replace(/_/g, ' ')
  }
  return String(val)
}

/**
 * Retrieve active patient profile (from localStorage or demo fallback)
 */
export function getActivePatient() {
  try {
    const stored = localStorage.getItem('arogya_patient')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && parsed.name) return parsed
    }
  } catch (e) {
    console.warn('Session store error:', e)
  }
  return getDemoPatient('demo-001')
}

/**
 * Retrieve active patient responses
 */
export function getActiveResponses() {
  try {
    const stored = localStorage.getItem('arogya_responses')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.warn('Response store error:', e)
  }
  return []
}

/**
 * Retrieve active uploaded documents & OCR extractions
 */
export function getActiveDocuments() {
  try {
    const stored = localStorage.getItem('arogya_documents')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.warn('Document store error:', e)
  }
  return []
}

/**
 * Clear all current session keys cleanly upon completion
 */
export function clearPatientSession() {
  try {
    localStorage.removeItem('arogya_responses')
    localStorage.removeItem('arogya_triage')
    localStorage.removeItem('arogya_documents')
    localStorage.removeItem('arogya_patient')
    localStorage.removeItem('arogya_consent')
  } catch (e) {
    console.warn('Session clear error:', e)
  }
}

/**
 * Dynamically construct medical timeline events for ANY patient session
 */
export function buildDynamicTimeline() {
  const patient = getActivePatient()
  const responses = getActiveResponses()
  const documents = getActiveDocuments()

  const timeline = []

  // 1. Add current visit event from active interview responses
  const chiefComplaintResp = responses.find(r => r.questionId === 'chief_complaint')
  const onsetResp = responses.find(r => r.questionId === 'socrates_onset' || r.questionId === 'cp_onset' || r.questionId === 'generic_onset' || r.questionId === 'f_onset' || r.questionId === 'sp_onset')
  const severityResp = responses.find(r => r.questionId.includes('severity'))
  
  const rawComplaint = chiefComplaintResp?.structuredValue || chiefComplaintResp?.originalResponse || 'Clinical Consultation'
  const complaintFormatted = formatClinicalValue(rawComplaint)
  const onsetFormatted = onsetResp ? formatClinicalValue(onsetResp.structuredValue || onsetResp.originalResponse) : 'Recent onset'
  const severityText = severityResp ? ` (Severity: ${severityResp.structuredValue || 5}/10)` : ''

  timeline.push({
    id: 'tl-current',
    date: new Date().toISOString().split('T')[0],
    eventType: 'consultation',
    title: `Current Visit — ${complaintFormatted.toUpperCase()}`,
    description: `Patient ${patient.name || 'User'} presents with ${complaintFormatted} starting ${onsetFormatted}${severityText}.`,
    sourceResponseId: 'chief_complaint',
    verificationStatus: 'unverified',
  })

  // 2. Add events from uploaded OCR documents
  documents.forEach((doc, idx) => {
    const extraction = doc.extraction || {}
    const docDate = extraction.documentDate || doc.documentDate || '2025-05-12'

    // Diagnoses
    if (extraction.extractedData?.diagnosis?.length > 0) {
      extraction.extractedData.diagnosis.forEach((diag, dIdx) => {
        timeline.push({
          id: `tl-doc-diag-${idx}-${dIdx}`,
          date: docDate,
          eventType: 'diagnosis',
          title: `Diagnosed: ${diag}`,
          description: `Documented in ${doc.fileName || 'Uploaded Record'}`,
          sourceDocumentId: doc.id || `doc-${idx}`,
          verificationStatus: 'patient_confirmed',
        })
      })
    }

    // Medications
    if (extraction.extractedData?.medications?.length > 0) {
      extraction.extractedData.medications.forEach((med, mIdx) => {
        timeline.push({
          id: `tl-doc-med-${idx}-${mIdx}`,
          date: docDate,
          eventType: 'medication',
          title: `${med.name} ${med.dosage || ''} Prescribed`,
          description: `${med.frequency || 'Regular dose'} documented in ${doc.fileName}`,
          sourceDocumentId: doc.id || `doc-${idx}`,
          verificationStatus: 'patient_confirmed',
        })
      })
    }

    // Investigations
    if (extraction.extractedData?.investigations?.length > 0) {
      extraction.extractedData.investigations.forEach((inv, iIdx) => {
        timeline.push({
          id: `tl-doc-inv-${idx}-${iIdx}`,
          date: docDate,
          eventType: 'investigation',
          title: `${inv.name}: ${inv.value} ${inv.unit || ''} (${inv.status === 'abnormal' ? 'Abnormal' : 'Normal'})`,
          description: `Lab test result from ${doc.fileName || 'Report'}. Normal Range: ${inv.normalRange || 'Standard'}.`,
          sourceDocumentId: doc.id || `doc-${idx}`,
          verificationStatus: 'patient_confirmed',
        })
      })
    }
  })

  // 3. Fallback to demo timeline only if user has not answered any interview questions and has no documents
  if (timeline.length === 1 && responses.length === 0 && documents.length === 0) {
    const demo = getDemoPatient('demo-001')
    return demo.timeline
  }

  return timeline.sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * Dynamically construct confirmation cards for ConfirmationScreen
 */
export function buildDynamicConfirmationItems() {
  const responses = getActiveResponses()
  const documents = getActiveDocuments()

  if (responses.length === 0 && documents.length === 0) {
    // Fallback to demo Rahul Sharma items
    return [
      { label: 'Main problem', value: 'Chest pain for 3 days', status: 'confirmed' },
      { label: 'Started', value: '3 days ago', status: 'confirmed' },
      { label: 'Severity', value: '7 / 10', status: 'confirmed' },
      { label: 'Breathing difficulty', value: 'Yes', status: 'confirmed' },
      { label: 'Known conditions', value: 'Type 2 Diabetes Mellitus', status: 'confirmed' },
      { label: 'Current medicine', value: 'Metformin 500 mg', status: 'confirmed' },
      { label: 'Drug allergy', value: 'Needs confirmation', status: 'needs_review' },
      { label: 'Family history', value: 'Father had heart disease', status: 'confirmed' },
    ]
  }

  const items = []

  // Chief Complaint
  const complaint = responses.find(r => r.questionId === 'chief_complaint')
  if (complaint) {
    const val = formatClinicalValue(complaint.structuredValue || complaint.originalResponse)
    items.push({ label: 'Main problem', value: val.toUpperCase(), status: 'confirmed' })
  }

  // Onset
  const onset = responses.find(r => r.questionId.includes('onset'))
  if (onset) {
    items.push({ label: 'Started', value: formatClinicalValue(onset.structuredValue || onset.originalResponse), status: 'confirmed' })
  }

  // Severity
  const severity = responses.find(r => r.questionId.includes('severity'))
  if (severity) {
    items.push({ label: 'Severity Score', value: `${severity.structuredValue || 5} / 10`, status: 'confirmed' })
  }

  // Past Medical Conditions
  const past = responses.find(r => r.questionId === 'past_medical')
  if (past) {
    const val = formatClinicalValue(past.structuredValue || 'None')
    items.push({ label: 'Known conditions', value: val, status: 'confirmed' })
  }

  // Medications
  const meds = responses.find(r => r.questionId === 'current_medications')
  if (meds && meds.structuredValue) {
    items.push({ label: 'Current medicine', value: String(meds.structuredValue), status: 'confirmed' })
  }

  // Allergies
  const allergy = responses.find(r => r.questionId === 'allergies')
  if (allergy) {
    const allergyText = String(allergy.structuredValue || allergy.originalResponse || 'No known allergy')
    const hasConflict = documents.some(d => d.extraction?.extractedData?.allergies?.length > 0)
    items.push({
      label: 'Drug allergy',
      value: hasConflict ? 'Needs confirmation (Conflict with past record)' : allergyText,
      status: hasConflict ? 'needs_review' : 'confirmed',
    })
  }

  // Family History
  const fam = responses.find(r => r.questionId === 'family_history')
  if (fam && fam.structuredValue) {
    items.push({ label: 'Family history', value: formatClinicalValue(fam.structuredValue), status: 'confirmed' })
  }

  // Personal / Habits
  const smoke = responses.find(r => r.questionId === 'smoking_status')
  if (smoke && smoke.structuredValue) {
    items.push({ label: 'Smoking status', value: formatClinicalValue(smoke.structuredValue), status: 'confirmed' })
  }

  return items
}
