import { useState, useEffect } from 'react';
import './NotificationPanel.css';

const mockNotifications = [
  { id: 1, type: 'price-up', message: '🍅 Tomato prices up by 18% in Hubli market!', time: '2 min ago', urgent: true },
  { id: 2, type: 'demand', message: '🧅 High demand expected for Onion next month', time: '15 min ago', urgent: false },
  { id: 3, type: 'weather', message: '🌧️ Heavy rainfall predicted in Karnataka — may affect supply', time: '1 hr ago', urgent: true },
  { id: 4, type: 'market', message: '📍 Bengaluru Yeshwanthpur market: Best price for Chilli today ₹5,200/q', time: '3 hr ago', urgent: false },
  { id: 5, type: 'tip', message: '💡 Store your wheat in dry warehouse — prices expected to rise in 2 months', time: '5 hr ago', urgent: false },
];

export default function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState(mockNotifications);

  const dismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-panel" onClick={e => e.stopPropagation()}>
        <div className="notif-header">
          <h3>🔔 Notifications</h3>
          <button className="notif-close" onClick={onClose}>✕</button>
        </div>
        <div className="notif-list">
          {notifications.length === 0 ? (
            <p className="notif-empty">No new notifications</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notif-item ${n.urgent ? 'notif-urgent' : ''}`}>
                <p className="notif-message">{n.message}</p>
                <div className="notif-meta">
                  <span className="notif-time">{n.time}</span>
                  <button className="notif-dismiss" onClick={() => dismiss(n.id)}>Dismiss</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
