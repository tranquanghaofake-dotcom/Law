import { describe, expect, it } from 'vitest';
import type { Subject } from '$lib/content/types';
import type { BookLevel, BookRec } from '$lib/game/books';
import { SHELVES, orderedSubjects } from '$lib/ui/shelves';
import { bookcaseRows, spineColor, spineFont, spineSize, SPINE_W, SPINE_H } from '$lib/ui/bookcase';
import { coverFor } from '$lib/art/covers';

// 23 môn thật (số chương / số khái niệm lấy từ nội dung hiện có)
const REAL: Record<string, [number, number]> = {
  'an-sinh-xa-hoi': [6, 12], 'canh-tranh': [7, 16], 'chung-khoan': [10, 100], 'dan-su-2': [13, 26], 'dan-su': [13, 24], 'dat-dai': [8, 19], 'dau-tu': [7, 19],
  'hanh-chinh': [15, 30], 'hien-phap': [12, 101], 'hinh-su': [15, 34], 'lao-dong-2': [5, 12], 'lao-dong': [9, 25], 'lich-su-nn-pl': [4, 59], 'ly-luan-nn-pl': [8, 30],
  'ngan-hang': [7, 21], 'so-huu-tri-tue': [14, 23], 'tai-chinh-doanh-nghiep': [5, 18], 'tai-chinh': [13, 18], 'tai-san-tri-tue': [5, 20], 'thuong-mai-1': [13, 25],
  'thuong-mai': [8, 22], 'to-tung-dan-su': [9, 16], 'xay-dung-vbpl': [6, 20],
};
const subjects = (ids: string[] = Object.keys(REAL)): Subject[] => ids.map((id) => {
  const [ch, n] = REAL[id] ?? [3, 9];
  const per = Math.ceil(n / ch);
  return { id, title: 'Luật ' + id, short: id, chapters: Array.from({ length: ch }, (_, i) => ({ id: `c${i + 1}`, title: `Chương ${i + 1}`, lessons: [{ id: `l${i}`, title: 'L', concepts: Array.from({ length: per }, (_, k) => `${id}-${i}-${k}`) }] })) };
});
const rec = (subject: string, i: number, level: BookLevel, needsReview = false): BookRec => ({
  key: `${subject}/c${i}`, subject, subjectTitle: subject, subjectShort: subject, chapter: `c${i}`, title: `Chương ${i}`, index: i, field: 'hien-phap', level, current: level, needsReview, at: null,
});
const allRows = (rows: ReturnType<typeof bookcaseRows>) => rows.flatMap((r) => r.bays.flatMap((b) => b.books));

