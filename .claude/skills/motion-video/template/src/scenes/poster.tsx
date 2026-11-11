// Bộ cảnh ÁP PHÍCH — cùng ngôn ngữ với tầng áp phích của infographic và tầng sân khấu của slide:
// chữ Anton cỡ lấp khung (tự co theo bề ngang), mảng màu quét, tờ giấy nghiêng, con dấu đóng xuống, số đếm.
// Quy ước như scenes/index.tsx: mốc trong props tính bằng PHÁCH từ đầu cảnh. Cú đóng dấu / cú nện muốn rung khung
// thì ghi thêm phách đó vào props.hits (Main đọc). Chữ đặt trên mảng màu nhấn luôn là trắng; chữ trên giấy luôn là mực.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { arr, clamp, easeInOut, easeOut, num, POSTER, SAFE, SAFE_PAD, SIZE, str, T as BASE, UI, useBeats, useCol, usePop, useT } from "../core/look";
import { H, VERTICAL, W } from "../core/timeline";

type P = { props: Record<string, unknown> };
const S = Math.min(W, H);
const SW = W - SAFE.left - SAFE.right;
const SH = H - SAFE.top - SAFE.bottom;
const BW = Math.max(4, Math.round(S * 0.006)); // nét viền, nét kẻ
const lum = (hex: string) => {
  const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
};
/** Màu mực thật của theme (cảnh nền tối đảo ink ↔ ground, còn tờ giấy và con dấu thì luôn cần mực tối). */
const DARK = lum(BASE.ink) < lum(BASE.ground) ? BASE.ink : BASE.ground;
const PAPER = "#fffdf4";
// lineHeight 1,16 + chừa 0,2 em phía trên trong <Rise>: chữ IN HOA có hai tầng dấu (Ấ, Ề, Ỗ) không bị cắt
const AN: React.CSSProperties = { fontFamily: POSTER, fontWeight: 400, lineHeight: 1.16, textTransform: "uppercase", letterSpacing: "0.004em", whiteSpace: "nowrap" };
/** Bề ngang THẬT của từng ký tự Anton in hoa (em) — đo từ file font bằng fontkit; chữ có dấu rộng bằng chữ gốc, riêng Ư / Ơ có móc. */
const AW: Record<string, number> = { A: 0.485, B: 0.479, C: 0.474, D: 0.493, "Đ": 0.493, E: 0.412, F: 0.399, G: 0.485, H: 0.499, I: 0.227, J: 0.466, K: 0.472, L: 0.397, M: 0.746, N: 0.498, O: 0.486, P: 0.472, Q: 0.494, R: 0.477, S: 0.461, T: 0.396, U: 0.474, V: 0.469, W: 0.712, X: 0.484, Y: 0.446, Z: 0.41,
  "1": 0.331, " ": 0.234, ".": 0.229, ",": 0.236, ":": 0.242, ";": 0.245, "!": 0.229, "?": 0.492, "%": 1.057, "-": 0.311, "–": 0.311, "—": 0.563, "/": 0.405, "(": 0.291, ")": 0.291, "+": 0.355, "=": 0.311, "§": 0.449, "·": 0.234 };
const em = (c: string) => {
  const d = c.toUpperCase().normalize("NFD");
  if (d.includes("\u031B")) return d[0] === "U" ? 0.529 : 0.488; // Ư, Ơ
  return AW[d[0]] ?? (/\d/.test(d[0]) ? 0.494 : 0.5);
};
/** Bề ngang một dòng chữ Anton (em), tính cả giãn chữ. */
const ems = (text: string) => [...text].reduce((a, c) => a + em(c) + 0.004, 0);
/** Cỡ chữ Anton để MỘT dòng vừa khít bề ngang `w` (chừa 2 %), không vượt `max`. */
const fit = (text: string, w: number, max: number, min = SIZE.sub) => Math.floor(Math.max(min, Math.min(max, (w * 0.98) / Math.max(0.4, ems(text)))));
/** Số dòng ước lượng của một đoạn chữ thường (Be Vietnam Pro đậm ~0,56 em mỗi ký tự) — để chừa chiều cao cho phần chữ dưới tiêu đề. */
const uiLines = (text: string, fs: number, w: number) => Math.max(1, Math.ceil((text.length * fs * 0.56) / w));
const prog = (f: number, at: number, len: number, easing: (n: number) => number = easeOut) => interpolate(f, [at, at + len], [0, 1], { ...clamp, easing });
const wipe = (p: number) => `inset(0 ${((1 - p) * 100).toFixed(1)}% 0 0)`;

