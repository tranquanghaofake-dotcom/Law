import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";
import { C, DISPLAY, rand, UI } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Hạt phim + vignette phủ toàn khung — chất "phonk edit". */
export const Grain: React.FC<{ strength?: number }> = ({ strength = 0.09 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1080" height="1920" style={{ position: "absolute", opacity: strength, mixBlendMode: "overlay" }}>
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 9} />
        </filter>
        <rect width="1080" height="1920" filter="url(#g)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Chữ có tách kênh màu (glitch) khi `amount` > 0. */
export const GlitchText: React.FC<{
  children: React.ReactNode;
  amount: number;
  style?: React.CSSProperties;
  seed?: number;
}> = ({ children, amount, style, seed = 0 }) => {
  const frame = useCurrentFrame();
  const dx = (rand(frame + seed) - 0.5) * 2 * amount * 18;
  const dy = (rand(frame * 3 + seed) - 0.5) * amount * 8;
  const base: React.CSSProperties = { ...style, position: "relative" };
  return (
    <div style={base}>
      {amount > 0.01 && (
        <>
          <div style={{ position: "absolute", inset: 0, color: "#ff2a4a", mixBlendMode: "screen", translate: `${dx}px ${dy}px`, opacity: 0.85 }}>
            {children}
          </div>
          <div style={{ position: "absolute", inset: 0, color: "#28e0ff", mixBlendMode: "screen", translate: `${-dx}px ${-dy}px`, opacity: 0.85 }}>
            {children}
          </div>
        </>
      )}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
};

/** Khung điện thoại chứa ảnh chụp màn hình web thật (390×844 @3x). */
export const Phone: React.FC<{ src: string; width?: number; style?: React.CSSProperties; shift?: number }> = ({
  src,
  width = 560,
  style,
  shift = 0,
}) => {
  const h = (width * 844) / 390;
  return (
    <div
      style={{
        width: width + 28,
        height: h + 28,
        padding: 14,
        borderRadius: 64,
        background: "linear-gradient(145deg, #2a3557, #0b1326)",
        boxShadow: "0 40px 90px rgba(0,0,0,.55), inset 0 0 0 2px rgba(255,255,255,.12)",
        ...style,
      }}
    >
      <div style={{ width, height: h, borderRadius: 50, overflow: "hidden", background: C.paper, position: "relative" }}>
        <Img src={staticFile(`shots/${src}`)} style={{ width, position: "absolute", top: -shift }} />
      </div>
    </div>
  );
};

/** Con dấu "§" của Luyện Luật (giống biểu tượng trên đầu trang web). */
export const Seal: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.22,
      background: C.seal,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: DISPLAY,
      fontWeight: 800,
      fontSize: size * 0.66,
      boxShadow: `0 0 0 ${size * 0.05}px ${C.paper}, 0 0 0 ${size * 0.08}px ${C.seal}`,
    }}
  >
    §
  </div>
);

/** Nhãn nhỏ phía trên tiêu đề. */
export const Kicker: React.FC<{ children: React.ReactNode; color?: string; at?: number }> = ({ children, color = C.accent, at = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: UI,
        fontWeight: 800,
        fontSize: 40,
        letterSpacing: 6,
        textTransform: "uppercase",
        color,
        opacity: interpolate(frame, [at, at + 8], [0, 1], clamp),
        translate: interpolate(frame, [at, at + 10], ["0px 30px", "0px 0px"], { ...clamp, easing: ease }),
      }}
    >
      {children}
    </div>
  );
};

export { clamp };
