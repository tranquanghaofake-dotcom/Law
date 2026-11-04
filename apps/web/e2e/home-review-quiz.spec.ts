import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
const B = process.env.BASE_PATH ?? '/';

test('trang chủ người mới: thẻ Bắt đầu, môn đang học, một thẻ kiểm tra nhanh', async ({ page }) => {
  await page.goto(B + '');
  await expect(page.locator('.hero-card .kicker')).toHaveText('Bắt đầu');
  // môn đầu theo thứ tự chương trình học (lib/ui/shelves.ts), không phải môn đầu bảng chữ cái
  await expect(page.getByRole('link', { name: /Học đợt đầu tiên/ })).toHaveAttribute('href', '#/hoc/ly-luan-nn-pl/llc1');
  await expect(page.getByRole('heading', { name: /Bắt đầu từ đâu/ })).toBeVisible();
  await expect(page.locator('.subject-rows li')).toHaveCount(3);
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

test('luyện đề 10 câu: làm hết, thấy điểm, Về Luyện đề thấy điểm cao nhất', async ({ page }) => {
  await page.goto(B + '#/bo/dat-coc');
  for (let i = 0; i < 10; i++) {
    await page.locator('.opt').first().waitFor();
    await page.locator('.opt').first().click();
    await page.getByRole('button', { name: /Câu tiếp|Xem kết quả/ }).click();
  }
  await expect(page.locator('.score')).toHaveText(/\d+\/10/);
  await page.getByRole('link', { name: 'Về Luyện đề' }).click();
  await expect(page).toHaveURL(/#\/luyen-de$/);
  await expect(page.locator('.ticket', { hasText: 'Đặt cọc' }).first()).toContainText(/điểm cao nhất/);
});

test('nhập điểm cao nhất cũ từ localStorage v1', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('best:dat-coc', '9'));
  await page.goto(B + '#/luyen-de'); // mở thẳng, không qua trang chủ
  await expect(page.locator('.ticket', { hasText: 'Đặt cọc' }).first()).toContainText('9/10');
});

test('cài đặt ẩn nút Nghe thử khi không có giọng vi', async ({ page }) => {
  await page.addInitScript(() => { (window as any).speechSynthesis.getVoices = () => []; });
  await page.goto(B + '#/cai-dat');
  await expect(page.getByRole('heading', { name: 'Cài đặt' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nghe thử' })).toHaveCount(0);
});

test('ôn hôm nay khi chưa học gì → báo rỗng và dẫn tới đợt đầu tiên', async ({ page }) => {
  await page.goto(B + '#/on');
  await expect(page.getByText(/chưa học khái niệm nào/)).toBeVisible();
  await expect(page.getByRole('link', { name: /Học đợt đầu tiên/ })).toHaveAttribute('href', '#/');
});

test('#/on/hien-phap khi chưa có gì → báo rỗng và link về môn', async ({ page }) => {
  await page.goto(B + '#/on/hien-phap');
  await expect(page.getByText(/chưa học khái niệm nào trong môn này/)).toBeVisible();
  await expect(page.getByRole('link', { name: /Học đợt đầu tiên/ })).toHaveAttribute('href', '#/mon/hien-phap');
});

// Số đề đọc từ dữ liệu (không gõ số cố định); nhóm "dan-su" lấy từ trường group của mỗi đề.
const setsDir = '../../packages/content/data/sets';
const allSets: { title: string; group: string }[] = readdirSync(setsDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(`${setsDir}/${f}`, 'utf8')));
// Chip lọc theo kệ nhóm ngành (PR 3): kệ "Dân sự – Tố tụng" gồm nhóm dan-su và to-tung-dan-su (lib/ui/groups.ts GROUP_SHELF).
const danSuTitles = allSets.filter((s) => ['dan-su', 'to-tung-dan-su'].includes(s.group)).map((s) => s.title);

test('Luyện đề: lọc theo nhóm chỉ còn đề của nhóm đó', async ({ page }) => {
  await page.goto(B + '#/luyen-de');
  await expect(page.locator('.ticket')).toHaveCount(allSets.length);
  await page.getByRole('button', { name: 'Dân sự – Tố tụng' }).click();
  // Lọc xong: số đề bằng số đề của nhóm trong dữ liệu, ít hơn tổng, và mọi đề hiện ra đều thuộc nhóm.
  await expect(page.locator('.ticket')).toHaveCount(danSuTitles.length);
  expect(danSuTitles.length).toBeLessThan(allSets.length);
  for (const t of await page.locator('.ticket h3').allTextContents()) expect(danSuTitles).toContain(t);
  await expect(page.getByRole('button', { name: 'Dân sự – Tố tụng' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Tất cả' }).click();
  await expect(page.locator('.ticket')).toHaveCount(allSets.length);
});
