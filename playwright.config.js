import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['**/user-journey.spec.ts', '**/scripts/agent-loop/tests/*.spec.js'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  reporter: 'html',
  timeout: 35000,
  use: {
    baseURL: 'http://localhost:3000/pelimotion-design-system/',
    trace: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 20000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/pelimotion-design-system/',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
