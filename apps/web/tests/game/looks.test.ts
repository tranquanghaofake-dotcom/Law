import { describe, expect, it } from 'vitest';
import { POSTS } from '$lib/game/career';
import { outfitFor } from '$lib/game/wardrobe';
import { ADORNS, BACKDROPS, PROPS, SKIES, TONES, lookFor, lookSignature, type Look } from '$lib/game/looks';

const ids: (string | null)[] = [null, ...POSTS.map((p) => p.id)];
const all = ids.map((id) => lookFor(id));
const DIMS: (keyof Look)[] = ['outfit', 'tone', 'adorn', 'propL', 'propR', 'backdrop', 'sky'];
const dist = (a: Look, b: Look) => DIMS.filter((k) => a[k] !== b[k]).length;

describe('lookFor — tổ hợp tủ trưng bày cho 29 chức + Công dân', () => {
  it('đủ 30 tổ hợp, mỗi chức một chữ ký khác nhau', () => {
    expect(all).toHaveLength(30);
    expect(new Set(all.map(lookSignature)).size).toBe(30);
  });
  it('hai chức bất kỳ khác nhau ít nhất 3 trong 7 chiều nhìn thấy (trang phục, màu, phụ kiện, hai đồ vật, phông, trời)', () => {
    const bad: string[] = [];
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (dist(all[i], all[j]) < 3) bad.push(`${all[i].id} ~ ${all[j].id}`);
    expect(bad).toEqual([]);
  });
  it('Công dân (null) là thường phục; id không biết cũng rơi về Công dân', () => {
    expect(lookFor(null).outfit).toBe('thuong-phuc');
    expect(lookFor(null).id).toBe('cong-dan');
    expect(lookFor('khong-co-chuc-nay').id).toBe('cong-dan');
  });
  it('trang phục khớp wardrobe.outfitFor (theo chức vụ)', () => {
    for (const p of POSTS) expect(lookFor(p.id).outfit, p.id).toBe(outfitFor(p));
  });
  it('mọi giá trị nằm trong danh mục đã vẽ', () => {
    for (const l of all) {
      expect(PROPS, l.id).toContain(l.propL); expect(PROPS, l.id).toContain(l.propR);
      expect(BACKDROPS, l.id).toContain(l.backdrop);
      expect(SKIES, l.id).toContain(l.sky);
      expect(ADORNS, l.id).toContain(l.adorn);
      expect(l.tone, l.id).toBeGreaterThanOrEqual(0); expect(l.tone, l.id).toBeLessThan(TONES[l.outfit]);
      expect(l.propL, l.id).not.toBe(l.propR);
    }
  });
  it('chất liệu bục và ánh sáng lên theo tầng: cơ sở gỗ → tỉnh đồng → trung ương vàng → lãnh đạo vàng sáng', () => {
    expect(lookFor('cong-chuc-xa').material).toBe('go');
    expect(lookFor('chu-tich-tinh').material).toBe('dong');
    expect(lookFor('bo-truong').material).toBe('vang');
    expect(lookFor('thu-tuong').material).toBe('vang-sang');
    expect(lookFor(null).material).toBe('go');
    expect(lookFor('chu-tich-nuoc').material).toBe('vang-sang');
    expect(lookFor('cong-chuc-xa').light).toBe('khong');
    expect(lookFor('chu-tich-nuoc').light).toBe('hat-sang');
  });
  it('không dùng cờ, Quốc huy, quân hàm, sao vàng trong danh mục', () => {
    for (const n of [...PROPS, ...BACKDROPS, ...ADORNS]) expect(n).not.toMatch(/^co-|-co-|quoc-huy|quan-ham|sao-vang/);
  });
});
