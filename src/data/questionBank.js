// ============================
// ArogyaDarpan / MediKiosk — Clinical Question Bank & Ontology Engine
// Strictly aligned with SIH Problem Statement (SOCRATES & Dashavidha Pariksha)
// ============================

export const COMPLAINT_OPTIONS = [
  { id: 'chest_pain', label: 'Chest Pain', labelHi: 'सीने में दर्द', icon: '❤️' },
  { id: 'fever', label: 'Fever', labelHi: 'बुखार', icon: '🌡️' },
  { id: 'cough', label: 'Cough', labelHi: 'खांसी', icon: '🫁' },
  { id: 'stomach_pain', label: 'Stomach Pain', labelHi: 'पेट दर्द', icon: '🤢' },
  { id: 'headache', label: 'Headache', labelHi: 'सिरदर्द', icon: '🤕' },
  { id: 'back_pain', label: 'Back Pain', labelHi: 'कमर दर्द', icon: '🦴' },
  { id: 'breathing', label: 'Breathing Difficulty', labelHi: 'सांस लेने में तकलीफ', icon: '💨' },
  { id: 'other', label: 'Other Complaint', labelHi: 'अन्य शिकायत', icon: '➕' },
]

// ============================
// SOCRATES Pain & Symptom Elicitation Framework
// Site, Onset, Character, Radiation, Associations, Time course, Exacerbating/Relieving, Severity
// ============================
export const SOCRATES_QUESTIONS = {
  chest_pain: [
    { id: 'socrates_site', question: 'Site: Where exactly do you feel the pain in your chest?', questionHi: 'स्थान: छाती में दर्द सबसे ज़्यादा कहाँ महसूस होता है?', type: 'single_select', options: [{ value: 'center', label: 'Center of chest (Substernal)' }, { value: 'left', label: 'Left side of chest' }, { value: 'right', label: 'Right side of chest' }, { value: 'diffuse', label: 'Entire chest area' }], category: 'duration' },
    { id: 'socrates_onset', question: 'Onset: When did the pain start and how suddenly?', questionHi: 'शुरुआत: दर्द कब और कितनी अचानक शुरू हुआ?', type: 'single_select', options: [{ value: 'sudden_today', label: 'Sudden onset today' }, { value: 'gradual_1day', label: 'Gradual onset 1 day ago' }, { value: '2_3_days', label: '2-3 days ago' }, { value: 'chronic', label: 'More than 1 week ago' }], category: 'duration' },
    { id: 'socrates_character', question: 'Character: What does the pain feel like?', questionHi: 'प्रकृति: दर्द कैसा महसूस होता है?', type: 'single_select', options: [{ value: 'squeezing', label: 'Heavy / Squeezing pressure (Dull pressure)' }, { value: 'sharp', label: 'Sharp / Stabbing pain' }, { value: 'burning', label: 'Burning sensation' }, { value: 'throbbing', label: 'Throbbing / Pulsating' }], category: 'severity' },
    { id: 'socrates_radiation', question: 'Radiation: Does the pain move to your left arm, shoulder, jaw, neck, or back?', questionHi: 'फैलाव: क्या दर्द बाएँ हाथ, कंधे, जबड़े या पीठ तक जाता है?', type: 'single_select', options: [{ value: 'left_arm', label: 'Left arm / Shoulder' }, { value: 'jaw_neck', label: 'Jaw / Neck' }, { value: 'back', label: 'Back' }, { value: 'none', label: 'No, stays in chest' }], category: 'associated_symptoms' },
    { id: 'socrates_associations', question: 'Associations: Are you experiencing breathlessness, sweating, or nausea?', questionHi: 'संबंधित लक्षण: क्या सांस फूलना, पसीना आना या उल्टी जैसा लग रहा है?', type: 'multi_select', options: [{ value: 'breathlessness', label: 'Shortness of breath (Dyspnea)' }, { value: 'sweating', label: 'Profuse sweating (Diaphoresis)' }, { value: 'nausea', label: 'Nausea / Vomiting' }, { value: 'dizziness', label: 'Dizziness / Lightheadedness' }], category: 'associated_symptoms' },
    { id: 'socrates_timecourse', question: 'Time Course: Is the pain constant or does it come in episodes?', questionHi: 'समय चक्र: दर्द लगातार है या रुक-रुक कर आता है?', type: 'single_select', options: [{ value: 'constant', label: 'Constant / Continuous' }, { value: 'episodic', label: 'Comes in waves / Episodes' }, { value: 'exertional', label: 'Only during walking / activity' }], category: 'duration' },
    { id: 'socrates_exacerbating', question: 'Exacerbating Factors: What makes the pain worse or better?', questionHi: 'बढ़ाने/घटाने वाले कारक: क्या करने से दर्द बढ़ता या घटता है?', type: 'single_select', options: [{ value: 'exertion_worse', label: 'Worse with walking / climbing stairs' }, { value: 'respiration_worse', label: 'Worse with deep breath or coughing' }, { value: 'rest_better', label: 'Better with rest' }, { value: 'antacid_better', label: 'Better with antacids' }], category: 'associated_symptoms' },
    { id: 'socrates_severity', question: 'Severity: On a scale of 1 to 10, how severe is the pain right now?', questionHi: 'गंभीरता: 1 से 10 के पैमाने पर दर्द कितना तेज़ है?', type: 'number', min: 1, max: 10, category: 'severity' },
  ],
  fever: [
    { id: 'f_onset', question: 'Onset: When did the fever start?', questionHi: 'शुरुआत: बुखार कब से है?', type: 'single_select', options: [{ value: 'today', label: 'Today' }, { value: '1_2_days', label: '1-2 days ago' }, { value: '3_5_days', label: '3-5 days ago' }, { value: '1_week', label: 'About 1 week' }, { value: 'more', label: 'More than 1 week' }], category: 'duration' },
    { id: 'f_grade', question: 'Grade: How high has the fever been?', questionHi: 'तापमान: बुखार कितना तेज़ रहा है?', type: 'single_select', options: [{ value: 'low_grade', label: 'Low grade (99-100°F / mild warmth)' }, { value: 'moderate', label: 'Moderate (100-102°F)' }, { value: 'high', label: 'High (102-104°F)' }, { value: 'very_high', label: 'Very High (>104°F / rigors)' }], category: 'severity' },
    { id: 'f_pattern', question: 'Pattern: How does the fever behave throughout the day?', questionHi: 'पैटर्न: बुखार दिनभर कैसा रहता है?', type: 'single_select', options: [{ value: 'continuous', label: 'Continuous / Always present' }, { value: 'intermittent', label: 'Comes and goes (Intermittent)' }, { value: 'evening_rise', label: 'Rises in evening / night' }, { value: 'with_chills', label: 'With shaking chills (Rigors)' }], category: 'associated_symptoms' },
    { id: 'f_associations', question: 'Associations: Do you have any of these with the fever?', questionHi: 'संबंधित लक्षण: बुखार के साथ क्या-क्या हो रहा है?', type: 'multi_select', options: [{ value: 'headache', label: 'Headache' }, { value: 'body_ache', label: 'Body ache / Joint pain' }, { value: 'cough', label: 'Cough / Cold' }, { value: 'rash', label: 'Skin rash' }, { value: 'vomiting', label: 'Vomiting / Loose stools' }, { value: 'burning_urine', label: 'Burning urination' }], category: 'associated_symptoms' },
    { id: 'f_severity', question: 'Severity: On a scale of 1 to 10, how unwell do you feel?', questionHi: 'गंभीरता: 1 से 10 में आप कितना बीमार महसूस करते हैं?', type: 'number', min: 1, max: 10, category: 'severity' },
  ],
  stomach_pain: [
    { id: 'sp_site', question: 'Site: Where exactly is the pain in your abdomen?', questionHi: 'स्थान: पेट में दर्द ठीक कहाँ है?', type: 'single_select', options: [{ value: 'upper_center', label: 'Upper center (Epigastric)' }, { value: 'upper_right', label: 'Upper right (Right Hypochondrium)' }, { value: 'around_navel', label: 'Around navel (Periumbilical)' }, { value: 'lower_right', label: 'Lower right (RIF)' }, { value: 'lower_left', label: 'Lower left (LIF)' }, { value: 'diffuse', label: 'Entire abdomen' }], category: 'duration' },
    { id: 'sp_onset', question: 'Onset: When did the stomach pain start?', questionHi: 'शुरुआत: पेट दर्द कब शुरू हुआ?', type: 'single_select', options: [{ value: 'sudden_today', label: 'Sudden onset today' }, { value: '1_2_days', label: '1-2 days ago' }, { value: '3_5_days', label: '3-5 days ago' }, { value: 'chronic', label: 'Ongoing for weeks/months' }], category: 'duration' },
    { id: 'sp_character', question: 'Character: What does the pain feel like?', questionHi: 'प्रकृति: दर्द कैसा है?', type: 'single_select', options: [{ value: 'burning', label: 'Burning / Acidic' }, { value: 'cramping', label: 'Cramping / Colicky' }, { value: 'dull_ache', label: 'Dull constant ache' }, { value: 'sharp', label: 'Sharp / Stabbing' }], category: 'severity' },
    { id: 'sp_meal_relation', question: 'Meal Relation: How does eating affect the pain?', questionHi: 'खाने से संबंध: खाना खाने से दर्द पर क्या असर पड़ता है?', type: 'single_select', options: [{ value: 'worse_after_meal', label: 'Worse after eating' }, { value: 'better_after_meal', label: 'Better after eating' }, { value: 'worse_empty_stomach', label: 'Worse on empty stomach' }, { value: 'no_relation', label: 'No clear relation to meals' }], category: 'associated_symptoms' },
    { id: 'sp_associations', question: 'Associations: Do you have any of these symptoms?', questionHi: 'संबंधित लक्षण: क्या ये कोई लक्षण हैं?', type: 'multi_select', options: [{ value: 'nausea', label: 'Nausea / Vomiting' }, { value: 'loose_stools', label: 'Loose stools / Diarrhea' }, { value: 'constipation', label: 'Constipation' }, { value: 'blood_stool', label: 'Blood in stool' }, { value: 'bloating', label: 'Bloating / Gas' }], category: 'associated_symptoms' },
    { id: 'sp_severity', question: 'Severity: On a scale of 1 to 10, how severe is the pain?', questionHi: 'गंभीरता: 1 से 10 में दर्द कितना तेज़ है?', type: 'number', min: 1, max: 10, category: 'severity' },
  ],
}

