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
