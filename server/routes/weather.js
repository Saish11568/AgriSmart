const express = require('express');
const router = express.Router();

const weatherDescriptions = {
  0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Rime Fog', 51: 'Light Drizzle', 53: 'Moderate Drizzle',
  55: 'Dense Drizzle', 61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
  80: 'Rain Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm+Hail', 99: 'Heavy Thunderstorm'
};

const weatherEmojis = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '❄️', 80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️'
};

router.get('/', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 15.36;
    const lng = parseFloat(req.query.lng) || 75.12;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max&timezone=auto&forecast_days=7`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API failed');
    const data = await response.json();

    const current = data.current;
    const wc = current.weather_code;

    // Next precipitation
    let nextPrecipHours = null, nextPrecipProb = 0;
    if (data.hourly?.precipitation_probability) {
      const now = new Date();
      for (let i = 0; i < data.hourly.time.length; i++) {
        const t = new Date(data.hourly.time[i]);
        if (t > now && data.hourly.precipitation_probability[i] > 30) {
          nextPrecipHours = Math.round((t - now) / 3600000);
          nextPrecipProb = data.hourly.precipitation_probability[i];
          break;
        }
      }
    }

    // Daily forecast
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const daily = (data.daily?.time || []).slice(0, 7).map((t, i) => {
      const d = new Date(t);
      return {
        day: i === 0 ? 'Today' : days[d.getDay()],
        date: t,
        maxTemp: Math.round(data.daily.temperature_2m_max[i]),
        minTemp: Math.round(data.daily.temperature_2m_min[i]),
        precipitation: data.daily.precipitation_sum[i],
        weatherCode: data.daily.weather_code[i],
        description: weatherDescriptions[data.daily.weather_code[i]] || 'Unknown',
        emoji: weatherEmojis[data.daily.weather_code[i]] || '🌡️',
        windSpeed: Math.round(data.daily.wind_speed_10m_max[i])
      };
    });

    // Reverse geocode
    let city = 'Your Location';
    try {
      const gr = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`, { headers: { 'User-Agent': 'AgriSmart/1.0' } });
      if (gr.ok) { const gd = await gr.json(); city = gd.address?.city || gd.address?.town || gd.address?.village || 'Your Location'; }
    } catch(e) {}

    res.json({
      success: true,
      location: { lat, lng, city },
      current: {
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        windSpeed: Math.round(current.wind_speed_10m),
        weatherCode: wc,
        description: weatherDescriptions[wc] || 'Unknown',
        emoji: weatherEmojis[wc] || '🌡️'
      },
      nextPrecipitation: nextPrecipHours !== null ? { hours: nextPrecipHours, probability: nextPrecipProb } : null,
      daily
    });
  } catch (err) {
    console.error('Weather error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather', message: err.message });
  }
});

module.exports = router;
