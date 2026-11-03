// XP của phiên chia theo nguồn, để màn kết thúc cho thấy thưởng đến từ đâu (nhớ được, combo, câu vàng, sửa sai, hoàn thành).
export type XpPartsLike = { base: number; combo: number; golden: number; retry: number };
export type XpSource = { key: 'base' | 'combo' | 'golden' | 'retry' | 'session' | 'lesson'; label: string; xp: number };

export function xpSources(parts: XpPartsLike, bonus: { session?: number; lesson?: number } = {}): XpSource[] {
  const all: XpSource[] = [
    { key: 'base', label: 'Câu đúng', xp: parts.base },
    { key: 'combo', label: 'Thưởng combo', xp: parts.combo },
    { key: 'golden', label: 'Câu vàng', xp: parts.golden },
    { key: 'retry', label: 'Sửa sai', xp: parts.retry },
    { key: 'session', label: 'Hoàn thành phiên', xp: bonus.session ?? 0 },
    { key: 'lesson', label: 'Bài học lần đầu', xp: bonus.lesson ?? 0 },
  ];
  return all.filter((s) => s.xp > 0);
}
