# Product Requirements Document (PRD) — LastMinPrep

> Version: 1.0 | Last Updated: 2026-07-27 | Status: Active Development

---

## 1. Executive Summary

LastMinPrep is a **community-driven interview preparation platform** for developers. It helps users crack tech interviews faster through:
- Curated interview questions organized by tech stack
- Community posting, voting, and discussion threads
- Daily streaks, progress tracking, and leaderboards
- A job board with curated listings
- (Future) AI-powered personalized coaching from resume upload

The app is built as an **Angular 17 SPA** with Capacitor for iOS/Android mobile wrappers, and deployed to Vercel for the web.

---

## 2. Goals & Success Metrics

### 2.1 Business / Product Goals
| # | Goal | How We Measure |
|---|------|----------------|
| G1 | Help users prepare faster with high-quality content | % of users who view ≥3 questions per session |
| G2 | Build an active contributing community | Questions posted / votes cast / comments per active user |
| G3 | Retain users with habit-forming loops | Day-1 return rate (target: 30%), Day-7 return rate (target: 15%) |
| G4 | Deliver a polished, fast cross-device experience | LCP < 2.5s on 4G, mobile usability score ≥ 90 |
| G5 | Ship a production-ready deployable web + mobile shell | Successful Vercel deploy, Capacitor build passes |

### 2.2 Success Metrics (Phase 1 Launch Targets)
- **Activation**: ≥ 60% of signed-up users reach the Dashboard
- **Engagement**: Avg 5+ page views / session, 2+ interactions (vote/save/comment)
- **Content volume**: 500+ seeded questions across 7 domains, 50+ jobs
- **AI Coach (Phase 2)**: 25% of active users start a coaching session

### 2.3 Non-Goals (Near Term)
- Full SSR / Angular Universal rollout (revisit if organic SEO demands it)
- Real-time WebSocket features (polling + manual refresh is sufficient initially)
- Complex admin dashboard (a simple backend CRUD panel is fine)
- Payment / monetization (free community product first)

---

## 3. Target Users & Personas

| Persona | Pain Points | What They Need |
|---------|-------------|----------------|
| **Fresh Graduate (Candidate)** | Doesn't know "what's actually asked" in interviews | Curated question lists by stack, streak system for daily practice |
| **Working Professional** | Short on time, targeting specific companies/roles | Focused tag-based filtering, saved questions, job board |
| **Community Contributor** | Wants to share knowledge, build reputation | Easy posting, voting, leaderboard, profile visibility |
| **Hiring Manager / Recruiter** | Wants to reach candidates | Job posting, job detail pages, apply links |

---

## 4. User Journeys (End-to-End Flows)

### J1 — Discover & Browse Questions
```
Home  →  Explore (pick domain/framework)  →  Feed  →  Question Detail
                                                        ↓
                                             Vote / Comment / Save
```

### J2 — Sign Up & Onboard
```
Home CTA  →  Signup (email/password or Google)  →  Dashboard (first run)
                                                     ↓
                                          Edit profile / Post question
```

### J3 — Returning User Session Restore
```
Open app  →  Local token detected  →  Silent GET /users/me  →  Dashboard (authed)
                                                        (or) Login if token expired
```

### J4 — Community Contribution
```
Dashboard / Feed  →  "Post Question" modal  →  Fill title + tags + hashtags  →  Submit
                                                                        ↓
                                                              Appears in feed
                                                              +1 questionsPosted on profile
```

### J5 — Browse & Save Jobs
```
Jobs listing  →  Job Detail  →  Save job (bookmark) / Open apply URL externally
```

### J6 — AI Coach Practice (Phase 2)
```
Dashboard → AI Coach entry → Upload resume PDF → Backend extracts stack/role
                                                         ↓
                                    Guided Q&A flow with personalized questions
                                                         ↓
                                    Answer feedback + progress saved to profile
```

---

## 5. Information Architecture

