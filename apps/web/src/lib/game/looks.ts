// Tổ hợp "diện mạo" của tủ trưng bày theo chức danh: trang phục + màu + phụ kiện cài áo + hai đồ vật trên bục + phông kiến trúc +
// bầu trời + chất liệu bục + ánh sáng. Mỗi chức (29) và Công dân có MỘT tổ hợp riêng, nhìn thấy rõ ở cỡ thật (test so chữ ký và khoảng cách).
// Hàm thuần, không phụ thuộc giao diện; tên đồ vật/phông/màu là khoá để lib/art/showcase/* vẽ. Dữ liệu chức danh chỉ từ career.ts/wardrobe.ts.
// Không cờ, Quốc huy, quân hàm, cấp hiệu, huân chương thật.
import { POSTS, type PostTier } from './career';
import { outfitFor } from './wardrobe';

/** Số biến thể màu của từng trang phục (palette nằm ở lib/art/showcase/tones.ts, test giữ hai bên khớp). */
export const TONES: Record<string, number> = { 'thuong-phuc': 4, 'cong-so': 4, 'vest-xanh': 4, 'vest-den': 6, 'ao-choang': 3, 'ks-xuan-he': 3, 'ks-thu-dong': 3, 'ao-dai': 5 };

export const PROPS = [
  'con-dau', 'khay-ho-so', 'hom-phieu', 'bo-luat', 'can-can', 'ho-so-vu-an', 'cap-ho-so', 'kinh-lup',
  'so-tay', 'chau-cay', 'micro', 'dong-ho', 'qua-cau', 'binh-sen', 'den-ban', 'chong-sach', 'but-nghien', 'cuon-chieu', 'trong-mini', 'laptop', 'bieu-do',
] as const;
export type PropId = (typeof PROPS)[number];
export const BACKDROPS = ['khue-van-cac', 'quoc-hoi', 'tam-quan', 'chua-mot-cot', 'ha-long', 'ngo-mon', 'toa-an', 'sach-luat', 'san-giao-dich', 'bia-tien-si'] as const;
export type BackdropId = (typeof BACKDROPS)[number];
export const SKIES = ['ban-mai', 'trua', 'hoang-hon', 'dem'] as const;
export type SkyId = (typeof SKIES)[number];
/** Phụ kiện cài áo: ghim cán cân / hoa sen / sách / trống đồng nhỏ, khăn lụa. */
export const ADORNS = ['khong', 'ghim-can', 'ghim-sen', 'ghim-sach', 'ghim-trong', 'khan-lua'] as const;
export type AdornId = (typeof ADORNS)[number];
/** Hoạ tiết vải (phủ lên trang phục) và kiểu cổ (cà vạt / nơ / mở cổ). */
export const PATTERNS = ['tron', 'soc-doc', 'soc-chi', 'ca-ro', 'cham'] as const;
export type PatternId = (typeof PATTERNS)[number];
export const NECKS = ['mac-dinh', 'no', 'mo-co'] as const;
export type NeckId = (typeof NECKS)[number];
export type Material = 'go' | 'dong' | 'vang' | 'vang-sang';
export type Light = 'khong' | 'nang' | 'trong-dong' | 'khung-vang' | 'hat-sang';

export type Look = {
  id: string; outfit: string; tone: number; pattern: PatternId; neck: NeckId; adorn: AdornId; propL: PropId; propR: PropId; backdrop: BackdropId; sky: SkyId;
  material: Material; light: Light;
};

const MATERIAL: Record<PostTier, Material> = { 'co-so': 'go', tinh: 'dong', 'trung-uong': 'vang', 'lanh-dao': 'vang-sang' };
const LIGHT: Record<PostTier, Light> = { 'co-so': 'khong', tinh: 'nang', 'trung-uong': 'trong-dong', 'lanh-dao': 'hat-sang' };

