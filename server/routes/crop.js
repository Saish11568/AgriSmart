const express = require('express');
const router = express.Router();
const { recommendCrops } = require('../utils/recommendation');

/**
 * GET /api/crop/options
 * Get dropdown options for the crop recommendation form
 */
router.get('/options', (req, res) => {
  res.json({
    soilTypes: [
      { id: 'loamy', name: 'Loamy Soil', description: 'Rich, well-drained, ideal for most crops' },
      { id: 'sandy-loam', name: 'Sandy Loam', description: 'Good drainage, suitable for root vegetables' },
      { id: 'clay', name: 'Clay Soil', description: 'Heavy, retains water, good for paddy' },
      { id: 'clay-loam', name: 'Clay Loam', description: 'Moderate drainage, versatile' },
      { id: 'black-soil', name: 'Black Soil (Regur)', description: 'Rich in minerals, retains moisture' }
    ],
    seasons: [
      { id: 'kharif', name: 'Kharif (Monsoon)', months: 'Jun - Oct' },
      { id: 'rabi', name: 'Rabi (Winter)', months: 'Nov - Mar' },
      { id: 'zaid', name: 'Zaid (Summer)', months: 'Mar - Jun' }
    ],
    waterLevels: [
      { id: 'low', name: 'Low', description: 'Rain-fed only, no irrigation' },
      { id: 'medium', name: 'Medium', description: 'Basic irrigation available' },
      { id: 'high', name: 'High', description: 'Full irrigation / canal water available' }
    ]
  });
});

/**
 * POST /api/crop/recommend
 * Get crop recommendations based on conditions
 * Body: { soilType: string, season: string, waterAvailability: string }
 */
router.post('/recommend', (req, res) => {
  try {
    const { soilType, season, waterAvailability } = req.body;

    if (!soilType || !season || !waterAvailability) {
      return res.status(400).json({ error: 'Please provide soil type, season, and water availability' });
    }

    const recommendations = recommendCrops(soilType, season, waterAvailability);

    // Add rank labels
    const rankedResults = recommendations.map((crop, index) => ({
      rank: index + 1,
      ...crop,
      badge: index === 0 ? '🏆 Best Pick' : index === 1 ? '⭐ Great Choice' : index === 2 ? '👍 Good Option' : null
    }));

    // Generate smart insights  
    const insights = [];
    const topCrop = rankedResults[0];
    if (topCrop) {
      insights.push(`🏆 ${topCrop.name} is your best option with a score of ${topCrop.score}/100`);
      if (topCrop.seasonMatch && topCrop.soilMatch) {
        insights.push(`✅ Perfect match for your soil and season conditions`);
      }
    }

    const highDemandCrops = rankedResults.filter(c => c.score >= 70).length;
    if (highDemandCrops > 3) {
      insights.push(`🌟 You have ${highDemandCrops} excellent crop options for these conditions!`);
    }

    res.json({
      conditions: { soilType, season, waterAvailability },
      recommendations: rankedResults,
      topPick: rankedResults[0] || null,
      insights
    });
  } catch (err) {
    console.error('Crop recommendation error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations. Please try again.' });
  }
});

module.exports = router;
