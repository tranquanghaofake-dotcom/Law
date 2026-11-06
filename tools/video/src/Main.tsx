// Ghép video từ storyboard.json: nền + cảnh + lớp hiệu ứng theo nhạc + âm thanh.
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { clamp, DISPLAY, invert, SceneCtx, T, ThemeCtx } from "./core/look";
import { FlashFrame, Grain, Ground, SceneShell } from "./core/fx";
import { b, beatPulse, FPB, GAPS, H, PHRASES, PLACED, rand, SB, TOTAL, W } from "./core/timeline";
import { SCENE_VIEWS } from "./scenes";

const isDark = (bg?: string) => bg === "dark" || (!!bg && /^#/.test(bg) && lum(bg) < 0.35) || (!bg && lum(T.ground) < 0.35);
function lum(hex: string) {
  const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}
// Cú nện: đầu mỗi cụm nhạc + các phách người dựng đánh dấu "hit" trong cảnh (props.hits: phách trong cảnh).
const HITS = [...PHRASES, ...PLACED.flatMap((p) => ((SB.scenes[p.index].props.hits as number[] | undefined) ?? []).map((h) => b(p.startBeat + h)))];
const darkAt = (frame: number) => {
  const p = [...PLACED].reverse().find((x) => frame >= x.from);
  return p ? isDark(SB.scenes[p.index].bg) : false;
};

/** "Mắt cắt" bằng dấu thương hiệu (theme.cutMark): phủ khung 8 khung trước đầu cụm, mở ra cảnh mới trong 16 khung (thay light leak/glow). */
const SealCut: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const mark = T.cutMark;
  const t = frame - at;
  if (!mark || t < -8 || t > 10) return null;
  // Z luôn TỚI: đĩa dấu phóng lên phủ khung trước điểm cắt, rồi tiếp tục phóng qua máy (1 → 1,7) và tan — không thu về (lật dấu)
  const R = Math.hypot(W, H) * 0.6;
  const r = t < 0 ? interpolate(t, [-8, 0], [0, R], { easing: Easing.in(Easing.cubic) }) : R * interpolate(t, [0, 10], [1, 1.7], clamp);
  const op = t < 0 ? 1 : interpolate(t, [0, 10], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const glyph = interpolate(t, [-8, -2, 2, 8], [0.4, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", alignItems: "center", justifyContent: "center", opacity: op }}>
      <div style={{ position: "absolute", left: W / 2 - r, top: H * 0.42 - r, width: r * 2, height: r * 2, borderRadius: "50%", background: mark.color }} />
      <div style={{ position: "absolute", top: H * 0.42 - Math.min(W, H) * 0.155, fontFamily: DISPLAY, fontWeight: 800, fontSize: Math.min(W, H) * 0.31, color: mark.ink ?? T.ground, opacity: glyph, scale: interpolate(t, [-8, 0, 10], [0.7, 1, 2.2], clamp), lineHeight: 1 }}>{mark.text}</div>
    </AbsoluteFill>
  );
};

const BeatFx: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const pulse = beatPulse(frame);
  const hit = Math.max(0, ...HITS.map((h) => (frame >= h ? Math.exp(-(frame - h) / 10) : 0)));
  const gap = GAPS.find(([a, z]) => frame >= a && frame < z);
  const gapP = gap ? (frame - gap[0]) / (gap[1] - gap[0]) : 0;
  const shake = hit * 26 + gapP * 9;
  const f = Math.floor(frame / 2);
  const rgb = hit * 10 + gapP * 6; // tách màu chỉ ở cú nện/bass tắt (không đập theo mọi phách)
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: T.ink }}>{/* nền sân khấu: lộ ra ở khoảng giao cut-the-curve = dip cut màu mực */}
      <AbsoluteFill style={{ scale: 1 + pulse * 0.025 + hit * 0.05, translate: `${(rand(f) - 0.5) * shake}px ${(rand(f + 99) - 0.5) * shake}px`, filter: pulse + hit > 0.03 ? `contrast(${(1 + pulse * 0.06 + hit * 0.1).toFixed(3)})` : undefined, ["--rgb" as string]: rgb.toFixed(1) }}>
        {children}
      </AbsoluteFill>
      {PHRASES.map((p) => <SealCut key={p} at={p} />)}
      <AbsoluteFill style={{ background: "radial-gradient(circle, transparent 30%, #000 85%)", opacity: gapP * 0.8, pointerEvents: "none" }} />
      {HITS.filter((h) => !PHRASES.includes(h)).map((h) => <FlashFrame key={h} at={h} strength={darkAt(h) ? 0.8 : 0.45} />)}
      <Grain />
    </AbsoluteFill>
  );
};

const ENTERS = PLACED.map((p) => {
  const e = SB.scenes[p.index].enter;
  if (e === "whip") return "curve";
  return e && e !== "auto" ? e : p.index === 0 ? "cut" : p.phraseStart ? "zoom" : "curve";
});

export const Main: React.FC = () => {
  const gap = Math.round(SB.music.gapBeats * FPB);
  return (
    <AbsoluteFill>
      <BeatFx>
        {PLACED.map((p) => {
          const s = SB.scenes[p.index];
          const V = SCENE_VIEWS[s.type];
          const end = p.from + p.dur;
          const enter = ENTERS[p.index];
          const pal = isDark(s.bg) && !isDark(undefined) ? invert(T) : T;
          return (
            <Sequence key={s.id} name={s.id} from={p.from} durationInFrames={p.dur} premountFor={30}>
              <ThemeCtx.Provider value={pal}>
                <SceneCtx.Provider value={{ startBeat: p.startBeat, from: p.from, dur: p.dur }}>
                  <SceneShell dur={p.dur} enter={enter} exit={p.phraseEnd && end < TOTAL ? "push" : ENTERS[p.index + 1] === "curve" ? "curve" : "none"} gap={gap}>
                    <Ground bg={s.bg === "dark" ? pal.ground : s.bg} />
                    <V props={s.props} />
                  </SceneShell>
                </SceneCtx.Provider>
              </ThemeCtx.Provider>
            </Sequence>
          );
        })}
      </BeatFx>
      {SB.music.file && <Audio src={staticFile(SB.music.file)} volume={(fr) => interpolate(fr, [0, 6], [0, SB.music.volume ?? 0.8], clamp)} />}
      {(SB.cues ?? []).map((c, i) => (
        <Sequence key={i} from={b(c.beat)} durationInFrames={b(c.beat + 6) - b(c.beat)} layout="none">
          <Audio src={staticFile(`sfx/${c.sfx}.ogg`)} volume={c.volume ?? 0.35} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
