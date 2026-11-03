import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR } from '../src/build';

// Đợt 7: chặn tái phạm ở câu Phân biệt (`pair`) và dấu "⚠" lọt vào chữ hiển thị.
//
// 1. Mọi câu `pair` có ≥ 4 tình huống, đủ cả hai bên (trái và phải).
// 2. Không có "⚠" trong chữ hiển thị: q, options, statement, text, cases[].text, explain, model, pairs[].text
//    (ghi chú cho người xem dữ liệu đặt ở `basis` hoặc bảng docs/review, không đặt trong chữ học viên đọc).
// 3. Tình huống lặp nguyên tên nhãn đúng (lộ đáp án): nhãn (bỏ phần trong ngoặc đơn, chuẩn hoá chữ thường/NFC,
//    bỏ dấu câu) dài ≥ 6 ký tự nằm nguyên trong tình huống. Toàn kho LEAK_MAX; mỗi môn không quá LEAK_SUBJECT_MAX
//    (ngoài môn nằm trong LEAK_LEGACY là các môn chưa làm lại tình huống, đo 03/11/2026).
//    Đo lúc đặt: xem hằng số bên dưới. Ngưỡng chỉ được GIẢM khi sửa thêm — đừng nới.

const norm = (s: string): string =>
  s.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
const core = (label: string): string => norm(label.replace(/\([^)]*\)/g, ''));

type Case = { text: string; answer: 'left' | 'right' };
type Item = Record<string, unknown> & { type: string };
type Concept = { id: string; subject: string; items: Item[] };

function loadConcepts(): Concept[] {
  const dir = join(DATA_DIR, 'concepts');
  const out: Concept[] = [];
  for (const sub of readdirSync(dir)) {
    for (const f of readdirSync(join(dir, sub))) {
      if (f.endsWith('.json')) out.push(JSON.parse(readFileSync(join(dir, sub, f), 'utf8')) as Concept);
    }
  }
  return out;
}
const concepts = loadConcepts();
const pairs = concepts.flatMap((c) => c.items.filter((i) => i.type === 'pair').map((i) => ({ c, i })));

/** Các môn còn tình huống lặp nhãn từ trước đợt 7 (chưa được viết lại) — giữ ngưỡng đo được, siết dần. */
// Đã siết sau khi sonnet A, C sửa (03/11/2026): toàn kho 206 → 4 (tai-chinh 2, lao-dong-2 1, tai-san-tri-tue 1).
const LEAK_LEGACY: Record<string, number> = {};
const LEAK_SUBJECT_MAX = 2;
const LEAK_MAX = 4;

function leaks(): { subject: string; id: string; text: string }[] {
  const out: { subject: string; id: string; text: string }[] = [];
  for (const { c, i } of pairs) {
    const left = String(i.left), right = String(i.right);
    for (const cs of i.cases as Case[]) {
      const lab = core(cs.answer === 'left' ? left : right);
      if (lab.length >= 6 && norm(cs.text).includes(lab)) out.push({ subject: c.subject, id: c.id, text: cs.text });
    }
  }
  return out;
}

describe('câu Phân biệt (pair)', () => {
  it('mỗi câu có ≥ 4 tình huống, đủ hai bên', () => {
    const bad = pairs.filter(({ i }) => {
      const cs = i.cases as Case[];
      return cs.length < 4 || new Set(cs.map((x) => x.answer)).size < 2;
    }).map(({ c }) => c.id);
    expect(bad).toEqual([]);
  });

  it('không có "⚠" trong chữ hiển thị', () => {
    const shown = ['q', 'statement', 'text', 'explain', 'model'];
    const bad: string[] = [];
    for (const c of concepts) {
      c.items.forEach((it, k) => {
        const where = `${c.id}#${k}`;
        for (const key of shown) if (typeof it[key] === 'string' && (it[key] as string).includes('⚠')) bad.push(`${where}.${key}`);
        for (const o of (it.options as string[] | undefined) ?? []) if (o.includes('⚠')) bad.push(`${where}.options`);
        for (const cs of (it.cases as Case[] | undefined) ?? []) if (cs.text.includes('⚠')) bad.push(`${where}.cases`);
        for (const p of (it.pairs as { text: string }[] | undefined) ?? []) if (p.text.includes('⚠')) bad.push(`${where}.pairs`);
      });
    }
    expect(bad).toEqual([]);
  });

  it('tình huống nhắc nguyên tên nhãn đúng: toàn kho và từng môn không vượt ngưỡng', () => {
    const l = leaks();
    expect(l.length).toBeLessThanOrEqual(LEAK_MAX);
    const by = new Map<string, number>();
    for (const x of l) by.set(x.subject, (by.get(x.subject) ?? 0) + 1);
    const over = [...by].filter(([s, n]) => n > (LEAK_LEGACY[s] ?? LEAK_SUBJECT_MAX));
    expect(over).toEqual([]);
  });
});
