import { describe, expect, it } from 'vitest';
import type { Subject } from '$lib/content/types';
import { chapterLevel, collectBooks, mergeStored } from '$lib/game/books';
import { fieldOf, FIELDS } from '$lib/game/fields';

const hp: Subject = { id: 'hien-phap', title: 'Luật Hiến pháp', short: 'Hiến pháp', chapters: [
  { id: 'c7-quoc-hoi', title: 'Chương 7. Quốc hội', lessons: [{ id: 'l1', title: 'L', concepts: ['a', 'b'] }, { id: 'l2', title: 'L2', concepts: ['c'] }] },
  { id: 'c9-chinh-phu', title: 'Chương 9. Chính phủ', lessons: [{ id: 'l3', title: 'L', concepts: ['d'] }] },
] };

describe('sách theo chương', () => {
  it('cấp theo bậc thấp nhất của chương: ≥3 → 1, ≥5 → 2, =6 → 3', () => {
    expect(chapterLevel(['a', 'b'], { a: 6, b: 2 })).toBe(0);
    expect(chapterLevel(['a', 'b'], { a: 6, b: 3 })).toBe(1);
    expect(chapterLevel(['a', 'b'], { a: 5, b: 6 })).toBe(2);
    expect(chapterLevel(['a', 'b'], { a: 6, b: 6 })).toBe(3);
    expect(chapterLevel([], {})).toBe(0);
  });
  it('mỗi chương một sách, gắn lĩnh vực; khái niệm chưa học tính bậc 0', () => {
    const books = collectBooks([hp], { a: 3, b: 4, c: 5, d: 6 }, {});
    expect(books.map((b) => [b.key, b.level, b.field])).toEqual([['hien-phap/c7-quoc-hoi', 1, 'lap-phap'], ['hien-phap/c9-chinh-phu', 3, 'hanh-phap']]);
  });
  it('sách giữ cấp cao nhất đã đạt; tụt bậc chỉ bật cờ "cần ôn"', () => {
    const stored = { 'hien-phap/c7-quoc-hoi': { level: 3 as const, at: '2026-11-01' } };
    const [b] = collectBooks([hp], { a: 3, b: 3, c: 3 }, stored);
    expect(b).toMatchObject({ level: 3, current: 1, needsReview: true });
  });
  it('mergeStored ghi ngày đạt khi lên cấp, không ghi đè cấp cao hơn', () => {
    const books = collectBooks([hp], { a: 3, b: 3, c: 3, d: 5 }, {});
    const s1 = mergeStored({}, books, '2026-11-02');
    expect(s1['hien-phap/c9-chinh-phu']).toEqual({ level: 2, at: '2026-11-02' });
    const s2 = mergeStored({ 'hien-phap/c9-chinh-phu': { level: 3, at: '2026-10-01' } }, books, '2026-11-03');
    expect(s2['hien-phap/c9-chinh-phu']).toEqual({ level: 3, at: '2026-10-01' });
  });
  it('mọi chương 3 môn hiện có đều thuộc một lĩnh vực đã khai báo', () => {
    for (const [s, ch] of [['hien-phap', 'c1-nhung-van-de-chung'], ['chung-khoan', 'c5-cong-ty-chung-khoan'], ['lich-su-nn-pl', 'c6-trung-dai']] as const) expect(FIELDS).toContain(fieldOf(s, ch));
  });
});
