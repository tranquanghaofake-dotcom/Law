import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, within } from '@testing-library/svelte';
import SessionEnd from '$lib/ui/SessionEnd.svelte';
import { rankFor } from '$lib/game/rank';

const base = { summary: { correct: 3, total: 4, xp: 30, levelUps: [] }, concepts: [], streak: 1, streakEvent: 'started' as const, rankBefore: rankFor(0), rankAfter: rankFor(30), dueTomorrow: 2, onhome: () => {} };

describe('SessionEnd', () => {
  it('nút chính "Về Hôm nay"; có "Học đợt tiếp" khi truyền onnext', async () => {
    const onnext = vi.fn();
    const { container } = render(SessionEnd, { props: { ...base, onnext } });
    const { getByRole } = within(container);
    expect(getByRole('button', { name: 'Về Hôm nay' })).toBeTruthy();
    await fireEvent.click(getByRole('button', { name: /Học đợt tiếp/ }));
    expect(onnext).toHaveBeenCalled();
  });
  it('đợt chưa xong (gate): không mời "Học đợt tiếp"; nút học lượt tiếp đợt này + giải thích + link học vượt', async () => {
    const onnext = vi.fn(); const onagain = vi.fn();
    const { container } = render(SessionEnd, { props: { ...base, onnext, onagain, gate: { done: false, remaining: 2, total: 3 } } });
    const { getByRole, queryByRole } = within(container);
    expect(queryByRole('button', { name: /Học đợt tiếp/ })).toBeNull();
    expect(container.textContent).toContain('Đợt sau mở khi cả 3 khái niệm đạt bậc 3');
    expect(container.textContent).toContain('còn 2');
    await fireEvent.click(getByRole('button', { name: /Học lượt tiếp đợt này/ }));
    expect(onagain).toHaveBeenCalled();
    await fireEvent.click(getByRole('button', { name: /Học vượt sang đợt sau/ }));
    expect(onnext).toHaveBeenCalled();
  });
  it('đợt đã xong (gate.done) → "Học đợt tiếp"', () => {
    const { container } = render(SessionEnd, { props: { ...base, onnext: () => {}, gate: { done: true, remaining: 0, total: 3 } } });
    expect(within(container).getByRole('button', { name: /Học đợt tiếp/ })).toBeTruthy();
  });
  it('không có "Học đợt tiếp" khi không có đợt kế', () => {
    const { container } = render(SessionEnd, { props: base });
    const { queryByRole } = within(container);
    expect(queryByRole('button', { name: /Học đợt tiếp/ })).toBeNull();
  });
  it('có câu sai → mục "Xem lại câu sai" với câu hỏi, đáp án, link khái niệm; không có → không hiện', () => {
    const concept = { id: 'a', subject: 'hp', chapter: 'c', term: 'Hiến pháp', definition: 'd', plain: 'p', example: 'e', source: { kind: 'statute' as const, cite: 'Điều 1' }, checked: '2026-11-01', confusables: [], keywords: [], items: [] };
    const mistakes = [{ conceptId: 'a', level: 1 as const, item: { type: 'mcq' as const, level: 1 as const, q: 'Câu hỏi X?', options: ['Sai', 'Đúng'], answer: 1, explain: 'Vì Y' } }];
    const { container } = render(SessionEnd, { props: { ...base, concepts: [concept], mistakes } });
    const sec = container.querySelector('.mistakes')!;
    expect(sec.textContent).toContain('Câu hỏi X?');
    expect(sec.textContent).toContain('Đúng');
    expect(sec.textContent).toContain('Vì Y');
    expect(sec.querySelector('a')?.getAttribute('href')).toBe('#/mon/hp/khai-niem/a');
    const { container: c2 } = render(SessionEnd, { props: base });
    expect(c2.querySelector('.mistakes')).toBeNull();
  });
  it('câu sai dạng ghép cặp: đáp án gập trong <details>, mô tả dài bị rút gọn (không in cả khối dài)', () => {
    const long = 'x'.repeat(300);
    const mistakes = [{ conceptId: 'a', level: 2 as const, item: { type: 'match' as const, level: 2 as const, explain: 'e', pairs: [{ conceptId: 'a', term: 'T1', text: long }, { conceptId: 'b', term: 'T2', text: 'ngắn' }, { conceptId: 'c', term: 'T3', text: 'ngắn' }] } }];
    const { container } = render(SessionEnd, { props: { ...base, mistakes } });
    const d = container.querySelector('.mistakes details.ans-more')!;
    expect(d).not.toBeNull();
    expect(d.querySelectorAll('li')).toHaveLength(3);
    expect(d.querySelector('li')!.textContent!.length).toBeLessThanOrEqual(160);
  });
  it('dòng "nhớ chắc hơn" đứng đầu: số khái niệm lên bậc; có khái niệm giữ bậc thì giải thích luật giãn cách', () => {
    const levelUps = [{ conceptId: 'a', to: 2 as const }, { conceptId: 'b', to: 4 as const }];
    const { container } = render(SessionEnd, { props: { ...base, summary: { ...base.summary, levelUps, held: 3 } } });
    const m = container.querySelector('.memory-line')!;
    expect(m.textContent).toContain('2 khái niệm nhớ chắc hơn');
    expect(container.querySelector('.held-note')!.textContent).toMatch(/3 khái niệm.*ngày khác/);
    const { container: c2 } = render(SessionEnd, { props: base });
    expect(c2.querySelector('.memory-line')!.textContent).toContain('Chưa khái niệm nào lên bậc');
    expect(c2.querySelector('.held-note')).toBeNull();
  });
});


describe('SessionEnd — không lặp số liệu (đợt 2)', () => {
  it('tỉ lệ đúng chỉ ở vòng điểm, không lặp trong danh sách; XP theo nguồn không vẽ thanh trang trí', async () => {
    const { render } = await import('@testing-library/svelte');
    const SessionEnd = (await import('$lib/ui/SessionEnd.svelte')).default;
    const { container } = render(SessionEnd, { props: { summary: { correct: 2, total: 5, xp: 40, levelUps: [], bestCombo: 2 }, sources: [{ key: 'base', label: 'Trả lời đúng', xp: 40 }], record: null, retryTotal: 0, concepts: [], streak: 1, streakEvent: 'started', dueTomorrow: 3, onhome() {} } as never });
    expect(container.querySelector('.end-ring')?.getAttribute('aria-label')).toContain('40');
    expect([...container.querySelectorAll('.stat-list dt')].map((d) => d.textContent)).not.toContain('Tỉ lệ đúng');
    expect(container.querySelector('.xp-sources i')).toBeNull();
    expect(container.querySelector('.xp-sources')?.textContent).toContain('+40');
  });
});
