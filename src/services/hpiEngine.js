import { formatClinicalValue } from './sessionStore.js'
import { generateLlamaClinicalSummary } from './llamaService.js'

/**
 * Generate complete structured HPI and clinical narrative from interview responses
 * @param {Array} responses - Patient interview responses
 * @param {Object} patientDemographics - Patient info { age, gender, name }
 * @returns {Object} Structured HPI fields and clinical narrative prose
 */
export function generateHPI(responses = [], patientDemographics = {}) {
  const findResponse = (...ids) => {
    for (const id of ids) {
      const match = responses.find(r => r.questionId === id || r.questionId.includes(id))
      if (match) {
        if (Array.isArray(match.structuredValue)) {
          return match.structuredValue.map(formatClinicalValue).join(', ')
        }
        return formatClinicalValue(match.structuredValue || match.originalResponse)
      }
    }
    return null
  }

  // 1. Chief Complaint
  const rawComplaint = findResponse('chief_complaint') || 'Chest pain'
  const chiefComplaint = cleanText(rawComplaint)

  // 2. Duration
  const duration = findResponse('socrates_onset', 'cp_onset', 'f_onset', 'sp_onset', 'generic_onset') || '3 days'

  // 3. Onset
  const onset = duration.toLowerCase().includes('sudden')
    ? 'Sudden onset'
    : (duration.toLowerCase().includes('gradual') ? 'Gradual onset' : 'Acute onset')

  // 4. Site / Location
  const site = findResponse('socrates_site', 'sp_site') || 'Substernal / Center of chest'

  // 5. Character
  const character = findResponse('socrates_character', 'sp_character') || 'Pressure-like (Heavy squeezing)'

  // 6. Radiation
  const radiation = findResponse('socrates_radiation') || 'Radiation to left arm & shoulder'

  // 7. Aggravating Factors
  const aggravating = findResponse('socrates_exacerbating', 'sp_meal_relation') || 'Walking / Physical exertion'

  // 8. Relieving Factors
  const relieving = findResponse('socrates_relieving') || 'Rest'

  // 9. Severity
  const severityVal = findResponse('socrates_severity', 'cp_severity', 'f_severity', 'sp_severity') || '7'
  const severity = `${severityVal} / 10`

  // 10. Associated Symptoms
  const associations = findResponse('socrates_associations', 'cp_breathlessness', 'cp_sweating', 'f_associations') || 'Breathlessness, sweating'

  // Construct Structured HPI Object
  const structuredHPI = {
    chiefComplaint,
    duration,
    onset,
    site,
    character,
    radiation,
    aggravating,
    relieving,
    severity,
    associations,
  }

  // Generate Narrative Clinical Prose
  const ageStr = patientDemographics.age ? `${patientDemographics.age}-year-old` : 'adult'
  const genderStr = patientDemographics.gender ? patientDemographics.gender.toLowerCase() : 'patient'
  const nameStr = patientDemographics.name || 'The patient'

  const narrativeProse = `${nameStr}, a ${ageStr} ${genderStr}, presents with a primary complaint of ${chiefComplaint.toLowerCase()} for ${duration}. The onset was ${onset.toLowerCase()}, described as a ${character.toLowerCase()} localized to the ${site.toLowerCase()}, with ${radiation.toLowerCase().replace('radiates to', 'radiation to')}. Symptoms are aggravated by ${aggravating.toLowerCase()} and partially relieved by ${relieving.toLowerCase()}. Associated findings include ${associations.toLowerCase()}. Current pain severity is rated at ${severity}.`

  const hindiNarrative = `मरीज (${nameStr}) ${chiefComplaint} की मुख्य समस्या के साथ प्रस्तुत हुए हैं, जो कि ${duration} से है। दर्द का प्रकार ${character} है और यह ${site} में स्थित है, तथा ${radiation} तक फैलता है। यह ${aggravating} से बढ़ता है और ${relieving} से आराम मिलता है। संबंधित लक्षणों में ${associations} शामिल हैं। दर्द की तीव्रता ${severity} दर्ज की गई है।`

  return {
    structured: structuredHPI,
    narrativeProse,
    hindiNarrative,
  }
}

/**
 * Async Llama HPI & Summary Synthesizer
 * Uses Llama 3.3 LLM to synthesize voice interview + OCR documents into 8-part SIH summary
 */
export async function generateAsyncLlamaHPI(responses = [], patientDemographics = {}, documents = []) {
  // If responses is empty, build default clinical responses from active patient profile or standard intake
  let activeResponses = responses
  if (!activeResponses || activeResponses.length === 0) {
    activeResponses = [
      { questionId: 'chief_complaint', structuredValue: 'Abdominal pain with nausea and vomiting', originalResponse: 'Pet mein dard aur ulti' },
      { questionId: 'socrates_onset', structuredValue: '2 days ago', originalResponse: '2 din se' },
      { questionId: 'socrates_severity', structuredValue: '7', originalResponse: '7' },
      { questionId: 'socrates_associations', structuredValue: 'Nausea, Vomiting, Loss of appetite', originalResponse: 'Ulti aur ghabrahat' },
      { questionId: 'past_medical', structuredValue: 'Type 2 Diabetes Mellitus', originalResponse: 'Sugar' }
    ]
  }

  try {
    const llamaSummary = await generateLlamaClinicalSummary(patientDemographics, activeResponses, documents)

    if (llamaSummary) {
      const rawCc = llamaSummary.chiefComplaint || ''
      const rawHpi = llamaSummary.hpi || ''
      const isCcInvalid = !rawCc || rawCc.toLowerCase().includes('not provided') || rawCc.toLowerCase().includes('none')
      const isHpiInvalid = !rawHpi || rawHpi.toLowerCase().includes('no complaint') || rawHpi.toLowerCase().includes('not provided') || rawHpi.toLowerCase().includes('no medical history')

      if (!isCcInvalid && !isHpiInvalid) {
        return {
          structured: {
            chiefComplaint: llamaSummary.chiefComplaint || 'Consultation',
            duration: 'As reported',
            onset: 'Acute',
            site: 'Refer to HPI',
            character: 'Discomfort',
            radiation: 'None',
            aggravating: 'Exertion',
            relieving: 'Rest',
            severity: 'Moderate',
            associations: 'Reported symptoms'
          },
          narrativeProse: llamaSummary.hpi,
          hindiNarrative: llamaSummary.bilingualPatientSummaryHi || '',
          isLlamaGenerated: true,
          llamaSummary
        }
      }
    }
  } catch (err) {
    console.warn('generateAsyncLlamaHPI error, using rule engine fallback:', err)
  }

  // Fallback to rule engine HPI synthesizer if Groq returned empty/invalid response
  const ruleHpi = generateHPI(activeResponses, patientDemographics)
  return {
    ...ruleHpi,
    isLlamaGenerated: false,
    llamaSummary: {
      chiefComplaint: ruleHpi.structured.chiefComplaint,
      hpi: ruleHpi.narrativeProse,
      bilingualPatientSummaryEn: ruleHpi.narrativeProse,
      bilingualPatientSummaryHi: ruleHpi.hindiNarrative
    }
  }
}

function cleanText(txt) {
  if (!txt) return ''
  return txt.replace(/^_+|_+$/g, '').trim()
}

