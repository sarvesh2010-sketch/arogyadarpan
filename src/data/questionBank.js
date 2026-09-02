// ============================
// ArogyaDarpan / MediKiosk — Clinical Question Bank & Ontology Engine
// Strictly aligned with SIH Problem Statement (SOCRATES & Dashavidha Pariksha)
// Multilingual support across Indian languages
// ============================

export const COMPLAINT_OPTIONS = [
  {
    id: 'chest_pain',
    label: 'Chest Pain',
    icon: '❤️',
    labels: {
      hi: 'सीने में दर्द',
      bn: 'বুকে ব্যথা',
      ta: 'நெஞ்சு வலி',
      te: 'ఛాతీ నొప్పి',
      mr: 'छातीत दुखणे',
      gu: 'છાતીમાં દુખાવો',
      kn: 'ಎದೆ ನೋವು',
      pa: 'ਛਾਤੀ ਵਿੱਚ ਦਰਦ',
      ml: 'നെഞ്ചുവേദന',
    }
  },
  {
    id: 'fever',
    label: 'Fever',
    icon: '🌡️',
    labels: {
      hi: 'बुखार',
      bn: 'জ্বর',
      ta: 'காய்ச்சல்',
      te: 'జ్వరం',
      mr: 'ताप',
      gu: 'તાવ',
      kn: 'ಜ್ವರ',
      pa: 'ਬੁਖਾਰ',
      ml: 'പനി',
    }
  },
  {
    id: 'cough',
    label: 'Cough',
    icon: '🫁',
    labels: {
      hi: 'खांसी',
      bn: 'কাশি',
      ta: 'இருமல்',
      te: 'దగ్గు',
      mr: 'खोकला',
      gu: 'ખાંસી',
      kn: 'ಕೆಮ್ಮು',
      pa: 'ਖੰਘ',
      ml: 'ചുമ',
    }
  },
  {
    id: 'stomach_pain',
    label: 'Stomach Pain',
    icon: '🤢',
    labels: {
      hi: 'पेट दर्द',
      bn: 'পেটে ব্যথা',
      ta: 'வயிற்று வலி',
      te: 'కడుపు నొప్పి',
      mr: 'पोटदुखी',
      gu: 'પેટનો દુખાવો',
      kn: 'ಹೊಟ್ಟೆ ನೋವು',
      pa: 'ਢਿੱਡ ਪੀੜ',
      ml: 'വയറുവേദന',
    }
  },
  {
    id: 'headache',
    label: 'Headache',
    icon: '🤕',
    labels: {
      hi: 'सिरदर्द',
      bn: 'মাথাব্যথা',
      ta: 'தலைவலி',
      te: 'తలనొప్పి',
      mr: 'डोकेदुखी',
      gu: 'માથાનો દુખાવો',
      kn: 'ತಲೆನೋವು',
      pa: 'ਸਿਰਦਰਦ',
      ml: 'തലവേദന',
    }
  },
  {
    id: 'back_pain',
    label: 'Back Pain',
    icon: '🦴',
    labels: {
      hi: 'कमर दर्द',
      bn: 'পিঠে ব্যথা',
      ta: 'முதுகு வலி',
      te: 'నడుము నొప్పి',
      mr: 'पाठदुखी',
      gu: 'કમરનો દુખાવો',
      kn: 'ಬೆನ್ನು ನೋವು',
      pa: 'ਕਮਰ ਦਰਦ',
      ml: 'നടുവേദന',
    }
  },
  {
    id: 'breathing',
    label: 'Breathing Difficulty',
    icon: '💨',
    labels: {
      hi: 'सांस लेने में तकलीफ',
      bn: 'শ্বাসকষ্ট',
      ta: 'மூச்சுத் திணறல்',
      te: 'శ్వాస తీసుకోవడంలో ఇబ్బంది',
      mr: 'श्वास घेण्यास त्रास',
      gu: 'શ્વાસ લેવામાં તકલીફ',
      kn: 'ಉಸಿರಾಟದ ತೊಂದರೆ',
      pa: 'ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼',
      ml: 'ശ്വാസതടസ്സം',
    }
  },
  {
    id: 'other',
    label: 'Other Complaint',
    icon: '➕',
    labels: {
      hi: 'अन्य शिकायत',
      bn: 'অন্যান্য সমস্যা',
      ta: 'மற்ற பிரச்சனைகள்',
      te: 'ఇతర సమస్య',
      mr: 'इतर तक्रार',
      gu: 'અન્ય ફરિયાદ',
      kn: 'ಇತರ ಸಮಸ್ಯೆ',
      pa: 'ਹੋਰ ਸ਼ਿਕਾਇਤ',
      ml: 'മറ്റ് പരാതികൾ',
    }
  },
]

