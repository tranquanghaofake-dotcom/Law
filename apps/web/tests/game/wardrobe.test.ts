import { describe, expect, it } from 'vitest';
import { unlocked, sanitize, outfitFor, resolveOutfit, DEFAULT_AVATAR } from '$lib/game/wardrobe';
import { POSTS } from '$lib/game/career';

const post = (id: string) => POSTS.find((p) => p.id === id) ?? null;

describe('trang phục theo chức danh', () => {
  it('Công dân mặc thường phục; công chức cơ sở, thư ký, thẩm tra viên mặc công sở', () => {
    expect(outfitFor(null)).toBe('thuong-phuc');
    for (const id of ['cong-chuc-xa', 'thu-ky-toa-an', 'tham-tra-vien', 'dai-bieu-hdnd-xa']) expect(outfitFor(post(id)), id).toBe('cong-so');
  });
  it('Thẩm phán trở lên mặc áo choàng đen; kiểm sát mặc trang phục ngành, lãnh đạo mặc thu đông', () => {
    for (const id of ['tham-phan', 'chanh-an-tinh', 'tham-phan-tc', 'chanh-an-tc']) expect(outfitFor(post(id)), id).toBe('ao-choang');
    for (const id of ['kiem-tra-vien', 'kiem-sat-vien', 'kiem-sat-vien-tc']) expect(outfitFor(post(id)), id).toBe('ks-xuan-he');
    for (const id of ['vien-truong-tinh', 'vien-truong-tc']) expect(outfitFor(post(id)), id).toBe('ks-thu-dong');
  });
  it('hành pháp và lập pháp: cấp tỉnh vest xanh than; trung ương trở lên và Chủ tịch nước vest đen', () => {
    expect(outfitFor(post('chu-tich-tinh'))).toBe('vest-xanh');
    expect(outfitFor(post('dai-bieu-hdnd-tinh'))).toBe('vest-xanh');
    for (const id of ['bo-truong', 'thu-tuong', 'dai-bieu-quoc-hoi', 'chu-tich-nuoc']) expect(outfitFor(post(id)), id).toBe('vest-den');
  });
  it('mọi chức danh có trang phục', () => {
    for (const p of POSTS) expect(outfitFor(p), p.id).toBeTruthy();
  });
});

describe('tủ đồ', () => {
  it('Công dân: theo chức vụ (= thường phục) và thường phục; chưa có áo dài', () => {
    const u = unlocked(new Set());
    expect(u.outfit).toEqual(['theo-chuc-vu', 'thuong-phuc']);
    expect(u.hair).toEqual(['ngan', 'dai', 'buoc']);
    expect(u.effect).toEqual(['khong']);
  });
  it('cấp tỉnh mở áo dài, huy hiệu, nền trống đồng', () => {
    const u = unlocked(new Set(['cong-chuc-xa', 'pho-chu-tich-xa', 'chu-tich-xa', 'chuyen-vien-so']));
    expect(u.outfit).toContain('ao-dai');
    expect(u.accessory).toContain('huy-hieu');
    expect(u.effect).toContain('trong-dong');
  });
  it('resolveOutfit: "theo chức vụ" lấy trang phục của chức đang hiển thị; lựa chọn bị khoá rơi về mặc định', () => {
    expect(resolveOutfit('theo-chuc-vu', post('tham-phan'))).toBe('ao-choang');
    expect(resolveOutfit('thuong-phuc', post('tham-phan'))).toBe('thuong-phuc');
    expect(sanitize({ ...DEFAULT_AVATAR, outfit: 'ao-dai', effect: 'hat-sang' }, new Set())).toMatchObject({ outfit: 'theo-chuc-vu', effect: 'khong' });
  });
});
