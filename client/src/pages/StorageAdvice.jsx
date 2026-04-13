import { useState, useEffect } from 'react';
import { priceAPI, storageAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import './Modules.css';

export default function StorageAdvice() {
  const { t } = useLanguage();
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    priceAPI.getCrops().then(res => setCrops(res.data.crops)).catch(() => {});
  }, []);

  const handleAdvice = async () => {
    if (!selectedCrop || !currentPrice) {
      setError('Please select a crop and enter current price');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await storageAPI.getAdvice(selectedCrop, parseInt(currentPrice));
      
      // Dynamic translation logic for reasoning
      if (res.data.decision === 'STORE CROP') {
        if (res.data.percentChange > 15) {
          res.data.translatedReasoning = t('reasonHighRise');
        } else {
          res.data.translatedReasoning = t('reasonModRise');
        }
      } else if (res.data.decision === 'SELL NOW') {
        res.data.translatedReasoning = t('reasonStable');
      } else {
        res.data.translatedReasoning = t('reasonDrop');
      }

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get advice. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const decisionConfig = {
    'SELL IMMEDIATELY': { icon: '🚨', class: 'urgent', color: '#f87171', labelKey: 'sellImmediately' },
    'SELL NOW': { icon: '💰', class: 'sell', color: '#4ade80', labelKey: 'sellNow' },
    'STORE CROP': { icon: '📦', class: 'hold', color: '#fbbf24', labelKey: 'storeCrop' }
  };

  return (
    <div className="page-container module-page">
      <div className="page-header">
        <h1>📦 {t('storageAdvice')}</h1>
        <p>{t('storageSub')}</p>
      </div>

      <div className="module-form">
        <div className="form-row">
          <div className="form-group" style={{marginBottom: 0}}>
            <label className="form-label">{t('selectCrop')}</label>
            <select className="form-select" value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}>
              <option value="">{t('chooseCrop')}</option>
              {crops.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{marginBottom: 0}}>
            <label className="form-label">{t('currentMarketPrice') || 'Current Market Price (₹/quintal)'}</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g., 2200"
              value={currentPrice}
              onChange={e => setCurrentPrice(e.target.value)}
              min="0"
            />
          </div>
          <div>
            <button className="btn btn-primary btn-lg" onClick={handleAdvice} disabled={loading}>
              {loading ? '⏳ ...' : `🧠 ${t('getRecommendations')}`}
            </button>
          </div>
        </div>
        {error && <p className="form-error mt-md">⚠️ {error}</p>}
      </div>

      {loading && (
        <div className="loading-container"><div className="spinner"></div><p>Comparing prices and analyzing trends...</p></div>
      )}

      {result && (
        <div className="results-section">
          {/* Big Decision Card */}
          <div className={`decision-card ${decisionConfig[result.decision]?.class || 'sell'}`} style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="decision-icon">{decisionConfig[result.decision]?.icon || '💰'}</div>
            <div className="decision-text" style={{ color: decisionConfig[result.decision]?.color }}>
              {t(decisionConfig[result.decision]?.labelKey) || result.decision}
            </div>
            <p className="decision-reason">{result.translatedReasoning || result.reasoning}</p>
          </div>

          {/* Price Comparison */}
          <div className="result-grid" style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="info-card">
              <h4>{t('currentPriceStr')}</h4>
              <div className="info-value">₹{result.currentPrice.toLocaleString()}</div>
              <p className="info-sub">{t('perQuintal')}</p>
            </div>
            <div className="info-card">
              <h4>{t('predictedPrice')}</h4>
              <div className="info-value" style={{ color: result.percentChange > 0 ? '#4ade80' : '#f87171' }}>
                ₹{result.predictedPrice.toLocaleString()}
              </div>
              <p className="info-sub">{result.percentChange > 0 ? '↑' : '↓'} {Math.abs(result.percentChange)}% {t('expectedChange')}</p>
            </div>
            <div className="info-card">
              <h4>{t('priceDifference')}</h4>
              <div className="info-value" style={{ color: result.priceDifference > 0 ? '#4ade80' : '#f87171' }}>
                {result.priceDifference > 0 ? '+' : ''}₹{result.priceDifference.toLocaleString()}
              </div>
              <p className="info-sub">{t('perQuintal')} {result.priceDifference > 0 ? t('potentialGain') : t('potentialLoss')}</p>
            </div>
          </div>

          {/* Financial Summary */}
          <h3 className="section-title">💰 {t('financialImpact')}</h3>
          <div className="financial-summary">
            <div className="financial-card">
              <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('perQuintal')}</h4>
              <div className="info-value" style={{ color: result.financials.potentialPerQuintal > 0 ? '#4ade80' : '#f87171' }}>
                {result.financials.potentialPerQuintal > 0 ? '+' : ''}₹{result.financials.potentialPerQuintal.toLocaleString()}
              </div>
            </div>
            <div className="financial-card">
              <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('for10Quintals')}</h4>
              <div className="info-value" style={{ color: result.financials.estimatedFor10Quintals > 0 ? '#4ade80' : '#f87171' }}>
                {result.financials.estimatedFor10Quintals > 0 ? '+' : ''}₹{result.financials.estimatedFor10Quintals.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Storage Info */}
          {result.storageAdvice && (
            <div className="storage-info">
              <h4>
                {result.storageAdvice.icon}{' '}
                {result.storageAdvice.type === 'Cold Storage' ? t('coldStorageRecommended') :
                 result.storageAdvice.type === 'Immediate Use' ? t('immediateUseRecommended') :
                 t('dryWarehouseRecommended')}
              </h4>
              <ul className="storage-tips">
                {result.storageAdvice.tips.map((tip, i) => {
                  let translatedTip = tip;
                  if (tip.includes('moisture-proof')) translatedTip = t('storeInBags');
                  else if (tip.includes('sunlight')) translatedTip = t('keepAwaySunlight');
                  else if (tip.includes('ventilation')) translatedTip = t('ensureVentilation');
                  else if (tip.includes('pest control')) translatedTip = t('usePestControl');
                  else if (tip.includes('cold storage facility')) translatedTip = t('extendShelfLife');
                  else if (tip.includes('consistent temperature')) translatedTip = t('maintainTemp');
                  else if (tip.includes('Check for spoilage')) translatedTip = t('checkSpoilage');
                  else if (tip.includes('limited storage life')) translatedTip = t('limitedStorage');
                  else if (tip.includes('1-2 days')) translatedTip = t('sellProcess12Days');
                  else if (tip.includes('value-added')) translatedTip = t('valueAddedProducts');
                  else if (tip.includes('Can be stored for')) translatedTip = `${t('canBeStoredFor')}: ${result.crop.shelfLife || 'Unknown'}`;
                  else if (tip.includes('Shelf life in cold storage')) translatedTip = `${t('shelfLifeCold')}: ${result.crop.shelfLife || 'Unknown'}`;

                  return <li key={i}>{translatedTip}</li>;
                })}
              </ul>
              <div className="storage-meta">
                <div className="storage-meta-item">
                  <span className="storage-meta-label">{t('temperature')}</span>
                  <span className="storage-meta-value">{result.storageAdvice.temperature === 'Room temperature' ? t('roomTemperature') : result.storageAdvice.temperature}</span>
                </div>
                {result.storageAdvice.estimatedCost && (
                  <div className="storage-meta-item">
                    <span className="storage-meta-label">{t('estCost')}</span>
                    <span className="storage-meta-value">{result.storageAdvice.estimatedCost}</span>
                  </div>
                )}
                <div className="storage-meta-item">
                  <span className="storage-meta-label">{t('shelfLife')}</span>
                  <span className="storage-meta-value">{result.crop.shelfLife}</span>
                </div>
              </div>
            </div>
          )}

          {/* Predicted Prices */}
          <div className="insights-list">
            <h3 className="section-title">📅 {t('upcomingPredictedPrices')}</h3>
            {result.predictions.map((p, i) => (
              <div key={i} className="insight-card insight-up">
                <span className="insight-icon">📆</span>
                <p><strong>{p.month}:</strong> ₹{p.price.toLocaleString()}/{(t('perQuintal') || 'quintal').toLowerCase()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
