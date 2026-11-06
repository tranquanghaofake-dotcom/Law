// Lớp hiệu ứng "edit theo nhạc" — toàn CSS/SVG điều khiển bằng frame (máy render không có GPU: WebGL/WebGPU hỏng).
import React from "react";
import { AbsoluteFill, Easing, Freeze, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import icons from "../icons.json";
import { clamp, color, easeInOut, easeOut, T } from "./look";
import { FPB, FPS, H, rand, W } from "./timeline";
import type { Enter, Media } from "./types";

export const asset = (src: string) => (/^https?:/.test(src) ? src : staticFile(src));

/** Hạt phim nhẹ (≤ 8 %) — chất liệu, không phải trang trí. */
export const Grain: React.FC<{ strength?: number }> = ({ strength = 0.07 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} style={{ position: "absolute", opacity: strength, mixBlendMode: "overlay" }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(frame / 2) % 9} /></filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Nền cảnh: phẳng theo chất liệu thương hiệu; `dark` = ink làm nền. Không gradient lưới, không "hư không xanh đen". */
export const Ground: React.FC<{ bg?: string }> = ({ bg = "ground" }) => {
  const c = bg === "dark" ? T.ink : bg === "accent" ? T.accent : color(bg, T.ground);
  return <AbsoluteFill style={{ background: c }} />;
};

const bell = (frame: number, at: number, len: number) => {
  const t = (frame - at) / len;
  return t < 0 || t > 1 ? 0 : Math.sin(Math.PI * t);
};

/** Light leak tự làm (vệt sáng ấm lướt, hoà screen) — chỉ đẹp trên nền tối; nền sáng sẽ loá trắng. */
export const LightLeak: React.FC<{ at: number; len?: number; seed?: number; hue?: number }> = ({ at, len = 46, seed = 0, hue = 0 }) => {
  const frame = useCurrentFrame();
  const k = bell(frame, at, len);
  if (k <= 0) return null;
  const t = (frame - at) / len;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none", opacity: k }}>
      {[1300, 1000, 800].map((w, i) => (
        <div key={i} style={{ position: "absolute", left: rand(seed * 7 + i) * W + (rand(seed + i * 5) - 0.5) * 900 * t - w / 2, top: rand(seed * 13 + i + 3) * H + (rand(seed + i * 9) - 0.5) * 900 * t - w / 2, width: w, height: w, borderRadius: "50%", background: `radial-gradient(circle, hsla(${[28, 350, 48][i] + hue}, 100%, 62%, .85), transparent 68%)` }} />
      ))}
    </AbsoluteFill>
  );
};

/** Vòng sóng xung kích ở cú nện. */
export const Shockwave: React.FC<{ at: number; x?: number; y?: number; c?: string; len?: number }> = ({ at, x = W / 2, y = H / 2, c = "#fff", len = 26 }) => {
  const frame = useCurrentFrame();
  const t = (frame - at) / len;
  if (t < 0 || t > 1) return null;
  const r = interpolate(t, [0, 1], [30, Math.max(W, H) * 0.7], { easing: Easing.out(Easing.cubic) });
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${interpolate(t, [0, 1], [22, 2])}px solid ${c}`, opacity: 1 - t, pointerEvents: "none" }} />;
};

/** Hạt bay — CHỈ khi theme.decor.particles (bị cấm mặc định). Gradient thay box-shadow để render nhanh. */
export const Particles: React.FC<{ n?: number; c?: string; speed?: number; size?: number }> = ({ n = 30, c = T.accent, speed = 1.2, size = 7 }) => {
  const frame = useCurrentFrame();
  if (!T.decor?.particles) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const y = (((rand(i + 50) * (H + 200) - frame * speed * (0.5 + rand(i + 9))) % (H + 200)) + H + 200) % (H + 200) - 100;
        const s = size * (0.4 + rand(i + 21));
        return <div key={i} style={{ position: "absolute", left: rand(i) * W - s, top: y - s, width: s * 3, height: s * 3, borderRadius: 99, background: `radial-gradient(circle, ${c} 0 22%, transparent 70%)`, opacity: 0.3 + 0.6 * rand(i + 3) }} />;
      })}
    </AbsoluteFill>
  );
};

/** Tia sáng xoay — CHỈ khi theme.decor.rays. */
export const Rays: React.FC<{ x?: number; y?: number; size?: number; c?: string; speed?: number }> = ({ x = W / 2, y = H / 2, size = 2200, c = "rgba(255,255,255,.14)", speed = 0.25 }) => {
  const frame = useCurrentFrame();
  if (!T.decor?.rays) return null;
  const mask = "radial-gradient(circle, #000 15%, transparent 62%)";
  return <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: "50%", background: `repeating-conic-gradient(from ${frame * speed}deg, ${c} 0deg 5deg, transparent 5deg 14deg)`, maskImage: mask, WebkitMaskImage: mask, pointerEvents: "none" }} />;
};

/** Chữ vào từng từ: nhoè → nét, không trượt; mỗi từ cách `step` khung. `accentWords`: chỉ số từ tô màu nhấn. */
export const Words: React.FC<{ text: string; at: number; step?: number; style?: React.CSSProperties; accentWords?: number[]; slam?: boolean }> = ({ text, at, step = 5, style, accentWords = [], slam = false }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: "0.26em", ...style }}>
      {text.split(" ").map((w, i) => {
        const s = at + i * step;
        const p = interpolate(frame, [s, s + (slam ? 10 : 8)], [0, 1], { ...clamp, easing: Easing.out(Easing.exp) });
        return (
          <span key={i} style={{ display: "inline-block", opacity: frame >= s ? Math.min(1, p * 1.5) : 0, scale: slam ? interpolate(p, [0, 1], [1.8, 1]) : 1, filter: p < 0.98 ? `blur(${((1 - p) * (slam ? 14 : 8)).toFixed(1)}px)` : undefined, color: accentWords.includes(i) ? T.accent : undefined }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Chữ tách kênh rung (glitch) — dùng cho MỘT chữ chốt, không rải khắp video. */
export const Glitch: React.FC<{ children: React.ReactNode; amount: number; style?: React.CSSProperties }> = ({ children, amount, style }) => {
  const f = Math.floor(useCurrentFrame() / 2);
  const dx = (rand(f) - 0.5) * 2 * amount * 18, dy = (rand(f * 3) - 0.5) * amount * 8;
  return (
    <div style={{ ...style, position: "relative" }}>
      {amount > 0.01 && (["#ff2a4a", "#28e0ff"] as const).map((c, i) => <div key={c} style={{ position: "absolute", inset: 0, color: c, mixBlendMode: "screen", translate: `${i ? -dx : dx}px ${i ? -dy : dy}px`, opacity: 0.85 }}>{children}</div>)}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
};

type IconEl = string | { c: [number, number, number] } | { t: string };
/** Icon nét mảnh từ src/icons.json (lưới 24, nét currentColor), vẽ dần theo `draw`. */
export const Icon: React.FC<{ name: string; size: number; c?: string; draw?: number; width?: number }> = ({ name, size, c = "currentColor", draw = 1, width = 1.9 }) => {
  const els = ((icons as unknown as Record<string, IconEl[]>)[name] ?? []) as IconEl[];
  const d = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw } as const;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={c} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {els.map((e, i) => (typeof e === "string" ? <path key={i} d={e} {...d} /> : "c" in e ? <circle key={i} cx={e.c[0]} cy={e.c[1]} r={e.c[2]} {...d} /> : <text key={i} x="12" y="16.2" textAnchor="middle" fontSize="11" fontWeight="700" fill={c} stroke="none" opacity={draw}>{e.t}</text>))}
    </svg>
  );
};

/** Khung thiết bị chứa ảnh/video THẬT của sản phẩm (không vẽ giả UI). */
export const Device: React.FC<{ kind?: "phone" | "browser"; width: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ kind = "phone", width, style, children }) => {
  if (kind === "browser") {
    const h = (width * 10) / 16;
    return (
      <div style={{ width, borderRadius: 18, overflow: "hidden", background: "#1d1f24", boxShadow: "0 40px 90px rgba(0,0,0,.45)", ...style }}>
        <div style={{ height: 38, display: "flex", gap: 9, alignItems: "center", paddingLeft: 16 }}>{["#ff5f57", "#febc2e", "#28c840"].map((c) => <i key={c} style={{ width: 13, height: 13, borderRadius: 9, background: c }} />)}</div>
        <div style={{ width, height: h, position: "relative", overflow: "hidden", background: "#fff" }}>{children}</div>
      </div>
    );
  }
  const h = (width * 16) / 9;
  return (
    <div style={{ width: width + 28, height: h + 28, padding: 14, borderRadius: 64, background: "linear-gradient(145deg, #2a2d36, #0d0e12)", boxShadow: "0 40px 90px rgba(0,0,0,.5), inset 0 0 0 2px rgba(255,255,255,.12)", ...style }}>
      <div style={{ width, height: h, borderRadius: 50, overflow: "hidden", position: "relative", background: "#fff" }}>
        {children}
        {/* vệt phản chiếu kính */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,.16) 0%, transparent 28%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
};

/** Ảnh hoặc video tĩnh/động trong khung (video giữ khung đầu `poster` trước khi chạy). */
export const MediaView: React.FC<{ m: Media; style?: React.CSSProperties }> = ({ m, style }) =>
  m.kind === "image" ? <Img src={asset(m.src)} style={{ width: "100%", display: "block", ...style }} /> : <VideoView m={m} style={style} />;
const VideoView: React.FC<{ m: Media; style?: React.CSSProperties }> = ({ m, style }) => <OffthreadVideo src={asset(m.src)} muted transparent={!!m.alpha} style={{ width: "100%", display: "block", ...style }} />;

/** Cut-the-curve (HyperFrames, Apache-2.0 — viết lại): mọi điểm cắt thường đi theo MỘT hướng chủ đạo (sang trái), di chuyển một phần
 *  quãng (12 % khung), đường cong đối xứng power4 (ra tăng tốc, vào giảm tốc — vận tốc khớp ở điểm cắt), nhoè 18 px cả khung,
 *  cảnh cũ mờ hết ở ~70 % quãng ra, cảnh mới bừng ở 35 % độ đậm giữa đường. Không bao giờ lật hướng (ping-pong). */
export const CURVE_OUT = Math.round(FPB * 0.55);
export const CURVE_IN = Math.round(FPB * 0.7);
/** Giữ tên cũ cho tương thích. */
export const WHIP_FRAMES = CURVE_OUT;
const p4in = (x: number) => x ** 4;
const p4out = (x: number) => 1 - (1 - x) ** 4;

export type Exit = "curve" | "push" | "none";

/** Bao một cảnh. Vào: curve (mặc định) / zoom (đầu cụm: TIẾP TỤC lao tới, 0,8 → 1 — cùng dấu Z với lúc hút vào) / flood / iris / cut.
 *  Ra: curve (sang trái) hoặc push (cuối cụm, theo khoảng bass tắt: phóng 1 → 1,2, nhoè, nhạt màu). */
export const SceneShell: React.FC<{ dur: number; enter: Enter; exit: Exit; gap: number; children: React.ReactNode }> = ({ dur, enter, exit, gap, children }) => {
  const frame = useCurrentFrame();
  const travel = W * 0.12;
  let tx = 0, blur = 0, scale = 1, sat = 1, op = 1, clip: string | undefined, flood = 0;
  if ((enter === "curve" || enter === "whip") && frame < CURVE_IN) {
    const e = p4out(frame / CURVE_IN);
    tx = travel * (1 - e); blur += 18 * (1 - e); op = 0.6 + 0.4 * Math.min(1, frame / (CURVE_IN * 0.35));
  }
  if (enter === "zoom" && frame < 22) { const e = Easing.out(Easing.exp)(frame / 22); scale *= 0.8 + 0.2 * e; blur += 18 * (1 - e); }
  if (enter === "iris" && frame < 12) { const e = easeOut(frame / 12); clip = `circle(${(e * 120).toFixed(1)}% at 50% 50%)`; }
  if (enter === "flood" && frame < 18) flood = 1 - easeInOut(frame / 18);
  if (exit === "curve" && frame > dur - CURVE_OUT) {
    const t = (frame - (dur - CURVE_OUT)) / CURVE_OUT, e = p4in(t);
    tx = -travel * e; blur += 18 * e; op = 1 - 0.55 * t * t; // giữ đậm tới sát điểm cắt: không lộ nền giữa hai cảnh (dip ≤ 1 khung)
  }
  if (exit === "push" && frame > dur - gap) { const e = Easing.in(Easing.quad)((frame - (dur - gap)) / gap); scale *= 1 + e * 0.2; blur += e * 7; sat = 1 - e * 0.75; }
  return (
    <AbsoluteFill style={{ clipPath: clip }}>
      <AbsoluteFill style={{ translate: `${tx.toFixed(1)}px 0px`, scale, opacity: op, filter: blur > 0.3 || sat < 0.99 ? `blur(${blur.toFixed(1)}px) saturate(${sat.toFixed(2)})` : undefined }}>{children}</AbsoluteFill>
      {flood > 0 && <AbsoluteFill style={{ background: T.accent, opacity: flood }} />}
    </AbsoluteFill>
  );
};

/** Flash frame kiểu báo chí (ấm, trung tính): loé 2 khung rồi tắt trong ~6 khung — thay vòng sóng ở cú nện trong cảnh. */
export const FlashFrame: React.FC<{ at: number; strength?: number }> = ({ at, strength = 0.8 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 8) return null;
  return <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #fffaf0, #ffe9c8 70%)", mixBlendMode: "screen", opacity: strength * (t < 2 ? 1 : 1 - (t - 2) / 6), pointerEvents: "none" }} />;
};

/** Video có "impact freeze" (DJordanMedia: hãm/đứng 3–5 khung… ở đây đứng `hold` khung) tại giây `atSec` của bản quay; sau đó chạy tiếp.
 *  Dùng Freeze của Remotion: khung media = f trước điểm chạm, = điểm chạm trong lúc đứng, = f − hold sau đó. */
export const FreezeVideo: React.FC<{ m: Media; atSec: number; hold: number; style?: React.CSSProperties }> = ({ m, atSec, hold, style }) => {
  const f = useCurrentFrame();
  const F0 = Math.round(atSec * FPS);
  const mf = f < F0 ? f : f < F0 + hold ? F0 : f - hold;
  return <Freeze frame={mf}><MediaView m={m} style={style} /></Freeze>;
};
