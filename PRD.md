# Product Requirements Document (PRD) — LastMinPrep

## Overview

LastMinPrep is a community-driven interview preparation platform focused on real, high-signal practice: users can browse curated questions by tech stack, post and discuss questions, track streak/progress, and discover jobs. An AI Coach module provides personalized practice based on a user’s resume.

## Goals

- Help users prepare for tech interviews faster with structured practice and high-quality community content.
- Provide a clean, responsive experience across desktop and mobile.
- Enable authentication flows that feel instant (email/password + Google sign-in).
- Support production deployment on Vercel for the web app.

## Non-Goals (Near Term)

- Full SSR/Angular Universal rollout (unless SEO demands it later).
- Realtime features (websockets) beyond basic polling or refresh.
- Complex admin panel tooling.

## Users & Personas

- Candidate: wants daily practice, quick browsing by stack, and feedback loops (streaks, progress).
- Working professional: targets specific roles/companies and prefers focused question sets.
- Community contributor: posts/curates questions, votes, comments, and shares resources.

## Core User Journeys

1. Discover questions: Home → Explore → Question detail → Vote/Comment/Save.
2. Join: Home → Sign up (email/password or Google) → Dashboard.
3. Return: Open app → session restored → Dashboard.
4. Practice: Dashboard → AI Coach entry → guided question/answer flow.
5. Jobs: Browse jobs → open job detail → save/apply externally.

## Functional Requirements

### Authentication

- Support email/password signup and login.
- Support Google sign-in.
- After Google sign-in success, user is redirected back to the web app and lands on Dashboard (no intermediate external pages).
- Session persists across reloads; user should not need to re-authenticate frequently.
- Logout clears local session.

### Content

- Explore/browse questions by tech stack and search query.
- View question detail and discussion thread.
- Vote, comment, and save questions (requires login).

### Dashboard

- Shows user greeting, activity stats, and content shortcuts.
- Provides quick access to posting questions and navigating feeds.

### AI Coach (Phase-based rollout)

- Resume upload (PDF) and extraction (backend).
- Personalized question set based on detected stack and role level.
- Feedback on answers; optional voice mode (future).

### Jobs

- Browse job listings and view job detail pages.

## Non-Functional Requirements

- Performance: initial load should remain fast on mobile networks.
- Accessibility: interactive controls keyboard-accessible; reasonable contrast.
- Reliability: auth/session recovery should be resilient to refreshes and browser restarts.
- Security: tokens must not be logged; prefer HttpOnly cookies for sessions where feasible.

## Deployment

- Web app deploys on Vercel as an Angular SPA.
- SPA routes must work on refresh via rewrite to `index.html`.
- Build output directory configured to `dist/lastminprep/browser`.

## Analytics & Success Metrics (Optional)

- Activation: % of users who reach Dashboard after signup.
- Retention: day-1/day-7 return rate.
- Engagement: votes/comments per active user, questions saved.
- AI Coach usage: resume uploads, sessions started, sessions completed.

## Open Questions

- Backend OAuth approach: token in querystring vs HttpOnly cookie session.
- API contract for session validation endpoint (recommended: `GET /users/me`).
- Post-login redirect behavior: support `returnTo` and guard against open redirects.

## Change Log

### 2026-04-16

- Added Vercel deployment configuration, home page hero redesign, and frontend Google OAuth callback/session restore flow.
- Added an AI domain in Explore to support trending AI interview prep topics.
- Updated Google sign-in journey to support separate login vs signup entry points.
