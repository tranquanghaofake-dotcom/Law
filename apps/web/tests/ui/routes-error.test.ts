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
