const express = require('express');
const router = express.Router();
const markets = require('../data/markets.json');

/**
 * POST /api/retailer/negotiate
 * Handle a chat message and return an intelligent counter-offer
 * Body: { crop: string, farmerPrice: number, message: string, retailerId: number, marketId: string }
 */
router.post('/negotiate', (req, res) => {
  try {
    const { crop, farmerPrice, message, retailerId, marketId } = req.body;

    if (!crop || !farmerPrice || !retailerId || !marketId) {
      return res.status(400).json({ error: 'Missing required negotiation fields.' });
    }

    // Find Market and Retailer configuration
    const market = markets.find(m => m.id === marketId);
    if (!market) return res.status(404).json({ error: 'Market not found' });

    const retailer = market.retailers.find(r => r.id === retailerId);
    if (!retailer || !retailer.cropMargins || !retailer.cropMargins[crop]) {
      return res.status(404).json({ error: 'Retailer is not actively buying this crop right now.' });
    }

    const { minPrice, maxPrice } = retailer.cropMargins[crop];
    
    // Simple Intelligent Negotiation Logic
    const proposed = parseInt(farmerPrice, 10);
    
    let responseText = '';
    let status = 'negotiating';
    let newOffer = proposed;

    // Check if the farmer's price is within the retailer's acceptable margin
    if (proposed <= minPrice) {
      // Farmer asking for extremely low price (less than what retailer usually gets)
      responseText = `I can definitely accept ₹${proposed}/q. It's a deal! Send the truck tomorrow.`;
      status = 'accepted';
      newOffer = proposed;
    } else if (proposed <= maxPrice) {
      // Farmer asking an acceptable price
      // Simulate that retailer wants a slightly better deal 50% of the time
      if (Math.random() > 0.5 && proposed > minPrice + 100) {
        newOffer = proposed - 50;
        responseText = `₹${proposed}/q is close, but considering transport costs, I can offer you ₹${newOffer}/q. Deal?`;
      } else {
        responseText = `₹${proposed}/q is fair. I agree to this price. Let me know when you can dispatch it.`;
        status = 'accepted';
        newOffer = proposed;
      }
    } else {
      // Farmer asking too much
      // Retailer anchors at their max price
      newOffer = maxPrice;
      responseText = `₹${proposed}/q is too high for the current market rate here. The best I can do is ₹${maxPrice}/q. Take it or leave it.`;
    }

    // Simulate network delay for realism if desired, but we can do that on frontend.
    res.json({
      status,
      proposedPrice: newOffer,
      message: responseText,
      retailer: retailer.name
    });

  } catch (err) {
    console.error('Retailer negotiation error:', err);
    res.status(500).json({ error: 'Failed to negotiate. Please try again later.' });
  }
});

module.exports = router;
