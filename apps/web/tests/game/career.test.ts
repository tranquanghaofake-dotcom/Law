import { describe, expect, it } from 'vitest';
import { POSTS, BRANCHES, careerState, satisfies, totalNeed, type Post } from '$lib/game/career';
import { FIELDS, FUTURE_FIELDS, type Field } from '$lib/game/fields';
import type { BookLevel } from '$lib/game/books';

type B = { field: Field; level: BookLevel };
const many = (field: Field, level: BookLevel, n: number): B[] => Array.from({ length: n }, () => ({ field, level }));
// toàn bộ 26 chương hiện có ở cấp 3 (HP 12 chương, CK 10, LS 4)
const CURRENT_FIELDS: Field[] = ['hien-phap', 'hien-phap', 'hien-phap', 'quyen-cong-dan', 'quyen-cong-dan', 'bau-cu', 'lap-phap', 'nguyen-thu', 'hanh-phap', 'tu-phap', 'dia-phuong', 'kinh-te-tai-chinh', ...Array(10).fill('kinh-te-tai-chinh'), ...Array(4).fill('lich-su')];
const allCurrent = (level: BookLevel): B[] => CURRENT_FIELDS.map((field) => ({ field, level }));
const branchPosts = (b: string) => POSTS.filter((p) => p.branch === b);

describe('thăng chức theo bộ máy nhà nước', () => {
  it('chưa có sách: mọi người là Công dân, chưa đạt chức nào', () => {
    const s = careerState([]);
    expect(s.achieved.size).toBe(0);
    for (const b of BRANCHES) expect(s.highest[b]).toBeNull();
  });
  it('chức đầu mỗi nhánh làm được bằng nội dung hiện có ở cấp 1', () => {
    const s = careerState(allCurrent(1));
    for (const b of BRANCHES) expect(s.achieved.has(branchPosts(b)[0].id), b).toBe(true);
  });
  it('mỗi nhánh khó dần: tổng số sách và cấp tối thiểu không giảm theo thang', () => {
    for (const b of BRANCHES) {
      const ps = branchPosts(b);
      for (let i = 1; i < ps.length; i++) {
        expect(totalNeed(ps[i]), ps[i].id).toBeGreaterThan(totalNeed(ps[i - 1]));
        expect(Math.min(...ps[i].reqs.map((r) => r.level)), ps[i].id).toBeGreaterThanOrEqual(Math.min(...ps[i - 1].reqs.map((r) => r.level)));
      }
    }
  });
  it('từ cấp tỉnh: mọi sách ≥ cấp 2 và ≥ 15 cuốn; trung ương trở lên: mọi sách cấp 3', () => {
    for (const p of POSTS) {
      if (p.tier !== 'co-so') { expect(p.reqs.every((r) => r.level >= 2), p.id).toBe(true); expect(totalNeed(p), p.id).toBeGreaterThanOrEqual(15); }
      if (p.tier === 'trung-uong' || p.tier === 'lanh-dao') expect(p.reqs.every((r) => r.level === 3), p.id).toBe(true);
    }
  });
  it('dù toàn bộ nội dung hiện có đạt cấp 3: chưa lên được chức cấp tỉnh ở Hành pháp, Xét xử, Kiểm sát (chờ môn mới); không ai tới Chủ tịch nước', () => {
    const s = careerState(allCurrent(3));
    for (const b of ['hanh-phap', 'xet-xu', 'kiem-sat'] as const) expect(POSTS.filter((p) => p.branch === b && p.tier !== 'co-so').some((p) => s.achieved.has(p.id)), b).toBe(false);
    expect(s.achieved.has('chu-tich-nuoc')).toBe(false);
    expect(s.next['hanh-phap']?.missing.some((m) => m.future)).toBe(true);
  });
  it('lên tuần tự: thiếu chức dưới thì không giữ chức trên dù đủ sách', () => {
    const books = [...many('dia-phuong', 3, 5), ...many('hien-phap', 3, 10), ...many('quyen-cong-dan', 3, 5), ...many('hanh-phap', 3, 3), ...many('hanh-chinh', 3, 20), ...many('kinh-te-tai-chinh', 3, 20), ...many('dat-dai', 3, 5), ...many('lich-su', 3, 40)];
    const s = careerState(books);
    const hp = branchPosts('hanh-phap');
    let gap = false;
    for (const p of hp) { if (!s.achieved.has(p.id)) gap = true; else expect(gap, p.id).toBe(false); }
  });
  it('một cuốn không đếm hai lần: sách đã dùng cho lĩnh vực riêng không tính vào "bất kỳ"', () => {
    const post: Post = { id: 'x', title: 'X', branch: 'hanh-phap', tier: 'co-so', reqs: [{ field: 'dia-phuong', level: 1, count: 1 }, { field: 'any', level: 1, count: 1 }] };
    expect(satisfies(post.reqs, many('dia-phuong', 1, 1)).ok).toBe(false);
    expect(satisfies(post.reqs, many('dia-phuong', 1, 2)).ok).toBe(true);
  });
  it('Chủ tịch nước cần cấp trung ương ở ít nhất hai nhánh', () => {
    const p = POSTS.find((x) => x.id === 'chu-tich-nuoc');
    expect(p?.branchesAtTier).toEqual({ tier: 'trung-uong', count: 2 });
  });
  it('mọi điều kiện dùng lĩnh vực đã khai báo; chức có lĩnh vực chờ môn được đánh dấu future', () => {
    for (const p of POSTS) for (const r of p.reqs) expect(r.field === 'any' || FIELDS.includes(r.field), `${p.id}:${r.field}`).toBe(true);
    const s = careerState([]);
    const nx = s.next['xet-xu'];
    expect(nx?.post.id).toBe('thu-ky-toa-an');
    expect(FUTURE_FIELDS.length).toBeGreaterThan(0);
  });
});
