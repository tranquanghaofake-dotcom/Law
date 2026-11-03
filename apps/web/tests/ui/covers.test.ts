import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { COVERS, coverFor, COVER_FIT, type CoverSpec } from '$lib/art/covers';
import { fitLines } from '$lib/ui/bookCover';
import { contrastRatio } from '$lib/ui/shelves';

const SUBJECT_DIR = path.resolve(__dirname, '../../../../packages/content/data/subjects');
const subjectIds = fs.readdirSync(SUBJECT_DIR).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(SUBJECT_DIR, f), 'utf8')).id as string);
const HEX = /^#[0-9a-f]{6}$/i;

describe('bìa riêng từng môn (kế hoạch đợt 5 §1)', () => {
  it('mọi môn trong dữ liệu đều có bìa riêng, không thừa bìa của môn không tồn tại', () => {
    expect(subjectIds.length).toBeGreaterThanOrEqual(23);
    for (const id of subjectIds) expect(COVERS[id], id).toBeDefined();
    for (const id of Object.keys(COVERS)) expect(subjectIds, id).toContain(id);
  });
  it('mỗi bìa ghi nguồn tham chiếu: tên sách, đơn vị xuất bản, link', () => {
    for (const [id, c] of Object.entries(COVERS)) {
      expect(c.source.book.length, id).toBeGreaterThan(5);
      expect(c.source.publisher.length, id).toBeGreaterThan(3);
      expect(c.source.url, id).toMatch(/^https:\/\//);
    }
  });
  it('màu hợp lệ; chữ tên đủ tương phản với thân (≥ 4,5:1, cả đầu và cuối gradient); chữ nhãn ≥ 3:1', () => {
    for (const [id, c] of Object.entries(COVERS)) {
      for (const v of Object.values(c.palette)) if (v) expect(v, id).toMatch(HEX);
      expect(contrastRatio(c.palette.title, c.palette.body), id).toBeGreaterThanOrEqual(4.5);
      if (c.palette.bodyTo) expect(contrastRatio(c.palette.title, c.palette.bodyTo), id + ' bodyTo').toBeGreaterThanOrEqual(4.5);
      // chữ nhãn nằm giữa ruy băng (labelTo) nếu có gradient
      if (c.label) expect(contrastRatio(c.palette.labelText, c.palette.labelTo ?? c.palette.label), id + ' nhãn').toBeGreaterThanOrEqual(3);
    }
  });
  it('tên in trên bìa: in hoa, 1–4 dòng, vừa bề ngang ở cỡ ≥ 10', () => {
    for (const [id, c] of Object.entries(COVERS)) {
      expect(c.title.length, id).toBeGreaterThanOrEqual(1);
      expect(c.title.length, id).toBeLessThanOrEqual(4);
      for (const l of c.title) expect(l, id).toBe(l.toLocaleUpperCase('vi'));
      expect(fitLines(c.title, COVER_FIT[c.kind]), id).toBeGreaterThanOrEqual(10);
    }
  });
  it('nhãn theo khuôn: sách luật NXB ghi BỘ LUẬT/LUẬT, giáo trình ghi GIÁO TRÌNH, Hiến pháp không nhãn', () => {
    for (const [id, c] of Object.entries(COVERS)) {
      if (c.kind === 'st-moi' || c.kind === 'st-cu') expect(['BỘ LUẬT', 'LUẬT'], id).toContain(c.label);
      if (c.kind === 'giao-trinh-hlu' || c.kind === 'giao-trinh-ulaw') expect(c.label, id).toBe('GIÁO TRÌNH');
      if (c.kind === 'hien-phap') expect(c.label, id).toBe('');
    }
    expect(COVERS['dan-su'].kind).toBe('st-moi');
    expect(COVERS['hinh-su'].kind).toBe('st-moi');
    expect(COVERS['thuong-mai-1'].title).toContain('DOANH NGHIỆP');
    expect(COVERS['an-sinh-xa-hoi'].title.join(' ')).toContain('BẢO HIỂM XÃ HỘI');
    expect(COVERS['tai-chinh-doanh-nghiep'].source.note).toMatch(/cách điệu/);
  });
  it('23 bìa khác nhau: không hai môn trùng cả khuôn lẫn màu thân', () => {
    const keys = Object.values(COVERS).map((c: CoverSpec) => `${c.kind}|${c.palette.top}|${c.palette.body}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('coverFor: môn có bìa → bìa đó; môn lạ → khuôn mặc định từ tên môn + màu kệ', () => {
    expect(coverFor('hien-phap', 'Luật Hiến pháp', '#9E2A22')).toBe(COVERS['hien-phap']);
    const d = coverFor('mon-la', 'Luật Trọng tài thương mại', '#5B6475');
    expect(d.kind).toBe('st-moi');
    expect(d.label).toBe('GIÁO TRÌNH');
    expect(d.palette.body).toBe('#5B6475');
    expect(d.title.join(' ')).toBe('TRỌNG TÀI THƯƠNG MẠI');
    expect(coverFor(undefined, 'Luật Hiến pháp', '#123456').palette.body).toBe('#123456');
  });
});

describe('fitLines: cỡ chữ cho các dòng đã ngắt sẵn', () => {
  const O = { maxWidth: 100, maxSize: 17, minSize: 10, charW: 0.7 };
  it('dòng dài nhất quyết định cỡ, làm tròn xuống 0,5, chặn maxSize', () => {
    expect(fitLines(['ĐẤT ĐAI'], O)).toBe(17);
    expect(fitLines(['CÁC TỔ CHỨC', 'TÍN DỤNG'], O)).toBe(12.5); // 100 / (11 × 0,7) = 12,98
  });
  it('maxHeight chặn theo số dòng; không dưới minSize; danh sách rỗng → maxSize', () => {
    expect(fitLines(['A', 'B', 'C', 'D'], { ...O, maxHeight: 48 })).toBe(10);
    expect(fitLines(['MỘT DÒNG RẤT RẤT DÀI KHÔNG VỪA'], O)).toBe(10);
    expect(fitLines([], O)).toBe(17);
  });
});
