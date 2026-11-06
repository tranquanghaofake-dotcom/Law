// Thư viện cảnh mẫu. Mỗi cảnh đọc `props` từ storyboard.json; mốc thời gian trong props tính bằng PHÁCH kể từ đầu cảnh.
// Quy ước chung: một vật chính/cảnh chiếm ≥ 40 % khung; tiêu đề đã đáp thì đứng yên; màu nhấn chỉ cho 1 chữ/1 vật.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, useCurrentFrame } from "remotion";
import { arr, blurIn, clamp, DISPLAY, easeInOut, easeOut, fadeIn, H1, num, SAFE, SAFE_PAD, SIZE, str, UI, useBeats, usePop, useCol, useSceneDur, useT } from "../core/look";
import { Annotate, asset, Cursor, Device, FlashFrame, FreezeVideo, Glitch, Icon, MediaView, Particles, Rays, Shockwave, Words } from "../core/fx";
import { FPS, H, VERTICAL, W } from "../core/timeline";
import type { Media, SceneType } from "../core/types";

type P = { props: Record<string, unknown> };
const Kicker: React.FC<{ text: string; at?: number; c?: string }> = ({ text, at = 0, c }) => {
  const T = useT();
  const f = useCurrentFrame();
  const w = interpolate(f, [at, at + 12], [100, 0], { ...clamp, easing: easeOut });
  return <div style={{ fontFamily: UI, fontWeight: 800, fontSize: SIZE.min * 1.35, letterSpacing: "0.12em", textTransform: "uppercase", color: c ?? T.accent, clipPath: `inset(0 ${w.toFixed(1)}% 0 0)`, translate: `${(w * 0.4).toFixed(1)}px 0px` }}>{text}</div>;
};
const media = (v: unknown): Media | null => (v && typeof v === "object" && "src" in (v as object) ? (v as Media) : null);

/** Lớp phủ dùng cho mọi cảnh: props.cursor [{beat,x,y,click}] và props.notes [{kind,x,y,w,h,beat,color}]. */
export const Overlay: React.FC<P> = ({ props }) => {
  const bt = useBeats();
  const cur = arr<{ beat: number; x: number; y: number; click?: boolean }>(props.cursor).map((c) => ({ f: bt(c.beat), x: c.x, y: c.y, click: c.click }));
  return (
    <>
      {arr<{ kind: "circle" | "underline" | "strike"; x: number; y: number; w: number; h: number; beat: number; out?: number; color?: string }>(props.notes).map((n, i) => <Annotate key={i} kind={n.kind} x={n.x} y={n.y} w={n.w} h={n.h} at={bt(n.beat)} out={n.out == null ? undefined : bt(n.out)} color={n.color} />)}
      {cur.length > 0 && <Cursor path={cur} />}
    </>
  );
};

/* TitleSlam — chữ nện theo phách. props: lines[{text, at, size:"hero"|"title", color, glitch}], sub{text, at}, align */
const TitleSlam: React.FC<P> = ({ props }) => {
  const T = useT();
  const col = useCol();
  const f = useCurrentFrame();
  const bt = useBeats();
  const lines = arr<{ text: string; at: number; size?: "hero" | "title"; color?: string; glitch?: boolean }>(props.lines);
  const sub = props.sub as { text: string; at: number } | undefined;
  const center = props.align === "center";
  return (
    <AbsoluteFill style={{ ...SAFE_PAD, justifyContent: "center", alignItems: center ? "center" : "flex-start", textAlign: center ? "center" : "left" }}>
      {lines.map((l, i) => {
        const at = bt(l.at);
        const fs = l.size === "hero" ? SIZE.hero : SIZE.title;
        return l.glitch ? (
          <Glitch key={i} amount={f >= at ? interpolate(f, [at, at + 14], [1.4, 0.1], clamp) : 0} style={{ ...H1, fontSize: fs, color: col(l.color), opacity: f >= at ? 1 : 0, scale: interpolate(f, [at, at + 10], [2, 1], { ...clamp, easing: Easing.out(Easing.exp) }), transformOrigin: center ? "center" : "left center" }}>{l.text}</Glitch>
        ) : (
          <Words key={i} text={l.text} at={at} step={Math.round(bt(1) / 2)} slam echo={l.size === "hero"} style={{ ...H1, fontSize: fs, color: col(l.color), justifyContent: center ? "center" : "flex-start" }} />
        );
      })}
      {sub && <div style={{ fontFamily: UI, fontWeight: 600, fontSize: SIZE.sub, color: T.inkSoft, marginTop: SIZE.sub, ...blurIn(f, bt(sub.at)) }}>{sub.text}</div>}
    </AbsoluteFill>
  );
};

/* LogoReveal — dấu/biểu tượng đóng xuống + tên + câu định vị, nền là ảnh/tranh thật của thương hiệu.
   props: mark{text|image}, name, tagline, art(Media), markColor */
