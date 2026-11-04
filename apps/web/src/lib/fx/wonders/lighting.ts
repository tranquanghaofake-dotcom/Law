// Chọn nét kỳ quan sáng lên khi trả lời đúng. Hàm thuần: nguồn ngẫu nhiên được tiêm vào để test.
import { glowLevel } from '$lib/ui/session/combo';

/** Số nét sáng thêm cho một câu đúng: chuỗi càng dài càng nhiều (mốc 1/2/3/5/8/13 → 3/4/5/7/9/12). */
export function strokesPerCorrect(combo: number): number {
  return [0, 3, 4, 5, 7, 9, 12][glowLevel(combo)];
}

/** Chọn `n` chỉ số nét CHƯA sáng (không trùng, không vượt số còn lại), theo `rand()` ∈ [0,1). */
export function pickStrokes(total: number, lit: Iterable<number>, n: number, rand: () => number): number[] {
  const done = new Set(lit);
  const free: number[] = [];
  for (let i = 0; i < total; i++) if (!done.has(i)) free.push(i);
  const k = Math.max(0, Math.min(Math.floor(n), free.length));
  for (let i = 0; i < k; i++) {
    const j = i + Math.min(free.length - i - 1, Math.floor(rand() * (free.length - i)));
    [free[i], free[j]] = [free[j], free[i]];
  }
  return free.slice(0, k);
}
