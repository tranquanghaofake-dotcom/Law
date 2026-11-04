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
  { id: 'thap-rua', load: () => import('./thap-rua') },
  { id: 'cau-the-huc', load: () => import('./cau-the-huc') },
  { id: 'nha-hat-lon-ha-noi', load: () => import('./nha-hat-lon-ha-noi') },
  { id: 'cau-long-bien', load: () => import('./cau-long-bien') },
  { id: 'o-quan-chuong', load: () => import('./o-quan-chuong') },
  { id: 'chua-tran-quoc', load: () => import('./chua-tran-quoc') },
  { id: 'doan-mon', load: () => import('./doan-mon') },
  { id: 'nha-tho-lon-ha-noi', load: () => import('./nha-tho-lon-ha-noi') },
  { id: 'ngo-mon-hue', load: () => import('./ngo-mon-hue') },
  { id: 'thap-phuoc-duyen', load: () => import('./thap-phuoc-duyen') },
  { id: 'cau-truong-tien', load: () => import('./cau-truong-tien') },
  { id: 'thanh-dia-my-son', load: () => import('./thanh-dia-my-son') },
  { id: 'thap-ba-ponagar', load: () => import('./thap-ba-ponagar') },
  { id: 'thap-po-klong-garai', load: () => import('./thap-po-klong-garai') },
  { id: 'cau-rong-da-nang', load: () => import('./cau-rong-da-nang') },
  { id: 'cau-vang-ba-na', load: () => import('./cau-vang-ba-na') },
  { id: 'ngu-hanh-son', load: () => import('./ngu-hanh-son') },
  { id: 'pho-co-hoi-an', load: () => import('./pho-co-hoi-an') },
  { id: 'thanh-nha-ho', load: () => import('./thanh-nha-ho') },
  { id: 'trang-an-ninh-binh', load: () => import('./trang-an-ninh-binh') },
  { id: 'chua-bai-dinh', load: () => import('./chua-bai-dinh') },
  { id: 'hang-son-doong', load: () => import('./hang-son-doong') },
  { id: 'cho-ben-thanh', load: () => import('./cho-ben-thanh') },
  { id: 'nha-tho-duc-ba', load: () => import('./nha-tho-duc-ba') },
  { id: 'buu-dien-sai-gon', load: () => import('./buu-dien-sai-gon') },
  { id: 'landmark-81', load: () => import('./landmark-81') },
  { id: 'toa-nha-bitexco', load: () => import('./toa-nha-bitexco') },
  { id: 'cho-noi-cai-rang', load: () => import('./cho-noi-cai-rang') },
  { id: 'mui-ca-mau', load: () => import('./mui-ca-mau') },
  { id: 'mu-cang-chai', load: () => import('./mu-cang-chai') },
  { id: 'cot-co-lung-cu', load: () => import('./cot-co-lung-cu') },
  { id: 'dinh-fansipan', load: () => import('./dinh-fansipan') },
  { id: 'nha-san-mai-chau', load: () => import('./nha-san-mai-chau') },
  { id: 'nha-rong-tay-nguyen', load: () => import('./nha-rong-tay-nguyen') },
  { id: 'cong-chieng-tay-nguyen', load: () => import('./cong-chieng-tay-nguyen') },
  { id: 'dinh-lang-bac-bo', load: () => import('./dinh-lang-bac-bo') },
  { id: 'cay-da-gieng-nuoc-mai-dinh', load: () => import('./cay-da-gieng-nuoc-mai-dinh') },
  { id: 'mua-roi-nuoc', load: () => import('./mua-roi-nuoc') },
  { id: 'non-la-ao-dai', load: () => import('./non-la-ao-dai') },
  { id: 'hoa-sen', load: () => import('./hoa-sen') },
  { id: 'thuyen-thung', load: () => import('./thuyen-thung') },
  { id: 'thap-binh-son', load: () => import('./thap-binh-son') },
  { id: 'chua-dau', load: () => import('./chua-dau') },
  { id: 'van-mieu-mon', load: () => import('./van-mieu-mon') },
];

/** Chọn ngẫu nhiên một kỳ quan cho phiên (`rand` tiêm được để test). */
export function pickWonderId(rand: () => number = Math.random): string {
  return WONDERS[Math.min(WONDERS.length - 1, Math.floor(rand() * WONDERS.length))].id;
}

export async function loadWonder(id: string): Promise<Wonder> {
  const e = WONDERS.find((w) => w.id === id) ?? WONDERS[0];
  return e.load();
}
