import { loadFont as loadUi } from "@remotion/google-fonts/BeVietnamPro";
import { loadFont as loadDisplay } from "@remotion/google-fonts/NotoSerifDisplay";

// Bảng màu "Văn Miếu" — lấy đúng token trong apps/web/src/app.css.
export const C = {
  ink: "#14213d",
  inkDeep: "#0b1326",
  paper: "#f7f4ee",
  card: "#ffffff",
  muted: "#5b6475",
  line: "#e3ddd1",
  accent: "#d97a1e",
  seal: "#b3261e",
  ok: "#1f7a4d",
  okBg: "#e5f4ec",
  gold: "#f2c14e",
  gold50: "#fff6d2",
  wood: "#4b2e18",
};

export const UI = loadUi("normal", {
  weights: ["500", "700", "800"],
  subsets: ["vietnamese", "latin"],
}).fontFamily;

export const DISPLAY = loadDisplay("normal", {
  weights: ["700", "800"],
  subsets: ["vietnamese", "latin"],
}).fontFamily;

// Nhịp nhạc: 150 BPM ở 30 fps → 1 phách = 12 khung, 1 ô nhịp = 48 khung, 1 bước 16tel = 3 khung.
export const FPS = 30;
export const BEAT = 12;
export const BAR = 48;
export const TOTAL = 20 * BAR; // 960 khung = 32 giây

// Khung cảnh (khung bắt đầu, độ dài) — mọi điểm cắt rơi đúng phách.
export const SCENES = {
  hook: [0, 2 * BAR],
  logo: [2 * BAR, 2 * BAR],
  mon: [4 * BAR, 3 * BAR],
  bac: [7 * BAR, 4 * BAR],
  fsrs: [11 * BAR, 2 * BAR],
  de: [13 * BAR, 2 * BAR],
  chuc: [15 * BAR, 2 * BAR],
  cta: [17 * BAR, 3 * BAR],
} as const;

/** Độ "đập" theo trống kick (bước 0, 6, 10 của mỗi ô) — 1 lúc đánh, tắt dần về 0. */
export const kickPulse = (frame: number) => {
  if (frame < 2 * BAR || frame >= 19 * BAR) return 0;
  const inBar = frame % BAR;
  let p = 0;
  for (const k of [0, 18, 30]) if (inBar >= k) p = Math.max(p, Math.exp(-(inBar - k) / 3.5));
  return p;
};

/** Số giả ngẫu nhiên ổn định theo khung (để render lại ra y hệt). */
export const rand = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
