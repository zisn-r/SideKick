## Relevant Files

- `extension/manifest.json` - Chrome extension manifest (v3), defines permissions, side panel, and content script.
- `extension/sidepanel.html` - Side panel UI entry point.
- `extension/sidepanel.js` - Side panel logic: handles user input, communicates with backend, renders confirmation UI.
- `extension/sidepanel.css` - Styles for the side panel UI.
- `extension/content.js` - Content script that extracts page text and passes it to the side panel.
- `extension/background.js` - Background service worker for Chrome extension messaging.
- `backend/server.js` - Node.js Express API server (main entry point).
- `backend/agent.js` - Agent orchestration: sends context + request to OpenAI, handles tool call response.
- `backend/tools/createCalendarEvent.js` - Tool definition and execution logic for `create_calendar_event`.
- `backend/calendar.js` - Google Calendar API integration (OAuth2 + event creation).
- `backend/.env` - Environment variables (OpenAI API key, Google OAuth credentials). Not committed to git.
- `backend/package.json` - Node.js dependencies and scripts.
- `demo/sample-email.html` - Sample email page used during the hackathon demo.
- `README.md` - Project overview, setup instructions, and demo notes.

### Notes

- Unit tests are not required for this hackathon MVP — focus on end-to-end working demo.
- Use `node backend/server.js` or `npm run dev` to start the backend.
- Load the extension in Chrome via `chrome://extensions` → Developer mode → Load unpacked → select `/extension` folder.
- Google Calendar API requires OAuth2. For the MVP demo, use a pre-authorised test account to avoid the full OAuth flow during the presentation.
- If Google Calendar integration is not ready, set `GOOGLE_CALENDAR_ENABLED=false` in `.env` to use the simulated fallback.

---

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

---

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Initialise a git repository in the project root (`git init`)
  - [x] 0.2 Create and checkout a new branch for this feature (`git checkout -b feature/sidekick-mvp`)

- [x] 1.0 Project Setup & Repository Structure
  - [x] 1.1 Create the top-level folder structure: `/extension`, `/backend`, `/docs`, `/tasks`, `/demo`
  - [x] 1.2 Create `backend/package.json` and install core dependencies: `express`, `cors`, `dotenv`, `openai`
  - [x] 1.3 Create `backend/.env` with placeholder keys: `OPENAI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_CALENDAR_ENABLED`
  - [x] 1.4 Add `.gitignore` to exclude `node_modules/`, `.env`, `token.json`, and any build artifacts
  - [x] 1.5 Create `README.md` with project name, one-sentence pitch, and placeholder sections for setup and demo instructions

- [x] 2.0 Chrome Extension Skeleton (Side Panel + Content Script)
  - [x] 2.1 Create `extension/manifest.json` using Manifest V3 with permissions: `sidePanel`, `activeTab`, `scripting`
  - [x] 2.2 Register the side panel entry point (`sidepanel.html`) in `manifest.json` under `side_panel`
  - [x] 2.3 Register `content.js` as a content script that runs on all URLs (`matches: ["<all_urls>"]`)
  - [x] 2.4 Register `background.js` as the service worker in `manifest.json`
  - [x] 2.5 Create `extension/sidepanel.html` with a basic layout: app title, chat/message area, text input, and send button
  - [x] 2.6 Create `extension/sidepanel.css` with clean, readable styles for the panel (dark or light theme)
  - [x] 2.7 Create `extension/sidepanel.js` with a stub that logs "Sidekick ready" on load
  - [x] 2.8 Create `extension/background.js` with a listener that opens the side panel when the extension icon is clicked (`chrome.sidePanel.open`)
  - [x] 2.9 Create `extension/content.js` with a function that extracts `document.body.innerText` and sends it via `chrome.runtime.sendMessage`
  - [x] 2.10 Load the extension in Chrome (`chrome://extensions` → Developer mode → Load unpacked) and verify the side panel opens on click

- [x] 3.0 Backend API Server (Node.js)
  - [x] 3.1 Create `backend/server.js` with an Express app listening on port 3000
  - [x] 3.2 Add `cors` middleware so the Chrome extension can call the backend
  - [x] 3.3 Add `express.json()` middleware to parse JSON request bodies
  - [x] 3.4 Create a `POST /agent` endpoint that accepts `{ userRequest, pageContext }` and returns a placeholder response
  - [x] 3.5 Create a `POST /confirm` endpoint stub that accepts event parameters and returns a placeholder success response
  - [x] 3.6 Add basic request logging (log method, path, and body) to aid debugging
  - [x] 3.7 Test both endpoints with a tool like Postman or `curl` to confirm they receive and return data correctly

