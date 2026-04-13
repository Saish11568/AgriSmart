const express = require('express');
const router = express.Router();
const crops = require('../data/crops.json');
const priceHistory = require('../data/priceHistory.json');
const { predictPrice } = require('../utils/prediction');

/**
 * POST /api/storage/advice
 * Get storage and selling advice for a crop
 * Body: { cropId: string, currentPrice: number }
 */
router.post('/advice', (req, res) => {
  try {
    const { cropId, currentPrice } = req.body;

    if (!cropId || currentPrice === undefined) {
      return res.status(400).json({ error: 'Please provide crop and current price' });
    }

    const history = priceHistory[cropId];
    if (!history) {
      return res.status(404).json({ error: 'No data available for this crop' });
    }

    const cropInfo = crops.find(c => c.id === cropId);
    const prediction = predictPrice(history, 3);

    const predictedAvg = prediction.averagePredicted;
    const priceDifference = predictedAvg - currentPrice;
    const percentChange = ((priceDifference) / currentPrice) * 100;

    let decision, reasoning, urgency, storageAdvice;

    if (percentChange > 15) {
      decision = 'STORE CROP';
      urgency = 'low';
      reasoning = `Prices are expected to rise by ${percentChange.toFixed(1)}% (from ₹${currentPrice} to ₹${predictedAvg}/quintal). Storing your crop will yield significantly higher returns.`;
      storageAdvice = getStorageRecommendation(cropInfo);
    } else if (percentChange > 5) {
      decision = 'STORE CROP';
      urgency = 'medium';
      reasoning = `A moderate price increase of ${percentChange.toFixed(1)}% is predicted. Consider storing if you have access to proper storage facilities.`;
      storageAdvice = getStorageRecommendation(cropInfo);
    } else if (percentChange > -5) {
      decision = 'SELL NOW';
      urgency = 'medium';
      reasoning = `Prices are expected to remain stable (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%). Selling now avoids storage costs and spoilage risk.`;
      storageAdvice = null;
    } else {
      decision = 'SELL IMMEDIATELY';
      urgency = 'high';
      reasoning = `Prices are predicted to drop by ${Math.abs(percentChange).toFixed(1)}% (from ₹${currentPrice} to ₹${predictedAvg}/quintal). Sell immediately to prevent losses!`;
      storageAdvice = null;
    }

    // Calculate potential profit/loss
    const potentialPerQuintal = priceDifference;
    const estimatedFor10Quintals = potentialPerQuintal * 10;

    res.json({
      crop: {
        id: cropId,
        name: cropInfo?.name || cropId,
        emoji: cropInfo?.emoji || '🌱',
        shelfLife: cropInfo?.shelfLife || 'Unknown'
      },
      currentPrice,
      predictedPrice: predictedAvg,
      priceDifference: Math.round(priceDifference),
      percentChange: parseFloat(percentChange.toFixed(1)),
      decision,
      urgency,
      reasoning,
      storageAdvice,
      financials: {
        potentialPerQuintal: Math.round(potentialPerQuintal),
        estimatedFor10Quintals: Math.round(estimatedFor10Quintals)
      },
      predictions: prediction.predictedPrices
    });
  } catch (err) {
    console.error('Storage advice error:', err);
    res.status(500).json({ error: 'Failed to generate advice. Please try again.' });
  }
});

/**
 * Get storage recommendation based on crop type
 */
function getStorageRecommendation(cropInfo) {
  if (!cropInfo) return { type: 'Dry Warehouse', tips: ['Store in a cool, dry place'] };

  const storageMap = {
    'cold': {
      type: 'Cold Storage',
      icon: '❄️',
      temperature: '2-8°C',
      tips: [
        'Use cold storage facility to extend shelf life',
        'Maintain consistent temperature',
        'Check for spoilage regularly',
        `Shelf life in cold storage: ${cropInfo.shelfLife}`
      ],
      estimatedCost: '₹150-300/quintal/month'
    },
    'dry-warehouse': {
      type: 'Dry Warehouse',
      icon: '🏭',
      temperature: 'Room temperature',
      tips: [
        'Store in moisture-proof bags or containers',
        'Keep away from direct sunlight',
        'Ensure good ventilation',
        'Use pest control measures',
        `Can be stored for: ${cropInfo.shelfLife}`
      ],
      estimatedCost: '₹50-100/quintal/month'
    },
    'none': {
      type: 'Immediate Use',
      icon: '⚡',
      temperature: 'N/A',
      tips: [
        'This crop has very limited storage life',
        'Sell or process within 1-2 days',
        'Consider processing into value-added products'
      ],
      estimatedCost: 'N/A'
    }
  };

  return storageMap[cropInfo.storageType] || storageMap['dry-warehouse'];
}

module.exports = router;
