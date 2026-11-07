// Kiểm chất lượng câu hỏi theo quy tắc viết câu trắc nghiệm của NBME / Haladyna–Downing–Rodriguez (2002).
// Chỉ ĐO và LIỆT KÊ câu cần viết lại; không tự sửa nội dung luật. Các quy tắc về độ dài đáp án, từ tuyệt đối trong
// phương án, đuôi chữ độn đã có ở tests/distractors.test.ts — file này bổ sung ba quy tắc còn thiếu.
import type { Concept } from './types';

export type Rule = 'stem-phu-dinh' | 'clang' | 'tf-tuyet-doi';
export type Finding = { rule: Rule; subject: string; conceptId: string; item: number; text: string };

/** Từ tuyệt đối; giữ đồng bộ với `hasAbsoluteWord` ở apps/web/src/lib/engine/text.ts. */
const ABSOLUTE = /(?<![\p{L}])(?:luôn|mọi|tất cả|không bao giờ|duy nhất|đều|bắt buộc|không thể|chỉ)(?![\p{L}])/iu;
/** Stem phủ định: câu hỏi "cái nào KHÔNG/SAI…" buộc người học đảo logic, dễ trả lời sai vì đọc vội (NBME: tránh). */
const NEGATIVE_STEM = /(?<![\p{L}])(?:không phải|không đúng|không thuộc|không bao gồm|ngoại trừ|trừ trường hợp|sai(?! (?:sự|lệch|phạm|trái|lầm)))(?![\p{L}])|\bKHÔNG\b/u;
const STOP = new Set('và của là các những trong theo cho được có không một để khi với về này đó tại do bởi như hoặc thì nào sau đây đã sẽ bị phải'.split(' '));

export const wordsOf = (s: string): Set<string> => new Set((s.toLowerCase().match(/\p{L}+/gu) ?? []).filter((w) => w.length > 2 && !STOP.has(w)));

/** Số tiếng (không tính từ nối) mà hai chuỗi chung nhau. */
export const sharedWords = (a: string, b: string): number => {
  const wb = wordsOf(b);
  let n = 0;
  for (const w of wordsOf(a)) if (wb.has(w)) n++;
  return n;
};

/** Đáp án đúng là phương án DUY NHẤT trùng nhiều chữ nhất với stem (≥ 2 tiếng): đoán được bằng mặt chữ (clang association). */
export function isClang(q: string, options: string[], answer: number): boolean {
  const sc = options.map((o) => sharedWords(q, o));
  const max = Math.max(...sc);
  return max >= 2 && sc[answer] === max && sc.filter((s) => s === max).length === 1;
}

export function lintConcept(c: Concept): Finding[] {
  const out: Finding[] = [];
  c.items.forEach((it, item) => {
    const add = (rule: Rule, text: string) => out.push({ rule, subject: c.subject, conceptId: c.id, item, text });
    if (it.type === 'mcq' || it.type === 'case') {
      // NBME: nếu buộc phải dùng stem phủ định thì in hoa chữ phủ định và để phương án ngắn — đạt cả hai thì chấp nhận
      // (câu "loại nào KHÔNG thuộc danh sách khoản X" là dạng loại trừ hợp lệ trong đề luật).
      const emphasized = /\bKHÔNG\b/.test(it.q) && it.options.every((o) => o.length <= 80);
      if (NEGATIVE_STEM.test(it.q) && !emphasized) add('stem-phu-dinh', it.q);
      if (isClang(it.q, it.options, it.answer)) add('clang', it.q);
    }
    if (it.type === 'truefalse' && !it.answer && ABSOLUTE.test(it.statement)) add('tf-tuyet-doi', it.statement);
  });
  return out;
}

export function lintAll(concepts: Concept[]): Finding[] {
  return concepts.flatMap(lintConcept);
}