### 5.1 Route Map (Current)
| Path | Component | Guard | Access |
|------|-----------|-------|--------|
| `/` | HomeComponent | landingGuard | Public → redirects logged-in users to Dashboard |
| `/login` | LoginComponent | publicGuard | Guests only |
| `/signup` | SignupComponent | publicGuard | Guests only |
| `/auth/google/callback` | GoogleCallbackComponent | — | OAuth return URL |
| `/dashboard` | DashboardComponent | authGuard | Logged-in |
| `/feed` | FeedComponent | authGuard | Logged-in |
| `/explore` | ExploreComponent | — | Public (view) / Auth (actions) |
| `/questions/:id` | QuestionDetailComponent | authGuard | Logged-in |
| `/jobs` | JobsComponent | — | Public |
| `/jobs/:id` | JobDetailComponent | — | Public |
| `/profile` | ProfileComponent | authGuard | Own profile |
| `/user/:id` | UserProfileComponent | authGuard | Any user's profile |
| `/saved` | SavedComponent | authGuard | Logged-in |
| `/my-questions` | MyQuestionsComponent | authGuard | Logged-in |
| `/notifications` | NotificationsComponent | authGuard | Logged-in |
| `/leaderboard` | LeaderboardComponent | — | Public |
| `/search` | SearchComponent | — | Public |
| `/settings` | SettingsComponent | authGuard | Logged-in |
| `**` | — | — | Redirects to `/` |

### 5.2 Core Data Models (Frontend Types)
Defined in `src/app/core/models/index.ts`:
- **User** — id, name, email, avatar, designation, organisation, techStack, streak, answeredCount, questionsPosted, totalVotes, etc.
- **Question** — id, title, techTag, hashtags, votes, commentCount, author (partial User), thread (Comment[]), isSaved, isVoted
- **Comment** — id, author (partial User), text, replies (nested Comment[])
- **Job** — id, title, company, location, type (Remote/Hybrid/Onsite), experience, salary, techStack, description, applyUrl, postedBy, isSaved
- **Notification** — id, icon, text, time, isRead, link
- **LeaderboardEntry** — rank, user (partial), points, questionsCount
- **DomainConfig / Framework** — Browse taxonomy (Frontend, Backend, Mobile, DevOps, Data Science, AI, System Design)

---

## 6. Functional Requirements (FRs)

### 6.1 Authentication & Session
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-A1 | Email + password signup with user profile fields | P0 | Done |
| FR-A2 | Email + password login | P0 | Done |
| FR-A3 | Google OAuth login (redirect flow, separate endpoints for login vs signup) | P0 | Frontend done, backend TBD |
| FR-A4 | Google OAuth callback handler that reads query token, calls /users/me, establishes session | P0 | Done |
| FR-A5 | Session persistence across reloads (localStorage: token + user) | P0 | Done |
| FR-A6 | Auto session-restore on app boot via GET /users/me with Bearer token | P0 | Done |
| FR-A7 | Logout clears local session & redirects to Home | P0 | Done |
| FR-A8 | Account delete (calls DELETE /users/me fallback chain) | P1 | Done |
| FR-A9 | Auth guard redirects unauthed users to /login | P0 | Done |
| FR-A10 | Public guard redirects logged-in users away from login/signup | P0 | Done |
| FR-A11 | Landing guard redirects logged-in users from / to /dashboard | P1 | Done |
| FR-A12 | Auth interceptor adds Bearer token to all API requests | P0 | Done |

### 6.2 Question Content System
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-Q1 | List all questions, sorted newest-first | P0 | Done |
| FR-Q2 | Question detail page with author info, full thread | P0 | Done |
| FR-Q3 | Post new question (title + tech tag + hashtags) | P0 | Done |
| FR-Q4 | Edit question (title/tags/hashtags update) | P1 | Done |
| FR-Q5 | Delete question (author only) | P1 | Done |
| FR-Q6 | Upvote / toggle vote on a question, optimistic UI update | P0 | Done |
| FR-Q7 | Save / bookmark a question | P1 | Done |
| FR-Q8 | View saved questions list | P1 | Done |
| FR-Q9 | View "my questions" (authored by current user) | P1 | Done |
| FR-Q10 | Comment on a question | P0 | Done |
| FR-Q11 | Delete a comment (author only) | P1 | Done |
| FR-Q12 | Nested comment replies display | P1 | Model done, UI TBD |
| FR-Q13 | New-question count badge since last visit (localStorage tracked) | P2 | Done |
| FR-Q14 | Filter by tech tag / framework chips on feed | P1 | Partially (static chips in Dashboard) |
| FR-Q15 | Search questions by keyword (global search page) | P1 | Done |

