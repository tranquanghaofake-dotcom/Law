// Lớp hiệu ứng "edit" theo nhạc: chuyển cảnh whip, hút vào lúc bass tắt, light leak, sóng xung kích, hạt sáng, tia sáng, chữ nện theo phách.
// Toàn bộ là CSS/SVG điều khiển bằng frame (không WebGL: container render không có GPU).
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { b, C, rand } from "./theme";
import { clamp } from "./parts";

const bell = (frame: number, at: number, len: number) => {
  const t = (frame - at) / len;
  return t < 0 || t > 1 ? 0 : Math.sin(Math.PI * t);
};

/** Light leak tự làm: ba vệt sáng ấm mờ lướt qua khung, hoà kiểu screen. */
export const LightLeak: React.FC<{ at: number; len?: number; seed?: number; hue?: number }> = ({ at, len = 40, seed = 0, hue = 0 }) => {
  const frame = useCurrentFrame();
  const k = bell(frame, at, len);
  if (k <= 0) return null;
  const t = (frame - at) / len;
  const blobs = [
    { c: `hsla(${28 + hue}, 100%, 60%, .9)`, w: 1300 },
    { c: `hsla(${350 + hue}, 95%, 62%, .75)`, w: 1000 },
    { c: `hsla(${48 + hue}, 100%, 70%, .8)`, w: 800 },
  ];
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none", opacity: k }}>
      {blobs.map((bl, i) => {
        const sx = rand(seed * 7 + i) * 1080, sy = rand(seed * 13 + i + 3) * 1920;
        const dx = (rand(seed + i * 5) - 0.5) * 900, dy = (rand(seed + i * 9) - 0.5) * 900;
        return (
          <div key={i} style={{ position: "absolute", left: sx + dx * t - bl.w / 2, top: sy + dy * t - bl.w / 2, width: bl.w, height: bl.w, borderRadius: "50%", background: `radial-gradient(circle, ${bl.c}, transparent 65%)`, filter: "blur(40px)" }} />
        );
      })}
    </AbsoluteFill>
  );
};

/** Vòng sóng xung kích toả ra từ (x, y). */
export const Shockwave: React.FC<{ at: number; x?: number; y?: number; color?: string; len?: number }> = ({ at, x = 540, y = 960, color = "#fff", len = 28 }) => {
  const frame = useCurrentFrame();
  const t = (frame - at) / len;
  if (t < 0 || t > 1) return null;
  const r = interpolate(t, [0, 1], [40, 1300], { easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${interpolate(t, [0, 1], [26, 2])}px solid ${color}`, opacity: 1 - t, boxShadow: `0 0 60px ${color}`, pointerEvents: "none" }} />
  );
};

/** Hạt sáng bay lên, ổn định theo frame. */
export const Embers: React.FC<{ n?: number; color?: string; speed?: number; size?: number }> = ({ n = 40, color = C.gold, speed = 1.4, size = 7 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const sp = speed * (0.5 + rand(i + 9));
        const y = (((rand(i + 50) * 2100 - frame * sp) % 2100) + 2100) % 2100 - 90;
        const x = rand(i) * 1080 + Math.sin(frame / 30 + i) * 30;
        const s = size * (0.4 + rand(i + 21));
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: 99, background: color, opacity: 0.25 + 0.6 * rand(i + 3), boxShadow: `0 0 ${s * 3}px ${color}` }} />;
      })}
    </AbsoluteFill>
  );
};

/** Tia sáng xoay sau vật chính. */
export const Rays: React.FC<{ x?: number; y?: number; size?: number; color?: string; speed?: number; opacity?: number }> = ({ x = 540, y = 900, size = 2200, color = "rgba(242,193,78,.22)", speed = 0.25, opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: "50%", opacity, background: `repeating-conic-gradient(from ${frame * speed}deg, ${color} 0deg 5deg, transparent 5deg 14deg)`, maskImage: "radial-gradient(circle, #000 15%, transparent 62%)", WebkitMaskImage: "radial-gradient(circle, #000 15%, transparent 62%)", pointerEvents: "none" }} />
  );
};

/** Chữ nện từng từ: mỗi từ vào ở frame `at + i*step` (thường = phách), phóng to + nhoè rồi khựng. */
export const Slam: React.FC<{ text: string; at: number; step?: number; style?: React.CSSProperties; color?: string; accent?: Record<number, string> }> = ({ text, at, step = b(0.5), style, accent = {} }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: "0.28em", ...style }}>
      {text.split(" ").map((w, i) => {
        const s = at + i * step;
        const p = interpolate(frame, [s, s + 9], [0, 1], { ...clamp, easing: Easing.out(Easing.exp) });
        return (
          <span key={i} style={{ display: "inline-block", opacity: frame >= s ? 1 : 0, scale: interpolate(p, [0, 1], [1.9, 1]), filter: `blur(${interpolate(p, [0, 1], [14, 0])}px)`, color: accent[i] }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Bao một cảnh: vào/ra kiểu whip (nhoè chuyển động) ở điểm cắt thường; ở cuối cụm nhạc thì "hút vào" theo khoảng bass tắt. */
export const SceneShell: React.FC<{ dur: number; whipIn: boolean; whipOut: boolean; suck: boolean; dir?: number; children: React.ReactNode }> = ({ dur, whipIn, whipOut, suck, dir = 1, children }) => {
  const frame = useCurrentFrame();
  const W = 9;
  let tx = 0, blur = 0, scale = 1, sat = 1, rot = 0;
  if (whipIn && frame < W) {
    const p = Easing.out(Easing.cubic)(frame / W);
    tx = (1 - p) * 700 * dir; blur += (1 - p) * 26;
  }
  if (whipOut && frame > dur - W) {
    const p = Easing.in(Easing.cubic)((frame - (dur - W)) / W);
    tx = -p * 700 * dir; blur += p * 26;
  }
  const gap = b(1.5);
  if (suck && frame > dur - gap) {
    const p = Easing.in(Easing.quad)((frame - (dur - gap)) / gap);
    scale = 1 + p * 0.22; blur += p * 7; sat = 1 - p * 0.75; rot = p * 2.5 * dir;
  }
  if (!whipIn && frame < 16) {
    // vào sau một cú nện: bật từ phóng to về
    const p = Easing.out(Easing.exp)(frame / 16);
    scale *= 1 + (1 - p) * 0.25; blur += (1 - p) * 10;
  }
  return (
    <AbsoluteFill style={{ translate: `${tx}px 0px`, scale, rotate: `${rot}deg`, filter: `blur(${blur.toFixed(2)}px) saturate(${sat})` }}>{children}</AbsoluteFill>
  );
};

/** Nền động: gradient chuyển chậm + lưới hoa văn mờ. */
export const MovingBg: React.FC<{ a: string; b2: string; glow?: string }> = ({ a, b2, glow = "rgba(217,122,30,.25)" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${50 + Math.sin(frame / 90) * 25}% ${35 + Math.cos(frame / 110) * 15}%, ${glow}, transparent 55%), linear-gradient(170deg, ${a}, ${b2})` }}>
      <AbsoluteFill style={{ opacity: 0.07, backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "90px 90px", backgroundPosition: `0px ${frame * 0.6}px` }} />
    </AbsoluteFill>
  );
};
