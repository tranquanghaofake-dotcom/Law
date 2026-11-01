import { expect, test } from '@playwright/test';
const B = process.env.BASE_PATH ?? '/';

test('trang chủ người mới: thẻ BẮT ĐẦU, môn đang học, một thẻ kiểm tra nhanh', async ({ page }) => {
  await page.goto(B + '');
  await expect(page.locator('.hero-card .kicker')).toHaveText('BẮT ĐẦU');
  await expect(page.getByRole('link', { name: /Học đợt đầu tiên/ })).toHaveAttribute('href', '#/hoc/hien-phap/hp-1');
  await expect(page.getByRole('link', { name: /Luật Hiến pháp/ }).first()).toBeVisible();
  await expect(page.locator('.sets.one .set')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /Tất cả đề/ })).toHaveAttribute('href', '#/luyen-de');
});

test('điều hướng: 4 mục, mục đang chọn có aria-current; Môn học và Luyện đề mở đúng trang', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(B + '#/luyen-de');
  await expect(page.locator('.sidenav a.item')).toHaveCount(4);
  await expect(page.locator('.sidenav [aria-current="page"]')).toHaveText(/Luyện đề/);
  await expect(page.getByRole('heading', { name: 'Luyện đề 10 câu' })).toBeVisible();
  await page.locator('.sidenav').getByRole('link', { name: /Môn học/ }).click();
  await expect(page.getByRole('heading', { name: 'Môn học' })).toBeVisible();
});

test('luyện đề 10 câu: làm hết, thấy điểm, Chọn bộ khác về Luyện đề có điểm cao nhất', async ({ page }) => {
  await page.goto(B + '#/bo/dat-coc');
  for (let i = 0; i < 10; i++) {
    await page.locator('.opt').first().waitFor();
    await page.locator('.opt').first().click();
    await page.getByRole('button', { name: /Câu tiếp|Xem kết quả/ }).click();
  }
  await expect(page.locator('.score')).toHaveText(/\d+\/10/);
  await page.getByRole('link', { name: 'Chọn bộ khác' }).click();
  await expect(page).toHaveURL(/#\/luyen-de$/);
  await expect(page.getByRole('link', { name: /Đặt cọc/ })).toContainText(/điểm cao nhất/);
});

test('nhập điểm cao nhất cũ từ localStorage v1', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('best:dat-coc', '9'));
  await page.goto(B + '#/luyen-de'); // mở thẳng, không qua trang chủ
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

test('#/on/hien-phap khi chưa có gì → báo rỗng và link về môn', async ({ page }) => {
  await page.goto(B + '#/on/hien-phap');
  await expect(page.getByText(/Chưa có gì cần ôn/)).toBeVisible();
  await expect(page.getByRole('link', { name: /Về môn/ })).toHaveAttribute('href', '#/mon/hien-phap');
});

test('Luyện đề: lọc theo nhóm chỉ còn đề của nhóm đó', async ({ page }) => {
  await page.goto(B + '#/luyen-de');
  await expect(page.locator('.set')).toHaveCount(5);
  await page.getByRole('button', { name: 'Luật Dân sự' }).click();
  await expect(page.locator('.set')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Luật Dân sự' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Tất cả' }).click();
  await expect(page.locator('.set')).toHaveCount(5);
});
