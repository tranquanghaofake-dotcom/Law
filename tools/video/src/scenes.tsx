import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import stats from "./stats.json";
import { b, C, DISPLAY, UI } from "./theme";
import { Chip, clamp, ease, fadeIn, GlitchText, H1, Kicker, MemoIcon, Phone, rise, SAFE, Seal, usePop } from "./parts";
import { Embers, MovingBg, Rays, Shockwave, Slam } from "./fx";

const cap = (f: string) => staticFile(`cap/${f}`);
const count = (frame: number, at: number, to: number, len = b(2)) => Math.round(interpolate(frame, [at, at + len], [0, to], { ...clamp, easing: ease }));

/* 1 — Hook: chữ nện theo phách (bài đã đủ trống từ đầu) */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const quen = b(5);
  return (
    <AbsoluteFill style={{ ...SAFE, justifyContent: "center" }}>
      <MovingBg a="#16244a" b2={C.inkDeep} glow="rgba(255,77,61,.18)" />
      <Slam text="Học luật" at={0} step={b(1)} style={{ ...H1, fontSize: 160, color: C.paper }} />
      <Slam text="đọc ba lần…" at={b(2)} step={b(0.5)} style={{ ...H1, fontSize: 150, color: C.paper }} />
      <Slam text="vẫn" at={b(4)} style={{ ...H1, fontSize: 150, color: C.paper }} />
      <GlitchText seed={7} amount={frame >= quen ? interpolate(frame, [quen, quen + 14], [1.4, 0.15], clamp) + interpolate(frame, [b(7), b(8)], [0, 1.4], clamp) : 0}
        style={{ ...H1, fontSize: 250, color: "#ff3b30", opacity: frame >= quen ? 1 : 0, scale: interpolate(frame, [quen, quen + 10], [2.2, 1], { ...clamp, easing: Easing.out(Easing.exp) }), transformOrigin: "left center", textShadow: "0 0 60px rgba(255,59,48,.6)" }}>
        QUÊN?
      </GlitchText>
      <Shockwave at={quen} x={300} y={1100} color="#ff3b30" />
      <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 46, color: "rgba(247,244,238,.75)", marginTop: 40, opacity: fadeIn(frame, b(6)), translate: rise(frame, b(6), 30) }}>
        Vấn đề không phải ở bạn — mà ở cách ôn.
      </div>
    </AbsoluteFill>
  );
};

/* 2 — Drop: Khuê Văn Các + con dấu đóng xuống */
export const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const s = pop(0, 11);
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <MovingBg a="#fbf6ea" b2="#efe2c6" glow="rgba(242,193,78,.55)" />
      <Rays x={540} y={1250} size={2600} color="rgba(217,122,30,.16)" speed={0.35} />
      <Img src={cap("art-khue-van-cac.png")} style={{ position: "absolute", width: 1500, left: -210, top: 880, scale: interpolate(frame, [0, b(8)], [1.18, 1.03], { ...clamp, easing: ease }), translate: `0px ${interpolate(frame, [0, b(8)], [90, 0], clamp)}px`, filter: "drop-shadow(0 30px 40px rgba(75,46,24,.25))" }} />
      <div style={{ marginTop: 250, scale: interpolate(s, [0, 1], [3.4, 1]), rotate: `${interpolate(s, [0, 1], [-22, -6])}deg`, opacity: Math.min(1, s * 3), filter: "drop-shadow(0 20px 30px rgba(179,38,30,.45))" }}>
        <Seal size={270} />
      </div>
      <Shockwave at={4} x={540} y={385} color={C.seal} />
      <Slam text="Luyện Luật" at={b(1)} step={b(0.5)} style={{ ...H1, fontSize: 170, color: C.ink, marginTop: 50, justifyContent: "center" }} />
      <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 54, color: C.muted, marginTop: 16, opacity: fadeIn(frame, b(2.5)), translate: rise(frame, b(2.5), 30) }}>
        Học khái niệm luật kiểu <span style={{ color: C.accent }}>nhớ lâu</span>
      </div>
      <Embers n={26} color={C.accent} speed={1.1} size={6} />
    </AbsoluteFill>
  );
};

