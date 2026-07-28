# LastMinPrep — What's Done & What's Left

> A simple, no-jargon update. Updated: 27 July 2026

---

## 🎯 In One Line

**Frontend design and pages are mostly done. Backend API is still needed to connect to a real database. AI Coach feature is not started yet.**

---

## ✅ WHAT IS IMPLEMENTED AND WORKING (Frontend)

### 🔐 Login, Signup, Sessions
- User can create an account with email + password
- User can log in with email + password
- "Sign in with Google" button + callback page (frontend side; needs backend OAuth)
- Once logged in, the app remembers you even after you close the tab
- If the saved token is bad/expired, it silently logs you out
- Route guards: if you aren't logged in, you can't open Dashboard/Feed/etc.; if you ARE logged in, you can't go back to login/signup

### ❓ Questions (The Main Product)
- List of all questions shown newest-first
- Click a question → opens a detail page with the full thread
- Post a new question (write title, pick tech tag, add hashtags)
- Edit your own question
- Delete your own question
- Vote / upvote a question (click again to undo)
- Save / bookmark a question for later
- "Saved Questions" page shows everything you bookmarked
- "My Questions" page shows everything you posted
- Comment on any question
- Delete your own comments
- Nested reply model (data model done; nested reply display in UI may need polish)
- "New questions since your last visit" counter badge
- Search page — type a keyword and filter questions live

### 🧭 Browse & Explore
- **Explore page** with 7 big categories: Frontend, Backend, Mobile, DevOps, Data Science, AI, System Design
- Click a category → it expands showing frameworks (Angular, React, Node.js, Django, Flutter, Docker, Python, LLMs, etc.)
- Click a framework → jumps to the feed
- Tech icons load from a free icon CDN (simpleicons.org)
- **Home page** with a hero section + trending questions grid

### 🏠 Dashboard (After Login)
- Personal greeting that changes with the time (Good morning / afternoon / evening)
- Stats tiles: how many questions you posted, how many you answered, your streak days
- Filter chips for quick browsing
- Latest 3 jobs preview
- Quick button to open the "post a question" modal

### 👤 Profile & Users
- Your profile page with banner image, avatar, job title, company, stats
- Edit profile form (name, designation, organisation, address, education, experience, age, gender, DOB, LinkedIn, tech stack)
- Code for uploading avatar image (backend needs an image storage like AWS S3)
- Code for uploading banner image
- Public profile page for other users at URL like `/user/123`
- View any user's questions, streak, and stats

### 🏆 Leaderboard
- Leaderboard page showing top contributors (ranked list with points)
- Model supports highlighting the current user in the list

### 🔔 Notifications
- Notifications page UI built
- Data model for read/unread notifications with links

### 💼 Jobs Board
- Browse all jobs in a grid
- Open any job for full details (description, salary, location, tech stack, apply link)
- Save / bookmark a job (and remove)
- Code for posting a new job
- Code for deleting a job you posted
- "New jobs since your last visit" counter badge

### ⚙️ Settings
- Settings page UI built
- Logout works from settings
- Delete account works from settings

### 🎨 Look & Feel / UX Polish
- **Dark mode + Light mode** toggle (saved, remembered next time)
- **Responsive design**: On laptop/desktop → sidebar nav. On phone → bottom nav bar + hamburger drawer menu
- Global loading spinner that shows automatically during API calls
- Toast notifications that pop up for success / error messages
- Every page has a proper browser tab title + SEO meta description
- Vercel deployment config done (web app hosts correctly, refresh on deep URLs works)
- Capacitor configs for iOS + Android mobile app wrappers

---

## 🔧 WHAT IS PARTIALLY DONE (Needs Backend or Small Fixes)

| Area | What's there | What's missing |
|------|--------------|----------------|
| Google OAuth | Frontend button, redirect, callback, session restore | Backend needs to actually implement Google auth and return a token |
| Backend APIs | All frontend services are written with proper HTTP calls + smart normalize adapters | No real backend server deployed yet. Currently API points to `http://localhost:3333/api` which is empty placeholder |
| Feed filtering by tag | Static chip UI exists on Dashboard | Actual filter logic needs to wire chips to filter the question list |
| Nested comments replies | Model/type supports nested replies, delete logic supports recursion | UI rendering of nested replies may need style tweaks |
| Streak counter | User model has `streak` field, profile + dashboard show it | Backend logic to actually increment streak (what counts as "active today"?) |
| Leaderboard scoring | UI displays ranks | Backend scoring formula (how do votes/posts/streak convert to "points"?) |
| Avatar / banner upload | Service code with FormData POST | Needs storage bucket (S3, Cloudinary, etc.) + actual endpoints |
| Search | Client-side filter works | Backend search endpoint (for larger datasets) not connected |
| Notifications read/unread | Data model + UI scaffold | Backend endpoint for mark-as-read, unread badge logic on nav |
| Job apply link | Data model has `applyUrl` | Verify UI opens it in new tab correctly (check job-detail.html) |

---

## 📋 WHAT IS NOT STARTED YET

### 🤖 AI Coach (Phase 2 — the big remaining feature)
Nothing here is built yet. Planned steps:
1. Dashboard button/entry for "AI Coach"
2. Upload your resume PDF
3. Backend reads the PDF and figures out your tech stack, role, years of experience
4. Backend generates a personalized list of questions
5. Guided Q&A screen (one question at a time, type your answer)
6. AI gives feedback on each answer
7. Practice progress gets saved to your profile

### ⚙️ Settings (fine-grained)
- Notification preference toggles (email on comment? push on save? etc.)
- Privacy settings (who can see my profile, etc.)

### 🔔 Push Notifications
- Firebase / FCM integration to send push notifications (e.g., "someone commented on your question")

### ⏱️ Real-time Updates
- WebSockets so votes/comments appear instantly without page refresh (polling is enough for launch)

### 🎨 Server-Side Rendering (Angular Universal)
- Only needed if organic SEO becomes super important; can skip for initial launch

---

## 🚀 WHAT WE NEED TO LAUNCH (Minimum — Ordered by Priority)

1. **Set up the backend** (NestJS recommended in README) with a real database
   - Auth: login, signup, /users/me
   - Questions CRUD, vote, save, comment
   - Jobs CRUD, save
   - Notifications basic list
2. **Connect Google OAuth server-side** so the "Sign in with Google" flow actually works
3. **Seed the database** with ~500+ sample questions (across all 7 domains) and ~50 jobs
4. **Image upload** — pick a storage service (S3, Cloudinary, Firebase Storage) and connect endpoints
5. **Set production environment variables** in `environment.prod.ts` (real API URL, Google OAuth URLs)
6. **Deploy** — connect a domain on Vercel, SSL on
7. **Quick QA pass** — click every page, make sure backend errors show good toasts, logout/login works cleanly

---

## 📌 Simple Priority Summary

```
LAUNCH SOON (do first)
 ├─ Backend API + database
 ├─ Google OAuth backend
 ├─ Seed questions & jobs
 └─ Image upload (avatars/banners)

AFTER LAUNCH (do next)
 ├─ Push notifications (Firebase)
 ├─ Settings: notification + privacy toggles
 └─ Real-time (WebSockets) — optional

PHASE 2 (later)
 └─ AI Coach (resume upload → personalized practice)
```

---

*Questions? Ask! This doc is meant to be a quick, readable snapshot, not a formal spec. For the formal spec, see `PRD.md`.*
