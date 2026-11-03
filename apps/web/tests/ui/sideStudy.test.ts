import { describe, expect, it } from 'vitest';
import type { Level, Subject } from '$lib/content/types';
import { sideStudy, dueWindow } from '$lib/ui/sideStudy';

const subj = (id: string, lessons: string[][]): Subject => ({ id, title: 'Luật ' + id, short: id, chapters: [{ id: 'c', title: 'C', lessons: lessons.map((concepts, i) => ({ id: `${id}-${i + 1}`, title: `Đợt ${i + 1}`, concepts })) }] });
const hp = subj('hp', [['a', 'b'], ['c']]);

describe('khối "Đang học" ở sidebar', () => {
  it('đang dở một đợt → continue: tên môn, đợt, liên kết', () => {
    const r = sideStudy({ subjects: [hp], levels: { a: 3 } as Record<string, Level>, recent: { hp: 1 }, dueCount: 0 });
    expect(r).toEqual({ subject: 'Luật hp', lesson: 'Đợt 1', href: '#/hoc/hp/hp-1' });
  });
  it('đợt trước xong, đợt sau chưa mở, đã có tiến độ → next', () => {
    const r = sideStudy({ subjects: [hp], levels: { a: 6, b: 6 } as Record<string, Level>, recent: { hp: 1 }, dueCount: 0 });
    expect(r?.lesson).toBe('Đợt 2');
  });
  it('chưa có tiến độ (start), đang có hẹn ôn (due) hoặc đã xong hết → không hiện', () => {
    expect(sideStudy({ subjects: [hp], levels: {}, recent: {}, dueCount: 0 })).toBeNull();
    expect(sideStudy({ subjects: [hp], levels: { a: 3 } as Record<string, Level>, recent: { hp: 1 }, dueCount: 2 })).toBeNull();
    expect(sideStudy({ subjects: [hp], levels: { a: 6, b: 6, c: 6 } as Record<string, Level>, recent: { hp: 1 }, dueCount: 0 })).toBeNull();
  });
});

describe('cửa sổ ngày hẹn ôn', () => {
  it('cuối ngày +n', () => {
    const d = dueWindow(new Date(2026, 10, 3, 9, 0), 7);
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 10, 10, 23, 59]);
  });
});
