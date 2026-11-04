import { expect, test } from '@playwright/test';
const B = process.env.BASE_PATH ?? '/';
import { readdirSync, readFileSync } from 'node:fs';

const dir = '../../packages/content/data/concepts/hien-phap';
const concepts = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
const longestSeg = (t: string) => t.split(/\[…\]|…|\.\.\./).map(norm).sort((x, y) => y.length - x.length)[0] ?? '';
/**
 * Chỉ số phương án đúng của câu đang hỏi, tra từ dữ liệu nội dung: câu có sẵn trong dữ liệu, hoặc câu sinh tự động
 * (định nghĩa → thuật ngữ, thuật ngữ → định nghĩa, ví dụ → khái niệm). -1 nếu không tra được (khi đó test chỉ cần đi tiếp).
 */
function rightIndex(question: string, opts: string[]): number {
  const q = norm(question);
  for (const c of concepts) for (const it of c.items) if ('options' in it && norm(it.q) === q) return opts.findIndex((o) => o.includes(it.options[it.answer]));
  const dt = q.match(/^«(.+)» Định nghĩa trên là của khái niệm nào\?$/);
  if (dt) { const seg = longestSeg(dt[1]); const c = seg.length > 10 ? concepts.find((x) => norm(x.definition).includes(seg)) : undefined; return c ? opts.findIndex((o) => o.includes(c.term)) : -1; }
  const ex = q.match(/^«(.+)» Tình huống trên minh hoạ cho khái niệm nào\?$/);
  if (ex) { const c = concepts.find((x) => norm(x.example).includes(longestSeg(ex[1]))); return c ? opts.findIndex((o) => o.includes(c.term)) : -1; }
  const td = q.match(/^Đâu là định nghĩa của «(.+)»\?$/);
  if (td) { const c = concepts.find((x) => x.term === td[1]); if (!c) return -1; return opts.findIndex((o) => { const seg = longestSeg(o); return seg.length > 10 && norm(c.definition).includes(seg); }); }
  return -1;
}
type P = import('@playwright/test').Page;
/** Trả lời câu trắc nghiệm đang hiện: `want` = 'right' | 'wrong' | 'any'. Trả về true nếu biết chắc đã chọn đúng. */
async function answerMcq(page: P, want: 'right' | 'wrong' | 'any'): Promise<boolean | null> {
  const q = (await page.locator('.question').textContent())!;
  const t = await page.locator('.opt').allTextContents();
  const right = rightIndex(q, t);
  if (right < 0) { await page.locator('.opt').first().click(); return null; }
  const k = want === 'wrong' ? (right + 1) % t.length : right;
  await page.locator('.opt').nth(k).click();
  return want !== 'wrong';
}
/** Làm một bước bất kỳ của phiên: intro, trắc nghiệm, hoặc dạng khác (bấm phương án/đi tiếp). */
async function stepOnce(page: P, want: 'right' | 'wrong' | 'any' = 'right'): Promise<boolean | null> {
  const label = await page.locator('article').first().getAttribute('aria-label');
  if (label === 'Thẻ giới thiệu khái niệm') { await page.getByRole('button', { name: /Đã hiểu/ }).click(); return null; }
  if (label === 'Trắc nghiệm' || label === 'Tình huống') { const r = await answerMcq(page, want); await page.locator('.feedback').waitFor(); return r; }
  // dạng khác (đúng/sai, điền chỗ trống, ghép cặp, xếp cột, tự trả lời): trả lời đại, test chỉ cần đi hết phiên
  if (label === 'Nhận định đúng sai') { await page.locator('.opt').first().click(); await page.locator('.feedback').waitFor(); return null; }
  for (let k = 0; k < 40 && !(await page.locator('.feedback').count()); k++) {
    const sort = page.locator('.sort-pick:not([disabled])'), pair = page.locator('.opt:not([disabled]):not(.match-cell)'), term = page.locator('.match-cell:not(.desc):not([disabled])');
    if (label === 'Xếp tình huống' && await sort.count()) await sort.first().click();
    else if (label === 'Phân biệt' && await pair.count()) await pair.first().click();
    else if (label === 'Ghép cặp' && await term.count()) { await term.first().click(); await page.locator('.match-cell.desc:not([disabled])').first().click(); }
    else if (label === 'Điền chỗ trống') {
      const inputs = page.locator('.blank-input');
      if (await inputs.count()) { for (let j = 0; j < await inputs.count(); j++) await inputs.nth(j).fill('x'); } else { for (let j = 0; j < 8; j++) { const w = page.locator('.word:not([disabled])'); if (await w.count()) await w.first().click(); } }
      await page.getByRole('button', { name: /Kiểm tra/ }).click();
    } else if (label === 'Tự trả lời') { await page.locator('textarea').fill('thử'); await page.getByRole('button', { name: 'Xem đáp án' }).click(); await page.getByRole('button', { name: 'Đúng', exact: true }).click(); }
    await page.waitForTimeout(250);
  }
  await page.locator('.feedback').waitFor();
  return null;
}

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
  // đi tới câu đầu tiên tra được đáp án đúng (từ dữ liệu), trả lời đúng → phản hồi "đúng"
  let sure: boolean | null = null;
  for (let i = 0; i < 20 && !sure; i++) {
    await page.locator('.question, article[aria-label="Thẻ giới thiệu khái niệm"]').first().waitFor();
    sure = await stepOnce(page, 'right');
    if (sure === null && !(await page.locator('.feedback').count())) continue;
    if (sure) await expect(page.locator('.feedback.ok')).toBeVisible();
    else { await expect(page.locator('.feedback')).toBeVisible(); await page.getByRole('button', { name: /Câu tiếp|Xem kết quả/ }).click(); }
  }
  expect(sure).toBe(true);
  // tải lại giữa phiên → tiến độ câu đã trả lời phải còn
  await page.reload();
  const levels = await readLevels(page);
  expect(Object.values(levels).some((l) => l >= 1)).toBe(true);
  // vào lại: pass vẫn là 1 vì khái niệm còn lại ở bậc 0
  await expect(page.getByRole('article', { name: 'Thẻ giới thiệu khái niệm' })).toBeVisible();
  // chạy hết phiên (kể cả vòng sửa sai nếu có)
  for (let i = 0; i < 80; i++) {
    await page.locator('.session-end, .question-card, article[aria-label="Thẻ giới thiệu khái niệm"]').first().waitFor();
    if (await page.locator('.session-end').isVisible()) break;
    await stepOnce(page, 'right');
    const next = page.getByRole('button', { name: /Câu tiếp|Xem kết quả/ });
    if (await next.count()) await next.click();
  }
  await expect(page.locator('.session-end')).toBeVisible();
  await expect(page.locator('.session-end')).toContainText('XP');
  await expect(page.getByRole('button', { name: 'Về Hôm nay' })).toBeVisible();
  // lần đầu chuỗi tăng trong ngày: thẻ chuyên cần phóng toàn màn hình, số đổi 0 → 1 rồi đóng bằng Esc
  const ig = page.getByRole('dialog', { name: 'Thắp chuỗi 1 ngày' });
  await expect(ig).toBeVisible();
  await expect(ig.getByRole('button', { name: 'Tiếp tục' })).toBeFocused();
  await expect(ig.locator('.cg-count').last()).toHaveText('1', { timeout: 4000 });
  await page.keyboard.press('Escape');
  await expect(ig).toHaveCount(0);
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
  // Tên đợt hp-1 lấy từ dữ liệu môn, không gõ tay.
  const hpSubject = JSON.parse(readFileSync('../../packages/content/data/subjects/hien-phap.json', 'utf8'));
  const hp1Title = hpSubject.chapters.flatMap((c: any) => c.lessons).find((l: any) => l.id === 'hp-1').title;
  await expect(page.locator('.session-bar .title')).toHaveText(hp1Title);
});

