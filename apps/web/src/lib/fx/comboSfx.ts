// Âm thanh theo mốc chuỗi đúng (1/2/3/5/8/13): mỗi mốc một cách ghép tệp Kenney (CC0) khác nhau — tệp, tốc độ phát, độ trễ, âm lượng.
import { glowLevel } from '$lib/ui/session/combo';

export type SfxLayer = { file: string; rate: number; delay: number; volume: number };

const PLANS: SfxLayer[][] = [
  [],
  // mốc 1: tiếng xác nhận đơn
  [{ file: 'confirmation_001', rate: 1, delay: 0, volume: 0.6 }],
  // mốc 2: xác nhận cao hơn + "tách" trong
  [{ file: 'confirmation_001', rate: 1.12, delay: 0, volume: 0.6 }, { file: 'select_001', rate: 1.5, delay: 80, volume: 0.45 }],
  // mốc 3: thêm chuông thuỷ tinh
  [{ file: 'confirmation_001', rate: 1.2, delay: 0, volume: 0.55 }, { file: 'glass_004', rate: 1, delay: 60, volume: 0.5 }],
  // mốc 5: chuông trầm "bong" + thuỷ tinh quãng 5 + xác nhận cao
  [{ file: 'bong_001', rate: 1, delay: 0, volume: 0.6 }, { file: 'glass_004', rate: 1.35, delay: 50, volume: 0.5 }, { file: 'confirmation_001', rate: 1.35, delay: 130, volume: 0.45 }],
  // mốc 8: chuông trầm hơn, thuỷ tinh cao, quét "maximize"
  [{ file: 'bong_001', rate: 0.85, delay: 0, volume: 0.65 }, { file: 'glass_004', rate: 1.6, delay: 40, volume: 0.5 }, { file: 'maximize_006', rate: 1.3, delay: 100, volume: 0.5 }],
  // mốc 13+: dàn 5 lớp, thuỷ tinh đôi quãng 8
  [{ file: 'bong_001', rate: 0.7, delay: 0, volume: 0.7 }, { file: 'glass_004', rate: 1.5, delay: 0, volume: 0.5 }, { file: 'glass_004', rate: 2, delay: 120, volume: 0.45 }, { file: 'maximize_006', rate: 1, delay: 180, volume: 0.55 }, { file: 'question_003', rate: 1.6, delay: 280, volume: 0.4 }],
];

/** Các lớp âm phát khi trả lời đúng với chuỗi `combo` (≥ 1). Rỗng khi combo < 1. */
export function comboSfxPlan(combo: number): SfxLayer[] {
  return PLANS[glowLevel(combo)];
}
