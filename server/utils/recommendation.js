/**
 * Crop Recommendation Engine
 * Uses weighted scoring: soil (30%), season (25%), water (20%), market demand (25%)
 */

const fs = require('fs');
const path = require('path');

function getCrops() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../data/crops.json'), 'utf8'));
}
function getPriceHistory() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../data/priceHistory.json'), 'utf8'));
}

/**
 * Calculate crop profitability score based on price trends
 */
function getProfitabilityScore(cropId) {
  const priceHistory = getPriceHistory();
  const history = priceHistory[cropId];
  if (!history) return 50;

  const prices = history.map(h => h.price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const volatility = (maxPrice - minPrice) / avgPrice;

  // Higher average price with lower volatility = better score
  const priceScore = Math.min((avgPrice / 100), 100);
  const stabilityScore = Math.max(0, 100 - volatility * 100);

  return Math.round((priceScore * 0.6 + stabilityScore * 0.4));
}

/**
 * Get market demand score for a crop (based on recent demand data)
 */
function getMarketDemandScore(cropId) {
  const priceHistory = getPriceHistory();
  const history = priceHistory[cropId];
  if (!history) return 50;

  const currentMonth = new Date().getMonth();
  // Get demand for current and next 2 months
  const relevantMonths = [currentMonth, (currentMonth + 1) % 12, (currentMonth + 2) % 12];
  const relevantDemand = relevantMonths.map(m => history[m]?.demand || 50);
  return Math.round(relevantDemand.reduce((a, b) => a + b, 0) / relevantDemand.length);
}

/**
 * Recommend crops based on input conditions
 * @param {string} soilType - Type of soil
 * @param {string} season - Current/target season  
 * @param {string} waterAvailability - Water level (low/medium/high)
 * @returns {Array} Ranked crop recommendations
 */
function recommendCrops(soilType, season, waterAvailability) {
  const crops = getCrops();
  const results = [];

  for (const crop of crops) {
    let score = 0;
    const insights = [];

    // --- Soil Match (30%) ---
    const soilMatch = (crop.idealSoil || []).includes(soilType);
    const soilScore = soilMatch ? 100 : 30;
    score += soilScore * 0.30;
    if (soilMatch) {
      insights.push(`✅ Excellent soil compatibility with ${soilType}`);
    } else {
      insights.push(`⚠️ ${soilType} soil is not ideal, but possible with amendments`);
    }

    // --- Season Match (25%) ---
    const seasonMatch = (crop.seasons || []).includes(season);
    const seasonScore = seasonMatch ? 100 : 15;
    score += seasonScore * 0.25;
    if (seasonMatch) {
      insights.push(`✅ Perfect for ${season} season`);
    } else {
      insights.push(`❌ Not recommended for ${season} season`);
    }

    // --- Water Match (20%) ---
    const waterLevels = { low: 1, medium: 2, high: 3 };
    const cropWater = waterLevels[crop.waterNeed] || 2;
    const availableWater = waterLevels[waterAvailability] || 2;
    let waterScore;
    if (availableWater >= cropWater) {
      waterScore = 100;
      insights.push(`✅ Water availability sufficient`);
    } else if (availableWater === cropWater - 1) {
      waterScore = 60;
      insights.push(`⚠️ Water may be slightly insufficient, consider irrigation`);
    } else {
      waterScore = 20;
      insights.push(`❌ Insufficient water for this crop`);
    }
    score += waterScore * 0.20;

    // --- Market Demand (25%) ---
    const demandScore = getMarketDemandScore(crop.id);
    score += demandScore * 0.25;
    if (demandScore >= 80) {
      insights.push(`📈 High market demand expected`);
    } else if (demandScore >= 60) {
      insights.push(`📊 Moderate market demand`);
    } else {
      insights.push(`📉 Low market demand currently`);
    }

    // Profitability info
    const profitScore = getProfitabilityScore(crop.id);

    results.push({
      id: crop.id,
      name: crop.name,
      emoji: crop.emoji,
      category: crop.category,
      score: Math.round(score),
      profitabilityScore: profitScore,
      growthDuration: crop.growthDuration,
      storageType: crop.storageType,
      insights,
      soilMatch,
      seasonMatch,
      waterMatch: availableWater >= cropWater
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

module.exports = { recommendCrops, getMarketDemandScore, getProfitabilityScore };
