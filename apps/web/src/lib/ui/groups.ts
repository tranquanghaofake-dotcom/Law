export const GROUPS: Record<string, string> = { pldc: 'Pháp luật đại cương', 'dan-su': 'Luật Dân sự', 'lao-dong': 'Luật Lao động', 'hinh-su': 'Luật Hình sự', 'hien-phap': 'Luật Hiến pháp', 'canh-tranh': 'Luật Cạnh tranh', 'so-huu-tri-tue': 'Luật Sở hữu trí tuệ' };

/** Sắp nhóm theo thứ tự GROUPS; nhóm không có trong GROUPS xếp cuối, giữ thứ tự xuất hiện. */
export function sortGroups<T>(entries: [string, T][]): [string, T][] {
  const order = Object.keys(GROUPS);
  const rank = (g: string) => { const i = order.indexOf(g); return i < 0 ? order.length : i; };
  return entries.map((e, k) => [e, k] as const).sort((a, b) => rank(a[0][0]) - rank(b[0][0]) || a[1] - b[1]).map(([e]) => e);
}

/** Lọc bộ đề theo nhóm; null = tất cả. */
export function filterSets<T extends { group: string }>(sets: T[], group: string | null): T[] {
  return group ? sets.filter((s) => s.group === group) : sets;
}

/** Nhóm bộ đề theo `group`, xếp theo thứ tự GROUPS. */
export function groupSets<T extends { group: string }>(sets: T[]): [string, T[]][] {
  const m = new Map<string, T[]>();
  for (const s of sets) m.set(s.group, [...(m.get(s.group) ?? []), s]);
  return sortGroups([...m.entries()]);
}

/** Thẻ "Kiểm tra nhanh" ở Hôm nay: đề đầu tiên (theo thứ tự nhóm) chưa đạt tối đa; nếu đạt hết thì đề đầu, kèm điểm. */
export function pickQuickQuiz<T extends { id: string; group: string; count: number }>(sets: T[], best: Record<string, number | null | undefined>): { set: T; best: number | null } | null {
  const ordered = groupSets(sets).flatMap(([, v]) => v);
  if (!ordered.length) return null;
  const set = ordered.find((s) => best[s.id] == null || (best[s.id] as number) < s.count) ?? ordered[0];
  return { set, best: best[set.id] ?? null };
}
