// XP của phiên chia theo nguồn, để màn kết thúc cho thấy thưởng đến từ đâu (nhớ được, combo, câu vàng, sửa sai, hoàn thành).
import { BASE_XP, xpForAnswer } from '$lib/game/xp';

export type XpEntry = { gained: number; correct: boolean; combo: number; golden: boolean; retry: boolean };
export type XpSource = { key: 'base' | 'combo' | 'golden' | 'retry' | 'session' | 'lesson'; label: string; xp: number };

export function xpSources(entries: XpEntry[], bonus: { session?: number; lesson?: number } = {}): XpSource[] {
  let base = 0, combo = 0, golden = 0, retry = 0;
  for (const e of entries) {
    if (e.gained <= 0) continue;
    if (e.retry) { retry += e.gained; continue; }
    const plain = e.correct ? xpForAnswer(true, e.combo) : 0; // đã gồm hệ số combo
    base += Math.min(e.gained, BASE_XP);
    combo += Math.max(0, Math.min(e.gained, plain) - BASE_XP);
    golden += Math.max(0, e.gained - Math.max(plain, BASE_XP)); // phần cộng thêm của câu vàng
  }
  const all: XpSource[] = [
    { key: 'base', label: 'Câu đúng', xp: base },
    { key: 'combo', label: 'Thưởng combo', xp: combo },
    { key: 'golden', label: 'Câu vàng', xp: golden },
    { key: 'retry', label: 'Sửa sai', xp: retry },
    { key: 'session', label: 'Hoàn thành phiên', xp: bonus.session ?? 0 },
    { key: 'lesson', label: 'Bài học lần đầu', xp: bonus.lesson ?? 0 },
  ];
  return all.filter((s) => s.xp > 0);
}
