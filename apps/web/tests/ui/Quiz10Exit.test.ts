import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/svelte';

const mkQ = (n: number) => ({ q: `Câu hỏi ${n}?`, options: ['A đúng', 'B', 'C', 'D'], answer: 0, explain: 'Giải thích', basis: 'Điều 1', why: ['Đúng: a.', 'Sai: b.', 'Sai: c.', 'Sai: d.'] });
const set = { id: 's1', title: 'Đặt cọc', group: 'dan-su', subtitle: '', questions: [mkQ(1), mkQ(2)] };
vi.mock('$lib/content/loader', () => ({ loadSet: async () => set, loadIndex: async () => ({ sets: [{ id: 's1', group: 'dan-su' }, { id: 's2', group: 'dan-su' }], subjects: [] }), loadTermIndex: async () => [] }));
vi.mock('$lib/store/stats', () => ({ stats: { best: async () => null, setBest: async () => {} } }));
vi.mock('$lib/store/progress-repo', () => ({ repo: { record: async () => ({}) } }));
vi.mock('$lib/fx/sfx', () => ({ sfx: { play() {} } }));
vi.mock('$lib/fx/haptics', () => ({ buzz() {} }));
vi.mock('$lib/router.svelte', () => ({ route: { name: 'quiz', params: { id: 's1' } }, hashFor: (n: string, p?: Record<string, string>) => `#/${n}/${Object.values(p ?? {}).join('/')}` }));

const Quiz10 = (await import('../../src/routes/Quiz10.svelte')).default;
const ready = (c: HTMLElement) => waitFor(() => expect(c.querySelector('.opt')).not.toBeNull());

describe('Quiz — thoát giữa bài và màn kết quả (đợt 3)', () => {
  afterEach(() => cleanup());
  it('chưa trả lời câu nào: nút ← đi thẳng (link), không hỏi', async () => {
    const { container } = render(Quiz10);
    await ready(container);
    expect(container.querySelector('a.qexit')?.getAttribute('href')).toBe('#/luyen-de');
  });
  it('đã trả lời: nút ← mở hộp xác nhận nêu số câu đã làm; "Làm tiếp" đóng hộp; phím 1–4 không chọn đáp án khi hộp mở', async () => {
    const { container, getByRole } = render(Quiz10);
    await ready(container);
    await fireEvent.click(container.querySelector('.opt')!);
    await fireEvent.click(container.querySelector('[data-next]')!); // sang câu 2, chưa trả lời
    await fireEvent.click(container.querySelector('button.qexit')!);
    const dlg = container.querySelector('dialog.sheet')!;
    await waitFor(() => expect(dlg.hasAttribute('open')).toBe(true));
    expect(dlg.textContent).toMatch(/1\/2 câu/);
    expect(dlg.querySelector('a[href="#/luyen-de"]')?.textContent).toMatch(/Thoát/);
    await fireEvent.keyDown(window, { key: '1' });
    expect(container.querySelector('.feedback')).toBeNull();
    await fireEvent.click(getByRole('button', { name: 'Làm tiếp' }));
    await waitFor(() => expect(dlg.hasAttribute('open')).toBe(false));
  });
  it('màn kết quả: đúng một nút chính trong hàng hành động; "Về Luyện đề" và "Chia sẻ" không phải nút khối', async () => {
    const { container } = render(Quiz10);
    await ready(container);
    for (let k = 0; k < 2; k++) {
      await fireEvent.click(container.querySelector('.opt')!);
      await fireEvent.click(container.querySelector('[data-next]')!);
    }
    await waitFor(() => expect(container.querySelector('.qr-body')).not.toBeNull());
    const row = container.querySelector('.qr-body .row')!;
    expect(row.querySelectorAll('.btn.primary')).toHaveLength(1);
    expect(row.querySelectorAll('.btn')).toHaveLength(2);
    const more = container.querySelector('.qr-more')!;
    expect(more.querySelector('a[href="#/luyen-de"]')?.textContent).toBe('Về Luyện đề');
    expect(more.querySelector('button')?.textContent).toMatch(/Chia sẻ/);
  });
  it('why: chọn sai thì hiện "Bạn chọn «…»" đúng phương án dù đã xáo; chọn đúng thì không; màn kết quả cũng hiện', async () => {
    const { container } = render(Quiz10);
    await ready(container);
    const opt = (t: string) => [...container.querySelectorAll<HTMLButtonElement>('.opt')].find((b) => b.textContent!.endsWith(t))!;
    await fireEvent.click(opt('B'));
    expect(container.querySelector('.feedback .why-wrong')?.textContent).toBe('Bạn chọn «B»: Sai: b.');
    await fireEvent.click(container.querySelector('[data-next]')!);
    await fireEvent.click(opt('A đúng'));
    expect(container.querySelector('.feedback .why-wrong')).toBeNull();
    await fireEvent.click(container.querySelector('[data-next]')!);
    await waitFor(() => expect(container.querySelector('.review')).not.toBeNull());
    expect(container.querySelector('.review .why-wrong')?.textContent).toBe('Bạn chọn «B»: Sai: b.');
  });
});