type Row = [tone: number, adorn: AdornId, left: PropId, right: PropId, backdrop: BackdropId, sky: SkyId];
const CITIZEN: Row = [0, 'khong', 'so-tay', 'chau-cay', 'chua-mot-cot', 'ban-mai'];

/** id chức → [màu, phụ kiện, đồ vật trái, đồ vật phải, phông, trời]. */
const TABLE: Record<string, Row> = {
  // Hành pháp — từ chính quyền cấp xã tới Chính phủ
  'cong-chuc-xa': [1, 'khong', 'so-tay', 'con-dau', 'tam-quan', 'trua'],
  'pho-chu-tich-xa': [2, 'ghim-sen', 'khay-ho-so', 'chau-cay', 'tam-quan', 'hoang-hon'],
  'chu-tich-xa': [3, 'ghim-sach', 'dong-ho', 'cap-ho-so', 'chua-mot-cot', 'ban-mai'],
  'chuyen-vien-so': [0, 'khong', 'laptop', 'khay-ho-so', 'ngo-mon', 'ban-mai'],
  'giam-doc-so': [1, 'ghim-sach', 'bieu-do', 'con-dau', 'ngo-mon', 'trua'],
  'chu-tich-tinh': [2, 'khan-lua', 'qua-cau', 'chong-sach', 'tam-quan', 'hoang-hon'],
  'vu-truong': [0, 'ghim-sach', 'laptop', 'cap-ho-so', 'san-giao-dich', 'trua'],
  'thu-truong': [4, 'ghim-can', 'bieu-do', 'khay-ho-so', 'ngo-mon', 'hoang-hon'],
  'bo-truong': [2, 'ghim-sen', 'qua-cau', 'con-dau', 'khue-van-cac', 'ban-mai'],
  'pho-thu-tuong': [4, 'ghim-trong', 'dong-ho', 'bieu-do', 'ha-long', 'dem'],
  'thu-tuong': [5, 'ghim-trong', 'qua-cau', 'cuon-chieu', 'ngo-mon', 'dem'],
  // Lập pháp — từ đại biểu HĐND tới Quốc hội
  'dai-bieu-hdnd-xa': [2, 'ghim-sen', 'hom-phieu', 'so-tay', 'chua-mot-cot', 'trua'],
  'dai-bieu-hdnd-tinh': [3, 'khan-lua', 'hom-phieu', 'bo-luat', 'quoc-hoi', 'ban-mai'],
  'dai-bieu-quoc-hoi': [5, 'ghim-can', 'micro', 'bo-luat', 'quoc-hoi', 'trua'],
  'uy-vien-ubtvqh': [1, 'ghim-sach', 'micro', 'chong-sach', 'quoc-hoi', 'hoang-hon'],
  'pho-chu-tich-qh': [2, 'ghim-sen', 'binh-sen', 'cuon-chieu', 'khue-van-cac', 'dem'],
  'chu-tich-qh': [3, 'ghim-trong', 'micro', 'den-ban', 'quoc-hoi', 'dem'],
  // Xét xử — thư ký, thẩm tra viên, thẩm phán, chánh án
  'thu-ky-toa-an': [3, 'khong', 'so-tay', 'ho-so-vu-an', 'toa-an', 'ban-mai'],
  'tham-tra-vien': [0, 'ghim-sach', 'kinh-lup', 'ho-so-vu-an', 'sach-luat', 'trua'],
  'tham-phan': [1, 'khong', 'can-can', 'ho-so-vu-an', 'toa-an', 'hoang-hon'],
  'chanh-an-tinh': [0, 'ghim-can', 'can-can', 'bo-luat', 'toa-an', 'ban-mai'],
  'tham-phan-tc': [2, 'ghim-can', 'but-nghien', 'can-can', 'sach-luat', 'trua'],
  'chanh-an-tc': [1, 'ghim-trong', 'can-can', 'cuon-chieu', 'bia-tien-si', 'dem'],
  // Kiểm sát
  'kiem-tra-vien': [0, 'khong', 'kinh-lup', 'so-tay', 'toa-an', 'trua'],
  'kiem-sat-vien': [1, 'ghim-can', 'kinh-lup', 'cap-ho-so', 'sach-luat', 'ban-mai'],
  'vien-truong-tinh': [0, 'ghim-sach', 'cap-ho-so', 'but-nghien', 'toa-an', 'hoang-hon'],
  'kiem-sat-vien-tc': [2, 'ghim-sen', 'kinh-lup', 'bo-luat', 'khue-van-cac', 'hoang-hon'],
  'vien-truong-tc': [1, 'ghim-trong', 'kinh-lup', 'den-ban', 'bia-tien-si', 'dem'],
  // Đỉnh chung
  'chu-tich-nuoc': [1, 'ghim-trong', 'trong-mini', 'binh-sen', 'ngo-mon', 'dem'],
};

