/**
 * Offline fallback advisor — used only when the Gemini API cannot be reached
 * (no key, network down, or free-tier quota exhausted after retries).
 *
 * Design rule: this engine must never invent agronomy. It answers strictly from
 * the vetted local knowledge base, picking the chunk that matches the crop and
 * the topic the farmer actually asked about, so two different questions produce
 * two different answers. When it has nothing relevant it says so and asks for
 * the missing detail instead of returning filler advice.
 */

const cropKnowledgeBase = require('../data/cropKnowledgeBase');

/* ------------------------------------------------------------------ crops */
/* Crop names as farmers type them, across the 8 supported languages. */
const CROP_ALIASES = {
  Wheat: ['wheat', 'gehu', 'gehun', 'kanak', 'गेहूं', 'गेहूँ', 'गहू', 'ઘઉં', 'ਕਣਕ', 'গম', 'கோதுமை', 'గోధుమ'],
  Rice: ['rice', 'paddy', 'dhan', 'chawal', 'bhat', 'jhona', 'nel', 'vari', 'धान', 'चावल', 'भात', 'तांदूळ', 'ડાંગર', 'ચોખા', 'ਝੋਨਾ', 'ਚੌਲ', 'ধান', 'নেল', 'நெல்', 'அரிசி', 'వరి', 'బియ్యం'],
  Cotton: ['cotton', 'kapas', 'kapus', 'kapah', 'parutti', 'patti', 'कपास', 'कापूस', 'કપાસ', 'ਕਪਾਹ', 'তুলা', 'பருத்தி', 'పత్తి'],
  Sugarcane: ['sugarcane', 'ganna', 'us', 'sherdi', 'karumbu', 'cheraku', 'गन्ना', 'ऊस', 'શેરડી', 'ਗੰਨਾ', 'আখ', 'கரும்பு', 'చెరకు'],
  Soybean: ['soybean', 'soya', 'सोयाबीन', 'સોયાબીન', 'ਸੋਇਆਬੀਨ', 'সয়াবিন', 'சோயா', 'సోయాబీన్'],
};

