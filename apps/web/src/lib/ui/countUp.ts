// Số đếm tăng dần (đợt 10): XP, % tiến độ… chỉ chạy khi số thật sự đổi so với lần xem trước (lưu localStorage theo khoá),
// lần đầu thấy thì hiện thẳng — không đếm lại mỗi lần mở trang. Hàm thuần ở đây, component ở CountUp.svelte.

/** easeOutCubic: nhanh rồi chậm dần, số cuối "đậu" nhẹ */
const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export function countAt(from: number, to: number, t: number): number {
  return t >= 1 ? to : Math.round(from + (to - from) * ease(t));
}

/** Giá trị bắt đầu đếm: `from` cố định nếu có; không thì số đã thấy lần trước; chưa từng thấy → chính `value` (không đếm). */
export function startOf(value: number, seen: number | null, from?: number): number {
  if (from !== undefined) return from;
  return seen ?? value;
}
