import { expect, test } from '@playwright/test';
const B = process.env.BASE_PATH ?? '/';
import { readdirSync, readFileSync } from 'node:fs';

const dir = '../../packages/content/data/concepts/hien-phap';
const concepts = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
const correctOf = (q: string) => {
  for (const c of concepts) for (const it of c.items) if (it.q === q && 'options' in it) return it.options[it.answer] as string;
  throw new Error('không tìm thấy câu ' + q);
};

async function readLevels(page: import('@playwright/test').Page): Promise<Record<string, number>> {
  return page.evaluate(() => new Promise((resolve) => {
    const req = indexedDB.open('luyen-luat');
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('concepts', 'readonly');
      const all = tx.objectStore('concepts').getAll();
      all.onsuccess = () => resolve(Object.fromEntries(all.result.map((r: any) => [r.conceptId, r.level])));
    };
    req.onerror = () => resolve({});
  }));
}

test('phiên học pass 1: intro → trắc nghiệm → lưu ngay → kết thúc', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(B + '#/hoc/hien-phap/hp-1');
  // intro đầu tiên
  await expect(page.getByRole('article', { name: 'Thẻ giới thiệu khái niệm' })).toBeVisible();
  await expect(page.locator('.lesson-panel')).toBeVisible();
  // đi qua các intro cho tới câu trắc nghiệm đầu tiên
  for (let i = 0; i < 5; i++) {
    await page.locator('.question, article[aria-label="Thẻ giới thiệu khái niệm"]').first().waitFor();
    if (await page.locator('.question').isVisible()) break;
    await page.getByRole('button', { name: /Đã hiểu/ }).click();
  }
  // trắc nghiệm 1: trả lời đúng bằng phím số
  const q1 = await page.locator('.question').textContent();
  const opts = page.locator('.opt');
  const texts = await opts.allTextContents();
  const idx = texts.findIndex((t) => t.includes(correctOf(q1!.trim())));
  await page.keyboard.press(String(idx + 1));
  await expect(page.locator('.feedback.ok')).toBeVisible();
  // tải lại giữa phiên → tiến độ câu đã trả lời phải còn
  await page.reload();
  const levels = await readLevels(page);
  expect(Object.values(levels).some((l) => l >= 1)).toBe(true);
  // vào lại: pass vẫn là 1 vì khái niệm còn lại ở bậc 0
  await expect(page.getByRole('article', { name: 'Thẻ giới thiệu khái niệm' })).toBeVisible();
  // chạy hết phiên
  for (let i = 0; i < 30; i++) {
    await page.locator('.session-end, .question, article[aria-label="Thẻ giới thiệu khái niệm"]').first().waitFor();
    if (await page.locator('.session-end').isVisible()) break;
    if (await page.getByRole('button', { name: /Đã hiểu/ }).isVisible()) { await page.getByRole('button', { name: /Đã hiểu/ }).click(); continue; }
    const q = (await page.locator('.question').textContent())!.trim();
    const t = await page.locator('.opt').allTextContents();
    const k = t.findIndex((x) => x.includes(correctOf(q)));
    await page.locator('.opt').nth(k).click();
    await page.getByRole('button', { name: /Câu tiếp|Xem kết quả/ }).click();
  }
  await expect(page.locator('.session-end')).toBeVisible();
  await expect(page.locator('.session-end')).toContainText('XP');
  await expect(page.getByRole('button', { name: 'Về Hôm nay' })).toBeVisible();
});

test('cột đợt thành dải chip trên điện thoại; desktop có cột, không dải; không tab bar trong phiên', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(B + '#/hoc/hien-phap/hp-1');
  await expect(page.getByRole('article', { name: 'Thẻ giới thiệu khái niệm' })).toBeVisible();
  await expect(page.locator('.lesson-panel')).toBeHidden();
  await expect(page.locator('.lesson-strip')).toBeVisible();
  await expect(page.locator('.lesson-strip li')).toHaveCount(5);
  await expect(page.locator('.tabbar')).toHaveCount(0);
  await expect(page.locator('.session-bar .title')).toBeHidden(); // < 480 px ẩn tên
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator('.lesson-panel')).toBeVisible();
  await expect(page.locator('.lesson-strip')).toBeHidden();
  await expect(page.locator('.session-bar .title')).toHaveText('Hiến pháp là gì');
});

test('trả lời sai → màn kết thúc có "Xem lại câu sai", bấm tên khái niệm mở danh mục đúng mục', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(B + '#/hoc/hien-phap/hp-1');
  let wrongDone = false;
  for (let i = 0; i < 30; i++) {
    await page.locator('.session-end, .question, article[aria-label="Thẻ giới thiệu khái niệm"]').first().waitFor();
    if (await page.locator('.session-end').isVisible()) break;
    if (await page.getByRole('button', { name: /Đã hiểu/ }).isVisible()) { await page.getByRole('button', { name: /Đã hiểu/ }).click(); continue; }
    const q = (await page.locator('.question').textContent())!.trim();
    const t = await page.locator('.opt').allTextContents();
    const right = t.findIndex((x) => x.includes(correctOf(q)));
    await page.locator('.opt').nth(wrongDone ? right : (right + 1) % t.length).click();
    wrongDone = true;
    await page.getByRole('button', { name: /Câu tiếp|Xem kết quả/ }).click();
  }
  const mistakes = page.locator('.mistakes');
  await expect(mistakes).toContainText('Xem lại câu sai (1)');
  await expect(mistakes).toContainText('Đáp án:');
  await mistakes.locator('.kicker a').click();
  await expect(page).toHaveURL(/#\/mon\/hien-phap\/khai-niem\/[a-z-]+$/);
  await expect(page.locator('.concept-entry.open .quote')).toBeVisible();
});
