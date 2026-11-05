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

export const UI = loadUi("normal", { weights: ["500", "700", "800"], subsets: ["vietnamese", "latin"] }).fontFamily;
export const DISPLAY = loadDisplay("normal", { weights: ["700", "800"], subsets: ["vietnamese", "latin"] }).fontFamily;

// Nhịp theo bài "Aura Farming" (Mustafa Saboori): 111 BPM (Tunebat), dựng ở 60 fps.
// 1 phách = 32,43 khung (không chẵn) → mọi mốc tính bằng b(n) rồi làm tròn, không cộng dồn sai số.
export const FPS = 60;
export const BPM = 111;
export const FPB = (FPS * 60) / BPM;
export const b = (beats: number) => Math.round(beats * FPB);

// Cảnh theo ô nhịp (1 ô = 4 phách ≈ 2,16 giây). Thứ tự = thứ tự trong video.
export const SCENE_BARS = [
  ["hook", 2],
  ["logo", 2],
  ["thuVien", 3],
  ["hieuNhanh", 4],
  ["bac", 3],
  ["dapAn", 3],
  ["fsrs", 2],
  ["tienIch", 2],
  ["thapChuoi", 4],
  ["chuKy", 2],
  ["tuSach", 2],
  ["suNghiep", 5],
  ["cta", 3],
] as const;
export type SceneKey = (typeof SCENE_BARS)[number][0];

export const SCENES = (() => {
  const out = {} as Record<SceneKey, { from: number; dur: number; bar: number }>;
  let bar = 0;
  for (const [k, n] of SCENE_BARS) {
    out[k] = { from: b(bar * 4), dur: b((bar + n) * 4) - b(bar * 4), bar };
    bar += n;
  }
  return out;
})();
export const TOTAL_BARS = SCENE_BARS.reduce((s, [, n]) => s + n, 0);
export const TOTAL = b(TOTAL_BARS * 4);
/** Ô nhịp vào trống (drop) — cảnh logo. */
export const DROP = SCENES.logo.from;

/** Độ "đập" theo phách: 1 lúc đánh, tắt dần; phách đầu ô mạnh hơn. */
export const beatPulse = (frame: number) => {
  if (frame < DROP || frame >= SCENES.cta.from + b(8)) return 0;
  const x = frame / FPB;
  const i = Math.floor(x);
  const since = (x - i) * FPB;
  return Math.exp(-since / 6) * (i % 4 === 0 ? 1 : 0.55);
};

/** Số giả ngẫu nhiên ổn định theo khung (để render lại ra y hệt). */
export const rand = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
