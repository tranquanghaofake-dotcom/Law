import { describe, expect, it } from 'vitest';
import { unlocked, sanitize, DEFAULT_AVATAR } from '$lib/game/wardrobe';

describe('tủ đồ chân dung', () => {
  it('Công dân chỉ có đồ mặc định', () => {
    const u = unlocked(new Set());
    expect(u.outfit).toEqual(['so-mi']);
    expect(u.effect).toEqual(['khong']);
    expect(u.accessory).toEqual(['khong', 'kinh']);
  });
  it('mở khoá theo chức: thẩm phán → áo choàng; cấp tỉnh → áo dài, huy hiệu, trống đồng', () => {
    const u = unlocked(new Set(['thu-ky-toa-an', 'tham-tra-vien', 'tham-phan', 'chanh-an-tinh']));
    expect(u.outfit).toContain('ao-choang');
    expect(u.outfit).toContain('ao-dai');
    expect(u.accessory).toContain('huy-hieu');
    expect(u.effect).toContain('trong-dong');
    expect(u.effect).not.toContain('khung-vang');
  });
  it('lựa chọn bị khoá rơi về mặc định', () => {
    expect(sanitize({ ...DEFAULT_AVATAR, outfit: 'ao-choang', effect: 'hat-sang' }, new Set())).toMatchObject({ outfit: 'so-mi', effect: 'khong' });
  });
});