### 6.3 Browse & Explore
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-E1 | Explore page with 7 domain cards (Frontend, Backend, Mobile, DevOps, Data Science, AI, System Design) | P0 | Done |
| FR-E2 | Click domain → expand framework list | P0 | Done |
| FR-E3 | Click framework → navigate to Feed with filter applied | P0 | Done |
| FR-E4 | Tech stack / framework icon CDN integration (simpleicons.org) | P2 | Done |
| FR-E5 | Home page hero + trending questions grid | P1 | Done |

### 6.4 Dashboard
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-D1 | Personalized greeting by time-of-day + user's first name | P1 | Done |
| FR-D2 | Stat tiles: questions posted, answered, streak days | P0 | Done |
| FR-D3 | Trending / latest chip filters (static list) | P2 | Done |
| FR-D4 | Latest jobs preview (top 3) | P1 | Done |
| FR-D5 | Quick action: post question modal open | P0 | Done |

### 6.5 Profile & User System
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-P1 | Own profile page with banner, avatar, designation, organisation, stats | P0 | Done |
| FR-P2 | Edit profile form (all User fields) | P0 | Done |
| FR-P3 | Avatar image upload endpoint (FormData POST) | P1 | Done (service, UI integration partial) |
| FR-P4 | Banner image upload endpoint | P1 | Done (service) |
| FR-P5 | View another user's public profile at /user/:id | P1 | Done |
| FR-P6 | User profile shows authored questions, stats, streak | P1 | Done |
| FR-P7 | Tech stack multi-select on signup + profile edit | P1 | Done (form model) |

### 6.6 Leaderboard & Streaks
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-L1 | Leaderboard page — top contributors by points | P1 | Done (UI, data from backend) |
| FR-L2 | Current user highlighted in leaderboard | P1 | Model done |
| FR-L3 | Daily streak counter in user profile, increments on activity | P1 | Model done, backend logic TBD |

### 6.7 Notifications
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-N1 | Notifications page with list (vote/comment/save events) | P1 | Done (UI scaffold) |
| FR-N2 | Mark notification read | P2 | Model done, backend TBD |
| FR-N3 | Unread count badge on nav | P2 | UI partial |
| FR-N4 | Push notifications via Firebase | P3 | Not started |

### 6.8 Jobs Board
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-J1 | Jobs listing page (grid of job cards) | P1 | Done |
| FR-J2 | Job detail page with full description, tech stack, apply URL | P1 | Done |
| FR-J3 | Save / unsave a job (bookmark, auth only) | P1 | Done |
| FR-J4 | Post a job (title, company, location, type, experience, salary, techStack, description, applyUrl) | P1 | Done (service) |
| FR-J5 | Delete a posted job (poster only) | P2 | Done (service) |
| FR-J6 | External apply link (opens new tab) | P1 | Model done |
| FR-J7 | New jobs count since last visit badge | P2 | Done |

### 6.9 Settings
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-S1 | Settings page (account / preferences) | P1 | Done (UI scaffold) |
| FR-S2 | Logout from settings | P0 | Done |
| FR-S3 | Delete account flow from settings | P1 | Done (service call wired) |
| FR-S4 | Notification preferences toggles | P2 | Not started |
| FR-S5 | Privacy settings | P2 | Not started |

### 6.10 Search
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-SR1 | Global search page — keyword search across questions | P1 | Done |
| FR-SR2 | Real-time client-side filter-as-you-type | P2 | Done |
| FR-SR3 | Server-side search endpoint integration | P1 | Frontend ready, backend TBD |

