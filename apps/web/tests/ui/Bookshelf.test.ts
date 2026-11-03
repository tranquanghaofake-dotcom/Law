import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import Bookshelf from '$lib/ui/Bookshelf.svelte';
import { shelf } from '$lib/ui/shelf.svelte';
import type { BookRec } from '$lib/game/books';

const rec = (s: string, i: number): BookRec => ({ key: `${s}/c${i}`, subject: s, subjectTitle: s, subjectShort: s.toUpperCase(), chapter: `c${i}`, title: `Chương ${i}. Tên chương ${i}`, index: i, field: 'hien-phap', level: 2, current: 2, needsReview: false, at: null });

describe('Bookshelf (kệ sách sidebar)', () => {
  beforeEach(() => { shelf.ready = true; shelf.subjects = []; shelf.books = [rec('hien-phap', 1), rec('dan-su', 2)]; });
  afterEach(() => cleanup());

  it('liên kết sách không có aria-label; tên truy cập lấy từ chữ ẩn chứa tên chương', () => {
    const { container } = render(Bookshelf, { props: { size: 'side' } });
    const link = container.querySelector<HTMLAnchorElement>('a[href="#/mon/hien-phap"]');
    expect(link).not.toBeNull();
    expect(link!.hasAttribute('aria-label')).toBe(false);
    expect(link!.querySelector('.sr-only')?.textContent).toContain('Tên chương 1');
    expect(link!.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});
