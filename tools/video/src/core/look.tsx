// Giao diện lấy từ storyboard.theme + font Google có bộ chữ tiếng Việt + công cụ chung cho cảnh.
import React, { createContext, useContext } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as beVietnam } from "@remotion/google-fonts/BeVietnamPro";
import { loadFont as notoDisplay } from "@remotion/google-fonts/NotoSerifDisplay";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { loadFont as montserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as lexend } from "@remotion/google-fonts/Lexend";
import { loadFont as playfair } from "@remotion/google-fonts/PlayfairDisplay";
import type { FontKey, Theme } from "./types";
import { b, H, SB, VERTICAL, W } from "./timeline";

type Wt = "500" | "700" | "800";
const opts = { weights: ["500", "700", "800"] as Wt[], subsets: ["vietnamese", "latin"] as ("vietnamese" | "latin")[] };
const FONTS: Record<FontKey, () => string> = {
  "be-vietnam-pro": () => beVietnam("normal", opts).fontFamily,
  "noto-serif-display": () => notoDisplay("normal", { weights: ["700", "800"] as Wt[], subsets: ["vietnamese", "latin"] as ("vietnamese" | "latin")[] }).fontFamily,
  inter: () => inter("normal", opts).fontFamily,
  montserrat: () => montserrat("normal", opts).fontFamily,
  lexend: () => lexend("normal", opts).fontFamily,
  "playfair-display": () => playfair("normal", { weights: ["700", "800"] as Wt[], subsets: ["vietnamese", "latin"] as ("vietnamese" | "latin")[] }).fontFamily,
};
export const T = SB.theme;
export const DISPLAY = FONTS[T.display]();
export const UI = T.ui === T.display ? DISPLAY : FONTS[T.ui]();

/** Cỡ chữ theo khung: tiêu đề ~4–9 % chiều cao (dọc ×1,35), không chữ cần đọc nào dưới 2,6 % cạnh ngắn. */
const SHORT = Math.min(W, H);
export const SIZE = VERTICAL
  ? { hero: Math.round(SHORT * 0.15), title: Math.round(SHORT * 0.105), sub: Math.round(SHORT * 0.044), body: Math.round(SHORT * 0.036), min: Math.round(SHORT * 0.026) }
  : // ngang: tính theo chiều cao khung — tiêu đề ~10 %, chữ chốt ~16 % (bản 0,075 cũ để lại khoảng trống chết)
    { hero: Math.round(SHORT * 0.16), title: Math.round(SHORT * 0.1), sub: Math.round(SHORT * 0.046), body: Math.round(SHORT * 0.04), min: Math.round(SHORT * 0.028) };
/** Vùng an toàn: dọc theo TikTok/Reels (trên 168, chữ trong dải tới 1330, chừa cột nút bên phải); ngang 5 % mép. */
export const SAFE = VERTICAL
  ? { top: 200, bottom: H - 1330, left: 80, right: 150 }
  : { top: Math.round(H * 0.08), bottom: Math.round(H * 0.08), left: Math.round(W * 0.06), right: Math.round(W * 0.06) };
export const SAFE_PAD: React.CSSProperties = { paddingTop: SAFE.top, paddingLeft: SAFE.left, paddingRight: SAFE.right };

/** Đổi tên màu ("ink", "accent"…) hoặc mã màu sang màu thật theo bảng màu `pal` (bảng của cảnh). */
export const color = (k: unknown, fallback?: string, pal: Theme = T): string => {
  const fb = fallback ?? pal.ink;
  if (typeof k !== "string") return fb;
  const map: Record<string, string> = { ink: pal.ink, inkSoft: pal.inkSoft, accent: pal.accent, accent2: pal.accent2, ground: pal.ground, ground2: pal.ground2 };
  return map[k] ?? k;
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1); // đến: đuôi dài (expo.out)
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1); // máy quay, tràn màu
export const easeIn = Easing.bezier(0.4, 0, 1, 1); // rời / lao qua

/** Tách màu RGB trên chữ — Main đặt biến --rgb theo cú nện (rẻ hơn nhiều so với lọc SVG cả khung). */
export const RGB_SHADOW = "calc(var(--rgb, 0) * 1px) 0 0 rgba(255,30,70,.7), calc(var(--rgb, 0) * -1px) 0 0 rgba(30,220,255,.7)";
export const H1: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 800, lineHeight: 1.04, letterSpacing: "-0.02em", textShadow: RGB_SHADOW };

/** Bảng màu theo cảnh: cảnh nền "dark" đảo ink ↔ ground để chữ luôn đủ tương phản. */
export type Palette = typeof SB.theme;
export const ThemeCtx = createContext<Palette>(SB.theme);
export const useT = () => useContext(ThemeCtx);
/** Màu theo bảng của cảnh đang dựng. */
export const useCol = () => {
  const pal = useContext(ThemeCtx);
  return (k: unknown, fallback?: string) => color(k, fallback, pal);
};
export const invert = (t: Palette): Palette => ({ ...t, ink: t.ground, ground: t.ink, inkSoft: mix(t.ground, t.ink, 0.35), ground2: mix(t.ink, t.ground, 0.12) });
function mix(a: string, b2: string, k: number) {
  const h = (x: string) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const [x, y] = [h(a), h(b2)];
  return "#" + x.map((v, i) => Math.round(v * (1 - k) + y[i] * k).toString(16).padStart(2, "0")).join("");
}

/** Ngữ cảnh cảnh: phách đầu cảnh, để quy đổi "phách trong cảnh" → khung trong cảnh, khớp lưới tuyệt đối. */
export const SceneCtx = createContext({ startBeat: 0, from: 0 });
export const useBeats = () => {
  const { startBeat, from } = useContext(SceneCtx);
  return (beat: number) => b(startBeat + beat) - from;
};

export const usePop = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // lò xo damping ~0.75 (đọc như "cao cấp"): vị trí/cỡ được nảy, độ mờ và màu thì không
  return (at: number, damping = 14) => spring({ frame: frame - at, fps, config: { damping, stiffness: 170, mass: 0.9 } });
};
export const fadeIn = (frame: number, at: number, len = 10) => interpolate(frame, [at, at + len], [0, 1], clamp);
/** Vào bằng nhoè → nét (không trượt lên — mặc định "slide-up" là dấu hiệu video máy tạo). */
export const blurIn = (frame: number, at: number, len = 9): React.CSSProperties => {
  const p = interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: easeOut });
  return { opacity: frame >= at ? Math.min(1, p * 1.6) : 0, filter: p < 0.98 ? `blur(${((1 - p) * 10).toFixed(1)}px)` : undefined };
};

export const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
export const num = (v: unknown, d = 0) => (typeof v === "number" ? v : d);
export const arr = <X,>(v: unknown): X[] => (Array.isArray(v) ? (v as X[]) : []);
