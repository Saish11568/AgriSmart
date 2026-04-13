const express = require('express');
const router = express.Router();
const markets = require('../data/markets.json');

/**
 * Haversine formula to calculate distance between two GPS coordinates
 * @returns distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * POST /api/market/find
 * Find best nearby markets based on user location and optional crop
 * Body: { lat: number, lng: number, cropId?: string }
 */
router.post('/find', (req, res) => {
  try {
    // Default to Hubli if no location provided
    const { lat = 15.3647, lng = 75.1240, cropId } = req.body;

    let marketResults = markets.map(market => {
      const distance = haversineDistance(lat, lng, market.lat, market.lng);
      const cropPrice = cropId && market.crops[cropId] ? market.crops[cropId] : null;
      
      // Calculate available crops count
      const availableCrops = Object.keys(market.crops).length;

      return {
        id: market.id,
        name: market.name,
        city: market.city,
        state: market.state,
        distance: parseFloat(distance.toFixed(1)),
        rating: market.rating,
        contact: market.contact,
        timings: market.timings,
        cropPrice,
        availableCrops,
        crops: market.crops,
        retailers: market.retailers || []
      };
    });

    // Sort by distance (nearest first)
    const nearestMarkets = [...marketResults].sort((a, b) => a.distance - b.distance);

    // Find best price market for selected crop
    let bestPriceMarket = null;
    if (cropId) {
      const marketsWithCrop = marketResults.filter(m => m.cropPrice !== null);
      if (marketsWithCrop.length > 0) {
        bestPriceMarket = marketsWithCrop.reduce((best, m) =>
          m.cropPrice > best.cropPrice ? m : best
        );
      }
    }

    // Generate insights
    const insights = [];
    if (bestPriceMarket && nearestMarkets[0]) {
      if (bestPriceMarket.id !== nearestMarkets[0].id) {
        const priceDiff = bestPriceMarket.cropPrice - (nearestMarkets[0].cropPrice || 0);
        if (priceDiff > 0 && nearestMarkets[0].cropPrice) {
          insights.push(`💰 Travel ${(bestPriceMarket.distance - nearestMarkets[0].distance).toFixed(0)}km extra to earn ₹${priceDiff}/quintal more at ${bestPriceMarket.name}`);
        }
      }
    }

    res.json({
      userLocation: { lat, lng },
      nearestMarkets: nearestMarkets.slice(0, 6),
      bestPriceMarket,
      totalMarkets: markets.length,
      insights,
      selectedCrop: cropId || null
    });
  } catch (err) {
    console.error('Market locator error:', err);
    res.status(500).json({ error: 'Failed to find markets. Please try again.' });
  }
});

module.exports = router;
