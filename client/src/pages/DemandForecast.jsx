import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { demandAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import CropSelector from '../components/CropSelector';
import './Modules.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DemandForecast() {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [quantity, setQuantity] = useState('1q'); // quintal default
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleForecast = async () => {
    if (!selectedCrop) { setError('Please select a crop'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await demandAPI.forecast(selectedCrop);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to forecast. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const demandColors = { High: '#22c55e', Medium: '#f59e0b', Low: '#ef4444' };

  const chartData = result ? {
    labels: result.demand.chartData.map(d => d.month),
    datasets: [{
      label: 'Demand Score (%)',
      data: result.demand.chartData.map(d => d.demand),
      backgroundColor: result.demand.chartData.map((d, i) => {
        const currentMonth = new Date().getMonth();
        return i === currentMonth ? '#f59e0b' : 'rgba(16, 185, 129, 0.6)';
      }),
      borderColor: result.demand.chartData.map((d, i) => {
        const currentMonth = new Date().getMonth();
        return i === currentMonth ? '#f59e0b' : '#10b981';
      }),
      borderWidth: 1,
      borderRadius: 6
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a2332', titleColor: '#f1f5f9', bodyColor: '#94a3b8',
        borderColor: '#334155', borderWidth: 1, padding: 12
      }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { display: false } },
      y: {
        ticks: { color: '#64748b', callback: v => `${v}%` },
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        max: 100
      }
    },
    animation: { duration: 800 }
  };

  return (
    <div className="page-container module-page">
      <div className="page-header">
        <h1>📊 {t('demandForecast')}</h1>
        <p>{t('forecastSub')}</p>
      </div>

      <div className="module-form">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          
          <CropSelector 
            selectedCrop={selectedCrop} 
            onCropChange={setSelectedCrop}
            quantity={quantity}
            onQuantityChange={setQuantity}
            showRealTimePrice={true} // Add realtime price widget like Govt site
          />

          <div style={{ alignSelf: 'flex-start' }}>
            <button className="btn btn-primary btn-lg" onClick={handleForecast} disabled={loading}>
              {loading ? '⏳ ...' : `📊 ${t('forecastLabelBtn')}`}
            </button>
          </div>
        </div>
        {error && <p className="form-error mt-md">⚠️ {error}</p>}
      </div>

      {loading && (
        <div className="loading-container"><div className="spinner"></div><p>Analyzing market demand...</p></div>
      )}

      {result && (
        <div className="results-section">
          {/* Demand Level */}
          <div className="result-grid" style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="info-card">
              <h4>Demand Level</h4>
              <div className="info-value" style={{ color: demandColors[result.demand.level] }}>
                {result.demand.level === 'High' ? '🔥' : result.demand.level === 'Medium' ? '📊' : '📉'} {result.demand.level}
              </div>
              <p className="info-sub">Predicted demand for next season</p>
            </div>
            <div className="info-card">
              <h4>Current Demand</h4>
              <div className="info-value">{result.demand.currentDemand}%</div>
              <p className="info-sub">Based on recent market activity</p>
            </div>
            <div className="info-card">
              <h4>Demand Trend</h4>
              <div className="info-value">
                {result.demand.trend === 'Rising' ? '📈' : result.demand.trend === 'Falling' ? '📉' : '➡️'} {result.demand.trend}
              </div>
              <p className="info-sub">Overall direction</p>
            </div>
          </div>

          {/* Chart */}
          <div className="chart-container">
            <h3>📊 Monthly Demand Pattern — {result.crop.emoji} {result.crop.name}</h3>
            <div className="chart-wrapper">
              {chartData && <Bar data={chartData} options={chartOptions} />}
            </div>
          </div>

          {/* Top Profitable Crops */}
          <h3 className="section-title" style={{ marginTop: 'var(--space-xl)' }}>🏆 Top 3 Most Profitable Crops</h3>
          <div className="result-grid">
            {result.topProfitableCrops.map((crop, i) => (
              <div key={crop.id} className="rec-card">
                <span className={`rec-rank rec-rank-${i + 1}`}>#{i + 1}</span>
                <div className="rec-header">
                  <span className="rec-emoji">{crop.emoji}</span>
                  <div>
                    <h3>{crop.name}</h3>
                    <span className={`badge ${crop.demandLevel === 'High' ? 'badge-success' : crop.demandLevel === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
                      {crop.demandLevel} Demand
                    </span>
                  </div>
                </div>
                <div className="rec-score-bar">
                  <div className="rec-score-fill" style={{ width: `${crop.profitPotential}%` }}></div>
                </div>
                <p className="rec-score-label">Profit Potential: {crop.profitPotential}/100</p>
                <p className="info-sub mt-md">Avg Price: ₹{crop.avgPrice.toLocaleString()}/quintal • Trend: {crop.trend}</p>
              </div>
            ))}
          </div>

          {/* Insights */}
          {result.insights.length > 0 && (
            <div className="insights-list">
              <h3 className="section-title">💡 Smart Insights</h3>
              {result.insights.map((insight, i) => (
                <div key={i} className="insight-card insight-tip">
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
