// ============================
// ArogyaDarpan — Clinical Drug Interaction & Allergy Contraindication Matrix
// Analyzes active medications, newly prescribed drugs, documented patient allergies, and co-morbidities
// ============================

export const KNOWN_DRUG_INTERACTIONS = [
  {
    drug1: 'Aspirin',
    drug2: 'Metformin',
    severity: 'moderate',
    title: 'Aspirin + Metformin Interaction',
    detail: 'Aspirin may slightly increase Metformin blood levels and risk of hypoglycemia. Monitor blood glucose closely.',
  },
  {
    drug1: 'Amlodipine',
    drug2: 'Atorvastatin',
    severity: 'moderate',
    title: 'Amlodipine + Atorvastatin Interaction',
    detail: 'Co-administration may increase plasma concentration of Atorvastatin. Recommended Atorvastatin max dose 20mg.',
  },
  {
    drug1: 'Amoxicillin',
    allergy: 'Penicillin',
    severity: 'high',
    title: 'CONTRAINDICATION: Amoxicillin & Penicillin Allergy',
    detail: 'Patient has a documented Penicillin allergy. Amoxicillin is a beta-lactam antibiotic and carries high risk of severe anaphylaxis.',
  },
  {
    drug1: 'Metformin',
    lifestyle: 'Alcohol',
    severity: 'high',
    title: 'Lactic Acidosis Risk: Metformin & Alcohol',
    detail: 'Alcohol potentiates the effect of Metformin on lactate metabolism. Concurrent alcohol use increases risk of lactic acidosis.',
  },
  {
    drug1: 'Aspirin/NSAID',
    condition: 'Hypertension',
    severity: 'moderate',
    title: 'NSAID + Hypertension Caution',
    detail: 'Regular NSAID use can reduce the effectiveness of antihypertensive medications and cause fluid retention.',
  },
]

/**
 * Check drug list, allergies, and conditions for clinical interactions
 * @param {Array<string>} medications - List of medication names
 * @param {Array<string>} allergies - List of allergy names
 * @param {Object} options - Additional context (conditions, lifestyle)
 * @returns {Array<Object>} List of clinical safety warnings
 */
export function checkDrugInteractions(medications = [], allergies = [], options = {}) {
  const warnings = []
  const medNames = medications.map(m => (typeof m === 'string' ? m : m.name || '').toLowerCase())
  const allergyNames = allergies.map(a => (typeof a === 'string' ? a : a.name || '').toLowerCase())
  const conditions = (options.conditions || []).map(c => String(c).toLowerCase())
  const habits = (options.habits || []).map(h => String(h).toLowerCase())

  // 1. Check Allergy Contraindications
  if (allergyNames.some(a => a.includes('penicillin'))) {
    if (medNames.some(m => m.includes('amoxicillin') || m.includes('penicillin') || m.includes('mox'))) {
      warnings.push({
        id: 'warn-allergy-penicillin',
        severity: 'high',
        type: 'contraindication',
        title: 'CRITICAL CONTRAINDICATION: Beta-Lactam Antibiotic',
        message: 'Amoxicillin prescribed to patient with documented Penicillin allergy.',
        recommendation: 'Substitute with Macrolide (e.g. Azithromycin) or Fluoroquinolone.',
      })
    }
  }

  // 2. Check Drug-Drug Interactions
  for (let i = 0; i < medNames.length; i++) {
    for (let j = i + 1; j < medNames.length; j++) {
      const m1 = medNames[i]
      const m2 = medNames[j]

      // Aspirin + Metformin
      if ((m1.includes('aspirin') && m2.includes('metformin')) || (m2.includes('aspirin') && m1.includes('metformin'))) {
        warnings.push({
          id: 'warn-ddi-aspirin-metformin',
          severity: 'medium',
          type: 'drug_interaction',
          title: 'Drug Interaction: Aspirin & Metformin',
          message: 'May increase hypoglycemia risk. Glucose monitoring advised.',
          recommendation: 'Monitor fasting and post-prandial blood glucose levels.',
        })
      }

      // Amlodipine + Atorvastatin
      if ((m1.includes('amlodipine') && m2.includes('atorvastatin')) || (m2.includes('amlodipine') && m1.includes('atorvastatin'))) {
        warnings.push({
          id: 'warn-ddi-amlodipine-atorvastatin',
          severity: 'medium',
          type: 'drug_interaction',
          title: 'Drug Interaction: Amlodipine & Atorvastatin',
          message: 'Amlodipine increases Atorvastatin systemic exposure. Limit Atorvastatin dose to ≤20mg daily.',
          recommendation: 'Monitor for muscle pain/myopathy and adjust statin dose if needed.',
        })
      }
    }
  }

  // 3. Drug-Lifestyle Warnings (Metformin + Alcohol)
  if (medNames.some(m => m.includes('metformin'))) {
    if (habits.some(h => h.includes('alcohol') || h.includes('occasional') || h.includes('regular'))) {
      warnings.push({
        id: 'warn-lifestyle-metformin-alcohol',
        severity: 'high',
        type: 'lifestyle_warning',
        title: 'Safety Warning: Metformin & Alcohol Consumption',
        message: 'Patient consumes alcohol while taking Metformin. Elevated risk of lactic acidosis and hypoglycemia.',
        recommendation: 'Advise patient to avoid heavy alcohol intake while on biguanide therapy.',
      })
    }
  }

  // 4. Drug-Disease Warnings (NSAIDs + Hypertension)
  if (medNames.some(m => m.includes('aspirin') || m.includes('ibuprofen') || m.includes('diclofenac'))) {
    if (conditions.some(c => c.includes('hypertension') || c.includes('bp') || c.includes('high blood pressure'))) {
      warnings.push({
        id: 'warn-drug-disease-nsaid-htn',
        severity: 'medium',
        type: 'drug_disease',
        title: 'Caution: NSAIDs in Hypertensive Patient',
        message: 'NSAID use can attenuate antihypertensive drug response and promote renal sodium retention.',
        recommendation: 'Use lowest effective dose for shortest duration; check blood pressure regularly.',
      })
    }
  }

  return warnings
}
