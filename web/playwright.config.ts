import { defineConfig } from '@playwright/test';

const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:4173${base.replace(/\/$/, '')}`,
    headless: true,
    // Môi trường có Chromium cài sẵn; đổi/bỏ executablePath nếu chạy máy khác (npx playwright install chromium).
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  webServer: { command: 'npm run build && npm run preview -- --port 4173 --strictPort', port: 4173, reuseExistingServer: true, timeout: 120_000, env: { BASE_PATH: base } },
  reporter: [['list']],
});
