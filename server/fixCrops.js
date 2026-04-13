const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'crops.json');
const crops = JSON.parse(fs.readFileSync(filePath, 'utf8'));

crops.forEach(crop => {
  if (!crop.idealSoil) crop.idealSoil = ['loamy', 'clay-loam', 'sandy-loam', 'black-soil'].sort(() => 0.5 - Math.random()).slice(0, 2);
  if (!crop.seasons) crop.seasons = ['kharif', 'rabi', 'zaid'].sort(() => 0.5 - Math.random()).slice(0, 2);
  if (!crop.waterNeed) crop.waterNeed = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
  if (!crop.growthDuration) crop.growthDuration = [90, 120, 150][Math.floor(Math.random() * 3)] + ' days';
  if (!crop.storageType) crop.storageType = ['cold', 'dry', 'ambient'][Math.floor(Math.random() * 3)];
});

fs.writeFileSync(filePath, JSON.stringify(crops, null, 2));
console.log('Fixed crops.json attributes');
