const express = require('express');
const router = express.Router();
const crops = require('../data/crops.json');
const priceHistory = require('../data/priceHistory.json');
const { analyzeDemand } = require('../utils/prediction');
const { getMarketDemandScore } = require('../utils/recommendation');

/**
 * POST /api/demand/forecast
 * Forecast demand for a selected crop and suggest top crops
 * Body: { cropId: string }
 */
router.post('/forecast', (req, res) => {
  try {
    const { cropId } = req.body;

    if (!cropId) {
      return res.status(400).json({ error: 'Please select a crop' });
    }

    const history = priceHistory[cropId];
    if (!history) {
      return res.status(404).json({ error: 'No demand data available for this crop' });
    }

    const cropInfo = crops.find(c => c.id === cropId);
    const demandAnalysis = analyzeDemand(history);

    // Find top 3 most profitable crops based on demand
    const allCropDemand = crops.map(c => {
      const h = priceHistory[c.id];
      if (!h) return null;
      const analysis = analyzeDemand(h);
      const demandScore = getMarketDemandScore(c.id);
      const avgPrice = h.reduce((sum, d) => sum + d.price, 0) / h.length;
      return {
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        demandLevel: analysis.level,
        demandScore,
        avgPrice: Math.round(avgPrice),
        trend: analysis.trend,
        profitPotential: Math.round((demandScore * 0.5 + (avgPrice / 100) * 0.5))
      };
    }).filter(Boolean);

    allCropDemand.sort((a, b) => b.profitPotential - a.profitPotential);
    const topCrops = allCropDemand.slice(0, 3);

    // Generate smart insights
    const insights = [];
    if (demandAnalysis.level === 'High') {
      insights.push(`🔥 ${cropInfo?.name || cropId} is in high demand! Consider increasing production.`);
    }
    if (demandAnalysis.trend === 'Rising') {
      insights.push(`📈 Demand trend is rising — prices likely to increase.`);
    } else if (demandAnalysis.trend === 'Falling') {
      insights.push(`📉 Demand is declining — consider switching to higher-demand crops.`);
    }
    
    const nextMonthDemand = history[(new Date().getMonth() + 1) % 12];
    if (nextMonthDemand && nextMonthDemand.demand > 80) {
      insights.push(`⚡ Next month shows strong demand of ${nextMonthDemand.demand}% — great time to sell!`);
    }

    res.json({
      crop: {
        id: cropId,
        name: cropInfo?.name || cropId,
        emoji: cropInfo?.emoji || '🌱'
      },
      demand: demandAnalysis,
      topProfitableCrops: topCrops,
      insights
    });
  } catch (err) {
    console.error('Demand forecast error:', err);
    res.status(500).json({ error: 'Failed to generate forecast. Please try again.' });
  }
});

module.exports = router;