/* 3 — Thư viện: vòng bìa sách 3D + con số */
export const ThuVien: React.FC = () => {
  const frame = useCurrentFrame();
  const list = stats.subjectList;
  const rot = interpolate(frame, [0, b(16)], [60, -200]);
  const R = 560;
  const nums: [number, string, number][] = [
    [stats.subjects, "môn", 0],
    [stats.concepts, "khái niệm", b(1)],
    [stats.chapters, "chương", b(2)],
    [stats.laws, "văn bản luật gốc", b(3)],
  ];
  return (
    <AbsoluteFill style={{ ...SAFE }}>
      <MovingBg a={C.ink} b2={C.inkDeep} glow="rgba(242,193,78,.2)" />
      <Rays x={540} y={1400} size={2000} speed={-0.2} />
      <Embers n={30} />
      <Kicker color={C.gold}>Thư viện giáo trình điện tử</Kicker>
      <div style={{ marginTop: 18 }}>
        {nums.map(([n, label, at]) => (
          <div key={label} style={{ ...H1, fontSize: label.length > 12 ? 64 : 96, color: C.paper, opacity: fadeIn(frame, at, 8), translate: rise(frame, at, 40), marginBottom: 6 }}>
            <span style={{ color: C.gold }}>{count(frame, at, n)}</span> {label}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1050, height: 760, perspective: 1800 }}>
        <div style={{ position: "absolute", left: 540, top: 120, transformStyle: "preserve-3d", transform: `translateZ(-260px) rotateY(${rot}deg)` }}>
          {list.map((s, i) => {
            const a = (i / list.length) * 360;
            return (
              <Img key={s.id} src={cap(`cover-${s.id}.png`)}
                style={{ position: "absolute", width: 290, left: -145, top: 0, transform: `rotateY(${a}deg) translateZ(${R}px)`, backfaceVisibility: "hidden", filter: "drop-shadow(0 20px 30px rgba(0,0,0,.5))", opacity: fadeIn(frame, b(0.5) + i * 2, 10) }} />
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 4 — Hiểu nhanh: thẻ Đặt cọc dựng từ dữ liệu thật (memo của khái niệm) */
export const HieuNhanh: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const f = stats.featured;
  const gist = f.memo.gist ?? "";
  const typed = gist.slice(0, Math.floor(interpolate(frame, [b(1), b(4)], [0, gist.length], clamp)));
  const tree = f.memo.tree ?? [];
  const caseQ = f.memo.case;
  return (
    <AbsoluteFill style={{ background: C.paper, ...SAFE, paddingTop: 190 }}>
      {/* lưới icon chìm làm nền */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexWrap: "wrap", gap: 46, padding: 30, opacity: 0.07, color: C.ink }}>
        {ICONS.map((n, i) => (
          <div key={n} style={{ translate: `0px ${Math.sin(frame / 40 + i) * 6}px` }}><MemoIcon name={n} size={74} draw={interpolate(frame, [i * 0.6, i * 0.6 + 30], [0, 1], clamp)} /></div>
        ))}
      </div>
      <Kicker color={C.seal}>Hiểu nhanh · {stats.concepts}/{stats.concepts} khái niệm</Kicker>
      <div style={{ ...H1, fontSize: 150, color: C.ink, marginTop: 8, scale: interpolate(pop(0), [0, 1], [1.3, 1]), transformOrigin: "left center" }}>{f.term}</div>
      <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 44, lineHeight: 1.4, color: C.ink, marginTop: 18, minHeight: 190 }}>
        {typed}
        <span style={{ opacity: frame < b(4.5) && Math.floor(frame / 15) % 2 === 0 ? 1 : 0, color: C.accent }}>▍</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 20 }}>
        {tree.map((n, i) => {
          const at = b(4 + i);
          const p = pop(at);
          return (
            <div key={n.label} style={{ background: C.card, border: `3px solid ${i >= 2 ? (i === 2 ? C.seal : C.ok) : C.line}`, borderRadius: 26, padding: "22px 24px", scale: p, opacity: frame >= at ? 1 : 0, boxShadow: "0 16px 40px rgba(20,33,61,.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, color: i === 2 ? C.seal : i === 3 ? C.ok : C.accent }}>
                <MemoIcon name={n.icon ?? "idea"} size={58} width={2} draw={interpolate(frame, [at, at + 24], [0, 1], clamp)} />
                <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 34, color: C.ink }}>{n.label}</div>
              </div>
              {(n.children ?? []).map((c) => (
                <div key={c} style={{ fontFamily: UI, fontWeight: 600, fontSize: 30, color: C.muted, marginTop: 8 }}>· {c}</div>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 30, fontFamily: UI, fontWeight: 800, fontSize: 40, color: C.ink, opacity: fadeIn(frame, b(8.5)), position: "relative", alignSelf: "flex-start" }}>
        <span style={{ position: "absolute", left: -10, right: -10, top: 18, height: 34, background: C.gold, opacity: 0.7, transformOrigin: "left", scale: `${interpolate(frame, [b(9), b(10)], [0, 1], { ...clamp, easing: ease })} 1`, zIndex: 0 }} />
        <span style={{ position: "relative" }}>💡 Mẹo nhớ: {f.memo.hook}</span>
      </div>
      {caseQ && (
        <div style={{ position: "absolute", left: 90, right: 150, top: 1360, background: C.ink, color: C.paper, borderRadius: 30, padding: "30px 34px", scale: pop(b(11)), opacity: frame >= b(11) ? 1 : 0 }}>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, lineHeight: 1.35 }}>❓ {caseQ.q}</div>
          <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 40, color: C.gold, marginTop: 14, opacity: fadeIn(frame, b(13)), scale: interpolate(frame, [b(13), b(13) + 10], [1.3, 1], clamp), transformOrigin: "left center" }}>→ {caseQ.a}</div>
          <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 28, color: "rgba(247,244,238,.6)", marginTop: 12, opacity: fadeIn(frame, b(14)) }}>Căn cứ: {f.cite}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
const ICONS = ["scales", "scroll", "book", "stamp", "vote", "handshake", "home", "money", "bank", "key", "shield", "target", "compare", "idea", "people", "calendar", "clock", "pen", "doc", "check", "ban", "warn", "search", "link", "puzzle", "chart", "company", "globe", "flag", "plant", "crown", "star", "door", "stairs", "family", "map"];

/* 5 — 6 bậc ghi nhớ */
const STEPS: [string, string, string][] = [
  ["Gặp", "eye", "Thẻ khái niệm: sơ đồ + mẹo nhớ"],
  ["Nhận biết", "search", "Trắc nghiệm, Đúng/Sai"],
  ["Phân biệt", "compare", "Cặp dễ nhầm"],
  ["Điền", "pen", "Điền chỗ trống điều luật"],
  ["Tình huống", "puzzle", "Áp vào chuyện thật"],
  ["Tự trả lời", "idea", "Tự nhớ lại, không gợi ý"],
];
export const Bac: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.paper}, #efe8da)`, ...SAFE }}>
      <Kicker color={C.seal}>Mỗi khái niệm đi qua</Kicker>
      <div style={{ ...H1, fontSize: 124, color: C.ink, marginTop: 8 }}>6 bậc <span style={{ color: C.accent }}>ghi nhớ</span></div>
      <div style={{ marginTop: 34 }}>
        {STEPS.map(([name, icon, sub], i) => {
          const at = b(1 + i * 2);
          const on = frame >= at;
          const p = pop(at);
          return (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 24, padding: "18px 24px", marginBottom: 16, borderRadius: 26, background: on ? (i === 5 ? C.ok : C.card) : "transparent", boxShadow: on ? "0 12px 30px rgba(20,33,61,.12)" : "none", opacity: on ? 1 : 0.12, translate: `${interpolate(p, [0, 1], [160, 0])}px 0px`, marginLeft: i * 18 }}>
              <div style={{ width: 84, height: 84, borderRadius: 22, background: i === 5 ? "rgba(255,255,255,.18)" : C.ink, color: i === 5 ? "#fff" : C.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MemoIcon name={icon} size={54} width={2} draw={interpolate(frame, [at, at + 20], [0, 1], clamp)} />
              </div>
              <div>
                <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 44, color: i === 5 ? "#fff" : C.ink }}><span style={{ color: i === 5 ? C.gold50 : C.accent }}>{i + 1}.</span> {name}</div>
                <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 30, color: i === 5 ? "rgba(255,255,255,.8)" : C.muted }}>{sub}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, color: C.seal, marginTop: 10, opacity: fadeIn(frame, b(13)) }}>
        Bậc 4 trở lên phải qua giãn cách — không học dồn một tối được.
      </div>
    </AbsoluteFill>
  );
};