- [x] 4.0 Agent Core (OpenAI Integration + Tool Calling)
  - [x] 4.1 Create `backend/agent.js` and initialise the OpenAI client using the API key from `.env`
  - [x] 4.2 Define the `create_calendar_event` tool schema as a JSON object with parameters: `title` (string), `date` (string), `time` (string), `location` (string)
  - [x] 4.3 Write a `runAgent(userRequest, pageContext)` function that builds a system prompt instructing the model to extract event details from the provided page context
  - [x] 4.4 Call `openai.chat.completions.create` with the model (`gpt-4o`), the messages array, and the tools array
  - [x] 4.5 Parse the model response: check if `finish_reason` is `"tool_calls"` and extract the tool name and arguments
  - [x] 4.6 If no tool call is returned, respond with a friendly message: "I couldn't find any event information on this page."
  - [x] 4.7 Return the extracted tool call arguments (event details) from `runAgent` so the backend can forward them to the frontend
  - [x] 4.8 Wire `backend/agent.js` into the `POST /agent` endpoint in `server.js`
  - [x] 4.9 In `extension/sidepanel.js`, wire the send button to call `POST /agent` with `{ userRequest, pageContext }` where `pageContext` is retrieved from the content script via `chrome.tabs.sendMessage`
  - [x] 4.10 Log the agent response in the side panel console and verify structured event data is returned end-to-end

- [x] 5.0 Calendar Action & Google Calendar API Integration
  - [x] 5.1 Create `backend/tools/createCalendarEvent.js` with a function `createCalendarEvent({ title, date, time, location })` as a stub returning a mock success
  - [x] 5.2 Set up a Google Cloud project, enable the Google Calendar API, and create OAuth 2.0 credentials (Client ID + Client Secret)
  - [x] 5.3 Install the Google APIs Node.js client: `npm install googleapis`
  - [x] 5.4 In `backend/calendar.js`, set up an OAuth2 client using credentials from `.env` and implement a token load/refresh flow using a stored `token.json` file
  - [x] 5.5 Run a one-time OAuth authorisation script to generate and save `token.json` for the demo Google account
  - [x] 5.6 Implement the `calendar.events.insert` call in `createCalendarEvent.js` using the authorised client, mapping `date` + `time` to RFC 3339 format
  - [x] 5.7 Add a simulated fallback: if `GOOGLE_CALENDAR_ENABLED=false` in `.env`, skip the API call and return a mock success response
  - [x] 5.8 Wire `createCalendarEvent` into the `POST /confirm` endpoint in `server.js`
  - [x] 5.9 Test calendar event creation directly (bypass the extension) to confirm the Google Calendar API call works

- [x] 6.0 Confirmation UI & End-to-End Flow
  - [x] 6.1 In `extension/sidepanel.js`, after receiving the agent response, render a structured event preview card in the chat area showing: title, date, time, and location
  - [x] 6.2 Add **Confirm** and **Cancel** buttons below the event preview card
  - [x] 6.3 On **Confirm** click, send the event parameters to `POST /confirm` and await the response
  - [x] 6.4 On **Cancel** click, dismiss the preview card and display a message: "Action cancelled."
  - [x] 6.5 On a successful confirmation response, display: ✅ "Added '[Event Title]' to your calendar."
  - [x] 6.6 Disable the Confirm and Cancel buttons while the confirmation request is in flight to prevent double-submission
  - [x] 6.7 Run a full end-to-end test: open a webpage with event text → type "Add this meeting to my calendar." → verify the preview card appears → click Confirm → verify the calendar event is created

- [x] 7.0 Error Handling & Result Feedback
  - [x] 7.1 In `backend/server.js`, wrap all endpoint handlers in try/catch blocks and return `{ error: "..." }` with HTTP 500 on failure
  - [x] 7.2 In `extension/sidepanel.js`, check for an `error` field in the API response and display: ⚠️ "Something went wrong. Please try again."
  - [x] 7.3 Handle network errors in the extension (e.g., backend not running) and display a connection error message
  - [x] 7.4 Add a "Thinking..." loading indicator in the side panel that appears while waiting for the agent response and disappears once it arrives
  - [x] 7.5 Test failure scenarios: stop the backend and confirm the extension shows a graceful error; send a page with no event and confirm the "couldn't find" message appears

- [ ] 8.0 Demo Polish & Submission
  - [ ] 8.1 Create `demo/sample-email.html` — a realistic-looking email page containing a meeting invitation (e.g., "Project Kickoff, Tuesday at 10 AM, Meeting Room B")
  - [ ] 8.2 Polish the side panel UI: ensure layout, typography, and colours are clean and presentable for judges
  - [ ] 8.3 Update `README.md` with complete setup instructions: clone repo, install dependencies, configure `.env`, load extension, run backend
  - [ ] 8.4 Add a "Demo" section to `README.md` explaining the demo flow step-by-step
  - [ ] 8.5 Record a short demo video showing the full end-to-end flow: email page → Sidekick → confirmation → calendar event created
  - [ ] 8.6 Push the final code to GitHub and verify the repository is public and accessible
  - [ ] 8.7 Complete the hackathon submission form with the GitHub link, demo video link, and project description
