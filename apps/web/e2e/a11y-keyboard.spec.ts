import { expect, test } from '@playwright/test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const B = process.env.BASE_PATH ?? '/';

test('Space đọc, Escape hỏi thoát, reduced-motion đặt class, aria-label phương án', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__spoken = [];
    const synth = {
      getVoices: () => [{ lang: 'vi-VN', name: 'Linh', default: false, localService: true, voiceURI: 'Linh' }],
      speak: (u: any) => (window as any).__spoken.push(u.text),
      cancel: () => {},
      addEventListener: () => {},
    };
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(B + '#/hoc/hien-phap/hp-1');
  await expect(page.getByRole('article', { name: 'Thẻ giới thiệu khái niệm' })).toBeVisible();
  // Space → đọc định nghĩa
  await page.keyboard.press('Space');
  expect(await page.evaluate(() => (window as any).__spoken.length)).toBeGreaterThan(0);
  // giảm chuyển động theo hệ thống → không có class motion-on, media query áp dụng
  const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('motion-on'));
  expect(reduced).toBe(true);
  // Escape → hộp xác nhận thoát
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Thoát phiên' })).toBeVisible();
  await page.getByRole('button', { name: 'Ở lại' }).click();
  // tới câu trắc nghiệm: aria-label có chữ cái A–D, Tab đi qua 4 phương án
  for (let i = 0; i < 5; i++) {
    await page.locator('.question, article[aria-label="Thẻ giới thiệu khái niệm"]').first().waitFor();
    if (await page.locator('.question').isVisible()) break;
    await page.getByRole('button', { name: /Đã hiểu/ }).click();
  }
  const labels = await page.locator('.opt').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? ''));
  expect(labels.map((l) => l[0])).toEqual(['A', 'B', 'C', 'D']);
  await page.locator('.opt').first().focus();
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')?.[0])).toBe('D');
  await page.keyboard.press('Tab');
  // sau 4 phương án, Tab không rơi vào phần tử vô nghĩa: chưa trả lời nên chưa có "Câu tiếp"; focus rời khỏi nhóm phương án
  expect(await page.evaluate(() => document.activeElement?.classList.contains('opt'))).toBe(false);
});

test('cài đặt Giảm chuyển động = Bật đặt class reduced-motion', async ({ page }) => {
  await page.goto(B + '#/cai-dat');
  await page.getByLabel('Giảm chuyển động').selectOption('on');
  expect(await page.evaluate(() => document.documentElement.classList.contains('reduced-motion'))).toBe(true);
});

test('build PWA có manifest và service worker', async ({ request }) => {
  const m = await request.get(B + 'manifest.webmanifest');
  expect(m.ok()).toBe(true);
  expect((await m.json()).name).toContain('Luyện Luật');
  const sw = await request.get(B + 'sw.js');
  expect(sw.ok()).toBe(true);
});

test('axe-core: không có vi phạm serious/critical ở các trang có shell (390 và 1280 px)', async ({ page }) => {
  const axePath = require.resolve('axe-core/axe.min.js');
  for (const [w, h] of [[390, 844], [1280, 800]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const hash of ['#/', '#/mon', '#/mon/hien-phap', '#/mon/hien-phap/khai-niem/chu-quyen-nhan-dan', '#/luyen-de', '#/toi', '#/cai-dat']) {
      await page.goto(B + hash);
      await page.locator('main h1, main .hero-card').first().waitFor();
      await page.addScriptTag({ path: axePath });
      const res = await page.evaluate(async () => (window as any).axe.run(document, { resultTypes: ['violations'] }));
      const bad = res.violations.filter((v: any) => v.impact === 'serious' || v.impact === 'critical').map((v: any) => `${v.id}: ${v.nodes.map((n: any) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
      expect(bad, `${w}px ${hash}`).toEqual([]);
    }
  }
});
