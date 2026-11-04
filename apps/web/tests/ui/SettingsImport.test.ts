import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/svelte';

const importAll = vi.fn(async () => {});
vi.mock('$lib/store/progress-repo', async (orig) => {
  const real = await orig<typeof import('$lib/store/progress-repo')>();
  return { parseExport: real.parseExport, repo: { importAll, exportAll: async () => '{}', all: async () => [{ conceptId: 'a' }, { conceptId: 'z' }] } };
});
vi.mock('$lib/ui/header.svelte', () => ({ refreshHeader: async () => {} }));
vi.mock('$lib/ui/sidenav.svelte', () => ({ refreshSidenav: async () => {} }));
vi.mock('$lib/ui/shelf.svelte', () => ({ refreshShelf: async () => {} }));

const Settings = (await import('../../src/routes/Settings.svelte')).default;
const card = { due: '2026-11-01T00:00:00.000Z' };
const good = JSON.stringify({ v: 1, concepts: [{ conceptId: 'a', subject: 'hp', level: 2, card }, { conceptId: 'b', subject: 'hp', level: 1, card }], reviews: [{ at: 1 }, { at: 2 }, { at: 3 }] });
const pick = (input: HTMLInputElement, text: string) => {
  const f = { name: 'sao-luu.json', text: async () => text }; // jsdom: File chưa có .text()
  Object.defineProperty(input, 'files', { value: [f], configurable: true });
  return fireEvent.change(input);
};

describe('Cài đặt — Nhập dữ liệu (P1 nhóm B)', () => {
  beforeEach(() => importAll.mockClear());
  it('chọn file chưa ghi ngay: hiện tóm tắt + số khái niệm sẽ bị ghi đè, chờ xác nhận', async () => {
    const { container, getByRole } = render(Settings);
    await pick(container.querySelector('input[type=file]')!, good);
    await waitFor(() => expect(container.textContent).toContain('2 khái niệm'));
    expect(container.textContent).toContain('3 lượt ôn');
    expect(container.textContent).toMatch(/1 khái niệm .*ghi đè/);
    expect(importAll).not.toHaveBeenCalled();
    await fireEvent.click(getByRole('button', { name: /Nhập và ghi đè/ }));
    await waitFor(() => expect(importAll).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(container.querySelector('[role=status]')?.textContent).toContain('Đã nhập 2 khái niệm, 3 lượt ôn'));
  });
  it('Huỷ thì không nhập', async () => {
    const { container, getByRole } = render(Settings);
    await pick(container.querySelector('input[type=file]')!, good);
    await waitFor(() => getByRole('button', { name: 'Huỷ' }));
    await fireEvent.click(getByRole('button', { name: 'Huỷ' }));
    expect(importAll).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain('Nhập và ghi đè');
  });
  it('file sai định dạng: báo lý do cụ thể, không hỏi xác nhận', async () => {
    const { container } = render(Settings);
    await pick(container.querySelector('input[type=file]')!, '{"x":1}');
    await waitFor(() => expect(container.querySelector('[role=alert]')?.textContent).toContain('không đúng định dạng'));
    expect(importAll).not.toHaveBeenCalled();
  });
});