// ============================
// SOCRATES Pain & Symptom Elicitation Framework
// Site, Onset, Character, Radiation, Associations, Time course, Exacerbating/Relieving, Severity
// ============================
export const SOCRATES_QUESTIONS = {
  chest_pain: [
    {
      id: 'socrates_site',
      question: 'Site: Where exactly do you feel the pain in your chest?',
      questionHi: 'स्थान: छाती में दर्द सबसे ज़्यादा कहाँ महसूस होता है?',
      questions: {
        hi: 'स्थान: छाती में दर्द सबसे ज़्यादा कहाँ महसूस होता है?',
        bn: 'স্থান: বুকে ঠিক কোন জায়গায় ব্যথা অনুভূত হচ্ছে?',
        ta: 'இடம்: உங்கள் நெஞ்சில் வலி சரியாக எங்கே இருக்கிறது?',
        te: 'స్థానం: మీ ఛాతీలో ఖచ్చితంగా ఎక్కడ నొప్పి ఉంది?',
        mr: 'स्थान: छातीत नेमके कुठे दुखत आहे?',
        gu: 'સ્થાન: છાતીમાં બરાબર ક્યાં દુખાવો થાય છે?',
        kn: 'ಸ್ಥಳ: ಎದೆಯಲ್ಲಿ ನಿಖರವಾಗಿ ಎಲ್ಲಿ ನೋವು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ?',
        pa: 'ਸਥਾਨ: ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਠੀਕ ਕਿੱਥੇ ਮਹਿਸੂਸ ਹੁੰਦਾ ਹੈ?',
        ml: 'സ്ഥലം: നെഞ്ചിൽ കൃത്യമായി എവിടെയാണ് വേദന അനുഭവപ്പെടുന്നത്?',
      },
      type: 'single_select',
      options: [
        { value: 'center', label: 'Center of chest (Substernal)', labelHi: 'छाती के बीच में' },
        { value: 'left', label: 'Left side of chest', labelHi: 'बाईं ओर' },
        { value: 'right', label: 'Right side of chest', labelHi: 'दाईं ओर' },
        { value: 'diffuse', label: 'Entire chest area', labelHi: 'पूरी छाती में' }
      ],
      category: 'duration'
    },
    {
      id: 'socrates_onset',
      question: 'Onset: When did the pain start and how suddenly?',
      questionHi: 'शुरुआत: दर्द कब और कितनी अचानक शुरू हुआ?',
      questions: {
        hi: 'शुरुआत: दर्द कब और कितनी अचानक शुरू हुआ?',
        bn: 'সূচনা: ব্যথা কখন এবং কতটা হঠাৎ শুরু হয়েছিল?',
        ta: 'தொடக்க நேரம்: வலி எப்போது, எப்படி திடீரென தொடங்கியது?',
        te: 'ప్రారంభం: నొప్పి ఎప్పుడు మరియు ఎంత ఆకస్మికంగా ప్రారంభమైంది?',
        mr: 'सुरुवात: वेदना कधी आणि कशी सुरू झाली?',
        gu: 'શરૂઆત: દુખાવો ક્યારે અને કેટલી અચાનક શરૂ થયો?',
        kn: 'ಪ್ರಾರಂಭ: ನೋವು ಯಾವಾಗ ಮತ್ತು ಎಷ್ಟು ಹಠಾತ್ತನೆ ಪ್ರಾರಂಭವಾಯಿತು?',
        pa: 'ਸ਼ੁਰੂਆਤ: ਦਰਦ ਕਦੋਂ ਅਤੇ ਕਿੰਨੀ ਅਚਾਨਕ ਸ਼ੁਰੂ ਹੋਇਆ?',
        ml: 'തുടക്കം: വേദന എപ്പോഴാണ്, എത്ര പെട്ടെന്നാണ് തുടങ്ങിയത്?',
      },
      type: 'single_select',
      options: [
        { value: 'sudden_today', label: 'Sudden onset today', labelHi: 'आज अचानक' },
        { value: 'gradual_1day', label: 'Gradual onset 1 day ago', labelHi: '1 दिन पहले धीरे-धीरे' },
        { value: '2_3_days', label: '2-3 days ago', labelHi: '2-3 दिन पहले' },
        { value: 'chronic', label: 'More than 1 week ago', labelHi: '1 सप्ताह से अधिक' }
      ],
      category: 'duration'
    },
    {
      id: 'socrates_character',
      question: 'Character: What does the pain feel like?',
      questionHi: 'प्रकृति: दर्द कैसा महसूस होता है?',
      questions: {
        hi: 'प्रकृति: दर्द कैसा महसूस होता है?',
        bn: 'প্রকৃতি: ব্যথা কেমন মনে হচ্ছে? (ভারী চাপ বা ধারালো)',
        ta: 'தன்மைகள்: வலி எப்படிப்பட்டதாக இருக்கிறது?',
        te: 'లక్షణం: నొప్పి ఎలా అనిపిస్తుంది?',
        mr: 'प्रकृती: वेदना कशी जाणवते?',
        gu: 'પ્રકૃતિ: દુખાવો કેવો લાગે છે?',
        kn: 'ಸ್ವರೂಪ: ನೋವು ಹೇಗನಿಸುತ್ತದೆ?',
        pa: 'ਸੁਭਾਅ: ਦਰਦ ਕਿਸ ਤਰ੍ਹਾਂ ਦਾ ਲੱਗਦਾ ਹੈ?',
        ml: 'സ്വഭാവം: വേദന എങ്ങനെ അനുഭവപ്പെടുന്നു?',
      },
      type: 'single_select',
      options: [
        { value: 'squeezing', label: 'Heavy / Squeezing pressure', labelHi: 'भारी दबाव / जकड़न' },
        { value: 'sharp', label: 'Sharp / Stabbing pain', labelHi: 'तेज़ चुभन वाला दर्द' },
        { value: 'burning', label: 'Burning sensation', labelHi: 'जलन जैसा' },
        { value: 'throbbing', label: 'Throbbing / Pulsating', labelHi: 'धड़कता हुआ' }
      ],
      category: 'severity'
    },
    {
      id: 'socrates_radiation',
      question: 'Radiation: Does the pain move to your left arm, shoulder, jaw, neck, or back?',
      questionHi: 'फैलाव: क्या दर्द बाएँ हाथ, कंधे, जबड़े या पीठ तक जाता है?',
      questions: {
        hi: 'फैलाव: क्या दर्द बाएँ हाथ, कंधे, जबड़े या पीठ तक जाता है?',
        bn: 'বিস্তার: ব্যথা কি বাম হাত, কাঁধ, চোয়াল বা পিঠে ছড়িয়ে যায়?',
        ta: 'பரவல்: வலி இடது கை, தோள்பட்டை, தாடை அல்லது முதுகிற்கு பரவுகிறதா?',
        te: 'వ్యాప్తి: నొప్పి ఎడమ చేయి, భుజం, దవడ లేదా వెనుకకు పాకుతుందా?',
        mr: 'पसरणे: वेदना डाव्या हाताकडे, खांद्याकडे, जबड्याकडे जाते का?',
        gu: 'ફેલાવો: શું દુખાવો ડાબા હાથ, ખભા, જડબા કે પીઠ તરફ જાય છે?',
        kn: 'ಹರಡುವಿಕೆ: ನೋವು ಎಡಗೈ, ಭುಜ, ದವಡೆ ಅಥವಾ ಬೆನ್ನಿಗೆ ಹರಡುತ್ತದೆಯೇ?',
        pa: 'ਫੈਲਾਅ: ਕੀ ਦਰਦ ਖੱਬੀ ਬਾਂਹ, ਮੋਢੇ ਜਾਂ ਜਬਾੜੇ ਵੱਲ ਜਾਂਦਾ ਹੈ?',
        ml: 'വ്യാപനം: വേദന ഇടതുകൈ, തോൾ, താടിയെല്ല് അല്ലെങ്കിൽ പുറം ഭാഗത്തേക്ക് പടരുന്നുണ്ടോ?',
      },
      type: 'single_select',
      options: [
        { value: 'left_arm', label: 'Left arm / Shoulder', labelHi: 'बायां हाथ / कंधा' },
        { value: 'jaw_neck', label: 'Jaw / Neck', labelHi: 'जबड़ा / गर्दन' },
        { value: 'back', label: 'Back', labelHi: 'पीठ' },
        { value: 'none', label: 'No, stays in chest', labelHi: 'नहीं, केवल छाती में' }
      ],
      category: 'associated_symptoms'
    },
    {
      id: 'socrates_associations',
      question: 'Associations: Are you experiencing breathlessness, sweating, or nausea?',
      questionHi: 'संबंधित लक्षण: क्या सांस फूलना, पसीना आना या उल्टी जैसा लग रहा है?',
      questions: {
        hi: 'संबंधित लक्षण: क्या सांस फूलना, पसीना आना या उल्टी जैसा लग रहा है?',
        bn: 'সম্পর্কিত লক্ষণ: শ্বাসকষ্ট, ঘাম বা বমি বমি ভাব হচ্ছে কি?',
        ta: 'தொடர்புடைய அறிகுறிகள்: மூச்சுத் திணறல், அதிக வியர்வை அல்லது குமட்டல் உள்ளதா?',
        te: 'సంబంధిత లక్షణాలు: శ్వాస ఆడకపోవడం, చెమటలు పట్టడం లేదా వాంతి వచ్చినట్లు ఉండటం జరుగుతోందా?',
        mr: 'संबंधित लक्षणे: धाप लागणे, घाम येणे किंवा मळमळ होत आहे का?',
        gu: 'સંબંધિત લક્ષણો: શું શ્વાસ ચડવો, પરસેવો થવો કે ઉલ્ટી જેવું થાય છે?',
        kn: 'ಸಂಬಂಧಿತ ಲಕ್ಷಣಗಳು: ಉಸಿರಾಟದ ತೊಂದರೆ, ಬೆವರುವುದು ಅಥವಾ ವಾಕರಿಕೆ ಇದೆಯೇ?',
        pa: 'ਸੰਬੰਧਿਤ ਲੱਛਣ: ਕੀ ਸਾਹ ਚੜ੍ਹਨਾ, ਪਸੀਨਾ ਆਉਣਾ ਜਾਂ ਉਲਟੀ ਦਾ ਮਨ ਹੋ ਰਿਹਾ ਹੈ?',
        ml: 'മറ്റ് ലക്ഷണങ്ങൾ: ശ്വാസംമുട്ടൽ, അമിത വിയർപ്പ് അല്ലെങ്കിൽ ഓക്കാനം ഉണ്ടോ?',
      },
      type: 'multi_select',
      options: [
        { value: 'breathlessness', label: 'Shortness of breath', labelHi: 'सांस फूलना' },
        { value: 'sweating', label: 'Profuse sweating', labelHi: 'अत्यधिक पसीना' },
        { value: 'nausea', label: 'Nausea / Vomiting', labelHi: 'जी मिचलाना / उल्टी' },
        { value: 'dizziness', label: 'Dizziness / Lightheadedness', labelHi: 'चक्कर आना' }
      ],
      category: 'associated_symptoms'
    },
    {
      id: 'socrates_timecourse',
      question: 'Time Course: Is the pain constant or does it come in episodes?',
      questionHi: 'समय चक्र: दर्द लगातार है या रुक-रुक कर आता है?',
      questions: {
        hi: 'समय चक्र: दर्द लगातार है या रुक-रुक कर आता है?',
        bn: 'সময় প্রবাহ: ব্যথা কি একটানা নাকি মাঝে মাঝে আসে?',
        ta: 'நேர முறை: வலி தொடர்ந்து உள்ளதா அல்லது விட்டு விட்டு வருகிறதா?',
        te: 'సమయ రీతి: నొప్పి నిరంతరంగా ఉందా లేదా ఆగి ఆగి వస్తుందా?',
        mr: 'वेळेचे स्वरूप: वेदना सतत आहे की थांबून-थांबून येते?',
        gu: 'સમયગાળો: દુખાવો સતત છે કે રોકાઈ રોકાઈને થાય છે?',
        kn: 'ಕಾಲಾವಧಿ: ನೋವು ನಿರಂತರವಾಗಿದೆಯೇ ಅಥವಾ ಬಿಟ್ಟು ಬಿಟ್ಟು ಬರುತ್ತದೆಯೇ?',
        pa: 'ਸਮਾਂ ਚੱਕਰ: ਦਰਦ ਲਗਾਤਾਰ ਹੈ ਜਾਂ ਰੁਕ-ਰੁਕ ਕੇ ਹੁੰਦਾ ਹੈ?',
        ml: 'സമയക്രമം: വേദന തുടർച്ചയായി ഉള്ളതാണോ അതോ ഇടവിട്ട് വരുന്നതാണോ?',
      },
      type: 'single_select',
      options: [
        { value: 'constant', label: 'Constant / Continuous', labelHi: 'लगातार' },
        { value: 'episodic', label: 'Comes in waves / Episodes', labelHi: 'रुक-रुक कर' },
        { value: 'exertional', label: 'Only during walking / activity', labelHi: 'केवल चलने पर' }
      ],
      category: 'duration'
    },
    {
      id: 'socrates_exacerbating',
      question: 'Exacerbating Factors: What makes the pain worse or better?',
      questionHi: 'बढ़ाने/घटाने वाले कारक: क्या करने से दर्द बढ़ता या घटता है?',
      questions: {
        hi: 'बढ़ाने/घटाने वाले कारक: क्या करने से दर्द बढ़ता या घटता है?',
        bn: 'পরিবর্তনকারী কারণ: কী করলে ব্যথা বাড়ে বা কমে?',
        ta: 'அதிகரிக்கும் காரணிகள்: என்ன செய்தால் வலி கூடுகிறது அல்லது குறைகிறது?',
        te: 'ప్రభావ కారకాలు: ఏమి చేస్తే నొప్పి పెరుగుతుంది లేదా తగ్గుతుంది?',
        mr: 'बदलणारे घटक: कशामुळे वेदना वाढते किंवा कमी होते?',
        gu: 'અસર કરતા પરિબળો: શું કરવાથી દુખાવો વધે કે ઘટે છે?',
        kn: 'ಹೆಚ್ಚಿಸುವ/ಕಡಿಮೆ ಮಾಡುವ ಅಂಶಗಳು: ಏನು ಮಾಡಿದರೆ ನೋವು ಹೆಚ್ಚಾಗುತ್ತದೆ ಅಥವಾ ಕಡಿಮೆಯಾಗುತ್ತದೆ?',
        pa: 'ਵਧਾਉਣ/ਘਟਾਉਣ ਵਾਲੇ ਕਾਰਕ: ਕੀ ਕਰਨ ਨਾਲ ਦਰਦ ਵਧਦਾ ਜਾਂ ਘਟਦਾ ਹੈ?',
        ml: 'വേദനയെ സ്വാധീനിക്കുന്ന ഘടകങ്ങൾ: എന്ത് ചെയ്യുമ്പോഴാണ് വേദന കൂടുകയോ കുറയുകയോ ചെയ്യുന്നത്?',
      },
      type: 'single_select',
      options: [
        { value: 'exertion_worse', label: 'Worse with walking / stairs', labelHi: 'चलने / सीढ़ियों से बढ़ता है' },
        { value: 'respiration_worse', label: 'Worse with deep breath / coughing', labelHi: 'गहरी सांस लेने पर बढ़ता है' },
        { value: 'rest_better', label: 'Better with rest', labelHi: 'आराम करने से आराम मिलता है' },
        { value: 'antacid_better', label: 'Better with antacids', labelHi: 'एंटासिड से आराम मिलता है' }
      ],
      category: 'associated_symptoms'
    },
    {
      id: 'socrates_severity',
      question: 'Severity: On a scale of 1 to 10, how severe is the pain right now?',
      questionHi: 'गंभीरता: 1 से 10 के पैमाने पर दर्द कितना तेज़ है?',
      questions: {
        hi: 'गंभीरता: 1 से 10 के पैमाने पर दर्द कितना तेज़ है?',
        bn: 'তীব্রতা: ১ থেকে ১০ স্কেলে ব্যথা এখন কতটা তীব্র?',
        ta: 'தீவிரம்: 1 முதல் 10 வரையிலான அளவில் வலி எவ்வளவு அதிகமாக உள்ளது?',
        te: 'తీవ్రత: 1 నుండి 10 స్కేలులో ప్రస్తుతం నొప్పి ఎంత తీవ్రంగా ఉంది?',
        mr: 'तीव्रता: १ ते १० च्या प्रमाणात वेदना किती तीव्र आहे?',
        gu: 'તીવ્રતા: ૧ થી ૧૦ ના સ્કેલ પર દુખાવો કેટલો તીવ્ર છે?',
        kn: 'ತೀವ್ರತೆ: 1 ರಿಂದ 10 ರ ಪ್ರಮಾಣದಲ್ಲಿ ನೋವು ಎಷ್ಟು ತೀವ್ರವಾಗಿದೆ?',
        pa: 'ਗੰਭੀਰਤਾ: 1 ਤੋਂ 10 ਦੇ ਪੈਮਾਨੇ ਤੇ ਦਰਦ ਕਿੰਨਾ ਤੇਜ਼ ਹੈ?',
        ml: 'തീവ്രത: 1 മുതൽ 10 വരെയുള്ള സ്കെയിലിൽ വേദന എത്രത്തോളമുണ്ട്?',
      },
      type: 'number',
      min: 1,
      max: 10,
      category: 'severity'
    },
  ],
  fever: [
    {
      id: 'f_onset',
      question: 'Onset: When did the fever start?',
      questionHi: 'शुरुआत: बुखार कब से है?',
      questions: {
        hi: 'शुरुआत: बुखार कब से है?',
        bn: 'সূচনা: জ্বর কতদিন ধরে আছে?',
        ta: 'தொடக்கம்: காய்ச்சல் எப்போது தொடங்கியது?',
        te: 'ప్రారంభం: జ్వరం ఎప్పటి నుండి ఉంది?',
        mr: 'सुरुवात: ताप कधीपासून आहे?',
        gu: 'શરૂઆત: તાવ ક્યારથી છે?',
        kn: 'ಪ್ರಾರಂಭ: ಜ್ವರ ಯಾವಾಗ ಪ್ರಾರಂಭವಾಯಿತು?',
        pa: 'ਸ਼ੁਰੂਆਤ: ਬੁਖਾਰ ਕਦੋਂ ਤੋਂ ਹੈ?',
        ml: 'തുടക്കം: പനി എപ്പോഴാണ് തുടങ്ങിയത്?',
      },
      type: 'single_select',
      options: [
        { value: 'today', label: 'Today', labelHi: 'आज' },
        { value: '1_2_days', label: '1-2 days ago', labelHi: '1-2 दिन पहले' },
        { value: '3_5_days', label: '3-5 days ago', labelHi: '3-5 दिन पहले' },
        { value: '1_week', label: 'About 1 week', labelHi: 'लगभग 1 सप्ताह' },
        { value: 'more', label: 'More than 1 week', labelHi: '1 सप्ताह से अधिक' }
      ],
      category: 'duration'
    },
    {
      id: 'f_grade',
      question: 'Grade: How high has the fever been?',
      questionHi: 'तापमान: बुखार कितना तेज़ रहा है?',
      questions: {
        hi: 'तापमान: बुखार कितना तेज़ रहा है?',
        bn: 'মাত্রা: জ্বর কতটা বেশি ছিল?',
        ta: 'அளவு: காய்ச்சல் எவ்வளவு அதிகமாக இருந்தது?',
        te: 'తీవ్రత: జ్వరం ఎంత ఎక్కువగా ఉంది?',
        mr: 'प्रमाण: ताप किती जास्त आहे?',
        gu: 'તાપમાન: તાવ કેટલો વધારે રહ્યો છે?',
        kn: 'ಪ್ರಮಾಣ: ಜ್ವರ ಎಷ್ಟು ಹೆಚ್ಚಾಗಿದೆ?',
        pa: 'ਤਾਪਮਾਨ: ਬੁਖਾਰ ਕਿੰਨਾ ਤੇਜ਼ ਰਿਹਾ ਹੈ?',
        ml: 'അളവ്: പനി എത്രത്തോളം കൂടുതലായിരുന്നു?',
      },
      type: 'single_select',
      options: [
        { value: 'low_grade', label: 'Low grade (99-100°F / mild)', labelHi: 'हल्का (99-100°F)' },
        { value: 'moderate', label: 'Moderate (100-102°F)', labelHi: 'मध्यम (100-102°F)' },
        { value: 'high', label: 'High (102-104°F)', labelHi: 'तेज़ (102-104°F)' },
        { value: 'very_high', label: 'Very High (>104°F / chills)', labelHi: 'बहुत तेज़ (>104°F)' }
      ],
      category: 'severity'
    },
    {
      id: 'f_pattern',
      question: 'Pattern: How does the fever behave throughout the day?',
      questionHi: 'पैटर्न: बुखार दिनभर कैसा रहता है?',
      questions: {
        hi: 'पैटर्न: बुखार दिनभर कैसा रहता है?',
        bn: 'প্যাটার্ন: সারাদিনে জ্বর কেমন থাকে?',
        ta: 'முறை: நாள் முழுவதும் காய்ச்சல் எப்படி இருக்கிறது?',
        te: 'సరళి: రోజంతా జ్వరం ఎలా ఉంటుంది?',
        mr: 'स्वरूप: दिवसभरात ताप कसा राहतो?',
        gu: 'પેટર્ન: દિવસ દરમિયાન તાવ કેવો રહે છે?',
        kn: 'ಮಾದರಿ: ದಿನವಿಡೀ ಜ್ವರದ ಲಕ್ಷಣ ಹೇಗಿರುತ್ತದೆ?',
        pa: 'ਪੈਟਰਨ: ਬੁਖਾਰ ਸਾਰਾ ਦਿਨ ਕਿਵੇਂ ਰਹਿੰਦਾ ਹੈ?',
        ml: 'രീതി: പകൽ മുഴുവൻ പനി എങ്ങനെയാണ് അനുഭവപ്പെടുന്നത്?',
      },
      type: 'single_select',
      options: [
        { value: 'continuous', label: 'Continuous / Always present', labelHi: 'लगातार' },
        { value: 'intermittent', label: 'Comes and goes (Intermittent)', labelHi: 'आता-जाता रहता है' },
        { value: 'evening_rise', label: 'Rises in evening / night', labelHi: 'शाम/रात को बढ़ता है' },
        { value: 'with_chills', label: 'With shaking chills (Rigors)', labelHi: 'कंपकंपी के साथ' }
      ],
      category: 'associated_symptoms'
    },
    {
      id: 'f_associations',
      question: 'Associations: Do you have any of these with the fever?',
      questionHi: 'संबंधित लक्षण: बुखार के साथ क्या-क्या हो रहा है?',
      questions: {
        hi: 'संबंधित लक्षण: बुखार के साथ क्या-क्या हो रहा है?',
        bn: 'সম্পর্কিত লক্ষণ: জ্বরের সাথে আর কী সমস্যা হচ্ছে?',
        ta: 'தொடர்புடையவை: காய்ச்சலுடன் வேறு என்ன அறிகுறிகள் உள்ளன?',
        te: 'సంబంధిత లక్షణాలు: జ్వరంతో పాటు వీటిలో ఏవైనా ఉన్నాయా?',
        mr: 'संबंधित लक्षणे: तापासोबत खालीलपैकी काय होत आहे?',
        gu: 'સંબંધિત લક્ષણો: તાવ સાથે આમાંથી શું થાય છે?',
        kn: 'ಸಂಬಂಧಿತ ಲಕ್ಷಣಗಳು: ಜ್ವರದ ಜೊತೆಗೆ ಇವುಗಳಲ್ಲಿ ಯಾವುದಾದರೂ ಇದೆಯೇ?',
        pa: 'ਸੰਬੰਧਿਤ ਲੱਛਣ: ਬੁਖਾਰ ਦੇ ਨਾਲ ਹੋਰ ਕੀ ਹੋ ਰਿਹਾ ਹੈ?',
        ml: 'മറ്റ് ലക്ഷണങ്ങൾ: പനിയോടൊപ്പം ഇതിൽ എന്തെങ്കിലും ഉണ്ടോ?',
      },
      type: 'multi_select',
      options: [
        { value: 'headache', label: 'Headache', labelHi: 'सिरदर्द' },
        { value: 'body_ache', label: 'Body ache / Joint pain', labelHi: 'बदन दर्द / जोड़ों में दर्द' },
        { value: 'cough', label: 'Cough / Cold', labelHi: 'खांसी / जुकाम' },
        { value: 'rash', label: 'Skin rash', labelHi: 'त्वचा पर चकत्ते' },
        { value: 'vomiting', label: 'Vomiting / Loose stools', labelHi: 'उल्टी / दस्त' },
        { value: 'burning_urine', label: 'Burning urination', labelHi: 'पेशाब में जलन' }
      ],
      category: 'associated_symptoms'
    },
    {
      id: 'f_severity',
      question: 'Severity: On a scale of 1 to 10, how unwell do you feel?',
      questionHi: 'गंभीरता: 1 से 10 में आप कितना बीमार महसूस करते हैं?',
      questions: {
        hi: 'गंभीरता: 1 से 10 में आप कितना बीमार महसूस करते हैं?',
        bn: 'তীব্রতা: ১ থেকে ১০ স্কেলে আপনি কতটা অসুস্থ বোধ করছেন?',
        ta: 'தீவிரம்: 1 முதல் 10 வரையிலான அளவில் உங்கள் சோர்வு எவ்வளவு?',
        te: 'తీవ్రత: 1 నుండి 10 స్కేలులో మీరు ఎంత అస్వస్థతగా భావిస్తున్నారు?',
        mr: 'तीव्रता: १ ते १० च्या प्रमाणात किती आजारी वाटत आहे?',
        gu: 'તીવ્રતા: ૧ થી ૧૦ માં તમે કેટલું અસ્વસ્થ અનુભવો છો?',
        kn: 'ತೀವ್ರತೆ: 1 ರಿಂದ 10 ರ ಪ್ರಮಾಣದಲ್ಲಿ ಎಷ್ಟು ಅಸ್ವಸ್ಥತೆ ಎನಿಸುತ್ತದೆ?',
        pa: 'ਗੰਭੀਰਤਾ: 1 ਤੋਂ 10 ਵਿੱਚ ਤੁਸੀਂ ਕਿੰਨਾ ਬਿਮਾਰ ਮਹਿਸੂਸ ਕਰਦੇ ਹੋ?',
        ml: 'തീവ്രത: 1 മുതൽ 10 വരെയുള്ള സ്കെയിലിൽ എത്രത്തോളം അസ്വസ്ഥതയുണ്ട്?',
      },
      type: 'number',
      min: 1,
      max: 10,
      category: 'severity'
    },
  ],
  stomach_pain: [
    {
      id: 'sp_site',
      question: 'Site: Where exactly is the pain in your abdomen?',
      questionHi: 'स्थान: पेट में दर्द ठीक कहाँ है?',
      questions: {
        hi: 'स्थान: पेट में दर्द ठीक कहाँ है?',
        bn: 'স্থান: পেটের ঠিক কোথায় ব্যথা হচ্ছে?',
        ta: 'இடம்: வயிற்றில் வலி சரியாக எங்கே இருக்கிறது?',
        te: 'స్థానం: కడుపులో ఖచ్చితంగా ఎక్కడ నొప్పి ఉంది?',
        mr: 'स्थान: पोटात नक्की कुठे दुखत आहे?',
        gu: 'સ્થાન: પેટમાં બરાબર ક્યાં દુખાવો છે?',
        kn: 'ಸ್ಥಳ: ಹೊಟ್ಟೆಯಲ್ಲಿ ನಿಖರವಾಗಿ ಎಲ್ಲಿ ನೋವಿದೆ?',
        pa: 'ਸਥਾਨ: ਢਿੱਡ ਵਿੱਚ ਦਰਦ ਠੀਕ ਕਿੱਥੇ ਹੈ?',
        ml: 'സ്ഥലം: വയറ്റിൽ കൃത്യമായി എവിടെയാണ് വേദന?',
      },
      type: 'single_select',
      options: [
        { value: 'upper_center', label: 'Upper center (Epigastric)', labelHi: 'ऊपरी बीच का भाग' },
        { value: 'upper_right', label: 'Upper right', labelHi: 'ऊपरी दायां भाग' },
        { value: 'around_navel', label: 'Around navel (Periumbilical)', labelHi: 'नाभि के चारों ओर' },
        { value: 'lower_right', label: 'Lower right', labelHi: 'निचला दायां भाग' },
        { value: 'lower_left', label: 'Lower left', labelHi: 'निचला बायां भाग' },
        { value: 'diffuse', label: 'Entire abdomen', labelHi: 'पूरे पेट में' }
      ],
      category: 'duration'
    },
    {
      id: 'sp_onset',
      question: 'Onset: When did the stomach pain start?',
      questionHi: 'शुरुआत: पेट दर्द कब शुरू हुआ?',
      questions: {
        hi: 'शुरुआत: पेट दर्द कब शुरू हुआ?',
        bn: 'সূচনা: পেটে ব্যথা কখন শুরু হয়েছিল?',
        ta: 'தொடக்கம்: வயிற்று வலி எப்போது தொடங்கியது?',
        te: 'ప్రారంభం: కడుపు నొప్పి ఎప్పుడు మొదలైంది?',
        mr: 'सुरुवात: पोटदुखी कधी सुरू झाली?',
        gu: 'શરૂઆત: પેટનો દુખાવો ક્યારે શરૂ થયો?',
        kn: 'ಪ್ರಾರಂಭ: ಹೊಟ್ಟೆ ನೋವು ಯಾವಾಗ ಪ್ರಾರಂಭವಾಯಿತು?',
        pa: 'ਸ਼ੁਰੂਆਤ: ਢਿੱਡ ਪੀੜ ਕਦੋਂ ਸ਼ੁਰੂ ਹੋਈ?',
        ml: 'തുടക്കം: വയറുവേദന എപ്പോഴാണ് തുടങ്ങിയത്?',
      },
      type: 'single_select',
      options: [
        { value: 'sudden_today', label: 'Sudden onset today', labelHi: 'आज अचानक' },
        { value: '1_2_days', label: '1-2 days ago', labelHi: '1-2 दिन पहले' },
        { value: '3_5_days', label: '3-5 days ago', labelHi: '3-5 दिन पहले' },
        { value: 'chronic', label: 'Ongoing for weeks/months', labelHi: 'हफ्तों या महीनों से' }
      ],
      category: 'duration'
    },
    {
      id: 'sp_character',
      question: 'Character: What does the pain feel like?',
      questionHi: 'प्रकृति: दर्द कैसा है?',
      questions: {
        hi: 'प्रकृति: दर्द कैसा है?',
        bn: 'প্রকৃতি: ব্যথা কেমন মনে হচ্ছে? (জ্বালা বা কামড়ানো)',
        ta: 'குணம்: வலி எப்படிப்பட்டதாக இருக்கிறது?',
        te: 'లక్షణం: నొప్పి ఎలాంటి అనుభూతిని కలిగిస్తోంది?',
        mr: 'प्रकृती: दुखणे कसे आहे?',
        gu: 'પ્રકૃતિ: દુખાવો કેવો છે?',
        kn: 'ಸ್ವರೂಪ: ನೋವು ಹೇಗಿದೆ?',
        pa: 'ਸੁਭਾਅ: ਦਰਦ ਕਿਸ ਤਰ੍ਹਾਂ ਦਾ ਹੈ?',
        ml: 'സ്വഭാവം: വേദന എങ്ങനെയുള്ളതാണ്?',
      },
      type: 'single_select',
      options: [
        { value: 'burning', label: 'Burning / Acidic', labelHi: 'जलन / एसिडिटी' },
        { value: 'cramping', label: 'Cramping / Colicky', labelHi: 'मरोड़ या ऐंठन' },
        { value: 'dull_ache', label: 'Dull constant ache', labelHi: 'हल्का लगातार दर्द' },
        { value: 'sharp', label: 'Sharp / Stabbing', labelHi: 'तेज़ चुभने वाला' }
      ],
      category: 'severity'
    },
    {
      id: 'sp_meal_relation',
      question: 'Meal Relation: How does eating affect the pain?',
      questionHi: 'खाने से संबंध: खाना खाने से दर्द पर क्या असर पड़ता है?',
      questions: {
        hi: 'खाने से संबंध: खाना खाने से दर्द पर क्या असर पड़ता है?',
        bn: 'খাবারের প্রভাব: খাওয়ার সাথে ব্যথার কি সম্পর্ক আছে?',
        ta: 'உணவு தொடர்பு: உணவு சாப்பிடுவதால் வலி மாறுகிறதா?',
        te: 'ఆహార ప్రభావం: ఆహారం తీసుకున్న తర్వాత నొప్పి ఎలా ఉంటుంది?',
        mr: 'जेवणाचा प्रभाव: जेवल्याने वेदनेवर काय परिणाम होतो?',
        gu: 'ખોરાક સાથે સંબંધ: જમવાથી દુખાવા પર શું અસર થાય છે?',
        kn: 'ಊಟದ ಪ್ರಭಾವ: ಊಟ ಮಾಡಿದ ನಂತರ ನೋವು ಹೇಗಿರುತ್ತದೆ?',
        pa: 'ਖਾਣੇ ਨਾਲ ਸੰਬੰਧ: ਰੋਟੀ ਖਾਣ ਨਾਲ ਦਰਦ ਤੇ ਕੀ ਅਸਰ ਪੈਂਦਾ ਹੈ?',
        ml: 'ഭക്ഷണവുമായുള്ള ബന്ധം: ഭക്ഷണം കഴിക്കുന്നത് വേദനയെ എങ്ങനെ ബാധിക്കുന്നു?',
      },
      type: 'single_select',
      options: [
        { value: 'worse_after_meal', label: 'Worse after eating', labelHi: 'खाने के बाद बढ़ता है' },
        { value: 'better_after_meal', label: 'Better after eating', labelHi: 'खाने के बाद आराम मिलता है' },
        { value: 'worse_empty_stomach', label: 'Worse on empty stomach', labelHi: 'खाली पेट बढ़ता है' },
        { value: 'no_relation', label: 'No clear relation to meals', labelHi: 'खाने से कोई खास संबंध नहीं' }
      ],
      category: 'associated_symptoms'
    },
    {
      id: 'sp_associations',
      question: 'Associations: Do you have any of these symptoms?',
      questionHi: 'संबंधित लक्षण: क्या ये कोई लक्षण हैं?',
      questions: {
        hi: 'संबंधित लक्षण: क्या ये कोई लक्षण हैं?',
        bn: 'সম্পর্কিত লক্ষণ: এই লক্ষণগুলির কোনটি কি আছে?',
        ta: 'தொடர்புடையவை: இந்த அறிகுறிகளில் ஏதேனும் உள்ளதா?',
        te: 'సంబంధిత లక్షణాలు: ఈ క్రింది వాటిలో ఏవైనా ఉన్నాయా?',
        mr: 'संबंधित लक्षणे: ही लक्षणे आहेत का?',
        gu: 'સંબંધિત લક્ષણો: શું આમાંથી કોઈ લક્ષણ છે?',
        kn: 'ಸಂಬಂಧಿತ ಲಕ್ಷಣಗಳು: ಈ ಲಕ್ಷಣಗಳಲ್ಲಿ ಯಾವುದಾದರೂ ಇದೆಯೇ?',
        pa: 'ਸੰਬੰਧਿਤ ਲੱਛਣ: ਕੀ ਇਹ ਕੋਈ ਲੱਛਣ ਹਨ?',
        ml: 'മറ്റ് ലക്ഷണങ്ങൾ: ഇതിൽ ഏതെങ്കിലും ലക്ഷണങ്ങൾ ഉണ്ടോ?',
      },
      type: 'multi_select',
      options: [
        { value: 'nausea', label: 'Nausea / Vomiting', labelHi: 'जी मिचलाना / उल्टी' },
        { value: 'loose_stools', label: 'Loose stools / Diarrhea', labelHi: 'दस्त' },
        { value: 'constipation', label: 'Constipation', labelHi: 'कब्ज' },
        { value: 'blood_stool', label: 'Blood in stool', labelHi: 'मल में खून' },
        { value: 'bloating', label: 'Bloating / Gas', labelHi: 'पेट फूलना / गैस' }
      ],
      category: 'associated_symptoms'
    },
    {
      id: 'sp_severity',
      question: 'Severity: On a scale of 1 to 10, how severe is the pain?',
      questionHi: 'गंभीरता: 1 से 10 में दर्द कितना तेज़ है?',
      questions: {
        hi: 'गंभीरता: 1 से 10 में दर्द कितना तेज़ है?',
        bn: 'তীব্রতা: ১ থেকে ১০ স্কেলে ব্যথা কতটা তীব্র?',
        ta: 'தீவிரம்: 1 முதல் 10 வரையிலான அளவில் வலி எவ்வளவு?',
        te: 'తీవ్రత: 1 నుండి 10 స్కేలులో నొప్పి ఎంత తీవ్రంగా ఉంది?',
        mr: 'तीव्रता: १ ते १० च्या प्रमाणात दुखणे किती तीव्र आहे?',
        gu: 'તીવ્રતા: ૧ થી ૧૦ માં દુખાવો કેટલો તીવ્ર છે?',
        kn: 'ತೀವ್ರತೆ: 1 ರಿಂದ 10 ರ ಪ್ರಮಾಣದಲ್ಲಿ ನೋವು ಎಷ್ಟು ತೀವ್ರವಾಗಿದೆ?',
        pa: 'ਗੰਭੀਰਤਾ: 1 ਤੋਂ 10 ਵਿੱਚ ਦਰਦ ਕਿੰਨਾ ਤੇਜ਼ ਹੈ?',
        ml: 'തീവ്രത: 1 മുതൽ 10 വരെയുള്ള സ്കെയിലിൽ വേദന എത്രത്തോളമുണ്ട്?',
      },
      type: 'number',
      min: 1,
      max: 10,
      category: 'severity'
    },
  ],
}

