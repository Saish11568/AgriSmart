import { useState, useEffect } from 'react';
import { yojanaAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import './Modules.css';

export default function YojanaPage() {
  const { t, language } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSchemes = async (cat = 'All') => {
    setLoading(true);
    try {
      const res = await yojanaAPI.getAll(cat, language);
      setSchemes(res.data.schemes);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchemes(activeCategory); }, [language]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    fetchSchemes(cat);
  };

  const catIcons = { 'Financial Aid': '💰', Insurance: '🛡️', Infrastructure: '🏗️', 'Market Access': '🏪', All: '📋' };
  const catColors = { 'Financial Aid': '#4a7a2e', Insurance: '#3b7ea1', Infrastructure: '#c9a84c', 'Market Access': '#8b6f47' };

  return (
    <div className="page-container module-page">
      <div className="page-header">
        <h1>🏛️ {t('yojanaTitle')}</h1>
        <p>{t('yojanaSubtitle')}</p>
      </div>

      {/* Important Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(45,80,22,0.1), rgba(201,168,76,0.1))',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem'
      }}>
        <span style={{ fontSize: '2rem' }}>💡</span>
        <div>
          <p style={{ fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>{t('yojanaTip')}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('yojanaTipDesc')}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => handleCategoryChange(cat)}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)',
              border: activeCategory === cat ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
              background: activeCategory === cat ? 'var(--color-primary)' : 'var(--bg-card)',
              color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.375rem'
            }}>
            <span>{catIcons[cat] || '📄'}</span> {cat}
          </button>
        ))}
      </div>

      {loading && <div className="loading-container"><div className="spinner"></div><p>{t('loadingSchemes')}</p></div>}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {schemes.map(scheme => {
            const isExpanded = expandedId === scheme.id;
            return (
              <div key={scheme.id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                borderLeft: `4px solid ${catColors[scheme.category] || '#2d5016'}`,
                transition: 'all 0.3s ease'
              }}>
                {/* Header */}
                <div onClick={() => setExpandedId(isExpanded ? null : scheme.id)}
                  style={{
                    padding: '1.25rem 1.5rem', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <span style={{ fontSize: '2rem' }}>{scheme.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.063rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>
                        {scheme.displayName}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {scheme.displayBenefit}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.688rem' }}>✅ {scheme.status}</span>
                    <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', animation: 'fadeInUp 0.3s ease' }}>
                    <p style={{ fontSize: '0.938rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                      {scheme.displayDescription}
                    </p>

                    {/* Eligibility */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ✅ {t('eligibility')}
                      </h4>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(scheme.displayEligibility || scheme.eligibility).map((item, i) => (
                          <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: '1.5rem', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--color-primary)' }}>•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* How to Apply */}
                    <div style={{
                      background: 'var(--bg-accent)', padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)', marginBottom: '1rem'
                    }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                        📝 {t('howToApply')}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {scheme.displayHowToApply || scheme.howToApply}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer"
                        className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        🌐 {t('visitOfficial')}
                      </a>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                        {t('lastUpdated')}: {scheme.lastUpdated}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
