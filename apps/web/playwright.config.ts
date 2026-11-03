import { defineConfig } from '@playwright/test';

const base = process.env.BASE_PATH ?? '/';
// Cổng preview riêng cho mỗi lần chạy (PW_PORT) để hai lần chạy cùng lúc không dùng chung/tắt server của nhau.
const port = Number(process.env.PW_PORT ?? 4173);
// PW_BASE_URL=https://…github.io/Law/ → chạy e2e vào bản đã deploy, không build lại.
const remote = process.env.PW_BASE_URL?.replace(/\/$/, '');

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  use: {
    baseURL: remote ?? `http://localhost:${port}${base.replace(/\/$/, '')}`,
    headless: true,
    // Môi trường có Chromium cài sẵn; đổi/bỏ executablePath nếu chạy máy khác (npx playwright install chromium).
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
    // (container cloud: PW_CHROMIUM=/opt/pw-browsers/chromium)
  },
  webServer: remote ? undefined : { command: `npm run build && npm run preview -- --port ${port} --strictPort`, port, reuseExistingServer: !process.env.CI, timeout: 120_000, env: { BASE_PATH: base } },
  reporter: [['list']],
});
