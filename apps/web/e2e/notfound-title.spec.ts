import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
const B = process.env.BASE_PATH ?? '/';

// Tên khái niệm đọc từ dữ liệu, không gõ tay.
const conceptId = 'chu-quyen-nhan-dan';
const concept = JSON.parse(readFileSync(`../../packages/content/data/concepts/hien-phap/${conceptId}.json`, 'utf8'));
const term: string = concept.term;

test('#/khong-co hiện trang không tìm thấy, có liên kết về trang chính và môn học', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(B + '#/khong-co');
  await expect(page.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeVisible();
  await expect.poll(() => page.title()).toContain('Không tìm thấy');
  await expect(page.locator('section.card a[href="#/"]')).toHaveText(/Về Hôm nay/);
  await expect(page.locator('section.card a[href="#/mon"]')).toHaveText(/Môn học/);
  // Route notfound không thuộc mục NAV nào (activeNav trả null) nên sidebar không có aria-current.
  await expect(page.locator('.sidenav [aria-current="page"]')).toHaveCount(0);
});

test('trang khái niệm: title bắt đầu bằng tên khái niệm và chứa "Luật Hiến pháp"', async ({ page }) => {
  await page.goto(B + `#/mon/hien-phap/khai-niem/${conceptId}`);
  await expect.poll(async () => (await page.title()).startsWith(term)).toBe(true);
  expect(await page.title()).toContain('Luật Hiến pháp');
});

test('#/mon/hien-phap/khai-niem không có khái niệm: title khác title có khái niệm', async ({ page }) => {
  await page.goto(B + `#/mon/hien-phap/khai-niem/${conceptId}`);
  await expect.poll(async () => (await page.title()).startsWith(term)).toBe(true);
  const withConcept = await page.title();

  await page.goto(B + '#/mon/hien-phap/khai-niem');
  await expect.poll(() => page.title()).toBe('Khái niệm · Luật Hiến pháp · Luyện Luật');
  expect(await page.title()).not.toBe(withConcept);
});
