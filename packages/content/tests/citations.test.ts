import { describe, expect, it } from 'vitest';
import { parseLaw, extractCitations, features, overlap } from '../../../tools/citations/parse';
import { resolveLawAt } from '../../../tools/citations/laws';
import { findOldTerms } from '../../../tools/citations/terms';
import { audit, type Flag } from '../../../tools/citations/audit';
import { DATA_DIR } from '../src/build';

// Đợt 7 — độ chuẩn trích dẫn. Phần 1: kiểm công cụ dò (tools/citations). Phần 2: chặn tái phạm trên toàn kho.
// Ngưỡng phần 2 đặt theo số đo lúc viết (03/11/2026) rồi siết dần sau khi xử lý cờ.

describe('công cụ dò: tách văn bản luật', () => {
  const law = parseLaw('x.txt', [
    '# tiêu đề',
    'Chương I',
    'Điều 1. Phạm vi',
    '1. Khoản một.',
    '2.Khoản hai thiếu dấu cách:',
    'a) 05 năm đối với tội ít nghiêm trọng;',
    'b) điểm b.',
    '3.',
    'Nội dung khoản ba ở dòng sau.',
    'Điều 2',
    '1\\. Khoản kiểu markdown.',
    'Điều 3. Tên dài 1. Khoản một dính tiêu đề.',
    'Điều 1 của Luật số 83/2025/QH15 sửa đổi (ghi chú, không phải điều mới)',
    'Điều 12a. Điều chèn',
  ].join('\n'));
  it('nhận Điều, khoản (cả "2.Khoản", "3." trần, "1\\."), điểm (cả "a) 05 năm")', () => {
    expect([...law.articles.keys()]).toEqual(['1', '2', '3', '12a']);
    const a1 = law.articles.get('1')!;
    expect([...a1.clauses.keys()]).toEqual(['1', '2', '3']);
    expect([...a1.clauses.get('2')!.points.keys()]).toEqual(['a', 'b']);
    expect(a1.clauses.get('3')!.text).toContain('khoản ba');
    expect([...law.articles.get('2')!.clauses.keys()]).toEqual(['1']);
    expect(law.articles.get('3')!.title).toBe('Tên dài');
    expect(law.articles.get('3')!.clauses.has('1')).toBe(true);
  });
});

