// Kỳ quan/biểu tượng Việt Nam làm nền phiên học. Mỗi kỳ quan là MỘT tệp TS riêng (nạp lười bằng import()
// để không phình bundle chính), xuất đúng 5 thành phần:
//   export const id: string;       // slug, trùng tên tệp
//   export const name: string;     // tên hiển thị
//   export const place: string;    // địa điểm
//   export const viewBox: string;  // '0 0 800 600' (mọi kỳ quan dùng chung khung 800×600)
//   export const paths: string[];  // ≥ 30 nét line-art, mỗi chuỗi là thuộc tính d của một <path>
// Thêm kỳ quan mới: tạo tệp cùng định dạng rồi thêm một dòng vào WONDERS bên dưới (không phải sửa chỗ khác).
export type Wonder = { id: string; name: string; place: string; viewBox: string; paths: string[] };
type Entry = { id: string; load: () => Promise<Wonder> };

export const WONDERS: Entry[] = [
  { id: 'khue-van-cac', load: () => import('./khue-van-cac') },
  { id: 'chua-mot-cot', load: () => import('./chua-mot-cot') },
  { id: 'trong-dong-dong-son', load: () => import('./trong-dong-dong-son') },
  { id: 'vinh-ha-long', load: () => import('./vinh-ha-long') },
  { id: 'chua-cau-hoi-an', load: () => import('./chua-cau-hoi-an') },
  { id: 'cot-co-ha-noi', load: () => import('./cot-co-ha-noi') },
];

/** Chọn ngẫu nhiên một kỳ quan cho phiên (`rand` tiêm được để test). */
export function pickWonderId(rand: () => number = Math.random): string {
  return WONDERS[Math.min(WONDERS.length - 1, Math.floor(rand() * WONDERS.length))].id;
}

export async function loadWonder(id: string): Promise<Wonder> {
  const e = WONDERS.find((w) => w.id === id) ?? WONDERS[0];
  return e.load();
}
