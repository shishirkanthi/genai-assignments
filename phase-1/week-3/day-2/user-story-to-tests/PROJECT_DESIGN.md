# Project Design: User Story to Tests

## Overview
This project auto-generates QA test cases from user story details using an LLM. It is split into a React frontend and an Express backend that validates inputs, constructs prompts, calls the LLM, and returns structured test cases.

## High-Level Architecture
- **Frontend (React + Vite)**: Captures user story data and displays generated test cases.
- **Backend (Express + TypeScript)**: Validates requests, builds prompts, calls Groq LLM, and returns JSON results.

## Frontend Design
**Location**: `frontend/`

### Core UI Flow
1. User enters **Story Title**, **Description**, **Acceptance Criteria**, and **Additional Info**.
2. User clicks **Generate**.
3. UI calls the backend API and renders a table of test cases.
4. Each test case row is expandable to show step details.

### JIRA Connection UI (UI-only)
- A **Connect to JIRA** button opens a modal.
- Modal fields:
  - JIRA Base URL
  - JIRA API key
  - JIRA email id
- Modal provides **Test Connection** and **Disconnect** actions.
- Test Connection shows a green checkmark on success or a red cross on failure.
- On failure, a user-friendly popup is shown with a generic error message.

### Key Files
- `frontend/src/App.tsx` – Main UI, form, results table, JIRA modal.
- `frontend/src/api.ts` – API client for `/generate-tests`.
- `frontend/src/types.ts` – Shared TypeScript types.

## Backend Design
**Location**: `backend/`

### API Endpoints
- `GET /api/health` – Health check.
- `POST /api/generate-tests` – Generate test cases from user story data.
- `POST /api/jira/connect` – Store complete JIRA credentials in session.
- `POST /api/jira/test` – Validate session-stored credentials with JIRA `/myself`.
- `POST /api/jira/disconnect` – Clear session-stored JIRA credentials.

### Request Validation
Uses `zod` schemas to validate incoming payloads:
- Required: `storyTitle`, `acceptanceCriteria`
- Optional: `description`, `additionalInfo`

### Prompt Construction
The backend composes a system prompt and user prompt that instruct the LLM to return JSON only, matching the schema:
- Each test case includes id, title, steps, expected result, and category.

### LLM Integration
- Uses Groq chat completions.
- Parses response as JSON.
- Validates response with `zod` before returning to client.

### JIRA Session Handling
- Credentials are stored in **in-memory session** for the active browser session only.
- Existing session credentials are reused until updated via Connect.
- Disconnect clears session credentials; local UI values remain unchanged.
- JIRA test calls only use session credentials (no credentials in test payload).

### Key Files
- `backend/src/server.ts` – Express app setup.
- `backend/src/routes/generate.ts` – Test generation route.
- `backend/src/prompt.ts` – Prompt templates.
- `backend/src/schemas.ts` – Zod schemas and types.
- `backend/src/llm/groqClient.ts` – Groq API client.

## Data Flow Summary
1. **Frontend** collects user story inputs.
2. **Frontend** sends `POST /api/generate-tests`.
3. **Backend** validates input, builds prompt.
4. **Backend** calls Groq LLM.
5. **Backend** validates LLM JSON response.
6. **Frontend** renders results and expandable steps.

### JIRA Connection Flow
1. **User** opens **Connect to JIRA** and enters credentials.
2. **Frontend** calls `POST /api/jira/connect` to save session credentials.
3. **User** clicks **Test Connection**.
4. **Frontend** calls `POST /api/jira/test` (session-only).
5. **Backend** calls JIRA `/myself` and returns `ok: true/false`.
6. **Frontend** shows a green checkmark on success or a red cross + popup on failure.

## Configuration
Environment variables are loaded from `.env` at the repository root and used by the backend for:
- `PORT`
- `CORS_ORIGIN`
- `groq_API_BASE`
- `groq_API_KEY`
- `groq_MODEL`

The frontend reads `VITE_API_BASE_URL` to target the backend API.

## JSON Response Shape
The backend returns a JSON payload with test cases and optional metadata:
- `cases[]` list of test cases
- `model` (optional)
- `promptTokens`, `completionTokens`

## Current Limitations
- JIRA credentials are stored in in-memory session only (not persisted across restarts).
- No authentication layer.
- LLM failures are surfaced as 502 errors.

## Future Enhancements (Optional)
- Persist JIRA credentials securely via backend.
- Export test cases to CSV/JSON from the UI.
- Add validation and inline field errors for the JIRA modal.
- Add pagination or filters for large test case sets.
