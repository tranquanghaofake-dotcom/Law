import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import type { Concept, Subject } from '$lib/content/types';

const subject: Subject = { id: 'hp', title: 'Luật Hiến pháp', short: 'Hiến pháp', chapters: [{ id: 'c1', title: 'Khái quát', lessons: [
  { id: 'hp-1', title: 'Hiến pháp là gì', concepts: ['a', 'b'] },
  { id: 'hp-2', title: 'Sửa đổi', concepts: ['c'] },
] }] };
const mk = (id: string, term: string): Concept => ({ id, term, definition: 'Định nghĩa ' + term, plain: 'Giải thích', example: 'Ví dụ', confusables: [], keywords: [], source: { cite: 'Điều 1 Hiến pháp 2013', url: 'https://vbpl.vn/x' }, checked: '2026-11-01', items: [] } as unknown as Concept);
const all = [mk('a', 'Chủ quyền'), { ...mk('b', 'Hiệu lực'), confusables: ['a', 'c'], note: 'Luật sửa đổi 2025 đã thay khoản 2.' } as Concept, mk('c', 'Sửa đổi Hiến pháp')];

vi.mock('$lib/content/loader', () => ({
  loadSubject: async () => subject,
  loadSubjectConcepts: async () => all,
  loadConceptPool: async () => all,
}));
vi.mock('$lib/store/progress-repo', () => ({ repo: { levels: async () => ({ a: 3 }) } }));
vi.mock('$lib/store/stars.svelte', () => ({ stars: { load: async () => {}, has: () => false, toggle() {}, ids: [] } }));
vi.mock('$lib/router.svelte', () => ({
  route: { name: 'concepts', params: { subject: 'hp', concept: 'b' } },
  hashFor: (n: string, p: Record<string, string>) => `#/${n}/${Object.values(p ?? {}).join('/')}`,
}));

const Concepts = (await import('../../src/routes/Concepts.svelte')).default;

describe('Concepts — cấu trúc và deep-link (CL-1, CL-3, CN-1, SJ-2)', () => {
  it('nhóm là h2, tên khái niệm là h3 bọc nút mở; ô bậc có chữ số', async () => {
    const { container } = render(Concepts);
    await waitFor(() => expect(container.querySelector('h1')).not.toBeNull());
    expect([...container.querySelectorAll('h2')].map((h) => h.textContent?.trim())).toEqual(['Hiến pháp là gì', 'Sửa đổi']);
    const h3 = [...container.querySelectorAll('h3')];
    expect(h3).toHaveLength(3);
    expect(h3[0].querySelector('button.entry-toggle')).not.toBeNull();
    expect(container.querySelector('#c-a .cell')?.textContent).toBe('3');
  });
  it('h1 không mồ côi "·"; có dòng trạng thái đếm số khái niệm và báo mục đang mở', async () => {
    const { container } = render(Concepts);
    await waitFor(() => expect(container.querySelector('h1')).not.toBeNull());
    expect(container.querySelector('h1')?.textContent).toBe('Khái niệm Hiến pháp');
    const st = container.querySelector('[role="status"]');
    expect(st?.textContent).toContain('3/3');
    expect(st?.textContent).toContain('Hiệu lực');
  });
  it('deep-link: mục đích mở sẵn và nhận focus', async () => {
    render(Concepts, { target: document.body });
    await waitFor(() => expect(document.activeElement?.closest('#c-b')).not.toBeNull());
    expect(document.querySelector('#c-b .entry-toggle')?.getAttribute('aria-expanded')).toBe('true');
  });
  it('nguồn nằm ngay dưới định nghĩa, ngày dạng dd/mm/yyyy, báo mở tab mới', async () => {
    const { container } = render(Concepts);
    await waitFor(() => expect(container.querySelector('#body-b')).not.toBeNull());
    const body = container.querySelector('#body-b')!;
    const src = body.querySelector('.source')!;
    expect(body.querySelector('.quote')?.nextElementSibling).toBe(src);
    expect(src.textContent).toContain('01/11/2026');
    expect(src.querySelector('a')?.textContent).toContain('mở tab mới');
  });
  it('"Dễ nhầm với" là danh sách link riêng từng dòng; lưu ý cập nhật luật có tiêu đề + icon cảnh báo, cỡ chữ thường', async () => {
    const { container } = render(Concepts);
    await waitFor(() => expect(container.querySelector('#body-b')).not.toBeNull());
    const links = [...container.querySelectorAll('#body-b ul.confuse-list li a')].map((a) => a.textContent);
    expect(links).toEqual(['Chủ quyền', 'Sửa đổi Hiến pháp']);
    const note = container.querySelector('#body-b .note')!;
    expect(note.classList.contains('small')).toBe(false);
    expect(note.querySelector('svg.glyph')).not.toBeNull();
    expect(note.textContent).toContain('Cập nhật luật');
  });
});
