const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const news = [
    {
      id: 1,
      title: "Crop Prices Rising Due to Delayed Monsoons",
      description: "Better profits expected this season for drought-resistant crops like Bajra and Jowar.",
      source: "AgriSmart Market Analysis",
      date: new Date(),
      category: "Market",
      sourceUrl: "https://enam.gov.in"
    },
    {
      id: 2,
      title: "New Farming Scheme: PM-KUSUM Expanding",
      description: "Government introduces 90% subsidy for solar irrigation pumps in arid regions.",
      source: "Gov India",
      date: new Date(Date.now() - 86400000), // 1 day ago
      category: "Government",
      sourceUrl: "https://pmkusum.mnre.gov.in"
    },
    {
      id: 3,
      title: "Tomato Prices Crash in Karnataka Mandis",
      description: "Excess supply from Kolar district causes a sharp 18% decline in wholesale prices.",
      source: "APMC Board",
      date: new Date(Date.now() - 172800000), // 2 days ago
      category: "Market",
      sourceUrl: "https://krishimaratavahini.kar.nic.in/"
    },
    {
      id: 4,
      title: "ICAR Develops High-Yield Wheat Variety",
      description: "A new bio-fortified HD-3226 wheat seed promises 20% higher yield and better disease resistance.",
      source: "Indian Council of Agricultural Research",
      date: new Date(Date.now() - 345600000), // 4 days ago
      category: "Crop Updates",
      sourceUrl: "https://www.icar.org.in/"
    },
    {
      id: 5,
      title: "Monsoon Forecast: Heavy Showers in Central India",
      description: "IMD has predicted above-normal rainfall starting next week. Farmers advised to delay sowing.",
      source: "IMD Weather",
      date: new Date(Date.now() - 432000000), // 5 days ago
      category: "Weather",
      sourceUrl: "https://mausam.imd.gov.in/"
    }
  ];

  res.json(news);
});

module.exports = router;
