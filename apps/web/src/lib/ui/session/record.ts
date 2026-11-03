// Kỷ lục phiên lưu cục bộ (không thêm key settings). localStorage có thể bị chặn nên bọc try/catch.
const KEY = 'luyen-luat:session-record';
export type SessionRecord = { bestCombo: number; bestRate: number };

export function readRecord(): SessionRecord {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (v && typeof v.bestCombo === 'number' && typeof v.bestRate === 'number') return v;
  } catch { /* bị chặn hoặc hỏng: coi như chưa có */ }
  return { bestCombo: 0, bestRate: 0 };
}

/** Trả kỷ lục cũ và cờ phá kỷ lục. Phiên < 5 câu không tính tỉ lệ đúng; combo dưới 3 không coi là kỷ lục. */
export function submitRecord(run: { bestCombo: number; correct: number; total: number }): { before: SessionRecord; comboBeaten: boolean; rateBeaten: boolean } {
  const before = readRecord();
  const rate = run.total >= 5 ? run.correct / run.total : 0;
  const comboBeaten = run.bestCombo > before.bestCombo && run.bestCombo >= 3;
  const rateBeaten = rate >= 0.6 && rate > before.bestRate;
  if (comboBeaten || rateBeaten) {
    try { localStorage.setItem(KEY, JSON.stringify({ bestCombo: Math.max(before.bestCombo, run.bestCombo), bestRate: Math.max(before.bestRate, rate) })); } catch { /* bỏ qua */ }
  }
  return { before, comboBeaten, rateBeaten };
}