/* ---------------------------------------------------------------- intents */
/* Each intent maps to the knowledge-base topics that answer it. */
const INTENTS = [
  {
    id: 'fertilizer',
    topics: ['Fertilizer', 'Balanced Fertilization', 'Soil Health'],
    keywords: ['fertilizer', 'fertiliser', 'urea', 'npk', 'dap', 'khad', 'potash', 'nitrogen',
      'phosphorus', 'manure', 'compost', 'dose', 'nutrient',
      'उर्वरक', 'खाद', 'यूरिया', 'खत', 'ખાતર', 'યુરિયા', 'ਖਾਦ', 'সার', 'উর্বর', 'உரம்', 'ఎరువు'],
  },
  {
    id: 'pest',
    topics: ['Pests & Diseases', 'Integrated Pest Management (IPM)'],
    keywords: ['pest', 'insect', 'keeda', 'kida', 'caterpillar', 'aphid', 'worm', 'borer',
      'whitefly', 'white fly', 'fly', 'flies', 'thrips', 'sundi', 'jivat', 'poka', 'poochi',
      'purugu', 'spray', 'infest', 'attack', 'larva', 'mite', 'jassid', 'bollworm',
      // hi / mr
      'कीट', 'कीड़े', 'सुंडी', 'मक्खी', 'कीड', 'माशी', 'छिड़काव', 'फवारणी', 'इल्ली',
      // gu
      'જીવાત', 'ઈયળ', 'માખી', 'છાંટ', 'છંટકાવ',
      // pa
      'ਕੀੜਾ', 'ਕੀੜੇ', 'ਮੱਖੀ', 'ਛਿੜਕ', 'ਸੁੰਡੀ',
      // bn
      'পোকা', 'মাছি', 'স্প্রে', 'ছিটা',
      // ta
      'பூச்சி', 'தெளி', 'அசுவினி',
      // te
      'పురుగు', 'ఈగ', 'పిచికారీ'],
  },
  {
    id: 'disease',
    topics: ['Pests & Diseases', 'Integrated Pest Management (IPM)'],
    keywords: ['disease', 'spot', 'spots', 'blight', 'rust', 'fungus', 'rot', 'yellowing',
      'mildew', 'wilt', 'lesion', 'patch', 'dhabba', 'bimari', 'rog', 'noi', 'vyadhi',
      // hi / mr
      'इलाज', 'बीमारी', 'रोग', 'झुलसा', 'धब्बे', 'धब्बा', 'डाग', 'पिवळे', 'पीले', 'सड़',
      // gu
      'ઈલાજ', 'સુકારો', 'રોગ', 'ધબ્બા', 'ડાઘ', 'પીળ',
      // pa
      'ਬਿਮਾਰੀ', 'ਰੋਗ', 'ਧੱਬੇ', 'ਦਾਗ', 'ਪੀਲੇ', 'ਪੀਲਾ',
      // bn
      'রোগ', 'দাগ', 'ছোপ', 'হলুদ', 'পচা',
      // ta
      'நோய்', 'புள்ளி', 'கறை', 'மஞ்சள்',
      // te
      'వ్యాధి', 'మచ్చ', 'పసుపు', 'కుళ్ళు'],
  },
  {
    id: 'irrigation',
    topics: ['Irrigation', 'Water Management', 'Sowing & Irrigation', 'Water Saving Irrigation'],
    keywords: ['irrigation', 'water', 'paani', 'pani', 'sinchai', 'drip', 'piyat', 'sprinkler',
      'thanni', 'neeru', 'jal',
      'सिंचाई', 'पानी', 'पियत', 'ਪਾਣੀ', 'পানি', 'সেচ', 'நீர்', 'நீர்ப்பாசனம்', 'నీరు'],
  },
  {
    id: 'sowing',
    topics: ['Sowing & Season', 'Sowing & Care', 'Sowing & Irrigation'],
    keywords: ['sow', 'sowing', 'seed', 'plant', 'planting', 'transplant', 'nursery', 'season',
      'variety', 'bijai', 'beej', 'vavni',
      'बुवाई', 'बीज', 'रोपाई', 'पेरणी', 'વાવણી', 'બીજ', 'ਬਿਜਾਈ', 'ਬੀਜ', 'বীজ', 'বপন', 'விதை', 'విత్తనం'],
  },
  {
    id: 'weather',
    topics: ['Weather Related Risk Management'],
    keywords: ['weather', 'rain', 'drought', 'frost', 'hail', 'flood', 'climate', 'barish',
      'मौसम', 'बारिश', 'सूखा', 'पाऊस', 'હવામાન', 'વરસાદ', 'ਮੌਸਮ', 'আবহাওয়া', 'வானிலை', 'వాతావరణం'],
  },
  {
    id: 'market',
    topics: ['Market & MSP'],
    keywords: ['price', 'msp', 'market', 'mandi', 'sell', 'rate', 'bhav',
      'भाव', 'मंडी', 'कीमत', 'બજાર', 'ભાવ', 'ਮੰਡੀ', 'বাজার', 'சந்தை', 'మార్కెట్'],
  },
  {
    id: 'organic',
    topics: ['Organic & Sustainable Practices', 'Soil Health'],
    keywords: ['organic', 'jaivik', 'natural', 'vermicompost', 'jeevamrut',
      'जैविक', 'ઓર્ગેનિક', 'ਜੈਵਿਕ', 'জৈব', 'இயற்கை', 'సేంద్రియ'],
  },
  {
    id: 'soil',
    topics: ['Soil Health'],
    keywords: ['soil', 'mitti', 'ph', 'saline', 'alkaline', 'organic carbon', 'jameen',
      'मिट्टी', 'मृदा', 'माती', 'જમીન', 'માટી', 'ਮਿੱਟੀ', 'মাটি', 'மண்', 'నేల'],
  },
];

/* ---------------------------------------------------------- localisation */
/* Framing only. All agronomic substance comes from the knowledge base, so
   nothing here can misstate a dose or a remedy. */
