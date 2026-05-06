# 🌾 AgriSmart — Smart Price & Demand Prediction System for Farmers

> **An AI-powered platform that helps farmers decide what to grow, when to sell, and where to sell — maximizing profit and preventing losses.**

---

## 📖 Overview
AgriSmart is a full-stack agricultural intelligence platform designed to empower Indian farmers with data-driven insights. It bridges the gap between raw market data and actionable farming decisions using custom-built prediction models and recommendation engines.

---

## 🏗️ Technical Architecture

### 🛡️ Backend (Node.js & Express)
The backend serves as the brain of the system, handling data processing, authentication, and logic execution.
- **Persistence:** Local JSON file-based database (located in `server/data/`) for rapid prototyping and zero-dependency deployment.
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` for secure password hashing.
- **Core Logic:** Custom JavaScript implementations of statistical models (no heavy ML libraries needed, ensuring high performance on low-resource servers).

### 🎨 Frontend (React & Vite)
A modern, responsive SPA (Single Page Application) built for speed and clarity.
- **State Management:** React Context API for global auth and user state.
- **Visualizations:** Chart.js for interactive price and demand trends.
- **Design System:** Custom Vanilla CSS with a focus on accessibility and "premium" aesthetic (Glassmorphism elements, vibrant agricultural color palette).

---

## 🧠 How It Works (The Logic)

### 📈 1. Price Prediction Algorithm (`server/utils/prediction.js`)
The system predicts future crop prices using a two-step approach:
1.  **Linear Regression:** Fits a line ($y = mx + b$) to historical price data to identify the long-term growth or decline trend.
2.  **Seasonal Adjustment:** Multiplies the base trend by **Seasonal Factors** (e.g., prices typically drop during harvest gluts in Nov/Dec and rise during monsoon disruptions in July/August).
3.  **Recommendation Engine:** If the predicted price is >10% higher than current, it suggests **HOLD**; if >10% lower, it suggests **SELL NOW**.

### 🌱 2. Crop Recommendation Engine (`server/utils/recommendation.js`)
Uses a **Weighted Multi-Factor Scoring** system to rank crops for a specific farmer:
- **Soil Compatibility (30%):** Matches crop requirements with user-input soil type.
- **Market Demand (25%):** Prioritizes crops with rising demand trends.
- **Season Match (25%):** Checks if the current month is the ideal sowing time.
- **Water Availability (20%):** Adjusts based on the farmer's water source (Rain-fed vs. Irrigation).

### 📊 3. Demand Forecasting
Analyzes recent "mandi" arrival volumes and buyer interest to categorize demand into **High, Medium, or Low**, helping farmers avoid over-saturated markets.

### 📍 4. Smart Market Locator
Uses the **Haversine Formula** to calculate the great-circle distance between the farmer's GPS coordinates and various market hubs, identifying the "Nearest" and "Best Price" mandis.

---

## 📂 Project Structure

```bash
AGRI/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI (Navbar, VoiceAssistant, etc.)
│   │   ├── pages/          # Feature pages (Dashboard, Prediction, etc.)
│   │   ├── context/        # AuthContext for login state
│   │   ├── utils/          # Axios instance & API helpers
│   │   └── index.css       # Global design system & animations
│   └── vite.config.js
│
├── server/                 # Node.js + Express backend
│   ├── data/               # JSON "Database" (crops.json, users.json, etc.)
│   ├── routes/             # API Endpoints (Auth, Price, Demand, etc.)
│   ├── middleware/         # JWT Verification & Request Logging
│   ├── utils/              # The "AI" logic (Regression & Scoring)
│   └── server.js           # Main entry point
└── package.json            # Root scripts for concurrent execution
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- A modern web browser

### 2. Installation
From the root directory:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 3. Running the App
Run both client and server simultaneously:
```bash
npm run dev
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:3000](http://localhost:3000)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Create a new farmer account |
| `POST` | `/api/auth/login` | Authenticate and get JWT |
| `GET` | `/api/price/:cropId` | Get historical + predicted prices |
| `GET` | `/api/recommend/crops` | Get weighted crop recommendations |
| `GET` | `/api/market/nearby` | Find best mandis based on GPS |

---

## 🔮 Future Roadmap
- **Real-time API:** Transition from JSON to `data.gov.in` Live Mandi API.
- **Weather Integration:** Hyper-local weather alerts using OpenWeatherMap.
- **Voice UI:** Full multi-lingual voice support for non-tech-savvy farmers.
- **Offline Sync:** PWA capabilities for use in low-connectivity areas.

---

## 👥 Team & License
Built for educational and hackathon purposes.
**License:** MIT
