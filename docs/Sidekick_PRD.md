# Sidekick PRD

**Project:** Sidekick  
**Hackathon:** Agents, Everywhere: Bots, Channels, & More  
**Event Duration:** 4 hours  
**Status:** Hackathon MVP  
**Primary Platform:** Web browser  
**Core Interaction:** Natural-language command → contextual understanding → tool execution

---

## 1. Product Overview

**Sidekick is an AI agent that lives inside the environment where people already work.**

Instead of opening a separate AI chatbot, copying information into it, explaining the context, and manually carrying out the result, users can simply ask Sidekick to perform a task based on the page they are currently viewing.

For the hackathon MVP, Sidekick will operate as a browser-based assistant that can understand the contents of the current page and perform useful actions based on that context.

### Core Example

A user opens an email containing:

> "Let's meet Tuesday at 10 AM in Meeting Room B to discuss the project kickoff."

The user asks:

> "Add this to my calendar."

Sidekick extracts the relevant information, generates a calendar event preview, and asks the user for confirmation before creating it.

---

## 2. Problem Statement

Today's AI assistants often require users to leave the environment where they are working.

A typical workflow looks like:

**Email → copy content → open AI → paste content → explain what you want → get answer → open calendar → manually create event**

This introduces unnecessary friction.

The user already has the relevant context on their screen.

### Problem

**AI is often separated from the work it is supposed to help with.**

Users should not have to continuously shuttle information between applications just to get an AI assistant to perform simple tasks.

---

## 3. Product Vision

### Vision

> **Bring the agent to the user's work, instead of making the user bring their work to the agent.**

Sidekick should eventually become a context-aware agent that follows the user across their digital workspace.

For example:

**Gmail**
> "Reply to this email and suggest Thursday afternoon."

**Excel**
> "Create a pivot table showing sales by region."

**Calendar**
> "Move my 3 PM meeting to tomorrow."

**Browser**
> "Summarize this page and add the important deadlines to my calendar."

The hackathon MVP does **not** need to build all of these.

The MVP exists to prove the underlying concept.

---

## 4. Hackathon MVP

### MVP Objective

Build a browser-based AI assistant capable of:

1. Reading the current webpage context
2. Understanding a natural-language request
3. Selecting an appropriate tool/action
4. Generating the required parameters
5. Asking for user confirmation
6. Executing the action

### Primary MVP Workflow

**Email → Calendar**

Example:

> User: "Add this meeting to my calendar."

Sidekick:

> I found a meeting in this email.

**Project Kickoff Meeting**  
Tuesday, September 15  
10:00 AM  
Meeting Room B

**[Add to Calendar]**

User clicks confirmation.

Sidekick executes the action.

---

## 5. Target User

### Primary User

People who frequently work across browser-based productivity tools and perform repetitive administrative tasks.

Examples:

- Students
- Developers
- Knowledge workers
- Project managers
- Researchers
- Office workers

### Hackathon Persona

**Drew, a university student / intern**

Drew receives emails containing meetings, deadlines, events, and tasks.

Instead of manually transferring information between email and calendar, Drew can simply tell Sidekick what to do.

---

## 6. User Stories

### Core User Story

> As a user, I want to ask an AI agent to perform an action based on the webpage I'm currently viewing so that I don't need to manually copy context between applications.

### Supporting Stories

> As a user, I want to see what information the agent extracted before it performs an action.

> As a user, I want to approve an action before Sidekick makes a change.

> As a user, I want to interact with Sidekick using natural language rather than learning commands.

> As a user, I want the agent to understand the page I'm currently looking at without requiring me to paste its contents manually.

---

## 7. User Experience

### Entry Point

Sidekick appears as a browser side panel.

```text
┌─────────────────────────────────────────────┬───────────────┐
│                                             │   SIDEKICK    │
│              Current webpage                │               │
│                                             │  Hi! I can    │
│              Email content                  │  help with    │
│                                             │  this page.   │
│                                             │               │
│                                             │  ───────────  │
│                                             │               │
│                                             │  > Add this   │
│                                             │    to my      │
│                                             │    calendar   │
│                                             │               │
│                                             │  Thinking...  │
│                                             │               │
└─────────────────────────────────────────────┴───────────────┘
```

### Interaction Flow

#### Step 1: User opens a webpage

Sidekick becomes available in the browser.

#### Step 2: User gives instruction

Example:

> "Add this meeting to my calendar."

