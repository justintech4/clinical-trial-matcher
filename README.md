# Clinical Trial Matcher

## Project Summary
A full stack web application that takes a patient–doctor transcript, extracts structured patient and diagnosis data using an LLM-style parser, and then queries the ClinicalTrials.gov API to surface relevant clinical trials for that patient.  
Built with **Express** on the backend and **React** on the frontend.  
The server is deployed on **Render**, and the frontend is deployed on **Vercel**.

---

## Backend Approach
The backend is a small Express server with three main pieces: middleware for error handling, a single route that accepts a transcript and returns recommendations, and services that handle LLM-style extraction and ClinicalTrials.gov lookups. LLM behavior is controlled by environment variables so it can either use a mocked extraction or call the real OpenAI API. The deployed version uses the mock due to OpenAI API quota limits during development.  

When querying ClinicalTrials.gov, overly rich queries (e.g., filtering by stage or biomarkers) sometimes returned no results, so the service keeps the query focused on the primary condition to reliably return up to 10 recruiting trials. Only the fields used by the UI are included in the response.

---

## Frontend Approach
The frontend is a simple React single page application. `App.js` owns the main state and calls the backend, while the UI is broken into small components: a transcript form, an extracted data display, and a trials list. A small API helper handles the fetch call, and a constants file stores a sample transcript. The goal was to keep the component tree easy to understand and each piece focused on a single responsibility.

---

## Deployed Application
**Live Demo:**  
https://clinical-trial-matcher-sand.vercel.app/

---

## Setup and Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/justintech4/clinical-trial-matcher.git
cd clinical-trial-matcher
```

### 2. Backend setup
```bash
cd backend
npm install
```

Inside `backend/.env`:
```
PORT=4000
USE_MOCK_LLM=true
OPENAI_API_KEY=your_key_here   # only needed if USE_MOCK_LLM=false
```

Run the backend:
```bash
npm run dev
```

Backend should be available at:
```
http://localhost:4000
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Inside `frontend/.env`:
```
REACT_APP_API_BASE_URL=http://localhost:4000
```

Run the frontend:
```bash
npm start
```

Frontend will open at:
```
http://localhost:3000
```

---

## Assumptions Made
- The app returns **up to 10 trials** per query to provide a good sample size without overwhelming the user.  
- Searching by the **primary condition** is sufficient for this demo; advanced filtering (distance, phase, location, biomarkers) can be added later.  
- The mock LLM extraction is a reasonable stand-in for a real LLM response and demonstrates the full workflow end-to-end.  
- Transcripts are in English and roughly follow a standard patient–provider dialogue.

---

## Craftsmanship: Frontend Design
I put intentional effort into small UI details that make the app intuitive and pleasant to use without unnecessary complexity. The browser tab has a clear application title, and the main input includes a labeled “Transcript” text box with a short description so users know exactly what to paste. A realistic sample transcript is prefilled for convenience. When the user submits the form, a loading spinner shows progress, and any backend errors are displayed cleanly.  

Trial results are displayed in distinct card sections with consistent grouping of fields (summary, eligibility, conditions, intervention, primary outcome). Only the most relevant information is shown to reduce noise, with a direct “View study” link for users who want full details. Material UI provides clean spacing, responsive layouts, and accessible typography without custom CSS. The layout was tested on mobile to ensure the transcript input, extracted data, and trial cards are readable and usable on smaller screens.

---

