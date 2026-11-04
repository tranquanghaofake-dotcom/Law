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

/** Lần ôn gần nhất CHƯA tới (sau `now`), theo ngày địa phương: số ngày tới (0 = còn trong hôm nay, vd. bước học
 *  1–10 phút của FSRS), số khái niệm hẹn trong ngày đó, ngày dd/mm/yyyy và giờ HH:MM của hẹn sớm nhất.
 *  Hẹn đã tới/quá hạn bỏ qua: chúng thuộc phiên ôn hiện tại. Dùng cho trang Ôn tập khi chưa có gì đến hạn. */
export function nextReview(dues: readonly (Date | number)[], now: Date = new Date()): { inDays: number; count: number; date: string; time: string } | null {
  const t = dayNo(now);
  let best = Infinity, count = 0, at: Date | null = null;
  for (const raw of dues) {
    const d = new Date(raw);
    if (d.getTime() <= now.getTime()) continue;
    const n = dayNo(d) - t;
    if (n < best) { best = n; count = 1; at = d; }
    else if (n === best) { count++; if (at && d < at) at = d; }
  }
  if (!at) return null;
  const p = (x: number) => String(x).padStart(2, '0');
  return { inDays: best, count, date: `${p(at.getDate())}/${p(at.getMonth() + 1)}/${at.getFullYear()}`, time: `${p(at.getHours())}:${p(at.getMinutes())}` };
}