#### Step 3: Sidekick receives context

```text
USER REQUEST
"Add this meeting to my calendar."

+

PAGE CONTEXT
"The project kickoff meeting will be held Tuesday
at 10 AM in Meeting Room B..."
```

#### Step 4: Agent interprets request

The AI determines that a calendar action is required.

#### Step 5: Tool invocation

The model produces structured parameters:

```json
{
  "title": "Project Kickoff Meeting",
  "date": "2026-09-15",
  "time": "10:00",
  "location": "Meeting Room B"
}
```

#### Step 6: Confirmation

Sidekick displays:

> **Create calendar event?**

**Project Kickoff Meeting**  
September 15, 2026  
10:00 AM  
Meeting Room B

**[Confirm] [Cancel]**

#### Step 7: Action

The application creates the event.

#### Step 8: Completion

> ✅ Added "Project Kickoff Meeting" to your calendar.

---

## 8. Functional Requirements

### FR1: Context Capture

The system shall be capable of obtaining relevant text from the currently active webpage.

#### MVP Implementation

Use browser extension content scripts to access webpage content.

The initial prototype may use:

```javascript
document.body.innerText
```

and progressively filter the result to relevant content.

---

### FR2: Natural Language Input

The user shall be able to provide commands through a text input.

Example:

> "Add this meeting to my calendar."

#### Optional

Voice input may be implemented if the core workflow is already stable.

**Priority:** P2

---

### FR3: Agent Reasoning

The system shall send the user's request and page context to an OpenAI model.

The model determines which action, if any, should be performed.

---

### FR4: Tool Calling

The agent shall have access to predefined tools.

#### MVP Tool

```text
create_calendar_event()
```

Potential tool schema:

```json
{
  "name": "create_calendar_event",
  "description": "Create a calendar event based on extracted information.",
  "parameters": {
    "title": "string",
    "date": "string",
    "time": "string",
    "location": "string"
  }
}
```

---

### FR5: Human Confirmation

The agent shall not automatically perform potentially consequential actions without user confirmation.

The user must explicitly approve calendar creation.

---

### FR6: Action Execution

Upon confirmation, Sidekick shall execute the calendar action.

#### Preferred Implementation

Google Calendar API.

#### Fallback Implementation

A simulated/local calendar event creation flow.

The demo must clearly distinguish a simulation from a real calendar integration.

---

### FR7: Result Feedback

Sidekick shall inform the user whether the action succeeded or failed.

Example:

> ✅ Event created successfully.

or:

> ⚠️ I couldn't create the event. Please try again.

---

## 9. Non-Goals

These are deliberately **out of scope for the four-hour MVP**.

- A full autonomous computer-use agent
- Universal support for every website
- Full Excel automation
- Full Gmail automation
- Multi-agent orchestration
- Long-term memory
- Complex planning
- Autonomous clicking across arbitrary websites
- Full voice assistant
- Mobile application
- Desktop application
- Enterprise authentication
- Production-grade security infrastructure

The product vision is "one agent that can operate everywhere."

The hackathon project only needs to demonstrate:

> **"The agent can use the environment's context to perform a meaningful task."**

---

## 10. Technical Architecture

```text
                    ┌──────────────────┐
                    │      User        │
                    │ "Add this to     │
                    │  my calendar"    │
                    └────────┬─────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │ Browser Side     │
                   │ Panel            │
                   └────────┬─────────┘
                            │
                 Page Context + Request
                            │
                            ▼
                   ┌──────────────────┐
                   │ Backend / Agent  │
                   │ Orchestrator     │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ OpenAI Model     │
                   │                  │
                   │ Understands      │
                   │ request +        │
                   │ chooses tool     │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ Tool Layer       │
                   │                  │
                   │ create_calendar  │
                   │ _event()         │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ Calendar API     │
                   └──────────────────┘
```

---

## 11. Proposed Tech Stack

Keep the implementation simple. Do not add an agent framework unless it materially reduces implementation time.

### Frontend

**Chrome Extension**

- HTML/CSS/JavaScript or React
- Browser Side Panel
- Content Script

### Agent

**OpenAI API**

Use tool/function calling rather than introducing LangChain or LangGraph unless needed.

### Backend

**Node.js**

Simple API server.

### Integration

**Google Calendar API**

### Optional Infrastructure

**Google Cloud Run**

Could be used to deploy the backend, particularly because Google Cloud Run is one of the event sponsors.

