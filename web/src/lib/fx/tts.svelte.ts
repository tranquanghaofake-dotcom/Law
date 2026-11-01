/** Đọc đáp án bằng Web Speech API (giọng vi-VN có sẵn của trình duyệt). Không có giọng → available=false, speak() im lặng. */
export type Tts = { readonly available: boolean; speak(text: string): void; stop(): void; refresh(): void };

const PREFERRED = ['HoaiMy', 'NamMinh', 'Linh', 'Vietnam', 'Việt'];

export function createTts(): Tts {
  const synth: SpeechSynthesis | undefined = typeof speechSynthesis !== 'undefined' ? speechSynthesis : undefined;
  let voice: SpeechSynthesisVoice | null = null;
  const st = $state({ available: false });

  function pick(): void {
    if (!synth) return;
    const vi = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith('vi'));
    voice = vi.find((v) => PREFERRED.some((p) => v.name.includes(p))) ?? vi[0] ?? null;
    st.available = !!voice;
  }
  pick();
  // Chrome nạp danh sách giọng bất đồng bộ.
  synth?.addEventListener?.('voiceschanged', pick);

  return {
    get available() { return st.available; },
    refresh: pick,
    speak(text) {
      if (!synth || !voice) return;
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'vi-VN';
        u.rate = 1;
        try { u.voice = voice; } catch { /* một số trình duyệt không cho gán voice: vẫn đọc theo lang */ }
        synth.speak(u);
      } catch { /* trình duyệt chặn: bỏ qua */ }
    },
    stop() { synth?.cancel(); },
  };
}

export const tts: Tts = createTts();
