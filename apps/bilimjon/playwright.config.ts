import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:4173', viewport: { width: 390, height: 844 } },
  webServer: { command: 'node ../../scripts/serve-static.mjs dist 4173', url: 'http://localhost:4173', reuseExistingServer: true },
});
