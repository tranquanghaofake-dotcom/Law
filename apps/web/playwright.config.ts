import { defineConfig } from '@playwright/test';

const base = process.env.BASE_PATH ?? '/';
// PW_BASE_URL=https://…github.io/Law/ → chạy e2e vào bản đã deploy, không build lại.
const remote = process.env.PW_BASE_URL?.replace(/\/$/, '');

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  use: {
    baseURL: remote ?? `http://localhost:4173${base.replace(/\/$/, '')}`,
    headless: true,
    // Môi trường có Chromium cài sẵn; đổi/bỏ executablePath nếu chạy máy khác (npx playwright install chromium).
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
    // (container cloud: PW_CHROMIUM=/opt/pw-browsers/chromium)
  },
  webServer: remote ? undefined : { command: 'npm run build && npm run preview -- --port 4173 --strictPort', port: 4173, reuseExistingServer: true, timeout: 120_000, env: { BASE_PATH: base } },
  reporter: [['list']],
});