### 6.11 AI Coach (Phase 2)
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-AI1 | AI Coach entry point (Dashboard) | P1 | Not started |
| FR-AI2 | Resume PDF upload (FormData) | P1 | Not started |
| FR-AI3 | Backend extraction of tech stack, role, years, company names | P1 | Not started |
| FR-AI4 | Personalized question set generated per user | P1 | Not started |
| FR-AI5 | Guided Q&A flow (one question at a time, text answer box) | P1 | Not started |
| FR-AI6 | AI-generated feedback on each answer | P2 | Not started |
| FR-AI7 | Practice session progress tracking | P2 | Not started |
| FR-AI8 | (Future) Voice input mode for answers | P3 | Not started |

---

## 7. Non-Functional Requirements (NFRs)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| NFR-1 | **Fast first load** — Bundle size ≤ 350KB gzipped, LCP < 2.5s on 4G | P0 | In progress (route-level lazy load done) |
| NFR-2 | **Responsive layout** — Desktop (sidebar nav) + Mobile (bottom nav + hamburger drawer) | P0 | Done |
| NFR-3 | **Dark / Light theme** — Persisted, CSS variable driven, system default aware | P0 | Done |
| NFR-4 | **Accessibility** — Keyboard navigable controls, reasonable color contrast (≥ 4.5:1 body text) | P1 | Done (base) |
| NFR-5 | **Reliable auth** — Session recovery on refresh works without re-prompt; 401/403 clears invalid token | P0 | Done |
| NFR-6 | **Security** — Auth token never logged; Bearer via Authorization header; input sanitization in URL helpers | P0 | Done |
| NFR-7 | **SEO meta per route** — Title + Meta description + OG image tags | P1 | Done (TitleStrategy + SEO service) |
| NFR-8 | **Global loading overlay** — HTTP interceptor-driven spinner for network calls | P1 | Done |
| NFR-9 | **Toast notifications** — Success/error feedback for all user actions | P1 | Done |
| NFR-10 | **Vercel deployable** — SPA routes resolve via rewrites to index.html, output in dist/lastminprep/browser | P0 | Done (vercel.json) |
| NFR-11 | **Capacitor mobile** — iOS + Android platform configs, keyboard/status-bar/splash plugins | P1 | Done (configs in place) |
| NFR-12 | **Lazy-loaded routes** — Every feature component loaded via loadComponent() | P0 | Done |
| NFR-13 | **Signal-based state** — UI reactiveness driven by Angular signals (no NgRx/store overhead for phase 1) | P1 | Done |

---

## 8. System Architecture (Frontend Overview)

```
src/app
├── core/
│   ├── guards/           — auth.guard, public.guard, landing.guard
│   ├── interceptors/     — auth.interceptor (Bearer token), loading.interceptor
│   ├── models/           — All TypeScript interfaces
│   └── services/         — auth, question, job, theme, seo, loading, toast, tag-options, title-strategy
├── features/             — 14+ feature components, each standalone + lazy loaded
│   ├── auth/             — login, signup, google-callback
│   ├── home, dashboard, feed, explore
│   ├── jobs, job-detail
│   ├── profile, user-profile, settings
│   ├── saved, my-questions, notifications, leaderboard
│   ├── question-detail, search
└── shared/components/    — Reusable UI: navbar, sidebar, bottom-nav, drawer,
                            question-card, post-modal, global-loader, toast-container
```

### Key Design Decisions
1. **Standalone components only** (no NgModules) — matches Angular 17 idioms, simpler tree-shaking.
2. **Signals as the reactivity primitive** — no additional state library; services hold the signal stores.
3. **API adapter pattern** — every `.normalize()` method in services allows flexible backend payload shapes (falls back through multiple keys like `data / item / result`, `id / _id`, etc.). This decouples frontend from backend iteration velocity.
4. **Fallback chains** — auth, signup, profile-update, question-delete all try multiple endpoint paths to tolerate evolving backend APIs.
5. **CSS variables + Tailwind** utilities for theming.

---

## 9. Deployment & Environment

- **Web hosting**: Vercel (Angular SPA, `vercel.json` rewrites all routes → `index.html`)
- **Build output**: `dist/lastminprep/browser`
- **Mobile wrapper**: Capacitor v6 → iOS + Android native projects
- **API base URL**: Configured per env (`environment.ts` / `environment.prod.ts`)
  - Dev default: `http://localhost:3333/api`
  - Prod: set in `environment.prod.ts`
