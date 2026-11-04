// Biểu đồ "Hẹn ôn" ở rail: số khái niệm đến hạn theo từng ngày (hôm nay, mai … +6), ngày địa phương.

/** Số ngày địa phương (không phụ thuộc giờ mùa hè): dùng để lấy hiệu số ngày. */
const dayNo = (d: Date): number => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);

/** Đếm theo ngày: ô 0 = hôm nay (gồm cả quá hạn), ô 1 = mai, … ô `days − 1`; ngoài cửa sổ thì bỏ qua. */
export function dueByDay(dues: readonly (Date | number)[], today: Date = new Date(), days = 7): number[] {
  const out = Array<number>(days).fill(0);
  const t = dayNo(today);
  for (const d of dues) {
    const i = Math.max(0, dayNo(new Date(d)) - t);
    if (i < days) out[i]++;
  }
  return out;
}

/** Lần ôn gần nhất trong tương lai (ngày địa phương): số ngày tới, số khái niệm hẹn ngày đó, ngày dd/mm/yyyy. Dùng cho trang Ôn tập khi chưa có gì đến hạn. */
export function nextReview(dues: readonly (Date | number)[], today: Date = new Date()): { inDays: number; count: number; date: string } | null {
  const t = dayNo(today);
  let best = Infinity, count = 0, at: Date | null = null;
  for (const raw of dues) {
    const d = new Date(raw), n = dayNo(d) - t;
    if (n < 1) continue; // hôm nay/quá hạn đã nằm trong phiên ôn, không phải "lần tới"
    if (n < best) { best = n; count = 1; at = d; } else if (n === best) count++;
  }
  if (!at) return null;
  const p = (x: number) => String(x).padStart(2, '0');
  return { inDays: best, count, date: `${p(at.getDate())}/${p(at.getMonth() + 1)}/${at.getFullYear()}` };
}
