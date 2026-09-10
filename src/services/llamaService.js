// ============================================================================
// ArogyaDarpan — Llama LLM Integration Service (Groq / Ollama / Local Fallback)
// Handles natural voice input parsing, dynamic follow-up questions,
// clinical differential diagnosis (ICD-10), structured summary generation,
// multi-turn conversational intake, and document text extraction.
// ============================================================================

const GROQ_API_URL = import.meta.env?.VITE_GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions'
const OLLAMA_API_URL = import.meta.env?.VITE_OLLAMA_API_URL || 'http://localhost:11434/api/chat'

/**
 * Get configured Llama API credentials from localStorage or environment variables
 */
export function getLlamaConfig() {
  try {
    const envKey = (typeof process !== 'undefined' && process.env)
      ? (process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY)
      : ''
    const envModel = (typeof process !== 'undefined' && process.env)
      ? (process.env.VITE_GROQ_MODEL || process.env.GROQ_MODEL)
      : ''

    const groqKey =
      localStorage.getItem('arogya_groq_api_key') ||
      import.meta.env?.VITE_GROQ_API_KEY ||
      envKey ||
      ''
    const useOllama = localStorage.getItem('arogya_use_ollama') === 'true'
    const model =
      localStorage.getItem('arogya_llama_model') ||
      import.meta.env?.VITE_GROQ_MODEL ||
      envModel ||
      'openai/gpt-oss-120b'
    return { groqKey, useOllama, model }
  } catch {
    const fallbackKey = (typeof process !== 'undefined' && process.env)
      ? (process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY)
      : (import.meta.env?.VITE_GROQ_API_KEY || '')
    return {
      groqKey: fallbackKey,
      useOllama: false,
      model: import.meta.env?.VITE_GROQ_MODEL || 'openai/gpt-oss-120b'
    }
  }
}

/**
 * Save Llama API credentials to localStorage
 */
export function saveLlamaConfig({ groqKey, useOllama, model }) {
  try {
    if (groqKey !== undefined) localStorage.setItem('arogya_groq_api_key', groqKey)
    if (useOllama !== undefined) localStorage.setItem('arogya_use_ollama', String(useOllama))
    if (model !== undefined) localStorage.setItem('arogya_llama_model', model)
  } catch { /* ignore */ }
}

/**
 * Sleep utility for retry backoff
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Main completion caller for Llama model (Groq or Ollama) with retry & fallback
 * Accepts system + user prompt and returns parsed response.
 */
export async function queryLlama({ systemPrompt, userPrompt, temperature = 0.2, jsonMode = true, maxRetries = 2 }) {
  const { groqKey, useOllama, model } = getLlamaConfig()

  // 1. Try Groq API with retry logic
  if (groqKey) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: model || 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature,
            max_tokens: 4096,
            ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
          })
        })

        if (response.ok) {
          const data = await response.json()
          const content = data.choices?.[0]?.message?.content
          if (content) {
            return jsonMode ? JSON.parse(content) : content
          }
        }

        // Rate limit (429) — wait and retry
        if (response.status === 429 && attempt < maxRetries) {
          const waitMs = Math.pow(2, attempt + 1) * 1000 // 2s, 4s
          console.warn(`Groq rate limited, retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`)
          await sleep(waitMs)
          continue
        }

        // Other errors — break out and try Ollama
        if (!response.ok) {
          console.warn(`Groq API error ${response.status}: ${response.statusText}`)
          break
        }
      } catch (err) {
        console.warn(`Groq Llama API request failed (attempt ${attempt + 1}):`, err)
        if (attempt < maxRetries) {
          await sleep(Math.pow(2, attempt + 1) * 500)
          continue
        }
      }
    }
  }

  // 2. Try Local Ollama if enabled
  if (useOllama) {
    try {
      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          stream: false,
          format: jsonMode ? 'json' : undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.message?.content
        if (content) {
          return jsonMode ? JSON.parse(content) : content
        }
      }
    } catch (err) {
      console.warn('Local Ollama API unreachable:', err)
    }
  }

  return null // Signal caller to use local rule-based fallback
}

/**
 * 🔄 Multi-Turn Completion Caller
 * Accepts a full messages[] array for conversational context.
 * Used by the conversational voice intake engine for multi-turn dialogue.
 */
