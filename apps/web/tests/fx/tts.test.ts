import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTts } from '$lib/fx/tts.svelte';
import { textKey } from '$lib/fx/prosody';

function fakeSynth(voices: { lang: string; name: string }[]) {
  const speak = vi.fn();
  const synth = {
    getVoices: () => voices.map((v) => ({ ...v, default: false, localService: true, voiceURI: v.name })),
    speak,
    cancel: vi.fn(),
    addEventListener: vi.fn(),
  };
  return { synth, speak };
}

class FakeUtterance { text: string; lang = ''; voice: any = null; rate = 1; pitch = 1; onend: (() => void) | null = null; onerror: (() => void) | null = null; constructor(t: string) { this.text = t; } }
(globalThis as any).SpeechSynthesisUtterance = FakeUtterance;

afterEach(() => { delete (globalThis as any).speechSynthesis; });

describe('tts', () => {
  it('không có giọng vi → available=false', () => {
    const { synth } = fakeSynth([{ lang: 'en-US', name: 'Samantha' }]);
    (globalThis as any).speechSynthesis = synth;
    expect(createTts().available).toBe(false);
  });
  it('có giọng vi-VN → speak với lang vi-VN và giọng đó', () => {
    const { synth, speak } = fakeSynth([{ lang: 'en-US', name: 'Samantha' }, { lang: 'vi-VN', name: 'Linh' }]);
    (globalThis as any).speechSynthesis = synth;
    const tts = createTts();
    expect(tts.available).toBe(true);
    tts.speak('Hiến pháp');
    expect(speak).toHaveBeenCalledTimes(1);
    const u = speak.mock.calls[0][0];
    expect(u.lang).toBe('vi-VN');
    expect(u.text).toBe('Hiến pháp');
    expect(u.voice?.name).toBe('Linh');
  });
  it('không có speechSynthesis → không ném lỗi', () => {
    const tts = createTts();
    expect(tts.available).toBe(false);
    expect(() => tts.speak('x')).not.toThrow();
  });
});

describe('tts — reactive khi voiceschanged (I5)', () => {
  it('available chuyển true sau khi danh sách giọng nạp muộn', () => {
    let voices: any[] = [];
    let handler: (() => void) | null = null;
    (globalThis as any).speechSynthesis = { getVoices: () => voices, speak: vi.fn(), cancel: vi.fn(), addEventListener: (_: string, h: () => void) => { handler = h; } };
    const tts = createTts();
    expect(tts.available).toBe(false);
    voices = [{ lang: 'vi-VN', name: 'Linh' }];
    handler!();
    expect(tts.available).toBe(true);
  });
});

describe('tts — đọc theo cụm có nhấn nhá', () => {
  it('đọc lần lượt từng cụm, cụm sau chờ cụm trước xong + khoảng nghỉ', async () => {
    vi.useFakeTimers();
    const { synth, speak } = fakeSynth([{ lang: 'vi-VN', name: 'Linh' }]);
    (globalThis as any).speechSynthesis = synth;
    const tts = createTts();
    tts.speak('Chính xác. Hiến pháp có hiệu lực cao nhất.');
    expect(speak).toHaveBeenCalledTimes(1);
    const first = speak.mock.calls[0][0];
    expect(first.text).toBe('Chính xác.');
    expect(first.pitch).toBeGreaterThan(1);
    first.onend?.();
    await vi.advanceTimersByTimeAsync(1000);
    expect(speak).toHaveBeenCalledTimes(2);
    expect(speak.mock.calls[1][0].text).toBe('Hiến pháp có hiệu lực cao nhất.');
    vi.useRealTimers();
  });
  it('stop() giữa chừng → không đọc cụm tiếp', async () => {
    vi.useFakeTimers();
    const { synth, speak } = fakeSynth([{ lang: 'vi-VN', name: 'Linh' }]);
    (globalThis as any).speechSynthesis = synth;
    const tts = createTts();
    tts.speak('Một, hai.');
    speak.mock.calls[0][0].onend?.();
    tts.stop();
    await vi.advanceTimersByTimeAsync(1000);
    expect(speak).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('tts — giọng dựng sẵn (mp3)', () => {
  it('có đủ mp3 cho mọi câu → phát mp3, không dùng giọng trình duyệt', async () => {
    const { synth, speak } = fakeSynth([{ lang: 'vi-VN', name: 'Linh' }]);
    (globalThis as any).speechSynthesis = synth;
    const played: string[] = [];
    const tts = createTts({ loadManifest: async () => [textKey('Chính xác.'), textKey('Hiến pháp.')], play: async (url) => { played.push(url); } , audioBase: '/tts/' });
    await tts.ready;
    expect(tts.available).toBe(true);
    tts.speak('Chính xác. Hiến pháp.');
    await new Promise((r) => setTimeout(r, 0));
    expect(speak).not.toHaveBeenCalled();
    expect(played).toEqual([`/tts/${textKey('Chính xác.')}.mp3`, `/tts/${textKey('Hiến pháp.')}.mp3`]);
  });
  it('thiếu mp3 cho một câu → đọc cả lời bằng giọng trình duyệt (không trộn hai giọng)', async () => {
    const { synth, speak } = fakeSynth([{ lang: 'vi-VN', name: 'Linh' }]);
    (globalThis as any).speechSynthesis = synth;
    const played: string[] = [];
    const tts = createTts({ loadManifest: async () => [textKey('Chính xác.')], play: async (url) => { played.push(url); } });
    await tts.ready;
    tts.speak('Chính xác. Câu lạ.');
    expect(played).toEqual([]);
    expect(speak).toHaveBeenCalledTimes(1);
  });
  it('không có giọng vi nhưng có mp3 → vẫn available', async () => {
    const { synth } = fakeSynth([]);
    (globalThis as any).speechSynthesis = synth;
    const tts = createTts({ loadManifest: async () => ['abcd1234'], play: async () => {} });
    await tts.ready;
    expect(tts.available).toBe(true);
  });
});
