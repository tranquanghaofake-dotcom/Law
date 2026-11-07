import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { POSTS, BRANCHES, careerState, satisfies, totalNeed, promotionToCelebrate, type Post } from '$lib/game/career';
import { FIELDS, FIELD_YEAR, FUTURE_FIELDS, fieldOf, type Field } from '$lib/game/fields';
import type { BookLevel } from '$lib/game/books';

type B = { field: Field; level: BookLevel };
const many = (field: Field, level: BookLevel, n: number): B[] => Array.from({ length: n }, () => ({ field, level }));
// Nội dung thật: mỗi chương của mỗi môn là một cuốn sách
const dir = resolve(process.cwd(), '../../packages/content/data/subjects');
const REAL: Field[] = readdirSync(dir).filter((f) => f.endsWith('.json')).flatMap((f) => {
  const s = JSON.parse(readFileSync(resolve(dir, f), 'utf8')) as { id: string; chapters: { id: string }[] };
  return s.chapters.map((c) => fieldOf(s.id, c.id));
});
const CAP = REAL.reduce((m, f) => m.set(f, (m.get(f) ?? 0) + 1), new Map<Field, number>());
const allReal = (level: BookLevel): B[] => REAL.map((field) => ({ field, level }));
const branchPosts = (b: string) => POSTS.filter((p) => p.branch === b);

