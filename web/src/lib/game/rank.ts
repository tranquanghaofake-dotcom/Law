export type Rank = { name: string; xp: number; icon: string };

/** Thang khoa cử (spec 7.1). `icon` là tên biểu tượng dùng trong RankBadge. */
export const RANKS: Rank[] = [
  { name: 'Thí sinh', xp: 0, icon: 'but-long' },
  { name: 'Tú tài', xp: 300, icon: 'nghien-muc' },
  { name: 'Cử nhân', xp: 1000, icon: 'sach-cuon' },
  { name: 'Tiến sĩ', xp: 3000, icon: 'bia-da' },
  { name: 'Hoàng giáp', xp: 7000, icon: 'ao-bao-xanh' },
  { name: 'Thám hoa', xp: 15000, icon: 'ao-bao-do' },
  { name: 'Bảng nhãn', xp: 30000, icon: 'kieu' },
  { name: 'Trạng nguyên', xp: 60000, icon: 'long-vang' },
];

export type Tier = 'III' | 'II' | 'I';
export type RankInfo = { rank: string; icon: string; tier: Tier; progress: number; nextXp: number | null; index: number };

export function rankFor(xp: number): RankInfo {
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].xp) i = k;
  const cur = RANKS[i];
  const next = RANKS[i + 1] ?? null;
  if (!next) return { rank: cur.name, icon: cur.icon, tier: 'I', progress: 1, nextXp: null, index: i };
  const span = next.xp - cur.xp;
  const progress = (xp - cur.xp) / span;
  const tier: Tier = progress < 1 / 3 ? 'III' : progress < 2 / 3 ? 'II' : 'I';
  return { rank: cur.name, icon: cur.icon, tier, progress, nextXp: next.xp, index: i };
}

/** Phẩm hàm theo môn (spec 7.2): tỉ lệ khái niệm ở bậc ≥ 5. */
export const GRADES = ['Cửu phẩm', 'Bát phẩm', 'Thất phẩm', 'Lục phẩm', 'Ngũ phẩm', 'Tứ phẩm', 'Tam phẩm', 'Nhị phẩm', 'Nhất phẩm'];

export function gradeFor(masteredRatio: number): string | null {
  const step = Math.floor(masteredRatio * 10 + 1e-9); // 0.1 → 1 … 0.9 → 9
  if (step < 1) return null;
  return GRADES[Math.min(step, 9) - 1];
}
