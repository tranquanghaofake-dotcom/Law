// Tuỳ chọn giao diện của phương pháp học (đợt 7): lưu localStorage, bọc try/catch — KHÔNG thêm key `settings` (IndexedDB).
// pretest: đoán trước khi đọc thẻ giới thiệu (mặc định TẮT theo engine).
export type PrefKey = 'pretest';
const KEY: Record<PrefKey, string> = { pretest: 'll.pref.pretest' };
export const PREF_DEFAULT: Record<PrefKey, boolean> = { pretest: false };

/** Dọn một lần khoá của cơ chế độ tự tin đã bỏ (đợt 9). Bọc try/catch: bị chặn thì bỏ qua. */
export function purgeLegacyPrefs(): void {
  try { localStorage.removeItem('ll.pref.confidence'); } catch { /* bị chặn: bỏ qua */ }
}

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
