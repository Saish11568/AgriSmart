const fs = require('fs');
const path = require('path');

const COMPREHENSIVE_CROPS = [
  { id: 'wheat', name: 'Wheat', emoji: '🌾', category: 'grain', basePrice: 2200 },
  { id: 'rice', name: 'Rice', emoji: '🍚', category: 'grain', basePrice: 2800 },
  { id: 'maize', name: 'Maize (Corn)', emoji: '🌽', category: 'grain', basePrice: 1900 },
  { id: 'jowar', name: 'Jowar (Sorghum)', emoji: '🌾', category: 'grain', basePrice: 2400 },
  { id: 'bajra', name: 'Bajra (Pearl Millet)', emoji: '🌾', category: 'grain', basePrice: 2100 },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'vegetable', basePrice: 1500 },
  { id: 'onion', name: 'Onion', emoji: '🧅', category: 'vegetable', basePrice: 1800 },
  { id: 'potato', name: 'Potato', emoji: '🥔', category: 'vegetable', basePrice: 1200 },
  { id: 'garlic', name: 'Garlic', emoji: '🧄', category: 'vegetable', basePrice: 5500 },
  { id: 'ginger', name: 'Ginger', emoji: '🫚', category: 'spice', basePrice: 6500 },
  { id: 'cabbage', name: 'Cabbage', emoji: '🥬', category: 'vegetable', basePrice: 1000 },
  { id: 'cauliflower', name: 'Cauliflower', emoji: '🥦', category: 'vegetable', basePrice: 1200 },
  { id: 'brinjal', name: 'Brinjal (Eggplant)', emoji: '🍆', category: 'vegetable', basePrice: 1400 },
  { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'vegetable', basePrice: 1600 },
  { id: 'cotton', name: 'Cotton', emoji: '☁️', category: 'cash-crop', basePrice: 6000 },
  { id: 'sugarcane', name: 'Sugarcane', emoji: '🎋', category: 'cash-crop', basePrice: 350 },
  { id: 'soybean', name: 'Soybean', emoji: '🫘', category: 'oilseed', basePrice: 4800 },
  { id: 'groundnut', name: 'Groundnut (Peanut)', emoji: '🥜', category: 'oilseed', basePrice: 5800 },
  { id: 'mustard', name: 'Mustard', emoji: '🌼', category: 'oilseed', basePrice: 5400 },
  { id: 'turmeric', name: 'Turmeric', emoji: '🟡', category: 'spice', basePrice: 7000 },
  { id: 'chilli', name: 'Chilli', emoji: '🌶️', category: 'spice', basePrice: 12000 },
  { id: 'pepper', name: 'Black Pepper', emoji: '⚫', category: 'spice', basePrice: 40000 },
  { id: 'apple', name: 'Apple', emoji: '🍎', category: 'fruit', basePrice: 8000 },
  { id: 'banana', name: 'Banana', emoji: '🍌', category: 'fruit', basePrice: 1500 },
  { id: 'mango', name: 'Mango', emoji: '🥭', category: 'fruit', basePrice: 4500 },
  { id: 'grapes', name: 'Grapes', emoji: '🍇', category: 'fruit', basePrice: 5000 },
  { id: 'tea', name: 'Tea', emoji: '🍵', category: 'plantation', basePrice: 18000 },
  { id: 'coffee', name: 'Coffee', emoji: '☕', category: 'plantation', basePrice: 25000 },
  { id: 'coconut', name: 'Coconut', emoji: '🥥', category: 'plantation', basePrice: 3000 },
  { id: 'chickpea', name: 'Chickpea (Chana)', emoji: '🧆', category: 'pulse', basePrice: 5200 },
  { id: 'lentil', name: 'Lentil (Masoor)', emoji: '🥣', category: 'pulse', basePrice: 6200 }
];

// Write crops.json
fs.writeFileSync(
  path.join(__dirname, 'data', 'crops.json'), 
  JSON.stringify(COMPREHENSIVE_CROPS, null, 2)
);

// Generate priceHistory.json
const priceHistory = {};
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const seasonalFactors = {
  0: 0.95, 1: 0.90, 2: 0.88, 3: 0.92, 4: 1.00, 5: 1.08,
  6: 1.15, 7: 1.20, 8: 1.12, 9: 1.05, 10: 0.98, 11: 0.95
};

COMPREHENSIVE_CROPS.forEach(crop => {
  priceHistory[crop.id] = months.map((month, index) => {
    // Generate fluctuating historical data around base price + seasonal factor
    // Trend randomly up or down slightly over the year
    const trend = 1 + (index * 0.01);
    const noise = 1 + (Math.random() * 0.06 - 0.03); // +/- 3% random noise
    const base = crop.basePrice;
    
    // For demand, simulate random demand out of 100
    const demand = Math.round(50 + Math.random() * 40 + (seasonalFactors[index] * 10));

    return {
      month,
      price: Math.round(base * seasonalFactors[index] * trend * noise),
      demand: Math.min(100, Math.max(10, demand))
    };
  });
});

fs.writeFileSync(
  path.join(__dirname, 'data', 'priceHistory.json'), 
  JSON.stringify(priceHistory, null, 2)
);

console.log('Successfully generated crops.json and priceHistory.json');
