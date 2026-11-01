// Tủ đồ chân dung (spec thăng chức §3.4): trang phục, phụ kiện, nền mở khoá theo chức danh đã đạt. Không mô phỏng cấp hiệu, phù hiệu thật.
import { POSTS, type PostTier } from './career';

export type Avatar = { outfit: string; hair: string; accessory: string; effect: string };
export const DEFAULT_AVATAR: Avatar = { outfit: 'so-mi', hair: 'ngan', accessory: 'khong', effect: 'khong' };

export const NAMES: Record<string, string> = {
  'so-mi': 'Sơ mi', vest: 'Vest', 'ao-choang': 'Áo choàng xét xử (giản lược)', 'dong-phuc-ks': 'Đồng phục kiểm sát (giản lược)', 'ao-dai': 'Áo dài',
  ngan: 'Tóc ngắn', dai: 'Tóc dài',
  khong: 'Không', kinh: 'Kính', but: 'Bút cài túi', so: 'Sổ tay', cap: 'Cặp tài liệu', 'huy-hieu': 'Huy hiệu cài áo',
  nang: 'Nắng sớm', 'trong-dong': 'Mặt trống đồng', 'khung-vang': 'Khung mạ vàng', 'hat-sang': 'Hạt sáng',
};

const RANK: Record<PostTier, number> = { 'co-so': 0, tinh: 1, 'trung-uong': 2, 'lanh-dao': 3 };

export function unlocked(achieved: Set<string>): { outfit: string[]; hair: string[]; accessory: string[]; effect: string[] } {
  const posts = POSTS.filter((p) => achieved.has(p.id));
  const n = posts.length;
  const top = posts.reduce((m, p) => Math.max(m, RANK[p.tier]), -1);
  const outfit = ['so-mi'];
  if (n >= 1) outfit.push('vest');
  if (achieved.has('tham-phan')) outfit.push('ao-choang');
  if (achieved.has('kiem-sat-vien')) outfit.push('dong-phuc-ks');
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
  return { outfit, hair: ['ngan', 'dai'], accessory, effect };
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
