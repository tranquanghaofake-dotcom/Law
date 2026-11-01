import { expect, test } from '@playwright/test';
const B = process.env.BASE_PATH ?? '/';

test('trang chủ: Ôn hôm nay, lộ trình môn, luyện đề', async ({ page }) => {
  await page.goto(B + '');
  await expect(page.getByText(/Ôn hôm nay/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Luật Hiến pháp' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Đặt cọc/ })).toBeVisible();
});

test('luyện đề 10 câu: làm hết, thấy điểm, điểm cao nhất lên trang chủ', async ({ page }) => {
  await page.goto(B + '#/bo/dat-coc');
  for (let i = 0; i < 10; i++) {
    await page.locator('.opt').first().waitFor();
    await page.locator('.opt').first().click();
    await page.getByRole('button', { name: /Câu tiếp|Xem kết quả/ }).click();
  }
  await expect(page.locator('.score')).toHaveText(/\d+\/10/);
  await page.getByRole('link', { name: 'Chọn bộ khác' }).click();
  await expect(page.getByRole('link', { name: /Đặt cọc/ })).toContainText(/điểm cao nhất/);
});

test('nhập điểm cao nhất cũ từ localStorage v1', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('best:dat-coc', '9'));
  await page.goto(B + '');
  await expect(page.getByRole('link', { name: /Đặt cọc/ })).toContainText('9/10');
});

test('cài đặt ẩn nút Nghe thử khi không có giọng vi', async ({ page }) => {
  await page.addInitScript(() => { (window as any).speechSynthesis.getVoices = () => []; });
  await page.goto(B + '#/cai-dat');
  await expect(page.getByRole('heading', { name: 'Cài đặt' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nghe thử' })).toHaveCount(0);
});

test('ôn hôm nay khi không có gì → báo và về trang chủ', async ({ page }) => {
  await page.goto(B + '#/on');
  await expect(page.getByText(/Chưa có gì cần ôn/)).toBeVisible();
});
