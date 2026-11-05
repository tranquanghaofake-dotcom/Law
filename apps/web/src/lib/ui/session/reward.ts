// Khoảnh khắc thưởng khi trả lời đúng (đợt 9): khi nào đóng dấu, tween số XP.
// Hàm thuần — UI chỉ việc hiển thị theo kết quả.
import { fireTheme, type GlowTier } from './combo';

/** Mốc đóng dấu: 2, 3, 5, 8, 10, 13, rồi cứ 5 câu một lần (15, 20, …). */
export function isStampCombo(combo: number): boolean {
  return [2, 3, 5, 8, 10, 13].includes(combo) || (combo > 13 && combo % 5 === 0);
}

export type Stamp = {
  combo: number;
  /** chữ lớn, ví dụ "×3" */
  big: string;
  /** chữ nhỏ dưới dấu */
  sub: string;
  tier: GlowTier;
  /** kèm confetti nhẹ: mốc 5 và từ 10 trở đi */
  confetti: boolean;
};

/**
 * Thưởng của một câu đúng: chuỗi từ `prev` lên `combo`. Chỉ khi chuỗi thực sự tăng và chạm mốc (vòng sửa sai, câu sai: không tăng → null).
 */
export function stampFor(prev: number, combo: number): Stamp | null {
  if (!(combo > prev) || !isStampCombo(combo)) return null;
  return {
    combo,
    big: `×${combo}`,
    sub: 'CHUỖI!',
    tier: fireTheme(combo).tier,
    confetti: combo === 5 || combo >= 10,
  };
}

/** Số đếm ở thời điểm p ∈ [0,1] khi chạy từ `from` tới `to` (ease-out, số nguyên). */
export function countAt(from: number, to: number, p: number): number {
  const t = Math.min(1, Math.max(0, p));
  const e = 1 - (1 - t) ** 3;
  return Math.round(from + (to - from) * e);
}


/** Thời gian (ms) các khoảnh khắc — một nguồn cho UI, âm thanh và test. */
export const TIMING = {
  /** dấu chạm mặt giấy (đồng bộ với keyframes của ComboStamp) */
  stampLand: 130,
  /** dấu "ĐÚNG" nhỏ trên hộp đáp án chạm giấy (đồng bộ với keyframes ok-seal) */
  sealLand: 260,
  /** cả đoạn: đóng dấu → giữ → bay về ô lửa */
  stampTotal: 1100,
  /** chữ +XP bay tới bộ đếm */
  xpFly: 800,
} as const;
