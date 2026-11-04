import { beforeEach, describe, expect, it } from 'vitest';
import { parseHash } from '$lib/router.svelte';
import { createBackTracker, parentHash } from '$lib/ui/back';
import { hintSeen, markHintSeen } from '$lib/ui/hints';

describe('parentHash', () => {
  const p = (h: string) => parentHash(parseHash(h));
  it('4 trang gốc không có nút quay lại', () => {
    for (const h of ['#/', '#/mon', '#/luyen-de', '#/toi']) expect(p(h)).toBeNull();
  });
  it('trang con về trang cha hợp lý', () => {
    expect(p('#/mon/hien-phap')).toBe('#/mon');
    expect(p('#/mon/hien-phap/khai-niem')).toBe('#/mon/hien-phap');
    expect(p('#/mon/hien-phap/khai-niem/chu-quyen')).toBe('#/mon/hien-phap/khai-niem');
    expect(p('#/hoc/hien-phap/hp-1')).toBe('#/mon/hien-phap');
    expect(p('#/on/hien-phap')).toBe('#/mon/hien-phap');
    expect(p('#/on')).toBe('#/');
    expect(p('#/bo/dat-coc')).toBe('#/luyen-de');
    expect(p('#/cai-dat')).toBe('#/toi');
    expect(p('#/khong-co')).toBe('#/');
  });
});

describe('createBackTracker', () => {
  it('mới vào: chưa có lịch sử; đi tới thì có; lùi về thì hết', () => {
    const t = createBackTracker('#/mon/hien-phap');
    expect(t.canGoBack()).toBe(false);
    t.visit('#/mon/hien-phap/khai-niem');
    expect(t.canGoBack()).toBe(true);
    t.visit('#/mon/hien-phap'); // lùi
    expect(t.canGoBack()).toBe(false);
  });
  it('bỏ qua hash lặp', () => {
    const t = createBackTracker('#/');
    t.visit('#/'); expect(t.depth).toBe(1);
  });
});

describe('hints', () => {
  beforeEach(() => localStorage.clear());
  it('chưa xem → đánh dấu → đã xem', () => {
    expect(hintSeen('session-glow')).toBe(false);
    markHintSeen('session-glow');
    expect(hintSeen('session-glow')).toBe(true);
  });
  it('lưu trữ bị chặn: không ném lỗi', () => {
    const orig = Object.getOwnPropertyDescriptor(window, 'localStorage')!;
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); }, configurable: true });
    try { expect(hintSeen('session-glow')).toBe(false); expect(() => markHintSeen('session-glow')).not.toThrow(); }
    finally { Object.defineProperty(window, 'localStorage', orig); }
  });
});

import { afterEach } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Shell from '$lib/ui/Shell.svelte';
import { route } from '$lib/router.svelte';

describe('Shell: nút Quay lại', () => {
  afterEach(() => { cleanup(); route.name = 'home'; route.params = {}; });
  const children = createRawSnippet(() => ({ render: () => '<p>nội dung</p>' }));
  it('trang gốc không có nút; trang con có nút aria-label "Quay lại"', () => {
    route.name = 'subjects'; route.params = {};
    const a = render(Shell, { props: { active: 'subjects', children } });
    expect(a.container.querySelector('.back-btn')).toBeNull();
    cleanup();
    route.name = 'subject'; route.params = { subject: 'hien-phap' };
    const b = render(Shell, { props: { active: 'subject', children } });
    expect(b.container.querySelector('button.back-btn')?.getAttribute('aria-label')).toBe('Quay lại');
  });
});
