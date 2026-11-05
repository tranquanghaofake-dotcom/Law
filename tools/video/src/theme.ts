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

// Cấu trúc bài (đo từ bản nghe thử chính thức 30 giây): đủ trống từ đầu, cụm 8 ô nhịp; cuối mỗi cụm bass tắt 1,5 phách
// rồi nện lại ở phách đầu cụm sau. Video chia đúng 5 cụm × 8 ô: chuyển phần lớn rơi vào đầu cụm.
// Cảnh theo ô nhịp (1 ô = 4 phách ≈ 2,16 giây). Thứ tự = thứ tự trong video.
export const SCENE_BARS = [
  ["hook", 2], ["logo", 2], ["thuVien", 4], // cụm 1
  ["hieuNhanh", 4], ["bac", 4], // cụm 2
  ["dapAn", 3], ["fsrs", 2], ["tienIch", 3], // cụm 3
  ["thapChuoi", 4], ["chuKy", 2], ["tuSach", 2], // cụm 4
  ["suNghiep", 5], ["cta", 3], // cụm 5
] as const;
export const PHRASE_BARS = 8;
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
/** Phách đầu mỗi cụm 8 ô (trừ cụm đầu) — chỗ nện mạnh nhất. */
export const PHRASES = Array.from({ length: TOTAL_BARS / PHRASE_BARS - 1 }, (_, i) => b((i + 1) * PHRASE_BARS * 4));
/** Khoảng bass tắt: 1,5 phách cuối mỗi cụm (bắt đầu ở phách 2,5 của ô thứ 8). */
export const GAPS = PHRASES.map((p) => [p - b(1.5), p] as const);
export const DROP = 0;

/** Độ "đập" theo phách: 1 lúc đánh, tắt dần; phách đầu ô mạnh hơn. */
export const beatPulse = (frame: number) => {
  if (frame >= TOTAL - b(2)) return 0;
  if (GAPS.some(([a, z]) => frame >= a && frame < z)) return 0;
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