/** Dòng chữ trồi lên từ dưới vạch (mask) — thay cho "trượt lên + mờ dần" quen mắt. */
const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; len?: number }> = ({ at, children, style, len = 15 }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, len);
  return (
    <div style={{ overflow: "hidden", flexShrink: 0, paddingTop: "0.2em", marginTop: "-0.2em", paddingBottom: "0.05em", ...style }}>
      <div style={{ translate: `0 ${((1 - p) * 115).toFixed(1)}%`, opacity: f >= at ? 1 : 0 }}>{children}</div>
    </div>
  );
};

/** Nhãn nhỏ trên mảng màu, quét ra từ trái. */
const Chip: React.FC<{ text: string; at: number; bg?: string; c?: string; style?: React.CSSProperties }> = ({ text, at, bg, c, style }) => {
  const T = useT();
  const f = useCurrentFrame();
  return <div style={{ alignSelf: "flex-start", fontFamily: UI, textWrap: "balance", fontWeight: 800, fontSize: Math.round(SIZE.min * 1.15), lineHeight: 1.25, padding: "0.36em 0.72em", background: bg ?? T.ink, color: c ?? T.ground, clipPath: wipe(prog(f, at, 12, easeInOut)), ...style }}>{text}</div>;
};

/** Nền áp phích: mảng chấm in (halftone) ở góc + một ký tự viền rỗng khổ lớn trôi rất chậm. Không phải chữ để đọc → máy đo bỏ qua. */
const Back: React.FC<{ glyph?: string }> = ({ glyph }) => {
  const T = useT();
  const f = useCurrentFrame();
  const d = Math.round(S * 0.03);
  return (
    <AbsoluteFill data-probe="skip" style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", right: -S * 0.16, top: -S * 0.16, width: S * 0.86, height: S * 0.86, backgroundImage: `radial-gradient(${T.ink} 24%, transparent 26%)`, backgroundSize: `${d}px ${d}px`, opacity: 0.12, maskImage: "radial-gradient(closest-side, #000 20%, transparent)", WebkitMaskImage: "radial-gradient(closest-side, #000 20%, transparent)" }} />
      {glyph ? <div style={{ position: "absolute", right: -S * 0.05, bottom: VERTICAL ? H * 0.16 : -H * 0.24, ...AN, fontSize: S * 1.02, lineHeight: 1, color: "transparent", WebkitTextStroke: `${Math.max(3, Math.round(S * 0.005))}px ${T.ink}`, opacity: 0.14, rotate: `${(-7 + f * 0.012).toFixed(2)}deg` }}>{glyph}</div> : null}
    </AbsoluteFill>
  );
};

/* PosterHook — câu hỏi mở đầu lấp khung. props: kicker, lines[{text, at, tone:"ink"|"accent"|"pop"|"box"}], sub{text, at}, glyph
   Mỗi dòng tự co cỡ chữ cho vừa bề ngang; dòng "box" nằm trên mảng màu nhấn quét ra, hơi nghiêng. */
const PosterHook: React.FC<P> = ({ props }) => {
  const T = useT();
  const col = useCol();
  const f = useCurrentFrame();
  const bt = useBeats();
  const lines = arr<{ text: string; at: number; tone?: "ink" | "accent" | "pop" | "box" }>(props.lines);
  const sub = props.sub as { text: string; at: number } | undefined;
  // cỡ chữ tối đa: vừa bề ngang VÀ cả khối vừa chiều cao vùng an toàn (trừ nhãn, dòng phụ)
  const extra = (props.kicker ? SIZE.min * 2.3 + S * 0.04 : 0) + (sub ? uiLines(sub.text, SIZE.sub, SW * 0.92) * SIZE.sub * 1.35 + S * 0.05 : 0);
  const max = Math.min(VERTICAL ? W * 0.3 : H * 0.3, (SH - extra) / (Math.max(1, lines.length) * 1.3));
  return (
    <AbsoluteFill>
      <Back glyph={str(props.glyph) || undefined} />
      <AbsoluteFill style={{ ...SAFE_PAD, justifyContent: "center" }}>
        {props.kicker ? <Chip text={str(props.kicker)} at={bt(num(props.kickerAt, 0))} bg={col("accent")} c="#fff" style={{ marginBottom: S * 0.04 }} /> : null}
        {lines.map((l, i) => {
          const at = bt(l.at);
          const box = l.tone === "box";
          const fs = fit(l.text, SW * (box ? 0.9 : 1), max);
          return box ? (
            <div key={i} style={{ alignSelf: "flex-start", marginTop: fs * 0.1, padding: `0 ${Math.round(fs * 0.09)}px`, background: col("accent"), color: "#fff", clipPath: wipe(prog(f, at, 11, easeInOut)), rotate: "-2deg", transformOrigin: "left center" }}>
              <Rise at={at + 4} style={{ ...AN, fontSize: fs }}>{l.text}</Rise>
            </div>
          ) : (
            <Rise key={i} at={at} style={{ ...AN, fontSize: fs, color: col(l.tone === "accent" || l.tone === "pop" ? l.tone : "ink") }}>{l.text}</Rise>
          );
        })}
        {sub ? <div style={{ fontFamily: UI, textWrap: "balance", fontWeight: 700, fontSize: SIZE.sub, lineHeight: 1.35, color: T.inkSoft, marginTop: S * 0.05, maxWidth: SW * 0.92, opacity: prog(f, bt(sub.at), 10) }}>{sub.text}</div> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* PosterLaw — điều luật trên tờ giấy nghiêng. props: cite ("Điều 35"), source, quote (đoạn cần tô đặt trong [ngoặc vuông]),
   at, quoteAt, markAt, stamp{text, at, tone:"bad"|"good"}. Nguyên văn phải lấy từ văn bản, không viết lại. */
const PosterLaw: React.FC<P> = ({ props }) => {
  const T = useT();
  const col = useCol();
  const f = useCurrentFrame();
  const bt = useBeats();
  const pop = usePop();
  const at = bt(num(props.at, 0));
  const qAt = bt(num(props.quoteAt, 1));
  const mAt = bt(num(props.markAt, 3));
  const stamp = props.stamp as { text: string; at: number; tone?: string } | undefined;
  const cite = str(props.cite);
  const parts = str(props.quote).split(/(\[[^\]]+\])/).filter(Boolean);
  const cw = VERTICAL ? SW : Math.min(SW, W * 0.64);
  const e = pop(at, 16);
  const hp = prog(f, mAt, 18, easeInOut);
  const sAt = stamp ? bt(stamp.at) : 0;
  const sp = stamp ? prog(f, sAt, 9, Easing.out(Easing.exp)) : 0;
  const sc = stamp?.tone === "good" ? col("accent2") : col("accent");
  let wi = 0;
  const word = (w: string, k: string) => <span key={k} style={{ opacity: prog(f, qAt + wi++ * 2, 6) }}>{w} </span>;
  return (
    <AbsoluteFill>
      <Back />
      <AbsoluteFill style={{ ...SAFE_PAD, justifyContent: "center", alignItems: VERTICAL ? "stretch" : "center" }}>
        <div style={{ position: "relative", width: cw, translate: `0 ${((1 - e) * H * 0.75).toFixed(1)}px`, rotate: `${(-1.6 - (1 - e) * 7).toFixed(2)}deg` }}>
          <div style={{ position: "absolute", inset: 0, translate: `${Math.round(S * 0.018)}px ${Math.round(S * 0.018)}px`, background: T.ink }} />
          <div style={{ position: "relative", background: PAPER, color: DARK, border: `${BW}px solid ${DARK}`, padding: `${S * 0.05}px ${S * 0.055}px ${S * 0.07}px` }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: S * 0.03 }}>
              <div style={{ ...AN, flex: "none", fontSize: fit(cite, cw * 0.5, S * 0.2), color: col("accent"), lineHeight: 1.05 }}>{cite}</div>
              <div style={{ fontFamily: UI, textWrap: "balance", fontWeight: 800, fontSize: Math.round(SIZE.min * 1.05), lineHeight: 1.3, textAlign: "right", color: DARK, opacity: 0.72, paddingBottom: S * 0.012 }}>{str(props.source)}</div>
            </div>
            <div style={{ height: BW * 1.5, background: DARK, margin: `${S * 0.02}px 0 ${S * 0.035}px` }} />
            <div style={{ fontFamily: UI, textWrap: "balance", fontWeight: 600, fontSize: Math.round(SIZE.sub * 1.02), lineHeight: 1.55 }}>
              {parts.map((seg, i) =>
                /^\[.*\]$/.test(seg) ? (
                  <span key={i} style={{ fontWeight: 800, backgroundImage: `linear-gradient(${col("pop")}, ${col("pop")})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 62%", backgroundSize: `${(hp * 100).toFixed(1)}% 78%`, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", padding: "0 0.12em" }}>
                    {seg.slice(1, -1).split(" ").map((w, k) => word(w, `${i}-${k}`))}
                  </span>
                ) : (
                  seg.trim().split(" ").map((w, k) => word(w, `${i}-${k}`))
                ),
              )}
            </div>
          </div>
          {stamp ? (
            <div style={{ position: "absolute", right: -S * 0.012, bottom: -S * 0.055, ...AN, fontSize: Math.round(S * 0.085), lineHeight: 1.1, color: sc, border: `${BW * 1.6}px solid ${sc}`, background: "rgba(255,253,244,.9)", padding: "0.08em 0.3em", rotate: "-9deg", scale: interpolate(sp, [0, 1], [3.2, 1]), opacity: f >= sAt ? 1 : 0 }}>{stamp.text}</div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* PosterSteps — các dải ngang lấp chiều cao, mỗi dải một con số lớn. props: kicker, title, steps[{label, sub, big}], start, every
   `big` = chữ lớn ở đầu dải (vd. "45", "30", "3"); không đặt thì là số thứ tự. Dải vừa vào được tô màu nhấn. */
const PosterSteps: React.FC<P> = ({ props }) => {
  const T = useT();
  const col = useCol();
  const f = useCurrentFrame();
  const bt = useBeats();
  const steps = arr<{ label: string; sub?: string; big?: string }>(props.steps);
  const start = num(props.start, 1);
  const every = num(props.every, 2);
  const title = str(props.title);
  const tfs = fit(title, SW, S * 0.15);
  const n = Math.max(1, steps.length);
  const gap = S * 0.022;
  const head = (title ? tfs * 1.3 + S * 0.035 : 0) + (props.kicker ? SIZE.min * 2.4 + S * 0.03 : 0);
  const bh = Math.min(S * 0.27, (SH - head - gap * (n - 1)) / n);
  const active = steps.reduce((a, _, i) => (f >= bt(start + i * every) ? i : a), -1);
  const nw = bh * 1.3;
  return (
    <AbsoluteFill style={{ ...SAFE_PAD, justifyContent: "center" }}>
      {props.kicker ? <Chip text={str(props.kicker)} at={bt(0)} bg={col("accent")} c="#fff" style={{ marginBottom: S * 0.03 }} /> : null}
      {title ? <Rise at={bt(0)} style={{ ...AN, fontSize: tfs, color: T.ink, marginBottom: S * 0.035 }}>{title}</Rise> : null}
      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {steps.map((s, i) => {
          const at = bt(start + i * every);
          const on = i === active;
          const big = s.big ?? String(i + 1);
          const lw = SW - nw - S * 0.075;
          return (
            <div key={i} style={{ display: "flex", alignItems: "stretch", height: bh, background: on ? col("accent") : T.ground2, color: on ? "#fff" : T.ink, border: `${BW}px solid ${T.ink}`, clipPath: wipe(prog(f, at, 13, easeInOut)) }}>
              <div style={{ flex: "none", width: nw, background: T.ink, color: on ? col("pop") : T.ground, display: "flex", alignItems: "center", justifyContent: "center", ...AN, fontSize: fit(big, nw * 0.8, bh * 0.6), lineHeight: 1 }}>{big}</div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: `0 ${S * 0.035}px`, minWidth: 0 }}>
                <div style={{ ...AN, fontSize: fit(s.label, lw, bh * 0.4), lineHeight: 1.12 }}>{s.label}</div>
                {s.sub ? <div style={{ fontFamily: UI, textWrap: "balance", fontWeight: 700, fontSize: Math.round(SIZE.min * 1.12), lineHeight: 1.3, opacity: 0.86 }}>{s.sub}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* PosterNumber — một con số đếm lên, lấp bề ngang. props: kicker, value, from, decimals, prefix, suffix, unit, label, at, dur,
   cells (số ô đếm theo: 45 ô = 45 ngày), note{text, at}. Số là thứ duy nhất chuyển động; đáp xong thì gạch chân quét ra. */
const PosterNumber: React.FC<P> = ({ props }) => {
  const T = useT();
  const col = useCol();
  const f = useCurrentFrame();
  const bt = useBeats();
  const value = num(props.value);
  const from = num(props.from, 0);
  const dec = num(props.decimals, 0);
  const a0 = num(props.at, 0);
  const at = bt(a0);
  const len = Math.max(1, bt(a0 + num(props.dur, 2)) - at);
  const p = prog(f, at, len, Easing.out(Easing.cubic));
  const fmt = (x: number) => x.toLocaleString("vi-VN", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const pre = str(props.prefix);
  const suf = str(props.suffix);
  const unit = str(props.unit);
  const cells = Math.min(120, num(props.cells, 0));
  const side = !VERTICAL && cells > 0; // ngang: số bên trái, lưới ô bên phải
  const nw = side ? SW * 0.5 : SW;
  // số + đơn vị (cỡ 0,3) cùng một hàng, vừa khít bề ngang
  const fs = Math.floor(Math.min(VERTICAL ? W * 0.72 : H * 0.62, (nw * 0.98) / (ems(pre + fmt(value) + suf) + (unit ? 0.06 + 0.3 * ems(unit) : 0))));
  const land = at + len;
  const punch = f >= land ? Math.exp(-(f - land) / 7) : 0;
  const note = props.note as { text: string; at: number } | undefined;
  const onDark = lum(T.ground) < 0.35;
  const numC = onDark ? col("pop") : col("accent");
  const cellC = onDark ? col("pop") : T.ink;
  const cols = VERTICAL ? 15 : 10;
  const gw = side ? SW * 0.42 : SW;
  const cg = Math.round(S * 0.008);
  const cs = (gw - cg * (cols - 1)) / cols;
  const filled = Math.round(cells * p);
  const grid = cells > 0 ? (
    <div data-probe="skip" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cs.toFixed(1)}px)`, gap: cg, marginTop: side ? 0 : S * 0.04 }}>
      {Array.from({ length: cells }, (_, i) => <div key={i} style={{ height: cs, background: i < filled ? cellC : "transparent", border: `${Math.max(2, BW - 2)}px solid ${i < filled ? cellC : T.inkSoft}` }} />)}
    </div>
  ) : null;
  return (
    <AbsoluteFill>
      <Back />
      <AbsoluteFill style={{ ...SAFE_PAD, justifyContent: "center", flexDirection: side ? "row" : "column", alignItems: side ? "center" : "stretch", gap: side ? SW * 0.08 : 0 }}>
        <div style={{ width: nw }}>
          {props.kicker ? <Chip text={str(props.kicker)} at={bt(0)} bg={col("accent")} c="#fff" style={{ marginBottom: S * 0.02 }} /> : null}
          <div style={{ display: "flex", alignItems: "baseline", gap: fs * 0.06, ...AN, fontSize: fs, lineHeight: 1.02, color: numC, scale: 1 + punch * 0.06, transformOrigin: "left center", opacity: f >= at ? 1 : 0 }}>
            <span>{pre}{fmt(v(from, value, p))}{suf}</span>
            {unit ? <span style={{ fontSize: fs * 0.3, color: T.ink }}>{unit}</span> : null}
          </div>
          <div style={{ height: BW * 3, background: onDark ? col("accent") : T.ink, width: nw, clipPath: wipe(prog(f, land, 12, easeInOut)), margin: `${S * 0.012}px 0 ${S * 0.03}px` }} />
          {props.label ? <div style={{ fontFamily: UI, textWrap: "balance", fontWeight: 800, fontSize: Math.round(SIZE.sub * 1.12), lineHeight: 1.3, color: T.ink, opacity: prog(f, land - 6, 10) }}>{str(props.label)}</div> : null}
          {note ? <div style={{ fontFamily: UI, textWrap: "balance", fontWeight: 600, fontSize: Math.round(SIZE.min * 1.1), lineHeight: 1.4, color: T.inkSoft, marginTop: S * 0.02, opacity: prog(f, bt(note.at), 10) }}>{note.text}</div> : null}
          {side ? null : grid}
        </div>
        {side ? grid : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const v = (from: number, to: number, p: number) => from + (to - from) * p;

/* PosterVersus — hai mảng màu trượt vào từ hai phía, dấu ngăn đóng ở giữa. props: left{label, sub, items[]}, right{…},
   vs ("VS", "≠", "HAY"), at, atRight, atVs, itemsAt, itemEvery. Dọc: trên / dưới; ngang: trái / phải. */
const PosterVersus: React.FC<P> = ({ props }) => {
  const col = useCol();
  const f = useCurrentFrame();
  const bt = useBeats();
  const pop = usePop();
  type Side = { label?: string; sub?: string; items?: string[] };
  const L = (props.left ?? {}) as Side;
  const R = (props.right ?? {}) as Side;
  const i0 = num(props.itemsAt, 3);
  const ev = num(props.itemEvery, 1);
  const mid = VERTICAL ? SAFE.top + SH / 2 : W / 2;
  const iw = VERTICAL ? SW : W / 2 - SAFE.left - S * 0.11;
  const pad = S * 0.11;
  const panel = (sd: Side, first: boolean, at: number) => {
    const p = prog(f, at, 14, easeInOut);
    const box: React.CSSProperties = VERTICAL
      ? { left: 0, right: 0, top: first ? 0 : mid, height: first ? mid : H - mid, paddingTop: first ? SAFE.top : pad, paddingBottom: first ? pad : SAFE.bottom, paddingLeft: SAFE.left, paddingRight: SAFE.right, justifyContent: first ? "flex-end" : "flex-start" }
      : { top: 0, bottom: 0, left: first ? 0 : mid, width: W / 2, paddingTop: SAFE.top, paddingBottom: SAFE.bottom, paddingLeft: first ? SAFE.left : pad, paddingRight: first ? pad : SAFE.right, justifyContent: "center" };
    return (
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", background: first ? DARK : col("accent"), color: "#fff", translate: `${((first ? -1 : 1) * (1 - p) * 100).toFixed(1)}% 0`, visibility: f >= at ? "visible" : "hidden", ...box }}>
        <div style={{ ...AN, fontSize: fit(str(sd.label), iw, S * 0.17), lineHeight: 1.1, color: first ? col("pop") : "#fff" }}>{str(sd.label)}</div>
        {sd.sub ? <div style={{ fontFamily: UI, textWrap: "balance", fontWeight: 800, fontSize: Math.round(SIZE.min * 1.15), lineHeight: 1.3, opacity: 0.85, marginBottom: S * 0.012 }}>{sd.sub}</div> : null}
        {arr<string>(sd.items).map((x, k) => (
          <div key={k} style={{ display: "flex", gap: "0.55em", alignItems: "baseline", fontFamily: UI, textWrap: "balance", fontWeight: 700, fontSize: Math.round(SIZE.sub * 0.94), lineHeight: 1.3, marginTop: S * 0.014, maxWidth: iw, opacity: prog(f, bt(i0 + k * ev), 8) }}>
            <span style={{ flex: "none", width: "0.5em", height: "0.5em", background: first ? col("pop") : "#fff" }} />
            <span>{x}</span>
          </div>
        ))}
      </div>
    );
  };
  const d = S * 0.2;
  const aV = bt(num(props.atVs, 2));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {panel(L, true, bt(num(props.at, 0)))}
      {panel(R, false, bt(num(props.atRight, 1)))}
      <div style={{ position: "absolute", left: (VERTICAL ? SAFE.left + SW / 2 : mid) - d / 2, top: (VERTICAL ? mid : H / 2) - d / 2, width: d, height: d, borderRadius: "50%", background: col("pop"), color: DARK, border: `${BW * 1.5}px solid ${DARK}`, display: "flex", alignItems: "center", justifyContent: "center", ...AN, fontSize: fit(str(props.vs, "VS"), d * 0.7, d * 0.5), lineHeight: 1, rotate: "-8deg", scale: f >= aV ? pop(aV, 10) : 0 }}>{str(props.vs, "VS")}</div>
    </AbsoluteFill>
  );
};

/* PosterTimeline — đường kẻ chạy dọc, mỗi mốc bật ra đúng phách. props: kicker, title, events[{when, text}], start, every, focus */
const PosterTimeline: React.FC<P> = ({ props }) => {
  const T = useT();
  const col = useCol();
  const f = useCurrentFrame();
  const bt = useBeats();
  const pop = usePop();
  const ev = arr<{ when: string; text?: string }>(props.events);
  const start = num(props.start, 1);
  const every = num(props.every, 2);
  const focus = num(props.focus, -1);
  const title = str(props.title);
  const tfs = fit(title, SW, S * 0.14);
  const n = Math.max(1, ev.length);
  const head = (title ? tfs * 1.3 + S * 0.04 : 0) + (props.kicker ? SIZE.min * 2.4 + S * 0.03 : 0);
  const rh = Math.min(S * 0.3, (SH - head) / n);
  const nd = Math.round(S * 0.052);
  const lineP = interpolate(f, [bt(start), bt(start + (n - 1) * every) + 8], [0, 1], { ...clamp, easing: easeInOut });
  return (
    <AbsoluteFill style={{ ...SAFE_PAD, justifyContent: "center" }}>
      {props.kicker ? <Chip text={str(props.kicker)} at={bt(0)} bg={col("accent")} c="#fff" style={{ marginBottom: S * 0.03 }} /> : null}
      {title ? <Rise at={bt(0)} style={{ ...AN, fontSize: tfs, color: T.ink, marginBottom: S * 0.04 }}>{title}</Rise> : null}
      <div style={{ position: "relative", height: rh * n }}>
        <div style={{ position: "absolute", left: nd / 2 - BW, top: rh / 2, width: BW * 2, height: rh * (n - 1) * lineP, background: T.ink }} />
        {ev.map((e, i) => {
          const at = bt(start + i * every);
          const s = f >= at ? pop(at, 12) : 0;
          const on = i === focus;
          return (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: rh * i, height: rh, display: "flex", alignItems: "center", gap: S * 0.04, opacity: f >= at ? 1 : 0 }}>
              <div style={{ flex: "none", width: nd, height: nd, background: on ? col("accent") : T.ink, rotate: "45deg", scale: s }} />
              <div style={{ translate: `${((1 - Math.min(1, s)) * 46).toFixed(1)}px 0`, minWidth: 0 }}>
                <div style={{ ...AN, fontSize: fit(e.when, SW - nd - S * 0.05, rh * 0.44), lineHeight: 1.1, color: on ? col("accent") : T.ink }}>{e.when}</div>
                {e.text ? <div style={{ fontFamily: UI, textWrap: "balance", fontWeight: 700, fontSize: Math.round(SIZE.sub * 0.94), lineHeight: 1.3, color: T.inkSoft }}>{e.text}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* PosterVerdict — câu trả lời: màu tràn ra từ tâm, một từ nện xuống, lý do quét ra từng dòng.
   props: question, word ("TRÁI LUẬT", "ĐƯỢC"), tone:"bad"|"good", at, reasons[{text, at}], cite, citeAt. Nhớ ghi `at` vào props.hits. */
const PosterVerdict: React.FC<P> = ({ props }) => {
  const T = useT();
  const col = useCol();
  const f = useCurrentFrame();
  const bt = useBeats();
  const at = bt(num(props.at, 1));
  const word = str(props.word);
  const bg = col(props.tone === "good" ? "accent2" : "accent");
  const reasons = arr<{ text: string; at: number }>(props.reasons);
  const r = interpolate(f, [at - 2, at + 13], [0, Math.hypot(W, H)], { ...clamp, easing: Easing.out(Easing.cubic) });
  const sl = prog(f, at, 10, Easing.out(Easing.exp));
  const rfs = Math.round(SIZE.sub * 0.94);
  const extra = (props.question ? uiLines(str(props.question), SIZE.sub * 1.08, SW) * SIZE.sub * 1.4 + S * 0.05 : 0) + S * 0.055 + reasons.reduce((a, x) => a + uiLines(x.text, rfs, SW * 0.94) * rfs * 1.3 + rfs * 0.84 + S * 0.018, 0) + (props.cite ? SIZE.min * 1.5 + S * 0.035 : 0);
  const fs = fit(word, SW, Math.min(VERTICAL ? W * 0.5 : H * 0.5, (SH - extra) / 1.16));
  const cy = VERTICAL ? SAFE.top + SH * 0.36 : H * 0.42;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: bg, clipPath: `circle(${r.toFixed(0)}px at ${W / 2}px ${cy}px)` }} />
      <AbsoluteFill style={{ ...SAFE_PAD, justifyContent: "center" }}>
        {props.question ? <div style={{ fontFamily: UI, textWrap: "balance", fontWeight: 800, fontSize: Math.round(SIZE.sub * 1.08), lineHeight: 1.3, color: f >= at ? "#fff" : T.ink, marginBottom: S * 0.05, maxWidth: SW }}>{str(props.question)}</div> : null}
        <div style={{ ...AN, fontSize: fs, lineHeight: 1.1, color: "#fff", opacity: f >= at ? 1 : 0, scale: interpolate(sl, [0, 1], [2.3, 1]), rotate: `${(-2 * sl).toFixed(2)}deg`, transformOrigin: "left center" }}>{word}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: S * 0.018, marginTop: S * 0.055 }}>
          {reasons.map((x, i) => <div key={i} style={{ alignSelf: "flex-start", maxWidth: SW, background: DARK, color: "#fff", fontFamily: UI, textWrap: "balance", fontWeight: 700, fontSize: rfs, lineHeight: 1.3, padding: "0.42em 0.72em", clipPath: wipe(prog(f, bt(x.at), 12, easeInOut)) }}>{x.text}</div>)}
        </div>
        {props.cite ? <div style={{ fontFamily: UI, textWrap: "balance", fontWeight: 700, fontSize: Math.round(SIZE.min * 1.08), lineHeight: 1.35, color: "#fff", marginTop: S * 0.035, opacity: prog(f, bt(num(props.citeAt, 6)), 10) }}>{str(props.cite)}</div> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* PosterEnd — thẻ kết: câu nhớ lấp khung + lời kêu gọi + căn cứ. props: lines[] (dòng đặt trong [ngoặc vuông] = màu bật),
   at, every, cta, ctaAt, sources[], sourcesLabel, sourcesAt, glyph. Video pháp luật: sources ghi số hiệu, điều khoản, hiệu lực. */
const PosterEnd: React.FC<P> = ({ props }) => {
  const T = useT();
  const col = useCol();
  const f = useCurrentFrame();
  const bt = useBeats();
  const lines = arr<string>(props.lines);
  const src = arr<string>(props.sources);
  const extra = (props.cta ? SIZE.sub * 2.5 + S * 0.05 : 0) + (src.length ? S * 0.075 + SIZE.min * 1.4 + src.reduce((a, x) => a + uiLines(x, SIZE.min, SW) * SIZE.min * 1.42, 0) : 0);
  const max = Math.min(VERTICAL ? W * 0.24 : H * 0.24, (SH - extra) / (Math.max(1, lines.length) * 1.24));
  const a0 = num(props.at, 0);
  const ev = num(props.every, 1);
  return (
    <AbsoluteFill>
      <Back glyph={str(props.glyph) || undefined} />
      <AbsoluteFill style={{ ...SAFE_PAD, justifyContent: "center" }}>
        {lines.map((t, i) => {
          const txt = t.replace(/^\[|\]$/g, "");
          return <Rise key={i} at={bt(a0 + i * ev)} style={{ ...AN, fontSize: fit(txt, SW, max), color: txt !== t ? col("pop") : T.ink }}>{txt}</Rise>;
        })}
        {props.cta ? <div style={{ alignSelf: "flex-start", marginTop: S * 0.05, background: col("accent"), color: "#fff", fontFamily: UI, textWrap: "balance", fontWeight: 800, fontSize: Math.round(SIZE.sub * 1.05), lineHeight: 1.3, padding: "0.5em 0.9em", clipPath: wipe(prog(f, bt(num(props.ctaAt, a0 + lines.length * ev)), 12, easeInOut)) }}>{str(props.cta)}</div> : null}
        {src.length ? (
          <div style={{ marginTop: S * 0.05, borderTop: `${BW}px solid ${T.ink}`, paddingTop: S * 0.022, opacity: prog(f, bt(num(props.sourcesAt, a0 + lines.length * ev + 1)), 12) }}>
            <div style={{ fontFamily: UI, textWrap: "balance", fontWeight: 800, fontSize: SIZE.min, lineHeight: 1.4, color: col("pop") }}>{str(props.sourcesLabel, "Căn cứ")}</div>
            {src.map((x, i) => <div key={i} style={{ fontFamily: UI, textWrap: "balance", fontWeight: 600, fontSize: SIZE.min, lineHeight: 1.42, color: T.ink }}>{x}</div>)}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const POSTER_VIEWS = { PosterHook, PosterLaw, PosterSteps, PosterNumber, PosterVersus, PosterTimeline, PosterVerdict, PosterEnd };
