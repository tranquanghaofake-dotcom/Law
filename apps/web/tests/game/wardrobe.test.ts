import { describe, expect, it } from 'vitest';
import { unlocked, sanitize, outfitFor, resolveOutfit, DEFAULT_AVATAR, NAMES, OUTFITS } from '$lib/game/wardrobe';
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
  it('trang phục truyền thống mở theo tiến độ: bà ba (2 chức) → tứ thân (4 chức) → áo dài + khăn đóng (cấp tỉnh) → nhật bình (trung ương)', () => {
    const ids = POSTS.map((p) => p.id);
    expect(unlocked(new Set(ids.slice(0, 1))).outfit).not.toContain('ba-ba');
    expect(unlocked(new Set(ids.slice(0, 2))).outfit).toContain('ba-ba');
    expect(unlocked(new Set(['cong-chuc-xa', 'pho-chu-tich-xa', 'chu-tich-xa'])).outfit).not.toContain('tu-than');
    const tinh = unlocked(new Set(['cong-chuc-xa', 'pho-chu-tich-xa', 'chu-tich-xa', 'chuyen-vien-so', 'giam-doc-so']));
    expect(tinh.outfit).toEqual(expect.arrayContaining(['ba-ba', 'tu-than', 'ao-dai', 'ao-dai-nam']));
    expect(tinh.outfit).not.toContain('nhat-binh');
    expect(unlocked(new Set(ids.filter((id) => POSTS.find((p) => p.id === id)!.tier !== 'lanh-dao'))).outfit).toContain('nhat-binh');
  });
  it('mọi trang phục mở khoá đều có tên hiển thị', () => {
    const u = unlocked(new Set(POSTS.map((p) => p.id)));
    for (const o of u.outfit) expect(NAMES[o], o).toBeTruthy();
  });
  it('sanitize trang phục mới: giữ khi đã mở khoá, trả về theo-chuc-vu khi chưa', () => {
    const two = new Set(['cong-chuc-xa', 'pho-chu-tich-xa']);
    expect(sanitize({ ...DEFAULT_AVATAR, outfit: 'ba-ba' }, two).outfit).toBe('ba-ba');
    expect(sanitize({ ...DEFAULT_AVATAR, outfit: 'tu-than' }, two).outfit).toBe('theo-chuc-vu');
    const four = new Set(['cong-chuc-xa', 'pho-chu-tich-xa', 'chu-tich-xa', 'chuyen-vien-so']);
    expect(sanitize({ ...DEFAULT_AVATAR, outfit: 'tu-than' }, four).outfit).toBe('tu-than');
    expect(sanitize({ ...DEFAULT_AVATAR, outfit: 'ba-ba' }, new Set()).outfit).toBe('theo-chuc-vu');
    expect(sanitize({ ...DEFAULT_AVATAR, outfit: 'nhat-binh' }, four).outfit).toBe('theo-chuc-vu');
  });
  it('OUTFITS gồm đúng các trang phục mà unlocked có thể mở', () => {
    const all = unlocked(new Set(POSTS.map((p) => p.id))).outfit;
    expect([...OUTFITS].sort()).toEqual([...all].sort());
  });
});