const UI = {
  en: {
    offline: 'The AI advisor is busy at the moment, so here is verified guidance from the Krishak Sarathi knowledge base.',
    unavailable: 'I could not reach the AI advisor just now, and I do not want to guess about your crop. Please try again in a moment.',
    clarify: 'Could you tell me a little more — which crop is it, and what exactly are you seeing (leaf spots, insects, yellowing, poor growth)?',
    consult: 'Confirm the dose and product with your local Krishi Vigyan Kendra or agri-dealer, and follow the label before spraying.',
    offTopic: 'I am the Krishak Sarathi farming advisor, so I can only help with crops, soil, irrigation, pests, diseases, weather and agriculture schemes. Please ask me a farming question.',
  },
  hi: {
    offline: 'AI सलाहकार अभी व्यस्त है, इसलिए यह जानकारी कृषक सारथि ज्ञान-भंडार से दी जा रही है।',
    unavailable: 'अभी AI सलाहकार से संपर्क नहीं हो पाया, और आपकी फसल के बारे में अंदाज़ा लगाना ठीक नहीं होगा। कृपया थोड़ी देर बाद फिर पूछें।',
    clarify: 'कृपया थोड़ा और बताइए — कौन सी फसल है, और आपको क्या दिख रहा है (पत्तों पर धब्बे, कीड़े, पीलापन, कम बढ़वार)?',
    consult: 'छिड़काव से पहले मात्रा और दवा अपने कृषि विज्ञान केंद्र या कृषि विक्रेता से पक्की कर लें और लेबल पढ़ें।',
    offTopic: 'मैं कृषक सारथि कृषि सलाहकार हूँ, इसलिए मैं केवल फसल, मिट्टी, सिंचाई, कीट, रोग, मौसम और कृषि योजनाओं में मदद कर सकता हूँ। कृपया खेती से जुड़ा सवाल पूछें।',
  },
  gu: {
    offline: 'AI સલાહકાર અત્યારે વ્યસ્ત છે, તેથી આ માહિતી કૃષક સારથિ જ્ઞાનભંડારમાંથી આપવામાં આવે છે.',
    unavailable: 'અત્યારે AI સલાહકાર સાથે સંપર્ક થઈ શક્યો નથી, અને તમારા પાક વિશે અટકળ કરવી યોગ્ય નથી. કૃપા કરીને થોડી વારે ફરી પૂછો.',
    clarify: 'કૃપા કરીને થોડું વધુ જણાવો — કયો પાક છે, અને તમને શું દેખાય છે (પાન પર ધબ્બા, જીવાત, પીળાશ, ઓછો વિકાસ)?',
    consult: 'છંટકાવ પહેલાં માત્રા અને દવા તમારા કૃષિ વિજ્ઞાન કેન્દ્ર કે કૃષિ વિક્રેતા પાસે ચકાસો અને લેબલ વાંચો.',
    offTopic: 'હું કૃષક સારથિ ખેતી સલાહકાર છું, તેથી હું ફક્ત પાક, જમીન, પિયત, જીવાત, રોગ, હવામાન અને ખેતી યોજનાઓમાં મદદ કરી શકું છું. કૃપા કરીને ખેતી અંગેનો પ્રશ્ન પૂછો.',
  },
  mr: {
    offline: 'AI सल्लागार सध्या व्यस्त आहे, म्हणून ही माहिती कृषक सारथी ज्ञानसंग्रहातून दिली आहे.',
    unavailable: 'सध्या AI सल्लागाराशी संपर्क होऊ शकला नाही, आणि तुमच्या पिकाबद्दल अंदाज बांधणे योग्य नाही. कृपया थोड्या वेळाने पुन्हा विचारा.',
    clarify: 'कृपया थोडे अधिक सांगा — कोणते पीक आहे, आणि तुम्हाला काय दिसत आहे (पानांवर डाग, कीड, पिवळेपणा, कमी वाढ)?',
    consult: 'फवारणीपूर्वी मात्रा आणि औषध तुमच्या कृषी विज्ञान केंद्रात किंवा कृषी विक्रेत्याकडे तपासा आणि लेबल वाचा.',
    offTopic: 'मी कृषक सारथी शेती सल्लागार आहे, त्यामुळे मी फक्त पीक, माती, पाणी, कीड, रोग, हवामान आणि शेती योजनांमध्ये मदत करू शकतो. कृपया शेतीविषयक प्रश्न विचारा.',
  },
  pa: {
    offline: 'AI ਸਲਾਹਕਾਰ ਇਸ ਵੇਲੇ ਰੁੱਝਿਆ ਹੋਇਆ ਹੈ, ਇਸ ਲਈ ਇਹ ਜਾਣਕਾਰੀ ਕ੍ਰਿਸ਼ਕ ਸਾਰਥੀ ਗਿਆਨ-ਭੰਡਾਰ ਤੋਂ ਦਿੱਤੀ ਜਾ ਰਹੀ ਹੈ।',
    unavailable: 'ਇਸ ਵੇਲੇ AI ਸਲਾਹਕਾਰ ਨਾਲ ਸੰਪਰਕ ਨਹੀਂ ਹੋ ਸਕਿਆ, ਅਤੇ ਤੁਹਾਡੀ ਫ਼ਸਲ ਬਾਰੇ ਅੰਦਾਜ਼ਾ ਲਾਉਣਾ ਠੀਕ ਨਹੀਂ। ਕਿਰਪਾ ਕਰਕੇ ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਪੁੱਛੋ।',
    clarify: 'ਕਿਰਪਾ ਕਰਕੇ ਥੋੜ੍ਹਾ ਹੋਰ ਦੱਸੋ — ਕਿਹੜੀ ਫ਼ਸਲ ਹੈ, ਅਤੇ ਤੁਹਾਨੂੰ ਕੀ ਦਿਖ ਰਿਹਾ ਹੈ (ਪੱਤਿਆਂ ਉੱਤੇ ਧੱਬੇ, ਕੀੜੇ, ਪੀਲਾਪਨ, ਘੱਟ ਵਾਧਾ)?',
    consult: 'ਛਿੜਕਾਅ ਤੋਂ ਪਹਿਲਾਂ ਮਾਤਰਾ ਅਤੇ ਦਵਾਈ ਆਪਣੇ ਕ੍ਰਿਸ਼ੀ ਵਿਗਿਆਨ ਕੇਂਦਰ ਜਾਂ ਖੇਤੀ ਵਿਕਰੇਤਾ ਤੋਂ ਪੱਕੀ ਕਰੋ ਅਤੇ ਲੇਬਲ ਪੜ੍ਹੋ।',
    offTopic: 'ਮੈਂ ਕ੍ਰਿਸ਼ਕ ਸਾਰਥੀ ਖੇਤੀ ਸਲਾਹਕਾਰ ਹਾਂ, ਇਸ ਲਈ ਮੈਂ ਸਿਰਫ਼ ਫ਼ਸਲ, ਮਿੱਟੀ, ਪਾਣੀ, ਕੀੜੇ, ਬਿਮਾਰੀ, ਮੌਸਮ ਅਤੇ ਖੇਤੀ ਸਕੀਮਾਂ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਖੇਤੀ ਬਾਰੇ ਸਵਾਲ ਪੁੱਛੋ।',
  },
  bn: {
    offline: 'AI পরামর্শদাতা এখন ব্যস্ত, তাই এই তথ্য কৃষক সারথি জ্ঞানভাণ্ডার থেকে দেওয়া হচ্ছে।',
    unavailable: 'এই মুহূর্তে AI পরামর্শদাতার সঙ্গে যোগাযোগ করা যায়নি, আর আপনার ফসল নিয়ে অনুমান করা ঠিক হবে না। অনুগ্রহ করে একটু পরে আবার জিজ্ঞাসা করুন।',
    clarify: 'অনুগ্রহ করে আরও একটু বলুন — কোন ফসল, আর আপনি ঠিক কী দেখছেন (পাতায় দাগ, পোকা, হলুদ হয়ে যাওয়া, কম বৃদ্ধি)?',
    consult: 'স্প্রে করার আগে মাত্রা ও ওষুধ আপনার কৃষি বিজ্ঞান কেন্দ্র বা কৃষি বিক্রেতার কাছে যাচাই করুন এবং লেবেল পড়ুন।',
    offTopic: 'আমি কৃষক সারথি কৃষি পরামর্শদাতা, তাই আমি কেবল ফসল, মাটি, সেচ, পোকা, রোগ, আবহাওয়া ও কৃষি প্রকল্প নিয়ে সাহায্য করতে পারি। অনুগ্রহ করে কৃষি সম্পর্কিত প্রশ্ন করুন।',
  },
  ta: {
    offline: 'AI ஆலோசகர் இப்போது பணியில் உள்ளார், எனவே இந்தத் தகவல் கிருஷக் சாரதி அறிவுத் தொகுப்பிலிருந்து வழங்கப்படுகிறது.',
    unavailable: 'இப்போது AI ஆலோசகரைத் தொடர்பு கொள்ள முடியவில்லை; உங்கள் பயிரைப் பற்றி ஊகிக்க விரும்பவில்லை. சிறிது நேரம் கழித்து மீண்டும் கேளுங்கள்.',
    clarify: 'தயவுசெய்து இன்னும் கொஞ்சம் சொல்லுங்கள் — எந்தப் பயிர், மேலும் நீங்கள் என்ன பார்க்கிறீர்கள் (இலையில் புள்ளிகள், பூச்சிகள், மஞ்சளாதல், வளர்ச்சிக் குறைவு)?',
    consult: 'தெளிப்பதற்கு முன் அளவையும் மருந்தையும் உங்கள் வேளாண் அறிவியல் மையம் அல்லது விவசாய விற்பனையாளரிடம் உறுதி செய்து, லேபிளைப் படியுங்கள்.',
    offTopic: 'நான் கிருஷக் சாரதி விவசாய ஆலோசகர்; பயிர், மண், நீர்ப்பாசனம், பூச்சி, நோய், வானிலை மற்றும் விவசாயத் திட்டங்கள் குறித்து மட்டுமே உதவ முடியும். தயவுசெய்து விவசாயம் தொடர்பான கேள்வியைக் கேளுங்கள்.',
  },
  kn: {
    offline: 'AI ಸಲಹೆಗಾರರು ಈಗ ಕಾರ್ಯನಿರತರಾಗಿದ್ದಾರೆ, ಆದ್ದರಿಂದ ಈ ಮಾಹಿತಿಯನ್ನು ಕೃಷಕ ಸಾರಥಿ ಜ್ಞಾನ ಭಂಡಾರದಿಂದ ನೀಡಲಾಗಿದೆ.',
    unavailable: 'ಈಗ AI ಸಲಹೆಗಾರರನ್ನು ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ, ನಿಮ್ಮ ಬೆಳೆಯ ಬಗ್ಗೆ ಊಹಿಸುವುದು ಸರಿಯಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಕೇಳಿ.',
    clarify: 'ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಹೆಚ್ಚು ತಿಳಿಸಿ — ಯಾವ ಬೆಳೆ, ಮತ್ತು ನಿಮಗೆ ಏನು ಕಾಣಿಸುತ್ತಿದೆ (ಎಲೆಗಳ ಮೇಲೆ ಕಲೆಗಳು, ಕೀಟಗಳು, ಹಳದಿ ಬಣ್ಣ, ಕಡಿಮೆ ಬೆಳವಣಿಗೆ)?',
    consult: 'ಸಿಂಪಡಿಸುವ ಮೊದಲು ಪ್ರಮಾಣ ಮತ್ತು ಔಷಧಿಯನ್ನು ನಿಮ್ಮ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ ಅಥವಾ ಕೃಷಿ ಮಾರಾಟಗಾರರಲ್ಲಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ ಮತ್ತು ಲೇಬಲ್ ಓದಿ.',
    offTopic: 'ನಾನು ಕೃಷಕ ಸಾರಥಿ ಕೃಷಿ ಸಲಹೆಗಾರ, ಆದ್ದರಿಂದ ಬೆಳೆ, ಮಣ್ಣು, ನೀರಾವರಿ, ಕೀಟ, ರೋಗ, ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಮಾತ್ರ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ದಯವಿಟ್ಟು ಕೃಷಿ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆ ಕೇಳಿ.',
  },
  te: {
    offline: 'AI సలహాదారు ప్రస్తుతం బిజీగా ఉన్నారు, అందుకే ఈ సమాచారం కృషక్ సారథి విజ్ఞాన భాండాగారం నుండి ఇవ్వబడుతోంది.',
    unavailable: 'ప్రస్తుతం AI సలహాదారుని సంప్రదించలేకపోయాను, మీ పంట గురించి ఊహించడం సరికాదు. దయచేసి కొద్దిసేపటి తర్వాత మళ్లీ అడగండి.',
    clarify: 'దయచేసి కొంచెం ఎక్కువ చెప్పండి — ఏ పంట, మరియు మీకు ఏమి కనిపిస్తోంది (ఆకులపై మచ్చలు, పురుగులు, పసుపు రంగు, తక్కువ పెరుగుదల)?',
    consult: 'పిచికారీ ముందు మోతాదు మరియు మందును మీ కృషి విజ్ఞాన కేంద్రం లేదా వ్యవసాయ విక్రేత వద్ద నిర్ధారించుకోండి, లేబుల్ చదవండి.',
    offTopic: 'నేను కృషక్ సారథి వ్యవసాయ సలహాదారుని, కాబట్టి పంటలు, నేల, నీటిపారుదల, పురుగులు, వ్యాధులు, వాతావరణం మరియు వ్యవసాయ పథకాల గురించి మాత్రమే సహాయం చేయగలను. దయచేసి వ్యవసాయ ప్రశ్న అడగండి.',
  },
};

