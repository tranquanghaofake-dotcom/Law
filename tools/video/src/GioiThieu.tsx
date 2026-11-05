import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { BAR, BEAT, kickPulse, rand, SCENES } from "./theme";
import { clamp, Grain } from "./parts";
import { Bac, Chuc, Cta, De, Fsrs, Hook, Logo, Mon } from "./scenes";

const CUTS = Object.values(SCENES).map(([from]) => from).filter((f) => f > 0);
const HITS = [2 * BAR, 17 * BAR]; // drop và CTA: lóe sáng + rung mạnh

/** Hiệu ứng toàn cục theo nhịp: phóng nhẹ theo kick, rung + lóe ở drop, lóe ngắn ở mỗi điểm cắt. */
const BeatFx: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const pulse = kickPulse(frame);
  const hit = Math.max(0, ...HITS.map((h) => (frame >= h ? Math.exp(-(frame - h) / 5) : 0)));
  const shake = hit * 28;
  const cut = Math.max(0, ...CUTS.map((c) => (frame >= c ? Math.exp(-(frame - c) / 2.5) : 0)));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill
        style={{
          scale: 1 + pulse * 0.025 + hit * 0.08,
          translate: `${(rand(frame) - 0.5) * shake}px ${(rand(frame + 99) - 0.5) * shake}px`,
          filter: `contrast(${1 + pulse * 0.08}) saturate(${1 + pulse * 0.15})`,
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: Math.max(hit * 0.9, cut * 0.35), pointerEvents: "none" }} />
      <Grain />
    </AbsoluteFill>
  );
};

const sfx = (name: string, at: number, volume = 0.35) => (
  <Sequence key={`${name}-${at}`} from={at} durationInFrames={BEAT * 4} layout="none">
    <Audio src={staticFile(`sfx/${name}.ogg`)} volume={volume} />
  </Sequence>
);

export const GioiThieu: React.FC = () => {
  const scene = (key: keyof typeof SCENES, C: React.FC) => {
    const [from, dur] = SCENES[key];
    return (
      <Sequence key={key} name={key} from={from} durationInFrames={dur}>
        <C />
      </Sequence>
    );
  };
  return (
    <AbsoluteFill>
      <BeatFx>
        {scene("hook", Hook)}
        {scene("logo", Logo)}
        {scene("mon", Mon)}
        {scene("bac", Bac)}
        {scene("fsrs", Fsrs)}
        {scene("de", De)}
        {scene("chuc", Chuc)}
        {scene("cta", Cta)}
      </BeatFx>
      <Audio src={staticFile("music/phonk.wav")} volume={(f) => interpolate(f, [0, 6], [0, 0.85], clamp)} />
      {sfx("maximize_006", 84, 0.4)}
      {[0, 1, 2, 3, 4, 5].map((i) => sfx("select_001", SCENES.bac[0] + 12 + i * BEAT * 2, 0.3))}
      {sfx("confirmation_001", SCENES.de[0] + BEAT * 3, 0.45)}
      {sfx("bong_001", SCENES.chuc[0] + 7 * BEAT * 0.75, 0.4)}
    </AbsoluteFill>
  );
};
