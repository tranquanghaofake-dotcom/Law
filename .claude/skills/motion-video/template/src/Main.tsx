// Ghép video từ storyboard.json: nền + cảnh + lớp hiệu ứng theo nhạc + âm thanh.
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { clamp, invert, SceneCtx, T, ThemeCtx } from "./core/look";
import { Grain, Ground, LightLeak, SceneShell, Shockwave, WHIP_FRAMES } from "./core/fx";
import { b, beatPulse, FPB, GAPS, PHRASES, PLACED, rand, SB, TOTAL } from "./core/timeline";
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

const BeatFx: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const pulse = beatPulse(frame);
  const hit = Math.max(0, ...HITS.map((h) => (frame >= h ? Math.exp(-(frame - h) / 10) : 0)));
  const gap = GAPS.find(([a, z]) => frame >= a && frame < z);
  const gapP = gap ? (frame - gap[0]) / (gap[1] - gap[0]) : 0;
  const shake = hit * 26 + gapP * 9;
  const f = Math.floor(frame / 2);
  const downbeat = Math.floor(frame / FPB) % 4 === 0 ? pulse : 0;
  const rgb = hit * 14 + downbeat * 4 + gapP * 8;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ scale: 1 + pulse * 0.025 + hit * 0.05, translate: `${(rand(f) - 0.5) * shake}px ${(rand(f + 99) - 0.5) * shake}px`, filter: pulse + hit > 0.03 ? `contrast(${(1 + pulse * 0.06 + hit * 0.1).toFixed(3)})` : undefined, ["--rgb" as string]: rgb.toFixed(1) }}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: darkAt(frame) ? "#fff" : T.accent, mixBlendMode: "screen", opacity: hit * (darkAt(frame) ? 0.45 : 0.25), pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle, transparent 30%, #000 85%)", opacity: gapP * 0.8, pointerEvents: "none" }} />
      {HITS.map((h, i) => (
        <React.Fragment key={h}>
          <Shockwave at={h} c={darkAt(h) ? "#ffffff" : T.accent} />
          {darkAt(h) && <LightLeak at={h - 6} seed={i + 2} hue={i * 25} />}
        </React.Fragment>
      ))}
      <Grain />
    </AbsoluteFill>
  );
};

const ENTERS = PLACED.map((p) => {
  const e = SB.scenes[p.index].enter;
  return e && e !== "auto" ? e : p.index === 0 ? "cut" : p.phraseStart ? "zoom" : "whip";
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
            <Sequence key={s.id} name={s.id} from={p.from} durationInFrames={p.dur + (ENTERS[p.index + 1] === "whip" ? WHIP_FRAMES : 0)} premountFor={30}>
              <ThemeCtx.Provider value={pal}>
                <SceneCtx.Provider value={{ startBeat: p.startBeat, from: p.from }}>
                  <SceneShell dur={p.dur} enter={enter} whipOut={ENTERS[p.index + 1] === "whip"} suck={p.phraseEnd && end < TOTAL} gap={gap} dir={p.index % 2 ? -1 : 1}>
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
