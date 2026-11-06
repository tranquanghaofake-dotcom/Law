// Lưới thời gian. Chế độ "music": mọi mốc tính từ CHỈ SỐ phách rồi làm tròn (không cộng dồn → không trôi nhịp).
// Chế độ "voice": cảnh bắt đầu ở đầu câu nói (giong.json do scripts/canh_giong.py sinh); mốc { say } đổi ra phách trong cảnh.
import sb from "../storyboard.json";
import giong from "../giong.json";
import type { Say, Storyboard } from "./types";

export const SB = sb as unknown as Storyboard;
export const VOICE = SB.clock === "voice";
export const FPS = SB.format.fps;
export const W = SB.format.width;
export const H = SB.format.height;
export const VERTICAL = H > W;
/** Khung mỗi phách. Chế độ voice: phách chỉ là đơn vị cho hiệu ứng (bpm 120 → 0,5 s). */
export const FPB = (FPS * 60) / SB.music.bpm;
const OFF = VOICE ? 0 : Math.round(SB.music.offsetSec * FPS);

/** Khung của phách thứ n tính từ đầu video. */
export const b = (beats: number) => OFF + Math.round(beats * FPB);
/** Độ dài (khung) của n phách bắt đầu tại phách `from` — dùng cho mốc trong cảnh. */
export const span = (from: number, n: number) => b(from + n) - b(from);

/* ---------- giọng đọc ---------- */
type Word = { w: string; t: number; end: number };
type Sent = { id: string; text: string; start: number; end: number; words: Word[] };
const SENTS: Sent[] = ((giong as unknown as { sentences?: Sent[] }).sentences ?? []);
/** Khung im trước giọng. */
export const LEAD = VOICE ? Math.round((SB.voice?.leadSec ?? 0) * FPS) : 0;
const nrm = (s: string) => s.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
const sent = (id: string) => {
  const s = SENTS.find((x) => x.id === id);
  if (!s) throw new Error(`giong.json không có câu "${id}" — chạy lại scripts/canh_giong.py hoặc sửa "say" trong storyboard`);
  return s;
};
const findWords = (s: Sent, phrase: string[]) => {
  const ws = s.words.map((w) => nrm(w.w).join(" "));
  for (let i = 0; i + phrase.length <= ws.length; i++) if (phrase.every((p, k) => ws[i + k] === p)) return s.words[i].t;
  return null;
};
/** Khung tuyệt đối của một mốc lời. `scope` = các câu của cảnh (tìm trước), rồi mới tìm cả bài. */
export const sayFrame = (ref: string, scope: string[] = []): number => {
  if (!VOICE) throw new Error(`mốc { say: "${ref}" } chỉ dùng được khi storyboard có "clock": "voice"`);
  const m = ref.match(/^([a-z]\d+)(?::(.*))?$/);
  const toF = (sec: number) => LEAD + Math.round(sec * FPS);
  if (m && !m[2]) return toF(sent(m[1]).start);
  const phrase = nrm(m ? m[2] : ref);
  const pool = m ? [sent(m[1])] : [...scope.map(sent), ...SENTS.filter((s) => !scope.includes(s.id))];
  for (const s of pool) {
    const t = findWords(s, phrase);
    if (t !== null) return toF(t);
  }
  throw new Error(`không thấy từ "${phrase.join(" ")}" trong ${m ? `câu ${m[1]}` : "lời"} — từ phải có thật trong kịch bản`);
};
const isSay = (v: unknown): v is Say => !!v && typeof v === "object" && typeof (v as Say).say === "string";

export type Placed = { index: number; id: string; from: number; dur: number; startBeat: number; phraseStart: boolean; phraseEnd: boolean };

export const PLACED: Placed[] = (() => {
  const out: Placed[] = [];
  if (VOICE) {
    const starts = SB.scenes.map((s, i) => {
      if (!s.say?.length) throw new Error(`cảnh "${s.id}" thiếu "say" (chế độ voice)`);
      return i === 0 ? 0 : sayFrame(s.say[0]);
    });
    const last = SB.scenes[SB.scenes.length - 1].say!;
    const end = LEAD + Math.round((sent(last[last.length - 1]).end + (SB.voice?.tailSec ?? 1.5)) * FPS);
    SB.scenes.forEach((s, i) => {
      const from = starts[i];
      const to = i + 1 < starts.length ? starts[i + 1] : end;
      out.push({ index: i, id: s.id, from, dur: to - from, startBeat: from / FPB, phraseStart: false, phraseEnd: false });
    });
    return out;
  }
  let bar = 0;
  const pb = SB.music.phraseBars;
  SB.scenes.forEach((s, i) => {
    const bars = s.bars ?? 0;
    const from = i === 0 ? 0 : b(bar * 4);
    const end = b((bar + bars) * 4);
    out.push({ index: i, id: s.id, from, dur: end - from, startBeat: bar * 4, phraseStart: bar % pb === 0, phraseEnd: (bar + bars) % pb === 0 });
    bar += bars;
  });
  return out;
})();

/** props của từng cảnh với mọi { say } đã đổi ra phách tính từ đầu cảnh (số), để cảnh dùng như mốc thường. */
export const PROPS: Record<string, unknown>[] = PLACED.map((p) => {
  const scope = SB.scenes[p.index].say ?? [];
  const walk = (v: unknown): unknown => {
    if (isSay(v)) return (sayFrame(v.say, scope) - p.from) / FPB + (v.add ?? 0);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  return walk(SB.scenes[p.index].props) as Record<string, unknown>;
});

/** Khung tuyệt đối của một cue âm thanh: { at: { say } } hoặc beat (phách tuyệt đối). */
export const cueFrame = (c: { beat?: number; at?: Say }) => (c.at ? sayFrame(c.at.say) + Math.round((c.at.add ?? 0) * FPB) : b(c.beat ?? 0));

export const TOTAL_BARS = SB.scenes.reduce((n, s) => n + (s.bars ?? 0), 0);
export const TOTAL = VOICE ? PLACED[PLACED.length - 1].from + PLACED[PLACED.length - 1].dur : b(TOTAL_BARS * 4);
/** Phách đầu mỗi cụm nhạc (trừ cụm đầu) — chỗ nện mạnh nhất. Chế độ voice: không có cụm nhạc. */
export const PHRASES = VOICE ? [] : Array.from({ length: Math.floor(TOTAL_BARS / SB.music.phraseBars) }, (_, i) => b((i + 1) * SB.music.phraseBars * 4)).filter((f) => f < TOTAL);
/** Khoảng bass tắt cuối mỗi cụm. */
export const GAPS = PHRASES.map((p) => [p - Math.round(SB.music.gapBeats * FPB), p] as const);

/** Độ đập theo phách (1 lúc đánh, tắt dần); phách đầu ô mạnh hơn; tắt trong khoảng bass tắt. Chế độ voice: tắt (đập theo nhạc đè lên lời). */
export const beatPulse = (frame: number) => {
  if (VOICE) return 0;
  if (frame < OFF || frame >= TOTAL - b(2) + OFF) return 0;
  if (GAPS.some(([a, z]) => frame >= a && frame < z)) return 0;
  const x = (frame - OFF) / FPB;
  const i = Math.floor(x);
  return Math.exp(-((x - i) * FPB) / 6) * (i % 4 === 0 ? 1 : 0.55);
};

/** Số giả ngẫu nhiên ổn định theo khung (render lại ra y hệt). */
export const rand = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