- **Google OAuth URLs**: `(environment as any).googleAuthUrl` / `.googleAuthSignupUrl` — falls back to `${API}/auth/google` and `${API}/auth/google/signup`

---

## 10. Open Questions & Assumptions

| # | Question / Assumption | Decision Needed By |
|---|-----------------------|--------------------|
| OQ-1 | Backend OAuth approach — **querystring `?token=`** from Google redirect vs **HttpOnly cookie** session after server-side redirect | Phase 1 backend dev kickoff |
| OQ-2 | Session-validation contract: `GET /users/me` is assumed — confirm exact response wrapper shape (should match `{user}` or `{data: user}` etc.) | Backend API v1 freeze |
| OQ-3 | Post-login redirect flow: confirm `returnTo` query param support + open-redirect guard | Security review |
| OQ-4 | Question list endpoint shape: confirm pagination params, sort options, filter by techTag/hashtag | Backend v1 |
| OQ-5 | Leaderboard scoring formula: streak + votes + posts weight? | Product + backend |
| OQ-6 | Streak increment rule: what daily action counts? (login + ≥ 1 interaction?) | Product |
| OQ-7 | Jobs moderation: user-posted jobs — moderation flow before listing? | Legal + trust & safety |
| OQ-8 | AI Coach backend: LLM provider (OpenAI / Anthropic / open source self-host)? | Phase 2 planning |
| OQ-9 | Avatar / banner storage: S3-compatible object storage? CDN bucket URL pattern? | Backend devops |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Backend API shape keeps changing | High | Medium | Normalize layer + fallback chains (already in all services); contract-free adapters |
| Google OAuth callback misconfigured | Medium | High | Test callback flow end-to-end before launch; fallback login via email |
| Mobile (Capacitor) has native quirks (OAuth deep link, keyboard) | Medium | Medium | Keep web app as primary; mobile as progressive wrapper |
| Seed content not ready at launch | Medium | High | Seed script + allow community posting from day 1 with moderation |
| AI Coach scope creep delays main launch | Medium | Medium | Ship Phase 1 (community + jobs) first; Phase 2 AI Coach as feature flag |

---

## 12. Release Plan

### Milestone M1 — "Frontend Shell Complete" ✅
- All 14+ feature pages scaffolded + routing
- Auth flows (email, Google callback handler) wired
- Core services (question, job, auth) with normalize adapters
- Shared UI kit (navbar, sidebar, bottom-nav, drawer, cards, modals, toasts, loader)
- Responsive layout, theming, Vercel config

### Milestone M2 — "Production Backend Integration" 🔄
- NestJS (or chosen backend) API deployed to staging
- End-to-end tests of: signup, login, session restore, post question, vote, comment, save, post job
- Database seed script with 500+ questions across 7 domains, 50 jobs
- Google OAuth server-side flow working with callback
- Image upload (avatar, banner) bucket integration

### Milestone M3 — "Public Web Launch" 📋
- Environment configs (prod API URL, OAuth URLs, CDN domains) set
- Vercel prod domain connected, SSL, custom 404
- Capacitor iOS + Android builds run successfully (optional TestFlight/Internal Track)
- Analytics (Plausible/GA) for activation, retention, engagement metrics
- Support email / issue tracker linked

### Milestone M4 — "AI Coach (Phase 2)" 📋
- Resume upload + parse
- Personalized question bank
- Guided Q&A UI
- AI feedback on answers
- Session progress tracking

---

## 13. Change Log

### 2026-07-27 (v1.0 — Current)
- PRD restructured: added NFR table, FR status column, release milestones, risks, open questions, data model section, IA route map, success metrics.
- Cross-referenced FRs against actual frontend implementation status.

### 2026-04-16 (Initial)
- Vercel deployment config added.
- Home page hero redesigned (left-aligned layout + coding-style animation).
- Google OAuth frontend wired: redirect + callback handler + token-based session restore.
- Split Google OAuth endpoints for login vs signup.
- Explore domain list updated with "AI" category.