describe('công cụ dò: tách trích dẫn', () => {
  it('điểm/khoản/Điều + tên văn bản; cụm dùng chung tên đứng sau', () => {
    const c = extractCitations('Theo điểm a, b khoản 1 Điều 5, khoản 2 Điều 7 Luật Đất đai 2024 và Điều 3 BLDS.');
    expect(c.map((x) => [x.article, x.clauses, x.points, x.law && x.law.ok ? x.law.file : null])).toEqual([
      ['5', ['1'], ['a', 'b'], 'ldd-vbhn-2026.txt'],
      ['7', ['2'], [], 'ldd-vbhn-2026.txt'],
      ['3', [], [], 'blds-2015.txt'],
    ]);
  });
  it('dấu ";" tách hai trích dẫn độc lập, không dùng chung tên, không kế thừa qua ";"', () => {
    const [a, b] = extractCitations('Khoản 2 Điều 92; khoản 2 Điều 12 BLHS.');
    expect(a.law).toBeNull();
    expect(b.law && b.law.ok && b.law.file).toBe('blhs-vbhn-2025.txt');
    const [, d] = extractCitations('ngoài khoản 2 Điều 12 BLHS; người đã bị giáo dục tại xã (Điều 92)');
    expect(d.law).toBeNull();
  });
  it('dấu hiệu lịch sử quanh trích dẫn ("BLHS cũ (Điều 101, đã bãi bỏ)")', () => {
    expect(extractCitations('BLHS cũ (Điều 101, đã bãi bỏ) là 18 năm')[0].history).toBe(true);
    expect(extractCitations('Điều 53 BLHS quy định tái phạm')[0].history).toBe(false);
  });
  it('khoảng "Điều 102–116" và danh sách "Điều 9, 10"', () => {
    expect(extractCitations('Điều 102–116').length).toBe(15);
    expect(extractCitations('các Điều 9, 10 Hiến pháp 2013').map((x) => x.article)).toEqual(['9', '10']);
  });
  it('kế thừa tên văn bản nhắc ngay trước ("BLDS 2015: … (Điều 418)", "Luật Doanh nghiệp Điều 188")', () => {
    const [a] = extractCitations('So sánh BLDS 2015: không giới hạn mức phạt (Điều 418).');
    expect(a.law && a.law.ok && a.law.file).toBe('blds-2015.txt');
    expect(a.inherited).toBe(true);
    const [b] = extractCitations('tài sản độc lập (Luật Doanh nghiệp Điều 188)');
    expect(b.law && b.law.ok && b.law.file).toBe('ldn-vbhn-2025.txt');
    // "Hiến pháp" trần là từ thường, không kế thừa.
    const [d] = extractCitations('không trái Hiến pháp, thống nhất trong hệ thống (khoản 2 Điều 5)');
    expect(d.law).toBeNull();
  });
  it('năm cũ → văn bản cũ; văn bản lịch sử → bản trích; tên môn học không phải văn bản', () => {
    expect(resolveLawAt('Luật Đất đai 2013')).toMatchObject({ ok: false, reason: 'van-ban-cu' });
    expect(resolveLawAt('Hiến pháp 1980')).toMatchObject({ ok: true, file: 'hien-phap-lich-su.txt', excerpt: true });
    expect(resolveLawAt('Bộ luật Hình sự 1985')).toMatchObject({ ok: true, excerpt: true });
    expect(resolveLawAt('Luật 2024')).toBeNull();
    expect(resolveLawAt('Luật Hiến pháp')).toBeNull();
    expect(resolveLawAt('Nghị định 63/2010/NĐ-CP')).toMatchObject({ ok: false, reason: 'ngoai-kho' });
  });
  it('điểm trùng nội dung: cùng ý cao, khác ý thấp', () => {
    const law = features('Tái phạm là trường hợp đã bị kết án, chưa được xóa án tích mà lại thực hiện hành vi phạm tội do cố ý');
    expect(overlap(features('Đã bị kết án, chưa được xóa án tích mà lại phạm tội do cố ý'), law)!).toBeGreaterThan(0.5);
    expect(overlap(features('Năng lực hành vi dân sự là khả năng bằng hành vi của mình xác lập quyền'), law)!).toBeLessThan(0.2);
  });
  it('thuật ngữ cũ và ngữ cảnh lịch sử', () => {
    expect(findOldTerms('Tòa án nhân dân cấp huyện có thẩm quyền xét xử sơ thẩm').map((h) => h.term.id)).toEqual(['toa-an-cap-huyen']);
    expect(findOldTerms('Trước 01/7/2025 còn cấp huyện')[0].history).toBe(true);
    expect(findOldTerms('Tham ô tài sản có thể bị phạt tử hình')[0].term.id).toBe('tu-hinh-8-toi');
    expect(findOldTerms('Giết người có thể bị phạt tử hình')).toEqual([]);
  });
});

describe('chặn tái phạm trên toàn kho', () => {
  const flags: Flag[] = audit(DATA_DIR);
  const key = (f: Flag) => `${f.file}#${f.item}#${f.trich_dan}`;

  // Ngoại lệ "điều không tồn tại" — mỗi dòng có lý do. Lúc đặt (03/11/2026) đây là toàn bộ cờ còn mở,
  // giao haiku/opus xử lý trong đợt 7; xử lý xong dòng nào thì xoá dòng đó (test sẽ báo nếu dòng thừa).
  // Lúc đặt (03/11/2026) có 4 ngoại lệ chờ haiku; sau khi xử lý (đợt 7) còn 0. Thêm dòng mới phải kèm lý do.
  const DIEU_EXCEPTIONS: Record<string, string> = {};



  it('trích dẫn ánh xạ được thì Điều phải tồn tại (trừ ngoại lệ có lý do)', () => {
    // Cờ có dấu hiệu lịch sử ("BLHS cũ (Điều 101, đã bãi bỏ)") không tính: nói về điều đã bãi bỏ là đúng.
    const open = flags.filter((f) => f.loai === 'dieu-khong-ton-tai' && !f.lich_su).map(key);
    expect(open.filter((k) => !(k in DIEU_EXCEPTIONS)), 'điều không tồn tại mới').toEqual([]);
    expect(Object.keys(DIEU_EXCEPTIONS).filter((k) => !open.includes(k)), 'ngoại lệ đã xử lý xong — xoá khỏi danh sách').toEqual([]);
  });

  it('khoản/điểm không tồn tại không tăng (đo lúc đặt: 12)', () => {
    expect(flags.filter((f) => f.loai === 'khoan-diem-khong-ton-tai').length).toBeLessThanOrEqual(12);
  });

  it('không còn thuật ngữ cũ dùng như hiện hành (không có dấu hiệu lịch sử, không có note) — đo sau khi sửa: 0', () => {
    const cur = flags.filter((f) => f.loai === 'thuat-ngu-cu' && !f.lich_su);
    expect(cur.map(key)).toEqual([]);
  });
});
