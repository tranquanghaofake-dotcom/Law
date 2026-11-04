import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import Subjects from '../../src/routes/Subjects.svelte';
import Quizzes from '../../src/routes/Quizzes.svelte';

describe('Subjects/Quizzes khi không tải được index', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('hiện thông báo lỗi thay vì treo "Đang tải…"', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 503 })));
    const a = render(Subjects);
    const b = render(Quizzes);
    await waitFor(() => expect(a.container.textContent).toMatch(/Không tải được/));
    await waitFor(() => expect(b.container.textContent).toMatch(/Không tải được/));
    expect(a.container.textContent).not.toMatch(/Đang tải/);
  });
});

describe('Hôm nay khi không tải được (H-5)', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('lời cho người dùng (không nhắc npm), role=alert, có nút Thử lại', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 503 })));
    const Home = (await import('../../src/routes/Home.svelte')).default;
    const { container, getByRole } = render(Home);
    await waitFor(() => expect(container.querySelector('[role=alert]')).not.toBeNull());
    expect(container.textContent).not.toMatch(/npm/);
    expect(container.querySelector('[role=alert]')?.textContent).toMatch(/Không tải được/);
    getByRole('button', { name: 'Thử lại' });
  });
});