describe('thăng chức theo bộ máy nhà nước', () => {
  it('chưa có sách: mọi người là Công dân, chưa đạt chức nào', () => {
    const s = careerState([]);
    expect(s.achieved.size).toBe(0);
    for (const b of BRANCHES) expect(s.highest[b]).toBeNull();
  });
  it('chức đầu mỗi nhánh làm được bằng nội dung thật ở cấp 1, và chỉ đòi môn năm 1–2', () => {
    const s = careerState(allReal(1));
    for (const b of BRANCHES) {
      const first = branchPosts(b)[0];
      expect(s.achieved.has(first.id), b).toBe(true);
      for (const q of first.reqs) expect(q.field === 'any' || FIELD_YEAR[q.field] <= 2, `${first.id}:${q.field}`).toBe(true);
    }
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
  it('toàn bộ nội dung thật ở cấp 3: mọi chức đều đạt được, kể cả Chủ tịch nước', () => {
    expect(REAL.length).toBe(225); // +7 sách (7 chương) môn Tố tụng hành chính
    const s = careerState(allReal(3));
    for (const p of POSTS) expect(s.achieved.has(p.id), p.id).toBe(true);
    for (const b of BRANCHES) expect(s.next[b], b).toBeNull();
    expect(s.head).toBeNull();
  });
  it('không chức nào đòi lĩnh vực chưa có môn, hay nhiều chương hơn lĩnh vực đó có; tổng không vượt nội dung', () => {
    for (const p of POSTS) {
      const per = new Map<Field, number>();
      for (const q of p.reqs) if (q.field !== 'any') per.set(q.field, (per.get(q.field) ?? 0) + q.count);
      for (const [f, n] of per) {
        expect(FUTURE_FIELDS.includes(f), `${p.id}:${f} chờ môn`).toBe(false);
        expect(n, `${p.id}:${f} đòi ${n}/${CAP.get(f) ?? 0}`).toBeLessThanOrEqual(CAP.get(f) ?? 0);
      }
      expect(new Set(p.reqs.map((q) => q.field)).size, `${p.id} lặp lĩnh vực`).toBe(p.reqs.length);
      expect(totalNeed(p), p.id).toBeLessThanOrEqual(REAL.length);
    }
  });
  it('mỗi nhánh có các cấp tăng dần: cơ sở → tỉnh → trung ương → lãnh đạo (không đảo thứ tự)', () => {
    const rank = { 'co-so': 0, tinh: 1, 'trung-uong': 2, 'lanh-dao': 3 } as const;
    for (const b of BRANCHES) { const ps = branchPosts(b); for (let i = 1; i < ps.length; i++) expect(rank[ps[i].tier], ps[i].id).toBeGreaterThanOrEqual(rank[ps[i - 1].tier]); }
  });
  it('đúng nghề: Xét xử/Kiểm sát đòi Hình sự, Dân sự, Tố tụng; Hành pháp đòi Hành chính, Đất đai, Tài chính; Lập pháp đòi Xây dựng VBPL', () => {
    const has = (id: string, f: Field) => POSTS.find((p) => p.id === id)!.reqs.some((q) => q.field === f);
    for (const id of ['tham-phan', 'chanh-an-tinh', 'tham-phan-tc', 'chanh-an-tc']) for (const f of ['hinh-su', 'dan-su', 'to-tung'] as const) expect(has(id, f), `${id}:${f}`).toBe(true);
    for (const id of ['kiem-sat-vien', 'vien-truong-tinh', 'kiem-sat-vien-tc', 'vien-truong-tc']) for (const f of ['hinh-su', 'dan-su', 'to-tung'] as const) expect(has(id, f), `${id}:${f}`).toBe(true);
    for (const id of ['chuyen-vien-so', 'giam-doc-so', 'chu-tich-tinh', 'vu-truong', 'thu-truong', 'bo-truong']) for (const f of ['hanh-chinh', 'dat-dai', 'tai-chinh'] as const) expect(has(id, f), `${id}:${f}`).toBe(true);
    for (const id of ['dai-bieu-hdnd-tinh', 'dai-bieu-quoc-hoi', 'uy-vien-ubtvqh', 'chu-tich-qh']) expect(has(id, 'lap-phap'), id).toBe(true);
  });
  it('lên tuần tự: đủ sách cho chức cao nhưng thiếu chức dưới thì careerState dừng ở chức dưới', () => {
    const hp = branchPosts('hanh-phap');
    const [first, third] = [hp[0], hp[2]];
    const books: B[] = third.reqs.flatMap((q) => many(q.field === 'any' ? 'hanh-chinh' : q.field, 3, q.count));
    const saved = first.reqs;
    first.reqs = [...saved, { field: 'lich-su', level: 3, count: 1 }]; // chức dưới đòi thêm một cuốn Lịch sử mà bộ sách không có
    try {
      expect(satisfies(third.reqs, books).ok).toBe(true);
      expect(books.some((b) => b.field === 'lich-su')).toBe(false);
      const s = careerState(books);
      for (const p of hp) expect(s.achieved.has(p.id), p.id).toBe(false);
      expect(s.next['hanh-phap']?.post.id).toBe(first.id);
    } finally { first.reqs = saved; }
  });
  it('thang không giảm theo từng lĩnh vực: giữa hai chức liền kề cùng nhánh, số sách và cấp mỗi lĩnh vực (kể cả "bất kỳ") không giảm', () => {
    for (const b of BRANCHES) {
      const ps = branchPosts(b);
      for (let i = 1; i < ps.length; i++) {
        for (const q of ps[i - 1].reqs) {
          const nx = ps[i].reqs.find((x) => x.field === q.field);
          expect(nx, `${ps[i].id} bỏ ${q.field}`).toBeDefined();
          expect(nx!.count, `${ps[i].id}:${q.field} số sách`).toBeGreaterThanOrEqual(q.count);
          expect(nx!.level, `${ps[i].id}:${q.field} cấp`).toBeGreaterThanOrEqual(q.level);
        }
      }
    }
  });
  it('khung số sách: lãnh đạo ≤ 160, Chủ tịch nước 155–170, Bộ trưởng ≤ 135, không đòi trọn một lĩnh vực trừ lĩnh vực ≤ 4 chương', () => {
    for (const p of POSTS) {
      expect(totalNeed(p), p.id).toBeLessThanOrEqual(p.id === 'chu-tich-nuoc' ? 170 : p.tier === 'lanh-dao' ? 160 : 135);
      for (const q of p.reqs) if (q.field !== 'any' && (CAP.get(q.field) ?? 0) > 4) expect(q.count, `${p.id}:${q.field}`).toBeLessThan(CAP.get(q.field)!);
    }
    expect(totalNeed(POSTS.find((p) => p.id === 'chu-tich-nuoc')!)).toBeGreaterThanOrEqual(155);
  });
  it('thang Xét xử/Kiểm sát tăng đều: mỗi bước không nhảy quá 55 sách', () => {
    for (const b of ['xet-xu', 'kiem-sat'] as const) {
      const ps = branchPosts(b);
      for (let i = 1; i < ps.length; i++) expect(totalNeed(ps[i]) - totalNeed(ps[i - 1]), ps[i].id).toBeLessThanOrEqual(55);
    }
  });
  it('một cuốn không đếm hai lần: sách đã dùng cho lĩnh vực riêng không tính vào "bất kỳ"', () => {
    const post: Post = { id: 'x', title: 'X', branch: 'hanh-phap', tier: 'co-so', reqs: [{ field: 'bo-may', level: 1, count: 1 }, { field: 'any', level: 1, count: 1 }] };
    expect(satisfies(post.reqs, many('bo-may', 1, 1)).ok).toBe(false);
    expect(satisfies(post.reqs, many('bo-may', 1, 2)).ok).toBe(true);
  });
  it('Chủ tịch nước cần cấp trung ương ở ít nhất hai nhánh', () => {
    const p = POSTS.find((x) => x.id === 'chu-tich-nuoc');
    expect(p?.branchesAtTier).toEqual({ tier: 'trung-uong', count: 2 });
  });
  it('mọi điều kiện dùng lĩnh vực đã khai báo; chưa có sách thì chức đầu Xét xử là Thư ký Tòa án', () => {
    for (const p of POSTS) for (const r of p.reqs) expect(r.field === 'any' || FIELDS.includes(r.field), `${p.id}:${r.field}`).toBe(true);
    expect(careerState([]).next['xet-xu']?.post.id).toBe('thu-ky-toa-an');
    expect(FUTURE_FIELDS.every((f) => FIELDS.includes(f))).toBe(true);
  });
});

describe('màn nhận chức (chức mới chưa xem)', () => {
  it('lần đầu chưa có danh sách đã xem: không mừng, coi mọi chức hiện có là đã xem', () => {
    expect(promotionToCelebrate(new Set(['xa-cong-chuc']), null)).toBeNull();
  });
  it('chức mới chưa xem: trả về chức cao nhất trong số chưa xem', () => {
    const lo = POSTS.find((p) => p.tier === 'co-so')!;
    const hi = POSTS.find((p) => p.tier === 'tinh')!;
    expect(promotionToCelebrate(new Set([lo.id, hi.id]), [])?.id).toBe(hi.id);
    expect(promotionToCelebrate(new Set([lo.id, hi.id]), [hi.id])?.id).toBe(lo.id);
  });
  it('đã xem hết: không mừng', () => {
    const lo = POSTS.find((p) => p.tier === 'co-so')!;
    expect(promotionToCelebrate(new Set([lo.id]), [lo.id])).toBeNull();
  });
});
