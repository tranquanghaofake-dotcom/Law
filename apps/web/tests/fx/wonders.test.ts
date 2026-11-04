import { describe, expect, it } from 'vitest';
import { WONDERS, loadWonder, pickWonderId } from '$lib/fx/wonders';
import { pickStrokes, strokesPerCorrect } from '$lib/fx/wonders/lighting';
import { COMBO_COLORS, edgeGlow, glowLevel } from '$lib/ui/session/combo';
import { comboSfxPlan } from '$lib/fx/comboSfx';
import { readdirSync } from 'node:fs';

describe('mốc chuỗi và viền sáng', () => {
  it('mốc 1/2/3/5/8/13', () => {
    expect([0, 1, 2, 3, 4, 5, 7, 8, 12, 13, 40].map(glowLevel)).toEqual([0, 1, 2, 3, 3, 4, 4, 5, 5, 6, 6]);
  });
  it('bốn mốc đầu đi hết dải bậc màu Đỏ → Xanh lam → Tím → Trắng–đen; viền dày và đậm dần', () => {
    expect([1, 2, 3, 5].map((c) => edgeGlow(c).tier)).toEqual(['do', 'lam', 'tim', 'trang-den']);
    const e = [1, 2, 3, 5, 8, 13].map(edgeGlow);
    for (let i = 1; i < e.length; i++) {
      expect(e[i].width).toBeGreaterThan(e[i - 1].width);
      expect(e[i].blur).toBeGreaterThan(e[i - 1].blur);
      expect(e[i].alpha).toBeGreaterThan(e[i - 1].alpha);
    }
    expect(e[5].tier).toBe('trang-den');
  });
  it('sai (chuỗi 0) → tắt', () => {
    expect(edgeGlow(0)).toEqual({ level: 0, tier: null, width: 0, blur: 0, alpha: 0 });
  });
  it('mọi bậc đều có màu', () => {
    for (const t of ['do', 'lam', 'tim', 'trang-den'] as const) expect(COMBO_COLORS[t].line).toMatch(/^#/);
  });
});

describe('chọn nét sáng', () => {
  const seq = (...v: number[]) => { let i = 0; return () => v[i++ % v.length]; };
  it('số nét thêm tăng theo mốc', () => {
    expect([0, 1, 2, 3, 5, 8, 13].map(strokesPerCorrect)).toEqual([0, 3, 4, 5, 7, 9, 12]);
  });
  it('không trùng, không chọn nét đã sáng, đủ số lượng', () => {
    const got = pickStrokes(10, [0, 1, 2], 4, seq(0.1, 0.9, 0.5, 0.3));
    expect(got).toHaveLength(4);
    expect(new Set(got).size).toBe(4);
    for (const g of got) { expect(g).toBeGreaterThanOrEqual(3); expect(g).toBeLessThan(10); }
  });
  it('xác định theo seed và khác nhau khi seed khác', () => {
    expect(pickStrokes(30, [], 5, seq(0.2, 0.7, 0.4))).toEqual(pickStrokes(30, [], 5, seq(0.2, 0.7, 0.4)));
    expect(pickStrokes(30, [], 5, seq(0.2, 0.7, 0.4))).not.toEqual(pickStrokes(30, [], 5, seq(0.9, 0.1, 0.6)));
  });
  it('còn ít hơn yêu cầu → chỉ trả phần còn lại; hết → rỗng; rand=0.999… không tràn', () => {
    expect(pickStrokes(5, [0, 1, 2], 10, () => 0.999999).sort()).toEqual([3, 4]);
    expect(pickStrokes(3, [0, 1, 2], 2, Math.random)).toEqual([]);
    expect(pickStrokes(3, [], 0, Math.random)).toEqual([]);
  });
  it('điền dần đủ mọi nét', () => {
    const lit: number[] = [];
    while (lit.length < 40) lit.push(...pickStrokes(40, lit, 7, Math.random));
    expect(new Set(lit).size).toBe(40);
  });
});

describe('kỳ quan', () => {
  it('registry: mỗi kỳ quan có đủ trường, ≥ 30 nét, viewBox và id khớp', async () => {
    expect(WONDERS).toHaveLength(6);
    for (const e of WONDERS) {
      const w = await e.load();
      expect(w.id).toBe(e.id);
      expect(w.name.length).toBeGreaterThan(2);
      expect(w.place.length).toBeGreaterThan(2);
      expect(w.viewBox).toBe('0 0 800 600');
      expect(w.paths.length).toBeGreaterThanOrEqual(30);
      for (const d of w.paths) expect(d).toMatch(/^M[-\d. ]/);
    }
  });
  it('pickWonderId theo rand tiêm vào; loadWonder id lạ rơi về kỳ quan đầu', async () => {
    expect(pickWonderId(() => 0)).toBe(WONDERS[0].id);
    expect(pickWonderId(() => 0.9999)).toBe(WONDERS[WONDERS.length - 1].id);
    expect((await loadWonder('khong-co')).id).toBe(WONDERS[0].id);
  });
});

describe('âm thanh theo mốc', () => {
  const sig = (c: number) => JSON.stringify(comboSfxPlan(c));
  it('mỗi mốc một cách ghép khác nhau; giữa hai mốc giữ nguyên', () => {
    const sigs = [1, 2, 3, 5, 8, 13].map(sig);
    expect(new Set(sigs).size).toBe(6);
    expect(sig(4)).toBe(sig(3));
    expect(sig(20)).toBe(sig(13));
    expect(comboSfxPlan(0)).toEqual([]);
  });
  it('từ mốc 2 chồng ≥ 2 lớp, mốc 13 chồng ≥ 4 lớp, dùng tệp có sẵn', () => {
    expect(comboSfxPlan(2).length).toBeGreaterThanOrEqual(2);
    expect(comboSfxPlan(13).length).toBeGreaterThanOrEqual(4);
    const have = readdirSync('static/sfx').filter((f) => f.endsWith('.ogg')).map((f) => f.replace(/\.ogg$/, ''));
    for (const c of [1, 2, 3, 5, 8, 13]) for (const l of comboSfxPlan(c)) expect(have).toContain(l.file);
  });
});
