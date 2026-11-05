import { expect, test } from '@playwright/test';
const B = process.env.BASE_PATH ?? '/';

test('đoán trước (bật trong Cài đặt): câu đoán → Bỏ qua → thẻ giới thiệu ba lớp, nguyên văn mở khi cần', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(B + '#/cai-dat');
  const box = page.getByLabel('Đoán trước 1–2 câu ở đầu đợt học mới, trước khi đọc thẻ giới thiệu');
  await box.check();
  await page.goto(B + '#/hoc/hien-phap/hp-1');
  await expect(page.locator('.pretest-bar')).toBeVisible();
  await expect(page.locator('.pretest-bar')).toContainText('không ghi vào tiến độ');
  await page.getByRole('button', { name: 'Bỏ qua' }).click();
  // có thể còn câu đoán thứ hai: bỏ qua tiếp
  for (let k = 0; k < 2 && (await page.locator('.pretest-bar').count()); k++) await page.getByRole('button', { name: 'Bỏ qua' }).click();
  const card = page.getByRole('article', { name: 'Thẻ giới thiệu khái niệm' });
  await expect(card).toBeVisible();
  // có tình huống hỏi–đáp (memo.case) thì thay đoạn ví dụ; đáp ẩn tới khi bấm "Xem đáp"
  await expect(card.locator('.intro-case-q, .intro-example').first()).toBeVisible();
  await expect(card.locator('blockquote')).toHaveCount(0);
  await card.getByRole('button', { name: 'Xem nguyên văn điều luật' }).click();
  await expect(card.locator('blockquote')).toBeVisible();
  await expect(card.getByRole('button', { name: 'Ẩn nguyên văn điều luật' })).toHaveAttribute('aria-expanded', 'true');
  // câu đoán không ghi tiến độ: chưa có khái niệm nào lên bậc
  const levels = await page.evaluate(() => new Promise<number>((resolve) => {
    const req = indexedDB.open('luyen-luat');
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('concepts')) return resolve(0);
      const all = db.transaction('concepts', 'readonly').objectStore('concepts').getAll();
      all.onsuccess = () => resolve(all.result.length);
    };
    req.onerror = () => resolve(0);
  }));
  expect(levels).toBe(0);
});
