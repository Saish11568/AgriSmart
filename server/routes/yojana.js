const express = require('express');
const router = express.Router();

const yojanaData = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    nameHi: 'प्रधानमंत्री किसान सम्मान निधि',
    nameMr: 'प्रधानमंत्री किसान सन्मान निधी',
    icon: '💰',
    category: 'Financial Aid',
    benefit: '₹6,000 per year (₹2,000 every 4 months)',
    benefitHi: '₹6,000 प्रति वर्ष (हर 4 महीने में ₹2,000)',
    benefitMr: '₹6,000 प्रति वर्ष (दर 4 महिन्यांनी ₹2,000)',
    description: 'Direct income support to all landholder farmer families. Money is transferred directly to bank accounts in 3 installments.',
    descriptionHi: 'सभी भूधारक किसान परिवारों को प्रत्यक्ष आय सहायता। पैसा 3 किश्तों में सीधे बैंक खातों में भेजा जाता है।',
    descriptionMr: 'सर्व भूधारक शेतकरी कुटुंबांना थेट उत्पन्न सहाय्य. पैसे 3 हप्त्यांमध्ये थेट बँक खात्यात पाठवले जातात.',
    eligibility: [
      'All landholder farmer families',
      'Must have cultivable land as per state records',
      'Aadhaar number mandatory',
      'Bank account linked with Aadhaar'
    ],
    eligibilityHi: [
      'सभी भूधारक किसान परिवार',
      'राज्य रिकॉर्ड के अनुसार कृषि योग्य भूमि होनी चाहिए',
      'आधार नंबर अनिवार्य',
      'आधार से जुड़ा बैंक खाता'
    ],
    eligibilityMr: [
      'सर्व भूधारक शेतकरी कुटुंबे',
      'राज्य नोंदणीनुसार लागवडीयोग्य जमीन असणे आवश्यक',
      'आधार क्रमांक अनिवार्य',
      'आधारशी जोडलेले बँक खाते'
    ],
    howToApply: 'Visit pmkisan.gov.in or contact your local CSC/Agriculture Office',
    howToApplyHi: 'pmkisan.gov.in पर जाएं या अपने स्थानीय CSC/कृषि कार्यालय से संपर्क करें',
    howToApplyMr: 'pmkisan.gov.in वर जा किंवा तुमच्या स्थानिक CSC/कृषी कार्यालयाशी संपर्क साधा',
    officialUrl: 'https://pmkisan.gov.in',
    status: 'Active',
    lastUpdated: '2026-04-01'
  },
  {
    id: 'pmfby',
    name: 'PM Fasal Bima Yojana (PMFBY)',
    nameHi: 'प्रधानमंत्री फसल बीमा योजना',
    nameMr: 'प्रधानमंत्री पीक विमा योजना',
    icon: '🛡️',
    category: 'Insurance',
    benefit: 'Crop insurance at just 1.5-5% premium (govt pays rest)',
    benefitHi: 'सिर्फ 1.5-5% प्रीमियम पर फसल बीमा (बाकी सरकार देती है)',
    benefitMr: 'केवळ 1.5-5% प्रीमियमवर पीक विमा (उर्वरित सरकार देते)',
    description: 'Comprehensive crop insurance covering natural calamities, pests, and diseases. Premium: 2% for Kharif, 1.5% for Rabi, 5% for horticulture.',
    descriptionHi: 'प्राकृतिक आपदाओं, कीटों और रोगों को कवर करने वाला व्यापक फसल बीमा।',
    descriptionMr: 'नैसर्गिक आपत्ती, कीटक आणि रोगांना कव्हर करणारा सर्वसमावेशक पीक विमा.',
    eligibility: [
      'All farmers (mandatory for loanee, voluntary for others)',
      'Crop must be notified under the scheme',
      'Must apply before sowing deadline',
      'Aadhaar and bank account required'
    ],
    eligibilityHi: [
      'सभी किसान (ऋणी के लिए अनिवार्य, अन्य के लिए स्वैच्छिक)',
      'फसल योजना के तहत अधिसूचित होनी चाहिए',
      'बुवाई की अंतिम तिथि से पहले आवेदन करना होगा',
      'आधार और बैंक खाता आवश्यक'
    ],
    eligibilityMr: [
      'सर्व शेतकरी (कर्जदारांसाठी अनिवार्य, इतरांसाठी ऐच्छिक)',
      'पीक योजनेंतर्गत अधिसूचित असणे आवश्यक',
      'पेरणीच्या अंतिम तारखेपूर्वी अर्ज करणे आवश्यक',
      'आधार आणि बँक खाते आवश्यक'
    ],
    howToApply: 'Apply through pmfby.gov.in, banks, or CSC centres before sowing season',
    officialUrl: 'https://pmfby.gov.in',
    status: 'Active',
    lastUpdated: '2026-03-15'
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    nameHi: 'किसान क्रेडिट कार्ड',
    nameMr: 'किसान क्रेडिट कार्ड',
    icon: '💳',
    category: 'Financial Aid',
    benefit: 'Crop loans at 4% interest (with subvention) up to ₹3 lakh',
    benefitHi: '4% ब्याज पर फसल ऋण (सब्सिडी सहित) ₹3 लाख तक',
    benefitMr: '4% व्याजदरावर पीक कर्ज (सवलतीसह) ₹3 लाखांपर्यंत',
    description: 'Credit card facility for farmers to get timely credit for crop production, post-harvest expenses, and maintenance. Interest subvention of 2% + 3% prompt repayment bonus = effective rate of 4%.',
    descriptionHi: 'किसानों को फसल उत्पादन, कटाई के बाद के खर्च और रखरखाव के लिए समय पर ऋण प्राप्त करने की क्रेडिट कार्ड सुविधा।',
    descriptionMr: 'शेतकऱ्यांना पीक उत्पादन, कापणीनंतरचे खर्च आणि देखभालीसाठी वेळेवर कर्ज मिळवण्यासाठी क्रेडिट कार्ड सुविधा.',
    eligibility: [
      'All farmers — individual or joint',
      'Owner cultivators, tenant farmers, sharecroppers',
      'Self-help groups and joint liability groups',
      'Age: 18-75 years'
    ],
    eligibilityHi: [
      'सभी किसान — व्यक्तिगत या संयुक्त',
      'मालिक किसान, किरायेदार किसान, बटाईदार',
      'स्वयं सहायता समूह और संयुक्त देयता समूह',
      'आयु: 18-75 वर्ष'
    ],
    eligibilityMr: [
      'सर्व शेतकरी — वैयक्तिक किंवा संयुक्त',
      'मालक शेतकरी, भाडेकरू शेतकरी, वाटेकरी',
      'स्वयं सहाय्यता गट आणि संयुक्त दायित्व गट',
      'वय: 18-75 वर्षे'
    ],
    howToApply: 'Apply at any bank branch with land records, Aadhaar, and passport-size photo',
    officialUrl: 'https://pmkisan.gov.in/KCCForm.aspx',
    status: 'Active',
    lastUpdated: '2026-02-20'
  },
  {
    id: 'soil-health',
    name: 'Soil Health Card Scheme',
    nameHi: 'मृदा स्वास्थ्य कार्ड योजना',
    nameMr: 'मृदा आरोग्य कार्ड योजना',
    icon: '🌱',
    category: 'Infrastructure',
    benefit: 'Free soil testing and customized fertilizer recommendations',
    benefitHi: 'मुफ्त मिट्टी परीक्षण और अनुकूलित उर्वरक सिफारिशें',
    benefitMr: 'मोफत माती परीक्षण आणि सानुकूलित खत शिफारसी',
    description: 'Government provides free soil testing reports every 2 years with crop-specific fertilizer recommendations to improve soil fertility and reduce input costs.',
    descriptionHi: 'सरकार हर 2 साल में मुफ्त मिट्टी परीक्षण रिपोर्ट देती है जिसमें फसल-विशिष्ट उर्वरक सिफारिशें शामिल हैं।',
    descriptionMr: 'सरकार दर 2 वर्षांनी पीक-विशिष्ट खत शिफारशींसह मोफत माती चाचणी अहवाल देते.',
    eligibility: [
      'All farmers across India',
      'No land size restriction',
      'Free of cost'
    ],
    eligibilityHi: [
      'पूरे भारत के सभी किसान',
      'भूमि आकार पर कोई प्रतिबंध नहीं',
      'नि:शुल्क'
    ],
    eligibilityMr: [
      'संपूर्ण भारतातील सर्व शेतकरी',
      'जमिनीच्या आकारावर कोणतेही बंधन नाही',
      'विनामूल्य'
    ],
    howToApply: 'Contact nearest Krishi Vigyan Kendra or agriculture department office',
    officialUrl: 'https://soilhealth.dac.gov.in',
    status: 'Active',
    lastUpdated: '2026-01-10'
  },
  {
    id: 'pm-kusum',
    name: 'PM-KUSUM (Solar Pump Scheme)',
    nameHi: 'पीएम-कुसुम (सौर पम्प योजना)',
    nameMr: 'पीएम-कुसुम (सौर पंप योजना)',
    icon: '☀️',
    category: 'Infrastructure',
    benefit: 'Up to 90% subsidy on solar-powered irrigation pumps',
    benefitHi: 'सौर ऊर्जा सिंचाई पम्पों पर 90% तक सब्सिडी',
    benefitMr: 'सौरऊर्जा सिंचन पंपांवर 90% पर्यंत अनुदान',
    description: 'Install solar pumps for irrigation with massive subsidy. Also earn by selling surplus solar power to DISCOM. 3 components: Grid-connected solar, standalone pumps, solarization of existing pumps.',
    descriptionHi: 'भारी सब्सिडी के साथ सिंचाई के लिए सौर पम्प लगाएं। अतिरिक्त सौर ऊर्जा डिस्कॉम को बेचकर भी कमाएं।',
    descriptionMr: 'मोठ्या अनुदानासह सिंचनासाठी सौर पंप बसवा. अतिरिक्त सौरऊर्जा डिस्कॉमला विकून कमाई करा.',
    eligibility: [
      'All farmers with agricultural land',
      'Both individual and group applications accepted',
      'Existing grid-connected or diesel pump owners',
      'Priority for drought-prone and low-income areas'
    ],
    eligibilityHi: [
      'कृषि भूमि वाले सभी किसान',
      'व्यक्तिगत और समूह दोनों आवेदन स्वीकार्य',
      'मौजूदा ग्रिड-कनेक्टेड या डीजल पम्प मालिक',
      'सूखा-प्रवण और कम आय वाले क्षेत्रों को प्राथमिकता'
    ],
    eligibilityMr: [
      'शेतजमीन असलेले सर्व शेतकरी',
      'वैयक्तिक आणि सामूहिक दोन्ही अर्ज स्वीकार्य',
      'विद्यमान ग्रिड-कनेक्टेड किंवा डिझेल पंप मालक',
      'दुष्काळप्रवण आणि कमी उत्पन्न असलेल्या भागांना प्राधान्य'
    ],
    howToApply: 'Apply through state DISCOM or mnre.gov.in portal',
    officialUrl: 'https://mnre.gov.in/solar/schemes',
    status: 'Active',
    lastUpdated: '2026-03-01'
  },
  {
    id: 'enam',
    name: 'e-NAM (Electronic National Agriculture Market)',
    nameHi: 'ई-नाम (इलेक्ट्रॉनिक राष्ट्रीय कृषि बाजार)',
    nameMr: 'ई-नाम (इलेक्ट्रॉनिक राष्ट्रीय कृषी बाजार)',
    icon: '🏪',
    category: 'Market Access',
    benefit: 'Online trading platform — better prices, transparent bidding',
    benefitHi: 'ऑनलाइन ट्रेडिंग प्लेटफॉर्म — बेहतर कीमतें, पारदर्शी बोली',
    benefitMr: 'ऑनलाइन ट्रेडिंग प्लॅटफॉर्म — चांगले दर, पारदर्शक बोली',
    description: 'Pan-India electronic trading portal connecting APMC mandis. Farmers can sell to buyers across India, getting competitive prices without middlemen.',
    descriptionHi: 'APMC मंडियों को जोड़ने वाला अखिल भारतीय इलेक्ट्रॉनिक ट्रेडिंग पोर्टल। किसान बिचौलियों के बिना प्रतिस्पर्धी कीमतों पर पूरे भारत के खरीदारों को बेच सकते हैं।',
    descriptionMr: 'APMC बाजारांना जोडणारे अखिल भारतीय इलेक्ट्रॉनिक ट्रेडिंग पोर्टल. शेतकरी दलालांशिवाय स्पर्धात्मक दरांवर संपूर्ण भारतातील खरेदीदारांना विकू शकतात.',
    eligibility: [
      'All farmers in India',
      'Must register on enam.gov.in',
      'Bank account and Aadhaar required',
      'Available in 1,361 mandis across 23 states'
    ],
    eligibilityHi: [
      'भारत के सभी किसान',
      'enam.gov.in पर पंजीकरण करना होगा',
      'बैंक खाता और आधार आवश्यक',
      '23 राज्यों की 1,361 मंडियों में उपलब्ध'
    ],
    eligibilityMr: [
      'भारतातील सर्व शेतकरी',
      'enam.gov.in वर नोंदणी करणे आवश्यक',
      'बँक खाते आणि आधार आवश्यक',
      '23 राज्यांमधील 1,361 बाजारांमध्ये उपलब्ध'
    ],
    howToApply: 'Register on enam.gov.in with Aadhaar and bank details',
    officialUrl: 'https://enam.gov.in',
    status: 'Active',
    lastUpdated: '2026-03-20'
  },
  {
    id: 'pm-sinchai',
    name: 'PM Krishi Sinchai Yojana',
    nameHi: 'प्रधानमंत्री कृषि सिंचाई योजना',
    nameMr: 'प्रधानमंत्री कृषी सिंचन योजना',
    icon: '💧',
    category: 'Infrastructure',
    benefit: '55-75% subsidy on micro-irrigation (drip & sprinkler)',
    benefitHi: 'सूक्ष्म सिंचाई (ड्रिप और स्प्रिंकलर) पर 55-75% सब्सिडी',
    benefitMr: 'सूक्ष्म सिंचन (ड्रिप आणि स्प्रिंकलर) वर 55-75% अनुदान',
    description: '"Har Khet Ko Paani" — Promote efficient water use through drip and sprinkler irrigation. 55% subsidy for general, 75% for SC/ST and small farmers.',
    descriptionHi: '"हर खेत को पानी" — ड्रिप और स्प्रिंकलर सिंचाई के माध्यम से कुशल पानी के उपयोग को बढ़ावा दें।',
    descriptionMr: '"प्रत्येक शेताला पाणी" — ड्रिप आणि स्प्रिंकलर सिंचनाद्वारे कार्यक्षम पाणी वापराला प्रोत्साहन.',
    eligibility: [
      'All farmer categories',
      'Small and marginal farmers get higher subsidy (75%)',
      'Must have water source available',
      'SC/ST farmers get additional benefits'
    ],
    eligibilityHi: [
      'सभी किसान श्रेणियां',
      'छोटे और सीमांत किसानों को अधिक सब्सिडी (75%)',
      'जल स्रोत उपलब्ध होना चाहिए',
      'एससी/एसटी किसानों को अतिरिक्त लाभ'
    ],
    eligibilityMr: [
      'सर्व शेतकरी वर्ग',
      'लहान आणि सीमांत शेतकऱ्यांना अधिक अनुदान (75%)',
      'पाण्याचा स्रोत उपलब्ध असणे आवश्यक',
      'एससी/एसटी शेतकऱ्यांना अतिरिक्त लाभ'
    ],
    howToApply: 'Apply through state agriculture/horticulture department or pmksy.gov.in',
    officialUrl: 'https://pmksy.gov.in',
    status: 'Active',
    lastUpdated: '2026-02-28'
  },
  {
    id: 'agri-infra',
    name: 'Agriculture Infrastructure Fund (AIF)',
    nameHi: 'कृषि अवसंरचना कोष',
    nameMr: 'कृषी पायाभूत सुविधा निधी',
    icon: '🏗️',
    category: 'Infrastructure',
    benefit: '₹1 lakh crore fund — 3% interest subvention on loans',
    benefitHi: '₹1 लाख करोड़ का कोष — ऋणों पर 3% ब्याज सब्सिडी',
    benefitMr: '₹1 लाख कोटी निधी — कर्जावर 3% व्याज सवलत',
    description: 'Build post-harvest infrastructure: warehouses, cold storage, processing units. Get term loans with 3% interest subvention and credit guarantee up to ₹2 crore.',
    descriptionHi: 'कटाई के बाद की अवसंरचना बनाएं: गोदाम, कोल्ड स्टोरेज, प्रसंस्करण इकाइयां। ₹2 करोड़ तक 3% ब्याज सब्सिडी सहित ऋण प्राप्त करें।',
    descriptionMr: 'कापणीनंतरची पायाभूत सुविधा तयार करा: गोदामे, कोल्ड स्टोरेज, प्रक्रिया युनिट्स. ₹2 कोटीपर्यंत 3% व्याज सवलतीसह कर्ज मिळवा.',
    eligibility: [
      'Farmers, FPOs, PACS, SHGs',
      'Agri-entrepreneurs and startups',
      'For post-harvest management projects',
      'Loan amount up to ₹2 crore'
    ],
    eligibilityHi: [
      'किसान, FPOs, PACS, SHGs',
      'कृषि उद्यमी और स्टार्टअप',
      'कटाई के बाद प्रबंधन परियोजनाओं के लिए',
      'ऋण राशि ₹2 करोड़ तक'
    ],
    eligibilityMr: [
      'शेतकरी, FPOs, PACS, SHGs',
      'कृषी उद्योजक आणि स्टार्टअप',
      'कापणीनंतर व्यवस्थापन प्रकल्पांसाठी',
      'कर्ज रक्कम ₹2 कोटीपर्यंत'
    ],
    howToApply: 'Apply online through agriinfra.dac.gov.in',
    officialUrl: 'https://agriinfra.dac.gov.in',
    status: 'Active',
    lastUpdated: '2026-03-10'
  }
];

