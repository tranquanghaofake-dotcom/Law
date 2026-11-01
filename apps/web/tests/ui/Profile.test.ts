import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import Profile from '../../src/routes/Profile.svelte';

const emptyIndex = { subjects: [], conceptCount: {}, sets: [] };

describe('Profile', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('có đường vào Cài đặt (#/cai-dat) vì header cũ đã bỏ', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(emptyIndex), { status: 200, headers: { 'content-type': 'application/json' } })));
    const { container } = render(Profile);
    expect(container.querySelector('a[href="#/cai-dat"]')).not.toBeNull();
    // đợi load() chạy xong để không rò rỉ promise sang file test kế tiếp (pool vmThreads dùng chung worker)
    await new Promise((r) => setTimeout(r, 60));
  });
});