describe('chia tầng tủ sách (bookcaseRows)', () => {
  it('23 môn vào 4–5 tầng, mỗi tầng 1–2 kệ nhóm ngành, mỗi môn đúng một lần, giữ thứ tự chương trình', () => {
    const subs = subjects();
    const rows = bookcaseRows(subs, []);
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(rows.length).toBeLessThanOrEqual(5);
    for (const r of rows) { expect(r.bays.length).toBeGreaterThanOrEqual(1); expect(r.bays.length).toBeLessThanOrEqual(2); }
    const ids = allRows(rows).map((b) => b.id);
    expect(ids).toHaveLength(23);
    expect(new Set(ids).size).toBe(23);
    expect(ids).toEqual(orderedSubjects(subs).map((s) => s.id));
  });
  it('mỗi kệ giữ tên và màu của SHELVES; không tách một kệ nhóm ngành sang hai tầng', () => {
    const rows = bookcaseRows(subjects(), []);
    const bays = rows.flatMap((r) => r.bays);
    expect(bays.map((b) => b.shelfId)).toEqual(SHELVES.map((s) => s.id));
    for (const b of bays) { const s = SHELVES.find((x) => x.id === b.shelfId)!; expect(b.name).toBe(s.name); expect(b.color).toBe(s.color); }
  });
  it('cân độ rộng: tầng rộng nhất sát kệ rộng nhất (không thể hẹp hơn nhiều); tổng độ rộng = tổng các gáy', () => {
    const rows = bookcaseRows(subjects(), []);
    const widths = rows.map((r) => r.width);
    const widestBay = Math.max(...rows.flatMap((r) => r.bays.map((b) => b.width)));
    expect(Math.max(...widths)).toBeLessThanOrEqual(widestBay * 1.1);
    expect(Math.max(...widths) / Math.min(...widths)).toBeLessThan(2.2);
    for (const r of rows) expect(r.width).toBeCloseTo(r.bays.reduce((n, b) => n + b.width, 0), 5);
  });
  it('có thể chọn số tầng; ít kệ hơn số tầng thì mỗi kệ một tầng', () => {
    expect(bookcaseRows(subjects(), [], { tiers: 4 })).toHaveLength(4);
    expect(bookcaseRows(subjects(['hien-phap', 'hinh-su']), [])).toHaveLength(2);
    expect(bookcaseRows([], [])).toEqual([]);
  });
  it('môn chưa có trong SHELVES vẫn hiện, ở kệ "Khác" cuối cùng', () => {
    const rows = bookcaseRows(subjects(['hien-phap', 'mon-la']), []);
    const bays = rows.flatMap((r) => r.bays);
    expect(bays.at(-1)?.shelfId).toBe('khac');
    expect(allRows(rows).map((b) => b.id)).toEqual(['hien-phap', 'mon-la']);
  });
  it('kích thước gáy: cao theo số chương, dày theo số khái niệm, có chặn min/max', () => {
    expect(spineSize(4, 12).h).toBeLessThan(spineSize(15, 12).h);
    expect(spineSize(8, 12).w).toBeLessThan(spineSize(8, 100).w);
    for (const [c, n] of [[1, 1], [40, 900], [8, 30]] as const) {
      const s = spineSize(c, n);
      expect(s.w).toBeGreaterThanOrEqual(SPINE_W[0]); expect(s.w).toBeLessThanOrEqual(SPINE_W[1]);
      expect(s.h).toBeGreaterThanOrEqual(SPINE_H[0]); expect(s.h).toBeLessThanOrEqual(SPINE_H[1]);
    }
  });
  it('mức sáng = tỉ lệ sách chương đã nhận; cờ "cần ôn" và số cấp 3 theo sách của môn', () => {
    const subs = subjects(['hinh-su', 'hien-phap']);
    const books = [...Array.from({ length: 5 }, (_, i) => rec('hinh-su', i + 1, i < 3 ? 3 : 0)), rec('hien-phap', 1, 1, true)];
    const [hs, hp] = allRows(bookcaseRows(subs, books));
    expect(hs.id).toBe('hien-phap');
    const hinhSu = [hs, hp].find((b) => b.id === 'hinh-su')!;
    const hienPhap = [hs, hp].find((b) => b.id === 'hien-phap')!;
    expect(hinhSu).toMatchObject({ got: 3, total: 15, level3: 3, needsReview: false });
    expect(hinhSu.lit).toBeCloseTo(3 / 15, 5);
    expect(hienPhap).toMatchObject({ got: 1, total: 12, needsReview: true });
    const empty = allRows(bookcaseRows(subs, []));
    expect(empty.every((b) => b.lit === 0 && b.got === 0)).toBe(true);
  });
});

const sat = (hex: string) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const l = (mx + mn) / 2; return mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1)); };

describe('màu và chữ gáy (khớp bìa sách thật)', () => {
  it('gáy lấy màu thân bìa của môn, độ bão hoà ≥ .6, mỗi môn một màu riêng theo bìa', () => {
    const books = allRows(bookcaseRows(subjects(), []));
    for (const b of books) { const s = sat(b.color); expect(s < 0.05 || s >= 0.59, b.id).toBe(true); } // bìa xám thật (Hình sự) giữ trung tính
    const hp = books.find((b) => b.id === 'hien-phap')!;
    expect(hp.color).toBe(spineColor(coverFor('hien-phap', 'Luật ' + 'hien-phap', '#9E2A22').palette.body));
    expect(hp.color).not.toBe(books.find((b) => b.id === 'ly-luan-nn-pl')!.color);
  });
  it('spineColor: nâng bão hoà, giữ sắc độ; màu đã đủ bão hoà hoặc xám thì giữ nguyên', () => {
    expect(spineColor('#808080')).toBe('#808080');
    expect(spineColor('#0B2468')).toBe('#0b2468');
    expect(sat(spineColor('#44505C'))).toBeGreaterThanOrEqual(0.59);
  });
  it('spineFont: tên ngắn dùng cỡ tối đa, tên dài co nhỏ nhưng không dưới 6 — luôn giữ nguyên chữ (không cắt)', () => {
    expect(spineFont('Hiến', 100)).toBe(8.5);
    const long = spineFont('Lý luận NN&PL', 64);
    expect(long).toBeLessThan(8.5);
    expect(long).toBeGreaterThanOrEqual(6);
    expect(spineFont('x'.repeat(40), 64)).toBe(6);
  });
});
