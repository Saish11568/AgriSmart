# ChatGPT Integration Guide for AgriSmart

If you want to use ChatGPT to help you develop or debug this project, copy and paste the information below.

## Project Context
**AgriSmart** is a full-stack (React + Node.js) agricultural prediction platform. It uses JSON files for data storage and custom JavaScript algorithms for predictions (no external ML libraries).

## Key Logic to Remember
1. **Price Prediction:** Linear Regression ($y = mx + b$) + Seasonal Multipliers (defined in `server/utils/prediction.js`).
2. **Crop Recommendation:** Weighted Scoring (Soil 30%, Demand 25%, Season 25%, Water 20%).
3. **Data Flow:** React Frontend -> Axios -> Express API -> JSON Files.

## Recommended Prompts

### For Adding a New Feature:
> "I am working on a project called AgriSmart (Node.js/React). I want to add a new module for [FEATURE NAME]. The backend uses JSON files for data. Can you help me design the data schema and the Express route for this?"

### For Debugging Predictions:
> "In my `prediction.js` file, I use linear regression and seasonal factors. The current seasonal factor for July is 1.15. If I want to account for a sudden drought this year, how should I modify the `predictPrice` function to accept a 'climatic impact' variable?"

### For UI Enhancements:
> "The AgriSmart frontend uses Vanilla CSS and React. I want to create a new 'Weather Widget' component that matches the existing glassmorphism aesthetic. Can you provide the JSX and CSS?"

---

## Technical Specs for AI
- **Frontend Stack:** React 19, Vite, Chart.js, Vanilla CSS.
- **Backend Stack:** Node.js, Express, JWT, bcryptjs.
- **Data Source:** Static JSON in `server/data/`.
- **Primary Algorithm:** Least Squares Linear Regression.