/* Generic farming vocabulary — used only to tell "vague farming question" apart
   from "not a farming question at all" when no crop or intent was recognised. */
const FARMING_HINTS = [
  'crop', 'farm', 'field', 'soil', 'plant', 'leaf', 'leaves', 'yield', 'harvest',
  'sow', 'grow', 'acre', 'bigha', 'hectare', 'kisan', 'kheti', 'fasal',
  'फसल', 'खेत', 'खेती', 'पौधा', 'पत्त', 'पैदावार', 'पीक', 'शेत', 'शेती',
  'પાક', 'ખેત', 'ખેતી', 'છોડ', 'ਫ਼ਸਲ', 'ਫਸਲ', 'ਖੇਤ', 'ਖੇਤੀ', 'বুনা',
  'ফসল', 'জমি', 'চাষ', 'গাছ', 'பயிர்', 'நிலம்', 'விவசாய', 'செடி',
  'పంట', 'పొలం', 'వ్యవసాయ', 'మొక్క',
];

const text = (lang, key) => (UI[lang] || UI.en)[key];

const matchesAny = (haystack, needles) => needles.some((n) => haystack.includes(n));

const looksLikeFarming = (question) => matchesAny(question.toLowerCase(), FARMING_HINTS);

/** Which crop is the farmer asking about, if any? */
function detectCrop(question) {
  const q = question.toLowerCase();
  for (const [crop, aliases] of Object.entries(CROP_ALIASES)) {
    if (matchesAny(q, aliases)) return crop;
  }
  return null;
}

