// Tên 7 mức bậc ghi nhớ (0–6), dùng chung cho lưới bậc, cột đợt, hồ sơ.
import type { Level } from '$lib/content/types';

export const LEVEL_NAMES: readonly string[] = ['Chưa học', 'Gặp', 'Nhận biết', 'Phân biệt', 'Điền', 'Tình huống', 'Tinh thông'];
/** Tên bậc để hiển thị: bậc 0 nhưng đã có lượt trả lời (vd. gặp rồi trả lời sai) → "Đã gặp · cần ôn" thay cho "Chưa học". */
export function levelName(level: number, seen = false): string {
  return level === 0 && seen ? 'Đã gặp · cần ôn' : (LEVEL_NAMES[level] ?? '');
}
/** Bậc tính là "thuần thục" cho phẩm hàm và % môn. */
export const MASTERED: Level = 5;

/** Số khái niệm ≥ MASTERED trong danh sách id. */
export function masteredCount(ids: string[], levels: Record<string, Level>): number {
  return ids.filter((id) => (levels[id] ?? 0) >= MASTERED).length;
}
