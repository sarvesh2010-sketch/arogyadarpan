import { extractClinicalNLP } from './clinicalNlpEngine.js'
import {
  processVoiceIntakeWithLlama,
  processMultiTurnVoiceIntake,
  normalizeVoiceWithLlama
} from './llamaService.js'

/**
 * Parses free natural language conversational speech and maps to interview answers
 * Example: "Pet mein pain hai aur kal se vomiting bhi ho rahi hai."
 * -> Complaint: Abdominal pain, Duration: 1 day, Associated: Vomiting
 * @param {string} userText - Spoken or typed natural language
 * @param {string} lang - 'hi' | 'en' | regional
 */
export function parseConversationalIntake(userText = '', lang = 'en') {
  const nlp = extractClinicalNLP(userText)

  // 1. Identify primary complaint
  let primaryComplaint = null
  if (nlp.symptoms.length > 0) {
    const firstSym = nlp.symptoms[0]
    // Map to system complaint key
    const mapping = {
      chest_pain: 'chest_pain',
      breathlessness: 'breathing',
      abdominal_pain: 'stomach_pain',
      fever: 'fever',
      cough: 'cough',
      headache: 'headache',
      dizziness: 'dizziness',
      vomiting: 'vomiting',
      joint_pain: 'back_pain',
      dysuria: 'burning_urine',
      fatigue: 'other',
    }
    primaryComplaint = {
      id: mapping[firstSym.id] || firstSym.id,
      label: firstSym.label,
      category: firstSym.category,
    }
  }

  // 2. Identify associated symptoms (symptoms besides primary complaint)
  const associatedSymptoms = nlp.symptoms
    .slice(primaryComplaint ? 1 : 0)
    .map(s => ({ id: s.id, label: s.label }))

  // If primary complaint was abdominal pain and vomiting was detected, vomiting is marked associated
  if (primaryComplaint?.id === 'stomach_pain' && nlp.symptoms.some(s => s.id === 'vomiting')) {
    if (!associatedSymptoms.some(s => s.id === 'vomiting')) {
      associatedSymptoms.push({ id: 'vomiting', label: 'Vomiting' })
    }
  }

  // 3. Generate conversational confirmation & next question
  const conversationalReply = generateConversationalReply({
    complaint: primaryComplaint?.label || 'your symptoms',
    duration: nlp.temporal || 'recently',
    associated: associatedSymptoms.map(s => s.label).join(', '),
    lang,
  })

  return {
    rawTranscript: userText,
    primaryComplaint,
    duration: nlp.temporal,
    associatedSymptoms,
    diseases: nlp.diseases,
    medications: nlp.medications,
    severity: nlp.severity,
    confidence: nlp.confidence,
    conversationalReply,
  }
}

/**
 * Async Llama Voice Parser & Dynamic Follow-Up Generator
 * Analyzes spoken voice input using Llama 3.3 and generates adaptive follow-up questions
 */
export async function parseConversationalIntakeWithLlama(userText = '', lang = 'hi', currentHistory = []) {
  const llamaResult = await processVoiceIntakeWithLlama(userText, lang, currentHistory)
  if (llamaResult) {
    return {
      rawTranscript: userText,
      primaryComplaint: {
        id: (llamaResult.extractedEntities?.chiefComplaint || 'symptoms').toLowerCase().replace(/\s+/g, '_'),
        label: llamaResult.extractedEntities?.chiefComplaint || 'Reported Symptoms',
      },
      duration: llamaResult.extractedEntities?.duration || 'recently',
      associatedSymptoms: (llamaResult.extractedEntities?.associatedFactors || []).map(a => ({ id: a.toLowerCase().replace(/\s+/g, '_'), label: a })),
      symptoms: llamaResult.extractedEntities?.symptoms || [],
      severity: llamaResult.extractedEntities?.severityScore || 5,
      redFlags: llamaResult.redFlags || [],
      esiLevel: llamaResult.esiLevel || 3,
      followUpQuestions: llamaResult.followUpQuestions || [],
      conversationalReply: lang === 'hi'
        ? (llamaResult.conversationalReplyHi || `आपकी बात समझ आ गई। मैं कुछ ज़रूरी सवाल पूछूंगा।`)
        : (llamaResult.conversationalReplyEn || `Understood. I will ask a few targeted questions.`),
      isLlamaGenerated: true
    }
  }

  // Fallback to local rule engine
  return parseConversationalIntake(userText, lang)
}

/**
 * 🔄 Multi-Turn Conversational Intake Processor
 * Manages a full multi-turn conversation with the patient via Groq LLM.
 * Tracks SOCRATES coverage, entity accumulation, and adaptive follow-ups.
 * 
 * @param {Array} conversationHistory - Full conversation [{role, content}]
 * @param {string} lang - Active language
 * @returns {Object} Complete intake state with entities, follow-ups, and completeness
 */
