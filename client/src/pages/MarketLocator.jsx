import { useState, useEffect, useRef } from 'react';
import { marketAPI, retailerAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import CropSelector from '../components/CropSelector';
import './Modules.css';

export default function MarketLocator() {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('');
  const [quantity, setQuantity] = useState('1q');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);

  // Negotiation Modal State
  const [activeRetailer, setActiveRetailer] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const handleFind = async () => {
    setError('');
    setLoading(true);
    setResult(null);

    let lat = 15.3647, lng = 75.1240; // Default: Hubli

    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        setLocation({ lat, lng, source: 'GPS' });
      } catch {
        setLocation({ lat, lng, source: 'Default Location' });
      }
    } else {
      setLocation({ lat, lng, source: 'Default Location' });
    }

    try {
      const res = await marketAPI.find(lat, lng, selectedCrop || undefined);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to find markets. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const openNegotiation = (market, retailer, postedPrice) => {
    const finalPrice = postedPrice || market.cropPrice || 2400;
    setActiveRetailer({ ...retailer, market, cropPrice: finalPrice });
    setChatMessages([
      { sender: 'retailer', text: `Hello! I see you are interested in selling ${selectedCrop || 'crops'}. I am currently offering ₹${finalPrice.toLocaleString()}/q. If you want to sell it, we can connect right now.` }
    ]);
  };

  const sendChatMessage = async (e, forceMessage = null) => {
    if (e) e.preventDefault();
    
    const userMessage = forceMessage || chatInput;
    if (!userMessage.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'farmer', text: userMessage }]);
    if (!forceMessage) setChatInput('');

    const priceMatch = userMessage.match(/\d+/);
    const farmerPrice = priceMatch ? parseInt(priceMatch[0], 10) : activeRetailer.cropPrice;

    try {
      const res = await retailerAPI.negotiate(
        selectedCrop || 'wheat', 
        farmerPrice, 
        userMessage, 
        activeRetailer.id, 
        activeRetailer.market.id
      );

      setChatMessages(prev => [...prev, { 
        sender: 'retailer', 
        text: res.data.message 
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        sender: 'retailer', 
        text: 'Sorry, I am currently unavailable. Please try again later.' 
      }]);
    }
  };

  const ratingStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '⭐'.repeat(full) + (half ? '½' : '');
  };

  return (
    <div className="page-container module-page" style={{ position: 'relative' }}>
      <div className="page-header">
        <h1>🤝 {t('marketLocator')}</h1>
        <p>{t('marketSub')}</p>
      </div>

      <div className="module-form">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          
          <CropSelector 
            selectedCrop={selectedCrop} 
            onCropChange={setSelectedCrop}
            quantity={quantity}
            onQuantityChange={setQuantity}
            showRealTimePrice={true} 
          />

          <div style={{ alignSelf: 'flex-start' }}>
            <button className="btn btn-primary btn-lg" onClick={handleFind} disabled={loading}>
              {loading ? (t('scanning') || '⏳ Scanning...') : `📍 ${t('findMarketsBtn') || 'Find Markets & Buyers'}`}
            </button>
          </div>
        </div>
        
        {location && (
          <p className="info-sub mt-md">📡 Location: {location.source} ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})</p>
        )}
        {error && <p className="form-error mt-md">⚠️ {error}</p>}
      </div>

      {loading && (
        <div className="loading-container"><div className="spinner"></div><p>Scanning nearby markets and active buyers...</p></div>
      )}

      {result && (
        <div className="results-section">
          {/* Best Price Market */}
          {result.bestPriceMarket && (
            <>
              <h3 className="section-title">💰 Top Paying Mandi</h3>
              <div className="market-card best-price" style={{ marginBottom: 'var(--space-xl)', padding: '2rem' }}>
                <span className="market-badge"><span className="badge badge-warning badge-lg">💰 Best Price</span></span>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
                  <div>
                    <h3 className="market-name" style={{ fontSize: '1.75rem' }}>{result.bestPriceMarket.name}</h3>
                    <p className="market-location" style={{ fontSize: '1.1rem' }}>📍 {result.bestPriceMarket.city}, {result.bestPriceMarket.state}</p>
                    <div className="market-details" style={{ marginTop: '1rem' }}>
                      <div className="market-detail">
                        <span className="market-detail-label">Base Rate</span>
                        <span className="market-detail-value text-success" style={{ fontSize: '1.25rem' }}>₹{result.bestPriceMarket.cropPrice?.toLocaleString()}/q</span>
                      </div>
                      <div className="market-detail">
                        <span className="market-detail-label">Distance</span>
                        <span className="market-detail-value">{result.bestPriceMarket.distance} km</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Retailers List for Best Market */}
                  <div style={{ flex: '1', minWidth: '300px', background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '12px' }}>
                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>🤝</span> Active Retailers Bidding Here
                    </h4>
                    {result.bestPriceMarket.retailers.map(ret => {
                      const marginInfo = ret.cropMargins && ret.cropMargins[selectedCrop] ? ret.cropMargins[selectedCrop] : null;
                      const postedPrice = marginInfo ? marginInfo.postedPrice : (result.bestPriceMarket.cropPrice || 2400);
                      return (
                        <div key={ret.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '1.05rem', margin: '0 0 0.25rem 0' }}>{ret.name}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>👤 {ret.buyer} • ⭐ {ret.rating}</p>
                            <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, margin: '0.25rem 0 0 0' }}>Offering: ₹{postedPrice.toLocaleString()} / quintal</p>
                          </div>
                          <button 
                            className="btn btn-primary"
                            onClick={() => openNegotiation(result.bestPriceMarket, ret, postedPrice)}
                          >
                            🤝 Connect
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Nearest Markets */}
          <h3 className="section-title">📍 Other Nearby Markets</h3>
          <div className="result-grid stagger-in">
            {result.nearestMarkets.map((market, i) => (
              <div key={market.id} className={`market-card`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="market-name">{market.name}</h3>
                    <p className="market-location">📍 {market.city}, {market.state}</p>
                  </div>
                  <span className="badge badge-success text-success">₹{market.cropPrice?.toLocaleString()}/q</span>
                </div>
                
                <div className="market-details" style={{ marginTop: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                   <div className="market-detail">
                    <span className="market-detail-label">Distance</span>
                    <span className="market-detail-value">{market.distance} km</span>
                  </div>
                </div>

                 <div style={{ marginTop: '1rem' }}>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>Active Retailers Buying {selectedCrop || 'Crop'} Here:</p>
                   {market.retailers.map(ret => {
                     const marginInfo = ret.cropMargins && ret.cropMargins[selectedCrop] ? ret.cropMargins[selectedCrop] : null;
                     const postedPrice = marginInfo ? marginInfo.postedPrice : (market.cropPrice || 2400);
                     return (
                       <div key={ret.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '3px solid var(--color-primary)' }}>
                          <div>
                            <span style={{ fontSize: '1rem', fontWeight: 600, display: 'block' }}>{ret.name}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Buyer: {ret.buyer} • ⭐ {ret.rating}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>₹{postedPrice.toLocaleString()}/q</span>
                            <button 
                              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                              onClick={() => openNegotiation(market, ret, postedPrice)}
                            >
                              🤝 Connect & Sell
                            </button>
                          </div>
                       </div>
                     );
                   })}
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RETAILER NEGOTIATION MODAL */}
      {activeRetailer && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card)', width: '100%', maxWidth: '500px',
            borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
          }}>
            {/* Header */}
            <div style={{ background: 'var(--color-primary)', padding: '1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{activeRetailer.name}</h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Contact: {activeRetailer.buyer}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                  <span>📍 {activeRetailer.market.name}</span>
                  <span>📱 {activeRetailer.phone}</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveRetailer(null)}
                style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.8 }}
              >
                ✕
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: 'var(--bg-primary)', height: '300px', overflowY: 'auto' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.sender === 'farmer' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'farmer' ? 'var(--color-primary)' : 'white',
                  color: msg.sender === 'farmer' ? 'white' : 'var(--text-primary)',
                  padding: '0.75rem 1rem',
                  borderRadius: '16px',
                  borderBottomRightRadius: msg.sender === 'farmer' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.sender === 'retailer' ? '4px' : '16px',
                  maxWidth: '80%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  border: msg.sender === 'retailer' ? '1px solid var(--border-color)' : 'none'
                }}>
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Quick Actions / Input Area */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                <button 
                  onClick={() => sendChatMessage(null, `I accept the deal at ₹${activeRetailer.cropPrice}.`)}
                  style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', background: 'var(--color-success, #10b981)', color: 'white', border: 'none', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  ✅ Accept & Sell at ₹{activeRetailer.cropPrice?.toLocaleString()}
                </button>
                <button 
                  onClick={() => sendChatMessage(null, `Can we do ₹${activeRetailer.cropPrice + 50}?`)}
                  style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Ask for ₹{(activeRetailer.cropPrice + 50).toLocaleString()}
                </button>
              </div>

              <form onSubmit={sendChatMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={`Or type your own offer...`}
                  style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '24px', outline: 'none' }}
                />
                <button type="submit" disabled={!chatInput.trim()} style={{
                  background: chatInput.trim() ? 'var(--color-primary)' : 'var(--text-muted)', 
                  color: 'white', border: 'none', borderRadius: '24px', padding: '0 1.25rem', fontWeight: 600, 
                  cursor: chatInput.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s'
                }}>
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
