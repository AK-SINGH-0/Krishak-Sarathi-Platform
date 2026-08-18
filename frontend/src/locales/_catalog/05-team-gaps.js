/* Team member details (arrays included) plus the Gujarati keys that were
   already missing from the project before this translation pass. */

const DEGREE = {
  en: 'B.Tech Computer Engineering', hi: 'बी.टेक कंप्यूटर इंजीनियरिंग', gu: 'બી.ટેક કમ્પ્યુટર એન્જિનિયરિંગ',
  mr: 'बी.टेक संगणक अभियांत्रिकी', bn: 'বি.টেক কম্পিউটার ইঞ্জিনিয়ারিং', te: 'బి.టెక్ కంప్యూటర్ ఇంజనీరింగ్',
  ta: 'பி.டெக் கணினிப் பொறியியல்', kn: 'ಬಿ.ಟೆಕ್ ಕಂಪ್ಯೂಟರ್ ಎಂಜಿನಿಯರಿಂಗ್', pa: 'ਬੀ.ਟੈਕ ਕੰਪਿਊਟਰ ਇੰਜੀਨੀਅਰਿੰਗ',
};

const UNIVERSITY = {
  en: 'Marwadi University', hi: 'मारवाड़ी विश्वविद्यालय', gu: 'મારવાડી યુનિવર્સિટી',
  mr: 'मारवाडी विद्यापीठ', bn: 'মারওয়াড়ি বিশ্ববিদ্যালয়', te: 'మార్వాడీ యూనివర్సిటీ',
  ta: 'மார்வாடி பல்கலைக்கழகம்', kn: 'ಮಾರ್ವಾಡಿ ವಿಶ್ವವಿದ್ಯಾಲಯ', pa: 'ਮਾਰਵਾੜੀ ਯੂਨੀਵਰਸਿਟੀ',
};

/* Technology names stay in their standard form in every language — that is how
   engineers actually write them — so these arrays are shared. */
const SKILLS_SUSHIL = ['React.js', 'Node.js', 'MongoDB', 'REST API', 'UI/UX', 'Testing'];
const SKILLS_ANKUSH_BASE = ['Cloud', 'GitHub'];
const SKILLS_BIJANSHU_BASE = ['Python', 'Backend', 'AI'];

const sameForAll = (value) => ({
  en: value, hi: value, gu: value, mr: value, bn: value,
  te: value, ta: value, kn: value, pa: value,
});