### Optional UI

**CopilotKit**

Potentially useful for the agent interface, but should not be forced into the architecture if it slows development.

---

## 12. Why We Do Not Need LangGraph

The MVP workflow is essentially:

```text
Receive context
       ↓
Understand request
       ↓
Call tool
       ↓
Ask confirmation
       ↓
Execute
```

This is one straightforward agent loop.

LangGraph becomes more valuable when the workflow includes multiple states, branches, retries, or coordinated agents.

For example:

```text
Request
   ↓
Research
   ↓
Search multiple sources
   ↓
Evaluate results
   ↓
Ask another agent
   ↓
Perform actions
   ↓
Check result
   ↓
Retry
   ↓
Ask user
```

That complexity is not required for the hackathon MVP.

---

## 13. Sponsor Integration Strategy

Do not force every sponsor into the project.

### Core

**OpenAI**
- Core reasoning and tool calling.

### Potential

**CopilotKit**
- Agent UI / interaction layer.

**Auth0**
- Authentication if needed.

**Google Cloud Run**
- Backend deployment.

### Optional

**OpenRouter**
- Model routing / additional models.

**Exa**
- Web search capabilities.

**Trigger.dev**
- Background jobs and workflows.

Use sponsor resources only where they genuinely improve the prototype.

---

## 14. Hackathon Priorities

### P0: Must Work

- Browser side panel
- Context extraction
- Natural-language command
- OpenAI model call
- One tool
- Confirmation UI
- Successful end-to-end demo

### P1: Nice to Have

- Real Google Calendar integration
- Better context extraction
- Streaming responses
- Multiple tools
- Error handling

### P2: Only If Everything Works

- Voice input
- Multiple websites
- Gmail-specific extraction
- Authentication
- Deployment
- Beautiful animations
- Additional sponsor integrations

---

## 15. Four-Hour Implementation Plan

| Time | Objective |
|---|---|
| 0:00–0:20 | Repository + extension skeleton |
| 0:20–0:50 | Side panel UI |
| 0:50–1:20 | Read webpage context |
| 1:20–2:00 | Connect OpenAI + tool calling |
| 2:00–2:40 | Build calendar action |
| 2:40–3:10 | Confirmation + error handling |
| 3:10–3:30 | Polish demo |
| 3:30–4:00 | Video + GitHub + submission |

### Hard Rule

At the two-hour mark, you should already have:

> **Page → Agent → Structured Action**

working.

If you do not, stop adding features and focus entirely on the core path.

---

## 16. Success Criteria

The MVP is successful if a judge can watch the following without additional explanation:

1. Open a webpage containing an event.
2. Open Sidekick.
3. Say:
   > "Add this meeting to my calendar."
4. Sidekick understands the page.
5. Sidekick extracts the event.
6. Sidekick shows a structured preview.
7. User approves.
8. Calendar event is created.
9. Sidekick confirms completion.

### The "Aha" Moment

The user **never copies the email into an AI chatbot**.

That is the core product value.

---

## 17. Future Vision

### Sidekick 1.0: Browser

- Summarize page
- Extract tasks
- Extract deadlines
- Create calendar events

### Sidekick 2.0: Email

- Draft replies
- Categorize messages
- Create tasks
- Schedule meetings

### Sidekick 3.0: Productivity Apps

- Excel
- Google Docs
- Notion
- Slack
- Teams
- Jira

### Sidekick 4.0: Cross-Environment Agent

```text
                    SIDEKICK
                       │
          ┌────────────┼─────────────┐
          ↓            ↓             ↓
       Browser       Email        Calendar
          │            │             │
          ↓            ↓             ↓
       Excel          Slack         Docs
```

Eventually, the user should not have to care which application an action belongs to.

They tell Sidekick **what they want**, and Sidekick figures out **where and how to do it**.

---

## 18. One-Sentence Pitch

> **Sidekick is an AI agent that lives where you work, understands the context around you, and takes action without making you leave your workflow.**

## 19. 30-Second Pitch

> Today, using AI often means leaving whatever we're doing, copying our context into a chatbot, getting an answer, and then manually carrying out the result. Sidekick flips that workflow. It lives inside your browser, understands the page you're already looking at, and can take action based on that context. In our prototype, you can open an email, tell Sidekick "add this meeting to my calendar," and it extracts the meeting details, asks for confirmation, and creates the event. The long-term vision is an agent that works across the tools we already use every day.
