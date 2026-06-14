import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './scripts/agent-loop/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000/pelimotion-design-system/',
    trace: 'on-first-retry',
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
