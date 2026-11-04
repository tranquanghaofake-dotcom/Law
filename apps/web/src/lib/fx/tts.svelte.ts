/**
 * Giọng đọc phản hồi/định nghĩa.
 * 1) Ưu tiên mp3 dựng sẵn (giọng neural, sinh bằng tools/tts — xem tools/tts/README.md): chỉ dùng khi MỌI câu của lời đều có tệp,
 *    để không trộn hai giọng khác nhau trong một lời.
 * 2) Không đủ → Web Speech API (giọng vi-VN có sẵn của trình duyệt), đọc từng cụm ý với tốc độ/cao độ/khoảng nghỉ riêng (lib/fx/prosody).
 * Không có giọng nào → available=false, speak() im lặng.
 */
import { phrases, sentences, textKey } from './prosody';

export type Tts = { readonly available: boolean; readonly ready: Promise<void>; speak(text: string): void; stop(): void; refresh(): void };
export type TtsOptions = {
  /** Danh sách khoá (textKey) có mp3 dựng sẵn. */
  loadManifest?: () => Promise<string[]>;
  /** Phát một tệp, resolve khi phát xong. */
  play?: (url: string) => Promise<void>;
  /** Dừng tệp đang phát. */
  stopAudio?: () => void;
  audioBase?: string;
};

const PREFERRED = ['HoaiMy', 'NamMinh', 'An', 'Linh', 'Vietnam', 'Việt'];

export function createTts(opts: TtsOptions = {}): Tts {
  const synth: SpeechSynthesis | undefined = typeof speechSynthesis !== 'undefined' ? speechSynthesis : undefined;
  const audioBase = opts.audioBase ?? '/tts/';
  let voice: SpeechSynthesisVoice | null = null;
  let recorded = new Set<string>();
  let token = 0; // tăng mỗi lần speak/stop → chuỗi cụm cũ tự dừng
  let timer: ReturnType<typeof setTimeout> | undefined;
  const st = $state({ voice: false, recorded: false });

  function pick(): void {
    if (!synth) return;
    const vi = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith('vi'));
    // Giọng "Online (Natural)" của Edge tự nhiên hơn hẳn giọng offline: ưu tiên trước.
    voice = vi.find((v) => /natural|online/i.test(v.name)) ?? vi.find((v) => PREFERRED.some((p) => v.name.includes(p))) ?? vi[0] ?? null;
    st.voice = !!voice;
  }
  pick();
  // Chrome nạp danh sách giọng bất đồng bộ.
  synth?.addEventListener?.('voiceschanged', pick);

  const ready = (opts.loadManifest?.() ?? Promise.resolve([] as string[]))
    .then((keys) => { recorded = new Set(keys); st.recorded = recorded.size > 0; })
    .catch(() => { /* không có giọng dựng sẵn: dùng giọng trình duyệt */ });

  function stopAll(): void {
    token++;
    clearTimeout(timer);
    try { synth?.cancel(); } catch { /* bỏ qua */ }
    opts.stopAudio?.();
  }

  async function playRecorded(keys: string[], my: number): Promise<void> {
    const play = opts.play;
    if (!play) return;
    for (const k of keys) {
      if (my !== token) return;
      try { await play(`${audioBase}${k}.mp3`); } catch { return; }
    }
  }

  function speakPhrases(text: string, my: number): void {
    if (!synth || !voice) return;
    const list = phrases(text);
    const step = (i: number) => {
      if (my !== token || i >= list.length) return;
      const p = list[i];
      try {
        const u = new SpeechSynthesisUtterance(p.text);
        u.lang = 'vi-VN';
        u.rate = p.rate;
        u.pitch = p.pitch;
        try { u.voice = voice; } catch { /* một số trình duyệt không cho gán voice: vẫn đọc theo lang */ }
        const next = () => { if (my === token) timer = setTimeout(() => step(i + 1), p.pauseAfter); };
        u.onend = next;
        u.onerror = next;
        synth.speak(u);
      } catch { /* trình duyệt chặn: bỏ qua */ }
    };
    step(0);
  }

  return {
    get available() { return st.voice || st.recorded; },
    ready,
    refresh: pick,
    speak(text) {
      stopAll();
      const my = token;
      const keys = sentences(text).map(textKey);
      if (keys.length && keys.every((k) => recorded.has(k)) && opts.play) { void playRecorded(keys, my); return; }
      speakPhrases(text, my);
    },
    stop: stopAll,
  };
}

/** Phát mp3 bằng một <audio> dùng lại; dừng được giữa chừng. */
function defaultPlayer(): { play: (url: string) => Promise<void>; stop: () => void } {
  let el: HTMLAudioElement | null = null;
  let cancel: (() => void) | null = null;
  return {
    play(url) {
      return new Promise<void>((resolve, reject) => {
        el ??= new Audio();
        el.src = url;
        el.onended = () => resolve();
        el.onerror = () => reject(new Error('audio'));
        cancel = () => reject(new Error('stopped'));
        el.play().catch(reject);
      });
    },
    stop() { try { el?.pause(); } catch { /* bỏ qua */ } cancel?.(); },
  };
}

function browserTts(): Tts {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return createTts();
  const base = `${import.meta.env.BASE_URL ?? '/'}tts/`;
  const player = defaultPlayer();
  return createTts({
    audioBase: base,
    play: player.play,
    stopAudio: player.stop,
    loadManifest: async () => {
      const r = await fetch(`${base}manifest.json`);
      if (!r.ok) return [];
      const j = (await r.json()) as { keys?: string[] };
      return Array.isArray(j.keys) ? j.keys : [];
    },
  });
}

export const tts: Tts = browserTts();
