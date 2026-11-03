import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/svelte';
import CareerSection from '$lib/ui/career/CareerSection.svelte';
import CareerPanel from '$lib/ui/CareerPanel.svelte';
import { shelf } from '$lib/ui/shelf.svelte';
import { career } from '$lib/ui/career.svelte';
import { POSTS, careerState } from '$lib/game/career';
import { orgTree } from '$lib/ui/orgTree';
import type { BookRec } from '$lib/game/books';

const book = (key: string, field: BookRec['field'], level: BookRec['level']): BookRec => ({ key, subject: 'hien-phap', subjectTitle: 'HP', subjectShort: 'HP', chapter: key, title: key, index: 1, field, level, current: level, needsReview: false, at: null });
const nodeOf = (c: HTMLElement, title: string) => [...c.querySelectorAll<HTMLButtonElement>('.org-node')].find((n) => n.title.includes(title))!;
const postOf = (id: string, books: BookRec[] = []) => {
  const t = orgTree(POSTS, careerState(books), books);
  return [...t.branches.flatMap((b) => b.tiers.flatMap((x) => x.posts)), ...(t.head ? [t.head] : [])].find((p) => p.id === id)!;
};
const settle = () => new Promise((r) => setTimeout(r, 30));

describe('tủ trưng bày gắn với cây (CareerPanel + CareerSection)', () => {
  beforeEach(() => { shelf.ready = true; shelf.subjects = []; shelf.books = []; career.branch = 'hanh-phap'; });
  afterEach(async () => { await settle(); cleanup(); vi.unstubAllGlobals(); });

  it('LUÔN có chân dung: 0 sách vẫn hiện khung tủ với "Công dân" (không còn ô chữ "chưa có gì để trưng")', async () => {
    const { container } = render(CareerPanel, { props: { stacked: false } });
    const fig = container.querySelector('figure.showcase')!;
    expect(fig).not.toBeNull();
    expect(fig.querySelector('.sc-plaque')?.textContent).toBe('Công dân');
    expect(fig.querySelector('svg.garment')).not.toBeNull();
    expect(fig.querySelector('.sc-back')).not.toBeNull(); // có phông
    expect(container.textContent).not.toContain('chưa có gì để trưng');
    expect(container.textContent).toContain('Học hết 1 chương');
    await settle();
  });
  it('xem trước chức chưa mở: bóng mờ khoá, "Cần x/y sách", nút "Về chức hiện tại"; chức khác nhau cho diện mạo khác nhau', async () => {
    const onreset = vi.fn();
    const sel = postOf('bo-truong');
    const { container } = render(CareerPanel, { props: { stacked: false, selected: sel, onreset } });
    const fig = container.querySelector('figure.showcase')!;
    expect(fig.classList.contains('locked')).toBe(true);
    expect(fig.getAttribute('data-look')).toBe('bo-truong');
    expect(fig.getAttribute('data-tier')).toBe('trung-uong');
    expect(container.querySelector('.sc-lock')).not.toBeNull();
    expect(container.querySelector('.career-need')?.textContent).toMatch(/Cần 0\/\d+ sách/);
    expect(container.querySelectorAll('.career-info .req-list li').length).toBe(sel.post.reqs.length);
    await fireEvent.click([...container.querySelectorAll('button')].find((b) => b.textContent?.includes('Về chức hiện tại'))!);
    expect(onreset).toHaveBeenCalled();
    await settle();
  });
  it('xem trước chức đã đạt: không khoá, ghi "Đã đạt"', async () => {
    shelf.books = [book('a', 'dia-phuong', 1), book('b', 'hien-phap', 1), book('c', 'hien-phap', 1)];
    const { container } = render(CareerPanel, { props: { stacked: false, selected: postOf('pho-chu-tich-xa', shelf.books) } });
    // phó chủ tịch xã chưa đạt (cần thêm sách) → khoá; công chức xã đã đạt và là chức hiện tại → không phải xem trước
    expect(container.querySelector('figure.showcase')?.classList.contains('locked')).toBe(true);
    await settle();
    cleanup();
    const cur = render(CareerPanel, { props: { stacked: false, selected: postOf('cong-chuc-xa', shelf.books) } });
    expect(cur.container.querySelector('figure.showcase')?.classList.contains('locked')).toBe(false);
    expect(cur.container.querySelector('.sc-plaque')?.textContent).toBe('Công chức cấp xã');
    await settle();
  });
  it('khung hẹp: tủ thu gọn (khung ảnh nhỏ) ở trên cây, bấm "Xem tủ trưng bày" mở đủ', async () => {
    const { container } = render(CareerPanel, { props: { stacked: true } });
    expect(container.querySelector('figure.showcase.compact')).not.toBeNull();
    expect(container.querySelector('.career-mini-t')?.textContent).toBe('Công dân');
    expect(container.querySelector('.career-info')).toBeNull();
    const more = container.querySelector<HTMLButtonElement>('.career-more')!;
    expect(more.getAttribute('aria-expanded')).toBe('false');
    await fireEvent.click(more);
    expect(more.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('figure.showcase.compact')).toBeNull();
    expect(container.querySelector('.career-info')).not.toBeNull();
    await settle();
  });
  it('Section (khung hẹp): chạm một chức trên cây → tủ trưng bày xem trước chức đó + hộp chi tiết; "Về chức hiện tại" trả lại', async () => {
    const { container } = render(CareerSection);
    await fireEvent.click(nodeOf(container, 'Bộ trưởng'));
    expect(container.querySelector('.career-mini-t')?.textContent).toBe('Bộ trưởng');
    expect(container.querySelector('figure.showcase')?.classList.contains('locked')).toBe(true);
    expect(container.querySelector('dialog')?.hasAttribute('open')).toBe(true);
    await fireEvent.click(container.querySelector('dialog .sheet-x')!);
    await fireEvent.click(container.querySelector('.career-more')!);
    await fireEvent.click([...container.querySelectorAll('.career-info button')].find((b) => b.textContent?.includes('Về chức hiện tại'))!);
    await waitFor(() => expect(container.querySelector('.sc-plaque')?.textContent).toBe('Công dân'));
    expect(container.querySelector('figure.showcase')?.classList.contains('locked')).toBe(false);
  });
  it('Section (≥ 1024 px, hai cột): chi tiết điều kiện hiện ngay trong khung tủ trưng bày, không mở hộp thoại', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('min-width: 1024px'), media: q, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} }));
    const { container } = render(CareerSection);
    expect(container.querySelector('.career.stacked')).toBeNull();
    await fireEvent.click(nodeOf(container, 'Thứ trưởng'));
    expect(container.querySelector('.sc-plaque')?.textContent).toBe('Thứ trưởng');
    expect(container.querySelectorAll('.career-info .req-list li').length).toBeGreaterThan(3);
    expect(container.querySelector('.career-need')?.textContent).toContain('sách');
    expect(container.querySelector('dialog')?.hasAttribute('open')).toBeFalsy();
    expect(nodeOf(container, 'Thứ trưởng').getAttribute('aria-pressed')).toBe('true');
  });
});