/** id chức → [hoạ tiết vải, kiểu cổ]; không khai báo = vải trơn, cà vạt/cổ mặc định. */
const FABRIC: Record<string, [PatternId, NeckId]> = {
  'pho-chu-tich-xa': ['soc-doc', 'mac-dinh'], 'chu-tich-xa': ['ca-ro', 'mac-dinh'], 'giam-doc-so': ['soc-chi', 'mac-dinh'], 'chu-tich-tinh': ['tron', 'no'],
  'vu-truong': ['soc-chi', 'mac-dinh'], 'thu-truong': ['tron', 'no'], 'bo-truong': ['cham', 'mac-dinh'], 'pho-thu-tuong': ['soc-doc', 'mac-dinh'], 'thu-tuong': ['soc-chi', 'no'],
  'dai-bieu-hdnd-xa': ['soc-doc', 'mac-dinh'], 'dai-bieu-hdnd-tinh': ['ca-ro', 'mac-dinh'], 'dai-bieu-quoc-hoi': ['soc-chi', 'mac-dinh'], 'uy-vien-ubtvqh': ['tron', 'no'],
  'pho-chu-tich-qh': ['soc-doc', 'mac-dinh'], 'chu-tich-qh': ['ca-ro', 'mac-dinh'], 'thu-ky-toa-an': ['ca-ro', 'mac-dinh'], 'tham-tra-vien': ['soc-doc', 'mac-dinh'],
  'tham-phan-tc': ['soc-doc', 'mac-dinh'], 'chanh-an-tc': ['cham', 'mac-dinh'], 'kiem-sat-vien': ['soc-doc', 'mac-dinh'], 'vien-truong-tinh': ['soc-chi', 'no'],
  'kiem-sat-vien-tc': ['ca-ro', 'mac-dinh'], 'vien-truong-tc': ['cham', 'mac-dinh'], 'chu-tich-nuoc': ['soc-chi', 'mac-dinh'],
};

export function lookFor(postId: string | null): Look {
  const post = postId ? POSTS.find((p) => p.id === postId) ?? null : null;
  const row = post ? TABLE[post.id] ?? CITIZEN : CITIZEN;
  const [tone, adorn, propL, propR, backdrop, sky] = row;
  const [pattern, neck] = (post && FABRIC[post.id]) || (['tron', 'mac-dinh'] as [PatternId, NeckId]);
  return {
    id: post?.id ?? 'cong-dan', outfit: outfitFor(post), tone, pattern, neck, adorn, propL, propR, backdrop, sky,
    material: post ? MATERIAL[post.tier] : 'go', light: post ? LIGHT[post.tier] : 'khong',
  };
}

/** Chữ ký để so sánh tổ hợp (test, và để tránh vẽ lại khi không đổi). */
export const lookSignature = (l: Look): string => [l.outfit, l.tone, l.pattern, l.neck, l.adorn, l.propL, l.propR, l.backdrop, l.sky, l.material, l.light].join('|');
