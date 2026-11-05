import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import icons from "./memo-icons.json";
import { C, DISPLAY, rand, UI } from "./theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const RGB_SHADOW = "calc(var(--rgb, 0) * 1px) 0 0 rgba(255,30,70,.75), calc(var(--rgb, 0) * -1px) 0 0 rgba(30,220,255,.75)";
export const H1: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1, textShadow: RGB_SHADOW };
/** Vùng an toàn TikTok: chừa trên ~200, phải ~150 (cột nút), dưới ~380 (chú thích). */
export const SAFE: React.CSSProperties = { paddingLeft: 90, paddingRight: 150, paddingTop: 210 };

export const usePop = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (at: number, damping = 13) => spring({ frame: frame - at, fps, config: { damping, stiffness: 170 } });
};
export const fadeIn = (frame: number, at: number, len = 14) => interpolate(frame, [at, at + len], [0, 1], clamp);
export const rise = (frame: number, at: number, px = 50) =>
  `0px ${interpolate(frame, [at, at + 22], [px, 0], { ...clamp, easing: ease })}px`;

/** Hạt phim + vignette phủ toàn khung. */
export const Grain: React.FC<{ strength?: number }> = ({ strength = 0.08 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1080" height="1920" style={{ position: "absolute", opacity: strength, mixBlendMode: "overlay" }}>
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(frame / 2) % 9} />
        </filter>
        <rect width="1080" height="1920" filter="url(#g)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,.5) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Chữ tách kênh màu (glitch) khi `amount` > 0. */
export const GlitchText: React.FC<{ children: React.ReactNode; amount: number; style?: React.CSSProperties; seed?: number }> = ({ children, amount, style, seed = 0 }) => {
  const frame = useCurrentFrame();
  const f = Math.floor(frame / 2);
  const dx = (rand(f + seed) - 0.5) * 2 * amount * 18;
  const dy = (rand(f * 3 + seed) - 0.5) * amount * 8;
  return (
    <div style={{ ...style, position: "relative" }}>
      {amount > 0.01 && (
        <>
          <div style={{ position: "absolute", inset: 0, color: "#ff2a4a", mixBlendMode: "screen", translate: `${dx}px ${dy}px`, opacity: 0.85 }}>{children}</div>
          <div style={{ position: "absolute", inset: 0, color: "#28e0ff", mixBlendMode: "screen", translate: `${-dx}px ${-dy}px`, opacity: 0.85 }}>{children}</div>
        </>
      )}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
};

/** Khung điện thoại; con là ảnh/video tỉ lệ 9:16 (bản ghi màn hình 432×768). */
export const Phone: React.FC<{ width?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ width = 560, style, children }) => {
  const h = (width * 16) / 9;
  return (
    <div style={{ width: width + 28, height: h + 28, padding: 14, borderRadius: 64, background: "linear-gradient(145deg, #2a3557, #0b1326)", boxShadow: "0 40px 90px rgba(0,0,0,.55), inset 0 0 0 2px rgba(255,255,255,.12)", ...style }}>
      <div style={{ width, height: h, borderRadius: 50, overflow: "hidden", background: C.paper, position: "relative" }}>{children}</div>
    </div>
  );
};

/** Con dấu "§" của Luyện Luật. */
export const Seal: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.22, background: C.seal, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: size * 0.66, boxShadow: `0 0 0 ${size * 0.05}px ${C.paper}, 0 0 0 ${size * 0.08}px ${C.seal}` }}>§</div>
);

export const Kicker: React.FC<{ children: React.ReactNode; color?: string; at?: number }> = ({ children, color = C.accent, at = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 38, letterSpacing: 5, textTransform: "uppercase", color, textShadow: RGB_SHADOW, opacity: fadeIn(frame, at, 10), translate: rise(frame, at, 30) }}>
      {children}
    </div>
  );
};

/** Chip nhãn tính năng. */
export const Chip: React.FC<{ children: React.ReactNode; at: number; bg?: string; fg?: string; style?: React.CSSProperties }> = ({ children, at, bg = C.paper, fg = C.ink, style }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 28px", borderRadius: 999, background: bg, color: fg, fontFamily: UI, fontWeight: 800, fontSize: 36, boxShadow: "0 14px 34px rgba(0,0,0,.3)", scale: pop(at), opacity: frame >= at ? 1 : 0, ...style }}>
      {children}
    </div>
  );
};

type IconEl = string | { c: [number, number, number] } | { t: string };
/** Icon nét mảnh của web (memoIcons.ts), vẽ dần nét theo `draw` 0→1. */
export const MemoIcon: React.FC<{ name: string; size: number; color?: string; draw?: number; width?: number }> = ({ name, size, color = "currentColor", draw = 1, width = 1.8 }) => {
  const els = ((icons as unknown as Record<string, IconEl[]>)[name] ?? []);
  const dash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw } as const;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {els.map((e, i) =>
        typeof e === "string" ? (
          <path key={i} d={e} {...dash} />
        ) : "c" in e ? (
          <circle key={i} cx={e.c[0]} cy={e.c[1]} r={e.c[2]} {...dash} />
        ) : (
          <text key={i} x="12" y="16.2" textAnchor="middle" fontSize="11" fontWeight="700" fill={color} stroke="none" opacity={draw}>{e.t}</text>
        ),
      )}
    </svg>
  );
};
