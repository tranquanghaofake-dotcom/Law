// Kéo ngăn kéo (Sheet, điện thoại) xuống để đóng — hàm thuần, test ở tests/ui/sheetDrag.test.ts.

/** Độ dời hiển thị theo độ kéo `dy` (px): xuống thì 1:1; lên thì hãm kiểu cao su, tối đa 24 px. */
export function dragOffset(dy: number): number {
  return dy >= 0 ? dy : -24 * (1 - Math.exp(dy / 60));
}

/** Thả tay: đóng nếu kéo xuống quá 30% chiều cao ngăn kéo (ít nhất 96 px) hoặc vận tốc xuống > 0,6 px/ms. */
export function shouldDismiss(dy: number, vy: number, height: number): boolean {
  if (dy <= 0) return false;
  return dy > Math.max(96, height * 0.3) || vy > 0.6;
}
