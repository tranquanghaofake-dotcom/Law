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
