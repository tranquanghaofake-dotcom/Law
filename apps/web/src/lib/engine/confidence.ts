// Đề xuất ① (spec 2026-11-03-phuong-phap-hoc-design.md §6): độ tự tin 3 mức trước khi xem đáp án.
// "Chắc mà sai" (hypercorrection) được đánh dấu để sửa kỹ; đúng mà "Đoán" không nâng thẻ như đúng thật.
// Thuần hàm, không đụng IndexedDB; dữ liệu cũ không có `conf` vẫn chạy như trước.
import type { Step } from './step';

/** Chắc / Tạm / Đoán. Không có = người học bỏ qua (hoặc thẻ không hỏi) → rating như cũ. */
export type Confidence = 'chac' | 'tam' | 'doan';
export const CONFIDENCES: readonly Confidence[] = ['chac', 'tam', 'doan'];
export const CONF_LABEL: Record<Confidence, string> = { chac: 'Chắc', tam: 'Tạm', doan: 'Đoán' };
/** Xác suất đúng mà mỗi mức ngầm khẳng định — dùng để tính Brier score (quy ước, không phải số đo). */
export const CONF_PROB: Record<Confidence, number> = { chac: 0.9, tam: 0.6, doan: 0.3 };

export function isConfidence(x: unknown): x is Confidence {
  return x === 'chac' || x === 'tam' || x === 'doan';
}

/** "Chắc mà sai": lỗi tự tin cao — sửa được thì nhớ lâu hơn lỗi thường (Butterfield & Metcalfe 2001). */
export function isHypercorrection(correct: boolean, conf?: Confidence): boolean {
  return !correct && conf === 'chac';
}

/** Dạng câu có hỏi độ tự tin: có đáp án khách quan và người học chưa thấy đáp án trước khi chọn. */
const CONF_TYPES = new Set(['mcq', 'case', 'truefalse', 'cloze', 'sort', 'match']);

/**
 * Có hỏi độ tự tin ở bước này không. Mặc định: từ bậc 2, không hỏi ở intro/đoán trước/vòng sửa sai, không hỏi tự nhớ lại
 * (tự chấm đã là đánh giá). `every` = hỏi 1/every số bước đủ điều kiện (theo chỉ số bước, tất định) để phiên không chậm.
 */
export function shouldAskConfidence(step: Step, index: number, opts: { minLevel?: number; every?: number } = {}): boolean {
  const minLevel = opts.minLevel ?? 2;
  const every = Math.max(1, opts.every ?? 1);
  const kind = step.meta?.kind;
  if (kind === 'retry' || kind === 'pretest') return false;
  if (!CONF_TYPES.has(step.item.type)) return false;
  if (step.level < minLevel) return false;
  return index % every === 0;
}

export type CalibrationRow = { conf?: Confidence; rating: number };
export type Calibration = {
  /** Số lượt có độ tự tin. */
  n: number;
  /** Theo mức: số lượt, tỉ lệ đúng (rating ≠ Again). */
  byConf: Record<Confidence, { n: number; correctRate: number | null }>;
  /** Brier score (0 = tự đánh giá hoàn hảo, 0,25 ≈ đoán mò 50/50); null khi chưa có dữ liệu. */
  brier: number | null;
  /** Số lượt "chắc mà sai". */
  hyper: number;
};

const AGAIN = 1; // ts-fsrs Rating.Again

/** Độ chuẩn tự đánh giá từ log ôn (`ReviewRow`); lượt không có `conf` bị bỏ qua. */
export function calibration(rows: CalibrationRow[]): Calibration {
  const byConf = Object.fromEntries(CONFIDENCES.map((c) => [c, { n: 0, correctRate: null as number | null }])) as Calibration['byConf'];
  const ok: Record<Confidence, number> = { chac: 0, tam: 0, doan: 0 };
  let n = 0, sq = 0, hyper = 0;
  for (const r of rows) {
    if (!isConfidence(r.conf)) continue;
    const correct = r.rating !== AGAIN;
    n++;
    byConf[r.conf].n++;
    if (correct) ok[r.conf]++;
    sq += (CONF_PROB[r.conf] - (correct ? 1 : 0)) ** 2;
    if (isHypercorrection(correct, r.conf)) hyper++;
  }
  for (const c of CONFIDENCES) byConf[c].correctRate = byConf[c].n ? ok[c] / byConf[c].n : null;
  return { n, byConf, brier: n ? sq / n : null, hyper };
}
