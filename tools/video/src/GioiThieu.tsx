import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { b, beatPulse, FPB, GAPS, PHRASES, rand, SCENE_BARS, SCENES, TOTAL, type SceneKey } from "./theme";
import { clamp, Grain } from "./parts";
import { LightLeak, SceneShell, Shockwave } from "./fx";
import { Bac, ChuKy, Cta, DapAn, Fsrs, HieuNhanh, Hook, Logo, SuNghiep, ThapChuoi, ThuVien, TienIch, TuSach } from "./scenes";

const VIEWS: Record<SceneKey, React.FC> = { hook: Hook, logo: Logo, thuVien: ThuVien, hieuNhanh: HieuNhanh, bac: Bac, dapAn: DapAn, fsrs: Fsrs, tienIch: TienIch, thapChuoi: ThapChuoi, chuKy: ChuKy, tuSach: TuSach, suNghiep: SuNghiep, cta: Cta };
// Cú nện: mọi đầu cụm 8 ô + các khoảnh khắc đỉnh trong cảnh (số chuỗi đổi, nhận chức Chủ tịch nước).
const HITS = [SCENES.logo.from, ...PHRASES, SCENES.thapChuoi.from + b(8), SCENES.suNghiep.from + b(12)];
// Cú nện rơi vào cảnh nền sáng (giấy): logo, Hiểu nhanh.
const LIGHT_AT = [SCENES.logo.from, SCENES.hieuNhanh.from];
const isPhrase = (f: number) => f === 0 || PHRASES.includes(f);

const BeatFx: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const pulse = beatPulse(frame);
  const hit = Math.max(0, ...HITS.map((h) => (frame >= h ? Math.exp(-(frame - h) / 10) : 0)));
  const inGap = GAPS.find(([a, z]) => frame >= a && frame < z);
  const gapP = inGap ? (frame - inGap[0]) / (inGap[1] - inGap[0]) : 0;
  const shake = hit * 30 + gapP * 10;
  const f = Math.floor(frame / 2);
  // tách màu RGB: mạnh ở cú nện, nhẹ ở phách đầu ô
  const downbeat = Math.floor(frame / FPB) % 4 === 0 ? pulse : 0;
  const rgb = hit * 14 + downbeat * 5 + gapP * 8;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill
        style={{
          scale: 1 + pulse * 0.03 + hit * 0.06,
          translate: `${(rand(f) - 0.5) * shake}px ${(rand(f + 99) - 0.5) * shake}px`,
          filter: pulse + hit > 0.03 ? `contrast(${(1 + pulse * 0.08 + hit * 0.1).toFixed(3)}) saturate(${(1 + pulse * 0.15).toFixed(3)})` : undefined,
          // tách màu RGB trên chữ (H1/Kicker đọc biến --rgb): rẻ hơn nhiều so với lọc SVG cả khung
          ["--rgb" as string]: rgb.toFixed(1),
        }}
      >
        {children}
      </AbsoluteFill>
      {/* lóe trắng ở cú nện, tối dần trong khoảng bass tắt */}
      <AbsoluteFill style={{ background: LIGHT_AT.some((h) => frame >= h && frame < h + 40) ? "#d97a1e" : "#fff", opacity: hit * (LIGHT_AT.some((h) => frame >= h && frame < h + 40) ? 0.3 : 0.5), mixBlendMode: "screen", pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle, transparent 30%, #000 85%)", opacity: gapP * 0.85, pointerEvents: "none" }} />
      {HITS.map((h, i) => (
        <React.Fragment key={h}>
          <Shockwave at={h} color={LIGHT_AT.includes(h) ? "#d97a1e" : i % 2 ? "#ffd27a" : "#ffffff"} />
          {/* light leak (hoà screen) chỉ đẹp trên nền tối; nền giấy sáng thì bỏ để khỏi loá trắng */}
          {!LIGHT_AT.includes(h) && <LightLeak at={h - 6} len={48} seed={i + 2} hue={i * 25} />}
        </React.Fragment>
      ))}
      <Grain />
    </AbsoluteFill>
  );
};

const sfx = (name: string, at: number, volume = 0.35) => (
  <Sequence key={`${name}-${at}`} from={at} durationInFrames={b(6)} layout="none">
    <Audio src={staticFile(`sfx/${name}.ogg`)} volume={volume} />
  </Sequence>
);

export type Props = { music: boolean };

export const GioiThieu: React.FC<Props> = ({ music }) => {
  const S = SCENES;
  const keys = SCENE_BARS.map(([k]) => k);
  return (
    <AbsoluteFill>
      <BeatFx>
        {keys.map((k, i) => {
          const V = VIEWS[k];
          const end = S[k].from + S[k].dur;
          return (
            <Sequence key={k} name={k} from={S[k].from} durationInFrames={S[k].dur} premountFor={30}>
              <SceneShell dur={S[k].dur} whipIn={!isPhrase(S[k].from)} whipOut={end < TOTAL && !isPhrase(end)} suck={PHRASES.includes(end)} dir={i % 2 ? -1 : 1}>
                <V />
              </SceneShell>
            </Sequence>
          );
        })}
      </BeatFx>
      {/* Bản nháp: nhạc mẫu cùng tempo/cấu trúc. Bản đăng: không nhạc, ghép "Aura Farming" trong TikTok. */}
      {music && <Audio src={staticFile("music/nhac-nhap.wav")} volume={(fr) => interpolate(fr, [0, 6], [0, 0.8], clamp)} />}
      {/* Hiệu ứng âm thanh: Kenney Interface Sounds (CC0), cùng bộ web đang dùng */}
      {GAPS.map(([a]) => sfx("maximize_006", a, 0.35))}
      {[0, 1, 2, 3].map((i) => sfx("select_001", S.hieuNhanh.from + b(4 + i), 0.22))}
      {[0, 1, 2, 3, 4, 5].map((i) => sfx("select_001", S.bac.from + b(1 + i * 2), 0.22))}
      {sfx("confirmation_001", S.dapAn.from + b(2), 0.45)}
      {[0, 1, 2, 3].map((i) => sfx("drop_002", S.chuKy.from + b(i * 2), 0.32))}
      {[1, 2, 3, 4, 5, 6].map((i) => sfx("select_001", S.suNghiep.from + b(i), 0.18))}
      {sfx("bong_001", S.suNghiep.from + b(12), 0.45)}
    </AbsoluteFill>
  );
};
