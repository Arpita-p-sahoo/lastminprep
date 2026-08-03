import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;

    if (path.endsWith('/users/me')) {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          data: {
            id: 'u_test',
            name: 'Test User',
            email: 'test@example.com',
            designation: 'Engineer',
            organisation: 'LastMinPrep',
            experience: '1–3 yrs',
            age: 25,
            gender: '',
            dob: '',
            linkedinUrl: '',
            techStack: ['Angular', 'TypeScript'],
            streak: 0,
            answeredCount: 0,
            questionsPosted: 0,
            totalVotes: 0,
            joinedAt: new Date().toISOString(),
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: [] }),
    });
  });
});

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.logo-text').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /start preparing/i })).toBeVisible();
});

test('protected route redirects to login with returnTo', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fdashboard/);
  await expect(page.getByText('Welcome back')).toBeVisible();
});

test('dashboard renders when session is present in localStorage', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'lmp_user',
      JSON.stringify({
        id: 'u_test',
        name: 'Test User',
        email: 'test@example.com',
        avatar: '',
        bannerUrl: '',
        designation: 'Engineer',
        organisation: 'LastMinPrep',
        address: '',
        highestEducation: '',
        experience: '1–3 yrs',
        age: 25,
        gender: '',
        dob: '',
        linkedinUrl: '',
        techStack: ['Angular', 'TypeScript'],
        streak: 0,
        answeredCount: 0,
        questionsPosted: 0,
        totalVotes: 0,
        joinedAt: new Date().toISOString(),
      })
    );
    localStorage.setItem('lmp_token', 'test_token');
  });

  await page.goto('/dashboard');
  await expect(page.getByText(/good (morning|afternoon|evening|night)/i)).toBeVisible();
  await expect(page.getByText('Test User', { exact: true })).toBeVisible();
});
