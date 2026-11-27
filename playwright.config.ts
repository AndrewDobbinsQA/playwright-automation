import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  // Test discovery and execution
  testDir: './tests',
  fullyParallel: true,

  // CI configuration
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporting
  reporter: 'html',

  // Shared test configuration
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4200',
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
  },

  projects: [
    // UI testing
    {
      name: 'chromium',
      testMatch: '**/ui/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      testMatch: '**/ui/**/*.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      testMatch: '**/ui/**/*.spec.ts',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // API testing
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
      use: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:8091',
        extraHTTPHeaders: {
          Accept: 'application/json',
        },
      },
    },
  ],
});