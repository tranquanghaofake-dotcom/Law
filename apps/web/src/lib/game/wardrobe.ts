// Trang phục chân dung theo chức danh (spec thăng chức §3.4, §3.8) và tủ đồ mở khoá.
// Căn cứ trang phục: Thẩm phán xét xử mặc áo choàng dài tay màu đen (NQ 1214/2016/UBTVQH13, QĐ 1738/QĐ-TANDTC 2017);
// ngành Kiểm sát gam xanh dương, cấp hiệu nền đỏ trên vai (vẽ cầu vai đỏ trơn, không sao/biểu tượng thật);
// các chức danh không có đồng phục riêng: trang phục công sở / vest. Không mô phỏng cấp hiệu, phù hiệu, Quốc huy.
import { POSTS, type Post, type PostTier } from './career';

export type Avatar = { outfit: string; hair: string; accessory: string; effect: string };
export const DEFAULT_AVATAR: Avatar = { outfit: 'theo-chuc-vu', hair: 'ngan', accessory: 'khong', effect: 'khong' };

export const NAMES: Record<string, string> = {
  'theo-chuc-vu': 'Theo chức vụ', 'thuong-phuc': 'Thường phục', 'ao-dai': 'Áo dài',
  'cong-so': 'Công sở', 'vest-xanh': 'Vest xanh than', 'vest-den': 'Vest đen', 'ao-choang': 'Áo choàng xét xử', 'ks-xuan-he': 'Trang phục kiểm sát (xuân hè)', 'ks-thu-dong': 'Trang phục kiểm sát (thu đông)',
  ngan: 'Tóc ngắn', dai: 'Tóc dài', buoc: 'Tóc buộc',
  khong: 'Cán cân (mặc định)', kinh: 'Kính', but: 'Bút cài túi', so: 'Chồng sách luật', cap: 'Cặp tài liệu', 'huy-hieu': 'Huy hiệu cài áo',
  nang: 'Đèn rọi sáng', 'trong-dong': 'Vách trống đồng', 'khung-vang': 'Khung mạ vàng', 'hat-sang': 'Hạt sáng trong kính',
};

const RANK: Record<PostTier, number> = { 'co-so': 0, tinh: 1, 'trung-uong': 2, 'lanh-dao': 3 };

/** Trang phục của chức danh (null = Công dân). */
export function outfitFor(post: Post | null): string {
  if (!post) return 'thuong-phuc';
  if (post.branch === 'xet-xu') return ['thu-ky-toa-an', 'tham-tra-vien'].includes(post.id) ? 'cong-so' : 'ao-choang';
  if (post.branch === 'kiem-sat') return post.id.startsWith('vien-truong') ? 'ks-thu-dong' : 'ks-xuan-he';
  if (post.tier === 'co-so') return 'cong-so';
  return post.tier === 'tinh' ? 'vest-xanh' : 'vest-den';
}

export function resolveOutfit(choice: string, post: Post | null): string {
  return choice === 'theo-chuc-vu' ? outfitFor(post) : choice;
}

export function unlocked(achieved: Set<string>): { outfit: string[]; hair: string[]; accessory: string[]; effect: string[] } {
  const posts = POSTS.filter((p) => achieved.has(p.id));
  const n = posts.length;
  const top = posts.reduce((m, p) => Math.max(m, RANK[p.tier]), -1);
  const outfit = ['theo-chuc-vu', 'thuong-phuc'];
  if (top >= 1) outfit.push('ao-dai');
  const accessory = ['khong', 'kinh'];
  if (n >= 1) accessory.push('but');
  if (n >= 2) accessory.push('so');
  if (n >= 3) accessory.push('cap');
  if (top >= 1) accessory.push('huy-hieu');
  const effect = ['khong'];
  if (n >= 1) effect.push('nang');
  if (top >= 1) effect.push('trong-dong');
  if (top >= 2) effect.push('khung-vang');
  if (top >= 3) effect.push('hat-sang');
  return { outfit, hair: ['ngan', 'dai', 'buoc'], accessory, effect };
}

export function sanitize(a: Avatar, achieved: Set<string>): Avatar {
  const u = unlocked(achieved);
  return {
    outfit: u.outfit.includes(a.outfit) ? a.outfit : DEFAULT_AVATAR.outfit,
    hair: u.hair.includes(a.hair) ? a.hair : DEFAULT_AVATAR.hair,
    accessory: u.accessory.includes(a.accessory) ? a.accessory : DEFAULT_AVATAR.accessory,
    effect: u.effect.includes(a.effect) ? a.effect : DEFAULT_AVATAR.effect,
  };
}
