import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { b, beatPulse, DROP, rand, SCENES, type SceneKey } from "./theme";
import { clamp, Grain } from "./parts";
import { Bac, ChuKy, Cta, DapAn, Fsrs, HieuNhanh, Hook, Logo, SuNghiep, ThapChuoi, ThuVien, TienIch, TuSach } from "./scenes";

const VIEWS: Record<SceneKey, React.FC> = { hook: Hook, logo: Logo, thuVien: ThuVien, hieuNhanh: HieuNhanh, bac: Bac, dapAn: DapAn, fsrs: Fsrs, tienIch: TienIch, thapChuoi: ThapChuoi, chuKy: ChuKy, tuSach: TuSach, suNghiep: SuNghiep, cta: Cta };
const CUTS = Object.values(SCENES).map((s) => s.from).filter((f) => f > 0);
// Cú "đập" mạnh: drop, vào thắp chuỗi, Chủ tịch nước, kêu gọi.
const HITS = [DROP, SCENES.thapChuoi.from, SCENES.suNghiep.from + b(12), SCENES.cta.from];

const BeatFx: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const pulse = beatPulse(frame);
  const hit = Math.max(0, ...HITS.map((h) => (frame >= h ? Math.exp(-(frame - h) / 9) : 0)));
  const shake = hit * 26;
  const cut = Math.max(0, ...CUTS.map((c) => (frame >= c ? Math.exp(-(frame - c) / 5) : 0)));
  const f = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ scale: 1 + pulse * 0.018 + hit * 0.07, translate: `${(rand(f) - 0.5) * shake}px ${(rand(f + 99) - 0.5) * shake}px`, filter: `contrast(${1 + pulse * 0.06}) saturate(${1 + pulse * 0.12})` }}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: Math.max(hit * 0.85, cut * 0.3), pointerEvents: "none" }} />
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
  return (
    <AbsoluteFill>
      <BeatFx>
        {(Object.keys(VIEWS) as SceneKey[]).map((k) => {
          const V = VIEWS[k];
          return (
            <Sequence key={k} name={k} from={S[k].from} durationInFrames={S[k].dur} premountFor={30}>
              <V />
            </Sequence>
          );
        })}
      </BeatFx>
      {/* Bản nháp: nhạc mẫu cùng tempo 111 BPM. Bản đăng: không nhạc, ghép "Aura Farming" trong TikTok. */}
      {music && <Audio src={staticFile("music/nhac-nhap.wav")} volume={(f) => interpolate(f, [0, 10], [0, 0.8], clamp)} />}
      {/* Hiệu ứng âm thanh: Kenney Interface Sounds (CC0), cùng bộ web đang dùng */}
      {sfx("maximize_006", b(7.3), 0.4)}
      {[0, 1, 2, 3].map((i) => sfx("select_001", S.hieuNhanh.from + b(4.5 + i), 0.25))}
      {[0, 1, 2, 3, 4, 5].map((i) => sfx("select_001", S.bac.from + b(1 + i * 1.5), 0.25))}
      {sfx("confirmation_001", S.dapAn.from + 36, 0.45)}
      {[0, 1, 2, 3].map((i) => sfx("drop_002", S.chuKy.from + b(i * 2), 0.35))}
      {[1, 2, 3, 4, 5, 6].map((i) => sfx("select_001", S.suNghiep.from + b(i), 0.2))}
      {sfx("bong_001", S.suNghiep.from + b(12), 0.45)}
    </AbsoluteFill>
  );
};
