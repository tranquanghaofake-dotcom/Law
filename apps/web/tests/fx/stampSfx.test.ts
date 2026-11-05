import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('howler', () => ({ Howl: class { play() { return 1; } rate() {} volume() {} } }));
import { thudPlan } from '$lib/fx/stampSfx';
import { sfx } from '$lib/fx/sfx';
import { settings } from '$lib/store/settings.svelte';
import { TIMING } from '$lib/ui/session/reward';

let made = 0;
class FakeCtx {
  currentTime = 0; destination = {}; state = 'running';
  constructor() { made++; }
  resume() { return Promise.resolve(); }
  createOscillator() { return { frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: (x: unknown) => x, start() {}, stop() {}, type: '' }; }
  createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} }, connect: (x: unknown) => x }; }
  createBiquadFilter() { return { frequency: { setValueAtTime() {} }, Q: { setValueAtTime() {} }, connect: (x: unknown) => x, type: '' }; }
  createBuffer(_c: number, n: number) { return { getChannelData: () => new Float32Array(n) }; }
  createBufferSource() { return { buffer: null, connect: (x: unknown) => x, start() {}, stop() {} }; }
  sampleRate = 8000;
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); settings.sound = true; made = 0; sfx.stopCombo(); });

describe('thudPlan — tiếng đóng mộc tổng hợp', () => {
  it('mộc mốc chuỗi (heavy) trầm hơn, dài hơn, to hơn dấu "Đúng" thường', () => {
    const a = thudPlan(false), b = thudPlan(true);
    expect(b.body.from).toBeLessThan(a.body.from);
    expect(b.body.dur).toBeGreaterThan(a.body.dur);
    expect(b.body.gain).toBeGreaterThan(a.body.gain);
    for (const p of [a, b]) { expect(p.body.to).toBeLessThan(p.body.from); expect(p.slap.dur).toBeLessThan(0.12); }
  });
});

describe('sfx.stamp', () => {
  it('tắt âm thanh: không tạo AudioContext', () => {
    vi.stubGlobal('AudioContext', FakeCtx);
    settings.sound = false;
    sfx.stamp({ heavy: true });
    expect(made).toBe(0);
  });
  it('phát đúng lúc dấu chạm giấy; stopCombo huỷ tiếng đang chờ', () => {
    vi.useFakeTimers();
    vi.stubGlobal('AudioContext', FakeCtx);
    const spy = vi.fn();
    sfx.stamp({ delay: TIMING.sealLand, onplay: spy });
    vi.advanceTimersByTime(TIMING.sealLand - 1);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledTimes(1);
    sfx.stamp({ delay: 100, onplay: spy });
    sfx.stopCombo();
    vi.advanceTimersByTime(200);
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it('trình duyệt không có Web Audio: im lặng, không ném lỗi', () => {
    vi.stubGlobal('AudioContext', undefined);
    expect(() => sfx.stamp({})).not.toThrow();
  });
});
