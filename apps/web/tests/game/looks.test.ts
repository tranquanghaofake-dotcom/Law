import { describe, expect, it } from 'vitest';
import { POSTS } from '$lib/game/career';
import { outfitFor } from '$lib/game/wardrobe';
import { TONE_PALETTES } from '$lib/art/showcase/tones';
import { ADORNS, BACKDROPS, NECKS, PATTERNS, PROPS, SKIES, TONES, lookFor, lookSignature, type Look } from '$lib/game/looks';

const ids: (string | null)[] = [null, ...POSTS.map((p) => p.id)];
const all = ids.map((id) => lookFor(id));
const DIMS: (keyof Look)[] = ['outfit', 'tone', 'pattern', 'neck', 'adorn', 'propL', 'propR', 'backdrop', 'sky'];
const dist = (a: Look, b: Look) => DIMS.filter((k) => a[k] !== b[k]).length;

describe('lookFor — tổ hợp tủ trưng bày cho 29 chức + Công dân', () => {
  it('đủ 30 tổ hợp, mỗi chức một chữ ký khác nhau', () => {
    expect(all).toHaveLength(30);
    expect(new Set(all.map(lookSignature)).size).toBe(30);
  });
  it('hai chức bất kỳ khác nhau ít nhất 3 trong 9 chiều nhìn thấy (trang phục, màu, hoạ tiết, kiểu cổ, phụ kiện, hai đồ vật, phông, trời)', () => {
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
      expect(PATTERNS, l.id).toContain(l.pattern); expect(NECKS, l.id).toContain(l.neck);
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
  it('bảng màu vẽ (art/showcase/tones) khớp số biến thể khai báo ở looks', () => {
    expect(Object.keys(TONE_PALETTES).sort()).toEqual(Object.keys(TONES).sort());
    for (const k of Object.keys(TONES)) expect(TONE_PALETTES[k], k).toHaveLength(TONES[k]);
  });
  it('không dùng cờ, Quốc huy, quân hàm, sao vàng trong danh mục', () => {
    for (const n of [...PROPS, ...BACKDROPS, ...ADORNS]) expect(n).not.toMatch(/^co-|-co-|quoc-huy|quan-ham|sao-vang/);
  });
  // Đợt 10: phông = nơi làm việc thật của chức danh (không chọn ngẫu hứng cho đa dạng); trang phục càng cao càng trang trọng.
  const WORKPLACE = (p: (typeof POSTS)[number]): string[] => {
    if (p.branch === 'xet-xu') return ['toa-an', 'phap-dinh'];
    if (p.branch === 'kiem-sat') return ['vien-kiem-sat', 'phap-dinh'];
    if (p.branch === 'nguyen-thu') return ['phu-chu-tich'];
    if (p.tier === 'co-so') return ['tru-so-xa'];
    if (p.tier === 'tinh') return ['tru-so-tinh'];
    return p.branch === 'lap-phap' ? ['quoc-hoi'] : ['tru-so-bo'];
  };
  it('đợt 10: phông là nơi làm việc của chức (xã → trụ sở xã, tỉnh → trụ sở tỉnh, bộ/Chính phủ, Quốc hội, Tòa án, Viện kiểm sát, dinh thự nguyên thủ)', () => {
    for (const p of POSTS) expect(WORKPLACE(p), p.id).toContain(lookFor(p.id).backdrop);
  });
  it('đợt 10: đồng phục ngành (áo choàng xét xử, kiểm sát) trơn, cổ mặc định, không cài ghim trang trí', () => {
    for (const p of POSTS) {
      const l = lookFor(p.id);
      if (!['ao-choang', 'ks-xuan-he', 'ks-thu-dong'].includes(l.outfit)) continue;
      expect([l.pattern, l.neck, l.adorn], p.id).toEqual(['tron', 'mac-dinh', 'khong']);
    }
  });
  it('đợt 10: không nơ bướm cho chức danh nhà nước; chấm bi/kẻ ca-rô chỉ ở cấp cơ sở; trung ương trở lên vải trơn hoặc sọc chỉ', () => {
    for (const p of POSTS) {
      const l = lookFor(p.id);
      expect(l.neck, p.id).not.toBe('no');
      if (p.tier !== 'co-so') expect(['cham', 'ca-ro'], p.id).not.toContain(l.pattern);
      if (p.tier === 'trung-uong' || p.tier === 'lanh-dao') expect(['tron', 'soc-chi'], p.id).toContain(l.pattern);
    }
  });
  it('đợt 10: đồ vật trên bục đúng nghề — xét xử có cán cân hoặc hồ sơ vụ án; kiểm sát có kính lúp/hồ sơ; lập pháp có hòm phiếu/micro/bộ luật/cuộn chiếu', () => {
    const need: Record<string, string[]> = { 'xet-xu': ['can-can', 'ho-so-vu-an'], 'kiem-sat': ['kinh-lup', 'ho-so-vu-an', 'cap-ho-so'], 'lap-phap': ['hom-phieu', 'micro', 'bo-luat', 'cuon-chieu'] };
    for (const p of POSTS) {
      const want = need[p.branch]; if (!want) continue;
      const l = lookFor(p.id);
      expect(want.some((w) => w === l.propL || w === l.propR), p.id).toBe(true);
    }
  });
});
