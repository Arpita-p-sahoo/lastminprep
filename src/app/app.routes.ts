import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'LastMinPrep — Crack your next tech interview',
    data: {
      description: 'Community-curated interview questions sorted by tech stack.',
      ogImage: '/assets/og-home.png',
    },
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [publicGuard],
    title: 'Log in — LastMinPrep',
    data: { description: 'Log in to your LastMinPrep account.' },
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup/signup.component').then((m) => m.SignupComponent),
    canActivate: [publicGuard],
    title: 'Sign up — LastMinPrep',
    data: { description: 'Join 4,000+ developers preparing smarter.' },
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard — LastMinPrep',
  },
  {
    path: 'feed',
    loadComponent: () =>
      import('./features/feed/feed.component').then((m) => m.FeedComponent),
    canActivate: [authGuard],
    title: 'Community Feed — LastMinPrep',
    data: { description: 'Top-rated interview questions from the community.' },
  },
  {
    path: 'explore',
    loadComponent: () =>
      import('./features/explore/explore.component').then((m) => m.ExploreComponent),
    title: 'Explore — LastMinPrep',
    data: { description: 'Browse interview questions by tech stack and framework.' },
  },
  {
    path: 'jobs',
    loadComponent: () =>
      import('./features/jobs/jobs.component').then((m) => m.JobsComponent),
    title: 'Job Board — LastMinPrep',
    data: { description: 'Find and post tech jobs in the LastMinPrep community.' },
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Profile — LastMinPrep',
  },
  {
    path: 'user/:id',
    loadComponent: () =>
      import('./features/user-profile/user-profile.component').then((m) => m.UserProfileComponent),
    canActivate: [authGuard],
    title: 'User Profile — LastMinPrep',
  },
  {
    path: 'saved',
    loadComponent: () =>
      import('./features/saved/saved.component').then((m) => m.SavedComponent),
    canActivate: [authGuard],
    title: 'Saved Questions — LastMinPrep',
  },
  {
    path: 'my-questions',
    loadComponent: () =>
      import('./features/my-questions/my-questions.component').then((m) => m.MyQuestionsComponent),
    canActivate: [authGuard],
    title: 'My Questions — LastMinPrep',
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./features/notifications/notifications.component').then((m) => m.NotificationsComponent),
    canActivate: [authGuard],
    title: 'Notifications — LastMinPrep',
  },
  {
    path: 'leaderboard',
    loadComponent: () =>
      import('./features/leaderboard/leaderboard.component').then((m) => m.LeaderboardComponent),
    title: 'Leaderboard — LastMinPrep',
    data: { description: 'Top contributors in the LastMinPrep community.' },
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search.component').then((m) => m.SearchComponent),
    title: 'Search — LastMinPrep',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
    canActivate: [authGuard],
    title: 'Settings — LastMinPrep',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