test('trả lời sai → màn kết thúc có "Xem lại câu sai", bấm tên khái niệm mở danh mục đúng mục', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(B + '#/hoc/hien-phap/hp-1');
  let wrongDone = false;
  for (let i = 0; i < 80; i++) {
    await page.locator('.session-end, .question-card, article[aria-label="Thẻ giới thiệu khái niệm"]').first().waitFor();
    if (await page.locator('.session-end').isVisible()) break;
    // cố ý sai đúng một câu tra được đáp án; còn lại trả lời đúng/đại cho tới hết (kể cả vòng sửa sai)
    const r = await stepOnce(page, wrongDone ? 'right' : 'wrong');
    if (!wrongDone && r === false) wrongDone = true;
    const next = page.getByRole('button', { name: /Câu tiếp|Xem kết quả/ });
    if (await next.count()) await next.click();
  }
  expect(wrongDone).toBe(true);
  await page.getByRole('dialog', { name: /Thắp chuỗi/ }).getByRole('button', { name: 'Tiếp tục' }).click(); // màn thắp chuỗi lần đầu trong ngày
  const mistakes = page.locator('.mistakes');
  await expect(mistakes).toContainText(/Xem lại câu sai \([1-9]/);
  await expect(mistakes).toContainText('Đáp án:');
  await mistakes.locator('.kicker a').first().click();
  await expect(page).toHaveURL(/#\/mon\/hien-phap\/khai-niem\/[a-z-]+$/);
  await expect(page.locator('.concept-entry.open .quote')).toBeVisible();
});
