// Tên 7 mức bậc ghi nhớ (0–6), dùng chung cho lưới bậc, cột đợt, hồ sơ.
import type { Level } from '$lib/content/types';

export const LEVEL_NAMES: readonly string[] = ['Chưa học', 'Gặp', 'Nhận biết', 'Phân biệt', 'Điền', 'Tình huống', 'Thuần thục'];
/** Bậc tính là "thuần thục" cho phẩm hàm và % môn. */
export const MASTERED: Level = 5;

/** Số khái niệm ≥ MASTERED trong danh sách id. */
export function masteredCount(ids: string[], levels: Record<string, Level>): number {
  return ids.filter((id) => (levels[id] ?? 0) >= MASTERED).length;
}
