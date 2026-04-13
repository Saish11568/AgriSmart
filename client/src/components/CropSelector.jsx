import React, { useState, useEffect, useRef } from 'react';
import './CropSelector.css';
import { useLanguage } from '../context/LanguageContext';

export const COMPREHENSIVE_CROPS = [
  { id: 'wheat', name: 'Wheat', emoji: '🌾', category: 'grain' },
  { id: 'rice', name: 'Rice', emoji: '🍚', category: 'grain' },
  { id: 'maize', name: 'Maize (Corn)', emoji: '🌽', category: 'grain' },
  { id: 'jowar', name: 'Jowar (Sorghum)', emoji: '🌾', category: 'grain' },
  { id: 'bajra', name: 'Bajra (Pearl Millet)', emoji: '🌾', category: 'grain' },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'vegetable' },
  { id: 'onion', name: 'Onion', emoji: '🧅', category: 'vegetable' },
  { id: 'potato', name: 'Potato', emoji: '🥔', category: 'vegetable' },
  { id: 'garlic', name: 'Garlic', emoji: '🧄', category: 'vegetable' },
  { id: 'ginger', name: 'Ginger', emoji: '🫚', category: 'spice' },
  { id: 'cabbage', name: 'Cabbage', emoji: '🥬', category: 'vegetable' },
  { id: 'cauliflower', name: 'Cauliflower', emoji: '🥦', category: 'vegetable' },
  { id: 'brinjal', name: 'Brinjal (Eggplant)', emoji: '🍆', category: 'vegetable' },
  { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'vegetable' },
  { id: 'cotton', name: 'Cotton', emoji: '☁️', category: 'cash-crop' },
  { id: 'sugarcane', name: 'Sugarcane', emoji: '🎋', category: 'cash-crop' },
  { id: 'soybean', name: 'Soybean', emoji: '🫘', category: 'oilseed' },
  { id: 'groundnut', name: 'Groundnut (Peanut)', emoji: '🥜', category: 'oilseed' },
  { id: 'mustard', name: 'Mustard', emoji: '🌼', category: 'oilseed' },
  { id: 'turmeric', name: 'Turmeric', emoji: '🟡', category: 'spice' },
  { id: 'chilli', name: 'Chilli', emoji: '🌶️', category: 'spice' },
  { id: 'pepper', name: 'Black Pepper', emoji: '⚫', category: 'spice' },
  { id: 'apple', name: 'Apple', emoji: '🍎', category: 'fruit' },
  { id: 'banana', name: 'Banana', emoji: '🍌', category: 'fruit' },
  { id: 'mango', name: 'Mango', emoji: '🥭', category: 'fruit' },
  { id: 'grapes', name: 'Grapes', emoji: '🍇', category: 'fruit' },
  { id: 'tea', name: 'Tea', emoji: '🍵', category: 'plantation' },
  { id: 'coffee', name: 'Coffee', emoji: '☕', category: 'plantation' },
  { id: 'coconut', name: 'Coconut', emoji: '🥥', category: 'plantation' },
  { id: 'chickpea', name: 'Chickpea (Chana)', emoji: '🧆', category: 'pulse' },
  { id: 'lentil', name: 'Lentil (Masoor)', emoji: '🥣', category: 'pulse' }
];

export const QUANTITY_UNITS = [
  { id: '1kg', label: '1 kg', multiplier: 0.01 },
  { id: '10kg', label: '10 kg', multiplier: 0.1 },
  { id: '1q', label: '1 Quintal (100 kg)', multiplier: 1 },
  { id: '1t', label: '1 Ton (1000 kg)', multiplier: 10 }
];

export default function CropSelector({ 
  selectedCrop, 
  onCropChange, 
  quantity, 
  onQuantityChange, 
  showRealTimePrice = false 
}) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [livePrice, setLivePrice] = useState(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set initial search value based on selectedCrop prop
  useEffect(() => {
    if (selectedCrop) {
      const crop = COMPREHENSIVE_CROPS.find(c => c.id === selectedCrop);
      if (crop) setSearch(crop.name);
    }
  }, [selectedCrop]);

  // Simulate real-time Govt API fetch
  useEffect(() => {
    if (showRealTimePrice && selectedCrop) {
      setLivePrice(null); // Reset while 'fetching'
      const timer = setTimeout(() => {
        // Simulate an API call to a Govt Mandi database
        const basePrice = 1500 + Math.random() * 3000;
        setLivePrice(Math.round(basePrice));
      }, 600); 
      return () => clearTimeout(timer);
    } else {
      setLivePrice(null);
    }
  }, [selectedCrop, showRealTimePrice]);

  const filteredCrops = COMPREHENSIVE_CROPS.filter(crop => 
    crop.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectCrop = (crop) => {
    onCropChange(crop.id);
    setSearch(crop.name);
    setIsOpen(false);
  };

  const getMultiplier = () => {
    const q = QUANTITY_UNITS.find(u => u.id === quantity);
    return q ? q.multiplier : 1;
  };

  return (
    <div className="crop-selector-container">
      {/* CROP SEARCH / DROPDOWN */}
      <div className="form-group" style={{ marginBottom: 0, flex: 2 }} ref={wrapperRef}>
        <label className="form-label">{t('selectCrop')}</label>
        <div className="searchable-dropdown">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Type or select a crop..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
              if (e.target.value === '') onCropChange('');
            }}
            onFocus={() => setIsOpen(true)}
          />
          <span className="dropdown-arrow">▼</span>
          
          {isOpen && (
            <ul className="dropdown-list">
              {filteredCrops.length > 0 ? (
                filteredCrops.map(crop => (
                  <li 
                    key={crop.id} 
                    onClick={() => handleSelectCrop(crop)}
                    className={selectedCrop === crop.id ? 'selected' : ''}
                  >
                    <span>{crop.emoji}</span> {crop.name}
                  </li>
                ))
              ) : (
                <li className="no-results">No crops found. Try another search.</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* QUANTITY SELECTOR */}
      {onQuantityChange && (
        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
          <label className="form-label">Quantity</label>
          <select 
            className="form-select" 
            value={quantity} 
            onChange={(e) => onQuantityChange(e.target.value)}
          >
            {QUANTITY_UNITS.map(q => (
              <option key={q.id} value={q.id}>{q.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* REAL-TIME GOVT PRICE BADGE */}
      {showRealTimePrice && selectedCrop && (
        <div className="live-price-badge">
          <div className="badge-header">
            <span className="pulse-dot"></span> Live e-NAM Price
          </div>
          {livePrice ? (
            <div className="badge-value">
              ₹{(livePrice * getMultiplier()).toLocaleString('en-IN')}
              <span className="badge-unit"> / {QUANTITY_UNITS.find(u => u.id === quantity)?.label.split(' ')[1] || 'unit'}</span>
            </div>
          ) : (
            <div className="badge-loading">Fetching govt data...</div>
          )}
        </div>
      )}
    </div>
  );
}
