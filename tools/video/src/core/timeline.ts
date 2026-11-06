// Lưới nhịp: mọi mốc tính từ CHỈ SỐ phách rồi làm tròn (không cộng dồn phách đã làm tròn → không trôi nhịp).
import sb from "../storyboard.json";
import type { Storyboard } from "./types";

export const SB = sb as unknown as Storyboard;
export const FPS = SB.format.fps;
export const W = SB.format.width;
export const H = SB.format.height;
export const VERTICAL = H > W;
export const FPB = (FPS * 60) / SB.music.bpm;
const OFF = Math.round(SB.music.offsetSec * FPS);

/** Khung của phách thứ n tính từ đầu video. */
export const b = (beats: number) => OFF + Math.round(beats * FPB);
/** Độ dài (khung) của n phách bắt đầu tại phách `from` — dùng cho mốc trong cảnh. */
export const span = (from: number, n: number) => b(from + n) - b(from);

export type Placed = { index: number; id: string; from: number; dur: number; startBeat: number; phraseStart: boolean; phraseEnd: boolean };

export const PLACED: Placed[] = (() => {
  const out: Placed[] = [];
  let bar = 0;
  const pb = SB.music.phraseBars;
  SB.scenes.forEach((s, i) => {
    const from = i === 0 ? 0 : b(bar * 4);
    const end = b((bar + s.bars) * 4);
    out.push({ index: i, id: s.id, from, dur: end - from, startBeat: bar * 4, phraseStart: bar % pb === 0, phraseEnd: (bar + s.bars) % pb === 0 });
    bar += s.bars;
  });
  return out;
})();

export const TOTAL_BARS = SB.scenes.reduce((n, s) => n + s.bars, 0);
export const TOTAL = b(TOTAL_BARS * 4);
/** Phách đầu mỗi cụm nhạc (trừ cụm đầu) — chỗ nện mạnh nhất. */
export const PHRASES = Array.from({ length: Math.floor(TOTAL_BARS / SB.music.phraseBars) }, (_, i) => b((i + 1) * SB.music.phraseBars * 4)).filter((f) => f < TOTAL);
/** Khoảng bass tắt cuối mỗi cụm. */
export const GAPS = PHRASES.map((p) => [p - Math.round(SB.music.gapBeats * FPB), p] as const);

/** Độ đập theo phách (1 lúc đánh, tắt dần); phách đầu ô mạnh hơn; tắt trong khoảng bass tắt. */
export const beatPulse = (frame: number) => {
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
