import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Lỗi Hồ sơ "lướt xuống không được": khung tủ trưng bày dính có max-height + overflow-y + overscroll-behavior: contain
// nên lăn/vuốt trên khung chỉ cuộn bên trong rồi chặn không cho trang cuộn tiếp. Giữ CSS không tái phạm.
const css = readFileSync(join(__dirname, '../../src/app.css'), 'utf8');
const rules = (sel: string) => [...css.matchAll(new RegExp(`(^|\\n|\\{\\s*|\\})\\s*${sel.replace(/[.]/g, '\\.')}\\s*\\{([^}]*)\\}`, 'g'))].map((m) => m[2]);

describe('Hồ sơ: không bẫy cuộn, hover chỉ cho chuột thật', () => {
  it('.cs-show không có overflow/max-height/overscroll-behavior', () => {
    const body = rules('.cs-show').join(';');
    expect(body).not.toMatch(/overflow|max-height|overscroll-behavior/);
  });
  it('hiệu ứng :hover của tủ trưng bày và gáy sách nằm trong @media (hover: hover)', () => {
    const bad = css.split('\n').filter((l) => /(\.showcase|\.bk-spine)[^{]*:hover/.test(l) && !l.includes('@media (hover: hover)'));
    expect(bad).toEqual([]);
  });
});
