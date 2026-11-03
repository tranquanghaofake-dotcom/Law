import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/svelte';
import OrgChart from '$lib/ui/OrgChart.svelte';
import { shelf } from '$lib/ui/shelf.svelte';
import { career } from '$lib/ui/career.svelte';
import { POSTS } from '$lib/game/career';
import type { BookRec } from '$lib/game/books';

const book = (key: string, field: BookRec['field'], level: BookRec['level']): BookRec => ({ key, subject: 'hien-phap', subjectTitle: 'HP', subjectShort: 'HP', chapter: key, title: key, index: 1, field, level, current: level, needsReview: false, at: null });

describe('OrgChart (cây chức vụ)', () => {
  beforeEach(() => { shelf.ready = true; shelf.subjects = []; shelf.books = []; career.branch = 'hanh-phap'; });
  afterEach(() => cleanup());

  it('màn trống: cây vẫn đủ chức, mọi nút khoá trừ một nút kế tiếp mỗi nhánh; có gốc, 4 nhánh, Chủ tịch nước ở đỉnh', () => {
    const { container } = render(OrgChart);
    const nodes = [...container.querySelectorAll<HTMLButtonElement>('.org-node')];
    expect(nodes).toHaveLength(POSTS.length);
    expect(nodes.filter((n) => n.dataset.status === 'next')).toHaveLength(4);
    expect(nodes.filter((n) => n.dataset.status === 'done')).toHaveLength(0);
    expect(container.querySelector('.org-root')?.textContent).toContain('Nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam');
    expect(container.querySelectorAll('.org-branch')).toHaveLength(4);
    expect(container.querySelector('.org-top')?.textContent).toContain('Chủ tịch nước');
    expect(container.querySelector('.org-scroll')?.getAttribute('role')).toBe('region');
  });
  it('nhánh đang chọn được làm nổi (aria-pressed + lớp sel); bấm nhánh khác đổi nhánh', async () => {
    const { container } = render(OrgChart);
    const [first, second] = [...container.querySelectorAll<HTMLButtonElement>('.org-bnode')];
    expect(first.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelectorAll('.org-branch.sel')).toHaveLength(1);
    await fireEvent.click(second);
    expect(career.branch).toBe('lap-phap');
    expect(second.getAttribute('aria-pressed')).toBe('true');
  });
  it('có sách đủ cho chức đầu: nút đó "done" (ấn son), chức sau "next"', () => {
    shelf.books = [book('a', 'dia-phuong', 1), book('b', 'hien-phap', 1)];
    const { container } = render(OrgChart);
    const first = [...container.querySelectorAll<HTMLButtonElement>('.org-node')].find((n) => n.textContent?.includes('Công chức cấp xã'))!;
    expect(first.dataset.status).toBe('done');
    expect(first.textContent).toContain('Đã đạt');
    const next = [...container.querySelectorAll<HTMLButtonElement>('.org-node')].find((n) => n.textContent?.includes('Phó Chủ tịch Ủy ban nhân dân cấp xã'))!;
    expect(next.dataset.status).toBe('next');
  });
  it('chạm một chức mở hộp chi tiết: trạng thái + điều kiện sách; Esc/nút Đóng đóng lại', async () => {
    const { container } = render(OrgChart);
    const node = [...container.querySelectorAll<HTMLButtonElement>('.org-node')].find((n) => n.textContent?.includes('Công chức cấp xã'))!;
    await fireEvent.click(node);
    const dlg = container.querySelector('dialog')!;
    expect(dlg.hasAttribute('open')).toBe(true);
    expect(dlg.textContent).toContain('Công chức cấp xã');
    expect(dlg.textContent).toContain('Chức kế tiếp');
    expect(dlg.querySelectorAll('.req-list li').length).toBeGreaterThanOrEqual(2);
    expect(dlg.textContent).toMatch(/sách .* cấp 1\+/);
    await fireEvent.click(dlg.querySelector('.sheet-x')!);
    expect(dlg.hasAttribute('open')).toBe(false);
  });
  it('chức khoá ghi rõ chức cần đạt trước', async () => {
    const { container } = render(OrgChart);
    const node = [...container.querySelectorAll<HTMLButtonElement>('.org-node')].find((n) => n.textContent?.includes('Chủ tịch Ủy ban nhân dân cấp xã'))!;
    expect(node.dataset.status).toBe('locked');
    await fireEvent.click(node);
    expect(container.querySelector('dialog')!.textContent).toContain('Chưa mở');
    expect(container.querySelector('dialog')!.textContent).toContain('cần đạt trước');
  });
  it('không nhắc "Cuộn ngang" khi cây không tràn khung (điện thoại xếp dọc)', () => {
    const { container } = render(OrgChart);
    expect(container.textContent).not.toContain('Cuộn ngang');
  });
});
