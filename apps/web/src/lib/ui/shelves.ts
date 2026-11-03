// Kệ môn: nhóm ngành luật + thứ tự chương trình học (spec phần nhìn đợt 4 §3.1).
// Thứ tự môn trong index.json là thứ tự tên file (packages/content/src/build.ts) — không phải thứ tự học;
// mọi chỗ liệt kê môn (Môn học, Hôm nay, thẻ hành động, Luyện đề) sắp lại qua orderedSubjects().
// Màu là màu bìa cố định (như sách in), không đổi theo chế độ tối; đã kiểm ≥ 4,5:1 với chữ kem (test).

export type Shelf = { id: string; name: string; color: string; subjects: readonly string[] };

export const SHELVES: readonly Shelf[] = [
  { id: 'ly-luan', name: 'Lý luận – Lịch sử', color: '#6B4A2B', subjects: ['ly-luan-nn-pl', 'lich-su-nn-pl'] },
  { id: 'cong-phap', name: 'Hiến pháp – Hành chính', color: '#9E2A22', subjects: ['hien-phap', 'hanh-chinh', 'xay-dung-vbpl'] },
  { id: 'dan-su', name: 'Dân sự – Tố tụng', color: '#1F4E9E', subjects: ['dan-su', 'dan-su-2', 'to-tung-dan-su'] },
  { id: 'hinh-su', name: 'Hình sự', color: '#1E2E5C', subjects: ['hinh-su'] },
  { id: 'kinh-te', name: 'Thương mại – Kinh tế', color: '#1F5F4A', subjects: ['thuong-mai-1', 'thuong-mai', 'canh-tranh', 'dau-tu', 'dat-dai', 'chung-khoan'] },
  { id: 'tai-chinh', name: 'Tài chính – Ngân hàng', color: '#7A5A08', subjects: ['tai-chinh', 'ngan-hang', 'tai-chinh-doanh-nghiep'] },
  { id: 'lao-dong', name: 'Lao động – An sinh', color: '#9C4418', subjects: ['lao-dong', 'lao-dong-2', 'an-sinh-xa-hoi'] },
  { id: 'so-huu-tri-tue', name: 'Sở hữu trí tuệ', color: '#5E3A7A', subjects: ['so-huu-tri-tue', 'tai-san-tri-tue'] },
];

/** Môn chưa khai báo trong SHELVES: vẫn hiện, ở kệ cuối, màu trung tính. */
export const OTHER_SHELF: Shelf = { id: 'khac', name: 'Khác', color: '#5B6475', subjects: [] };

const POSITION: Record<string, number> = {};
SHELVES.forEach((k, ki) => k.subjects.forEach((id, i) => { POSITION[id] = ki * 100 + i; }));

export function shelfOf(subjectId: string): Shelf {
  return SHELVES.find((k) => k.subjects.includes(subjectId)) ?? OTHER_SHELF;
}

/** Vị trí trong chương trình học; môn lạ = Infinity (xếp cuối, giữ thứ tự đưa vào). */
export const programIndex = (subjectId: string): number => POSITION[subjectId] ?? Infinity;

export function orderedSubjects<T extends { id: string }>(subjects: readonly T[]): T[] {
  return subjects
    .map((s, i) => ({ s, i }))
    .sort((a, b) => programIndex(a.s.id) - programIndex(b.s.id) || a.i - b.i)
    .map(({ s }) => s);
}

/** Môn học gần nhất lên đầu (theo mốc thời gian giảm dần); môn chưa học giữ thứ tự đưa vào. */
export function byRecency<T extends { id: string }>(subjects: readonly T[], lastStudied: Record<string, number>): T[] {
  return subjects
    .map((s, i) => ({ s, i, t: lastStudied[s.id] ?? -Infinity }))
    .sort((a, b) => b.t - a.t || a.i - b.i)
    .map(({ s }) => s);
}

/** Mốc học gần nhất của mỗi môn: updatedAt lớn nhất trong các khái niệm đã học (bậc > 0) còn tồn tại. */
export function lastStudiedBySubject(progress: readonly { subject: string; conceptId: string; level: number; updatedAt: number }[], known: Set<string>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of progress) {
    if (p.level <= 0 || !known.has(p.conceptId)) continue;
    out[p.subject] = Math.max(out[p.subject] ?? 0, p.updatedAt);
  }
  return out;
}

/** Tỉ lệ tương phản WCAG 2 giữa hai màu hex #rrggbb (dùng trong test màu kệ). */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** Pha màu hex với đen theo tỉ lệ 0–1 (gáy sách: bóng mép, da bìa cấp 3). */
export function mixBlack(hex: string, amount: number): string {
  const ch = [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - amount)));
  return '#' + ch.map((c) => c.toString(16).padStart(2, '0')).join('');
}