// ============================
// Dashavidha Pariksha — Ayurvedic 10-Fold Assessment Framework
// ============================
export const DASHAVIDHA_PARIKSHA_QUESTIONS = [
  { id: 'prakriti', question: '1. Prakriti (Constitution): What is your primary physiological constitution?', type: 'single_select', options: [{ value: 'vata', label: 'Vata (Air/Space dominant — Light, dry, active)' }, { value: 'pitta', label: 'Pitta (Fire/Water dominant — Sharp, warm, intense)' }, { value: 'kapha', label: 'Kapha (Earth/Water dominant — Heavy, calm, stable)' }, { value: 'dvandvaja', label: 'Dvandvaja (Combination)' }], category: 'ayush' },
  { id: 'vikriti', question: '2. Vikriti (Current Imbalance): Which Dosha appears imbalanced currently?', type: 'single_select', options: [{ value: 'vata_vitiation', label: 'Vata Vriddhi (Pain, stiffness, insomnia, anxiety)' }, { value: 'pitta_vitiation', label: 'Pitta Vriddhi (Burning, fever, inflammation, acidity)' }, { value: 'kapha_vitiation', label: 'Kapha Vriddhi (Heaviness, mucus, lethargy, edema)' }], category: 'ayush' },
  { id: 'sara', question: '3. Sara (Tissue Excellence): Which Dhatu (tissue) shows high quality / resilience?', type: 'single_select', options: [{ value: 'tvak_sara', label: 'Tvak Sara (Skin & Complexion)' }, { value: 'rakta_sara', label: 'Rakta Sara (Blood & Circulation)' }, { value: 'mamsa_sara', label: 'Mamsa Sara (Muscular strength)' }, { value: 'meda_sara', label: 'Meda Sara (Adipose tissue)' }, { value: 'asthi_sara', label: 'Asthi Sara (Bone structure)' }, { value: 'majja_sara', label: 'Majja Sara (Nerve tissue)' }], category: 'ayush' },
  { id: 'samhanana', question: '4. Samhanana (Body Compactness): How is your physical build / density?', type: 'single_select', options: [{ value: 'su_samhata', label: 'Su-Samhata (Compact & well-built)' }, { value: 'madhyama', label: 'Madhyama (Moderate build)' }, { value: 'visama', label: 'Visama (Asymmetric / Frail build)' }], category: 'ayush' },
  { id: 'satmya', question: '5. Satmya (Habituation / Adaptability): What dietary habits agree best with your body?', type: 'single_select', options: [{ value: 'pravara_satmya', label: 'Pravara Satmya (Tolerates all six tastes & foods well)' }, { value: 'madhyama_satmya', label: 'Madhyama Satmya (Moderate tolerance)' }, { value: 'avara_satmya', label: 'Avara Satmya (Sensitive to many foods)' }], category: 'ayush' },
  { id: 'sattva', question: '6. Sattva (Mental Strength): How do you cope with pain & stress?', type: 'single_select', options: [{ value: 'pravara_sattva', label: 'Pravara Sattva (High mental endurance)' }, { value: 'madhyama_sattva', label: 'Madhyama Sattva (Moderate tolerance)' }, { value: 'avara_sattva', label: 'Avara Sattva (Low pain threshold / easily anxious)' }], category: 'ayush' },
  { id: 'ahara_shakti', question: '7. Ahara Shakti (Digestive Capacity): Describe your appetite and digestion (Agni).', type: 'single_select', options: [{ value: 'sama_agni', label: 'Sama Agni (Normal, balanced digestion)' }, { value: 'tikshna_agni', label: 'Tikshna Agni (Intense appetite, hyperacidic)' }, { value: 'manda_agni', label: 'Manda Agni (Sluggish digestion, bloating)' }, { value: 'visham_agni', label: 'Visham Agni (Irregular, fluctuating digestion)' }], category: 'ayush' },
  { id: 'vyayama_shakti', question: '8. Vyayama Shakti (Physical Endurance): How easily do you fatigue?', type: 'single_select', options: [{ value: 'high_endurance', label: 'High physical stamina' }, { value: 'moderate_endurance', label: 'Moderate stamina' }, { value: 'low_endurance', label: 'Tires quickly with light effort' }], category: 'ayush' },
  { id: 'vaya', question: '9. Vaya (Age Stage): Age classification in Ayurvedic clinical terms.', type: 'single_select', options: [{ value: 'bala', label: 'Bala (Childhood / Growth stage)' }, { value: 'madhyama_vaya', label: 'Madhyama (Adult / Maintenance stage)' }, { value: 'vriddha', label: 'Vriddha (Geriatric / Degenerative stage)' }], category: 'ayush' },
  { id: 'koshtha', question: '10. Koshtha (Bowel Habit): How are your bowel movements?', type: 'single_select', options: [{ value: 'krura_koshtha', label: 'Krura Koshtha (Hard stools / prone to constipation)' }, { value: 'mridu_koshtha', label: 'Mridu Koshtha (Soft stools / easily affected by milk)' }, { value: 'madhyama_koshtha', label: 'Madhyama Koshtha (Regular bowel habits)' }], category: 'ayush' },
]

