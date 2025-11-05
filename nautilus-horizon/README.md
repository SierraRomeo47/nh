<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1YqEGG_9gjV22TaPZKJKodrNxdB0mq2nS

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Gemini API:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and set your `GEMINI_API_KEY`:
     ```bash
     GEMINI_API_KEY=your_gemini_api_key_here
     ```
   - Get your free API key from [Google AI Studio](https://aistudio.google.com/)

3. Run the app:
   ```bash
   npm run dev
   ```
   
   The app will be available at http://localhost:3000

## Features

- **Scenario Pad**: AI-powered maritime compliance analysis
- **EU ETS & FuelEU Compliance**: Track emissions and compliance costs
- **Role-Based Dashboards**: Customized views for different user roles
- **Real-Time Market Data**: EUA pricing and regulatory updates
