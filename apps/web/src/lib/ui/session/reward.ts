// Khoảnh khắc thưởng khi trả lời đúng (đợt 9): khi nào đóng dấu, khi nào phủ kỳ quan sáng rực, tween số XP, màu nét.
// Hàm thuần — UI chỉ việc hiển thị theo kết quả.
import { COMBO_COLORS, fireTheme, type GlowTier } from './combo';

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
  /** phủ toàn màn hình kỳ quan sáng rực: mốc 5, 8, 13 */
  overlay: boolean;
};

export const OVERLAY_COMBOS: readonly number[] = [5, 8, 13];

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
    overlay: OVERLAY_COMBOS.includes(combo),
  };
}

/** Phần trăm đã thắp sáng, làm tròn xuống (chỉ 100 khi sáng đủ mọi nét). */
export function litPercent(litCount: number, total: number): number {
  if (total <= 0 || litCount <= 0) return 0;
  if (litCount >= total) return 100;
  return Math.min(99, Math.floor((litCount / total) * 100));
}

/** Số đếm ở thời điểm p ∈ [0,1] khi chạy từ `from` tới `to` (ease-out, số nguyên). */
export function countAt(from: number, to: number, p: number): number {
  const t = Math.min(1, Math.max(0, p));
  const e = 1 - (1 - t) ** 3;
  return Math.round(from + (to - from) * e);
}

/** Màu nét kỳ quan theo bậc; "Trắng – đen": nét chẵn đen, nét lẻ trắng để thấy được trên mọi nền. */
export function strokeColors(tier: GlowTier | 'final', i: number): { line: string; glow: string } {
  if (tier === 'final') return { line: '#d9a21e', glow: '#f2c14e' };
  const c = COMBO_COLORS[tier];
  if (tier === 'trang-den') return i % 2 ? { line: c.line, glow: c.alt } : { line: c.alt, glow: c.line };
  return { line: c.line, glow: c.glow };
}

/** Thời gian (ms) các khoảnh khắc — một nguồn cho UI, âm thanh và test. */
export const TIMING = {
  /** dấu chạm mặt giấy (đồng bộ với keyframes của ComboStamp) */
  stampLand: 130,
  /** cả đoạn: đóng dấu → giữ → bay về ô lửa */
  stampTotal: 1100,
  /** overlay kỳ quan: bắt đầu trễ để dấu đóng trước, rồi tổng thời gian hiện */
  flashDelay: 350,
  flashTotal: 1200,
  /** chữ +XP bay tới bộ đếm */
  xpFly: 800,
} as const;