/* 6 — Trả lời thật trên web: dấu ĐÚNG, căn cứ, giọng đọc */
export const DapAn: React.FC = () => {
  const pop = usePop();
  return (
    <AbsoluteFill style={{ ...SAFE }}>
      <MovingBg a={C.ink} b2="#08101f" glow="rgba(95,211,154,.22)" />
      <Rays x={510} y={1050} size={2000} color="rgba(95,211,154,.14)" />
      <Kicker color={C.gold}>Trả lời đúng là biết ngay vì sao</Kicker>
      <div style={{ ...H1, fontSize: 104, color: C.paper, marginTop: 8 }}>Đóng mộc <span style={{ color: "#5fd39a" }}>ĐÚNG</span></div>
      <Phone width={560} style={{ position: "absolute", left: 230, top: 520, rotate: `${interpolate(pop(0), [0, 1], [8, -2])}deg`, translate: `0px ${interpolate(pop(0), [0, 1], [900, 0])}px` }}>
        <Img src={cap("quiz-dung-0.png")} style={{ width: "100%", position: "absolute", inset: 0 }} />
        <Sequence from={b(2) - 36} layout="none">
          <OffthreadVideo src={cap("quiz-dung.mp4")} muted style={{ width: "100%", position: "absolute", inset: 0 }} />
        </Sequence>
      </Phone>
      <Shockwave at={b(2)} x={520} y={900} color="#5fd39a" />
      <Chip at={b(3)} bg={C.seal} fg="#fff" style={{ position: "absolute", left: 60, top: 1080, rotate: "-6deg" }}>🔨 Tiếng đóng mộc</Chip>
      <Chip at={b(5)} bg={C.gold} fg={C.ink} style={{ position: "absolute", left: 520, top: 1250, rotate: "4deg" }}>§ Căn cứ điều luật</Chip>
      <Chip at={b(7)} bg={C.paper} fg={C.ink} style={{ position: "absolute", left: 80, top: 1400, rotate: "-3deg" }}>🔊 Đọc đề tự động</Chip>
      <Chip at={b(9)} bg={C.ok} fg="#fff" style={{ position: "absolute", left: 480, top: 1530, rotate: "5deg" }}>📜 Xem nguyên văn luật</Chip>
    </AbsoluteFill>
  );
};

