import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Subject } from '$lib/content/types';
import { collectBooks, mergeStored } from '$lib/game/books';
import { satisfies, POSTS } from '$lib/game/career';
import { DEFAULT_FIELD, FIELDS, FUTURE_FIELDS, fieldOf, type Field } from '$lib/game/fields';

// Bảng gán chuẩn (spec thăng chức §2.2, cập nhật 03/11/2026)
const EXPECTED: Record<string, Field> = {
  'hanh-chinh': 'hanh-chinh', 'dan-su': 'dan-su', 'dan-su-2': 'dan-su', 'hinh-su': 'hinh-su', 'to-tung-dan-su': 'to-tung',
  'lao-dong': 'lao-dong', 'lao-dong-2': 'lao-dong', 'an-sinh-xa-hoi': 'lao-dong', 'dat-dai': 'dat-dai',
  'thuong-mai-1': 'kinh-te-tai-chinh', 'thuong-mai': 'kinh-te-tai-chinh', 'canh-tranh': 'kinh-te-tai-chinh', 'dau-tu': 'kinh-te-tai-chinh',
  'ngan-hang': 'kinh-te-tai-chinh', 'tai-chinh': 'kinh-te-tai-chinh', 'tai-chinh-doanh-nghiep': 'kinh-te-tai-chinh', 'chung-khoan': 'kinh-te-tai-chinh',
  'so-huu-tri-tue': 'dan-su', 'tai-san-tri-tue': 'dan-su', 'xay-dung-vbpl': 'lap-phap', 'ly-luan-nn-pl': 'hien-phap',
  'lich-su-nn-pl': 'lich-su', 'hien-phap': 'hien-phap',
};
const dir = resolve(process.cwd(), '../../packages/content/data/subjects');
const ids = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));

describe('lĩnh vực theo môn', () => {
  it('mọi môn trong dữ liệu có lĩnh vực đúng bảng (kể cả môn thêm mới phải khai báo)', () => {
    expect(ids.length).toBe(23);
    for (const id of ids) expect(EXPECTED[id], `thiếu bảng cho ${id}`).toBeDefined();
    for (const id of ids) expect(fieldOf(id, 'c1-bat-ky'), id).toBe(EXPECTED[id]);
  });
  it('chi tiết theo chương của Hiến pháp vẫn giữ', () => {
    expect(fieldOf('hien-phap', 'c7-quoc-hoi')).toBe('lap-phap');
    expect(fieldOf('hien-phap', 'nang-cao')).toBe('kinh-te-tai-chinh');
  });
  it('Dân sự không còn tính là Hiến pháp', () => {
    expect(fieldOf('dan-su', 'c1')).not.toBe('hien-phap');
  });
  it('môn lạ rơi về mặc định rõ ràng', () => {
    expect(DEFAULT_FIELD).toBe('hien-phap');
    expect(fieldOf('mon-la', 'c1')).toBe(DEFAULT_FIELD);
  });
  it('FUTURE_FIELDS không chứa lĩnh vực đã có môn', () => {
    const have = new Set(ids.map((id) => fieldOf(id, 'c1')));
    for (const f of FUTURE_FIELDS) expect(have.has(f), f).toBe(false);
    for (const f of FIELDS) if (!have.has(f) && !['quyen-cong-dan', 'bau-cu', 'nguyen-thu', 'hanh-phap', 'tu-phap', 'dia-phuong'].includes(f)) expect(FUTURE_FIELDS, f).toContain(f);
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