export const COMMON_HISTORY_QUESTIONS = [
  { id: 'past_medical', question: 'Past Medical History: Do you have diabetes, hypertension, heart disease, or asthma?', type: 'multi_select', options: [{ value: 'diabetes', label: 'Diabetes Mellitus' }, { value: 'hypertension', label: 'High Blood Pressure' }, { value: 'heart_disease', label: 'Heart Disease' }, { value: 'asthma', label: 'Asthma / COPD' }, { value: 'thyroid', label: 'Thyroid Disorder' }, { value: 'none', label: 'None' }], category: 'past_history' },
  { id: 'current_medications', question: 'Current Medications: Name all medicines you take regularly with dosage if known.', type: 'text', placeholder: 'e.g. Metformin 500mg, Amlodipine 5mg, or "None"', category: 'medications' },
  { id: 'allergies', question: 'Drug & Allergy History: Are you allergic to any medicines (e.g., Penicillin, Sulfa)?', type: 'text', placeholder: 'Name allergic drug or say "No known allergies"', category: 'allergies' },
  { id: 'family_history', question: 'Family History: Does anyone in your family have diabetes, heart disease, hypertension, cancer, or stroke?', questionHi: 'पारिवारिक इतिहास: क्या आपके परिवार में किसी को मधुमेह, हृदय रोग, उच्च रक्तचाप, कैंसर या स्ट्रोक है?', type: 'multi_select', options: [{ value: 'diabetes', label: 'Diabetes (Father/Mother/Sibling)' }, { value: 'heart_disease', label: 'Heart Disease / Heart Attack' }, { value: 'hypertension', label: 'Hypertension (High BP)' }, { value: 'cancer', label: 'Cancer' }, { value: 'stroke', label: 'Stroke / Brain Hemorrhage' }, { value: 'none', label: 'No significant family history' }], category: 'past_history' },
  { id: 'smoking_status', question: 'Smoking: Do you smoke or have you smoked in the past?', questionHi: 'धूम्रपान: क्या आप धूम्रपान करते हैं या पहले करते थे?', type: 'single_select', options: [{ value: 'never', label: 'Never smoked' }, { value: 'current', label: 'Currently smoking' }, { value: 'quit_recent', label: 'Quit within last 2 years' }, { value: 'quit_long', label: 'Quit more than 2 years ago' }], category: 'past_history' },
  { id: 'alcohol_intake', question: 'Alcohol: Do you consume alcohol?', questionHi: 'शराब: क्या आप शराब का सेवन करते हैं?', type: 'single_select', options: [{ value: 'never', label: 'Never' }, { value: 'occasional', label: 'Occasionally (social)' }, { value: 'regular', label: 'Regularly (weekly/daily)' }, { value: 'quit', label: 'Quit' }], category: 'past_history' },
  { id: 'ros_systems', question: 'Review of Systems (ROS): Are you experiencing fever, skin rash, joint pain, or vision changes?', type: 'multi_select', options: [{ value: 'ros_fever', label: 'Fever / Chills' }, { value: 'ros_rash', label: 'Skin Rash' }, { value: 'ros_joint', label: 'Joint Stiffness' }, { value: 'ros_none', label: 'None of these' }], category: 'associated_symptoms' },
]

