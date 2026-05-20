# BistroMind AI — The Intelligent Bistro

BistroMind AI is a high-fidelity mobile restaurant ordering experience built for **The Intelligent Bistro** challenge.  
It combines a polished **React Native Expo** mobile app with a **Node.js Express backend**, allowing users to browse a menu, manage a cart, and place or modify orders through a conversational AI assistant.

The key idea is simple: the AI is not just a chatbot — it understands restaurant-ordering intent and converts natural language into structured cart actions.

---

## Demo Highlights

- Browse a premium bistro-style menu
- Add dishes manually from the UI
- Manage cart quantities, removals, and totals
- Use the AI Maître D to update the cart conversationally
- Convert user messages into structured JSON actions
- Run a Node.js backend for menu and AI order processing
- Works with Expo Go on iPhone/Android

---

## Tech Stack

### Mobile App

- React Native
- Expo
- TypeScript
- Expo Go
- React Native state management with hooks

### Backend

- Node.js
- Express.js
- REST API
- AI / rule-based intent parsing fallback
- Structured cart action responses

---

## Project Structure

```txt
the-intelligent-bistro/
  backend/
    package.json
    server.js
    README.md

  mobile/
    App.tsx
    app.json
    package.json
    tsconfig.json
    assets/

  README.md