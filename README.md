# LastMinPrep 🎯

> Community-curated, highly-rated interview questions sorted by tech stack.

## Tech Stack

- **Framework**: Angular 17 (standalone components, signals)
- **Styling**: Tailwind CSS + custom CSS variables
- **Mobile**: Capacitor v6 (iOS + Android)
- **Routing**: Angular Router with lazy loading
- **State**: Angular Signals
- **SEO**: Angular Universal ready, Meta + Title services per route

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Angular CLI 17

### Install

```bash
git clone https://github.com/YOUR_USERNAME/lastminprep.git
cd lastminprep
npm install
```

### Run locally

```bash
npm start
# → http://localhost:4200
```

### Build for production

```bash
npm run build:prod
```

---

## Mobile (Capacitor)

### First-time setup

```bash
# Build the web app first
npm run build:prod

# Init Capacitor (already configured)
npx cap sync

# Add platforms
npm run cap:add:android
npm run cap:add:ios
```

### Run on device

```bash
# Android
npm run cap:run:android

# iOS (Mac only)
npm run cap:run:ios
```

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          # auth.guard, public.guard
│   │   ├── models/          # TypeScript interfaces
│   │   └── services/        # auth, theme, seo, questions, jobs
│   ├── features/
│   │   ├── home/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/
│   │   ├── feed/
│   │   ├── explore/
│   │   ├── jobs/
│   │   ├── profile/
│   │   ├── saved/
│   │   ├── my-questions/
│   │   ├── notifications/
│   │   ├── leaderboard/
│   │   ├── search/
│   │   └── settings/
│   └── shared/
│       └── components/      # navbar, sidebar, bottom-nav, drawer, modals
├── environments/
└── styles.scss              # Global styles + CSS variables
```

---

## Routes

| Path | Component | Guard |
|------|-----------|-------|
| `/` | HomeComponent | — |
| `/login` | LoginComponent | publicGuard |
| `/signup` | SignupComponent | publicGuard |
| `/dashboard` | DashboardComponent | authGuard |
| `/feed` | FeedComponent | authGuard |
| `/explore` | ExploreComponent | — |
| `/jobs` | JobsComponent | — |
| `/profile` | ProfileComponent | authGuard |
| `/saved` | SavedComponent | authGuard |
| `/my-questions` | MyQuestionsComponent | authGuard |
| `/notifications` | NotificationsComponent | authGuard |
| `/leaderboard` | LeaderboardComponent | — |
| `/search` | SearchComponent | — |
| `/settings` | SettingsComponent | authGuard |

---

## Features

- ✅ Light/dark theme (persisted in localStorage)
- ✅ Auth guard + public guard
- ✅ Responsive: sidebar on desktop, bottom nav on mobile
- ✅ Mobile drawer navigation
- ✅ Post questions with tech tags + hashtags
- ✅ Vote and save questions (with signals)
- ✅ Job board with post a job
- ✅ Leaderboard with streak tracking
- ✅ Real-time search across questions
- ✅ Notifications feed
- ✅ SEO meta tags per route
- ✅ Capacitor config for iOS + Android
- ✅ Lazy-loaded routes

## TODO (Backend)

- [ ] Replace mock data with real API (NestJS recommended)
- [ ] Google OAuth integration
- [ ] Image upload for profile pictures
- [ ] WebSocket for real-time vote updates
- [ ] Push notifications via Firebase
- [ ] Angular Universal SSR for full SEO

---

## Built by

Arpita Sahoo — Angular developer from Bhubaneswar, Odisha 🇮🇳
