import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR } from '../src/build';

// Đợt 6 (haiku 2): chặn tái phạm lỗi "đáp án đúng là phương án dài nhất".
// Quy tắc: mọi câu trắc nghiệm có phương án nhiễu dài nhất ≥ 85 % đáp án đúng;
// tỉ lệ "đúng là dài nhất duy nhất" ≤ 35 %.
// Danh sách môn ở đây là các môn đã viết lại trên nhánh này; khi gộp haiku-1, haiku-3,
// người điều phối mở rộng sang đủ 24 đơn vị (23 môn + pldc: bộ đề không có thư mục).
const DONE_UNITS = [
  'tai-chinh',
  'tai-chinh-doanh-nghiep',
  'xay-dung-vbpl',
  'thuong-mai-1',
  'hinh-su',
  'hanh-chinh',
  'hien-phap',
];

const nfc = (s: string) => s.normalize('NFC');
const len = (s: string) => [...nfc(s)].length;

type Mcq = { where: string; options: string[]; answer: number };

// Bộ đề gắn với môn theo tiền tố tên file (dài nhất thắng); không khớp thì theo trường group.
function unitOfSet(fname: string, group: string, dirs: string[]): string {
  const stem = fname.replace(/\.json$/, '');
  if (group === 'pldc') return 'pldc';
  let best: string | null = null;
  for (const d of dirs) {
    if ((stem === d || stem.startsWith(d + '-')) && (best === null || d.length > best.length)) best = d;
  }
  return best ?? group;
}

function collect(): Map<string, Mcq[]> {
  const conceptDir = join(DATA_DIR, 'concepts');
  const dirs = readdirSync(conceptDir);
  const byUnit = new Map<string, Mcq[]>();
  const push = (unit: string, m: Mcq) => {
    if (!byUnit.has(unit)) byUnit.set(unit, []);
    byUnit.get(unit)!.push(m);
  };
  for (const d of dirs) {
    for (const f of readdirSync(join(conceptDir, d)).filter((x) => x.endsWith('.json'))) {
      const c = JSON.parse(readFileSync(join(conceptDir, d, f), 'utf8'));
      (c.items as { type: string; q: string; options?: string[]; answer?: number }[]).forEach((it, i) => {
        if ((it.type === 'mcq' || it.type === 'case') && it.options) {
          push(d, { where: `concepts/${d}/${f}#${i}`, options: it.options, answer: it.answer! });
        }
      });
    }
  }
  const setDir = join(DATA_DIR, 'sets');
  for (const f of readdirSync(setDir).filter((x) => x.endsWith('.json'))) {
    const s = JSON.parse(readFileSync(join(setDir, f), 'utf8'));
    const unit = unitOfSet(f, s.group, dirs);
    (s.questions as { options: string[]; answer: number }[]).forEach((q, i) => {
      push(unit, { where: `sets/${f}#${i}`, options: q.options, answer: q.answer });
    });
  }
  return byUnit;
}

describe('phương án nhiễu không lộ đáp án đúng (đợt 6)', () => {
  const byUnit = collect();
  const items = DONE_UNITS.flatMap((u) => (byUnit.get(u) ?? []).map((m) => ({ unit: u, ...m })));

  it('mỗi môn đã viết lại đều có câu để kiểm', () => {
    for (const u of DONE_UNITS) expect(byUnit.get(u)?.length ?? 0).toBeGreaterThan(0);
  });

  it('mọi câu: phương án nhiễu dài nhất ≥ 85 % đáp án đúng', () => {
    const bad = items.filter((m) => {
      const c = len(m.options[m.answer]);
      const longestDistractor = Math.max(...m.options.filter((_, i) => i !== m.answer).map(len));
      return longestDistractor < 0.85 * c;
    });
    expect(bad.map((m) => m.where)).toEqual([]);
  });

  it('tỉ lệ "đáp án đúng là phương án dài nhất duy nhất" ≤ 35 %', () => {
    const uniqueLongest = items.filter((m) => {
      const c = len(m.options[m.answer]);
      return m.options.every((o, i) => i === m.answer || len(o) < c);
    });
    expect(uniqueLongest.length / items.length).toBeLessThanOrEqual(0.35);
  });
});
