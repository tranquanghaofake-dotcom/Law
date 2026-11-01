import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import Profile from '../../src/routes/Profile.svelte';
import { route } from '$lib/router.svelte';

const emptyIndex = { subjects: [], conceptCount: {}, sets: [] };
const stubFetch = () => vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(emptyIndex), { status: 200, headers: { 'content-type': 'application/json' } })));

describe('Profile (2 tab)', () => {
  afterEach(() => { vi.unstubAllGlobals(); route.name = 'home'; });
  it('tab Tổng quan được chọn ở #/toi; có tab Cài đặt trỏ #/cai-dat; trạng thái rỗng khi chưa học', async () => {
    stubFetch(); route.name = 'profile';
    const { container } = render(Profile);
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(2);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(tabs[1].getAttribute('href')).toBe('#/cai-dat');
    await waitFor(() => expect(container.textContent).toContain('Chưa học khái niệm nào'));
  });
  it('ở #/cai-dat hiện nội dung Cài đặt trong tab', async () => {
    stubFetch(); route.name = 'settings';
    const { container } = render(Profile);
    expect(container.querySelectorAll('[role="tab"]')[1].getAttribute('aria-selected')).toBe('true');
    expect(container.querySelector('.settings')).not.toBeNull();
    await new Promise((r) => setTimeout(r, 30));
  });
});
