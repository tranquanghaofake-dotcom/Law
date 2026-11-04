/**
 * Giọng đọc phản hồi/định nghĩa.
 * 1) Ưu tiên mp3 dựng sẵn (giọng neural, sinh bằng tools/tts — xem tools/tts/README.md): chỉ dùng khi MỌI câu của lời đều có tệp,
 *    để không trộn hai giọng khác nhau trong một lời. Các câu được ghép thành một đoạn liền (cắt khoảng lặng, nghỉ đều SENTENCE_GAP).
 * 2) Không đủ → Web Speech API (giọng vi-VN có sẵn của trình duyệt), đọc từng cụm ý với tốc độ/cao độ/khoảng nghỉ riêng (lib/fx/prosody).
 * Không có giọng nào → available=false, speak() im lặng.
 */
import { phrases, sentences, textKey } from './prosody';

export type Tts = { readonly available: boolean; readonly ready: Promise<void>; speak(text: string): void; stop(): void; refresh(): void };
export type TtsOptions = {
  /** Danh sách khoá (textKey) có mp3 dựng sẵn. */
  loadManifest?: () => Promise<string[]>;
  /** Phát liền mạch các tệp của một lời (theo thứ tự), resolve khi phát xong. */
  playAll?: (urls: string[]) => Promise<void>;
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

  async function playRecorded(text: string, keys: string[], my: number): Promise<void> {
    if (!opts.playAll || my !== token) return;
    // lỗi tải/giải mã (không phải bị dừng) → đọc bằng giọng trình duyệt thay vì im lặng
    try { await opts.playAll(keys.map((k) => `${audioBase}${k}.mp3`)); } catch { if (my === token) speakPhrases(text, my); }
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
      if (keys.length && keys.every((k) => recorded.has(k)) && opts.playAll) { void playRecorded(text, keys, my); return; }
      speakPhrases(text, my);
    },
    stop: stopAll,
  };
}

/** Khoảng nghỉ giữa hai câu khi ghép (giây) và ngưỡng coi là im lặng khi cắt đầu/cuối mỗi câu. */
export const SENTENCE_GAP = 0.16;
const SILENCE = 0.012;
const EDGE_KEEP = 0.03;

/** Vị trí mẫu đầu và cuối có tiếng (biên độ > ngưỡng), giữ lại EDGE_KEEP giây hai đầu. Hàm thuần — có test. */
export function trimBounds(data: Float32Array, sampleRate: number, threshold = SILENCE): [number, number] {
  let a = 0, b = data.length - 1;
  while (a < data.length && Math.abs(data[a]) <= threshold) a++;
  while (b > a && Math.abs(data[b]) <= threshold) b--;
  if (a >= data.length) return [0, 0];
  const keep = Math.round(EDGE_KEEP * sampleRate);
  return [Math.max(0, a - keep), Math.min(data.length, b + 1 + keep)];
}

/**
 * Phát cả lời thành MỘT đoạn liền: tải song song mọi câu, cắt khoảng lặng đầu/cuối từng câu, ghép với khoảng nghỉ đều nhau.
 * Không có Web Audio → phát lần lượt bằng <audio> (đã tải trước tất cả).
 */
export function gaplessPlayer(): { playAll: (urls: string[]) => Promise<void>; stop: () => void } {
  const AC: typeof AudioContext | undefined = (globalThis as any).AudioContext ?? (globalThis as any).webkitAudioContext;
  let ctx: AudioContext | null = null;
  let src: AudioBufferSourceNode | null = null;
  let el: HTMLAudioElement | null = null;
  let gen = 0;
  const cache = new Map<string, Promise<AudioBuffer>>();
  const load = (c: AudioContext, url: string) => {
    let p = cache.get(url);
    if (!p) {
      p = fetch(url).then((r) => { if (!r.ok) throw new Error('tts'); return r.arrayBuffer(); }).then((buf) => c.decodeAudioData(buf));
      p.catch(() => cache.delete(url));
      cache.set(url, p);
      if (cache.size > 80) cache.delete(cache.keys().next().value!);
    }
    return p;
  };
  async function viaElement(urls: string[], my: number) {
    const els = urls.map((u) => { const a = new Audio(u); a.preload = 'auto'; return a; });
    for (const a of els) {
      if (my !== gen) return;
      el = a;
      await new Promise<void>((res, rej) => { a.onended = () => res(); a.onerror = () => rej(new Error('audio')); a.play().catch(rej); });
    }
  }
  return {
    async playAll(urls) {
      const my = ++gen;
      if (!AC) return viaElement(urls, my);
      // tạo/đánh thức AudioContext NGAY trong cử chỉ người dùng (trước mọi await) để trình duyệt cho phát
      ctx ??= new AC();
      if (ctx.state === 'suspended') void ctx.resume();
      const c = ctx;
      const bufs = await Promise.all(urls.map((u) => load(c, u)));
      if (my !== gen) return;
      const rate = c.sampleRate;
      const parts = bufs.map((b) => { const [s, e] = trimBounds(b.getChannelData(0), b.sampleRate); return { b, s, e }; }).filter((p) => p.e > p.s);
      const gap = Math.round(SENTENCE_GAP * rate);
      const len = parts.reduce((n, p) => n + Math.round(((p.e - p.s) / p.b.sampleRate) * rate), 0) + gap * Math.max(0, parts.length - 1);
      if (len <= 0) return;
      const out = c.createBuffer(1, len, rate);
      const ch = out.getChannelData(0);
      let at = 0;
      for (const p of parts) {
        const seg = p.b.getChannelData(0).subarray(p.s, p.e);
        if (p.b.sampleRate === rate) ch.set(seg, at);
        else for (let i = 0, n = Math.round((seg.length / p.b.sampleRate) * rate); i < n; i++) ch[at + i] = seg[Math.min(seg.length - 1, Math.floor((i * p.b.sampleRate) / rate))];
        at += Math.round((seg.length / p.b.sampleRate) * rate) + gap;
      }
      await new Promise<void>((res) => {
        const node = c.createBufferSource();
        node.buffer = out;
        node.connect(c.destination);
        node.onended = () => res();
        src = node;
        node.start();
      });
    },
    stop() {
      gen++;
      try { src?.stop(); } catch { /* đã dừng */ }
      src = null;
      try { el?.pause(); } catch { /* bỏ qua */ }
    },
  };
}

function browserTts(): Tts {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return createTts();
  const base = `${import.meta.env.BASE_URL ?? '/'}tts/`;
  const player = gaplessPlayer();
  return createTts({
    audioBase: base,
    playAll: player.playAll,
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
