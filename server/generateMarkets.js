const fs = require('fs');
const path = require('path');

const COMPREHENSIVE_CROPS = require('./data/crops.json');

const MOCK_RETAILERS = [
  { id: 1, name: 'Kisan Fresh Produce', buyer: 'Ramesh Singh', phone: '+91 98765 43210', rating: 4.8, volume: 'High' },
  { id: 2, name: 'AgriCorp Traders', buyer: 'Sunil Verma', phone: '+91 99887 76655', rating: 4.5, volume: 'Medium' },
  { id: 3, name: 'Green Valley Mart', buyer: 'Anita Devi', phone: '+91 91234 56789', rating: 4.2, volume: 'High' },
  { id: 4, name: 'National Farm Connect', buyer: 'Rajesh Kumar', phone: '+91 90000 11111', rating: 4.9, volume: 'Very High' },
  { id: 5, name: 'Metro Fresh B2B', buyer: 'Suresh Patel', phone: '+91 98989 87878', rating: 4.3, volume: 'High' },
  { id: 6, name: 'Reliance Smart Krishi', buyer: 'Amit Shah', phone: '+91 91111 22222', rating: 4.7, volume: 'Very High' }
];

const markets = [
  {
    "id": "hubli",
    "name": "Hubli APMC Market",
    "city": "Hubli",
    "state": "Karnataka",
    "lat": 15.3533,
    "lng": 75.1435,
    "rating": 4.5,
    "contact": "+91 836 295 1234",
    "timings": "5:00 AM - 1:00 PM",
    "crops": {},
    "retailers": [MOCK_RETAILERS[0], MOCK_RETAILERS[3]]
  },
  {
    "id": "dharwad",
    "name": "Dharwad APMC",
    "city": "Dharwad",
    "state": "Karnataka",
    "lat": 15.4542,
    "lng": 75.0078,
    "rating": 4.2,
    "contact": "+91 836 244 5678",
    "timings": "6:00 AM - 2:00 PM",
    "crops": {},
    "retailers": [MOCK_RETAILERS[1], MOCK_RETAILERS[4]]
  },
  {
    "id": "belagavi",
    "name": "Belagavi Main Market",
    "city": "Belagavi",
    "state": "Karnataka",
    "lat": 15.8497,
    "lng": 74.4977,
    "rating": 4.8,
    "contact": "+91 831 240 9876",
    "timings": "4:00 AM - 12:00 PM",
    "crops": {},
    "retailers": [MOCK_RETAILERS[2], MOCK_RETAILERS[5]]
  },
  {
    "id": "gadag",
    "name": "Gadag APMC Yard",
    "city": "Gadag",
    "state": "Karnataka",
    "lat": 15.4299,
    "lng": 75.6323,
    "rating": 4.0,
    "contact": "+91 837 225 3456",
    "timings": "7:00 AM - 3:00 PM",
    "crops": {},
    "retailers": [MOCK_RETAILERS[0], MOCK_RETAILERS[2]]
  },
  {
    "id": "pune",
    "name": "Pune Gultekdi Market",
    "city": "Pune",
    "state": "Maharashtra",
    "lat": 18.5204,
    "lng": 73.8567,
    "rating": 4.9,
    "contact": "+91 20 256 1234",
    "timings": "4:00 AM - 2:00 PM",
    "crops": {},
    "retailers": [MOCK_RETAILERS[3], MOCK_RETAILERS[4], MOCK_RETAILERS[5]]
  }
];

// For each market, assign plausible current prices for a subset of comprehensive crops
markets.forEach(market => {
  COMPREHENSIVE_CROPS.forEach(crop => {
    // 70% chance a market has this crop
    if (Math.random() > 0.3) {
      // +/- 20% variation from base price based on region
      const variation = 1 + (Math.random() * 0.4 - 0.2); 
      const currentPrice = Math.round(crop.basePrice * variation);
      
      market.crops[crop.id] = currentPrice;
      
      // Also mutate retailer to add min/max negotiation margins for this crop
      market.retailers.forEach(ret => {
        if (!ret.cropMargins) ret.cropMargins = {};
        ret.cropMargins[crop.id] = {
          postedPrice: Math.round(currentPrice * (1 + (Math.random() * 0.05))), // Retailer sets price slightly above market
          minPrice: Math.round(currentPrice * 0.90),
          maxPrice: Math.round(currentPrice * 1.08)
        };
      });
    }
  });
});

fs.writeFileSync(
  path.join(__dirname, 'data', 'markets.json'), 
  JSON.stringify(markets, null, 2)
);

console.log('Successfully generated markets.json');
