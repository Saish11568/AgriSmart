const express = require('express');
const router = express.Router();
const crops = require('../data/crops.json');
const priceHistory = require('../data/priceHistory.json');
const { predictPrice } = require('../utils/prediction');

/**
 * GET /api/price/crops
 * List all available crops for price prediction
 */
router.get('/crops', (req, res) => {
  const cropList = crops.map(c => ({
    id: c.id,
    name: c.name,
    emoji: c.emoji,
    category: c.category
  }));
  res.json({ crops: cropList });
});

/**
 * POST /api/price/predict
 * Predict future price for a selected crop
 * Body: { cropId: string, monthsAhead?: number }
 */
router.post('/predict', (req, res) => {
  try {
    const { cropId, monthsAhead = 3 } = req.body;

    if (!cropId) {
      return res.status(400).json({ error: 'Please select a crop' });
    }

    const history = priceHistory[cropId];
    if (!history) {
      return res.status(404).json({ error: 'No price data available for this crop' });
    }

    const cropInfo = crops.find(c => c.id === cropId);
    const prediction = predictPrice(history, monthsAhead);

    res.json({
      crop: {
        id: cropId,
        name: cropInfo?.name || cropId,
        emoji: cropInfo?.emoji || '🌱'
      },
      ...prediction
    });
  } catch (err) {
    console.error('Price prediction error:', err);
    res.status(500).json({ error: 'Failed to generate prediction. Please try again.' });
  }
});

module.exports = router;
