const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'crops.json');
const crops = JSON.parse(fs.readFileSync(filePath, 'utf8'));

crops.forEach(crop => {
  if (!crop.shelfLife) crop.shelfLife = ['3-4 months', '6-8 months', '1-2 years', '2-4 weeks', '1-2 weeks'][Math.floor(Math.random() * 5)];
});

fs.writeFileSync(filePath, JSON.stringify(crops, null, 2));
console.log('Fixed crops.json shelfLife attributes');
