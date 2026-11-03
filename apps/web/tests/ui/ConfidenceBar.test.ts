import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
afterEach(() => cleanup());
import ConfidenceBar from '$lib/ui/session/ConfidenceBar.svelte';

describe('ConfidenceBar', () => {
  it('có đúng ba nút Chắc / Tạm / Đoán, bấm một lần là chọn', async () => {
    const onpick = vi.fn();
    render(ConfidenceBar, { props: { onpick } });
    expect(screen.getAllByRole('button').map((b) => b.textContent?.replace(/[A-Z]$/, '').trim())).toEqual(['Chắc', 'Tạm', 'Đoán']);
    await fireEvent.click(screen.getByRole('button', { name: /Tạm/ }));
    expect(onpick).toHaveBeenCalledWith('tam');
  });
  it('phím tắt C / T / D chọn mức tương ứng', async () => {
    const onpick = vi.fn();
    render(ConfidenceBar, { props: { onpick } });
    await fireEvent.keyDown(window, { key: 'c' });
    await fireEvent.keyDown(window, { key: 'T' });
    await fireEvent.keyDown(window, { key: 'd' });
    expect(onpick.mock.calls.map((c) => c[0])).toEqual(['chac', 'tam', 'doan']);
  });
  it('không tranh phím 1–4/Enter và bỏ qua khi đang gõ trong ô nhập', async () => {
    const onpick = vi.fn();
    const input = document.createElement('input');
    document.body.appendChild(input);
    render(ConfidenceBar, { props: { onpick } });
    await fireEvent.keyDown(window, { key: '1' });
    await fireEvent.keyDown(window, { key: 'Enter' });
    await fireEvent.keyDown(input, { key: 'c' });
    expect(onpick).not.toHaveBeenCalled();
    input.remove();
  });
  it('bấm lại nút đang chọn để bỏ chọn; aria-pressed phản ánh lựa chọn', async () => {
    const onpick = vi.fn();
    render(ConfidenceBar, { props: { value: 'chac', onpick } });
    expect(screen.getByRole('button', { name: /Chắc/ }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: /Đoán/ }).getAttribute('aria-pressed')).toBe('false');
    await fireEvent.click(screen.getByRole('button', { name: /Chắc/ }));
    expect(onpick).toHaveBeenCalledWith(undefined);
  });
  it('disabled thì không chọn được', async () => {
    const onpick = vi.fn();
    render(ConfidenceBar, { props: { disabled: true, onpick } });
    await fireEvent.keyDown(window, { key: 'c' });
    expect(onpick).not.toHaveBeenCalled();
  });
});