export async function queryLlamaMultiTurn(messages = [], { temperature = 0.3, jsonMode = true, maxRetries = 2 } = {}) {
  const { groqKey, useOllama, model } = getLlamaConfig()

  if (groqKey) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: model || 'llama-3.3-70b-versatile',
            messages,
            temperature,
            max_tokens: 4096,
            ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
          })
        })

        if (response.ok) {
          const data = await response.json()
          const content = data.choices?.[0]?.message?.content
          if (content) {
            return jsonMode ? JSON.parse(content) : content
          }
        }

        if (response.status === 429 && attempt < maxRetries) {
          await sleep(Math.pow(2, attempt + 1) * 1000)
          continue
        }

        if (!response.ok) break
      } catch (err) {
        console.warn(`Groq multi-turn request failed (attempt ${attempt + 1}):`, err)
        if (attempt < maxRetries) {
          await sleep(Math.pow(2, attempt + 1) * 500)
          continue
        }
      }
    }
  }

  // Ollama fallback
  if (useOllama) {
    try {
      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          messages,
          stream: false,
          format: jsonMode ? 'json' : undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.message?.content
        if (content) {
          return jsonMode ? JSON.parse(content) : content
        }
      }
    } catch (err) {
      console.warn('Ollama multi-turn fallback failed:', err)
    }
  }

  return null
}

// ============================================================================
// CLINICAL SYSTEM PROMPTS
// ============================================================================

const VOICE_INTAKE_SYSTEM_PROMPT = `You are a senior clinical AI assistant for ArogyaDarpan OPD Kiosk in Indian public hospitals.
Analyze the patient's spoken voice transcript (which may be in Hindi, Hinglish, English, Punjabi, or mixed regional languages).
Extract key clinical entities and generate 2-3 targeted clinical follow-up questions using the SOCRATES framework (Site, Onset, Character, Radiation, Associations, Timing, Exacerbating, Severity).

Important rules:
- Extract ALL symptoms mentioned, even if mentioned casually
- Detect red flags like chest pain + breathlessness, sudden weakness, high fever with rash
- Assign ESI triage level based on clinical urgency
- Generate follow-up questions that fill GAPS in the SOCRATES assessment (don't re-ask what patient already told you)
- Provide conversational reply in both Hindi and English
- Be empathetic and culturally sensitive in your replies

Respond strictly in JSON format matching this schema:
{
  "extractedEntities": {
    "chiefComplaint": "string - primary complaint in English",
    "symptoms": ["array of all mentioned symptoms"],
    "duration": "string - how long symptoms have been present",
    "severityScore": "number 1-10",
    "associatedFactors": ["array of associated symptoms/factors"]
  },
  "redFlags": ["array of detected red flags, empty if none"],
  "esiLevel": "number 1-5 (1=Resuscitation, 2=Emergency, 3=Urgent, 4=Less Urgent, 5=Non-Urgent)",
  "followUpQuestions": [
    {
      "id": "string - unique question id like socrates_onset",
      "questionTextEn": "English question text",
      "questionTextHi": "Hindi question text",
      "type": "single_choice | numeric | text",
      "options": ["array of options if single_choice, empty otherwise"],
      "socratesCategory": "site | onset | character | radiation | associations | timing | exacerbating | severity"
    }
  ],
  "conversationalReplyHi": "Empathetic Hindi reply acknowledging what patient said and asking for more info",
  "conversationalReplyEn": "Empathetic English reply acknowledging what patient said and asking for more info"
}`

const MULTI_TURN_SYSTEM_PROMPT = `You are a senior clinical AI assistant conducting a patient intake interview at an OPD Kiosk in an Indian public hospital.
You are having a multi-turn conversation with the patient. Use the conversation history to understand context.

Your job:
1. Extract ALL clinical entities from the entire conversation so far
2. Track what SOCRATES categories have been covered and what remains
3. Generate 1-2 NEW follow-up questions that fill remaining gaps
4. When you have enough information (at least chief complaint, duration, severity, and 2+ associated factors), set "isIntakeComplete" to true
5. Be empathetic, culturally sensitive, and speak naturally

Respond strictly in JSON:
{
  "extractedEntities": {
    "chiefComplaint": "string",
    "symptoms": ["string"],
    "duration": "string",
    "severityScore": "number 1-10",
    "associatedFactors": ["string"],
    "site": "string or null",
    "character": "string or null",
    "radiation": "string or null",
    "aggravatingFactors": ["string"],
    "relievingFactors": ["string"]
  },
  "redFlags": ["string"],
  "esiLevel": "number 1-5",
  "socratesCoverage": {
    "site": true/false,
    "onset": true/false,
    "character": true/false,
    "radiation": true/false,
    "associations": true/false,
    "timing": true/false,
    "exacerbating": true/false,
    "severity": true/false
  },
  "isIntakeComplete": "boolean - true when enough info gathered",
  "followUpQuestions": [
    {
      "id": "string",
      "questionTextEn": "string",
      "questionTextHi": "string",
      "type": "single_choice | numeric | text",
      "options": ["string"],
      "socratesCategory": "string"
    }
  ],
  "conversationalReplyHi": "string",
  "conversationalReplyEn": "string"
}`

