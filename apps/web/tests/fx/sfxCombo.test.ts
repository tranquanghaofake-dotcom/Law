import { afterEach, describe, expect, it, vi } from 'vitest';

const plays: string[] = [];
vi.mock('howler', () => ({
  Howl: class { o: { src: string[] }; constructor(o: { src: string[] }) { this.o = o; } play() { plays.push(this.o.src[0]); return 1; } rate() {} volume() {} },
}));
import { sfx } from '$lib/fx/sfx';
import { settings } from '$lib/store/settings.svelte';

afterEach(() => { vi.useRealTimers(); settings.sound = true; plays.length = 0; sfx.stopCombo(); });

describe('sfx.playCombo', () => {
  it('settings.sound=false: im lặng, kể cả lớp trễ', () => {
    vi.useFakeTimers();
    settings.sound = false;
    sfx.playCombo(13);
    vi.advanceTimersByTime(1000);
    expect(plays).toEqual([]);
  });
  it('lớp đầu phát ngay; tắt âm giữa chừng thì lớp trễ không phát', () => {
    vi.useFakeTimers();
    sfx.playCombo(2);
    expect(plays).toHaveLength(1);
    settings.sound = false;
    vi.advanceTimersByTime(500);
    expect(plays).toHaveLength(1);
  });
  it('stopCombo huỷ lớp đang chờ', () => {
    vi.useFakeTimers();
    sfx.playCombo(13);
    const first = plays.length;
    sfx.stopCombo();
    vi.advanceTimersByTime(1000);
    expect(plays).toHaveLength(first);
  });
});
