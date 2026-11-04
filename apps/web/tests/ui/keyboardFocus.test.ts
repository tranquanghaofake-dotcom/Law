import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import CardIntro from '$lib/ui/cards/CardIntro.svelte';
import { isInteractiveTarget } from '$lib/ui/cards/types';
import { focusRouteHeading } from '$lib/ui/routeFocus';
import type { Concept } from '$lib/content/types';

afterEach(() => { cleanup(); document.body.innerHTML = ''; });

const key = (el: Element, k: string) => new KeyboardEvent('keydown', { key: k, bubbles: true }) as KeyboardEvent & { target: Element } & Record<string, unknown>;
const evOn = (el: Element) => { const e = key(el, 'Enter'); Object.defineProperty(e, 'target', { value: el }); return e; };

describe('isInteractiveTarget (HT1)', () => {
  it('link, nút, summary, phần tử con của nút → true; div/body → false', () => {
    document.body.innerHTML = '<a href="#x" id="a">x</a><button id="b"><span id="s">y</span></button><details><summary id="m">z</summary></details><div id="d">d</div>';
    for (const id of ['a', 'b', 's', 'm']) expect(isInteractiveTarget(evOn(document.getElementById(id)!))).toBe(true);
    expect(isInteractiveTarget(evOn(document.getElementById('d')!))).toBe(false);
    expect(isInteractiveTarget(evOn(document.body))).toBe(false);
  });
  it('a không có href không tính là link', () => {
    document.body.innerHTML = '<a id="a">x</a>';
    expect(isInteractiveTarget(evOn(document.getElementById('a')!))).toBe(false);
  });
});

const concept: Concept = {
  id: 'a', subject: 'dan-su', chapter: 'c', term: 'Đặt cọc', definition: 'Đặt cọc là việc giao tiền để bảo đảm giao kết hợp đồng.',
  plain: 'Giao tiền trước.', example: 'An giao 5 triệu.', source: { kind: 'statute', cite: 'Điều 328 BLDS 2015' }, checked: '2026-11-01', confusables: [], keywords: ['giao tiền'], items: [],
};

describe('CardIntro: Enter trên nút khác không bị nuốt (HT1)', () => {
  it('Enter khi focus ở "Xem nguyên văn điều luật" không trả lời thẻ', async () => {
    const onanswer = vi.fn();
    render(CardIntro, { props: { concept, item: { type: 'intro' as const }, rng: () => 0.5, onanswer } });
    const toggle = screen.getByRole('button', { name: 'Xem nguyên văn điều luật' });
    toggle.focus();
    await fireEvent.keyDown(toggle, { key: 'Enter' });
    expect(onanswer).not.toHaveBeenCalled();
  });
  it('Enter khi focus ở body vẫn là phím tắt "Đã hiểu"', async () => {
    const onanswer = vi.fn();
    render(CardIntro, { props: { concept, item: { type: 'intro' as const }, rng: () => 0.5, onanswer } });
    await fireEvent.keyDown(window, { key: 'Enter' });
    expect(onanswer).toHaveBeenCalledTimes(1);
  });
});

describe('focusRouteHeading (HT2)', () => {
  it('focus h1 trong #main, thêm tabindex=-1', async () => {
    document.body.innerHTML = '<main id="main" tabindex="-1"><h1>Hồ sơ</h1></main>';
    const el = await focusRouteHeading(document, 50);
    expect(el?.tagName).toBe('H1');
    expect(document.activeElement?.tagName).toBe('H1');
    expect(el?.getAttribute('tabindex')).toBe('-1');
  });
  it('màn tải lười: chờ h1 xuất hiện', async () => {
    document.body.innerHTML = '<main id="main" tabindex="-1"><p>Đang tải…</p></main>';
    const p = focusRouteHeading(document, 500);
    setTimeout(() => { document.getElementById('main')!.innerHTML = '<h1>Bài học</h1>'; }, 10);
    expect((await p)?.textContent).toBe('Bài học');
  });
  it('không có h1: focus <main>', async () => {
    document.body.innerHTML = '<main id="main" tabindex="-1"><p>x</p></main>';
    expect((await focusRouteHeading(document, 20))?.id).toBe('main');
  });
  it('phần tử trong màn đã tự lấy focus thì không giành lại', async () => {
    document.body.innerHTML = '<main id="main" tabindex="-1"><h1>A</h1><button id="b">Tiếp</button></main>';
    document.getElementById('b')!.focus();
    await focusRouteHeading(document, 20);
    expect(document.activeElement?.id).toBe('b');
  });
});