/* 7 — FSRS */
export const Fsrs: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 860, Hh = 520;
  const reviews = [0, 0.16, 0.38, 0.7];
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const x = i / 240;
    let last = 0, k = 0;
    reviews.forEach((r, j) => { if (x >= r) { last = r; k = j; } });
    const y = Math.exp(-(x - last) / (0.05 * Math.pow(2.6, k)));
    pts.push(`${(x * W).toFixed(1)},${((1 - y * 0.92) * Hh).toFixed(1)}`);
  }
  const draw = interpolate(frame, [b(0.5), b(7)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ ...SAFE }}>
      <MovingBg a="#0e1730" b2="#04070f" glow="rgba(255,107,74,.18)" />
      <Embers n={22} color="#ff8a5c" speed={0.8} size={5} />
      <Kicker color={C.gold}>Lịch ôn FSRS</Kicker>
      <div style={{ ...H1, fontSize: 120, color: C.paper, marginTop: 8 }}>Ôn đúng lúc<br /><span style={{ color: "#ff6b4a" }}>sắp quên</span></div>
      <svg width={W + 40} height={Hh + 140} style={{ position: "absolute", left: 90, top: 820, overflow: "visible" }}>
        <line x1={0} y1={Hh} x2={W} y2={Hh} stroke="rgba(247,244,238,.25)" strokeWidth={4} />
        <line x1={0} y1={0} x2={0} y2={Hh} stroke="rgba(247,244,238,.25)" strokeWidth={4} />
        <polyline points={pts.join(" ")} fill="none" stroke={C.gold} strokeWidth={10} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} style={{ filter: `drop-shadow(0 0 12px ${C.gold})` }} />
        {reviews.slice(1).map((r, i) => (
          <g key={r} opacity={draw >= r ? 1 : 0}>
            <circle cx={r * W} cy={Hh * 0.08} r={20} fill={C.accent} />
            <text x={r * W} y={-22} fill={C.paper} fontFamily={UI} fontWeight={800} fontSize={34} textAnchor="middle">ôn {i + 1}</text>
          </g>
        ))}
        <text x={0} y={Hh + 64} fill="rgba(247,244,238,.7)" fontFamily={UI} fontWeight={700} fontSize={34}>Mỗi lần ôn, trí nhớ giữ lâu hơn.</text>
        <text x={0} y={Hh + 114} fill="rgba(247,244,238,.7)" fontFamily={UI} fontWeight={700} fontSize={34}>Ôn hôm nay ưu tiên khái niệm sắp quên.</text>
      </svg>
    </AbsoluteFill>
  );
};

