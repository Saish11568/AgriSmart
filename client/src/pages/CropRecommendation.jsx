import { useState, useEffect } from 'react';
import { cropAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import './Modules.css';

export default function CropRecommendation() {
  const { t } = useLanguage();
  const [options, setOptions] = useState(null);
  const [soilType, setSoilType] = useState('');
  const [season, setSeason] = useState('');
  const [waterAvailability, setWaterAvailability] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cropAPI.getOptions().then(res => setOptions(res.data)).catch(() => {});
  }, []);

  const handleRecommend = async () => {
    if (!soilType || !season || !waterAvailability) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await cropAPI.recommend(soilType, season, waterAvailability);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get recommendations. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container module-page">
      <div className="page-header">
        <h1>🌱 {t('cropAdvisor')}</h1>
        <p>{t('cropSubstitle')}</p>
      </div>

      <div className="module-form">
        <div className="form-row">
          <div className="form-group" style={{marginBottom: 0}}>
            <label className="form-label">Soil Type</label>
            <select className="form-select" value={soilType} onChange={e => setSoilType(e.target.value)}>
              <option value="">{t('selectSoil') || '-- Select Soil --'}</option>
              {options?.soilTypes?.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{marginBottom: 0}}>
            <label className="form-label">Season</label>
            <select className="form-select" value={season} onChange={e => setSeason(e.target.value)}>
              <option value="">{t('selectSeasonOpt') || '-- Select Season --'}</option>
              {options?.seasons?.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.months})</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{marginBottom: 0}}>
            <label className="form-label">Water Availability</label>
            <select className="form-select" value={waterAvailability} onChange={e => setWaterAvailability(e.target.value)}>
              <option value="">-- Select Level --</option>
              {options?.waterLevels?.map(w => (
                <option key={w.id} value={w.id}>{w.name} — {w.description}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn btn-primary btn-lg mt-lg" onClick={handleRecommend} disabled={loading}>
          {loading ? (t('analyzing') || '⏳ Analyzing...') : `🌱 ${t('getRecommendationsBtn') || 'Get Recommendations'}`}
        </button>
        {error && <p className="form-error mt-md">⚠️ {error}</p>}
      </div>

      {loading && (
        <div className="loading-container"><div className="spinner"></div><p>Analyzing soil and market conditions...</p></div>
      )}

      {result && (
        <div className="results-section">
          {/* Insights */}
          {result.insights.length > 0 && (
            <div className="insights-list" style={{ marginBottom: 'var(--space-xl)' }}>
              {result.insights.map((insight, i) => (
                <div key={i} className="insight-card insight-tip">
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          )}

          {/* Top Pick */}
          {result.topPick && (
            <>
              <h3 className="section-title">🏆 Top Recommendation</h3>
              <div className="rec-card" style={{ marginBottom: 'var(--space-xl)', borderColor: 'var(--color-gold)', boxShadow: '0 0 20px rgba(245, 158, 11, 0.1)' }}>
                <span className="rec-rank rec-rank-1">🏆 #1</span>
                <div className="rec-header">
                  <span className="rec-emoji">{result.topPick.emoji}</span>
                  <div>
                    <h3>{result.topPick.name}</h3>
                    <span className="badge badge-success">{result.topPick.badge}</span>
                  </div>
                </div>
                <div className="rec-score-bar">
                  <div className="rec-score-fill" style={{ width: `${result.topPick.score}%` }}></div>
                </div>
                <p className="rec-score-label">Match Score: {result.topPick.score}/100 | Profitability: {result.topPick.profitabilityScore}/100</p>
                <div className="rec-insights">
                  {result.topPick.insights.map((ins, i) => <p key={i}>{ins}</p>)}
                </div>
                <p className="info-sub mt-md">⏱️ Growth Duration: {result.topPick.growthDuration} | 📦 Storage: {result.topPick.storageType}</p>
              </div>
            </>
          )}

          {/* All Recommendations */}
          <h3 className="section-title">📋 All Recommendations ({result.recommendations.length} crops)</h3>
          <div className="result-grid stagger-in">
            {result.recommendations.slice(1, 7).map((crop) => (
              <div key={crop.id} className="rec-card">
                {crop.badge && <span className={`rec-rank rec-rank-${crop.rank}`}>{crop.badge}</span>}
                <div className="rec-header">
                  <span className="rec-emoji">{crop.emoji}</span>
                  <div>
                    <h3>{crop.name}</h3>
                    <span className="info-sub">{crop.category}</span>
                  </div>
                </div>
                <div className="rec-score-bar">
                  <div className="rec-score-fill" style={{ width: `${crop.score}%` }}></div>
                </div>
                <p className="rec-score-label">Score: {crop.score}/100</p>
                <div className="rec-insights">
                  {crop.insights.slice(0, 3).map((ins, i) => <p key={i}>{ins}</p>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