module.exports = {
  // -------------------------------------------------- team: developers
  'team.developers.sushil.degree': DEGREE,
  'team.developers.sushil.university': UNIVERSITY,
  'team.developers.sushil.designation': { en: 'Full Stack Developer', hi: 'फुल स्टैक डेवलपर', gu: 'ફુલ સ્ટેક ડેવલપર', mr: 'फुल स्टॅक डेव्हलपर', bn: 'ফুল স্ট্যাক ডেভেলপার', te: 'ఫుల్ స్టాక్ డెవలపర్', ta: 'ஃபுல் ஸ்டாக் டெவலப்பர்', kn: 'ಫುಲ್ ಸ್ಟ್ಯಾಕ್ ಡೆವಲಪರ್', pa: 'ਫੁੱਲ ਸਟੈਕ ਡਿਵੈਲਪਰ' },
  'team.developers.sushil.role': { en: 'Frontend Development, UI/UX Design & Testing', hi: 'फ्रंटएंड डेवलपमेंट, UI/UX डिज़ाइन और टेस्टिंग', gu: 'ફ્રન્ટએન્ડ ડેવલપમેન્ટ, UI/UX ડિઝાઇન અને ટેસ્ટિંગ', mr: 'फ्रंटएंड डेव्हलपमेंट, UI/UX डिझाइन व चाचणी', bn: 'ফ্রন্টএন্ড ডেভেলপমেন্ট, UI/UX ডিজাইন ও টেস্টিং', te: 'ఫ్రంటెండ్ డెవలప్‌మెంట్, UI/UX డిజైన్, టెస్టింగ్', ta: 'ஃபிரண்ட்எண்ட் மேம்பாடு, UI/UX வடிவமைப்பு, சோதனை', kn: 'ಫ್ರಂಟ್‌ಎಂಡ್ ಅಭಿವೃದ್ಧಿ, UI/UX ವಿನ್ಯಾಸ ಮತ್ತು ಪರೀಕ್ಷೆ', pa: 'ਫ੍ਰੰਟਐਂਡ ਵਿਕਾਸ, UI/UX ਡਿਜ਼ਾਈਨ ਤੇ ਟੈਸਟਿੰਗ' },
  'team.developers.sushil.skills': sameForAll(SKILLS_SUSHIL),

  'team.developers.ankush.degree': DEGREE,
  'team.developers.ankush.university': UNIVERSITY,
  'team.developers.ankush.designation': sameForAll('CloudStack.dev'),
  'team.developers.ankush.role': { en: 'Documentation, Presentation Lead & Research Analyst', hi: 'दस्तावेज़ीकरण, प्रस्तुति प्रमुख और शोध विश्लेषक', gu: 'દસ્તાવેજીકરણ, પ્રેઝન્ટેશન લીડ અને સંશોધન વિશ્લેષક', mr: 'दस्तऐवजीकरण, सादरीकरण प्रमुख व संशोधन विश्लेषक', bn: 'ডকুমেন্টেশন, উপস্থাপনা প্রধান ও গবেষণা বিশ্লেষক', te: 'డాక్యుమెంటేషన్, ప్రెజెంటేషన్ లీడ్, పరిశోధన విశ్లేషకుడు', ta: 'ஆவணப்படுத்தல், விளக்கக்காட்சி தலைவர், ஆராய்ச்சி ஆய்வாளர்', kn: 'ದಾಖಲಾತಿ, ಪ್ರಸ್ತುತಿ ಮುಖ್ಯಸ್ಥ ಮತ್ತು ಸಂಶೋಧನಾ ವಿಶ್ಲೇಷಕ', pa: 'ਦਸਤਾਵੇਜ਼ੀਕਰਨ, ਪੇਸ਼ਕਾਰੀ ਮੁਖੀ ਤੇ ਖੋਜ ਵਿਸ਼ਲੇਸ਼ਕ' },
  'team.developers.ankush.skills': {
    en: ['Documentation', 'Research', 'Presentation', ...SKILLS_ANKUSH_BASE, 'Project Planning'],
    hi: ['दस्तावेज़ीकरण', 'शोध', 'प्रस्तुति', ...SKILLS_ANKUSH_BASE, 'प्रोजेक्ट योजना'],
    gu: ['દસ્તાવેજીકરણ', 'સંશોધન', 'પ્રેઝન્ટેશન', ...SKILLS_ANKUSH_BASE, 'પ્રોજેક્ટ પ્લાનિંગ'],
    mr: ['दस्तऐवजीकरण', 'संशोधन', 'सादरीकरण', ...SKILLS_ANKUSH_BASE, 'प्रकल्प नियोजन'],
    bn: ['ডকুমেন্টেশন', 'গবেষণা', 'উপস্থাপনা', ...SKILLS_ANKUSH_BASE, 'প্রকল্প পরিকল্পনা'],
    te: ['డాక్యుమెంటేషన్', 'పరిశోధన', 'ప్రెజెంటేషన్', ...SKILLS_ANKUSH_BASE, 'ప్రాజెక్ట్ ప్లానింగ్'],
    ta: ['ஆவணப்படுத்தல்', 'ஆராய்ச்சி', 'விளக்கக்காட்சி', ...SKILLS_ANKUSH_BASE, 'திட்ட திட்டமிடல்'],
    kn: ['ದಾಖಲಾತಿ', 'ಸಂಶೋಧನೆ', 'ಪ್ರಸ್ತುತಿ', ...SKILLS_ANKUSH_BASE, 'ಯೋಜನಾ ಯೋಜನೆ'],
    pa: ['ਦਸਤਾਵੇਜ਼ੀਕਰਨ', 'ਖੋਜ', 'ਪੇਸ਼ਕਾਰੀ', ...SKILLS_ANKUSH_BASE, 'ਪ੍ਰੋਜੈਕਟ ਯੋਜਨਾ'],
  },

  'team.developers.bijanshu.degree': DEGREE,
  'team.developers.bijanshu.university': UNIVERSITY,
  'team.developers.bijanshu.designation': { en: 'AI / ML Automation Engineer', hi: 'एआई / एमएल ऑटोमेशन इंजीनियर', gu: 'AI / ML ઓટોમેશન એન્જિનિયર', mr: 'एआय / एमएल ऑटोमेशन अभियंता', bn: 'এআই / এমএল অটোমেশন ইঞ্জিনিয়ার', te: 'AI / ML ఆటోమేషన్ ఇంజనీర్', ta: 'AI / ML தானியக்க பொறியாளர்', kn: 'AI / ML ಆಟೊಮೇಷನ್ ಎಂಜಿನಿಯರ್', pa: 'AI / ML ਆਟੋਮੇਸ਼ਨ ਇੰਜੀਨੀਅਰ' },
  'team.developers.bijanshu.role': { en: 'Backend Development, AI/ML & System Integration', hi: 'बैकएंड डेवलपमेंट, एआई/एमएल और सिस्टम एकीकरण', gu: 'બેકએન્ડ ડેવલપમેન્ટ, AI/ML અને સિસ્ટમ ઇન્ટિગ્રેશન', mr: 'बॅकएंड डेव्हलपमेंट, एआय/एमएल व प्रणाली एकत्रीकरण', bn: 'ব্যাকএন্ড ডেভেলপমেন্ট, এআই/এমএল ও সিস্টেম ইন্টিগ্রেশন', te: 'బ్యాకెండ్ డెవలప్‌మెంట్, AI/ML, సిస్టమ్ ఇంటిగ్రేషన్', ta: 'பேக்எண்ட் மேம்பாடு, AI/ML மற்றும் அமைப்பு ஒருங்கிணைப்பு', kn: 'ಬ್ಯಾಕೆಂಡ್ ಅಭಿವೃದ್ಧಿ, AI/ML ಮತ್ತು ಸಿಸ್ಟಂ ಏಕೀಕರಣ', pa: 'ਬੈਕਐਂਡ ਵਿਕਾਸ, AI/ML ਤੇ ਸਿਸਟਮ ਏਕੀਕਰਨ' },
  'team.developers.bijanshu.skills': {
    en: [...SKILLS_BIJANSHU_BASE, 'Machine Learning', 'Automation', 'API Integration'],
    hi: [...SKILLS_BIJANSHU_BASE, 'मशीन लर्निंग', 'ऑटोमेशन', 'API एकीकरण'],
    gu: [...SKILLS_BIJANSHU_BASE, 'મશીન લર્નિંગ', 'ઓટોમેશન', 'API ઇન્ટિગ્રેશન'],
    mr: [...SKILLS_BIJANSHU_BASE, 'मशीन लर्निंग', 'ऑटोमेशन', 'API एकत्रीकरण'],
    bn: [...SKILLS_BIJANSHU_BASE, 'মেশিন লার্নিং', 'অটোমেশন', 'API ইন্টিগ্রেশন'],
    te: [...SKILLS_BIJANSHU_BASE, 'మెషిన్ లెర్నింగ్', 'ఆటోమేషన్', 'API ఇంటిగ్రేషన్'],
    ta: [...SKILLS_BIJANSHU_BASE, 'இயந்திரக் கற்றல்', 'தானியக்கம்', 'API ஒருங்கிணைப்பு'],
    kn: [...SKILLS_BIJANSHU_BASE, 'ಯಂತ್ರ ಕಲಿಕೆ', 'ಆಟೊಮೇಷನ್', 'API ಏಕೀಕರಣ'],
    pa: [...SKILLS_BIJANSHU_BASE, 'ਮਸ਼ੀਨ ਲਰਨਿੰਗ', 'ਆਟੋਮੇਸ਼ਨ', 'API ਏਕੀਕਰਨ'],
  },

  'team.guide.expertise': {
    en: ['Project Mentorship', 'System Design', 'Research Guidance', 'AI & Machine Learning', 'Academic Review'],
    hi: ['प्रोजेक्ट मार्गदर्शन', 'सिस्टम डिज़ाइन', 'शोध मार्गदर्शन', 'एआई और मशीन लर्निंग', 'अकादमिक समीक्षा'],
    gu: ['પ્રોજેક્ટ માર્ગદર્શન', 'સિસ્ટમ ડિઝાઇન', 'સંશોધન માર્ગદર્શન', 'AI અને મશીન લર્નિંગ', 'શૈક્ષણિક સમીક્ષા'],
    mr: ['प्रकल्प मार्गदर्शन', 'प्रणाली रचना', 'संशोधन मार्गदर्शन', 'एआय व मशीन लर्निंग', 'शैक्षणिक समीक्षा'],
    bn: ['প্রকল্প পরামর্শ', 'সিস্টেম ডিজাইন', 'গবেষণা নির্দেশনা', 'এআই ও মেশিন লার্নিং', 'একাডেমিক পর্যালোচনা'],
    te: ['ప్రాజెక్ట్ మార్గదర్శకత్వం', 'సిస్టమ్ డిజైన్', 'పరిశోధన మార్గదర్శకత్వం', 'AI మరియు మెషిన్ లెర్నింగ్', 'విద్యా సమీక్ష'],
    ta: ['திட்ட வழிகாட்டல்', 'அமைப்பு வடிவமைப்பு', 'ஆராய்ச்சி வழிகாட்டல்', 'AI மற்றும் இயந்திரக் கற்றல்', 'கல்வி மதிப்பாய்வு'],
    kn: ['ಯೋಜನಾ ಮಾರ್ಗದರ್ಶನ', 'ವ್ಯವಸ್ಥೆ ವಿನ್ಯಾಸ', 'ಸಂಶೋಧನಾ ಮಾರ್ಗದರ್ಶನ', 'AI ಮತ್ತು ಯಂತ್ರ ಕಲಿಕೆ', 'ಶೈಕ್ಷಣಿಕ ಪರಿಶೀಲನೆ'],
    pa: ['ਪ੍ਰੋਜੈਕਟ ਅਗਵਾਈ', 'ਸਿਸਟਮ ਡਿਜ਼ਾਈਨ', 'ਖੋਜ ਅਗਵਾਈ', 'AI ਤੇ ਮਸ਼ੀਨ ਲਰਨਿੰਗ', 'ਅਕਾਦਮਿਕ ਸਮੀਖਿਆ'],
  },

  // ------------------------------- Gujarati keys missing before this work
  'contact.cards.office.title': { gu: 'અમારી ઓફિસ' },
  'contact.cards.office.text': { gu: '123 એગ્રી-ટેક પાર્ક, રાજકોટ, ગુજરાત 360003' },
  'contact.form.contactLabel': { gu: 'ઈમેલ / ફોન' },
  'contact.form.contactPlaceholder': { gu: 'તમારો ઈમેલ કે ફોન નંબર લખો' },
  'contact.form.submit': { gu: 'સંદેશ મોકલો' },
  'contact.form.successTitle': { gu: 'આભાર!' },
  'contact.form.successText': { gu: 'તમારો સંદેશ સફળતાપૂર્વક મોકલાયો છે. અમારી ટીમ ટૂંક સમયમાં સંપર્ક કરશે.' },
  'footer.contactUs.title': { gu: 'અમારો સંપર્ક કરો' },
  'footer.contactUs.email': { gu: 'ઈમેલ: support@krishaksarathi.com' },
  'footer.contactUs.phone': { gu: 'ફોન: +91 1800 123 4567' },
  'footer.contactUs.telephone': { gu: 'ટેલિફોન: +91 1800 123' },
  'footer.contactUs.location': { gu: 'સ્થળ: રાજકોટ, ગુજરાત' },
  'footer.contactUs.pin': { gu: 'પિન કોડ: 360003' },
  'footer.resources.title': { gu: 'સંસાધનો' },
  'footer.resources.cropLibrary': { gu: 'પાક ગ્રંથાલય' },
  'footer.resources.marketPrices': { gu: 'બજારભાવ' },
  'footer.resources.schemes': { gu: 'સરકારી યોજનાઓ' },
  'footer.resources.weather': { gu: 'હવામાન' },
  'footer.resources.voiceAdvisor': { gu: 'અવાજ સલાહકાર' },
  'footer.resources.aiAdvisor': { gu: 'AI સલાહકાર' },
  'team.card.projectRole': { gu: 'પ્રોજેક્ટમાં ભૂમિકા' },
  'team.card.skills': { gu: 'કૌશલ્યો' },
  'team.project.text': { gu: 'કૃષક સારથિ એ AI-આધારિત સ્માર્ટ કૃષિ પ્લેટફોર્મ છે, જે બહુભાષી અવાજ સહાય, હવામાન આગાહી, બજારભાવ, પાક ભલામણો, સરકારી યોજનાઓ, રોગ ઓળખ અને બુદ્ધિશાળી કૃષિ માર્ગદર્શન દ્વારા ખેડૂતોને મદદ કરે છે.' },
  'terms.sections.service.title': { gu: '2. સેવાનો ઉપયોગ' },
  'terms.sections.service.text': { gu: 'કૃષક સારથિ કૃષિ સલાહ, બજારભાવ અને હવામાન માહિતી પૂરી પાડે છે. આ માહિતી માત્ર શૈક્ષણિક અને માહિતીના હેતુ માટે છે અને તેને ખાતરીપૂર્વકની વ્યાવસાયિક સલાહ ગણવી નહીં. મોટા આર્થિક નિર્ણય પહેલાં સ્થાનિક નિષ્ણાતોની સલાહ લેવી.' },
  'terms.sections.accounts.title': { gu: '3. વપરાશકર્તા ખાતાં' },
  'terms.sections.accounts.text': { gu: 'અમારી પાસે ખાતું બનાવતી વખતે તમારે સચોટ, સંપૂર્ણ અને અદ્યતન માહિતી આપવી જોઈએ. તેમ ન કરવાથી શરતોનો ભંગ થાય છે, જેના પરિણામે તમારું ખાતું તાત્કાલિક બંધ થઈ શકે છે.' },
  'terms.sections.aiAdvice.title': { gu: '4. AI સલાહ અંગે ડિસ્ક્લેમર' },
  'terms.sections.aiAdvice.text': { gu: 'રોગ ઓળખ અને AI સલાહ સુવિધાઓ મશીન લર્નિંગનો ઉપયોગ કરે છે. અમે ચોકસાઈ માટે પ્રયત્નશીલ છીએ, છતાં AI ક્યારેક ખોટા સૂચનો આપી શકે છે. માત્ર AI સલાહના આધારે લીધેલાં પગલાંથી થતા પાક નુકસાન માટે કૃષક સારથિ જવાબદાર નથી.' },
  'terms.sections.changes.title': { gu: '5. શરતોમાં ફેરફાર' },
  'terms.sections.changes.text': { gu: 'આ શરતોમાં કોઈપણ સમયે ફેરફાર કરવાનો કે તેને બદલવાનો અધિકાર અમે અનામત રાખીએ છીએ. કોઈપણ મહત્વપૂર્ણ ફેરફારની જાણ અમે અમારા પ્લેટફોર્મ પર કરીશું.' },
};
