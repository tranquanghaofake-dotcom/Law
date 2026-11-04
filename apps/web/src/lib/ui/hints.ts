// Gợi ý hiện một lần (localStorage, bọc try/catch — bị chặn lưu trữ thì chỉ mất ghi nhớ, không lỗi).
export type HintKey = 'session-glow';
const key = (k: HintKey) => `ll.hint.${k}`;

export function hintSeen(k: HintKey): boolean {
  try { return localStorage.getItem(key(k)) === '1'; } catch { return false; }
}
export function markHintSeen(k: HintKey): void {
  try { localStorage.setItem(key(k), '1'); } catch { /* bỏ qua */ }
}
