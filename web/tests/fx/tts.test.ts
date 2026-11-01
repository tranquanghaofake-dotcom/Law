import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTts } from '$lib/fx/tts.svelte';

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

class FakeUtterance { text: string; lang = ''; voice: any = null; rate = 1; constructor(t: string) { this.text = t; } }
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