/** What is the farmer asking about — fertilizer, pests, irrigation…? */
function detectIntents(question) {
  const q = question.toLowerCase();
  return INTENTS.filter((intent) => matchesAny(q, intent.keywords));
}

/**
 * Build an answer from the knowledge base for this specific question.
 *
 * @param {string} message   farmer's question
 * @param {string} language  detected language code
 * @param {Array}  ragChunks chunks already retrieved by utils/rag.js
 */
function generateDynamicAdvice(message, language = 'en', ragChunks = []) {
  const lang = UI[language] ? language : 'en';
  const question = message || '';
  const crop = detectCrop(question);
  const intents = detectIntents(question);
  const wantedTopics = intents.flatMap((i) => i.topics);
  const needsChemicalWarning = intents.some((i) => ['pest', 'disease', 'fertilizer'].includes(i.id));

  // Rank the knowledge base by how well each chunk matches THIS question:
  // the right crop scores highest, then the right topic, then a RAG hit.
  const ragIds = new Set((ragChunks || []).map((c) => c.id));
  const scored = cropKnowledgeBase
    .map((chunk) => {
      let score = 0;
      if (crop && chunk.crop === crop) score += 6;
      if (wantedTopics.includes(chunk.topic)) score += 4;
      if (ragIds.has(chunk.id)) score += 2;
      if (!crop && chunk.crop === 'General' && wantedTopics.includes(chunk.topic)) score += 2;
      return { chunk, score };
    })
    .filter((s) => s.score >= 4)
    .sort((a, b) => b.score - a.score);

  // Nothing in the knowledge base covers this question. Say so honestly rather
  // than returning unrelated advice.
  if (scored.length === 0) {
    if (!crop && intents.length === 0) {
      return looksLikeFarming(question)
        ? `${text(lang, 'unavailable')}\n\n${text(lang, 'clarify')}`
        : text(lang, 'offTopic');
    }
    return text(lang, 'unavailable');
  }

  // The crop-specific chunk, plus at most one General practice note. Never a
  // second crop — that is how the old engine drifted off the question.
  const picked = [scored[0].chunk];
  const general = scored.find(
    (s) => s.chunk.id !== picked[0].id && s.chunk.crop === 'General'
  );
  if (general) picked.push(general.chunk);

  const body = picked
    .map((c) => `**${c.crop} — ${c.topic}**\n${c.content}`)
    .join('\n\n');

  const parts = [`🌾 ${text(lang, 'offline')}`, body];
  if (needsChemicalWarning) parts.push(`⚠️ ${text(lang, 'consult')}`);

  return parts.join('\n\n');
}

/** Polite redirect used when a question has nothing to do with farming. */
const offTopicReply = (language = 'en') => text(UI[language] ? language : 'en', 'offTopic');

module.exports = { generateDynamicAdvice, offTopicReply, detectCrop, detectIntents };
