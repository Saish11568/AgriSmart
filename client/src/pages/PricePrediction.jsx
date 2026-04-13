import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { priceAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import CropSelector, { QUANTITY_UNITS } from '../components/CropSelector';
import './Modules.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function PricePrediction() {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [quantity, setQuantity] = useState('1q'); // quintal default
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handlePredict = async () => {
    if (!selectedCrop) { setError('Please select a crop'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await priceAPI.predict(selectedCrop);
      setResult({
        ...res.data,
        quantityMultiplier: QUANTITY_UNITS.find(q => q.id === quantity)?.multiplier || 1,
        quantityLabel: QUANTITY_UNITS.find(q => q.id === quantity)?.label.split(' ')[1] || 'unit'
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to predict. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? {
    labels: [
      ...result.historicalPrices.map(h => h.month),
      ...result.predictedPrices.map(p => p.month)
    ],
    datasets: [
      {
        label: `Historical Price (₹/${result.quantityLabel})`,
        data: [...result.historicalPrices.map(h => h.price * result.quantityMultiplier), ...Array(result.predictedPrices.length).fill(null)],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
        tension: 0.4,
        fill: true
      },
      {
        label: `Predicted Price (₹/${result.quantityLabel})`,
        data: [...Array(result.historicalPrices.length - 1).fill(null), result.historicalPrices[result.historicalPrices.length - 1].price * result.quantityMultiplier, ...result.predictedPrices.map(p => p.price * result.quantityMultiplier)],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        borderDash: [8, 4],
        pointRadius: 5,
        pointBackgroundColor: '#f59e0b',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8', usePointStyle: true, padding: 20 } },
      tooltip: {
        backgroundColor: '#1a2332',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ₹${ctx.parsed.y?.toLocaleString() || '-'}`
        }
      }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51, 65, 85, 0.3)' } },
      y: {
        ticks: { color: '#64748b', callback: (v) => `₹${v.toLocaleString()}` },
        grid: { color: 'rgba(51, 65, 85, 0.3)' }
      }
    },
    animation: { duration: 1000, easing: 'easeOutQuart' }
  };

  return (
    <div className="page-container module-page">
      <div className="page-header">
        <h1>📈 {t('pricePrediction')}</h1>
        <p>{t('cropSubstitle')}</p>
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
            <button className="btn btn-primary btn-lg" onClick={handlePredict} disabled={loading}>
              {loading ? '⏳ ...' : `🔮 ${t('predictLabelBtn')}`}
            </button>
          </div>
        </div>
        {error && <p className="form-error mt-md">⚠️ {error}</p>}
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Running AI prediction model...</p>
        </div>
      )}

      {result && (
        <div className="results-section">
          {/* Decision Badge */}
          <div className={`decision-badge ${result.recommendation === 'SELL NOW' ? 'decision-sell' : 'decision-hold'}`} style={{ marginBottom: 'var(--space-xl)' }}>
            <span>{result.recommendation === 'SELL NOW' ? '💰' : '⏳'}</span>
            <span>{result.recommendation}</span>
          </div>

          {/* Chart */}
          <div className="chart-container">
            <h3>📊 Price Trend — {result.crop.emoji} {result.crop.name}</h3>
            <div className="chart-wrapper">
              {chartData && <Line data={chartData} options={chartOptions} />}
            </div>
          </div>

          {/* Info Cards */}
          <div className="result-grid">
            <div className="info-card">
              <h4>Current Price</h4>
              <div className="info-value">₹{(result.currentPrice * result.quantityMultiplier).toLocaleString()}</div>
              <p className="info-sub">per {result.quantityLabel}</p>
            </div>
            <div className="info-card">
              <h4>Predicted Avg. Price</h4>
              <div className="info-value" style={{color: result.priceChange > 0 ? '#4ade80' : '#f87171'}}>
                ₹{(result.averagePredicted * result.quantityMultiplier).toLocaleString()}
              </div>
              <p className="info-sub">{result.priceChange > 0 ? '↑' : '↓'} {Math.abs(result.priceChange)}% change</p>
            </div>
            <div className="info-card">
              <h4>Trend</h4>
              <div className="info-value">{result.trend === 'increasing' ? '📈' : result.trend === 'decreasing' ? '📉' : '➡️'} {result.trend}</div>
              <p className="info-sub">Confidence: {result.confidence}%</p>
            </div>
          </div>

          {/* Reasoning */}
          <div className="insights-list">
            <div className="insight-card insight-tip">
              <span className="insight-icon">💡</span>
              <p>{result.reasoning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
