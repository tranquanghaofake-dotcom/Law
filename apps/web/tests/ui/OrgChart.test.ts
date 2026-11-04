import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/svelte';
import OrgChart from '$lib/ui/OrgChart.svelte';
import { shelf } from '$lib/ui/shelf.svelte';
import { career } from '$lib/ui/career.svelte';
import { POSTS } from '$lib/game/career';
import type { BookRec } from '$lib/game/books';

const book = (key: string, field: BookRec['field'], level: BookRec['level']): BookRec => ({ key, subject: 'hien-phap', subjectTitle: 'HP', subjectShort: 'HP', chapter: key, title: key, index: 1, field, level, current: level, needsReview: false, at: null });
const nodeOf = (c: HTMLElement, title: string) => [...c.querySelectorAll<HTMLButtonElement>('.org-node')].find((n) => n.title.includes(title))!;

describe('OrgChart (cây chức vụ dọc)', () => {
  beforeEach(() => { shelf.ready = true; shelf.subjects = []; shelf.books = []; career.branch = 'hanh-phap'; });
  afterEach(() => cleanup());

  it('màn trống: cây vẫn đủ chức, mọi nút khoá trừ một nút kế tiếp mỗi nhánh; có gốc, 4 cột nhánh, Chủ tịch nước ở đỉnh', () => {
    const { container } = render(OrgChart);
    const nodes = [...container.querySelectorAll<HTMLButtonElement>('.org-node')];
    expect(nodes).toHaveLength(POSTS.length);
    expect(nodes.filter((n) => n.dataset.status === 'next')).toHaveLength(4);
    expect(nodes.filter((n) => n.dataset.status === 'done')).toHaveLength(0);
    expect(container.querySelector('.org-root')?.textContent).toContain('Nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam');
    expect(container.querySelectorAll('.org-col')).toHaveLength(4);
    expect(container.querySelector('.org-top')?.textContent).toContain('Chủ tịch nước');
  });
  it('mỗi cột đọc từ trên xuống: tầng Lãnh đạo cấp cao đầu tiên, chức cao nhất trước; chức Cơ sở cuối cùng; có điểm xuất phát ở đáy', () => {
    const { container } = render(OrgChart);
    const col = container.querySelector('.org-col')!;
    const nodes = [...col.querySelectorAll<HTMLElement>('.org-node')];
    expect(nodes[0].title).toBe('Thủ tướng Chính phủ');
    expect(nodes.at(-1)!.title).toBe('Công chức cấp xã');
    expect(col.querySelector('.org-trow')?.textContent).toContain('Lãnh đạo cấp cao');
    expect([...col.querySelectorAll('.org-trow')].map((r) => r.getAttribute('data-tier'))).toEqual(['lanh-dao', 'trung-uong', 'tinh', 'co-so']);
    expect(col.querySelector('.org-start')?.textContent).toContain('Công dân');
  });
  it('đường nối dọc: chưa có sách → đoạn từ Công dân tới chức đầu đang chạy (live); có chức đã đạt → đoạn dưới nó tô màu (fill)', () => {
    const first = render(OrgChart);
    expect(first.container.querySelector('.org-col .org-start')?.getAttribute('data-rail')).toBe('live');
    cleanup();
    shelf.books = [book('a', 'hanh-chinh', 1), book('b', 'hien-phap', 1)];
    const { container } = render(OrgChart);
    expect(container.querySelector('.org-col .org-start')?.getAttribute('data-rail')).toBe('fill');
    expect(nodeOf(container, 'Công chức cấp xã').closest('.org-prow')?.getAttribute('data-rail')).toBe('live');
  });
  it('nhánh đang chọn được làm nổi (aria-pressed + lớp sel); chip và đầu cột đều đổi nhánh', async () => {
    const { container } = render(OrgChart);
    const chips = [...container.querySelectorAll<HTMLButtonElement>('.org-chip')];
    expect(chips).toHaveLength(4);
    expect(chips[0].getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelectorAll('.org-col.sel')).toHaveLength(1);
    await fireEvent.click(chips[1]);
    expect(career.branch).toBe('lap-phap');
    expect(chips[1].getAttribute('aria-pressed')).toBe('true');
    await fireEvent.click(container.querySelectorAll<HTMLButtonElement>('.org-bnode')[2]);
    expect(career.branch).toBe('xet-xu');
    expect(container.querySelector('.org-col.sel')?.getAttribute('data-branch')).toBe('xet-xu');
  });
  it('dải tóm tắt 4 nhánh có x/y chức', () => {
    const { container } = render(OrgChart);
    const items = [...container.querySelectorAll('.org-sum li')];
    expect(items).toHaveLength(4);
    expect(items[0].textContent).toContain('0/11 chức');
    expect(items[3].textContent).toContain('0/5 chức');
  });
  it('có sách đủ cho chức đầu: nút đó "done" (ấn son), chức sau "next"', () => {
    shelf.books = [book('a', 'hanh-chinh', 1), book('b', 'hien-phap', 1)];
    const { container } = render(OrgChart);
    const first = nodeOf(container, 'Công chức cấp xã');
    expect(first.dataset.status).toBe('done');
    expect(first.textContent).toContain('Đã đạt');
    expect(nodeOf(container, 'Phó Chủ tịch Ủy ban nhân dân cấp xã').dataset.status).toBe('next');
  });
  it('chạm một chức (khung hẹp: detail=sheet) báo onpick và mở hộp chi tiết; Esc/nút Đóng đóng lại', async () => {
    const onpick = vi.fn();
    const { container } = render(OrgChart, { props: { onpick } });
    await fireEvent.click(nodeOf(container, 'Công chức cấp xã'));
    expect(onpick).toHaveBeenCalledWith(expect.objectContaining({ id: 'cong-chuc-xa' }));
    const dlg = container.querySelector('dialog')!;
    expect(dlg.hasAttribute('open')).toBe(true);
    expect(dlg.textContent).toContain('Công chức cấp xã');
    expect(dlg.textContent).toContain('Chức kế tiếp');
    expect(dlg.querySelectorAll('.req-list li').length).toBeGreaterThanOrEqual(2);
    expect(dlg.textContent).toMatch(/sách .* cấp 1\+/);
    await fireEvent.click(dlg.querySelector('.sheet-x')!);
    expect(dlg.hasAttribute('open')).toBe(false);
  });
  it('bố cục 2 cột (detail=none): chạm chức chỉ báo onpick, không mở hộp thoại; chức đang xem trước có aria-pressed', async () => {
    const onpick = vi.fn();
    const { container, rerender } = render(OrgChart, { props: { onpick, detail: 'none' } });
    await fireEvent.click(nodeOf(container, 'Công chức cấp xã'));
    expect(onpick).toHaveBeenCalledTimes(1);
    expect(container.querySelector('dialog')?.hasAttribute('open')).toBeFalsy();
    await rerender({ onpick, detail: 'none', selectedId: 'cong-chuc-xa' });
    expect(nodeOf(container, 'Công chức cấp xã').getAttribute('aria-pressed')).toBe('true');
    expect(nodeOf(container, 'Giám đốc sở').getAttribute('aria-pressed')).toBe('false');
  });
  it('chức khoá ghi rõ chức cần đạt trước', async () => {
    const { container } = render(OrgChart);
    const node = nodeOf(container, 'Chủ tịch Ủy ban nhân dân cấp xã');
    expect(node.dataset.status).toBe('locked');
    await fireEvent.click(node);
    expect(container.querySelector('dialog')!.textContent).toContain('Chưa mở');
    expect(container.querySelector('dialog')!.textContent).toContain('cần đạt trước');
  });
  it('không còn vùng cuộn ngang; tên chức dùng viết tắt ở nút, đầy đủ ở tooltip', () => {
    const { container } = render(OrgChart);
    expect(container.querySelector('.org-scroll')).toBeNull();
    const n = nodeOf(container, 'Phó Chủ tịch Ủy ban nhân dân cấp xã');
    expect(n.querySelector('.org-name')?.textContent).toBe('Phó Chủ tịch UBND cấp xã');
  });
});