const DOCUMENT_EXTRACTION_SYSTEM_PROMPT = `You are an expert medical document analyst for ArogyaDarpan. 
Analyze the raw OCR text extracted from a scanned medical document (prescription, lab report, discharge summary, or clinical note).
The OCR text may contain errors, misspellings, and formatting issues — intelligently correct and extract structured data.

Extract and return structured medical information in this JSON schema:
{
  "documentType": "Prescription | Laboratory Report | Discharge Summary | Clinical Note | Radiology Report | Other",
  "patientInfo": {
    "name": "string or null",
    "age": "string or null",
    "gender": "string or null"
  },
  "doctorInfo": {
    "name": "string or null",
    "specialization": "string or null",
    "hospital": "string or null"
  },
  "documentDate": "string ISO date or null",
  "diagnoses": [
    {
      "condition": "string",
      "icdCode": "string ICD-10 code or null",
      "status": "active | resolved | suspected"
    }
  ],
  "medications": [
    {
      "name": "string - generic drug name",
      "strength": "string - e.g. 500mg",
      "frequency": "string - e.g. BD (twice daily)",
      "duration": "string - e.g. 30 days",
      "instructions": "string - e.g. after meals",
      "category": "string - e.g. Antidiabetic, Antihypertensive"
    }
  ],
  "labResults": [
    {
      "test": "string - test name",
      "value": "string - numeric value",
      "unit": "string",
      "referenceRange": "string",
      "status": "normal | abnormal",
      "direction": "high | low | normal",
      "clinicalSignificance": "string - brief clinical meaning"
    }
  ],
  "procedures": ["string"],
  "symptoms": ["string"],
  "allergies": ["string"],
  "plainLanguageSummaryEn": "string - 2-3 sentence plain English summary of the document for patients",
  "plainLanguageSummaryHi": "string - Hindi summary for patients"
}`

const CLINICAL_SUMMARY_SYSTEM_PROMPT = `You are a Lead Clinical Documentation AI for ArogyaDarpan. 
Synthesize patient voice responses, interview data, and scanned OCR document records into a standardized 8-part SIH OPD Clinical Summary.

The summary must be medically accurate, concise, and follow Indian clinical documentation standards.

Respond strictly in JSON format:
{
  "chiefComplaint": "string - primary presenting complaint",
  "hpi": "string - detailed History of Present Illness narrative (SOCRATES format)",
  "pastMedical": "string - past medical history",
  "surgicalHistory": "string - past surgical history",
  "medications": [{ "name": "string", "dosage": "string", "frequency": "string" }],
  "allergies": { "drug": "string or 'NKDA'", "severity": "string" },
  "familyHistory": "string",
  "personalHistory": "string - smoking, alcohol, diet, exercise",
  "reviewOfSystems": {
    "cardiovascular": "string",
    "respiratory": "string",
    "gastrointestinal": "string",
    "neurological": "string",
    "musculoskeletal": "string"
  },
  "priorInvestigations": ["string - prior test results with values"],
  "bilingualPatientSummaryHi": "string - patient-friendly Hindi summary",
  "bilingualPatientSummaryEn": "string - patient-friendly English summary",
  "clinicalImpression": "string - doctor-facing clinical impression"
}`

const DIFFERENTIAL_DIAGNOSIS_SYSTEM_PROMPT = `You are an expert Physician AI assistant for ArogyaDarpan. 
Analyze the patient intake summary, symptoms, vital signs, and OCR lab values.
Generate top 3-5 differential diagnoses mapped to standard ICD-10 codes, with match probabilities (0-100), urgency level, evidence points, and recommended diagnostic tests.

Consider the Indian clinical context — common conditions in Indian public hospitals.

Respond strictly in JSON:
{
  "differentials": [
    {
      "icdCode": "string - ICD-10 code",
      "disease": "string - diagnosis name",
      "probability": "number 0-100",
      "urgency": "critical | high | medium | low",
      "evidence": ["string - evidence points from patient data"],
      "recommendedTests": ["string - diagnostic tests to confirm/rule out"],
      "briefExplanation": "string - why this diagnosis is considered"
    }
  ]
}`