/* 8 — Tiện ích: tìm không dấu */
export const TienIch: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  return (
    <AbsoluteFill style={{ ...SAFE }}>
      <MovingBg a="#fbf6ea" b2="#ece3d0" glow="rgba(31,122,77,.18)" />
      <Kicker color={C.ok}>Gõ không dấu vẫn ra</Kicker>
      <div style={{ ...H1, fontSize: 104, color: C.ink, marginTop: 8 }}>“dat coc” → <span style={{ color: C.accent }}>Đặt cọc</span></div>
      <Phone width={520} style={{ position: "absolute", left: 90, top: 560, rotate: "-3deg", scale: interpolate(pop(0), [0, 1], [0.7, 1]) }}>
        <OffthreadVideo src={cap("search.mp4")} muted style={{ width: "100%" }} />
      </Phone>
      <div style={{ position: "absolute", left: 640, top: 700, display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-start" }}>
        <Chip at={b(2)} bg={C.ink} fg={C.gold}>★ Đánh dấu</Chip>
        <Chip at={b(3)} bg={C.ink} fg={C.paper}>📴 Học offline</Chip>
        <Chip at={b(4)} bg={C.ink} fg={C.paper}>📲 Cài như app</Chip>
        <Chip at={b(5)} bg={C.ink} fg={C.paper}>💾 Xuất / nhập</Chip>
      </div>
      <div style={{ position: "absolute", left: 640, top: 1180, width: 300, fontFamily: UI, fontWeight: 600, fontSize: 30, color: C.muted, opacity: fadeIn(frame, b(6)) }}>
        Tiến độ lưu ngay trong trình duyệt của bạn.
      </div>
    </AbsoluteFill>
  );
};

/* 9 — Thắp chuỗi: quay thật màn thắp của web; số chuỗi đổi đúng phách 8 (cú nện) */
const ARRIVE = 232; // IGNITE_TIMING.arrive = 3865 ms ở 60 fps
export const ThapChuoi: React.FC = () => {
  const frame = useCurrentFrame();
  const start = b(8) - ARRIVE;
  const zoom = interpolate(frame, [b(8) - 10, b(8), b(8) + 40], [1, 1.16, 1.06], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ scale: zoom, transformOrigin: "50% 44%" }}>
        <Img src={cap("ignite-75-0.png")} style={{ width: 1080, height: 1920, position: "absolute" }} />
        <Sequence from={start} layout="none">
          <OffthreadVideo src={cap("ignite-75.mp4")} muted style={{ width: 1080, height: 1920, position: "absolute" }} />
        </Sequence>
      </AbsoluteFill>
      {/* 0,7 s đầu bản quay: lớp tối của web đang mờ dần vào trên nền giấy → che bằng đen để khỏi bạc màu */}
      <AbsoluteFill style={{ background: "#05050a", opacity: interpolate(frame, [0, start + 42, start + 70], [0.9, 0.75, 0], clamp) }} />
      <Shockwave at={b(8)} x={540} y={836} color="#c48bff" len={34} />
      {frame >= b(8) && <Embers n={50} color="#c48bff" speed={2.2} size={8} />}
      <AbsoluteFill style={{ ...SAFE, paddingTop: 230, pointerEvents: "none" }}>
        <Kicker color={C.gold}>Thẻ chuyên cần</Kicker>
        <div style={{ opacity: interpolate(frame, [b(6), b(7.5)], [1, 0], clamp) }}>
          <Slam text="Học mỗi ngày," at={b(0)} step={b(1)} style={{ ...H1, fontSize: 96, color: C.paper, textShadow: "0 6px 30px rgba(0,0,0,.7)" }} />
          <Slam text="thắp một ký hoạ" at={b(2)} step={b(1)} style={{ ...H1, fontSize: 96, color: "#d8b4ff", textShadow: "0 0 30px rgba(196,139,255,.7)" }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 10 — Bốn màu chu kỳ thẻ */
const CYCLES: [number, string, string][] = [
  [25, "Đỏ", "#ff6a3d"],
  [50, "Xanh lam", "#4aa3ff"],
  [75, "Tím", "#b77bff"],
  [100, "Trắng – đen giao thoa", "#f2f2f2"],
];
export const ChuKy: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(3, Math.floor(frame / b(2)));
  const local = frame - idx * b(2);
  const flip = interpolate(local, [0, 14], [90, 0], { ...clamp, easing: ease });
  const [n, name, color] = CYCLES[idx];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${color}33, #050507 70%)`, ...SAFE, alignItems: "center" }}>
      <Rays x={540} y={900} size={2200} color={`${color}22`} speed={0.4} />
      <Embers n={34} color={color} speed={1.2} size={6} />
      <Shockwave at={idx * b(2)} x={540} y={900} color={color} />
      <Kicker color={C.gold}>30 ngày một chu kỳ · 27 ký hoạ pháp luật</Kicker>
      <div style={{ ...H1, fontSize: 112, color, marginTop: 20, textShadow: `0 0 40px ${color}` }}>{name}</div>
      <div style={{ perspective: 1800, marginTop: 120 }}>
        <div style={{ position: "relative", width: 860, transform: `rotateY(${flip + Math.sin(frame / 25) * 6}deg) rotateX(${Math.sin(frame / 20) * 4}deg)`, filter: `drop-shadow(0 30px 60px rgba(0,0,0,.8)) drop-shadow(0 0 50px ${color}66)` }}>
          <Img src={cap(`card-${n}.png`)} style={{ width: 860, display: "block" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 40, overflow: "hidden", mixBlendMode: "screen" }}>
            <div style={{ position: "absolute", top: -200, bottom: -200, width: 220, left: interpolate(local, [6, 40], [-300, 1100], clamp), rotate: "20deg", background: "linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent)" }} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: 90 }}>
        {CYCLES.map(([, nm, cl], i) => (
          <div key={nm} style={{ width: 44, height: 44, borderRadius: 99, background: i <= idx ? cl : "transparent", border: `4px solid ${cl}`, boxShadow: i === idx ? `0 0 24px ${cl}` : "none" }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* 11 — Tủ sách theo chương */
export const TuSach: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  return (
    <AbsoluteFill style={{ ...SAFE }}>
      <MovingBg a="#2b1a0e" b2="#0c0703" glow="rgba(242,193,78,.25)" />
      <Embers n={26} />
      <Kicker color={C.gold}>Tủ sách theo chương</Kicker>
      <div style={{ ...H1, fontSize: 96, color: C.gold50, marginTop: 8 }}>Học xong chương,<br />nhận một cuốn sách</div>
      <div style={{ display: "flex", gap: 30, marginTop: 50 }}>
        {[
          ["Cấp 1", "mọi khái niệm ≥ bậc 3", "bìa mềm"],
          ["Cấp 2", "mọi khái niệm ≥ bậc 5", "bìa cứng, đai vàng"],
          ["Cấp 3", "mọi khái niệm bậc 6", "bìa da mạ vàng"],
        ].map(([lv, cond, look], i) => (
          <div key={lv} style={{ flex: 1, padding: "22px 20px", borderRadius: 22, border: `3px solid ${i === 2 ? C.gold : "rgba(242,193,78,.4)"}`, background: i === 2 ? "rgba(242,193,78,.12)" : "transparent", scale: pop(b(1 + i)), opacity: frame >= b(1 + i) ? 1 : 0 }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 44, color: C.gold }}>{lv}</div>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 26, color: C.gold50, marginTop: 6 }}>{cond}</div>
            <div style={{ fontFamily: UI, fontWeight: 500, fontSize: 24, color: "rgba(255,246,210,.6)", marginTop: 4 }}>{look}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1010, height: 720, overflow: "hidden", borderRadius: 30, boxShadow: "0 30px 80px rgba(0,0,0,.6)", opacity: fadeIn(frame, b(3)) }}>
        <Img src={cap("bookcase.png")} style={{ width: "100%", translate: `0px ${interpolate(frame, [b(3), b(8)], [0, -60], clamp)}px` }} />
      </div>
    </AbsoluteFill>
  );
};

/* 12 — Sự nghiệp: thăng chức theo bộ máy nhà nước */
const LADDER: [string, string][] = [
  ["cong-dan", "Công dân"],
  ["cong-chuc-xa", "Công chức cấp xã"],
  ["chu-tich-xa", "Chủ tịch UBND cấp xã"],
  ["giam-doc-so", "Giám đốc sở"],
  ["chu-tich-tinh", "Chủ tịch UBND cấp tỉnh"],
  ["bo-truong", "Bộ trưởng"],
  ["thu-tuong", "Thủ tướng Chính phủ"],
];
const OTHERS: [string, string, string][] = [
  ["chu-tich-qh", "Lập pháp", "Chủ tịch Quốc hội"],
  ["chanh-an-tc", "Xét xử", "Chánh án TAND tối cao"],
  ["vien-truong-tc", "Kiểm sát", "Viện trưởng VKSND tối cao"],
];
export const SuNghiep: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const step = Math.min(LADDER.length - 1, Math.floor(frame / b(1)));
  const local = frame - step * b(1);
  const fan = frame >= b(8) && frame < b(12);
  const celebrate = frame >= b(12);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, #3a2a12, #0e0905 75%)`, ...SAFE }}>
      <Rays x={540} y={1000} size={2400} speed={celebrate ? 0.6 : 0.25} opacity={celebrate ? 1 : 0.6} />
      <Embers n={celebrate ? 60 : 28} speed={celebrate ? 2 : 1} />
      <Kicker color={C.gold}>Sự nghiệp · 4 nhánh bộ máy nhà nước</Kicker>
      <div style={{ ...H1, fontSize: 96, color: C.gold50, marginTop: 8 }}>
        {celebrate ? <>…lên tới <span style={{ color: C.gold }}>Chủ tịch nước</span></> : fan ? "Hay Lập pháp, Xét xử, Kiểm sát" : "Đủ sách thì thăng chức"}
      </div>
      {!fan && !celebrate && (
        <>
          <Img src={cap(`post-${LADDER[step][0]}.png`)} style={{ position: "absolute", left: 250, top: 560, width: 580, scale: interpolate(local, [0, 10], [1.08, 1], { ...clamp, easing: ease }), filter: `brightness(${interpolate(local, [0, 8], [1.8, 1], clamp)}) drop-shadow(0 30px 60px rgba(0,0,0,.7))` }} />
          <div style={{ position: "absolute", left: 90, right: 150, top: 1420, textAlign: "center", fontFamily: UI, fontWeight: 800, fontSize: 50, color: C.gold }}>{LADDER[step][1]}</div>
          <div style={{ position: "absolute", left: 90, right: 150, top: 1490, display: "flex", justifyContent: "center", gap: 10 }}>
            {LADDER.map((l, i) => <div key={l[0]} style={{ width: 60, height: 8, borderRadius: 4, background: i <= step ? C.gold : "rgba(242,193,78,.25)" }} />)}
          </div>
        </>
      )}
      {fan && (
        <Img src={cap("orgchart.png")} style={{ position: "absolute", left: 40, width: 1000, top: interpolate(frame, [b(8), b(12)], [420, 160]), opacity: 0.12, borderRadius: 24 }} />
      )}
      {fan &&
        OTHERS.map(([id, branch, title], i) => {
          const p = pop(b(8 + i * 0.7));
          return (
            <div key={id} style={{ position: "absolute", top: 640 + Math.abs(i - 1) * 60, left: 40 + i * 300, width: 330, rotate: `${(i - 1) * 7}deg`, scale: p, opacity: frame >= b(8 + i * 0.7) ? 1 : 0, textAlign: "center" }}>
              <Img src={cap(`post-${id}.png`)} style={{ width: 330, filter: "drop-shadow(0 20px 40px rgba(0,0,0,.7))" }} />
              <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 34, color: C.gold, marginTop: 14 }}>{branch}</div>
              <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 26, color: C.gold50 }}>{title}</div>
            </div>
          );
        })}
      {celebrate && (
        <Sequence from={b(12)} layout="none">
          <OffthreadVideo src={cap("post-celebrate.webm")} transparent muted style={{ position: "absolute", left: 230, top: 520, width: 620 }} />
        </Sequence>
      )}
      <div style={{ position: "absolute", left: 90, right: 150, bottom: 330, textAlign: "center", fontFamily: UI, fontWeight: 500, fontSize: 26, color: "rgba(255,246,210,.55)" }}>
        Chức danh mô phỏng trong trò chơi học tập, không phải chức vụ thật.
      </div>
    </AbsoluteFill>
  );
};