export async function processMultiTurnConversation(conversationHistory = [], lang = 'hi') {
  const llamaResult = await processMultiTurnVoiceIntake(conversationHistory, lang)

  if (llamaResult) {
    return {
      extractedEntities: llamaResult.extractedEntities || {},
      primaryComplaint: {
        id: (llamaResult.extractedEntities?.chiefComplaint || 'symptoms').toLowerCase().replace(/\s+/g, '_'),
        label: llamaResult.extractedEntities?.chiefComplaint || 'Reported Symptoms',
      },
      duration: llamaResult.extractedEntities?.duration || null,
      associatedSymptoms: (llamaResult.extractedEntities?.associatedFactors || []).map(a => ({
        id: a.toLowerCase().replace(/\s+/g, '_'),
        label: a
      })),
      symptoms: llamaResult.extractedEntities?.symptoms || [],
      severity: llamaResult.extractedEntities?.severityScore || 5,
      redFlags: llamaResult.redFlags || [],
      esiLevel: llamaResult.esiLevel || 3,
      socratesCoverage: llamaResult.socratesCoverage || {},
      isIntakeComplete: llamaResult.isIntakeComplete || false,
      followUpQuestions: llamaResult.followUpQuestions || [],
      conversationalReply: lang === 'hi'
        ? (llamaResult.conversationalReplyHi || `मैं समझ गया। कृपया और बताइए।`)
        : (llamaResult.conversationalReplyEn || `Understood. Please tell me more.`),
      isLlamaGenerated: true
    }
  }

  // Fallback — extract from the last user message using local NLP
  const lastUserMsg = [...conversationHistory].reverse().find(m => m.role === 'user')
  if (lastUserMsg) {
    return {
      ...parseConversationalIntake(lastUserMsg.content, lang),
      socratesCoverage: {},
      isIntakeComplete: false,
      followUpQuestions: [],
      isLlamaGenerated: false
    }
  }

  return null
}

/**
 * Build a conversation message object for the multi-turn history
 * @param {string} role - 'user' | 'assistant'
 * @param {string} content - Message content
 * @returns {Object} Conversation message
 */
export function buildConversationMessage(role, content) {
  return {
    role,
    content,
    timestamp: new Date().toISOString()
  }
}

/**
 * Merge entities extracted from multiple turns into a unified entity set
 * @param {Object} previousEntities - Entities from previous turns
 * @param {Object} newEntities - Entities from current turn
 * @returns {Object} Merged entities
 */
export function mergeEntitiesFromMultipleTurns(previousEntities = {}, newEntities = {}) {
  return {
    chiefComplaint: newEntities.chiefComplaint || previousEntities.chiefComplaint || null,
    symptoms: [...new Set([
      ...(previousEntities.symptoms || []),
      ...(newEntities.symptoms || [])
    ])],
    duration: newEntities.duration || previousEntities.duration || null,
    severityScore: newEntities.severityScore || previousEntities.severityScore || null,
    associatedFactors: [...new Set([
      ...(previousEntities.associatedFactors || []),
      ...(newEntities.associatedFactors || [])
    ])],
    site: newEntities.site || previousEntities.site || null,
    character: newEntities.character || previousEntities.character || null,
    radiation: newEntities.radiation || previousEntities.radiation || null,
    aggravatingFactors: [...new Set([
      ...(previousEntities.aggravatingFactors || []),
      ...(newEntities.aggravatingFactors || [])
    ])],
    relievingFactors: [...new Set([
      ...(previousEntities.relievingFactors || []),
      ...(newEntities.relievingFactors || [])
    ])],
  }
}

/**
 * 🗣️ Normalize raw voice transcript via LLM before clinical parsing
 * Converts Hinglish/regional language input to clean clinical English
 * @param {string} rawTranscript - Raw voice transcript
 * @param {string} lang - Source language
 * @returns {Object} Normalized result or original text
 */
export async function normalizeAndParse(rawTranscript, lang = 'hi') {
  const normalized = await normalizeVoiceWithLlama(rawTranscript, lang)
  if (normalized && normalized.normalizedTextEn) {
    // Parse the normalized English text for better entity extraction
    const parsed = parseConversationalIntake(normalized.normalizedTextEn, 'en')
    return {
      ...parsed,
      normalizedText: normalized.normalizedTextEn,
      normalizedTextHi: normalized.normalizedTextHi,
      medicalTermsFound: normalized.medicalTermsFound || [],
      normalizationConfidence: normalized.confidence || 0.9,
      isLlamaNormalized: true
    }
  }

  // Fallback to direct parsing
  return parseConversationalIntake(rawTranscript, lang)
}

/**
 * Generate natural clinical conversational response in patient's language
 */
export function generateConversationalReply({ complaint, duration, associated, lang = 'en' }) {
  const isHindi = lang === 'hi'

  if (isHindi) {
    const assocText = associated ? ` और साथ में ${associated} की परेशानी है` : ''
    const durText = duration ? `${duration} से ` : ''
    return `समझ गया: आपको ${durText}${complaint} हो रहा है${assocText}। मैं इसके बारे में कुछ ज़रूरी सवाल पूछूँगा ताकि डॉक्टर आपकी सही जाँच कर सकें।`
  }

  // English default
  const assocText = associated ? ` accompanied by ${associated}` : ''
  const durText = duration ? ` for ${duration}` : ''
  return `Understood: you have been experiencing ${complaint}${durText}${assocText}. I will ask you a few targeted questions to prepare your clinical summary for the doctor.`
}
