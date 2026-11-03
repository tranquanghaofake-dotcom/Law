import { describe, expect, it } from 'vitest';
import { BRANCHES, BRANCH_NAMES, POSTS, TIER_NAMES, careerState } from '$lib/game/career';
import type { Field } from '$lib/game/fields';
import type { BookLevel } from '$lib/game/books';
import { orgTree, shortPostTitle } from '$lib/ui/orgTree';

type B = { field: Field; level: BookLevel };
const many = (field: Field, level: BookLevel, n: number): B[] => Array.from({ length: n }, () => ({ field, level }));
const build = (books: B[]) => orgTree(POSTS, careerState(books), books);
const flat = (t: ReturnType<typeof build>) => t.branches.flatMap((b) => b.tiers.flatMap((x) => x.posts));

describe('cây chức vụ (orgTree)', () => {
  it('gốc → 4 nhánh theo BRANCHES, tên nhánh lấy từ BRANCH_NAMES', () => {
    const t = build([]);
    expect(t.label).toBe('Nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam');
    expect(t.branches.map((b) => b.branch)).toEqual([...BRANCHES]);
    expect(t.branches.map((b) => b.label)).toEqual(BRANCHES.map((b) => BRANCH_NAMES[b]));
  });
  it('mỗi nhánh chia tầng từ cơ sở lên lãnh đạo, tên tầng theo TIER_NAMES, không bỏ/trùng chức nào', () => {
    const t = build([]);
    const order = ['co-so', 'tinh', 'trung-uong', 'lanh-dao'];
    for (const b of t.branches) {
      const idx = b.tiers.map((x) => order.indexOf(x.tier));
      expect(idx).toEqual([...idx].sort((a, c) => a - c));
      for (const x of b.tiers) expect(x.label).toBe(TIER_NAMES[x.tier]);
      expect(b.tiers.flatMap((x) => x.posts.map((p) => p.id))).toEqual(POSTS.filter((p) => p.branch === b.branch).map((p) => p.id));
    }
    // chỉ dùng dữ liệu career.ts: tổng chức trong cây = POSTS trừ đỉnh chung
    expect(flat(t)).toHaveLength(POSTS.filter((p) => p.branch !== 'nguyen-thu').length);
  });
  it('Chủ tịch nước nằm riêng ở đỉnh (head), không lẫn vào nhánh nào', () => {
    const t = build([]);
    expect(t.head?.id).toBe('chu-tich-nuoc');
    expect(flat(t).some((p) => p.id === 'chu-tich-nuoc')).toBe(false);
  });
  it('chưa có sách: mọi chức khoá trừ đúng một chức kế tiếp mỗi nhánh (chức đầu); 0 đã đạt', () => {
    const t = build([]);
    expect(t.done).toBe(0);
    for (const b of t.branches) {
      const st = b.tiers.flatMap((x) => x.posts.map((p) => p.status));
      expect(st.filter((s) => s === 'next')).toHaveLength(1);
      expect(st[0]).toBe('next');
      expect(st.filter((s) => s === 'done')).toHaveLength(0);
      expect(b.done).toBe(0);
    }
    expect(t.head?.status).toBe('locked');
  });
  it('có sách cấp 1 đủ cho chức đầu: chức đó "done", chức sau thành "next", số đếm khớp', () => {
    const books = [...many('dia-phuong', 1, 1), ...many('hien-phap', 1, 1)];
    const t = build(books);
    const hp = t.branches.find((b) => b.branch === 'hanh-phap')!;
    const posts = hp.tiers.flatMap((x) => x.posts);
    expect(posts[0]).toMatchObject({ id: 'cong-chuc-xa', status: 'done' });
    expect(posts[1].status).toBe('next');
    expect(posts[2].status).toBe('locked');
    expect(hp.done).toBe(1);
    expect(hp.tiers[0].done).toBe(1);
    expect(t.done).toBeGreaterThanOrEqual(1);
  });
  it('mỗi chức mang điều kiện sách (detail) và số sách đang có/cần; chức đã đạt có have = need', () => {
    const books = [...many('dia-phuong', 1, 1), ...many('hien-phap', 1, 1)];
    const t = build(books);
    const [first, second] = t.branches[0].tiers[0].posts;
    expect(first.detail.length).toBe(first.post.reqs.length);
    expect(first.have).toBe(first.need);
    expect(second.need).toBeGreaterThan(second.have);
    expect(second.detail.every((d) => typeof d.label === 'string')).toBe(true);
  });
  it('đỉnh chung: ghi số nhánh đã tới cấp Trung ương và số nhánh cần', () => {
    const none = build([]);
    expect(none.head?.branchesReached).toBe(0);
    expect(none.head?.branchesNeeded).toBe(2);
    expect(none.head?.status).toBe('locked');
  });
  it('trạng thái nhất quán với careerState; mỗi nhánh tối đa một "next"', () => {
    const books = [...many('dia-phuong', 2, 3), ...many('hien-phap', 2, 6), ...many('quyen-cong-dan', 2, 2), ...many('hanh-phap', 2, 1), ...many('bau-cu', 2, 1), ...many('lap-phap', 2, 1)];
    const cs = careerState(books);
    const t = orgTree(POSTS, cs, books);
    for (const p of flat(t)) expect(p.status === 'done').toBe(cs.achieved.has(p.id));
    for (const b of t.branches) expect(b.tiers.flatMap((x) => x.posts).filter((p) => p.status === 'next').length).toBeLessThanOrEqual(1);
  });
});

describe('shortPostTitle — tên chức rút gọn trong ô cây (tên đầy đủ ở tooltip và hộp chi tiết)', () => {
  it('viết tắt tên cơ quan theo cách viết tắt thông dụng', () => {
    expect(shortPostTitle('Phó Chủ tịch Ủy ban nhân dân cấp xã')).toBe('Phó Chủ tịch UBND cấp xã');
    expect(shortPostTitle('Đại biểu Hội đồng nhân dân cấp tỉnh')).toBe('Đại biểu HĐND cấp tỉnh');
    expect(shortPostTitle('Chánh án Tòa án nhân dân tối cao')).toBe('Chánh án TAND tối cao');
    expect(shortPostTitle('Viện trưởng Viện kiểm sát nhân dân cấp tỉnh')).toBe('Viện trưởng VKSND cấp tỉnh');
    expect(shortPostTitle('Ủy viên Ủy ban Thường vụ Quốc hội')).toBe('Ủy viên UBTVQH');
  });
  it('giữ nguyên tên không có cơ quan cần viết tắt', () => {
    expect(shortPostTitle('Thư ký Tòa án')).toBe('Thư ký Tòa án');
    expect(shortPostTitle('Chủ tịch nước')).toBe('Chủ tịch nước');
  });
});