const REPORT_INSIGHTS_SYSTEM_PROMPT = `You are a Medical Report Explanation AI for ArogyaDarpan.
Given extracted lab results, medications, and diagnoses from a patient's medical documents, generate:
1. Plain-language explanations of what each lab result means for the patient
2. Clinical significance and what actions might be needed
3. AYUSH/Ayurvedic complementary recommendations where applicable

Respond in JSON:
{
  "insights": [
    {
      "title": "string - report finding title",
      "plainTextEn": "string - plain English explanation for patients",
      "plainTextHi": "string - Hindi explanation",
      "clinicalMeaning": "string - medical significance",
      "status": "normal | abnormal | critical",
      "actionNeeded": "string - recommended next step"
    }
  ],
  "curativeMedicines": [
    {
      "medicine": "string",
      "role": "string - what it does",
      "lifestyle": "string - lifestyle recommendations"
    }
  ],
  "ayushRecommendations": [
    {
      "herb": "string - Ayurvedic herb/formulation",
      "principle": "string - Ayurvedic principle (dosha, dhatu)"
    }
  ],
  "overallSummaryEn": "string - 2-3 sentence overall health summary",
  "overallSummaryHi": "string - Hindi overall summary"
}`

const VOICE_NORMALIZATION_SYSTEM_PROMPT = `You are a medical language normalization AI for ArogyaDarpan.
The input is a raw voice transcript from an Indian patient speaking in Hindi, Hinglish (mixed Hindi-English), Punjabi, or regional language.
Normalize this into clean, structured clinical text.

Rules:
- Convert Hinglish medical terms to proper English medical terminology
- "pet mein dard" → "abdominal pain", "seene mein dard" → "chest pain"
- "sugar ki bimari" → "diabetes mellitus", "BP high" → "hypertension"
- "dawai" → "medication", "tablet khata hoon" → "currently on medication"
- Preserve the clinical meaning accurately
- Extract temporal references: "kal se" → "since yesterday", "2 hafte se" → "for 2 weeks"

Respond in JSON:
{
  "normalizedTextEn": "string - clean English clinical text",
  "normalizedTextHi": "string - clean Hindi clinical text",
  "medicalTermsFound": [
    {
      "original": "string - what patient said",
      "normalized": "string - medical term",
      "category": "symptom | disease | medication | temporal | body_part"
    }
  ],
  "confidence": "number 0-1"
}`

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * 🎙️ Llama Voice Input Parser & Dynamic Follow-Up Question Generator
 * Evaluates free-form voice transcripts and returns extracted clinical parameters
 * plus contextually intelligent follow-up questions.
 */
export async function processVoiceIntakeWithLlama(transcript, lang = 'hi', currentHistory = []) {
  const userPrompt = `Patient Voice Transcript: "${transcript}"\nActive Patient Language: ${lang}\nPrevious Session History: ${JSON.stringify(currentHistory)}`

  const result = await queryLlama({
    systemPrompt: VOICE_INTAKE_SYSTEM_PROMPT,
    userPrompt,
    jsonMode: true
  })
  if (result) return result

  // Fallback to local rule engine if Llama API is offline
  return null
}

/**
 * 🔄 Multi-Turn Conversational Voice Intake
 * Sends full conversation history to LLM for context-aware entity extraction and follow-ups.
 * @param {Array} conversationHistory - Array of {role: 'user'|'assistant', content: string}
 * @param {string} lang - Active language ('hi' | 'en')
 * @returns {Object|null} Extracted entities, follow-up questions, and conversation state
 */
export async function processMultiTurnVoiceIntake(conversationHistory = [], lang = 'hi') {
  const messages = [
    { role: 'system', content: MULTI_TURN_SYSTEM_PROMPT },
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  ]

  const result = await queryLlamaMultiTurn(messages, { jsonMode: true, temperature: 0.3 })
  if (result) return result

  return null
}

/**
 * 📄 LLM-Powered Document Text Extraction
 * Sends raw OCR text to Groq and returns structured medical entities with much
 * higher accuracy than regex-based extraction.
 * @param {string} rawOcrText - Raw text from Tesseract OCR
 * @returns {Object|null} Structured document data or null if API unavailable
 */