// ============================
// Dashavidha Pariksha — Ayurvedic 10-Fold Assessment Framework
// ============================
export const DASHAVIDHA_PARIKSHA_QUESTIONS = [
  {
    id: 'prakriti',
    question: '1. Prakriti (Constitution): What is your primary physiological constitution?',
    questions: {
      hi: '१. प्रकृति: आपकी प्राथमिक शारीरिक प्रकृति क्या है?',
      bn: '১. প্রকৃতি: আপনার প্রাথমিক শারীরিক গঠন কী?',
      ta: '1. பிரகிருதி: உங்கள் முதன்மை உடல் அமைப்பு என்ன?',
      te: '1. ప్రకృతి: మీ ప్రాథమిక శారీరక స్వభావం ఏమిటి?',
      mr: '१. प्रकृती: तुमची प्राथमिक शारीरिक प्रकृती काय आहे?',
      gu: '૧. પ્રકૃતિ: તમારું પ્રાથમિક શારીરિક બંધારણ શું છે?',
      kn: '1. ಪ್ರಕೃತಿ: ನಿಮ್ಮ ಪ್ರಾಥಮಿಕ ಶಾರೀರಿಕ ಪ್ರಕೃತಿ ಯಾವುದು?',
      pa: '1. ਪ੍ਰਕਿਰਤੀ: ਤੁਹਾਡੀ ਮੁੱਖ ਸਰੀਰਕ ਬਣਤਰ ਕੀ ਹੈ?',
      ml: '1. പ്രകൃതി: നിങ്ങളുടെ പ്രാഥമിക ശരീര പ്രകൃതി എന്താണ്?',
    },
    type: 'single_select',
    options: [
      { value: 'vata', label: 'Vata (Air/Space — Light, dry, active)' },
      { value: 'pitta', label: 'Pitta (Fire/Water — Sharp, warm, intense)' },
      { value: 'kapha', label: 'Kapha (Earth/Water — Heavy, calm, stable)' },
      { value: 'dvandvaja', label: 'Dvandvaja (Combination)' }
    ],
    category: 'ayush'
  },
  {
    id: 'vikriti',
    question: '2. Vikriti (Current Imbalance): Which Dosha appears imbalanced currently?',
    questions: {
      hi: '२. विकृति: वर्तमान में कौन सा दोष असंतुलित प्रतीत होता है?',
      bn: '২. বিকৃতি: বর্তমানে কোন দোষটি ভারসাম্যহীন মনে হচ্ছে?',
      ta: '2. விக்ருதி: தற்போது எந்த தோஷம் சமநிலையின்றி உள்ளது?',
      te: '2. వికృతి: ప్రస్తుతం ఏ దోషం అసమతుల్యంగా ఉంది?',
      mr: '२. विकृती: सध्या कोणता दोष असंतुलित वाटतो?',
      gu: '૨. વિકૃતિ: હાલમાં કયો દોષ અસંતુલિત જણાય છે?',
      kn: '2. ವಿಕೃತಿ: ಪ್ರಸ್ತುತ ಯಾವ ದೋಷವು ಅಸಮತೋಲನಗೊಂಡಿದೆ?',
      pa: '2. ਵਿਕ੍ਰਿਤੀ: ਇਸ ਸਮੇਂ ਕਿਹੜਾ ਦੋਸ਼ ਅਸੰਤੁਲਿਤ ਲੱਗਦਾ ਹੈ?',
      ml: '2. വികൃതി: നിലവിൽ ഏത് ദോഷമാണ് അസന്തുലിതമായി കാണപ്പെടുന്നത്?',
    },
    type: 'single_select',
    options: [
      { value: 'vata_vitiation', label: 'Vata Vriddhi (Pain, stiffness, anxiety)' },
      { value: 'pitta_vitiation', label: 'Pitta Vriddhi (Burning, fever, acidity)' },
      { value: 'kapha_vitiation', label: 'Kapha Vriddhi (Heaviness, mucus, edema)' }
    ],
    category: 'ayush'
  },
  {
    id: 'sara',
    question: '3. Sara (Tissue Excellence): Which Dhatu (tissue) shows high quality / resilience?',
    type: 'single_select',
    options: [
      { value: 'tvak_sara', label: 'Tvak Sara (Skin & Complexion)' },
      { value: 'rakta_sara', label: 'Rakta Sara (Blood & Circulation)' },
      { value: 'mamsa_sara', label: 'Mamsa Sara (Muscular strength)' },
      { value: 'meda_sara', label: 'Meda Sara (Adipose tissue)' },
      { value: 'asthi_sara', label: 'Asthi Sara (Bone structure)' },
      { value: 'majja_sara', label: 'Majja Sara (Nerve tissue)' }
    ],
    category: 'ayush'
  },
  {
    id: 'samhanana',
    question: '4. Samhanana (Body Compactness): How is your physical build / density?',
    type: 'single_select',
    options: [
      { value: 'su_samhata', label: 'Su-Samhata (Compact & well-built)' },
      { value: 'madhyama', label: 'Madhyama (Moderate build)' },
      { value: 'visama', label: 'Visama (Asymmetric / Frail build)' }
    ],
    category: 'ayush'
  },
  {
    id: 'satmya',
    question: '5. Satmya (Habituation / Adaptability): What dietary habits agree best with your body?',
    type: 'single_select',
    options: [
      { value: 'pravara_satmya', label: 'Pravara Satmya (Tolerates all six tastes & foods well)' },
      { value: 'madhyama_satmya', label: 'Madhyama Satmya (Moderate tolerance)' },
      { value: 'avara_satmya', label: 'Avara Satmya (Sensitive to many foods)' }
    ],
    category: 'ayush'
  },
  {
    id: 'sattva',
    question: '6. Sattva (Mental Strength): How do you cope with pain & stress?',
    type: 'single_select',
    options: [
      { value: 'pravara_sattva', label: 'Pravara Sattva (High mental endurance)' },
      { value: 'madhyama_sattva', label: 'Madhyama Sattva (Moderate tolerance)' },
      { value: 'avara_sattva', label: 'Avara Sattva (Low pain threshold / easily anxious)' }
    ],
    category: 'ayush'
  },
  {
    id: 'ahara_shakti',
    question: '7. Ahara Shakti (Digestive Capacity): Describe your appetite and digestion (Agni).',
    type: 'single_select',
    options: [
      { value: 'sama_agni', label: 'Sama Agni (Normal, balanced digestion)' },
      { value: 'tikshna_agni', label: 'Tikshna Agni (Intense appetite, hyperacidic)' },
      { value: 'manda_agni', label: 'Manda Agni (Sluggish digestion, bloating)' },
      { value: 'visham_agni', label: 'Visham Agni (Irregular, fluctuating digestion)' }
    ],
    category: 'ayush'
  },
  {
    id: 'vyayama_shakti',
    question: '8. Vyayama Shakti (Physical Endurance): How easily do you fatigue?',
    type: 'single_select',
    options: [
      { value: 'high_endurance', label: 'High physical stamina' },
      { value: 'moderate_endurance', label: 'Moderate stamina' },
      { value: 'low_endurance', label: 'Tires quickly with light effort' }
    ],
    category: 'ayush'
  },
  {
    id: 'vaya',
    question: '9. Vaya (Age Stage): Age classification in Ayurvedic clinical terms.',
    type: 'single_select',
    options: [
      { value: 'bala', label: 'Bala (Childhood / Growth stage)' },
      { value: 'madhyama_vaya', label: 'Madhyama (Adult / Maintenance stage)' },
      { value: 'vriddha', label: 'Vriddha (Geriatric / Degenerative stage)' }
    ],
    category: 'ayush'
  },
  {
    id: 'koshtha',
    question: '10. Koshtha (Bowel Habit): How are your bowel movements?',
    type: 'single_select',
    options: [
      { value: 'krura_koshtha', label: 'Krura Koshtha (Hard stools / prone to constipation)' },
      { value: 'mridu_koshtha', label: 'Mridu Koshtha (Soft stools / easily affected by milk)' },
      { value: 'madhyama_koshtha', label: 'Madhyama Koshtha (Regular bowel habits)' }
    ],
    category: 'ayush'
  },
]

