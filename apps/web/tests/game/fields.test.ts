import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Subject } from '$lib/content/types';
import { collectBooks, mergeStored } from '$lib/game/books';
import { satisfies, POSTS } from '$lib/game/career';
import { DEFAULT_FIELD, FIELDS, FUTURE_FIELDS, fieldOf, type Field } from '$lib/game/fields';

// Bảng gán chuẩn (spec thăng chức §2.2, cập nhật 03/11/2026)
const TM: Field = 'thuong-mai';
const TC: Field = 'tai-chinh';
const EXPECTED: Record<string, Field> = {
  'hanh-chinh': 'hanh-chinh', 'dan-su': 'dan-su', 'dan-su-2': 'dan-su', 'hinh-su': 'hinh-su', 'to-tung-dan-su': 'to-tung',
  'lao-dong': 'lao-dong', 'lao-dong-2': 'lao-dong', 'an-sinh-xa-hoi': 'lao-dong', 'dat-dai': 'dat-dai',
  'thuong-mai-1': TM, 'thuong-mai': TM, 'canh-tranh': TM, 'dau-tu': TM,
  'ngan-hang': TC, 'tai-chinh': TC, 'tai-chinh-doanh-nghiep': TC, 'chung-khoan': TC,
  'so-huu-tri-tue': 'dan-su', 'tai-san-tri-tue': 'dan-su', 'hon-nhan-gia-dinh': 'dan-su', 'to-tung-hanh-chinh': 'to-tung', 'xay-dung-vbpl': 'lap-phap', 'ly-luan-nn-pl': 'ly-luan',
  'lich-su-nn-pl': 'lich-su', 'hien-phap': 'hien-phap',
};
const dir = resolve(process.cwd(), '../../packages/content/data/subjects');
const ids = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));

describe('lĩnh vực theo môn', () => {
  it('mọi môn trong dữ liệu có lĩnh vực đúng bảng (kể cả môn thêm mới phải khai báo)', () => {
    expect(ids.length).toBe(25);
    for (const id of ids) expect(EXPECTED[id], `thiếu bảng cho ${id}`).toBeDefined();
    for (const id of ids) expect(fieldOf(id, 'c1-bat-ky'), id).toBe(EXPECTED[id]);
  });
  it('chi tiết theo chương của Hiến pháp: nền tảng / quyền công dân và bầu cử / Quốc hội / bộ máy; nâng cao thuộc Hiến pháp', () => {
    expect(fieldOf('hien-phap', 'c3-che-do-chinh-tri')).toBe('hien-phap');
    expect(fieldOf('hien-phap', 'c6-bau-cu')).toBe('quyen-cong-dan');
    expect(fieldOf('hien-phap', 'c7-quoc-hoi')).toBe('lap-phap');
    for (const c of ['c8-chu-tich-nuoc', 'c9-chinh-phu', 'c10-toa-an-vien-kiem-sat', 'c11-chinh-quyen-dia-phuong']) expect(fieldOf('hien-phap', c), c).toBe('bo-may');
    expect(fieldOf('hien-phap', 'nang-cao')).toBe('hien-phap');
  });
  it('Dân sự không còn tính là Hiến pháp', () => {
    expect(fieldOf('dan-su', 'c1')).not.toBe('hien-phap');
  });
  it('môn lạ rơi về mặc định rõ ràng', () => {
    expect(DEFAULT_FIELD).toBe('hien-phap');
    expect(fieldOf('mon-la', 'c1')).toBe(DEFAULT_FIELD);
  });
  it('mọi lĩnh vực đều có ít nhất một chương trong nội dung thật; FUTURE_FIELDS rỗng khớp', () => {
    const have = new Set<Field>();
    for (const id of ids) {
      const subj = JSON.parse(readFileSync(resolve(dir, `${id}.json`), 'utf8')) as { chapters: { id: string }[] };
      for (const c of subj.chapters) have.add(fieldOf(id, c.id));
    }
    for (const f of FIELDS) expect(have.has(f), f).toBe(!FUTURE_FIELDS.includes(f));
  });
  it('sách Dân sự cấp 1 được tính cho điều kiện cần dan-su', () => {
    const post = POSTS.find((p) => p.reqs.some((r) => r.field === 'dan-su'))!;
    const need = post.reqs.find((r) => r.field === 'dan-su')!;
    const ds: Subject = { id: 'dan-su', title: 'Luật Dân sự', short: 'Dân sự', chapters: [{ id: 'c1', title: 'C1', lessons: [{ id: 'l', title: 'L', concepts: ['x'] }] }] };
    const [b] = collectBooks([ds], { x: 3 }, {});
    expect(b.field).toBe('dan-su');
    const books = Array.from({ length: need.count }, () => ({ field: b.field, level: 3 as const }));
    const det = satisfies(post.reqs, books).detail.find((d) => d.req.field === 'dan-su')!;
    expect(det.have).toBe(need.count);
  });
  it('dữ liệu cũ: kho sách lưu không chứa lĩnh vực, đọc lại theo bảng mới vẫn giữ cấp đã đạt', () => {
    const ds: Subject = { id: 'dan-su', title: 'Luật Dân sự', short: 'Dân sự', chapters: [{ id: 'c1', title: 'C1', lessons: [{ id: 'l', title: 'L', concepts: ['x'] }] }] };
    const stored = { 'dan-su/c1': { level: 2 as const, at: '2026-10-20' } };
    const [b] = collectBooks([ds], { x: 3 }, stored);
    expect(b).toMatchObject({ field: 'dan-su', level: 2, current: 1, needsReview: true });
    expect(mergeStored(stored, [b], '2026-11-03')).toEqual(stored);
  });
});
