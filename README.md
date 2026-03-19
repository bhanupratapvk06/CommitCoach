# Commit Coach

**AI-Powered GitHub Streak Maintenance & Code Improvement Platform**

[![Version](https://img.shields.io/badge/version-2.0.0--beta-blue)](https://github.com/your-org/commit-coach)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/status-active%20development-brightgreen)](https://github.com/your-org/commit-coach)

---

## Overview

Commit Coach is a SaaS platform that helps developers maintain consistent GitHub contribution streaks by combining real-time repository analysis, AI-generated code suggestions, an in-browser code editor with one-click merge, and intelligent scheduled reminders.

The platform solves the single biggest obstacle to streak maintenance — not knowing what to commit — by analysing the repositories a user selects and proposing meaningful, context-aware improvements they can apply in minutes. Users choose between receiving step-by-step instructions or a ready-to-merge code patch. In the latter case, the patch is displayed in a Monaco editor directly on the platform, where it can be reviewed, edited, and committed to GitHub without leaving the browser.

---

## Table of Contents

1. [Features](#features)
2. [System Architecture](#system-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [AI Suggestion Engine](#ai-suggestion-engine)
5. [In-Browser Editor & Auto-Merge](#in-browser-editor--auto-merge)
6. [Reminder & Scheduling System](#reminder--scheduling-system)
7. [REST API Reference](#rest-api-reference)
8. [Quick Start](#quick-start)
9. [Monetisation](#monetisation)
10. [Deployment](#deployment)
11. [Roadmap](#roadmap)
12. [Contributing](#contributing)

---

## Features

| Feature | Free Tier | Pro / Team |
|---|---|---|
| Watched repositories | Up to 2 | Up to 10 |
| AI suggestions per day | 3 (rule-based) | Unlimited (Claude API) |
| Suggestion mode | Instructions only | Instructions + ready-to-merge code |
| In-browser code editor | View only | Full Monaco editor + merge |
| Auto-merge to GitHub | — | One-click via GitHub Contents API |
| Scheduled reminders | Browser notification | Email, Slack, Discord, WhatsApp |
| Reminder window | Fixed 8 PM check | Custom window via node-cron |
| Contribution heatmap | 30-day view | Full-year calendar |
| Streak analytics | Current streak only | Historical graphs + milestones |
| Team dashboard | — | Multi-member leaderboard |
| Price | Free forever | $9/mo individual · $29/mo team |

---

## System Architecture

Commit Coach follows a clean separation between a Vite + React frontend and a Node.js/Express backend. All AI inference is routed through the Anthropic Claude API on the backend so that no API keys are ever exposed to the client.

```
commit-coach/
├── frontend/                         # Vite + React SPA
├── backend/                          # Node.js + Express API
├── .env.example
└── README.md
```

### Backend Structure

```
backend/
├── server.js                         # Express entry point
├── routes/
│   ├── repos.js                      # GitHub repository + commit endpoints
│   ├── suggestions.js                # Claude AI suggestion generation
│   ├── merge.js                      # GitHub Contents API auto-merge
│   └── notify.js                     # Reminder scheduling + delivery
├── services/
│   ├── githubClient.js               # Octokit wrapper
│   ├── claudeClient.js               # Anthropic SDK wrapper
│   ├── scheduler.js                  # node-cron job registry per user
│   └── notifier.js                   # Email / Slack / Discord adapters
├── middleware/
│   ├── auth.js                       # JWT verification + GitHub OAuth
│   └── rateLimit.js                  # Per-user request throttling
└── package.json
```

### Data Flow

1. The user authenticates via GitHub OAuth 2.0; the backend issues a signed JWT stored in `localStorage`.
2. The user selects up to 10 repositories from their GitHub account list, fetched via Octokit.
3. The backend polls the GitHub Commits API to determine today's contribution status per watched repository.
4. If no commit is detected before the user's configured reminder window, `node-cron` triggers the notification pipeline.
5. On demand — or automatically before the reminder fires — the suggestion engine calls the Claude API with the repository's recent file tree, commit history, and detected tech stack.
6. Claude returns a structured JSON object: `{ mode, title, instructions, filePath, patch }`.
7. If `mode` is `"code"`, the frontend loads the Monaco editor pre-populated with the AI-suggested diff; the user reviews and optionally edits the patch.
8. On merge confirmation, the backend calls the GitHub Contents API (`PUT /repos/:owner/:repo/contents/:path`) to commit the file, satisfying the day's streak.

---

## Frontend Architecture

The frontend is a Vite + React application organised into a modular folder structure. No application logic lives in `index.html`, which serves only as the Vite shell. Each layer has a single, clearly defined responsibility.

```
frontend/
├── index.html                        # Vite entry point — shell only, no app logic
├── vite.config.js
├── package.json
├── .env.example
│
└── src/
    ├── main.jsx                      # ReactDOM.createRoot, global providers
    ├── App.jsx                       # Route definitions (React Router)
    │
    ├── pages/                        # One file per route, composition only
    │   ├── LoginPage.jsx             # GitHub OAuth landing
    │   ├── DashboardPage.jsx         # Main streak + repo overview
    │   ├── RepoSelectPage.jsx        # Repository picker (up to 10)
    │   ├── SuggestionPage.jsx        # View suggestion + choose mode
    │   ├── EditorPage.jsx            # Monaco editor + merge flow
    │   ├── SettingsPage.jsx          # Reminder window, notifications, billing
    │   └── NotFoundPage.jsx
    │
    ├── components/                   # Reusable UI, grouped by domain
    │   ├── ui/                       # Primitive, domain-agnostic components
    │   │   ├── Button.jsx
    │   │   ├── Badge.jsx
    │   │   ├── Card.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Tooltip.jsx
    │   │   ├── Spinner.jsx
    │   │   └── Toast.jsx
    │   │
    │   ├── layout/                   # Shell, navigation, page wrappers
    │   │   ├── AppShell.jsx          # Sidebar + topbar + main content area
    │   │   ├── Sidebar.jsx
    │   │   ├── Topbar.jsx
    │   │   └── ProtectedRoute.jsx    # Redirects unauthenticated users
    │   │
    │   ├── dashboard/                # Streak and repository widgets
    │   │   ├── StreakCounter.jsx
    │   │   ├── ContributionHeatmap.jsx
    │   │   ├── RepoCard.jsx
    │   │   └── TeamLeaderboard.jsx
    │   │
    │   ├── suggestions/              # AI suggestion display + mode selector
    │   │   ├── SuggestionCard.jsx
    │   │   ├── ModeSelector.jsx      # Instructions vs Code toggle
    │   │   ├── InstructionsList.jsx
    │   │   └── DiffPreview.jsx       # Read-only patch viewer (Free tier)
    │   │
    │   ├── editor/                   # Monaco wrapper + merge controls
    │   │   ├── CodeEditor.jsx        # Monaco instance, theming, diff mode
    │   │   ├── MergeToolbar.jsx      # Confirm / cancel merge actions
    │   │   └── FileBreadcrumb.jsx
    │   │
    │   └── reminders/                # Notification settings widgets
    │       ├── ReminderTimePicker.jsx
    │       ├── ChannelToggleList.jsx  # Email, Slack, Discord, WhatsApp
    │       └── TestNotificationBtn.jsx
    │
    ├── contexts/                     # Global state via Context + useReducer
    │   ├── AuthContext.jsx           # JWT, GitHub user object, login / logout
    │   ├── RepoContext.jsx           # Watched repos, commit status per repo
    │   ├── SuggestionContext.jsx     # Active suggestion, generation state
    │   ├── StreakContext.jsx          # Current + historical streak data
    │   └── ThemeContext.jsx          # Active theme, toggle handler
    │
    ├── hooks/                        # Custom hooks — consume contexts, call lib
    │   ├── useAuth.js
    │   ├── useRepos.js
    │   ├── useSuggestion.js
    │   ├── useStreak.js
    │   ├── useNotifications.js       # Web Push subscription management
    │   └── useMerge.js               # Merge flow state machine
    │
    ├── lib/                          # Third-party integrations and API client
    │   ├── apiClient.js              # Axios instance, base URL, JWT interceptor
    │   ├── githubApi.js              # fetchRepos, fetchStatus, merge
    │   ├── claudeApi.js              # generateSuggestion, fetchSuggestion
    │   ├── stripeClient.js           # Redirect to Stripe checkout / billing portal
    │   └── pushSubscription.js       # VAPID Web Push subscribe / unsubscribe
    │
    ├── utils/                        # Pure functions — no React, no API imports
    │   ├── dateHelpers.js            # formatRelativeDate, isToday, streakDayList
    │   ├── patchParser.js            # Parse unified diff into hunk objects
    │   ├── techStackDetector.js      # Infer stack label from file tree
    │   ├── commitMessageBuilder.js   # Build conventional commit string
    │   └── validators.js             # Form validation schemas (zod)
    │
    └── styles/                       # Global CSS and design tokens
        ├── tokens.css                # CSS custom properties: colors, spacing, radii
        ├── global.css                # Reset, typography, body defaults
        ├── themes/
        │   ├── metal.css             # Dark chrome + cyan (default)
        │   ├── glass.css             # Frosted glass + blue
        │   └── neon.css              # Cyberpunk magenta / cyan
        └── animations.css            # Keyframes, transition utilities
```

### Layer Responsibilities

**`pages/`** contains one file per route with no business logic. Each page composes components and calls hooks; it never calls the API directly or manages complex state.

**`components/`** are grouped by domain rather than type. Primitive, reusable elements live in `ui/`; everything else is co-located with the feature it belongs to. This prevents components from becoming a catch-all dumping ground as the codebase grows.

**`contexts/`** manages only global, cross-cutting state — authentication, theme, and streak data that multiple unrelated pages need simultaneously. Local UI state stays inside components with `useState`.

**`hooks/`** sits between contexts and components. Custom hooks consume context values and call `lib/` functions, keeping components entirely free of API knowledge and making behaviour straightforward to test in isolation.

**`lib/`** is strictly for third-party integrations. `apiClient.js` configures the Axios instance once — base URL, JWT header injection, and 401 redirect handling. Every other lib file imports from it, so changing the API base URL or rotating the token mechanism is a single-file change.

**`utils/`** contains only pure functions with zero imports from React or the API layer. This makes them trivially testable and freely reusable across the codebase.

The `components/editor/` group wraps Monaco rather than importing it inline inside a page. This means the heavy Monaco bundle is loaded only when `CodeEditor.jsx` is rendered, which pairs naturally with `React.lazy()` on `EditorPage.jsx` for automatic code splitting.

---

## AI Suggestion Engine

The suggestion engine is the core differentiator of Commit Coach. It uses `claude-sonnet-4-20250514` to analyse the selected repository and produce high-quality, contextually relevant suggestions that constitute real improvements rather than trivial placeholder commits.

### Suggestion Modes

**Instructions Mode** — Claude returns a numbered task list describing exactly what the developer should implement: which files to edit, what logic to add, and what tests to write. The developer applies the changes themselves.

**Code Mode** — Claude returns a ready-to-apply unified diff. The patch is displayed in the Monaco editor where the user can review, edit individual hunks, and trigger auto-merge with a single button click.

### Prompt Construction

The system prompt passed to Claude is constructed fresh for each request and includes: the repository name, description, primary language, and detected tech stack; the last 10 commit messages with timestamps; the file tree filtered to exclude `node_modules`, `.git`, and `dist`; the contents of up to 5 recently modified files (truncated to 300 lines each); and open issue and PR titles when the token has `issues:read` scope. Claude is instructed that every suggestion must be scoped to a change completable in under 30 minutes.

### Output Schema

Claude is prompted to return a strict JSON object so the frontend can render it deterministically:

```json
{
  "title": "Add input validation to the login form",
  "mode": "code",
  "difficulty": "easy",
  "estimatedMinutes": 15,
  "filePath": "src/components/LoginForm.jsx",
  "instructions": [
    "1. Open src/components/LoginForm.jsx",
    "2. Import zod for schema validation",
    "3. Define a loginSchema with email and password rules",
    "4. Wrap the submit handler with schema.parse()"
  ],
  "patch": "--- a/src/components/LoginForm.jsx\n+++ b/..."
}
```

---

## In-Browser Editor & Auto-Merge

When a suggestion is delivered in Code mode, the platform opens a Monaco Editor (the same engine powering VS Code) in a split-panel view alongside the suggestion card. The editor is pre-populated with the target file's current content fetched from GitHub, with the AI-suggested patch applied and highlighted as a diff overlay.

The editor supports full syntax highlighting for all major languages, a diff view toggle for side-by-side comparison, and inline editing so the user can accept, reject, or modify individual hunks before committing. The Free tier displays the editor in read-only mode; users must copy and apply the patch manually.

**Auto-merge flow:** the user clicks *Merge to Repository*; the frontend sends the final file content to `POST /api/v1/merge`; the backend base64-encodes the content and calls the GitHub Contents API with a commit message of the form `feat: <suggestion title> [via Commit Coach]`; GitHub returns the new commit SHA; and the dashboard streak counter increments in real time. The commit message format is a valid conventional commit and attributes the assist to the platform, supporting organic growth.

---

## Reminder & Scheduling System

During onboarding, each user configures a daily reminder window — for example, *remind me between 19:00 and 21:00 if I have not committed today*. The backend scheduler registers a per-user `node-cron` job that fires at the start of that window, checks GitHub activity via the Commits API, and triggers the notification pipeline if no commit is found.

Jobs are stored in memory during development and in a Redis-backed Bull queue in production. On server restart, all active schedules are rehydrated from the database, ensuring reminders survive deployments.

```js
// Register a reminder at 19:30 for a given user
scheduler.register(userId, { hour: 19, minute: 30 }, async () => {
  const committed = await githubClient.hasCommittedToday(user.login, repos);
  if (!committed) {
    const suggestion = await suggestionEngine.generate(user);
    notifier.send(user, suggestion);
  }
});
```

Supported notification channels are: **Browser Push** (Web Push API with VAPID keys, works when the tab is closed), **Email** (Nodemailer + SendGrid with a suggestion preview embedded in the template), **Slack** (Incoming Webhook with a Block Kit card), **Discord** (Webhook POST with an embed), and **WhatsApp** on the Pro tier via Twilio's WhatsApp Business API.

---

## REST API Reference

All endpoints are prefixed with `/api/v1`. Authenticated routes require an `Authorization: Bearer <jwt>` header.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/auth/github` | Initiate GitHub OAuth 2.0 flow | Public |
| `GET` | `/auth/callback` | OAuth callback — issues JWT | Public |
| `GET` | `/repos` | List authenticated user's GitHub repos | JWT |
| `POST` | `/repos/select` | Set the user's watched repo list (max 10) | JWT |
| `GET` | `/repos/:id/status` | Today's commit status for a repo | JWT |
| `GET` | `/repos/:id/heatmap` | 30 or 365-day contribution heatmap data | JWT |
| `POST` | `/suggestions/generate` | Trigger an AI suggestion for a repo | JWT |
| `GET` | `/suggestions/:id` | Retrieve a previously generated suggestion | JWT |
| `POST` | `/merge` | Apply patch and commit via GitHub Contents API | JWT |
| `GET` | `/streak` | Current + historical streak data | JWT |
| `PUT` | `/settings/reminder` | Update reminder window and channels | JWT |
| `DELETE` | `/settings/reminder` | Cancel all scheduled reminders for the user | JWT |
| `POST` | `/notify/test` | Send a test notification to configured channels | JWT |

---

## Quick Start

### Prerequisites

- Node.js 20 LTS or later
- Redis 7+ (required for production scheduler; optional in development)
- A GitHub OAuth App (GitHub Settings → Developer Settings → OAuth Apps)
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- Optional: SendGrid API key, Slack Webhook URL, Twilio credentials

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/commit-coach.git
cd commit-coach

# 2. Backend setup
cd backend
cp .env.example .env        # Populate all required values
npm install
npm run dev                 # Runs on http://localhost:3002

# 3. Frontend setup
cd ../frontend
cp .env.example .env        # Set VITE_API_BASE_URL=http://localhost:3002
npm install
npm run dev                 # Runs on http://localhost:5173
```

Open `http://localhost:5173` and complete the GitHub OAuth sign-in to begin.

### Environment Variables

**Backend (`backend/.env`)**

```env
# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3002/api/v1/auth/callback

# Anthropic
ANTHROPIC_API_KEY=

# Security
JWT_SECRET=                       # 32+ random characters

# Notifications (all optional)
SENDGRID_API_KEY=
SLACK_WEBHOOK_URL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

# Redis (required for production scheduler)
REDIS_URL=redis://localhost:6379
```

**Frontend (`frontend/.env`)**

```env
VITE_API_BASE_URL=http://localhost:3002
VITE_VAPID_PUBLIC_KEY=            # Generate with: npx web-push generate-vapid-keys
VITE_STRIPE_PUBLISHABLE_KEY=
```

---

## Monetisation

Commit Coach is designed around a freemium SaaS model with three tiers. The free tier is genuinely useful and serves as the primary acquisition channel; conversion to paid is driven by the value of unlimited Claude-powered suggestions and the auto-merge workflow.

**Free** provides 2 watched repositories, 3 rule-based suggestions per day, browser notifications, a 30-day heatmap, and JSON export. Users who opt in to displaying a *Powered by Commit Coach* badge on their GitHub profile README earn one bonus suggestion per day.

**Pro ($9/month)** unlocks 10 repositories, unlimited Claude-powered suggestions, both suggestion modes with Monaco editor and auto-merge, all notification channels, the full-year contribution heatmap, and historical streak graphs. The target user is an active individual developer who commits daily and needs a workflow safety net.

**Team ($29/month per workspace, up to 10 seats)** adds a shared team dashboard with a streak leaderboard, weekly manager digest email, org-level repository monitoring, SAML SSO, and priority support. The target buyer is an engineering manager at a startup that treats GitHub contribution consistency as a team health metric.

Additional revenue streams include an API access tier ($49/month) for teams integrating suggestions into CI/CD pipelines or Slack bots, marketplace partnerships with developer tool vendors, and white-label licensing for coding bootcamps and developer advocacy programmes.

---

## Deployment

The recommended production stack minimises cost while providing the reliability required for time-sensitive reminders.

- **Frontend** — Deploy the `frontend/` directory to [Vercel](https://vercel.com) or [Cloudflare Pages](https://pages.cloudflare.com). Vite produces a fully static build (`npm run build`) that requires zero server configuration.
- **Backend API** — Deploy to [Railway](https://railway.app) or [Render](https://render.com) as a Node.js service. Set all environment variables via the platform's secret manager.
- **Redis** — Use Railway's managed Redis add-on or [Upstash](https://upstash.com) (serverless Redis, pay-per-request, generous free tier).
- **Monitoring** — Integrate [Sentry](https://sentry.io) for error tracking and [BetterStack](https://betterstack.com) for uptime alerting on the `/health` endpoint.

> **Important:** `node-cron` fires reliably only on long-running server processes. Ensure the backend service is configured to never sleep on inactivity — use Railway's Always-On setting or Render's paid tier.

---

## Roadmap

### v2.0 — Current Sprint
- GitHub OAuth 2.0 authentication replacing token-based auth
- Vite + React modular frontend with full component/context/hooks architecture
- Monaco editor integration with diff view and auto-merge
- Claude API integration for both suggestion modes
- Per-user node-cron scheduler with Redis persistence
- Stripe subscription billing (Free / Pro / Team)

### v2.1
- Full-year GitHub contribution calendar view
- Slack and Discord notification channels
- Team workspace and streak leaderboard dashboard
- Weekly digest email for team managers

### v2.2
- Mobile PWA with push notifications (iOS & Android)
- Public shareable profile page with streak badges
- GitLab and Bitbucket support alongside GitHub
- Webhook-driven real-time commit detection replacing polling

### v3.0 — Vision
- Voice assistant integration for daily commit briefings
- AI-generated PR descriptions and release notes
- Gamification layer: achievement badges, milestones, community challenges
- Enterprise tier with SSO, audit logs, and SLA-backed uptime

---

## Contributing

Contributions are welcome. Please open an issue before submitting a pull request for any change beyond a minor bug fix, so that the approach can be agreed upon before implementation effort is invested.

```bash
# Fork the repository, then:
git checkout -b feat/your-feature
npm test                            # Ensure all tests pass
# Submit a pull request referencing the relevant issue
```

Code style is enforced by ESLint and Prettier (`npm run lint`). All commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) format.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Monaco Editor |
| Styling | CSS custom properties, scoped theme files |
| State | React Context + useReducer, custom hooks |
| HTTP Client | Axios with JWT interceptor |
| Backend | Node.js 20, Express |
| GitHub Integration | Octokit (REST) |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Scheduler | node-cron + Bull + Redis |
| Auth | GitHub OAuth 2.0 + JWT |
| Notifications | Web Push (VAPID), SendGrid, Twilio |
| Payments | Stripe Subscriptions |
| Deployment | Vercel (frontend) · Railway (backend) |

---

*Built with ❤️ and Claude Code · MIT License · [commit-coach.dev](https://commit-coach.dev)*