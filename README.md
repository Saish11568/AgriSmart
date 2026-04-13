# 🌾 AgriSmart — Smart Price & Demand Prediction System for Farmers

> **An AI-powered platform that helps farmers decide what to grow, when to sell, and where to sell — maximizing profit and preventing losses.**

---

## 🚩 Problem Statement

Indian farmers face heavy losses due to:
- 📉 **Price crashes** — sudden drops in tomato, onion prices
- 📊 **Lack of demand prediction** — no way to forecast market needs
- 🏪 **No real-time market intelligence** — unaware of best-paying mandis
- 💸 **Middlemen exploitation** — forced to sell at unfair prices

**AgriSmart solves all of this using AI-driven insights.**

---

## ✨ Features

### 🔐 Authentication
- Secure login/signup with JWT tokens
- Proper error messages ("Account not found", "Incorrect password")
- Demo account for quick testing

### 📈 Module 1: Price Prediction
- AI-powered crop price forecasting using linear regression
- Seasonal trend adjustment with monthly weights
- Interactive line chart showing historical + predicted prices
- Decision badge: **SELL NOW** (green) or **HOLD** (amber)
- Confidence score for predictions

### 📊 Module 2: Demand Forecast
- Market demand analysis with trend detection
- Top 3 most profitable crops recommendation
- Bar chart showing monthly demand patterns
- Smart insights with actionable advice

### 📍 Module 3: Smart Market Locator
- GPS-powered location detection
- Haversine formula for accurate distance calculation
- Best price market highlight
- Nearest market cards with ratings and timings

### 🌱 Module 4: Crop Recommendation
- Multi-factor weighted scoring algorithm:
  - Soil compatibility (30%)
  - Season match (25%)
  - Water availability (20%)
  - Market demand (25%)
- Ranked results with profitability scores
- Personalized insights for each crop

### 📦 Module 5: Storage & Selling Advice
- Current vs predicted price comparison
- Financial impact calculator (per quintal & for 10 quintals)
- Storage type recommendations (cold storage, dry warehouse)
- Cost estimates and shelf life information
- Personalized insights for each crop

### 🎁 Bonus Features
- 🎙️ **Voice Assistant** — Mock Hindi/Kannada voice input
- 🔔 **WhatsApp-style Notifications** — Simulated market alerts
- 📡 **Offline Mode** — Cached data indicator

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Styling | Vanilla CSS (Custom Design System) |
| Charts | Chart.js + react-chartjs-2 |
| Routing | React Router DOM |
| HTTP Client | Axios |
| Backend | Node.js + Express |
| Auth | JWT + bcryptjs |
| Database | JSON file-based (hackathon-ready) |
| ML/AI | Linear regression + weighted scoring |

---

## 📂 Project Structure

```
AGRI/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Navbar, VoiceAssistant, NotificationPanel
│   │   ├── pages/             # All 7 pages (Login, Signup, Dashboard, 5 modules)
│   │   ├── context/           # AuthContext
│   │   ├── utils/             # API client
│   │   ├── App.jsx            # Main router
│   │   └── index.css          # Design system
│   └── index.html
│
├── server/                    # Node.js + Express backend
│   ├── data/                  # Mock datasets (crops, prices, markets)
│   ├── routes/                # REST API routes (6 modules)
│   ├── middleware/            # JWT auth middleware
│   ├── utils/                 # ML prediction + recommendation engine
│   └── server.js              # Express server
│
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### 1. Clone the repository
```bash
git clone <repo-url>
cd AGRI
```

### 2. Install & Start Backend
```bash
cd server
npm install
npm start
```
Backend runs on `http://localhost:5000`

### 3. Install & Start Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### 4. Open the app
Navigate to `http://localhost:5173` → Sign up or use **Demo Account**

---

## 🌐 Deployment

### Frontend (Vercel / Netlify)
```bash
cd client
npm run build
# Upload dist/ folder
```

### Backend (Render / Railway)
- Set environment variable: `JWT_SECRET=your_secret_key`
- Start command: `node server.js`
- Set `NODE_ENV=production`

---

## 📸 Screenshots

> Screenshots/recordings will be added after first run.

---

## 🔮 Future Scope

- 🌤️ **Real Weather API** integration (OpenWeatherMap)
- 📡 **Live Mandi Prices** from government APIs (data.gov.in)
- 🤖 **Advanced ML** with TensorFlow.js for better predictions
- 📱 **Mobile App** using React Native
- 🌐 **Multi-language** support (Hindi, Kannada, Tamil, Telugu)
- 💬 **WhatsApp Bot** for price alerts via Twilio
- 🛰️ **Satellite imagery** for crop health monitoring
- 🏦 **Loan/Insurance** recommendations based on crop choice

---

## 👥 Team

Built for hackathon demonstration — showcasing the potential of AI in Indian agriculture.

---

## 📄 License

MIT License — Free to use and modify.