export const COMMON_HISTORY_QUESTIONS = [
  {
    id: 'past_medical',
    question: 'Past Medical History: Do you have diabetes, hypertension, heart disease, or asthma?',
    questionHi: 'पिछला मेडिकल इतिहास: क्या आपको मधुमेह, बीपी, हृदय रोग या अस्थमा है?',
    questions: {
      hi: 'पिछला मेडिकल इतिहास: क्या आपको मधुमेह, बीपी, हृदय रोग या अस्थमा है?',
      bn: 'পূর্ববর্তী চিকিৎসার ইতিহাস: আপনার কি ডায়াবেটিস, উচ্চ রক্তচাপ, হৃদরোগ বা হাঁপানি আছে?',
      ta: 'முந்தைய மருத்துவ வரலாறு: உங்களுக்கு சர்க்கரை நோய், இரத்த அழுத்தம், இதய நோய் அல்லது ஆஸ்துமா உள்ளதா?',
      te: 'గత వైద్య చరిత్ర: మీకు మధుమేహం, బీపీ, గుండె జబ్బులు లేదా ఉబ్బసం ఉన్నాయా?',
      mr: 'मागील वैद्यकीय इतिहास: तुम्हाला मधुमेह, उच्च रक्तदाब, हृदयविकार किंवा दमा आहे का?',
      gu: 'પાછલો તબીબી ઇતિહાસ: શું તમને ડાયાબિટીસ, હાઈ બીપી, હૃદયરોગ કે અસ્થમા છે?',
      kn: 'ಹಿಂದಿನ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ: ನಿಮಗೆ ಮಧುಮೇಹ, ರಕ್ತದೊತ್ತಡ, ಹೃದ್ರೋಗ ಅಥವಾ ಅಸ್ತಮಾ ಇದೆಯೇ?',
      pa: 'ਪਿਛਲਾ ਮੈਡੀਕਲ ਇਤਿਹਾਸ: ਕੀ ਤੁਹਾਨੂੰ ਸ਼ੂਗਰ, ਬੀਪੀ, ਦਿਲ ਦੀ ਬਿਮਾਰੀ ਜਾਂ ਦਮਾ ਹੈ?',
      ml: 'മുൻകാല രോഗവിവരങ്ങൾ: നിങ്ങൾക്ക് പ്രമേഹം, പ്രഷർ, ഹൃദ്രോഗം അല്ലെങ്കിൽ ആസ്ത്മ ഉണ്ടോ?',
    },
    type: 'multi_select',
    options: [
      { value: 'diabetes', label: 'Diabetes Mellitus', labelHi: 'मधुमेह (Diabetes)' },
      { value: 'hypertension', label: 'High Blood Pressure', labelHi: 'उच्च रक्तचाप (High BP)' },
      { value: 'heart_disease', label: 'Heart Disease', labelHi: 'हृदय रोग' },
      { value: 'asthma', label: 'Asthma / COPD', labelHi: 'अस्थमा' },
      { value: 'thyroid', label: 'Thyroid Disorder', labelHi: 'थायराइड' },
      { value: 'none', label: 'None', labelHi: 'कोई नहीं' }
    ],
    category: 'past_history'
  },
  {
    id: 'current_medications',
    question: 'Current Medications: Name all medicines you take regularly with dosage if known.',
    questionHi: 'वर्तमान दवाइयाँ: आप नियमित रूप से जो भी दवाइयाँ लेते हैं, उनके नाम बताएं।',
    questions: {
      hi: 'वर्तमान दवाइयाँ: आप नियमित रूप से जो भी दवाइयाँ लेते हैं, उनके नाम बताएं।',
      bn: 'বর্তমান ওষুধ: আপনি নিয়মিত যে ওষুধ খান তার নাম বলুন।',
      ta: 'தற்போதைய மருந்துகள்: நீங்கள் தொடர்ந்து உட்கொள்ளும் மருந்துகளின் பெயர்களைக் குறிப்பிடவும்.',
      te: 'ప్రస్తుత మందులు: మీరు రోజూ తీసుకునే మందుల పేర్లను తెలియజేయండి.',
      mr: 'सध्याची औषधे: तुम्ही रोज घेत असलेल्या औषधांची नावे सांगा.',
      gu: 'હાલની દવાઓ: તમે નિયમિતપણે લેતા હોવ તે દવાઓના નામ જણાવો.',
      kn: 'ಪ್ರಸ್ತುತ ಔಷಧಗಳು: ನೀವು ನಿಯಮಿತವಾಗಿ ತೆಗೆದುಕೊಳ್ಳುವ ಔಷಧಿಗಳ ಹೆಸರನ್ನು ತಿಳಿಸಿ.',
      pa: 'ਮੌਜੂਦਾ ਦਵਾਈਆਂ: ਤੁਸੀਂ ਰੋਜ਼ਾਨਾ ਲੈਣ ਵਾਲੀਆਂ ਦਵਾਈਆਂ ਦੇ ਨਾਮ ਦੱਸੋ।',
      ml: 'നിലവിലുള്ള മരുന്നുകൾ: നിങ്ങൾ സ്ഥിരമായി കഴിക്കുന്ന മരുന്നുകളുടെ പേരുകൾ പറയുക.',
    },
    type: 'text',
    placeholder: 'e.g. Metformin 500mg, Amlodipine 5mg, or "None"',
    category: 'medications'
  },
  {
    id: 'allergies',
    question: 'Drug & Allergy History: Are you allergic to any medicines (e.g., Penicillin, Sulfa)?',
    questionHi: 'एलर्जी का इतिहास: क्या आपको किसी दवा से एलर्जी है?',
    questions: {
      hi: 'एलर्जी का इतिहास: क्या आपको किसी दवा से एलर्जी है?',
      bn: 'ওষুধের অ্যালার্জি: কোনো ওষুধে আপনার কি অ্যালার্জি আছে?',
      ta: 'மருந்து ஒவ்வாமை: ஏதேனும் மருந்துகளால் உங்களுக்கு ஒவ்வாமை உள்ளதா?',
      te: 'అలెర్జీ చరిత్ర: మీకు ఏవైనా మందులతో అలెర్జీ ఉందా?',
      mr: 'ऍलर्जीचा इतिहास: तुम्हाला कोणत्याही औषधाची ऍलर्जी आहे का?',
      gu: 'એલર્જીનો ઇતિહાસ: શું તમને કોઈ દવાની એલર્જી છે?',
      kn: 'ಅಲರ್ಜಿ ಇತಿಹಾಸ: ನಿಮಗೆ ಯಾವುದೇ ಔಷಧಿಯಿಂದ ಅಲರ್ಜಿ ಇದೆಯೇ?',
      pa: 'ਐਲਰਜੀ ਦਾ ਇਤਿਹਾਸ: ਕੀ ਤੁਹਾਨੂੰ ਕਿਸੇ ਦਵਾਈ ਤੋਂ ਐਲਰਜੀ ਹੈ?',
      ml: 'അലർജി വിവരങ്ങൾ: നിങ്ങൾക്ക് ഏതെങ്കിലും മരുന്നുകളോട് അലർജിയുണ്ടോ?',
    },
    type: 'text',
    placeholder: 'Name allergic drug or say "No known allergies"',
    category: 'allergies'
  },
  {
    id: 'family_history',
    question: 'Family History: Does anyone in your family have diabetes, heart disease, hypertension, cancer, or stroke?',
    questionHi: 'पारिवारिक इतिहास: क्या आपके परिवार में किसी को मधुमेह, हृदय रोग, उच्च रक्तचाप, कैंसर या स्ट्रोक है?',
    questions: {
      hi: 'पारिवारिक इतिहास: क्या आपके परिवार में किसी को मधुमेह, हृदय रोग, उच्च रक्तचाप, कैंसर या स्ट्रोक है?',
      bn: 'পারিবারিক ইতিহাস: পরিবারে কি কারো ডায়াবেটিস, হৃদরোগ, উচ্চ রক্তচাপ বা স্ট্রোক আছে?',
      ta: 'குடும்ப வரலாறு: உங்கள் குடும்பத்தில் யாருக்காவது சர்க்கரை நோய், இதய நோய், புற்றுநோய் உள்ளதா?',
      te: 'కుటుంబ చరిత్ర: మీ కుటుంబంలో ఎవరికైనా మధుమేహం, గుండె జబ్బులు, బీపీ లేదా స్ట్రోక్ ఉన్నాయా?',
      mr: 'कौटुंबिक इतिहास: कुटुंबात कोणाला मधुमेह, हृदयविकार किंवा कर्करोग आहे का?',
      gu: 'પારિવારિક ઇતિહાસ: કુટુંબમાં કોઈને ડાયાબિટીસ, હૃદયરોગ, હાઈ બીપી કે કેન્સર છે?',
      kn: 'ಕುಟುಂಬದ ಇತಿಹಾಸ: ಕುಟುಂಬದಲ್ಲಿ ಯಾರಿಗಾದರೂ ಮಧುಮೇಹ, ಹೃದ್ರೋಗ ಅಥವಾ ಕ್ಯಾನ್ಸರ್ ಇದೆಯೇ?',
      pa: 'ਪਰਿਵਾਰਕ ਇਤਿਹਾਸ: ਪਰਿਵਾਰ ਵਿੱਚ ਕਿਸੇ ਨੂੰ ਸ਼ੂਗਰ, ਦਿਲ ਦੀ ਬਿਮਾਰੀ ਜਾਂ ਕੈਂਸਰ ਹੈ?',
      ml: 'കുടുംബ ചരിത്രം: കുടുംബത്തിൽ ആർക്കെങ്കിലും പ്രമേഹം, ഹൃദ്രോഗം അല്ലെങ്കിൽ കാൻസർ ഉണ്ടോ?',
    },
    type: 'multi_select',
    options: [
      { value: 'diabetes', label: 'Diabetes (Father/Mother/Sibling)', labelHi: 'मधुमेह (माता/पिता/भाई-बहन)' },
      { value: 'heart_disease', label: 'Heart Disease / Heart Attack', labelHi: 'हृदय रोग / हार्ट अटैक' },
      { value: 'hypertension', label: 'Hypertension (High BP)', labelHi: 'उच्च रक्तचाप' },
      { value: 'cancer', label: 'Cancer', labelHi: 'कैंसर' },
      { value: 'stroke', label: 'Stroke / Brain Hemorrhage', labelHi: 'स्ट्रोक / लकवा' },
      { value: 'none', label: 'No significant family history', labelHi: 'कोई पारिवारिक इतिहास नहीं' }
    ],
    category: 'past_history'
  },
  {
    id: 'smoking_status',
    question: 'Smoking: Do you smoke or have you smoked in the past?',
    questionHi: 'धूम्रपान: क्या आप धूम्रपान करते हैं या पहले करते थे?',
    questions: {
      hi: 'धूम्रपान: क्या आप धूम्रपान करते हैं या पहले करते थे?',
      bn: 'ধূমপান: আপনি কি ধূমপান করেন বা অতীতে করতেন?',
      ta: 'புகைபிடித்தல்: நீங்கள் புகைபிடிப்பவரா அல்லது முன்பு பிடித்தீர்களா?',
      te: 'ధూమపానం: మీరు ధూమపానం చేస్తారా లేదా గతంలో చేసేవారా?',
      mr: 'धूम्रपान: तुम्ही धूम्रपान करता का किंवा आधी करत होतात का?',
      gu: 'ધૂમ્રપાન: શું તમે ધૂમ્રપાન કરો છો કે ભૂતકાળમાં કરતા હતા?',
      kn: 'ಧೂಮಪಾನ: ನೀವು ಧೂಮಪಾನ ಮಾಡುತ್ತೀರಾ ಅಥವಾ ಹಿಂದೆ ಮಾಡುತ್ತಿದ್ದೀರಾ?',
      pa: 'ਸਿਗਰਟਨੋਸ਼ੀ: ਕੀ ਤੁਸੀਂ ਬੀੜੀ/ਸਿਗਰਟ ਪੀਂਦੇ ਹੋ ਜਾਂ ਪਹਿਲਾਂ ਪੀਂਦੇ ਸੀ?',
      ml: 'പുകവലി: നിങ്ങൾ പുകവലിക്കാറുണ്ടോ അല്ലെങ്കിൽ പണ്ട് വലിച്ചിരുന്നോ?',
    },
    type: 'single_select',
    options: [
      { value: 'never', label: 'Never smoked', labelHi: 'कभी नहीं' },
      { value: 'current', label: 'Currently smoking', labelHi: 'वर्तमान में धूम्रपान करते हैं' },
      { value: 'quit_recent', label: 'Quit within last 2 years', labelHi: 'पिछले 2 वर्षों में छोड़ा' },
      { value: 'quit_long', label: 'Quit more than 2 years ago', labelHi: '2 साल से अधिक समय पहले छोड़ा' }
    ],
    category: 'past_history'
  },
  {
    id: 'alcohol_intake',
    question: 'Alcohol: Do you consume alcohol?',
    questionHi: 'शराब: क्या आप शराब का सेवन करते हैं?',
    questions: {
      hi: 'शराब: क्या आप शराब का सेवन करते हैं?',
      bn: 'মদ্যপান: আপনি কি অ্যালকোহল গ্রহণ করেন?',
      ta: 'மது அருந்துதல்: நீங்கள் மது அருந்துகிறீர்களா?',
      te: 'మద్యపానం: మీరు మద్యం సేవిస్తారా?',
      mr: 'दारू: तुम्ही दारूचे सेवन करता का?',
      gu: 'દારૂ: શું તમે આલ્કોહોલનું સેવન કરો છો?',
      kn: 'ಮದ್ಯಪಾನ: ನೀವು ಮದ್ಯಪಾನ ಮಾಡುತ್ತೀರಾ?',
      pa: 'ਸ਼ਰਾਬ: ਕੀ ਤੁਸੀਂ ਸ਼ਰਾਬ ਪੀਂਦੇ ਹੋ?',
      ml: 'മദ്യപാനം: നിങ്ങൾ മദ്യം കഴിക്കാറുണ്ടോ?',
    },
    type: 'single_select',
    options: [
      { value: 'never', label: 'Never', labelHi: 'कभी नहीं' },
      { value: 'occasional', label: 'Occasionally (social)', labelHi: 'कभी-कभार' },
      { value: 'regular', label: 'Regularly (weekly/daily)', labelHi: 'नियमित रूप से' },
      { value: 'quit', label: 'Quit', labelHi: 'छोड़ दिया' }
    ],
    category: 'past_history'
  },
  {
    id: 'ros_systems',
    question: 'Review of Systems (ROS): Are you experiencing fever, skin rash, joint pain, or vision changes?',
    questionHi: 'अन्य लक्षण: क्या बुखार, त्वचा पर दाने, जोड़ों में दर्द या आंखों में धुंधलापन है?',
    questions: {
      hi: 'अन्य लक्षण: क्या बुखार, त्वचा पर दाने, जोड़ों में दर्द या आंखों में धुंधलापन है?',
      bn: 'অন্যান্য লক্ষণ: জ্বর, ত্বকের ফুসকুড়ি, জয়েন্টে ব্যথা বা দৃষ্টি পরিবর্তনের মতো কোনো সমস্যা আছে?',
      ta: 'பிற அறிகுறிகள்: காய்ச்சல், தோல் அரிப்பு, மூட்டு வலி அல்லது பார்வை மாற்றங்கள் உள்ளதா?',
      te: 'ఇతర లక్షణాలు: జ్వరం, దద్దుర్లు, కీళ్ల నొప్పులు లేదా చూపులో మార్పులు ఏమైనా ఉన్నాయా?',
      mr: 'इतर लक्षणे: ताप, पुरळ, सांधेदुखी किंवा दृष्टीमध्ये बदल जाणवतो का?',
      gu: 'અન્ય લક્ષણો: શું તાવ, ફોલ્લીઓ, સાંધાનો દુખાવો કે દ્રષ્ટિમાં ફેરફાર અનુભવાય છે?',
      kn: 'ಇತರ ಲಕ್ಷಣಗಳು: ಜ್ವರ, ಚರ್ಮದ ದದ್ದು, ಕೀಲು ನೋವು ಅಥವಾ ದೃಷ್ಟಿ ಬದಲಾವಣೆಗಳಿವೆಯೇ?',
      pa: 'ਹੋਰ ਲੱਛਣ: ਕੀ ਬੁਖਾਰ, ਚਮੜੀ ਤੇ ਦਾਣੇ, ਜੋੜਾਂ ਵਿੱਚ ਦਰਦ ਜਾਂ ਨਜ਼ਰ ਵਿੱਚ ਬਦਲਾਅ ਹੈ?',
      ml: 'മറ്റ് ലക്ഷണങ്ങൾ: പനി, ത്വക്കിൽ തിണർപ്പ്, സന്ധിവേദന, കാഴ്ച മങ്ങൽ എന്നിവ ഉണ്ടോ?',
    },
    type: 'multi_select',
    options: [
      { value: 'ros_fever', label: 'Fever / Chills', labelHi: 'बुखार / कंपकंपी' },
      { value: 'ros_rash', label: 'Skin Rash', labelHi: 'त्वचा पर दाने' },
      { value: 'ros_joint', label: 'Joint Stiffness', labelHi: 'जोड़ों में अकड़न' },
      { value: 'ros_none', label: 'None of these', labelHi: 'इनमें से कोई नहीं' }
    ],
    category: 'associated_symptoms'
  },
]

