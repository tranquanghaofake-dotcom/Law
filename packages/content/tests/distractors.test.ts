import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR } from '../src/build';

// Đợt 6: chặn tái phạm các mẹo đoán đáp án từ hình thức phương án (không cần biết luật).
// Áp cho cả 24 đơn vị (23 môn + pldc: bộ đề không có thư mục khái niệm).
// Ngưỡng đặt theo số liệu sau khi sửa (03/11/2026), có chừa ít khoảng; số đo lúc đặt ghi cạnh từng ngưỡng.
//
// 1. Đáp án đúng được dài nhất nhưng không dài hơn nhiễu dài nhất quá 10 % (đo lúc đặt: 0 câu vi phạm).
// 2. Thứ hạng độ dài của đáp án đúng (1 = dài nhất), khi hòa độ dài thì chia đều các hạng hòa:
//    toàn kho mỗi hạng 18–32 % (đo: 24,5 / 31,9 / 20,6 / 23,0 %); mỗi đơn vị ≥ 40 câu không hạng nào > 50 %.
//    Không tính hòa là "dài nhất" vì người đoán theo độ dài không có lợi thế khi các phương án bằng nhau.
// 3. Nhiễu dài nhất > 1,3 × đáp án: chỉ xét đáp án ≥ 20 ký tự (tên cơ quan, con số ngắn tự nhiên chênh lệch):
//    ≤ 3 % toàn kho (đo: 46/1 917 = 2,4 %). Tính cả đáp án ngắn: ≤ 18 % (đo: 17,1 %), chỉ để không tăng thêm.
// 4. Từ tuyệt đối ("Mọi", "Chỉ", "Luôn", "Không bao giờ", "trong mọi trường hợp"…): câu có ≥ 2 nhiễu dùng
//    từ tuyệt đối trong khi đáp án đúng không có ≤ 4,5 % toàn kho (đo: 4,2 %; trước đợt 6: 9 %).
//    Còn lại chủ yếu là câu hỏi tập hợp ("gồm những ai") — bỏ "Chỉ" sẽ làm nhiễu đúng một phần.
// 5. Đuôi chữ độn ("… nào", "… đó", "hiện nay", "ngay lập tức"…): tỉ lệ ở nhiễu không vượt tỉ lệ ở đáp án
//    đúng quá 15 điểm % trong mỗi đơn vị, quá 3 điểm % toàn kho (đo: 1,9 % so với 1,6 %).
// 6. Không có cụm 2 tiếng lặp liền nhau ("hiện hành hiện hành"); lặp 1 tiếng chỉ được ở các trường hợp
//    hợp lệ của tiếng Việt ("hành vi vi phạm", "năm năm", "chỉ chỉ dẫn địa lý", "nhà đầu tư tư nhân"…).

const nfc = (s: string) => s.normalize('NFC');
const len = (s: string) => [...nfc(s)].length;

type Mcq = { unit: string; where: string; options: string[]; answer: number };

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

function collect(): Mcq[] {
  const conceptDir = join(DATA_DIR, 'concepts');
  const dirs = readdirSync(conceptDir);
  const out: Mcq[] = [];
  for (const d of dirs) {
    for (const f of readdirSync(join(conceptDir, d)).filter((x) => x.endsWith('.json'))) {
      const c = JSON.parse(readFileSync(join(conceptDir, d, f), 'utf8'));
      (c.items as { type: string; options?: string[]; answer?: number }[]).forEach((it, i) => {
        if ((it.type === 'mcq' || it.type === 'case') && it.options) out.push({ unit: d, where: `concepts/${d}/${f}#${i}`, options: it.options, answer: it.answer! });
      });
    }
  }
  const setDir = join(DATA_DIR, 'sets');
  for (const f of readdirSync(setDir).filter((x) => x.endsWith('.json'))) {
    const s = JSON.parse(readFileSync(join(setDir, f), 'utf8'));
    const unit = unitOfSet(f, s.group, dirs);
    (s.questions as { options: string[]; answer: number }[]).forEach((q, i) => out.push({ unit, where: `sets/${f}#${i}`, options: q.options, answer: q.answer }));
  }
  return out;
}

const items = collect();
const units = [...new Set(items.map((m) => m.unit))].sort();
const distractors = (m: Mcq) => m.options.filter((_, i) => i !== m.answer);
const correct = (m: Mcq) => m.options[m.answer];

/** Phân bố thứ hạng độ dài của đáp án đúng (chia đều khi hòa), theo %. */
function rankShare(ms: Mcq[]): number[] {
  const share = [0, 0, 0, 0];
  for (const m of ms) {
    const c = len(correct(m));
    const ds = distractors(m).map(len);
    const longer = ds.filter((x) => x > c).length;
    const equal = ds.filter((x) => x === c).length;
    for (let r = longer; r <= longer + equal; r++) share[r] += 1 / (equal + 1);
  }
  return share.map((x) => (100 * x) / ms.length);
}