const LogoReveal: React.FC<P> = ({ props }) => {
  const T = useT();
  const col = useCol();
  const f = useCurrentFrame();
  const bt = useBeats();
  const pop = usePop();
  const s = pop(0, 11);
  const mark = props.mark as { text?: string; image?: string } | undefined;
  const art = media(props.art);
  const size = Math.min(W, H) * 0.25;
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Rays x={W / 2} y={H * 0.65} />
      {art && <div style={{ position: "absolute", left: -W * 0.2, width: W * 1.4, bottom: 0, scale: interpolate(f, [0, bt(8)], [1.3, 1.0], { ...clamp, easing: easeInOut }), translate: `0px ${interpolate(f, [0, bt(8)], [160, -30], { ...clamp, easing: easeInOut }).toFixed(1)}px` }}><MediaView m={art} /></div>}
      <div style={{ marginTop: VERTICAL ? H * 0.16 : H * 0.12, scale: interpolate(s, [0, 1], [3.2, 1]), rotate: `${interpolate(s, [0, 1], [-20, -5])}deg`, opacity: Math.min(1, s * 3) }}>
        {mark?.image ? <Img src={asset(mark.image)} style={{ width: size }} /> : (
          <div style={{ width: size, height: size, borderRadius: size * 0.22, background: col(props.markColor, T.accent), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: size * 0.62 }}>{mark?.text ?? "★"}</div>
        )}
      </div>
      <Shockwave at={3} x={W / 2} y={(VERTICAL ? H * 0.16 : H * 0.12) + size / 2} c={col(props.markColor, T.accent)} />
      <Words text={str(props.name)} at={bt(1)} step={bt(0.5)} slam style={{ ...H1, fontSize: SIZE.hero * 0.9, color: T.ink, marginTop: SIZE.sub, justifyContent: "center" }} />
      <div style={{ fontFamily: UI, fontWeight: 700, fontSize: SIZE.sub, color: T.inkSoft, marginTop: SIZE.min * 0.6, ...blurIn(f, bt(2.5)) }}>{str(props.tagline)}</div>
    </AbsoluteFill>
  );
};

/* StatCount — số đếm lên theo phách + (tuỳ chọn) vòng ảnh 3D. props: kicker, stats[{value,label,at}], ring[Media ảnh] */
const StatCount: React.FC<P> = ({ props }) => {
  const T = useT();
  const f = useCurrentFrame();
  const bt = useBeats();
  const stats = arr<{ value: number; from?: number; label: string; at: number }>(props.stats);
  const sub = props.sub as { text: string; at: number } | undefined;
  const solo = stats.length === 1;
  const ring = arr<Media>(props.ring);
  const rot = interpolate(f, [0, bt(16)], [60, -200]);
  const R = Math.min(W, H) * (VERTICAL ? 0.52 : 0.42), cw = Math.min(W, H) * (VERTICAL ? 0.27 : 0.3);
  return (
    <AbsoluteFill style={{ ...SAFE_PAD, justifyContent: solo ? "center" : undefined, paddingBottom: solo && VERTICAL ? H - 1330 : undefined }}>
      <Kicker text={str(props.kicker)} />
      {stats.map((s, i) => {
        const at = bt(s.at);
        const v = Math.round(interpolate(f, [at, at + bt(2) - bt(0)], [s.from ?? 0, s.value], { ...clamp, easing: easeOut }));
        return (
          <div key={i} style={{ ...H1, fontSize: solo ? SIZE.hero * 2.6 : i === 0 ? SIZE.title * 1.15 : SIZE.title * 0.9, lineHeight: solo ? 0.95 : 1.04, color: T.ink, marginTop: solo ? SIZE.title * 0.4 : 0, ...blurIn(f, at) }}>
            <span style={{ color: T.accent }}>{v.toLocaleString("vi-VN")}</span>{solo ? <div style={{ fontSize: SIZE.title }}>{s.label}</div> : ` ${s.label}`}
          </div>
        );
      })}
      {sub && <div style={{ fontFamily: UI, fontWeight: 700, fontSize: SIZE.sub, color: T.inkSoft, marginTop: SIZE.min, ...blurIn(f, bt(sub.at)) }}>{sub.text}</div>}
      {ring.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: VERTICAL ? H * 0.55 : H * 0.22, height: H * 0.4, perspective: 1800 }}>
          <div style={{ position: "absolute", left: VERTICAL ? W / 2 : W * 0.7, top: 40, transformStyle: "preserve-3d", transform: `translateZ(-260px) rotateY(${rot}deg)` }}>
            {ring.map((m, i) => (
              <Img key={i} src={asset(m.src)} style={{ position: "absolute", width: cw, left: -cw / 2, transform: `rotateY(${(i / ring.length) * 360}deg) translateZ(${R}px)`, backfaceVisibility: "hidden", filter: "drop-shadow(0 20px 30px rgba(0,0,0,.45))", opacity: fadeIn(f, 4 + i * 2) }} />
            ))}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* KnowledgeCard — thẻ kiến thức dựng từ DỮ LIỆU THẬT: thuật ngữ, câu hiểu nhanh gõ dần, nhánh sơ đồ có icon, mẹo nhớ, hỏi–đáp, nguồn.
   props: kicker, term, gist, branches[{label, icon, children[], tone:"accent"|"accent2"|"warn"}], hook, qa{q,a}, cite, at{gist,branches,hook,qa,answer} */
const KnowledgeCard: React.FC<P> = ({ props }) => {
  const T = useT();
  const f = useCurrentFrame();
  const bt = useBeats();
  const pop = usePop();
  const at = { gist: 1, branches: 4, hook: 9, qa: 11, answer: 13, ...(props.at as object) } as Record<string, number>;
  const gist = str(props.gist);
  const typeEnd = Math.max(bt(at.gist) + 1, bt(at.branches - 0.5)); // không có gist hoặc nhánh vào sớm: tránh khoảng nội suy đảo
  const typed = gist ? gist.slice(0, Math.floor(interpolate(f, [bt(at.gist), typeEnd], [0, gist.length], clamp))) : "";
  const branches = arr<{ label: string; icon?: string; children?: string[]; tone?: string }>(props.branches);
  const qa = props.qa as { q: string; a: string } | undefined;
  const hookEl = str(props.hook) ? (
    <div style={{ marginTop: SIZE.min * 1.2, fontFamily: DISPLAY, fontWeight: 800, fontSize: SIZE.body * 1.6, lineHeight: 1.15, color: T.ink, position: "relative", alignSelf: "flex-start", opacity: fadeIn(f, bt(at.hook - 0.5), 6), scale: interpolate(f, [bt(at.hook - 0.5), bt(at.hook - 0.5) + 10], [1.6, 1], { ...clamp, easing: Easing.out(Easing.exp) }), transformOrigin: "left center" }}>
      <span style={{ position: "absolute", left: -8, right: -8, top: "45%", height: "45%", background: T.accent, opacity: 0.35, transformOrigin: "left", scale: `${interpolate(f, [bt(at.hook), bt(at.hook + 1)], [0, 1], { ...clamp, easing: easeOut })} 1` }} />
      <span style={{ position: "relative" }}>{str(props.hook)}</span>
    </div>
  ) : null;
  const shown = branches.filter((_, i) => f >= bt(at.branches + i)).length;
  const drift = interpolate(f, [bt(at.branches), bt(at.branches + branches.length)], [0, -60 * Math.max(0, branches.length - 1)], { ...clamp, easing: easeInOut });
  void shown;
  const toneC = (t?: string) => (t === "warn" ? "#c0392b" : t === "accent2" ? T.accent2 : T.accent);
  return (
    <AbsoluteFill style={{ ...SAFE_PAD, translate: VERTICAL ? `0px ${(drift * 0.5).toFixed(1)}px` : undefined, ...(VERTICAL ? {} : { display: "grid", gridTemplateColumns: "1fr 1.1fr", columnGap: SIZE.title * 0.6, alignContent: "start" }) }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
      <Kicker text={str(props.kicker)} />
      <div style={{ ...H1, fontSize: SIZE.hero, color: T.ink, scale: interpolate(pop(0), [0, 1], [1.3, 1]), transformOrigin: "left center" }}>{str(props.term)}</div>
      {gist && <div style={{ fontFamily: UI, fontWeight: 600, fontSize: SIZE.body * 1.25, lineHeight: 1.4, color: T.ink, marginTop: SIZE.min * 0.6, minHeight: SIZE.body * 5.5 }}>
        {typed}<span style={{ opacity: f < bt(at.branches) && Math.floor(f / 15) % 2 === 0 ? 1 : 0, color: T.accent }}>▍</span>
      </div>}
      {VERTICAL ? null : hookEl}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "grid", gridTemplateColumns: VERTICAL && !gist ? "1fr" : "1fr 1fr", gap: SIZE.min * 0.8, marginTop: VERTICAL ? SIZE.min * 0.9 : SIZE.title * 0.5 }}>
        {branches.map((n, i) => {
          const a = bt(at.branches + i);
          return (
            <div key={i} style={{ background: T.ground2, border: `3px solid ${toneC(n.tone)}`, borderRadius: 24, padding: VERTICAL ? (gist ? "20px 22px" : "30px 34px") : "30px 30px", minHeight: VERTICAL ? undefined : H * 0.26, scale: pop(a), opacity: f >= a ? 1 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: toneC(n.tone) }}>
                {n.icon && <Icon name={n.icon} size={SIZE.body * (VERTICAL ? (gist ? 1.6 : 2.4) : 2)} width={2} draw={interpolate(f, [a, a + 22], [0, 1], clamp)} />}
                <div style={{ fontFamily: UI, fontWeight: 800, fontSize: SIZE.body * (VERTICAL ? (gist ? 1 : 1.45) : 1.15), color: T.ink, lineHeight: 1.2 }}>{n.label}</div>
              </div>
              {(n.children ?? []).map((c) => <div key={c} style={{ fontFamily: UI, fontWeight: 600, fontSize: SIZE.min * 1.1, color: T.inkSoft, marginTop: 6 }}>· {c}</div>)}
            </div>
          );
        })}
      </div>
      {VERTICAL ? hookEl : null}
      {qa && (
        <div style={{ marginTop: SIZE.min, background: T.ink, color: T.ground, borderRadius: 28, padding: "26px 30px", scale: pop(bt(at.qa)), opacity: f >= bt(at.qa) ? 1 : 0, alignSelf: "stretch" }}>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: SIZE.body, lineHeight: 1.35 }}>{qa.q}</div>
          <div style={{ fontFamily: UI, fontWeight: 800, fontSize: SIZE.body * 1.15, color: T.accent, marginTop: 12, ...blurIn(f, bt(at.answer)) }}>→ {qa.a}</div>
          {str(props.cite) && <div style={{ fontFamily: UI, fontWeight: 600, fontSize: SIZE.min, opacity: 0.65 * fadeIn(f, bt(at.answer + 1)), marginTop: 10 }}>Căn cứ: {str(props.cite)}</div>}
        </div>
      )}
      </div>
    </AbsoluteFill>
  );
};