export function getQuestionSequence(complaintId) {
  const socrates = SOCRATES_QUESTIONS[complaintId] || [
    {
      id: 'generic_onset',
      question: 'When did your symptoms start?',
      questionHi: 'आपके लक्षण कब शुरू हुए?',
      questions: {
        hi: 'आपके लक्षण कब शुरू हुए?',
        bn: 'আপনার লক্ষণগুলি কখন শুরু হয়েছিল?',
        ta: 'உங்கள் அறிகுறிகள் எப்போது தொடங்கின?',
        te: 'మీ లక్షణాలు ఎప్పుడు ప్రారంభమయ్యాయి?',
        mr: 'तुमची लक्षणे कधी सुरू झाली?',
        gu: 'તમારા લક્ષણો ક્યારે શરૂ થયા?',
        kn: 'ನಿಮ್ಮ ಲಕ್ಷಣಗಳು ಯಾವಾಗ ಪ್ರಾರಂಭವಾದವು?',
        pa: 'ਤੁਹਾਡੇ ਲੱਛਣ ਕਦੋਂ ਸ਼ੁਰੂ ਹੋਏ?',
        ml: 'ലക്ഷണങ്ങൾ എപ്പോഴാണ് തുടങ്ങിയത്?',
      },
      type: 'single_select',
      options: [
        { value: 'today', label: 'Today', labelHi: 'आज' },
        { value: '1_day', label: 'Yesterday', labelHi: 'कल' },
        { value: '2_3_days', label: '2-3 days ago', labelHi: '2-3 दिन पहले' },
        { value: 'more', label: 'More than a week ago', labelHi: '1 सप्ताह से अधिक' }
      ],
      category: 'duration'
    },
    {
      id: 'generic_severity',
      question: 'On a scale of 1 to 10, how severe are your symptoms?',
      questionHi: '1 से 10 के पैमाने पर आपके लक्षण कितने गंभीर हैं?',
      questions: {
        hi: '1 से 10 के पैमाने पर आपके लक्षण कितने गंभीर हैं?',
        bn: '১ থেকে ১০ স্কেলে লক্ষণগুলি কতটা তীব্র?',
        ta: '1 முதல் 10 வரையிலான அளவில் உங்கள் அறிகுறிகள் எவ்வளவு கடுமையானவை?',
        te: '1 నుండి 10 స్కేలులో మీ లక్షణాలు ఎంత తీవ్రంగా ఉన్నాయి?',
        mr: '१ ते १० च्या प्रमाणात लक्षणे किती तीव्र आहेत?',
        gu: '૧ થી ૧૦ માં તમારા લક્ષણો કેટલા ગંભીર છે?',
        kn: '1 ರಿಂದ 10 ರ ಪ್ರಮಾಣದಲ್ಲಿ ನಿಮ್ಮ ಲಕ್ಷಣಗಳು ಎಷ್ಟು ತೀವ್ರವಾಗಿವೆ?',
        pa: '1 ਤੋਂ 10 ਦੇ ਪੈਮਾਨੇ ਤੇ ਲੱਛਣ ਕਿੰਨੇ ਗੰਭੀਰ ਹਨ?',
        ml: '1 മുതൽ 10 വരെയുള്ള സ്കെയിലിൽ ലക്ഷണങ്ങൾ എത്രത്തോളം രൂക്ഷമാണ്?',
      },
      type: 'number',
      min: 1,
      max: 10,
      category: 'severity'
    },
  ]

  return [
    {
      id: 'chief_complaint',
      question: 'What brings you to the hospital today?',
      questionHi: 'आज आप अस्पताल किस मुख्य समस्या के कारण आए हैं?',
      questions: {
        hi: 'आज आप अस्पताल किस मुख्य समस्या के कारण आए हैं?',
        bn: 'আজ কী সমস্যার কারণে হাসপাতালে এসেছেন?',
        ta: 'இன்று நீங்கள் எந்த பிரச்சனைக்காக மருத்துவமனைக்கு வந்துள்ளீர்கள்?',
        te: 'ఈరోజు మీరు ఏ సమస్య కోసం ఆసుపత్రికి వచ్చారు?',
        mr: 'आज तुम्ही कोणत्या समस्येसाठी रुग्णालयात आला आहात?',
        gu: 'આજે તમે કઈ સમસ્યા માટે હોસ્પિટલ આવ્યા છો?',
        kn: 'ಇಂದು ನೀವು ಯಾವ ಮುಖ್ಯ ಸಮಸ್ಯೆಗಾಗಿ ಆಸ್ಪತ್ರೆಗೆ ಬಂದಿದ್ದೀರಿ?',
        pa: 'ਅੱਜ ਤੁਸੀਂ ਕਿਸ ਮੁੱਖ ਸਮੱਸਿਆ ਕਾਰਨ ਹਸਪਤਾਲ ਆਏ ਹੋ?',
        ml: 'ഇന്ന് നിങ്ങൾ എന്ത് പ്രശ്നത്തിനാണ് ആശുപത്രിയിൽ എത്തിയത്?',
      },
      type: 'complaint_select',
      category: 'chief_complaint',
      required: true
    },
    ...socrates,
    ...COMMON_HISTORY_QUESTIONS,
  ]
}

export function getLocalizedQuestion(q, lang = 'en') {
  if (!q) return ''
  if (lang === 'en') return q.question
  if (q.questions && q.questions[lang]) return q.questions[lang]
  if (lang === 'hi' && q.questionHi) return q.questionHi
  return q.question
}

export function getLocalizedOption(opt, lang = 'en') {
  if (!opt) return ''
  if (lang === 'en') return opt.label
  if (opt.labels && opt.labels[lang]) return opt.labels[lang]
  if (lang === 'hi' && opt.labelHi) return opt.labelHi
  return opt.label
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
