// Tiếng đóng mộc "cộp" tổng hợp bằng Web Audio (không thêm tệp/thư viện): thân trầm hạ cao độ + tiếng giấy (nhiễu lọc thấp) + tiếng gõ ngắn.
// heavy: dấu mộc ở mốc chuỗi (to, trầm, dài hơn); thường: dấu "Đúng" nhỏ mỗi câu đúng.
export type ThudPlan = {
  body: { from: number; to: number; dur: number; gain: number };
  slap: { dur: number; cutoff: number; gain: number };
  click: { freq: number; dur: number; gain: number };
};

export function thudPlan(heavy: boolean): ThudPlan {
  return heavy
    ? { body: { from: 120, to: 48, dur: 0.24, gain: 0.85 }, slap: { dur: 0.09, cutoff: 1100, gain: 0.55 }, click: { freq: 1800, dur: 0.012, gain: 0.18 } }
    : { body: { from: 170, to: 80, dur: 0.14, gain: 0.5 }, slap: { dur: 0.06, cutoff: 1500, gain: 0.35 }, click: { freq: 2400, dur: 0.01, gain: 0.12 } };
}

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (ctx) return ctx;
  const C = (globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
    ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!C) return null;
  try { ctx = new C(); } catch { return null; }
  return ctx;
}

/** Phát tiếng mộc ngay. Trả false nếu trình duyệt không có Web Audio. */
export function playThud(heavy: boolean, volume = 1): boolean {
  const a = audio();
  if (!a) return false;
  try {
    if (a.state === 'suspended') void a.resume();
    const p = thudPlan(heavy), t = a.currentTime + 0.005;
    // thân: sine hạ cao độ, tắt nhanh
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(p.body.from, t);
    o.frequency.exponentialRampToValueAtTime(p.body.to, t + p.body.dur);
    g.gain.setValueAtTime(p.body.gain * volume, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + p.body.dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + p.body.dur + 0.02);
    // giấy: nhiễu trắng qua lọc thấp
    const n = Math.max(1, Math.floor(a.sampleRate * p.slap.dur));
    const buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;
    const src = a.createBufferSource(), f = a.createBiquadFilter(), gs = a.createGain();
    src.buffer = buf; f.type = 'lowpass'; f.frequency.setValueAtTime(p.slap.cutoff, t); f.Q.setValueAtTime(0.7, t);
    gs.gain.setValueAtTime(p.slap.gain * volume, t);
    src.connect(f).connect(gs).connect(a.destination);
    src.start(t); src.stop(t + p.slap.dur);
    // gõ: tiếng tách rất ngắn lúc mặt dấu chạm
    const c = a.createOscillator(), gc = a.createGain();
    c.type = 'triangle'; c.frequency.setValueAtTime(p.click.freq, t);
    gc.gain.setValueAtTime(p.click.gain * volume, t);
    gc.gain.exponentialRampToValueAtTime(0.001, t + p.click.dur);
    c.connect(gc).connect(a.destination);
    c.start(t); c.stop(t + p.click.dur + 0.01);
    return true;
  } catch { return false; }
}
