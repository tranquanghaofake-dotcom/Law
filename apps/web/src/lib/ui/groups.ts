export const GROUPS: Record<string, string> = { pldc: 'Pháp luật đại cương', 'dan-su': 'Luật Dân sự', 'lao-dong': 'Luật Lao động', 'hinh-su': 'Luật Hình sự', 'hien-phap': 'Luật Hiến pháp' };

/** Sắp nhóm theo thứ tự GROUPS; nhóm không có trong GROUPS xếp cuối, giữ thứ tự xuất hiện. */
export function sortGroups<T>(entries: [string, T][]): [string, T][] {
  const order = Object.keys(GROUPS);
  const rank = (g: string) => { const i = order.indexOf(g); return i < 0 ? order.length : i; };
  return entries.map((e, k) => [e, k] as const).sort((a, b) => rank(a[0][0]) - rank(b[0][0]) || a[1] - b[1]).map(([e]) => e);
}
