import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import stats from "./stats.json";
import { BEAT, C, DISPLAY, rand, UI } from "./theme";
import { clamp, ease, GlitchText, Kicker, Phone, Seal } from "./parts";

const pop = (frame: number, at: number, fps: number) => spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 180 } });
const H1: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 };
const SAFE: React.CSSProperties = { paddingLeft: 90, paddingRight: 150, paddingTop: 200 };

/* 1 — Hook: "Học luật, đọc ba lần, vẫn quên?" (intro, chưa có trống) */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const lines: [string, number, string][] = [
    ["Học luật", 0, C.paper],
    ["đọc ba lần…", BEAT * 2, C.paper],
    ["vẫn quên?", BEAT * 4, "#ff4d3d"],
  ];
  const zoomOut = interpolate(frame, [84, 96], [1, 1.35], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #1d2b52, ${C.inkDeep} 70%)`, ...SAFE, justifyContent: "center", scale: zoomOut }}>
      {lines.map(([txt, at, color], i) => {
        const shown = frame >= at;
        const glitch = interpolate(frame, [at, at + 6], [1, 0], clamp) + (i === 2 ? interpolate(frame, [70, 96], [0, 1.2], clamp) : 0);
        return (
          <GlitchText
            key={txt}
            seed={i * 31}
            amount={shown ? glitch : 0}
            style={{
              ...H1,
              fontSize: i === 2 ? 190 : 150,
              color,
              opacity: shown ? 1 : 0,
              scale: interpolate(frame, [at, at + 8], [1.4, 1], { ...clamp, easing: ease }),
              transformOrigin: "left center",
              marginBottom: 10,
            }}
          >
            {txt}
          </GlitchText>
        );
      })}
      <div
        style={{
          fontFamily: UI,
          fontWeight: 500,
          fontSize: 44,
          color: "rgba(247,244,238,.6)",
          marginTop: 40,
          opacity: interpolate(frame, [60, 72], [0, 1], clamp),
        }}
      >
        Vấn đề không phải ở bạn — mà ở cách ôn.
      </div>
    </AbsoluteFill>
  );
};

/* 2 — Drop: con dấu đóng xuống + tên web */
export const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, 0, fps);
  const ticker = stats.sample.join("  ·  ");
  return (
    <AbsoluteFill style={{ background: C.paper, alignItems: "center", justifyContent: "center" }}>
      {/* dải hoa văn chạy nền */}
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          style={{
            position: "absolute",
            top: 260 + row * 560,
            whiteSpace: "nowrap",
            fontFamily: UI,
            fontWeight: 800,
            fontSize: 64,
            color: row === 1 ? "rgba(217,122,30,.16)" : "rgba(20,33,61,.07)",
            translate: `${(row % 2 ? -1 : 1) * frame * 9 - 1200}px 0px`,
          }}
        >
          {ticker} · {ticker}
        </div>
      ))}
      <div style={{ scale: interpolate(s, [0, 1], [3.2, 1]), rotate: `${interpolate(s, [0, 1], [-18, -6])}deg`, opacity: Math.min(1, s * 3) }}>
        <Seal size={300} />
      </div>
      <div style={{ ...H1, fontSize: 150, color: C.ink, marginTop: 70, opacity: interpolate(frame, [8, 16], [0, 1], clamp), translate: interpolate(frame, [8, 20], ["0px 60px", "0px 0px"], { ...clamp, easing: ease }) }}>
        Luyện Luật
      </div>
      <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 50, color: C.muted, marginTop: 24, textAlign: "center", padding: "0 120px", opacity: interpolate(frame, [24, 34], [0, 1], clamp) }}>
        Học khái niệm luật kiểu <span style={{ color: C.accent }}>nhớ lâu</span>
      </div>
    </AbsoluteFill>
  );
};