const ABS = /^(mọi|chỉ|luôn|không bao giờ|tất cả|bất kỳ|hoàn toàn|tuyệt đối)(?![\p{L}])|(?<![\p{L}])(trong mọi trường hợp|không có ngoại lệ|bất kể|tuyệt đối|luôn luôn)(?![\p{L}])/iu;
const TAIL = /[\s,](cụ thể|hiện hành|hiện nay|đó|nào|nào cả|nào khác|ngay lập tức|nhất định|khác nhất định|nói chung)\.?$/iu;
const REP2 = /(?<![\p{L}])(\p{L}+\s+\p{L}+)\s+\1(?![\p{L}])/iu;
const REP1 = /(?<![\p{L}])(\p{L}+)\s+\1(?![\p{L}])/giu;
const REP2_OK = new Set(['khởi kiện']); // "người khởi kiện khởi kiện khi…"
const REP1_OK = new Set(['vi', 'năm', 'chỉ', 'người', 'ngày', 'từng', 'luôn', 'chứng', 'phạm', 'song', 'dịch', 'tư']);

describe('phương án nhiễu không để lộ đáp án qua hình thức (đợt 6, 24 đơn vị)', () => {
  it('đủ 24 đơn vị, mỗi đơn vị có câu trắc nghiệm', () => {
    expect(units.length).toBe(24);
    for (const u of units) expect(items.filter((m) => m.unit === u).length).toBeGreaterThan(0);
  });

  it('đáp án đúng không dài hơn nhiễu dài nhất quá 10 %', () => {
    const bad = items.filter((m) => len(correct(m)) > 1.1 * Math.max(...distractors(m).map(len)));
    expect(bad.map((m) => m.where)).toEqual([]);
  });

  it('thứ hạng độ dài của đáp án đúng cân bằng: toàn kho mỗi hạng 18–32 %', () => {
    const share = rankShare(items);
    for (const s of share) {
      expect(s).toBeGreaterThanOrEqual(18);
      expect(s).toBeLessThanOrEqual(32);
    }
  });

  it('mỗi đơn vị ≥ 40 câu: không hạng độ dài nào chiếm quá 50 %', () => {
    const bad = units.flatMap((u) => {
      const ms = items.filter((m) => m.unit === u);
      if (ms.length < 40) return [];
      const share = rankShare(ms);
      return share.some((s) => s > 50) ? [`${u}: ${share.map((s) => s.toFixed(0)).join('/')}`] : [];
    });
    expect(bad).toEqual([]);
  });

  it('tỉ lệ "đúng là dài nhất duy nhất" ≤ 35 %', () => {
    const unique = items.filter((m) => distractors(m).every((d) => len(d) < len(correct(m))));
    expect(unique.length / items.length).toBeLessThanOrEqual(0.35);
  });

  it('nhiễu dài nhất > 1,3 × đáp án đúng: ≤ 3 % với đáp án ≥ 20 ký tự, ≤ 18 % tính cả đáp án ngắn', () => {
    const over = (m: Mcq) => Math.max(...distractors(m).map(len)) > 1.3 * len(correct(m));
    const long = items.filter((m) => len(correct(m)) >= 20);
    expect(long.filter(over).length / items.length).toBeLessThanOrEqual(0.03);
    expect(items.filter(over).length / items.length).toBeLessThanOrEqual(0.18);
  });

  it('câu có ≥ 2 nhiễu dùng từ tuyệt đối (đáp án đúng không có) ≤ 4,5 %', () => {
    const bad = items.filter((m) => !ABS.test(correct(m)) && distractors(m).filter((d) => ABS.test(d)).length >= 2);
    expect(bad.length / items.length).toBeLessThanOrEqual(0.045);
  });

  it('đuôi chữ độn ở nhiễu không vượt đáp án đúng quá 15 điểm % mỗi đơn vị, 3 điểm % toàn kho', () => {
    const gap = (ms: Mcq[]) => {
      const d = ms.flatMap(distractors);
      return (100 * d.filter((x) => TAIL.test(x)).length) / d.length - (100 * ms.filter((m) => TAIL.test(correct(m))).length) / ms.length;
    };
    const bad = units.filter((u) => gap(items.filter((m) => m.unit === u)) > 15);
    expect(bad).toEqual([]);
    expect(gap(items)).toBeLessThanOrEqual(3);
  });

  it('không có từ lặp liền nhau trong phương án (trừ các trường hợp hợp lệ của tiếng Việt)', () => {
    const bad = items.flatMap((m) => m.options.flatMap((o) => {
      const two = REP2.exec(o);
      if (two && !REP2_OK.has(two[1].toLowerCase())) return [`${m.where}: ${o}`];
      const one = [...o.matchAll(REP1)].filter((x) => !REP1_OK.has(x[1].toLowerCase()));
      return one.length ? [`${m.where}: ${o}`] : [];
    }));
    expect(bad).toEqual([]);
  });
});
