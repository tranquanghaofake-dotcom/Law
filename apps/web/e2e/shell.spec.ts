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

test('#/mon/hien-phap hiện lưới 10 ô, đúng 1 nhãn TIẾP THEO CHO BẠN, chú giải 7 mức', async ({ page }) => {
  await page.goto(B + '#/mon/hien-phap');
  await expect(page.locator('.mastery .cell')).toHaveCount(10);
  await expect(page.locator('.next-tag')).toHaveCount(1);
  await expect(page.locator('.legend li')).toHaveCount(7);
  await expect(page.getByRole('link', { name: /Học đợt tiếp/ })).toHaveAttribute('href', '#/hoc/hien-phap/hp-1');
});

test('#/mon liệt kê môn có nội dung và dẫn vào trang môn', async ({ page }) => {
  await page.goto(B + '#/mon');
  await page.getByRole('link', { name: /Luật Hiến pháp/ }).click();
  await expect(page).toHaveURL(/#\/mon\/hien-phap$/);
});

test('ở 1280 px mỗi trang trong NAV có đúng 1 mục aria-current trong sidebar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  for (const [hash, label] of [['#/', 'Hôm nay'], ['#/mon', 'Môn học'], ['#/mon/hien-phap', 'Môn học'], ['#/luyen-de', 'Luyện đề'], ['#/toi', 'Hồ sơ'], ['#/cai-dat', 'Hồ sơ']]) {
    await page.goto(B + hash);
    await expect(page.locator('.sidenav [aria-current="page"]')).toHaveCount(1);
    await expect(page.locator('.sidenav [aria-current="page"]')).toContainText(label);
  }
});

test('390 px: trang môn và luyện đề không cuộn ngang', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const hash of ['#/', '#/mon/hien-phap', '#/luyen-de', '#/toi']) {
    await page.goto(B + hash);
    await page.locator('main').waitFor();
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over, hash).toBeLessThanOrEqual(0);
  }
});

test('390 px trong phiên học: không tab bar, padding đáy nhỏ hơn chiều cao tab bar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(B + '#/hoc/hien-phap/hp-1');
  await expect(page.locator('.tabbar')).toHaveCount(0);
  const pb = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('main')!).paddingBottom));
  expect(pb).toBeLessThan(56);
});

test('danh mục khái niệm: tìm không dấu, mở xem định nghĩa, ★ giữ sau khi tải lại', async ({ page }) => {
  await page.goto(B + '#/mon/hien-phap');
  await page.getByRole('link', { name: 'Danh mục khái niệm' }).click();
  await expect(page).toHaveURL(/#\/mon\/hien-phap\/khai-niem$/);
  await expect(page.locator('.concept-entry')).toHaveCount(10);
  await page.getByRole('searchbox').fill('chu quyen');
  const n = await page.locator('.concept-entry').count();
  expect(n).toBeGreaterThan(0); expect(n).toBeLessThan(10);
  await page.getByRole('searchbox').fill('khong co khai niem nao nhu the');
  await expect(page.getByText('Không có khái niệm khớp.')).toBeVisible();
  await page.getByRole('searchbox').fill('');
  await page.locator('.entry-toggle', { hasText: 'Chủ quyền Nhân dân' }).click();
  await expect(page.locator('.concept-entry.open .quote')).toBeVisible();
  await page.getByRole('button', { name: /Đánh dấu/ }).first().click();
  await page.reload();
  await page.getByRole('button', { name: /Đã đánh dấu \(1\)/ }).click();
  await expect(page.locator('.concept-entry')).toHaveCount(1);
});

test('ô trên lưới bậc dẫn tới đúng khái niệm trong danh mục', async ({ page }) => {
  await page.goto(B + '#/mon/hien-phap');
  await page.locator('.cell-item').first().click();
  await expect(page).toHaveURL(/#\/mon\/hien-phap\/khai-niem\/[a-z-]+$/);
  await expect(page.locator('.concept-entry.open')).toHaveCount(1);
});