/* FeatureSteps — các bước/bậc, mỗi bước vào trên một phách. props: kicker, title, steps[{label, sub, icon}], start, every, note{text,at} */
const FeatureSteps: React.FC<P> = ({ props }) => {
  const T = useT();
  const f = useCurrentFrame();
  const bt = useBeats();
  const pop = usePop();
  const steps = arr<{ label: string; sub?: string; icon?: string }>(props.steps);
  const start = num(props.start, 1), every = num(props.every, 2);
  const note = props.note as { text: string; at: number } | undefined;
  return (
    <AbsoluteFill style={{ ...SAFE_PAD }}>
      <Kicker text={str(props.kicker)} />
      <Words text={str(props.title)} at={0} step={4} style={{ ...H1, fontSize: SIZE.title, color: T.ink }} accentWords={arr<number>(props.accentWords)} />
      <div style={{ marginTop: SIZE.min }}>
        {steps.map((s, i) => {
          const a = bt(start + i * every), on = f >= a, last = i === steps.length - 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, padding: VERTICAL ? "22px 26px" : "16px 22px", marginBottom: VERTICAL ? 20 : 14, borderRadius: 24, background: on ? (last ? T.accent2 : T.ground2) : "transparent", opacity: on ? 1 : 0.12, translate: `${interpolate(pop(a), [0, 1], [W * 0.15, 0])}px 0px`, marginLeft: VERTICAL ? i * 16 : 0 }}>
              <div style={{ width: SIZE.body * 2.6, height: SIZE.body * 2.6, borderRadius: 20, background: last ? "rgba(255,255,255,.18)" : T.ink, color: last ? "#fff" : T.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: SIZE.body * 1.1 }}>
                {s.icon ? <Icon name={s.icon} size={SIZE.body * 1.4} width={2} draw={interpolate(f, [a, a + 20], [0, 1], clamp)} /> : i + 1}
              </div>
              <div>
                <div style={{ fontFamily: UI, fontWeight: 800, fontSize: SIZE.body * (VERTICAL ? 1.45 : 1.15), color: last ? "#fff" : T.ink }}>{s.label}</div>
                {s.sub && <div style={{ fontFamily: UI, fontWeight: 600, fontSize: SIZE.min * 1.1, color: last ? "rgba(255,255,255,.85)" : T.inkSoft }}>{s.sub}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {note && <div style={{ fontFamily: UI, fontWeight: 700, fontSize: SIZE.min * 1.2, color: T.accent, marginTop: 8, ...blurIn(f, bt(note.at)) }}>{note.text}</div>}
    </AbsoluteFill>
  );
};

/* DeviceDemo — bản quay THẬT của sản phẩm trong khung máy. Sự kiện trong bản quay (giây `syncSec`) rơi đúng phách `syncBeat`.
   props: kicker, title, device:"phone"|"browser", media(Media video/ảnh), poster(ảnh khung đầu), syncSec, syncBeat, chips[{text, at, x, y, tone}] */
const DeviceDemo: React.FC<P> = ({ props }) => {
  const dur = useSceneDur();
  const T = useT();
  const col = useCol();
  const f = useCurrentFrame();
  const bt = useBeats();
  const pop = usePop();
  const m = media(props.media);
  const startAt = bt(num(props.syncBeat, 2)) - Math.round(num(props.syncSec, 0) * FPS);
  const chips = arr<{ text: string; at: number; x: number; y: number; tone?: string }>(props.chips);
  const phone = props.device !== "browser";
  // dọc: máy giữa, dưới tiêu đề; ngang: máy bên phải cao 84 % khung, chữ bên trái
  const dw = phone ? (VERTICAL ? Math.min(W * 0.52, 600) : (H * 0.84 * 9) / 16) : VERTICAL ? W * 0.86 : W * 0.5;
  const dh = phone ? (dw * 16) / 9 + 28 : (dw * 10) / 16 + 38;
  const dx = VERTICAL ? (W - dw) / 2 : W * 0.62 - dw / 2 + (phone ? 0 : W * 0.08);
  const dy = VERTICAL ? H * 0.27 : (H - dh) / 2;
  return (
    <AbsoluteFill style={{ ...SAFE_PAD }}>
      <Kicker text={str(props.kicker)} />
      <Words text={str(props.title)} at={0} step={4} style={{ ...H1, fontSize: SIZE.title * 0.9, color: T.ink, maxWidth: VERTICAL ? undefined : W * 0.42 }} accentWords={arr<number>(props.accentWords)} />
      <Device kind={phone ? "phone" : "browser"} width={dw} style={{ position: "absolute", left: dx, top: dy, transformOrigin: `50% ${num(props.zoomFocus, 0.5) * 100}%`, scale: (props.zoomAt == null ? 1 : interpolate(f, [bt(num(props.zoomAt)) - 6, bt(num(props.zoomAt)) + 14], [1, num(props.zoom, 1.35)], { ...clamp, easing: easeOut })) * (props.exitPush ? interpolate(f, [dur - bt(0.75) + bt(0), dur], [1, 3.2], { ...clamp, easing: Easing.in(Easing.cubic) }) : 1), rotate: `${interpolate(pop(0), [0, 1], [8, -2])}deg`, translate: `0px ${interpolate(pop(0), [0, 1], [H * 0.5, 0])}px` }}>
        {str(props.poster) && <Img src={asset(str(props.poster))} style={{ width: "100%", position: "absolute", inset: 0 }} />}
        {m && <Sequence from={Math.max(0, startAt)} layout="none"><div style={{ position: "absolute", inset: 0 }}>{props.freeze ? <FreezeVideo m={m} atSec={num(props.syncSec) + num((props.freeze as { after?: number }).after, 0.25)} hold={num((props.freeze as { frames?: number }).frames, 24)} /> : <MediaView m={m} />}</div></Sequence>}
      </Device>
      {props.flash !== false && <FlashFrame at={bt(num(props.syncBeat, 2)) + (props.freeze ? Math.round(num((props.freeze as { after?: number }).after, 0.25) * 60) : 0)} strength={0.55} />}
      {chips.map((c, i) => {
        const a = bt(c.at);
        return <div key={i} style={{ position: "absolute", left: c.x, top: c.y, padding: "14px 26px", borderRadius: 16, background: col(c.tone, T.ink), color: c.tone ? "#fff" : T.ground, fontFamily: UI, fontWeight: 800, fontSize: SIZE.min * 1.3, scale: pop(a), opacity: f >= a ? (props.exitPush ? interpolate(f, [dur - bt(0.75), dur - bt(0.75) + 6], [1, 0], clamp) : 1) : 0, rotate: `${i % 2 ? 3 : -4}deg`, boxShadow: "0 16px 34px rgba(0,0,0,.3)" }}>{c.text}</div>;
      })}
    </AbsoluteFill>
  );
};

/* MediaHero — bản quay/ảnh toàn khung (vd. animation thật của web), sự kiện `syncSec` rơi đúng phách `hitBeat`; phóng nhẹ ở cú nện.
   props: media, poster, syncSec, hitBeat, focus{x,y} (0–1), lines[{text, at, color}], linesOut(beat), darkIntroSec */
const MediaHero: React.FC<P> = ({ props }) => {
  const T = useT();
  const col = useCol();
  const f = useCurrentFrame();
  const bt = useBeats();
  const m = media(props.media);
  const hit = bt(num(props.hitBeat, 8));
  const start = hit - Math.round(num(props.syncSec, 0) * FPS);
  const focus = (props.focus as { x: number; y: number }) ?? { x: 0.5, y: 0.45 };
  const push = num(props.pushIn, 1.14);
  // đẩy máy dần vào tiêu điểm 2 phách trước cú nện, giữ, rồi lùi ra để lộ toàn bộ (cận cảnh → toàn cảnh)
  const zoom = interpolate(f, [hit - bt(2) + bt(0), hit, hit + bt(1.5) - bt(0), hit + bt(3) - bt(0)], [1, push, push, 1.06], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cutBottom = num(props.cutBottom, 0);
  const lines = arr<{ text: string; at: number; color?: string }>(props.lines);
  const dark = num(props.darkIntroSec, 0) * FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ maskImage: cutBottom ? `linear-gradient(#000 ${H - cutBottom - 120}px, transparent ${H - cutBottom}px)` : undefined, WebkitMaskImage: cutBottom ? `linear-gradient(#000 ${H - cutBottom - 120}px, transparent ${H - cutBottom}px)` : undefined }}><AbsoluteFill style={{ scale: zoom * num(props.baseScale, 1), transformOrigin: `${focus.x * 100}% ${focus.y * 100}%` }}>
        {str(props.poster) && <Img src={asset(str(props.poster))} style={{ width: W, height: H, position: "absolute", objectFit: "cover" }} />}
        {m && <Sequence from={Math.max(0, start)} layout="none"><div style={{ position: "absolute", inset: 0 }}>{props.freezeFrames || props.skipFrames ? <FreezeVideo m={m} atSec={num(props.syncSec)} hold={num(props.freezeFrames)} skip={num(props.skipFrames)} style={{ width: W, height: H, objectFit: "cover" }} /> : <MediaView m={m} style={{ width: W, height: H, objectFit: "cover" }} />}</div></Sequence>}
      </AbsoluteFill></AbsoluteFill>
      {dark > 0 && <AbsoluteFill style={{ background: "#05050a", opacity: interpolate(f, [0, Math.max(1, start) + dark * 0.6, Math.max(1, start) + dark], [0.9, 0.75, 0], clamp) }} />}
      <Particles n={40} c={T.accent} speed={2} />
      <AbsoluteFill style={{ ...SAFE_PAD, pointerEvents: "none", opacity: interpolate(f, [bt(num(props.linesOut, 6)), bt(num(props.linesOut, 6) + 1.5)], [1, 0], clamp) }}>
        <Kicker text={str(props.kicker)} />
        {lines.map((l, i) => <Words key={i} text={l.text} at={bt(l.at)} step={bt(0.5)} slam style={{ ...H1, fontSize: SIZE.title * 0.85, color: col(l.color, "#fff"), textShadow: "0 6px 30px rgba(0,0,0,.7)" }} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* CardCycle — vài thẻ/ảnh thay nhau trên phách, lật 3D + vệt sáng lướt. props: kicker, items[{image, label, color}], every */
const CardCycle: React.FC<P> = ({ props }) => {
  const T = useT();
  const col = useCol();
  const f = useCurrentFrame();
  const bt = useBeats();
  const items = arr<{ image: string; label: string; color?: string }>(props.items);
  const every = num(props.every, 2);
  const idx = Math.max(0, Math.min(items.length - 1, items.findIndex((_, i) => f < bt((i + 1) * every)) === -1 ? items.length - 1 : items.findIndex((_, i) => f < bt((i + 1) * every))));
  const local = f - bt(idx * every);
  const it = items[idx];
  if (!it) return null;
  const c = col(it.color, T.accent);
  const cw = Math.min(W * (VERTICAL ? 0.94 : 0.82), 1100);
  return (
    <AbsoluteFill style={{ ...SAFE_PAD, alignItems: "center" }}>
      <Kicker text={str(props.kicker)} c={T.accent} />
      <div style={{ ...H1, fontSize: SIZE.title, color: c, marginTop: SIZE.min * 0.5, ...blurIn(f, bt(idx * every), 6) }}>{it.label}</div>
      <div style={{ perspective: 1800, marginTop: H * 0.06 }}>
        <div style={{ position: "relative", width: cw, transform: `rotateY(${interpolate(local, [0, 12], [180, 360], { ...clamp, easing: easeOut })}deg)`, backfaceVisibility: "hidden", filter: `drop-shadow(0 30px 60px rgba(0,0,0,.6))` }}>
          <Img src={asset(it.image)} style={{ width: cw, display: "block" }} />
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", mixBlendMode: "screen", borderRadius: 32 }}>
            <div style={{ position: "absolute", top: -200, bottom: -200, width: cw * 0.25, left: interpolate(local, [6, 40], [-cw * 0.35, cw * 1.2], clamp), rotate: "20deg", background: "linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent)" }} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: H * 0.05 }}>
        {items.map((x, i) => <div key={i} style={{ width: 40, height: 40, borderRadius: 99, background: i <= idx ? col(x.color, T.accent) : "transparent", border: `4px solid ${col(x.color, T.accent)}` }} />)}
      </div>
    </AbsoluteFill>
  );
};

/* Ladder — chuỗi thăng tiến: ảnh đổi mỗi phách, sau đó toả ra vài nhánh, cuối cùng một video/ảnh chốt (có thể trong suốt).
   props: kicker, titles{climb, fan, finale}, climb[{image,label}], fan[{image,label,sub}], fanAt, finale{media, at}, note */
const Ladder: React.FC<P> = ({ props }) => {
  const T = useT();
  const f = useCurrentFrame();
  const bt = useBeats();
  const pop = usePop();
  const climb = arr<{ image: string; label: string }>(props.climb);
  const fan = arr<{ image: string; label: string; sub?: string }>(props.fan);
  const fanAt = num(props.fanAt, climb.length + 1);
  const fin = props.finale as { media: Media; at: number } | undefined;
  const titles = (props.titles ?? {}) as Record<string, string>;
  const phase = fin && f >= bt(fin.at) ? "finale" : fan.length && f >= bt(fanAt) ? "fan" : "climb";
  const step = Math.min(climb.length - 1, Math.floor(f / Math.max(1, bt(1))));
  const local = f - bt(step);
  const iw = VERTICAL ? W * 0.38 : Math.min(W * 0.55, 620);
  const ASPECT = num(props.aspect, 1.526); // cao/rộng của ảnh tủ trưng bày
  return (
    <AbsoluteFill style={{ ...SAFE_PAD }}>
      <Rays x={W / 2} y={H * 0.52} />
      <Particles n={phase === "finale" ? 50 : 20} c={T.accent} />
      <Kicker text={str(props.kicker)} />
      <div style={{ ...H1, fontSize: SIZE.title * 0.9, color: T.ink }}>{phase === "climb" ? titles.climb : phase === "fan" ? titles.fan : titles.finale}</div>
      {phase === "climb" && climb[step] && (
        <>
          {/* tủ trước lùi ra sau (chồng theo chiều sâu Z): mỗi bậc ×0,86, lên 46 px, mờ dần — tủ mới lao lên phía trước */}
          {climb.slice(Math.max(0, step - 3), step).map((c, j, a) => {
            const depth = a.length - j + interpolate(local, [0, 12], [-1, 0], { ...clamp, easing: easeOut });
            return <Img key={c.image} src={asset(c.image)} style={{ position: "absolute", left: (W - iw) / 2, top: H * 0.27, width: iw, scale: 0.9 ** depth, translate: `${(150 * depth).toFixed(1)}px ${(-60 * depth).toFixed(1)}px`, opacity: Math.max(0, 0.9 - 0.15 * depth), filter: `blur(${(1 + 1 * depth).toFixed(1)}px) brightness(${(0.85 - 0.1 * depth).toFixed(2)})` }} />;
          })}
          <Img src={asset(climb[step].image)} style={{ position: "absolute", left: (W - iw) / 2, top: H * 0.27, width: iw, scale: interpolate(local, [0, 12], [1.25, 1], { ...clamp, easing: easeOut }), transformOrigin: "50% 85%", filter: `brightness(${interpolate(local, [0, 8], [1.5, 1], clamp)}) drop-shadow(0 30px 60px rgba(0,0,0,.6))` }} />
          <div style={{ position: "absolute", left: SAFE.left, right: SAFE.right, top: H * 0.27 + iw * ASPECT + 14, textAlign: "center", fontFamily: UI, fontWeight: 800, fontSize: SIZE.body * 1.3, color: T.accent }}>{climb[step].label}</div>
        </>
      )}
      {phase === "fan" && fan.map((x, i) => {
        const a = bt(fanAt + i * 0.7), w = W * 0.3;
        return (
          <div key={i} style={{ position: "absolute", top: H * 0.3 + Math.abs(i - (fan.length - 1) / 2) * 50, left: W * 0.04 + i * (W * 0.92 - w) / Math.max(1, fan.length - 1), width: w, rotate: `${(i - (fan.length - 1) / 2) * 7}deg`, scale: pop(a), opacity: f >= a ? 1 : 0, textAlign: "center" }}>
            <Img src={asset(x.image)} style={{ width: w, filter: "drop-shadow(0 20px 40px rgba(0,0,0,.6))" }} />
            <div style={{ fontFamily: UI, fontWeight: 800, fontSize: SIZE.min * 1.3, color: T.accent, marginTop: 12 }}>{x.label}</div>
            {x.sub && <div style={{ fontFamily: UI, fontWeight: 600, fontSize: SIZE.min, color: T.inkSoft }}>{x.sub}</div>}
          </div>
        );
      })}
      {phase === "finale" && fin && <Sequence from={bt(fin.at)} layout="none"><div style={{ position: "absolute", left: (W - iw * 0.95) / 2, top: H * 0.26, width: iw * 0.95 }}><MediaView m={fin.media} /></div></Sequence>}
      {phase === "finale" && fin && str(props.finaleLabel) && <Words text={str(props.finaleLabel)} at={bt(fin.at) + 6} step={5} slam echo style={{ position: "absolute", left: SAFE.left, right: SAFE.right, top: H * 0.26 + iw * 0.95 * ASPECT + 34, justifyContent: "center", ...H1, fontSize: SIZE.title * 0.8, color: T.accent }} />}
      {str(props.note) && <div style={{ position: "absolute", left: SAFE.left, right: SAFE.right, top: VERTICAL ? 1290 : H * 0.9, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: SIZE.min * 1.1, color: T.inkSoft }}>{str(props.note)}</div>}
    </AbsoluteFill>
  );
};

/* LineReveal — một đường số liệu vẽ dần (vd. đường quên + mốc ôn). props: kicker, title, points[[x,y] 0–1], marks[{x,label}], captions[] , drawBeats */
const LineReveal: React.FC<P> = ({ props }) => {
  const T = useT();
  const f = useCurrentFrame();
  const bt = useBeats();
  const pts = arr<[number, number]>(props.points);
  const marks = arr<{ x: number; label: string }>(props.marks);
  const gw = W - SAFE.left - SAFE.right, gh = H * (VERTICAL ? 0.4 : 0.4);
  const draw = interpolate(f, [0, bt(num(props.drawBeats, 6))], [0.04, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ ...SAFE_PAD }}>
      <Kicker text={str(props.kicker)} />
      <Words text={str(props.title)} at={0} step={4} style={{ ...H1, fontSize: SIZE.title, color: T.ink }} accentWords={arr<number>(props.accentWords)} />
      <svg width={gw} height={gh + 140} style={{ position: "absolute", left: SAFE.left, top: VERTICAL ? H * 0.3 : H * 0.42, overflow: "visible" }}>
        <line x1={0} y1={gh} x2={gw} y2={gh} stroke={T.inkSoft} strokeOpacity={0.4} strokeWidth={4} />
        <line x1={0} y1={0} x2={0} y2={gh} stroke={T.inkSoft} strokeOpacity={0.4} strokeWidth={4} />
        <polyline points={pts.map(([x, y]) => `${(x * gw).toFixed(1)},${((1 - y) * gh).toFixed(1)}`).join(" ")} fill="none" stroke={T.accent} strokeWidth={VERTICAL ? 14 : 10} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        {marks.map((m) => (
          <g key={m.label} opacity={draw >= m.x ? 1 : 0}>
            <circle cx={m.x * gw} cy={gh * 0.08} r={18} fill={T.accent2} />
            <text x={m.x * gw} y={-20} fill={T.ink} fontFamily={UI} fontWeight={800} fontSize={SIZE.min * 1.2} textAnchor="middle">{m.label}</text>
          </g>
        ))}
        {str(props.axisY) && <text x={-6} y={-8} fill={T.inkSoft} fontFamily={UI} fontWeight={700} fontSize={SIZE.min * 1.1}>{str(props.axisY)} ↑</text>}
        {str(props.axisX) && <text x={gw} y={gh + SIZE.min * 1.6} fill={T.inkSoft} fontFamily={UI} fontWeight={700} fontSize={SIZE.min * 1.1} textAnchor="end">{str(props.axisX)} →</text>}
        {str(props.rider) && (() => {
          // vị trí theo ĐỘ DÀI CUNG (polyline vẽ bằng pathLength), không theo chỉ số điểm — nếu không chip sẽ lệch khỏi đầu nét ở đoạn dốc
          const P = pts.map(([x, y]) => [x * gw, (1 - y) * gh] as const);
          const acc = [0];
          for (let i = 1; i < P.length; i++) acc.push(acc[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
          const target = draw * (acc[acc.length - 1] || 1);
          let k = 1;
          while (k < P.length - 1 && acc[k] < target) k++;
          const tseg = (target - acc[k - 1]) / Math.max(1e-6, acc[k] - acc[k - 1]);
          const rx = (P[k - 1]?.[0] ?? 0) + ((P[k]?.[0] ?? 0) - (P[k - 1]?.[0] ?? 0)) * tseg, ryPx = (P[k - 1]?.[1] ?? 0) + ((P[k]?.[1] ?? 0) - (P[k - 1]?.[1] ?? 0)) * tseg;
          const xAt = rx / gw;
          const bump = Math.max(0, ...marks.map((m) => { const d = xAt - m.x; return d >= 0 && d < 0.05 ? 1 - d / 0.05 : 0; }));
          return (
            <g transform={`translate(${rx.toFixed(1)} ${ryPx.toFixed(1)}) scale(${1 + bump * 0.35})`}>
              <rect x={-110} y={-96} width={220} height={66} rx={18} fill={T.ground} stroke={T.accent} strokeWidth={4} />
              <text x={0} y={-52} textAnchor="middle" fill={T.ink} fontFamily={UI} fontWeight={800} fontSize={SIZE.min * 1.3}>{str(props.rider)}</text>
              <circle r={14} fill={T.accent} />
            </g>
          );
        })()}
        {arr<string>(props.captions).map((c, i) => <text key={c} x={0} y={gh + 60 + i * SIZE.min * 1.7} fill={T.inkSoft} fontFamily={UI} fontWeight={700} fontSize={SIZE.min * 1.2}>{c}</text>)}
      </svg>
    </AbsoluteFill>
  );
};

/* EndCard — dấu thương hiệu đáp MỘT lần, có lực; tên, thẻ, nút kêu gọi giữ 2–3 s; miễn trừ nếu cần.
   props: mark{text|image}, name, tags[], cta, url, disclaimer */
const EndCard: React.FC<P> = ({ props }) => {
  const T = useT();
  const f = useCurrentFrame();
  const bt = useBeats();
  const pop = usePop();
  const s = pop(0, 11);
  const mark = props.mark as { text?: string; image?: string } | undefined;
  const size = Math.min(W, H) * 0.2;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: VERTICAL ? H - 1330 : 0 }}>
      <Rays x={W / 2} y={H * 0.25} />
      <Particles n={30} c={T.accent} />
      <div style={{ scale: interpolate(s, [0, 1], [2.6, 1]), rotate: `${interpolate(s, [0, 1], [14, -5])}deg` }}>
        {mark?.image ? <Img src={asset(mark.image)} style={{ width: size }} /> : <div style={{ width: size, height: size, borderRadius: size * 0.22, background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: size * 0.62 }}>{mark?.text ?? "★"}</div>}
      </div>
      <div style={{ ...H1, fontSize: SIZE.hero * 0.9, color: T.ink, marginTop: SIZE.sub }}>{str(props.name)}</div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, padding: `0 ${SAFE.right}px`, marginTop: SIZE.min }}>
        <Words text={arr<string>(props.tags).join(" · ")} at={bt(1)} step={4} style={{ fontFamily: UI, fontWeight: 800, fontSize: SIZE.body * 1.15, color: T.accent, justifyContent: "center" }} />
      </div>
      {str(props.cta) && <div style={{ marginTop: SIZE.title * 0.6, padding: "28px 52px", borderRadius: 24, background: T.accent, color: T.ground, fontFamily: UI, fontWeight: 800, fontSize: SIZE.sub * 1.2, scale: pop(bt(3)) }}>{str(props.cta)}</div>}
      {str(props.url) && (() => {
        // thanh địa chỉ: cú bấm nút kêu gọi (props.typeAt) gõ URL từng ký tự — "cú bấm gây ra nhịp tiếp"
        const u = str(props.url), t0 = bt(num(props.typeAt, 4)), n = Math.round(interpolate(f, [t0, t0 + bt(1.2)], [0, u.length], clamp));
        return (
          <div style={{ marginTop: 30, display: "flex", alignItems: "center", gap: 14, padding: "16px 28px", borderRadius: 999, background: T.ground2, border: `3px solid ${T.ink}22`, fontFamily: UI, fontWeight: 700, fontSize: SIZE.min * 1.15, color: T.ink, opacity: f >= t0 - 8 ? 1 : 0, scale: pop(t0 - 8) }}>
            <svg width={26} height={30} viewBox="0 0 26 30"><rect x={3} y={13} width={20} height={15} rx={4} fill={T.accent2} /><path d="M7 13 V9 a6 6 0 0 1 12 0 V13" fill="none" stroke={T.accent2} strokeWidth={3.5} /></svg>
            <span>{u.slice(0, n)}<span style={{ opacity: Math.floor(f / 15) % 2 || n < u.length ? 1 : 0, color: T.accent }}>|</span></span>
          </div>
        );
      })()}
      {str(props.disclaimer) && <div style={{ position: "absolute", top: VERTICAL ? 1240 : H * 0.88, padding: `0 ${SAFE.right}px`, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: SIZE.min * 1.15, color: T.ink, opacity: 0.75 * fadeIn(f, bt(2)) }}>{str(props.disclaimer)}</div>}
    </AbsoluteFill>
  );
};

