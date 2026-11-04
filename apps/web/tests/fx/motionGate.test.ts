import { describe, it, expect, vi, afterEach } from 'vitest';
import { motionState, motionGate } from '$lib/fx/motionGate';

describe('motionState', () => {
  it('ngoài màn hình hoặc tab ẩn → off', () => {
    expect(motionState(false, true, false)).toBe('off');
    expect(motionState(true, false, false)).toBe('off');
  });
  it('đang thấy: chạy, lắng thì rest', () => {
    expect(motionState(true, true, false)).toBe('run');
    expect(motionState(true, true, true)).toBe('rest');
  });
});

describe('motionGate', () => {
  afterEach(() => vi.useRealTimers());
  it('lắng sau `settle` ms, rê chuột vào thì chạy lại', () => {
    vi.useFakeTimers();
    const el = document.createElement('div');
    const g = motionGate(el, { settle: 1000 });
    expect(el.getAttribute('data-motion')).toBe('run');
    vi.advanceTimersByTime(1001);
    expect(el.getAttribute('data-motion')).toBe('rest');
    el.dispatchEvent(new Event('pointerenter'));
    expect(el.getAttribute('data-motion')).toBe('run');
    g.destroy();
  });
  it('không đặt settle thì không bao giờ lắng', () => {
    vi.useFakeTimers();
    const el = document.createElement('div');
    motionGate(el);
    vi.advanceTimersByTime(60_000);
    expect(el.getAttribute('data-motion')).toBe('run');
  });
});

describe('motionGate — update', () => {
  it('đổi settle về 0 (vd. đang chạy lễ nhận chức) thì đánh thức khối đã lắng và không lắng nữa', () => {
    vi.useFakeTimers();
    const el = document.createElement('div');
    const g = motionGate(el, { settle: 1000 });
    vi.advanceTimersByTime(1001);
    expect(el.getAttribute('data-motion')).toBe('rest');
    g.update({ settle: 0 });
    expect(el.getAttribute('data-motion')).toBe('run');
    vi.advanceTimersByTime(60_000);
    expect(el.getAttribute('data-motion')).toBe('run');
    vi.useRealTimers();
  });
});
