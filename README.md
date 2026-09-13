# ⚡ Sidekick

> **Sidekick is an AI agent that lives where you work, understands the context around you, and takes action without making you leave your workflow.**

[![Hackathon](https://img.shields.io/badge/Hackathon-Agents%2C%20Everywhere-indigo.svg)](https://github.com)
[![Platform](https://img.shields.io/badge/Platform-Chrome%20Extension-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green.svg)](https://nodejs.org/)
[![Model](https://img.shields.io/badge/AI%20Model-OpenAI%20GPT--4o-orange.svg)](https://platform.openai.com/)

---

## 💡 Pitch & Problem Statement

Today's AI assistants require users to leave their work context:
```text
Email → copy text → open AI chatbot → paste context → explain request → get response → open calendar → manually create event
```

**Sidekick flips this workflow.** It operates inside a Chrome Side Panel alongside any webpage, extracts the page's context automatically, understands natural language requests, and executes structured tool calls (like creating calendar events) with human confirmation.

---

## 🏗️ Architecture

```text
┌──────────────────────────────────────┐
│        Chrome Browser Tab            │
│  (e.g., demo/sample-email.html)      │
└──────────────────┬───────────────────┘
                   │ Context Extraction
                   ▼
┌──────────────────────────────────────┐       POST /agent        ┌──────────────────────────────────────┐
│       Sidekick Side Panel            │ ───────────────────────► │       Node.js Express Backend        │
│    (extension/sidepanel.html)        │                          │          (backend/server.js)         │
└──────────────────┬───────────────────┘ ◄─────────────────────── └──────────────────┬───────────────────┘
                   │                                                                 │
                   │ Confirmation                                                    │ OpenAI Tool Call
                   ▼                                                                 ▼
┌──────────────────────────────────────┐       POST /confirm      ┌──────────────────────────────────────┐
│     Event Preview Confirmation Card  │ ───────────────────────► │    Tool Layer (createCalendarEvent)  │
│          [Confirm] [Cancel]          │                          │   (Google Calendar API / Fallback)   │
└──────────────────────────────────────┘                          └──────────────────────────────────────┘
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js** (v18.0 or higher)
- **Google Chrome** browser
- **OpenAI API Key** *(optional: mock demo fallback active if key is unconfigured)*

---

### 1. Clone & Setup Backend

```bash
# Clone the repository
git clone https://github.com/your-username/sidekick.git
cd sidekick/backend

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env
```

Ensure your `backend/.env` file contains:
```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
GOOGLE_CALENDAR_ENABLED=false
```

Start the backend server:
```bash
node server.js
```
*(Server will start on `http://localhost:3000`)*

---

### 2. Install Chrome Extension

1. Open **Google Chrome** and navigate to `chrome://extensions`.
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select the [`/extension`](file:///c:/Users/izulr/OneDrive/Documents/Hackathon%20Project/openAI/extension) folder from this repository.
5. Click the **Sidekick** extension icon in your Chrome toolbar to open the side panel.

---

## 🎬 Step-by-Step Demo Guide

1. **Open Sample Page**: Double-click [`demo/sample-email.html`](file:///c:/Users/izulr/OneDrive/Documents/Hackathon%20Project/openAI/demo/sample-email.html) or drag it into Chrome to open the sample email containing the Q4 Kickoff meeting details.
2. **Launch Sidekick**: Click the Sidekick extension icon in the top right of Chrome to open the Side Panel.
3. **Submit Request**: Type:
   > *"Add this meeting to my calendar."*
4. **Agent Reasoning**: Sidekick extracts the email context, calls OpenAI `gpt-4o`, identifies event parameters, and renders a structured **Event Preview Card**.
5. **Human Confirmation**: Click the green **Confirm** button.
6. **Execution**: Sidekick creates the calendar event and displays:
   > `✅ Added "Q4 Project Kickoff Meeting" to your calendar.`

---

## 🛠️ Project Structure

```text
├── backend/
│   ├── agent.js                   # OpenAI agent reasoning & tool calling
│   ├── calendar.js                # Google OAuth2 & Calendar API client
│   ├── server.js                  # Express API server (POST /agent, POST /confirm)
│   ├── tools/
│   │   └── createCalendarEvent.js # Calendar tool execution & fallback handler
│   ├── .env                       # Environment configuration
│   └── package.json               # Backend dependencies
├── extension/
│   ├── manifest.json              # Chrome Manifest V3 setup
│   ├── background.js              # Service worker & side panel launcher
│   ├── content.js                 # Webpage text context extractor
│   ├── sidepanel.html             # Side panel layout
│   ├── sidepanel.css              # Dark mode styling & UI elements
│   └── sidepanel.js               # Side panel UI logic & API handler
├── demo/
│   └── sample-email.html          # Sample webpage for demo walkthroughs
├── docs/
│   └── Sidekick_PRD.md            # Product Requirements Document
└── tasks/
    └── tasks-sidekick-mvp.md      # Implementation task checklist
```

---

## 🏆 Hackathon MVP Status

- [x] Chrome Side Panel UI (Manifest V3)
- [x] Automatic Page Context Extraction
- [x] Natural Language Command Processing
- [x] OpenAI Tool Calling (`create_calendar_event`)
- [x] Interactive Confirmation Card (Human-in-the-Loop)
- [x] Google Calendar API & Demo Fallback Execution
- [x] Robust Error Handling & Feedback