// GET /api/yojana — Get all schemes
router.get('/', (req, res) => {
  try {
    const { category, lang } = req.query;
    let schemes = [...yojanaData];
    
    if (category && category !== 'All') {
      schemes = schemes.filter(s => s.category === category);
    }

    // Map fields based on language
    const langSuffix = lang === 'hi' ? 'Hi' : lang === 'mr' ? 'Mr' : '';
    
    const localizedSchemes = schemes.map(s => ({
      ...s,
      displayName: s[`name${langSuffix}`] || s.name,
      displayBenefit: s[`benefit${langSuffix}`] || s.benefit,
      displayDescription: s[`description${langSuffix}`] || s.description,
      displayEligibility: s[`eligibility${langSuffix}`] || s.eligibility,
      displayHowToApply: s[`howToApply${langSuffix}`] || s.howToApply
    }));

    const categories = ['All', ...new Set(yojanaData.map(s => s.category))];
    
    res.json({
      success: true,
      count: localizedSchemes.length,
      categories,
      schemes: localizedSchemes
    });
  } catch (err) {
    console.error('Yojana fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch schemes' });
  }
});

// GET /api/yojana/:id — Get single scheme
router.get('/:id', (req, res) => {
  const scheme = yojanaData.find(s => s.id === req.params.id);
  if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
  res.json({ success: true, scheme });
});

module.exports = router;
