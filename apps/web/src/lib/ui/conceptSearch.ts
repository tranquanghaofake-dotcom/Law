// Tìm khái niệm không phân biệt dấu: "chu quyen" khớp "Chủ quyền".
export function fold(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/\s+/g, ' ').trim();
}

type Searchable = { term: string; definition: string; plain: string; keywords: string[] };

/** Mọi từ trong truy vấn phải có mặt trong tên/định nghĩa/diễn giải/từ khoá. */
export function matchConcept(c: Searchable, query: string): boolean {
  const words = fold(query).split(' ').filter(Boolean);
  if (!words.length) return true;
  const hay = fold([c.term, c.definition, c.plain, ...c.keywords].join(' '));
  return words.every((w) => hay.includes(w));
}

export type TermIndex = { id: string; short: string; terms: Record<string, string> }[];
export type TermHit = { subject: string; short: string; id: string; term: string };

/**
 * Tìm theo tên khái niệm ở các môn khác (bảng tên `dist/terms`): người học có sẵn thuật ngữ
 * nhưng không biết nó thuộc môn nào. Tên trùng hẳn truy vấn lên trước, rồi tên ngắn hơn.
 */
export function searchOtherSubjects(query: string, index: TermIndex, exclude: string, limit = 6): TermHit[] {
  const q = fold(query);
  if (q.length < 2) return [];
  const words = q.split(' ');
  const hits: TermHit[] = [];
  for (const s of index) {
    if (s.id === exclude) continue;
    for (const [id, term] of Object.entries(s.terms)) {
      const t = fold(term);
      if (words.every((w) => t.includes(w))) hits.push({ subject: s.id, short: s.short, id, term });
    }
  }
  const rank = (h: TermHit) => (fold(h.term) === q ? 0 : 1);
  return hits.sort((a, b) => rank(a) - rank(b) || a.term.length - b.term.length).slice(0, limit);
}