export function getQuestionSequence(complaintId) {
  const socrates = SOCRATES_QUESTIONS[complaintId] || [
    { id: 'generic_onset', question: 'When did your symptoms start?', type: 'single_select', options: [{ value: 'today', label: 'Today' }, { value: '1_day', label: 'Yesterday' }, { value: '2_3_days', label: '2-3 days ago' }, { value: 'more', label: 'More than a week ago' }], category: 'duration' },
    { id: 'generic_severity', question: 'On a scale of 1 to 10, how severe are your symptoms?', type: 'number', min: 1, max: 10, category: 'severity' },
  ]

  return [
    { id: 'chief_complaint', question: 'What brings you to the hospital today?', type: 'complaint_select', category: 'chief_complaint', required: true },
    ...socrates,
    ...COMMON_HISTORY_QUESTIONS,
  ]
}

export const COMPLETENESS_CATEGORIES = [
  { id: 'chief_complaint', label: 'Chief Complaint', labelHi: 'मुख्य शिकायत' },
  { id: 'duration', label: 'Duration / Onset', labelHi: 'अवधि' },
  { id: 'severity', label: 'Severity (1-10)', labelHi: 'गंभीरता' },
  { id: 'associated_symptoms', label: 'Associated Symptoms (SOCRATES)', labelHi: 'संबंधित लक्षण' },
  { id: 'past_history', label: 'Past Medical / Surgical', labelHi: 'पूर्व इतिहास' },
  { id: 'medications', label: 'Current Medications', labelHi: 'दवाइयाँ' },
  { id: 'allergies', label: 'Drug Allergies', labelHi: 'एलर्जी' },
  { id: 'ayush', label: 'Dashavidha Pariksha (AYUSH)', labelHi: 'दशविध परीक्षा' },
]
