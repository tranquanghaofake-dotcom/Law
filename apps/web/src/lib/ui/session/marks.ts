// Mốc trên thanh tiến độ: câu chốt, điểm bắt đầu vòng sửa sai, và câu vàng đã đi qua (câu vàng chưa tới thì giữ bí mật).
import type { Step } from '$lib/engine/session';

export type BarMark = { at: number; kind: 'boss' | 'retry' | 'golden'; label: string };

export function barMarks(steps: Step[], current: number): BarMark[] {
  const out: BarMark[] = [];
  let retrySeen = false;
  steps.forEach((s, i) => {
    const kind = s.meta?.kind;
    if (kind === 'boss' && !out.some((m) => m.kind === 'boss')) out.push({ at: i, kind: 'boss', label: 'Câu chốt' });
    else if (kind === 'retry' && !retrySeen) { retrySeen = true; out.push({ at: i, kind: 'retry', label: 'Vòng sửa sai' }); }
    if (s.meta?.golden && i <= current) out.push({ at: i, kind: 'golden', label: 'Câu vàng' });
  });
  return out;
}
