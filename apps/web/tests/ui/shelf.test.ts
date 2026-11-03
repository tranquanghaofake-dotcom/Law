import { describe, expect, it } from 'vitest';
import type { Subject } from '$lib/content/types';
import { shelfBooks, schemeFor, SHELF_MIN } from '$lib/ui/shelf';

const subj = (id: string, ids: string[]): Subject => ({ id, title: 'Luật ' + id, short: id, chapters: [{ id: 'c', title: 'C', lessons: [{ id: 'l', title: 'L', concepts: ids }] }] });

describe('kệ sách', () => {
  it('chưa học → sách mờ (ghost), 0%', () => {
    const [b] = shelfBooks([subj('hien-phap', ['a', 'b'])], {});
    expect(b).toMatchObject({ id: 'hien-phap', state: 'ghost', percent: 0, href: '#/mon/hien-phap' });
  });
  it('thuần thục một phần → đang lên màu; % theo ngưỡng MASTERED như % môn', () => {
    const [b] = shelfBooks([subj('x', ['a', 'b', 'c', 'd'])], { a: 6, b: 6, c: 3 });
    expect(b.state).toBe('growing');
    expect(b.percent).toBe(50);
  });
  it('chỉ "hoàn thành" khi mọi khái niệm đạt ngưỡng — 99,6% làm tròn lên 100 vẫn chưa xong', () => {
    const ids = Array.from({ length: 250 }, (_, i) => 'k' + i);
    const levels = Object.fromEntries(ids.slice(0, 249).map((id) => [id, 6])) as Record<string, 6>;
    expect(shelfBooks([subj('x', ids)], levels)[0].state).toBe('growing');
    expect(shelfBooks([subj('x', ids)], { ...levels, k249: 6 })[0].state).toBe('done');
  });
  it('môn không có khái niệm không lên kệ; màu gáy = màu kệ nhóm ngành (một môn một màu ở mọi nơi — Q6)', () => {
    expect(shelfBooks([subj('rong', [])], {})).toHaveLength(0);
    expect(schemeFor('hien-phap', 0)).toBe('#9E2A22');
    expect(schemeFor('dan-su', 1)).toBe(schemeFor('to-tung-dan-su', 5));
    expect(schemeFor('dan-su', 1)).not.toBe(schemeFor('lao-dong', 2));
    expect(SHELF_MIN).toBeGreaterThanOrEqual(3);
  });
});