/* 13 — Kêu gọi */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const s = pop(0, 11);
  const tags = ["Miễn phí", "Không cần tài khoản", "Học trên điện thoại"];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, #22325e, ${C.inkDeep} 75%)`, alignItems: "center", paddingTop: 280 }}>
      <Rays x={540} y={420} size={2000} speed={0.3} />
      <Embers n={40} />
      <div style={{ scale: interpolate(s, [0, 1], [2.6, 1]), rotate: `${interpolate(s, [0, 1], [14, -6])}deg` }}><Seal size={220} /></div>
      <div style={{ ...H1, fontSize: 150, color: C.paper, marginTop: 60 }}>Luyện Luật</div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, padding: "0 110px", marginTop: 40 }}>
        {tags.map((t, i) => (
          <div key={t} style={{ padding: "14px 28px", borderRadius: 999, border: `3px solid ${C.gold}`, color: C.gold, fontFamily: UI, fontWeight: 800, fontSize: 38, scale: pop(b(1 + i)) }}>{t}</div>
        ))}
      </div>
      <div style={{ marginTop: 80, padding: "30px 56px", borderRadius: 28, background: C.accent, color: "#1a1206", fontFamily: UI, fontWeight: 800, fontSize: 62, scale: pop(b(4)) * (1 + 0.04 * Math.sin(frame / 6)), boxShadow: "0 24px 60px rgba(217,122,30,.45)" }}>Link ở bio →</div>
      <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, color: "rgba(247,244,238,.75)", marginTop: 36, opacity: fadeIn(frame, b(5)) }}>tranquanghaofake-dotcom.github.io/Law</div>
      <div style={{ position: "absolute", bottom: 330, padding: "0 120px", textAlign: "center", fontFamily: UI, fontWeight: 500, fontSize: 30, lineHeight: 1.4, color: "rgba(247,244,238,.55)", opacity: fadeIn(frame, b(4)) }}>
        Thông tin pháp luật chung để học tập, không phải tư vấn pháp lý.
      </div>
    </AbsoluteFill>
  );
};
