import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/svelte';
import Bookcase from '$lib/ui/Bookcase.svelte';
import { shelf } from '$lib/ui/shelf.svelte';
import type { Subject } from '$lib/content/types';
import type { BookLevel, BookRec } from '$lib/game/books';

const subject = (id: string, chapters: number): Subject => ({
  id, title: 'Luật ' + id, short: id.toUpperCase(),
  chapters: Array.from({ length: chapters }, (_, i) => ({ id: `c${i + 1}`, title: `Chương ${i + 1}. Tên chương ${i + 1}`, lessons: [{ id: `l${i}`, title: 'L', concepts: [`${id}-${i}-a`, `${id}-${i}-b`] }] })),
});
const rec = (s: string, i: number, level: BookLevel, needsReview = false): BookRec => ({ key: `${s}/c${i}`, subject: s, subjectTitle: s, subjectShort: s.toUpperCase(), chapter: `c${i}`, title: `Chương ${i}. Tên chương ${i}`, index: i, field: 'hien-phap', level, current: level, needsReview, at: null });
const SUBJECTS = ['hien-phap', 'hanh-chinh', 'dan-su', 'hinh-su', 'thuong-mai', 'tai-chinh', 'lao-dong', 'so-huu-tri-tue'].map((id) => subject(id, 4));

describe('Bookcase (tủ sách thật)', () => {
  beforeEach(() => { shelf.ready = true; shelf.subjects = SUBJECTS; shelf.books = []; });
  afterEach(() => cleanup());

  it('màn trống: tủ nhiều tầng, mỗi môn một gáy mờ (lit 0), có biển tên kệ nhóm ngành', () => {
    const { container } = render(Bookcase);
    const tiers = container.querySelectorAll('.bk-tier');
    expect(tiers.length).toBeGreaterThanOrEqual(4);
    expect(tiers.length).toBeLessThanOrEqual(5);
    const spines = [...container.querySelectorAll<HTMLButtonElement>('.bk-spine')];
    expect(spines).toHaveLength(8);
    expect(spines.every((b) => b.style.getPropertyValue('--lit') === '0')).toBe(true);
    expect([...container.querySelectorAll('.bk-plate')].map((p) => p.textContent)).toContain('Hiến pháp – Hành chính');
    expect(container.textContent).toContain('Chưa có sách chương nào');
  });
  it('nhãn gáy chứa chữ hiển thị (tránh label-content-name-mismatch) và nêu số sách/cần ôn', () => {
    shelf.books = [rec('hien-phap', 1, 2, true), rec('hien-phap', 2, 1)];
    const { container } = render(Bookcase);
    const hp = [...container.querySelectorAll<HTMLButtonElement>('.bk-spine')].find((b) => b.textContent?.includes('HIEN-PHAP'))!;
    expect(hp.getAttribute('aria-label')).toContain(hp.querySelector('.bk-name')!.textContent!);
    expect(hp.getAttribute('aria-label')).toContain('2/4 sách');
    expect(hp.getAttribute('aria-label')).toContain('cần ôn');
    expect(hp.style.getPropertyValue('--lit')).toBe('0.5');
    expect(hp.querySelector('.bk-dot')).not.toBeNull();
  });
  it('chạm một gáy mở ngăn chương: các cuốn chương (BookSpine) + tên chương + liên kết "Vào môn →"; đóng bằng nút Đóng', async () => {
    shelf.books = [rec('hinh-su', 1, 3), rec('hinh-su', 2, 0), rec('hinh-su', 3, 0), rec('hinh-su', 4, 0)];
    const { container } = render(Bookcase);
    const spine = [...container.querySelectorAll<HTMLButtonElement>('.bk-spine')].find((b) => b.textContent?.includes('HINH-SU'))!;
    await fireEvent.click(spine);
    const dlg = container.querySelector('dialog')!;
    expect(dlg.hasAttribute('open')).toBe(true);
    expect(dlg.querySelectorAll('.bk-ch')).toHaveLength(4);
    expect(dlg.querySelectorAll('svg.spine')).toHaveLength(4);
    expect(dlg.querySelector('svg.spine.lv3')).not.toBeNull();
    expect(dlg.textContent).toContain('Tên chương 1');
    expect(dlg.textContent).toContain('Cấp 3');
    const go = dlg.querySelector('a.bk-go')!;
    expect(go.getAttribute('href')).toBe('#/mon/hinh-su');
    expect(go.textContent).toContain('Vào môn');
    await fireEvent.click(dlg.querySelector('.sheet-x')!);
    expect(dlg.hasAttribute('open')).toBe(false);
  });
});
