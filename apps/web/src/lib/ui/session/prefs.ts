// Tuỳ chọn giao diện của phương pháp học (đợt 7): lưu localStorage, bọc try/catch — KHÔNG thêm key `settings` (IndexedDB).
// confidence: hiện 3 nút Chắc/Tạm/Đoán (mặc định BẬT); pretest: đoán trước khi đọc thẻ giới thiệu (mặc định TẮT theo engine).
export type PrefKey = 'confidence' | 'pretest';
const KEY: Record<PrefKey, string> = { confidence: 'll.pref.confidence', pretest: 'll.pref.pretest' };
export const PREF_DEFAULT: Record<PrefKey, boolean> = { confidence: true, pretest: false };

export function getPref(k: PrefKey): boolean {
  try {
    const v = localStorage.getItem(KEY[k]);
    return v === null ? PREF_DEFAULT[k] : v === '1';
  } catch {
    return PREF_DEFAULT[k];
  }
}

export function setPref(k: PrefKey, on: boolean): void {
  try { localStorage.setItem(KEY[k], on ? '1' : '0'); } catch { /* bị chặn: chỉ mất ghi nhớ */ }
}
