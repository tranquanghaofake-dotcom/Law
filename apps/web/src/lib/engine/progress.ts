import type { Level } from '$lib/content/types';
export type { Level };

/** Đúng → +1 (tối đa 6); sai → −1 (tối thiểu 0). Không xét giãn cách — dùng `stepLevel` khi ghi tiến độ. */
export function nextLevel(level: Level, correct: boolean): Level {
  const n = correct ? Math.min(6, level + 1) : Math.max(0, level - 1);
  return n as Level;
}

/**
 * Bậc bắt đầu phải qua giãn cách: lên bậc ≥ SPACED_FROM chỉ khi KHÁC NGÀY với lần lên bậc trước.
 * Hệ quả: học dồn một buổi dừng ở bậc 3 (Phân biệt); bậc 4 cần ngày thứ hai, thuần thục (bậc 5) cần ngày thứ ba.
 * Lý do: "thuần thục" phải là nhớ được qua thời gian, không phải đúng liên tiếp vài phút sau khi đọc
 * (successive relearning — Rawson & Dunlosky 2011; spec phương pháp học §2).
 */
export const SPACED_FROM = 4;

/**
 * Bậc sau một câu trả lời có xét giãn cách. `upDay` = ngày (YYYY-MM-DD, giờ địa phương) lần lên bậc gần nhất; `today` = ngày trả lời.
 * `held` = đúng nhưng bị giữ bậc vì cùng ngày (để giao diện giải thích). Dữ liệu cũ không có `upDay` thì được lên.
 * `partial` = tự chấm "Gần đúng" (tự nhớ lại): giữ nguyên bậc — nhớ chưa đủ để lên, cũng không phải quên.
 */
export function stepLevel(level: Level, correct: boolean, upDay: string | undefined, today: string, partial = false): { level: Level; upDay?: string; held: boolean } {
  if (!correct) return { level: nextLevel(level, false), upDay, held: false };
  if (partial) return { level, upDay, held: false };
  const to = nextLevel(level, true);
  if (to === level) return { level, upDay, held: false };
  if (to >= SPACED_FROM && upDay === today) return { level, upDay, held: true };
  return { level: to, upDay: today, held: false };
}
