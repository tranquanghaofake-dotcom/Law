import { expect, test } from '@playwright/test';
const B = process.env.BASE_PATH ?? '/';

test('trang chủ hiện thương hiệu', async ({ page }) => {
  await page.goto(B + '');
  await expect(page.getByRole('link', { name: /Luyện Luật/ })).toBeVisible();
});

test('hash #/cai-dat mở Cài đặt', async ({ page }) => {
  await page.goto(B + '#/cai-dat');
  await expect(page.getByRole('heading', { name: 'Cài đặt' })).toBeVisible();
});

test('layout 1 cột trên điện thoại, 2 cột trên desktop khi học', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(B + '#/on');
  const cols = async () => page.evaluate(() => getComputedStyle(document.querySelector('main')!).gridTemplateColumns.trim().split(/\s+/).length);
  expect(await cols()).toBe(1);
  await page.setViewportSize({ width: 1280, height: 800 });
  expect(await cols()).toBe(2);
});
