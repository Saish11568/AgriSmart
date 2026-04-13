import { useState, useEffect } from 'react';
import { newsAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import './Modules.css';

export default function NewsPage() {
  const { t } = useLanguage();
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNews = async (category = 'All') => {
    setLoading(true);
    setError('');
    try {
      const res = await newsAPI.getAll(category);
      // Determine if backend sent direct array or nested object
      const newsData = Array.isArray(res.data) ? res.data : (res.data.news || []);
      setNews(newsData);
      setCategories(res.data.categories || ['All', 'Market', 'Government']);
    } catch (err) {
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    fetchNews(cat);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const catIcons = { Government: '🏛️', Market: '📈', Weather: '🌦️', 'Crop Updates': '🌾', All: '📰' };
  const catColors = { Government: '#3b7ea1', Market: '#4a7a2e', Weather: '#c9a84c', 'Crop Updates': '#8b6f47' };

  return (
    <div className="page-container module-page">
      <div className="page-header">
        <h1>📰 {t('newsTitle')}</h1>
        <p>{t('newsSubtitle')}</p>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              border: activeCategory === cat ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
              background: activeCategory === cat ? 'var(--color-primary)' : 'var(--bg-card)',
              color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <span>{catIcons[cat] || '📄'}</span>
            {t(cat) || cat}
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading-container"><div className="spinner"></div><p>{t('loadingNews')}</p></div>
      )}

      {error && <p className="form-error">⚠️ {error}</p>}

      {!loading && news.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {news.map((item) => (
            <article
              key={item.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={() => {
                const url = item.sourceUrl || item.url || item.link;
                if (url) window.open(url, '_blank', 'noopener,noreferrer');
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Image */}
              <div style={{ height: '180px', overflow: 'hidden', position: 'relative', display: item.imageUrl ? 'block' : 'none' }}>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                {item.category && (
                  <span style={{
                    position: 'absolute', top: '0.75rem', left: '0.75rem',
                    padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
                    background: catColors[item.category] || '#2d5016', color: 'white',
                    fontSize: '0.75rem', fontWeight: 700
                  }}>
                    {catIcons[item.category]} {item.category}
                  </span>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.4, color: 'var(--text-heading)' }}>
                  {t(item.title) || item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>
                  {t(item.description) || item.description || item.summary}
                </p>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{
                        padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-accent)', color: 'var(--color-primary)',
                        fontSize: '0.688rem', fontWeight: 600
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.source}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo(item.date || item.publishedAt)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && news.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
          <p>{t('noNews')}</p>
        </div>
      )}
    </div>
  );
}
