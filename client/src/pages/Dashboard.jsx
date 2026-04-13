import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';
import { weatherAPI } from '../utils/api';
import NotificationPanel from '../components/NotificationPanel';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [livePrice, setLivePrice] = useState(2450);
  const [priceHistory, setPriceHistory] = useState([2400, 2410, 2405, 2420, 2435, 2440, 2450]);

  // Live weather state
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherCity, setWeatherCity] = useState('');

  // Fetch live weather on mount
  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      let lat = 15.36, lng = 75.12; // Default Hubli
      try {
        if (navigator.geolocation) {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        }
      } catch (e) { /* use defaults */ }
      
      try {
        const res = await weatherAPI.getCurrent(lat, lng);
        setWeather(res.data);
        setWeatherCity(res.data.location?.city || '');
      } catch (err) {
        console.error('Weather fetch failed:', err);
        // Use fallback data
        setWeather({
          current: { temperature: 27, humidity: 62, precipitation: 0, windSpeed: 12, description: 'Partly Cloudy', emoji: '⛅' },
          nextPrecipitation: { hours: 4, probability: 60 },
          daily: []
        });
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, []);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice(prev => {
        const change = Math.floor(Math.random() * 10) - 4;
        const newPrice = prev + change;
        setPriceHistory(history => [...history.slice(1), newPrice]);
        return newPrice;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', 'Live'],
    datasets: [{
      label: t('livePriceTracker') + ' (Wheat)',
      data: priceHistory,
      borderColor: '#2d5016', backgroundColor: 'rgba(45, 80, 22, 0.1)',
      borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#2d5016',
      tension: 0.4, fill: true
    }]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a2332', titleColor: '#f1f5f9', bodyColor: '#e8e4dc',
        callbacks: { label: (ctx) => `₹ ${ctx.parsed.y} ${t('perQuintal')}` }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(45, 80, 22, 0.1)' } }
    },
    animation: { duration: 500 }
  };

  const quickActions = [
    { icon: '📈', label: t('pricePrediction'), path: '/price-prediction', color: '#4a7a2e' },
    { icon: '📊', label: t('demandForecast'), path: '/demand-forecast', color: '#3b7ea1' },
    { icon: '📍', label: t('marketLocator'), path: '/market-locator', color: '#c9a84c' },
    { icon: '🌱', label: t('cropAdvisor'), path: '/crop-recommendation', color: '#8b6f47' },
    { icon: '📦', label: t('storageAdvice'), path: '/storage-advice', color: '#c44536' },
    { icon: '🏛️', label: t('yojana'), path: '/yojana', color: '#6b5b95' },
  ];

  const seasonalCrops = [
    { emoji: '🌾', name: 'Wheat', season: 'Rabi', status: 'Harvesting' },
    { emoji: '🫘', name: 'Gram', season: 'Rabi', status: 'Harvesting' },
    { emoji: '🌻', name: 'Sunflower', season: 'Zaid', status: 'Sowing' },
    { emoji: '🍉', name: 'Watermelon', season: 'Zaid', status: 'Sowing' },
    { emoji: '🌽', name: 'Maize', season: 'Kharif', status: 'Upcoming' },
    { emoji: '🍚', name: 'Rice', season: 'Kharif', status: 'Upcoming' },
  ];

  const marketTicker = [
    { crop: '🌾 Wheat', price: '₹2,275', change: '+1.2%', up: true },
    { crop: '🍅 Tomato', price: '₹3,400', change: '+18%', up: true },
    { crop: '🧅 Onion', price: '₹1,850', change: '-3.5%', up: false },
    { crop: '🌶️ Chilli', price: '₹5,200', change: '+5.8%', up: true },
    { crop: '🥔 Potato', price: '₹1,200', change: '-1.2%', up: false },
    { crop: '☕ Coffee', price: '₹8,900', change: '+2.4%', up: true },
    { crop: '🫘 Soybean', price: '₹4,200', change: '+3.1%', up: true },
    { crop: '🌿 Turmeric', price: '₹7,800', change: '+6.2%', up: true },
  ];

  const activityLog = [
    { time: t('today') + ', 08:30 AM', title: t('automatedIrrigation'), description: t('irrigationDone'), color: '#4a7a2e' },
    { time: t('yesterday'), title: t('nitrogenApplication'), description: t('nitrogenDone'), color: '#3b7ea1' }
  ];

  const alerts = [
    { type: 'warning', icon: '⚠', title: t('frostWarning'), description: t('frostDesc'), color: '#c44536' },
    { type: 'info', icon: '💧', title: t('irrigationReminder'), description: t('irrigationDesc'), color: '#3b7ea1' }
  ];

  const w = weather?.current || {};
  const nextPrecip = weather?.nextPrecipitation;

  return (
    <div className="page-container living-ledger">
      {/* Top Bar */}
      <div className="ll-topbar">
        <div className="ll-topbar-left">
          <h1 className="ll-title">AgriSmart</h1>
          <span className="ll-divider">|</span>
          <span className="ll-subtitle">{t('operationalDashboard')}</span>
        </div>
        <div className="ll-topbar-right">
          <button className="ll-icon-btn" onClick={() => setNotifOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
          </button>
          <div className="ll-profile">
            <div className="ll-profile-info">
              <span className="ll-profile-role">{t('farmManager')}</span>
              <span className="ll-profile-settings">{t('profileSettings')}</span>
            </div>
            <div className="ll-profile-avatar">{user?.name?.charAt(0) || 'F'}</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="ll-grid">
        {/* ===== LEFT COLUMN ===== */}
        <div className="ll-left-col">
          {/* Weather Card — LIVE */}
          <div className="ll-weather-card">
            <div className="ll-weather-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d5016" strokeWidth="2">
                <path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/>
                <path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><circle cx="12" cy="12" r="4"/>
              </svg>
              <span className="ll-weather-label">{t('currentWeather')} {weatherCity && `— ${weatherCity}`}</span>
              {!weatherLoading && <span style={{ marginLeft: 'auto', fontSize: '0.688rem', color: 'var(--color-primary)', fontWeight: 600 }}>🟢 LIVE</span>}
            </div>
            {weatherLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.813rem', color: 'var(--text-muted)' }}>{t('fetchingWeather')}</p>
              </div>
            ) : (
              <>
                <div className="ll-weather-body">
                  <div className="ll-temp">
                    <span style={{ marginRight: '0.5rem', fontSize: '2.5rem' }}>{w.emoji || '☀️'}</span>
                    {w.temperature || 27}°C
                  </div>
                  <p className="ll-weather-desc">{w.description || t('partlyCloudy')}</p>
                  <div className="ll-weather-details">
                    <div className="ll-weather-stat">
                      <span className="ll-weather-stat-label">{t('humidity')}</span>
                      <span className="ll-weather-stat-value">{w.humidity || 62}%</span>
                    </div>
                    <div className="ll-weather-stat">
                      <span className="ll-weather-stat-label">{t('rainfall')}</span>
                      <span className="ll-weather-stat-value">{w.precipitation || 0}mm</span>
                    </div>
                    <div className="ll-weather-stat">
                      <span className="ll-weather-stat-label">{t('wind')}</span>
                      <span className="ll-weather-stat-value">{w.windSpeed || 12} km/h</span>
                    </div>
                  </div>
                </div>
                {nextPrecip && (
                  <div className="ll-next-precip">
                    <div className="ll-precip-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b7ea1" stroke="none"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                    </div>
                    <div>
                      <span className="ll-precip-label">{t('nextPrecipitation')}</span>
                      <span className="ll-precip-value">{nextPrecip.hours}h ({nextPrecip.probability}%)</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 7-Day Forecast */}
            {weather?.daily?.length > 0 && (
              <div className="ll-forecast-strip">
                {weather.daily.slice(0, 7).map((day, i) => (
                  <div key={i} className="ll-forecast-day">
                    <span className="ll-forecast-day-label">{day.day}</span>
                    <span style={{ fontSize: '1.25rem' }}>{day.emoji}</span>
                    <span className="ll-forecast-temp">{day.maxTemp}°</span>
                    <span className="ll-forecast-temp-low">{day.minTemp}°</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Price Tracker */}
          <div className="ll-topography-section" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <div className="ll-topo-header">
              <h2 className="ll-section-title">{t('livePriceTracker')}</h2>
              <div className="ll-topo-tabs">
                <span className="ll-sensor-count" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d5016' }}>
                  ₹{livePrice} <span style={{ fontSize: '0.875rem', color: '#687858', fontWeight: 'normal' }}>{t('perQuintal')}</span>
                </span>
              </div>
            </div>
            <div className="ll-map-container" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, minHeight: '300px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="ll-connectivity-dot" style={{ background: '#c9a84c' }}></span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Live Govt. Mandi Data Simulation</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>↑ 2.4% {t('weeklyTrend')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="ll-right-col">
          {/* Moisture & pH Row */}
          <div className="ll-metrics-row">
            <div className="ll-moisture-card">
              <span className="ll-metric-label-top">{t('moisture')}</span>
              <div className="ll-moisture-gauge">
                <svg viewBox="0 0 120 120" className="ll-gauge-svg">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e8e4dc" strokeWidth="8"/>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#4a7a2e" strokeWidth="8"
                    strokeDasharray="326.7" strokeDashoffset="104.5" strokeLinecap="round" transform="rotate(-90 60 60)"/>
                </svg>
                <div className="ll-gauge-value">
                  <span className="ll-gauge-number">68</span><span className="ll-gauge-percent">%</span>
                </div>
              </div>
              <span className="ll-moisture-range">{t('optimalRange')}</span>
            </div>
            <div className="ll-ph-card">
              <div className="ll-ph-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d5016" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                <span className="ll-metric-label-top">{t('phLevel')}</span>
              </div>
              <div className="ll-ph-value">6.4</div>
              <div className="ll-ph-bar"><div className="ll-ph-bar-fill" style={{ width: '64%' }}></div></div>
            </div>
          </div>

          {/* Nutrient Index */}
          <div className="ll-nutrient-card">
            <div className="ll-nutrient-left">
              <div className="ll-nutrient-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#2d5016" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"/></svg>
              </div>
              <div>
                <h4 className="ll-nutrient-title">{t('nutrientIndex')}</h4>
                <p className="ll-nutrient-desc">{t('nutrientDesc')}</p>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a9a7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>

          {/* Activity Log */}
          <div className="ll-activity-section">
            <div className="ll-activity-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d5016" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <h3 className="ll-section-title-sm">{t('activityLog')}</h3>
            </div>
            <div className="ll-activity-list">
              {activityLog.map((item, i) => (
                <div key={i} className="ll-activity-item">
                  <div className="ll-activity-dot" style={{ background: item.color }}></div>
                  <div className="ll-activity-content">
                    <span className="ll-activity-time">{item.time}</span>
                    <h4 className="ll-activity-title">{item.title}</h4>
                    <p className="ll-activity-desc">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="ll-view-history-btn">{t('viewFullHistory')}</button>
          </div>

          {/* Active Alerts */}
          <div className="ll-alerts-section">
            <div className="ll-alerts-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#c44536" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <h3 className="ll-section-title-sm">{t('activeAlerts')}</h3>
            </div>
            <div className="ll-alerts-list">
              {alerts.map((alert, i) => (
                <div key={i} className="ll-alert-item">
                  <div className="ll-alert-icon-wrap" style={{ background: `${alert.color}15`, color: alert.color }}><span>{alert.icon}</span></div>
                  <div className="ll-alert-content">
                    <h4 className="ll-alert-title">{alert.title}</h4>
                    <p className="ll-alert-desc">{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
