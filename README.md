# 🌾 Krishak Sarathi — Full Stack Setup Guide

Krishak Sarathi ("Farmer's Companion") is a full-stack app for Indian farmers:
live weather + soil data, an AI crop advisor (Gemini + RAG), a voice advisor,
government scheme links, farmer survey, login/register, and more.

This guide gets you running **entirely on your own laptop** using:
- **Node.js / Express** — backend API
- **MongoDB Atlas** — free cloud database
- **Google Gemini API** — free AI model for the AI/Voice Advisor
- **React** — the frontend (already built, now wired to the backend)
- **Thunder Client** — VS Code extension to test the API

No prior backend experience assumed — follow the steps in order.

---

## 0. What you need installed first

| Tool | Check version | Get it |
|---|---|---|
| Node.js (v18+) | `node -v` | https://nodejs.org (LTS version) |
| npm (comes with Node) | `npm -v` | — |
| VS Code (recommended) | — | https://code.visualstudio.com |
| Thunder Client extension | — | Search "Thunder Client" in VS Code Extensions tab |
| A free MongoDB Atlas account | — | https://www.mongodb.com/cloud/atlas/register |
| A free Google Gemini API key | — | https://aistudio.google.com/app/apikey |

---

## 1. Project structure

```
Krishak Sarathi/
├── backend/          <- Node/Express API (new)
├── frontend/         <- React app (your existing UI, now connected to backend)
└── thunder-client/   <- Import these into Thunder Client to test the API
```

---

## 2. Set up MongoDB Atlas (free cloud database)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Click **"Build a Database"** → choose the **FREE (M0)** tier → pick any cloud
   provider/region close to you → click **Create**.
3. **Create a database user**: when prompted (Security Quickstart), set a
   username and password (e.g. `ksadmin` / a strong password). **Save these** —
   you'll need them for the connection string. Avoid `@`, `/`, `:` in the
   password, or URL-encode them if you must use them.
4. **Network Access**: click **"Add My Current IP Address"** so your laptop
   can connect. (For development you can alternatively allow `0.0.0.0/0` —
   "Allow access from anywhere" — but that's less secure; fine for a local
   learning project.)
5. Once the cluster is created (takes ~1-3 min), click **"Connect"** →
   **"Drivers"** → copy the connection string. It looks like:
   ```
   mongodb+srv://ksadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your real password, and add a database name
   right after `.net/` — e.g.:
   ```
   mongodb+srv://ksadmin:MyPass123@cluster0.xxxxx.mongodb.net/krishaksarathi?retryWrites=true&w=majority
   ```
   You'll paste this into `backend/.env` in step 4 below. You don't need to
   manually create the `krishaksarathi` database — MongoDB creates it
   automatically the first time data is written.

---

## 3. Get a free Google Gemini API key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with a Google account and click **"Create API key"**.
3. Copy the key (starts with `AIza...`). You'll paste this into
   `backend/.env` in the next step.

This powers the **AI Advisor** and **Voice Advisor** pages. The backend also
uses a small local "crop knowledge base" (RAG) so answers are grounded in
real agronomy facts (irrigation timing, fertilizer doses, pest control, etc.)
before being phrased nicely by Gemini — see `backend/data/cropKnowledgeBase.js`.

> Weather data uses **Open-Meteo**, which is completely free and needs **no
> API key** — nothing to configure there.

---

## 4. Configure and run the backend

```bash
cd backend
npm install
cp .env.example .env
```

Now open `backend/.env` in a text editor and fill in:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://ksadmin:MyPass123@cluster0.xxxxx.mongodb.net/krishaksarathi?retryWrites=true&w=majority

JWT_SECRET=any_long_random_string_you_make_up
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=AIza...your_key_here
GEMINI_MODEL=gemini-1.5-flash

USE_OPENWEATHER=false
OPENWEATHER_API_KEY=

CLIENT_URL=http://localhost:3000
```

**(Optional but recommended)** seed the government schemes into your database
so the "Government Schemes" page has real data with real official links:

```bash
npm run seed
```

Now start the backend:

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0-xxxxx.mongodb.net
🚀 Krishak Sarathi backend running on http://localhost:5000
```

Leave this terminal running. Open `http://localhost:5000/` in a browser —
you should see `{"message":"Krishak Sarathi API is running 🌱","status":"ok"}`.

### Troubleshooting
- **`MongoDB connection error`** → double check `MONGO_URI` (password correct,
  no typos) and that your IP is whitelisted in Atlas → Network Access.
- **AI Advisor errors mentioning `GEMINI_API_KEY`** → check the key was pasted
  correctly into `.env` with no extra spaces/quotes, then restart `npm run dev`.
- Changed `.env`? You must restart the server (`Ctrl+C`, then `npm run dev`
  again) — env vars are only read on startup.

---

## 5. Configure and run the frontend

Open a **second terminal** (keep the backend running in the first one):

```bash
cd frontend
npm install --legacy-peer-deps
cp .env.example .env
```

> **Note:** `--legacy-peer-deps` is needed because of a peer-dependency
> version mismatch between `react-scripts` and `typescript` in this
> project's existing `package.json` (unrelated to the new backend code) —
> without the flag, `npm install` may fail with an `ERESOLVE` error.


