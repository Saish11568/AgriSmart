const express = require('express');
const router = express.Router();

// Import crop data for price responses
const cropData = require('../data/crops.json');

// Process voice queries and return intelligent responses
router.post('/query', (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    const lower = text.toLowerCase();
    let response = '';
    let action = null;

    // Price queries
    const priceKeywords = ['price', 'bhav', 'bhao', 'rate', 'cost', 'kimat', 'keemat', 'मूल्य', 'भाव', 'किंमत', 'दर', 'बेले'];
    const cropNames = Object.keys(cropData || {});
    
    let matchedCrop = null;
    for (const crop of cropNames) {
      if (lower.includes(crop.toLowerCase())) {
        matchedCrop = crop;
        break;
      }
    }

    // Common Hindi/English crop name mapping
    const cropAliases = {
      'टमाटर': 'tomato', 'tamatar': 'tomato', 'tomato': 'tomato',
      'गेहूं': 'wheat', 'gehun': 'wheat', 'wheat': 'wheat',
      'चावल': 'rice', 'chawal': 'rice', 'rice': 'rice', 'dhan': 'rice',
      'प्याज': 'onion', 'pyaaz': 'onion', 'onion': 'onion', 'kanda': 'onion',
      'आलू': 'potato', 'aloo': 'potato', 'potato': 'potato',
      'सोयाबीन': 'soybean', 'soybean': 'soybean',
      'कपास': 'cotton', 'cotton': 'cotton', 'kapas': 'cotton',
      'मक्का': 'maize', 'makka': 'maize', 'maize': 'maize', 'corn': 'maize',
      'मिर्च': 'chilli', 'mirchi': 'chilli', 'chilli': 'chilli',
      'हल्दी': 'turmeric', 'haldi': 'turmeric', 'turmeric': 'turmeric'
    };

    if (!matchedCrop) {
      for (const [alias, cropId] of Object.entries(cropAliases)) {
        if (lower.includes(alias)) { matchedCrop = cropId; break; }
      }
    }

    const isPriceQuery = priceKeywords.some(k => lower.includes(k));
    const isWeatherQuery = ['weather', 'mausam', 'barish', 'rain', 'hava', 'मौसम', 'बारिश', 'हवामान', 'पाऊस'].some(k => lower.includes(k));
    const isSchemeQuery = ['yojana', 'scheme', 'subsidy', 'pm kisan', 'योजना', 'सब्सिडी', 'अनुदान'].some(k => lower.includes(k));
    const isCropAdvice = ['grow', 'plant', 'crop', 'sow', 'ugana', 'fasaal', 'फसल', 'उगाना', 'बोना', 'पीक', 'बेळे'].some(k => lower.includes(k));

    if (isPriceQuery && matchedCrop) {
      const prices = { tomato: 2600, wheat: 2275, rice: 2200, onion: 1800, potato: 1200, soybean: 4200, cotton: 6500, maize: 1900, chilli: 5200, turmeric: 7800 };
      const p = prices[matchedCrop] || 2500;
      const trend = Math.random() > 0.5 ? 'increase' : 'remain stable';
      if (language === 'hi') {
        response = `${matchedCrop} का वर्तमान बाजार भाव लगभग ₹${p.toLocaleString()} प्रति क्विंटल है। अगले महीने कीमत ${trend === 'increase' ? 'बढ़ने' : 'स्थिर रहने'} की संभावना है।`;
      } else {
        response = `The current market price of ${matchedCrop} is approximately ₹${p.toLocaleString()} per quintal. Prices are expected to ${trend} next month.`;
      }
      action = { type: 'navigate', path: '/price-prediction' };
    } else if (isPriceQuery) {
      response = language === 'hi' ? 'कृपया फसल का नाम बताएं जिसका भाव जानना है। जैसे: "टमाटर का भाव बताओ"' : 'Please specify which crop price you want to know. Example: "What is the price of tomato?"';
    } else if (isWeatherQuery) {
      response = language === 'hi' ? 'आपके क्षेत्र का मौसम डैशबोर्ड पर दिखाया गया है। लाइव अपडेट के लिए डैशबोर्ड देखें।' : 'Your area weather is shown on the dashboard. Check the dashboard for live updates.';
      action = { type: 'navigate', path: '/dashboard' };
    } else if (isSchemeQuery) {
      response = language === 'hi' ? 'सरकारी योजनाएं देखने के लिए "योजना" पेज पर जाएं। PM-KISAN से आपको ₹6,000 प्रति वर्ष मिल सकते हैं!' : 'Check the Yojana page for government schemes. You could get ₹6,000/year from PM-KISAN!';
      action = { type: 'navigate', path: '/yojana' };
    } else if (isCropAdvice) {
      response = language === 'hi' ? 'फसल की सिफारिश के लिए "फसल सलाहकार" पेज पर जाएं। अपनी मिट्टी, मौसम और पानी की उपलब्धता बताएं।' : 'Visit the Crop Advisor page for personalized recommendations based on your soil, season, and water availability.';
      action = { type: 'navigate', path: '/crop-recommendation' };
    } else {
      response = language === 'hi'
        ? 'मैं आपकी मदद कर सकता हूं: फसल का भाव, मौसम, सरकारी योजना, या फसल सलाह पूछें!'
        : 'I can help you with: crop prices, weather updates, government schemes, or crop advice. Try asking a specific question!';
    }

    res.json({ success: true, response, action, language: language || 'en' });
  } catch (err) {
    console.error('Voice query error:', err);
    res.status(500).json({ error: 'Failed to process voice query' });
  }
});

module.exports = router;