export async function extractDocumentTextWithLlama(rawOcrText) {
  if (!rawOcrText || rawOcrText.trim().length < 10) return null

  const userPrompt = `Raw OCR Text from Scanned Medical Document:\n\n${rawOcrText}`

  const result = await queryLlama({
    systemPrompt: DOCUMENT_EXTRACTION_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.1,
    jsonMode: true
  })
  if (result) return result

  return null
}

/**
 * 🏥 Llama Clinical Differential Diagnoses Generator (ICD-10 Mapping)
 */
export async function generateLlamaDifferentialDiagnosis(patientData) {
  const userPrompt = JSON.stringify({
    name: patientData.name,
    age: patientData.age,
    gender: patientData.gender,
    summary: patientData.summary,
    responses: patientData.interviewResponses,
    documents: patientData.documents,
  })

  const result = await queryLlama({
    systemPrompt: DIFFERENTIAL_DIAGNOSIS_SYSTEM_PROMPT,
    userPrompt,
    jsonMode: true
  })
  if (result && Array.isArray(result.differentials)) {
    return result.differentials
  }

  return null
}

/**
 * 📑 Llama Document & Clinical History Summary Generator
 * Synthesizes voice interview transcript + scanned medical records into an 8-part SIH Clinical Summary.
 */
export async function generateLlamaClinicalSummary(patientData, interviewResponses, documents) {
  const userPrompt = JSON.stringify({
    patient: patientData,
    responses: interviewResponses,
    documents: documents,
  })

  const result = await queryLlama({
    systemPrompt: CLINICAL_SUMMARY_SYSTEM_PROMPT,
    userPrompt,
    jsonMode: true
  })
  if (result) return result

  return null
}

/**
 * 📊 LLM-Powered Report Insights Generator
 * Generates plain-language explanations and AYUSH recommendations for medical reports.
 * @param {Object} documentData - Extracted document data (labs, meds, diagnoses)
 * @returns {Object|null} Report insights or null if API unavailable
 */
export async function generateLlamaReportInsights(documentData) {
  const extraction = documentData.extractedData || documentData || {}

  const userPrompt = JSON.stringify({
    labResults: extraction.investigations || extraction.labResults || [],
    medications: extraction.medications || [],
    diagnoses: extraction.diagnosis || extraction.diagnoses || [],
    symptoms: extraction.symptoms || [],
    allergies: extraction.allergies || [],
  })

  const result = await queryLlama({
    systemPrompt: REPORT_INSIGHTS_SYSTEM_PROMPT,
    userPrompt,
    jsonMode: true
  })
  if (result) return result

  return null
}

/**
 * 🗣️ LLM Voice Transcript Normalizer
 * Converts raw Hinglish/regional voice input into clean clinical English/Hindi text.
 * @param {string} rawTranscript - Raw voice transcript
 * @param {string} lang - Source language ('hi' | 'en' | 'pa')
 * @returns {Object|null} Normalized text or null if API unavailable
 */
export async function normalizeVoiceWithLlama(rawTranscript, lang = 'hi') {
  if (!rawTranscript || rawTranscript.trim().length < 3) return null

  const userPrompt = `Raw Voice Transcript: "${rawTranscript}"\nSource Language: ${lang}`

  const result = await queryLlama({
    systemPrompt: VOICE_NORMALIZATION_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.1,
    jsonMode: true
  })
  if (result) return result

  return null
}

/**
 * 🧪 Quick connectivity test — verifies Groq API key is valid
 * @returns {Object} { isConnected: boolean, model: string, latencyMs: number }
 */
export async function testGroqConnection() {
  const { groqKey, model } = getLlamaConfig()
  if (!groqKey) return { isConnected: false, model: '', latencyMs: 0, error: 'No API key configured' }

  const startTime = Date.now()
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: 'You are a JSON assistant. Always respond in JSON.' },
          { role: 'user', content: 'Return status ok in a JSON object' }
        ],
        temperature: 0,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      })
    })

    const latencyMs = Date.now() - startTime

    if (response.ok) {
      return { isConnected: true, model, latencyMs, error: null }
    }
    return { isConnected: false, model, latencyMs, error: `HTTP ${response.status}` }
  } catch (err) {
    return { isConnected: false, model, latencyMs: Date.now() - startTime, error: err.message }
  }
}