/* CardMontage — các màn/thẻ THẬT của sản phẩm lướt theo phách (cut-the-curve sang trái, một thẻ mỗi lúc), nhãn bậc lộ qua mặt nạ,
   số thứ tự to và thanh tiến độ. props: kicker, title, cards[{image,label}], start, every, accentWords */
const CardMontage: React.FC<P> = ({ props }) => {
  const T = useT();
  const f = useCurrentFrame();
  const bt = useBeats();
  const cards = arr<{ image: string; label: string }>(props.cards);
  const start = num(props.start, 1), every = num(props.every, 1.5);
  let idx = -1;
  cards.forEach((_, i) => { if (f >= bt(start + i * every)) idx = i; });
  const cw = VERTICAL ? W * 0.9 : H * 0.62;
  const travel = W * 0.12;
  return (
    <AbsoluteFill style={{ ...SAFE_PAD }}>
      <Kicker text={str(props.kicker)} />
      <Words text={str(props.title)} at={0} step={4} style={{ ...H1, fontSize: SIZE.title, color: T.ink }} accentWords={arr<number>(props.accentWords)} />
      {cards.map((c, i) => {
        const a = bt(start + i * every), z = i < cards.length - 1 ? bt(start + (i + 1) * every) : Infinity;
        if (f < a - 1 || f >= z + 8) return null;
        const tin = Math.min(1, (f - a) / 14), eIn = 1 - (1 - tin) ** 4;
        const tout = f >= z - 8 ? Math.min(1, (f - (z - 8)) / 8) : 0, eOut = tout ** 4;
        const x = travel * (1 - eIn) - travel * eOut, blur = 18 * (1 - eIn) + 18 * eOut;
        return (
          <div key={i} style={{ position: "absolute", left: (W - cw) / 2 - (VERTICAL ? 15 : 0), top: VERTICAL ? H * 0.24 : H * 0.28, width: cw, translate: `${x.toFixed(1)}px 0px`, opacity: f >= z ? 0 : Math.min(1, 0.35 + tin * 1.6) * (1 - tout * 1.3), filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined, rotate: `${(i % 2 ? 1 : -1) * 1.5}deg` }}>
            <div style={{ maxHeight: VERTICAL ? 1060 - H * 0.25 : H * 0.55, overflow: "hidden", borderRadius: 28, boxShadow: "0 30px 70px rgba(20,33,61,.28)", WebkitMaskImage: "linear-gradient(#000 88%, transparent)", maskImage: "linear-gradient(#000 88%, transparent)" }}><Img src={asset(c.image)} style={{ width: cw, display: "block" }} /></div>
          </div>
        );
      })}
      {idx >= 0 && (
        <div style={{ position: "absolute", left: SAFE.left, right: SAFE.right, top: VERTICAL ? 1095 : H * 0.84, display: "flex", alignItems: "baseline", gap: 22 }}>
          <div style={{ ...H1, fontSize: SIZE.hero * 1.1, color: T.accent, lineHeight: 1 }}>{idx + 1}</div>
          <Words key={idx} text={cards[idx].label} at={bt(start + idx * every)} step={4} style={{ fontFamily: UI, fontWeight: 800, fontSize: SIZE.body * 1.5, color: T.ink }} />
        </div>
      )}
      <div style={{ position: "absolute", left: SAFE.left, right: SAFE.right, top: VERTICAL ? 1306 : H * 0.95, display: "flex", gap: 10 }}>
        {cards.map((_, i) => <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i <= idx ? T.accent : T.inkSoft, opacity: i <= idx ? 1 : 0.25 }} />)}
      </div>
    </AbsoluteFill>
  );
};

export const SCENE_VIEWS: Record<SceneType, React.FC<P>> = { TitleSlam, LogoReveal, StatCount, KnowledgeCard, FeatureSteps, DeviceDemo, MediaHero, CardCycle, CardMontage, Ladder, LineReveal, EndCard };