`frontend/.env` should contain:
```env
REACT_APP_API_URL=http://localhost:5000/api
```
(This is already the default, so you usually don't need to change anything.)

Start the frontend:

```bash
npm start
```

This opens `http://localhost:3000` in your browser automatically. You should
see the Krishak Sarathi homepage. Try:

- **Register** a new account → **Login**
- **Weather** page → search any Indian city (e.g. "Pune", "Nashik") or click
  the location-pin icon to use your current location
- **AI Advisor** → ask something like *"When should I irrigate wheat?"*
- **Voice Advisor** → tap the mic and speak (use **Google Chrome** — it has
  the best support for the browser's built-in Speech Recognition API)
- **Government Schemes** → real links to pmkisan.gov.in, pmfby.gov.in, etc.
- **Farmer Survey** and **Contact Us** → submissions are saved to MongoDB

---

## 6. How Voice Advisor works (no paid speech API needed)

To keep this free and simple to run locally, "speech-to-speech" uses your
**browser's built-in APIs**, not a paid cloud service:

1. **Speech-to-Text**: the `react-speech-recognition` library wraps the
   browser's native `SpeechRecognition` API to turn your voice into text.
2. That text is sent to the backend `/api/ai/chat` endpoint, same as the
   AI Advisor chat — Gemini (+ the local RAG knowledge base) generates an answer.
3. **Text-to-Speech**: the answer is read aloud using the browser's built-in
   `speechSynthesis` API.

This works best in **Google Chrome** on desktop or Android. Safari/Firefox
have limited/no support for `SpeechRecognition`.

---

## 7. Testing the API directly with Thunder Client

1. Install the **Thunder Client** extension in VS Code.
2. Open Thunder Client (the lightning-bolt icon in the sidebar).
3. Go to **Collections → Import** and select
   `thunder-client/thunderclient-collection.json` from this project.
4. Go to **Env → Import** and select
   `thunder-client/thunderclient-environment.json`. Make sure the
   **"Krishak Sarathi - Local"** environment is selected (top-right dropdown).
5. Make sure the backend is running (`npm run dev` in `backend/`).
6. Try requests in this order:
   - **Auth → Register** (or Login if you already have an account) — this
     collection is set up so a successful **Login** automatically saves the
     JWT into the `token` environment variable, which the other authenticated
     requests (`Get Me`, `Get My Chat History`, etc.) reuse automatically.
   - **Weather → Get Weather by City**
   - **AI Advisor → AI Chat**
   - **Schemes → Get All Schemes**
   - **Survey → Submit Farmer Survey**
   - **Contact → Submit Contact Form**

---

## 8. Project / API reference

### Backend folder structure
```
backend/
├── server.js                 # Express app entry point
├── config/db.js              # MongoDB Atlas connection
├── models/                   # Mongoose schemas (User, ChatMessage, Survey, Contact, Scheme, Notification)
├── controllers/               # Route logic
├── routes/                    # Express routers
├── middleware/auth.js         # JWT protect / optionalAuth middleware
├── utils/gemini.js            # Gemini REST API wrapper
├── utils/rag.js               # Lightweight keyword-based retrieval (RAG)
├── data/cropKnowledgeBase.js  # The knowledge chunks RAG retrieves from
└── seed/seedSchemes.js        # Seeds real government scheme data
```

### API Endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET  | `/api/auth/me` | Private | Get current user |
| GET  | `/api/weather?city=X` or `?lat=&lon=` | Public | Current + forecast weather |
| POST | `/api/ai/chat` | Optional | Ask the AI advisor (text or voice mode) |
| GET  | `/api/ai/history` | Private | Your past AI conversations |
| GET  | `/api/schemes?search=&category=` | Public | List government schemes |
| POST | `/api/survey` | Optional | Submit farmer survey |
| POST | `/api/contact` | Public | Submit contact form |
| GET  | `/api/notifications` | Optional | Get notifications + unread count |
| PUT  | `/api/notifications/:id/read` | Private | Mark notification read |
| PUT  | `/api/users/me` | Private | Update your profile |

"Optional" auth = works for guests, but saves data against your account if
you're logged in (send `Authorization: Bearer <token>` header).

---

## 9. Adding more crop knowledge (RAG)

Want smarter/more specific AI answers? Just add more entries to
`backend/data/cropKnowledgeBase.js` — no retraining, no vector database
required. Each entry is a small `{ crop, topic, content }` chunk; the backend
scores chunks by keyword overlap with the farmer's question and feeds the
top matches to Gemini as grounding context before it answers.

---

## 10. Common issues

| Problem | Fix |
|---|---|
| Frontend shows "Network Error" / toast errors everywhere | Backend isn't running, or `REACT_APP_API_URL` in `frontend/.env` doesn't match the backend port. Restart frontend after editing `.env`. |
| CORS error in browser console | Make sure `CLIENT_URL` in `backend/.env` matches your frontend URL exactly (`http://localhost:3000`). |
| "MONGO_URI is not set" | You forgot to `cp .env.example .env` in `backend/`, or forgot to fill it in. |
| AI Advisor says GEMINI_API_KEY missing | Add your key to `backend/.env` and restart the backend. |
| Voice Advisor mic button does nothing | Use Google Chrome; allow microphone permission when prompted; Safari/Firefox have poor `SpeechRecognition` support. |
| Weather shows "Could not find location" | Try a bigger nearby city name, or use the location-pin button (uses GPS/browser geolocation instead). |

---

Happy farming! 🌱
