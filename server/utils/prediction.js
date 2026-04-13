/**
 * Price Prediction Utility
 * Uses simple linear regression + seasonal adjustment for price forecasting
 */

/**
 * Simple Linear Regression
 * Fits a line y = mx + b to the data points
 */
function linearRegression(data) {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Seasonal adjustment factors (month-based)
 * Represents typical price multipliers for agricultural commodities
 */
const seasonalFactors = {
  0: 0.95,   // Jan - post harvest, lower prices
  1: 0.90,   // Feb - supply surplus
  2: 0.88,   // Mar - end of rabi harvest
  3: 0.92,   // Apr - transition period
  4: 1.00,   // May - summer demand rises
  5: 1.08,   // Jun - monsoon begins, supply drops
  6: 1.15,   // Jul - peak monsoon, supply disruption
  7: 1.20,   // Aug - highest disruption
  8: 1.12,   // Sep - monsoon end
  9: 1.05,   // Oct - kharif harvest begins
  10: 0.98,  // Nov - harvest glut
  11: 0.95   // Dec - stable
};

/**
 * Predict future prices for a crop
 * @param {Array} historicalPrices - Array of {month, price, demand}
 * @param {number} monthsAhead - How many months to predict (default 3)
 * @returns {Object} Prediction results
 */
function predictPrice(historicalPrices, monthsAhead = 3) {
  const prices = historicalPrices.map(h => h.price);
  const { slope, intercept } = linearRegression(prices);

  // Calculate R-squared for confidence
  const meanPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < prices.length; i++) {
    const predicted = slope * i + intercept;
    ssRes += Math.pow(prices[i] - predicted, 2);
    ssTot += Math.pow(prices[i] - meanPrice, 2);
  }
  const rSquared = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);

  // Get current month index
  const currentMonth = new Date().getMonth();

  // Generate predictions
  const predictions = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 1; i <= monthsAhead; i++) {
    const futureIndex = prices.length + i - 1;
    const futureMonth = (currentMonth + i) % 12;
    const basePrice = slope * futureIndex + intercept;
    const seasonalAdjustment = seasonalFactors[futureMonth];
    const predictedPrice = Math.round(basePrice * seasonalAdjustment);

    predictions.push({
      month: monthNames[futureMonth],
      price: Math.max(predictedPrice, 0),
      seasonalFactor: seasonalAdjustment
    });
  }

  // Determine trend
  const lastPrice = prices[prices.length - 1];
  const avgPredicted = predictions.reduce((a, p) => a + p.price, 0) / predictions.length;
  const priceChange = ((avgPredicted - lastPrice) / lastPrice) * 100;

  let trend, recommendation, reasoning;
  if (priceChange > 10) {
    trend = 'increasing';
    recommendation = 'HOLD';
    reasoning = `Prices are expected to rise by ${priceChange.toFixed(1)}%. Consider storing your crop for better returns.`;
  } else if (priceChange < -10) {
    trend = 'decreasing';
    recommendation = 'SELL NOW';
    reasoning = `Prices may drop by ${Math.abs(priceChange).toFixed(1)}%. Selling now will maximize your profit.`;
  } else {
    trend = 'stable';
    recommendation = priceChange > 0 ? 'HOLD' : 'SELL NOW';
    reasoning = `Prices are relatively stable with ${priceChange > 0 ? 'slight increase' : 'slight decrease'} expected. ${priceChange > 0 ? 'You can hold for marginal gains.' : 'Consider selling to lock in current price.'}`;
  }

  // Confidence score based on R-squared and data quality
  const confidence = Math.min(Math.round((Math.abs(rSquared) * 0.7 + 0.3) * 100), 95);

  return {
    currentPrice: lastPrice,
    predictedPrices: predictions,
    averagePredicted: Math.round(avgPredicted),
    priceChange: parseFloat(priceChange.toFixed(1)),
    trend,
    recommendation,
    reasoning,
    confidence,
    historicalPrices: historicalPrices.map((h, i) => ({
      month: h.month,
      price: h.price,
      fitted: Math.round(slope * i + intercept)
    }))
  };
}

/**
 * Analyze demand trends for a crop
 * @param {Array} historicalData - Array of {month, price, demand}
 * @returns {Object} Demand analysis
 */
function analyzeDemand(historicalData) {
  const demands = historicalData.map(h => h.demand);
  const { slope: demandSlope } = linearRegression(demands);

  const currentMonth = new Date().getMonth();
  const recentDemand = demands.slice(-3);
  const avgRecentDemand = recentDemand.reduce((a, b) => a + b, 0) / recentDemand.length;

  // Weigh recent trends more heavily
  const nextMonthDemand = demands[currentMonth] || avgRecentDemand;
  const trendFactor = demandSlope > 0 ? 1.1 : 0.9;
  const predictedDemand = Math.round(nextMonthDemand * trendFactor);

  let level;
  if (predictedDemand >= 80) level = 'High';
  else if (predictedDemand >= 60) level = 'Medium';
  else level = 'Low';

  return {
    currentDemand: Math.round(avgRecentDemand),
    predictedDemand,
    level,
    trend: demandSlope > 0.5 ? 'Rising' : demandSlope < -0.5 ? 'Falling' : 'Stable',
    chartData: historicalData.map(h => ({ month: h.month, demand: h.demand }))
  };
}

module.exports = { predictPrice, analyzeDemand, linearRegression };
