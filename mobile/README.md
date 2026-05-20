# BistroMind AI: Standalone Expo & Node.js REST Backend Setup

Translate your gourmet fine-dining assistant app to your personal phone! This monorepo workspace provides the standalone production-ready files for a **React Native (Expo)** client application and an **Express (Node.js)** backend server integrating Gemini.

---

## 1. Node.js Backend Server Setup

Your backend handles the AI-waiter description matching, allergy rules checking, and menu APIs using the modern `@google/genai` model connection.

### Installation
1. Navigate into the backend folder:
   ```bash
   cd backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Set your API Key in your variables:
   - Create a file named `.env` based on `.env.example`:
     ```env
     PORT=4000
     GEMINI_API_KEY=your_actual_google_gemini_api_key
     ```
4. Start the backend:
   ```bash
   npm start
   ```
   *Your server should output:* `BistroMind standalone server is working on port 4000`.

---

## 2. React Native (Expo) Mobile App Setup

The mobile app renders your premium dark-accented restaurant menu, active trolley status, and real-time talk-to-waiter chat.

### Installation & Run on Phone
1. Install the official **Expo Go** application on your physical iPhone (App Store) or Android (Google Play Store).
2. Open a new terminal on your machine and navigate to the mobile folder:
   ```bash
   cd mobile
   ```
3. Install package configurations:
   ```bash
   npm install
   ```
4. Find your computer's local system IP Address (e.g., `192.168.1.50` on macOS or Windows). Ensure both your handset and computer are connected to the same Wi-Fi network.
5. In the terminal, start the Expo bundler:
   ```bash
   npx expo start
   ```
6. **Scan & Run:**
   - **Android:** Open the Expo Go app and tap "Scan QR Code" to trace the QR printed in your dev terminal.
   - **iOS:** Open the default Camera App on your iPhone, hover over the terminal's QR code, and tap the suggested yellow clip to open Expo Go!
7. **Configure Server IP:**
   - Swipe to the **Settings** gear icon in the app bottom nav.
   - Set the Node.js Server URL input to match your machine's IP (e.g. `http://192.168.1.50:4000`).
   - Boom! Chat with your restaurant waiter, adjust your diet status, and order dishes.
