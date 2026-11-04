import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Shell from '$lib/ui/Shell.svelte';
import { route } from '$lib/router.svelte';

vi.mock('$lib/ui/header.svelte', async (o) => ({ ...(await o<object>()), refreshHeader: async () => {} }));
vi.mock('$lib/ui/sidenav.svelte', async (o) => ({ ...(await o<object>()), refreshSidenav: async () => {} }));
vi.mock('$lib/fx/sfx', () => ({ sfx: { play() {}, preload() {} } }));
vi.mock('$lib/ui/shelf.svelte', async (o) => ({ ...(await o<object>()), refreshShelf: async () => {} }));

describe('Link "Bỏ qua tới nội dung" (C7, WCAG 2.4.1)', () => {
  afterEach(() => { cleanup(); route.name = 'home'; route.params = {}; });
  it('là phần tử focus được đầu tiên; bấm thì focus vào h1 trong main, KHÔNG đổi hash (router dùng hash)', async () => {
    const before = location.hash; // không gán hash: hashchange gọi matchMedia (jsdom không có)
    route.name = 'subjects'; route.params = {};
    const children = createRawSnippet(() => ({ render: () => '<h1>Môn học</h1>' }));
    const { container } = render(Shell, { props: { active: 'subjects', children }, target: document.body });
    const first = container.querySelector('a[href], button');
    expect(first?.classList.contains('skip-link')).toBe(true);
    expect(first?.textContent).toBe('Bỏ qua tới nội dung');
    await fireEvent.click(first!);
    await waitFor(() => expect(document.activeElement?.tagName).toBe('H1'));
    expect(location.hash).toBe(before);
  });
});

describe('Cài đặt báo "Đã lưu" (Success Feedback)', () => {
  afterEach(() => cleanup());
  it('đổi một mục: hiện "Đã lưu" cạnh mục đó và báo qua vùng role=status; tự ẩn sau ~3 s', async () => {
    vi.useFakeTimers();
    const Settings = (await import('../../src/routes/Settings.svelte')).default;
    const { container } = render(Settings);
    const box = container.querySelector('label.setting input[type=checkbox]') as HTMLInputElement;
    await fireEvent.click(box);
    expect(box.closest('label')?.querySelector('.saved')?.textContent).toBe('Đã lưu');
    expect(container.querySelector('.settings [role=status].sr-only')?.textContent).toMatch(/Đã lưu/);
    await vi.advanceTimersByTimeAsync(3200);
    expect(container.querySelector('.saved')).toBeNull();
    vi.useRealTimers();
  });
});