/* 3 — 23 môn · 690 khái niệm */
export const Mon: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = (to: number, at: number) => Math.round(interpolate(frame, [at, at + 30], [0, to], { ...clamp, easing: ease }));
  const phoneIn = pop(frame, 6, fps);
  return (
    <AbsoluteFill style={{ background: C.ink, ...SAFE }}>
      <Kicker>Các môn Luật Kinh tế</Kicker>
      <div style={{ ...H1, fontSize: 132, color: C.paper, marginTop: 16 }}>
        <span style={{ color: C.gold }}>{count(stats.subjects, 0)}</span> môn
      </div>
      <div style={{ ...H1, fontSize: 112, color: C.paper }}>
        <span style={{ color: C.gold }}>{count(stats.concepts, 12)}</span> khái niệm
      </div>
      <Phone
        src="subjects.png"
        width={520}
        style={{
          position: "absolute",
          left: 260,
          top: 700,
          rotate: `${interpolate(phoneIn, [0, 1], [14, -4])}deg`,
          translate: `0px ${interpolate(phoneIn, [0, 1], [900, 0])}px`,
        }}
      />
      {/* tên môn bay quanh điện thoại, mỗi phách thêm một chip */}
      {stats.subjectNames.slice(0, 14).map((name, i) => {
        const at = 24 + i * 6;
        const p = pop(frame, at, fps);
        const left = i % 2 === 0;
        const y = 760 + Math.floor(i / 2) * 120 + rand(i) * 30;
        return (
          <div
            key={name}
            style={{
              position: "absolute",
              top: y,
              left: left ? 40 + rand(i + 7) * 60 : 640 + rand(i + 3) * 80,
              padding: "14px 26px",
              borderRadius: 999,
              background: i % 3 === 0 ? C.accent : C.paper,
              color: i % 3 === 0 ? "#1a1206" : C.ink,
              fontFamily: UI,
              fontWeight: 800,
              fontSize: 36,
              boxShadow: "0 12px 30px rgba(0,0,0,.35)",
              scale: p,
              rotate: `${(rand(i * 5) - 0.5) * 12}deg`,
              opacity: frame >= at ? 1 : 0,
            }}
          >
            {name}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* 4 — 6 bậc ghi nhớ */
const STEPS = ["Gặp", "Nhận biết", "Phân biệt", "Điền", "Tình huống", "Tự trả lời"];
export const Bac: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const active = Math.min(5, Math.floor(Math.max(0, frame - 12) / (BEAT * 2)));
  return (
    <AbsoluteFill style={{ background: C.paper, ...SAFE }}>
      <Kicker color={C.seal}>Mỗi khái niệm đi qua</Kicker>
      <div style={{ ...H1, fontSize: 128, color: C.ink, marginTop: 12 }}>
        6 bậc
        <br />
        <span style={{ color: C.accent }}>ghi nhớ</span>
      </div>
      <Phone
        src="lesson.png"
        width={440}
        style={{ position: "absolute", left: 70, top: 720, rotate: "-3deg", scale: interpolate(pop(frame, 0, fps), [0, 1], [0.7, 1]) }}
      />
      <div style={{ position: "absolute", left: 560, top: 740, width: 380 }}>
        {STEPS.map((s, i) => {
          const at = 12 + i * BEAT * 2;
          const on = frame >= at;
          const p = pop(frame, at, fps);
          const isNow = i === active && frame >= 12;
          return (
            <div
              key={s}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                marginBottom: 26,
                padding: "20px 22px",
                borderRadius: 22,
                background: isNow ? C.ink : on ? C.card : "transparent",
                border: `3px solid ${on ? (isNow ? C.ink : C.line) : "transparent"}`,
                opacity: on ? 1 : 0.15,
                translate: `${interpolate(p, [0, 1], [120, 0])}px 0px`,
                scale: isNow ? 1.06 : 1,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  flexShrink: 0,
                  background: i === 5 ? C.ok : C.accent,
                  color: "#fff",
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 42, color: isNow ? C.paper : C.ink }}>{s}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* 5 — Ôn đúng lúc sắp quên (FSRS): đường quên, mỗi lần ôn kéo lại và rơi chậm dần */
export const Fsrs: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 860;
  const Hh = 520;
  const reviews = [0, 0.16, 0.38, 0.7];
  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = i / 200;
    let last = 0;
    let k = 0;
    reviews.forEach((r, j) => {
      if (x >= r) {
        last = r;
        k = j;
      }
    });
    const stab = 0.05 * Math.pow(2.6, k);
    const y = Math.exp(-(x - last) / stab);
    pts.push(`${(x * W).toFixed(1)},${((1 - y * 0.92) * Hh).toFixed(1)}`);
  }
  const draw = interpolate(frame, [4, 80], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const len = 3400;
  return (
    <AbsoluteFill style={{ background: C.ink, ...SAFE }}>
      <Kicker color={C.gold}>Lịch ôn FSRS</Kicker>
      <div style={{ ...H1, fontSize: 120, color: C.paper, marginTop: 12 }}>
        Ôn đúng lúc
        <br />
        <span style={{ color: "#ff6b4a" }}>sắp quên</span>
      </div>
      <svg width={W + 40} height={Hh + 120} style={{ position: "absolute", left: 90, top: 820, overflow: "visible" }}>
        <line x1={0} y1={Hh} x2={W} y2={Hh} stroke="rgba(247,244,238,.25)" strokeWidth={4} />
        <line x1={0} y1={0} x2={0} y2={Hh} stroke="rgba(247,244,238,.25)" strokeWidth={4} />
        <polyline points={pts.join(" ")} fill="none" stroke={C.gold} strokeWidth={10} strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        {reviews.slice(1).map((r, i) => {
          const vis = draw >= r;
          return (
            <g key={r} opacity={vis ? 1 : 0}>
              <circle cx={r * W} cy={Hh * 0.08} r={vis ? 20 : 0} fill={C.accent} />
              <text x={r * W} y={-20} fill={C.paper} fontFamily={UI} fontWeight={800} fontSize={34} textAnchor="middle">
                ôn {i + 1}
              </text>
            </g>
          );
        })}
        <text x={0} y={Hh + 64} fill="rgba(247,244,238,.6)" fontFamily={UI} fontWeight={700} fontSize={34}>
          Mỗi lần ôn, trí nhớ giữ lâu hơn
        </text>
      </svg>
    </AbsoluteFill>
  );
};

/* 6 — Luyện đề: trả lời đúng, có căn cứ điều luật */
export const De: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stamp = pop(frame, BEAT * 3, fps);
  return (
    <AbsoluteFill style={{ background: C.paper, ...SAFE }}>
      <Kicker color={C.ok}>{stats.sets} bộ đề · {stats.laws} văn bản luật</Kicker>
      <div style={{ ...H1, fontSize: 116, color: C.ink, marginTop: 12 }}>
        Sai ở đâu,
        <br />
        <span style={{ color: C.ok }}>biết điều nào</span>
      </div>
      <Phone
        src="quiz-ok.png"
        width={500}
        style={{ position: "absolute", left: 270, top: 700, rotate: "3deg", translate: `0px ${interpolate(pop(frame, 0, fps), [0, 1], [900, 0])}px` }}
      />
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 1180,
          padding: "22px 34px",
          borderRadius: 20,
          background: C.ok,
          color: "#fff",
          fontFamily: UI,
          fontWeight: 800,
          fontSize: 46,
          boxShadow: "0 20px 50px rgba(31,122,77,.45)",
          scale: stamp,
          rotate: "-7deg",
          opacity: frame >= BEAT * 3 ? 1 : 0,
        }}
      >
        ✓ Chính xác
      </div>
    </AbsoluteFill>
  );
};

/* 7 — Thăng chức theo khoa cử */
const RANKS = ["Thí sinh", "Tú tài", "Cử nhân", "Tiến sĩ", "Hoàng giáp", "Thám hoa", "Bảng nhãn", "Trạng nguyên"];
export const Chuc: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cur = Math.min(RANKS.length - 1, Math.floor(frame / (BEAT * 0.75)));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.wood}, #22140a)`, ...SAFE }}>
      <Kicker color={C.gold}>Học đều là lên chức</Kicker>
      <div style={{ ...H1, fontSize: 112, color: C.gold50, marginTop: 12 }}>Từ Thí sinh…</div>
      <div style={{ position: "absolute", left: 90, right: 150, top: 640 }}>
        {RANKS.map((r, i) => {
          const on = i <= cur;
          const last = i === RANKS.length - 1;
          const p = pop(frame, i * BEAT * 0.75, fps);
          return (
            <div
              key={r}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                height: 104,
                opacity: on ? 1 : 0.18,
                translate: `${interpolate(p, [0, 1], [-60, 0])}px 0px`,
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: 99, background: on ? C.gold : "rgba(255,255,255,.3)", boxShadow: on && i === cur ? `0 0 30px ${C.gold}` : undefined }} />
              <div
                style={{
                  fontFamily: last ? DISPLAY : UI,
                  fontWeight: 800,
                  fontSize: last ? 92 : 50,
                  color: last && on ? C.gold : C.gold50,
                  textShadow: last && on ? `0 0 40px rgba(242,193,78,.7)` : undefined,
                  scale: last && on ? interpolate(p, [0, 1], [1.6, 1]) : 1,
                  transformOrigin: "left center",
                }}
              >
                {r}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* 8 — Kêu gọi + miễn trừ */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, 0, fps);
  const tags = ["Miễn phí", "Không cần tài khoản", "Học trên điện thoại"];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, #22325e, ${C.inkDeep} 75%)`, alignItems: "center", paddingTop: 300 }}>
      <div style={{ scale: interpolate(s, [0, 1], [2.6, 1]), rotate: `${interpolate(s, [0, 1], [14, -6])}deg` }}>
        <Seal size={220} />
      </div>
      <div style={{ ...H1, fontSize: 140, color: C.paper, marginTop: 60 }}>Luyện Luật</div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, padding: "0 110px", marginTop: 40 }}>
        {tags.map((t, i) => (
          <div
            key={t}
            style={{
              padding: "14px 28px",
              borderRadius: 999,
              border: `3px solid ${C.gold}`,
              color: C.gold,
              fontFamily: UI,
              fontWeight: 800,
              fontSize: 38,
              scale: pop(frame, BEAT * (1 + i), fps),
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 80,
          padding: "30px 56px",
          borderRadius: 28,
          background: C.accent,
          color: "#1a1206",
          fontFamily: UI,
          fontWeight: 800,
          fontSize: 60,
          scale: pop(frame, BEAT * 5, fps) * (1 + 0.04 * Math.sin(frame / 3)),
          boxShadow: "0 24px 60px rgba(217,122,30,.45)",
        }}
      >
        Link ở bio →
      </div>
      <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, color: "rgba(247,244,238,.75)", marginTop: 36, opacity: interpolate(frame, [BEAT * 6, BEAT * 7], [0, 1], clamp) }}>
        tranquanghaofake-dotcom.github.io/Law
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 330,
          padding: "0 120px",
          textAlign: "center",
          fontFamily: UI,
          fontWeight: 500,
          fontSize: 30,
          lineHeight: 1.4,
          color: "rgba(247,244,238,.55)",
          opacity: interpolate(frame, [BEAT * 4, BEAT * 5], [0, 1], clamp),
        }}
      >
        Thông tin pháp luật chung để học tập, không phải tư vấn pháp lý.
      </div>
    </AbsoluteFill>
  );
};
