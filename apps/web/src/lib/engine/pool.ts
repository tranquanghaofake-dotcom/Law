// Chọn khái niệm nạp thêm cho một phiên (để làm phương án nhiễu / gộp tình huống Phân biệt) mà không tải cả môn.
import type { Concept, Subject } from '$lib/content/types';

/** Số khái niệm nạp thêm tối đa cho một phiên (mỗi khái niệm 1 request JSON). */
export const POOL_MAX = 8;

/**
 * Id khái niệm nạp thêm cho đợt học: khái niệm dễ nhầm của các khái niệm trong đợt trước,
 * rồi các khái niệm cùng chương (gần đợt nhất trước), bỏ khái niệm đã có, tối đa `max`.
 */
export function lessonPoolIds(subject: Subject, lessonConcepts: Concept[], max = POOL_MAX): string[] {
  const have = new Set(lessonConcepts.map((c) => c.id));
  const out: string[] = [];
  const add = (id: string) => { if (!have.has(id) && !out.includes(id)) out.push(id); };
  for (const c of lessonConcepts) for (const id of c.confusables) add(id);
  const chapters = new Set(lessonConcepts.map((c) => c.chapter));
  for (const ch of subject.chapters) if (chapters.has(ch.id)) {
    const ids = ch.lessons.flatMap((l) => l.concepts);
    const at = ids.findIndex((id) => have.has(id));
    // gần đợt hiện tại trước (khoảng cách theo thứ tự trong chương)
    const near = ids.map((id, k) => ({ id, d: Math.abs(k - Math.max(0, at)) })).sort((a, b) => a.d - b.d);
    for (const x of near) add(x.id);
  }
  return out.slice(0, max);
}

/** Id khái niệm dễ nhầm (theo môn) của các khái niệm cần ôn, chưa nạp, tối đa `max`. */
export function reviewPoolIds(concepts: Concept[], max = POOL_MAX): { subject: string; id: string }[] {
  const have = new Set(concepts.map((c) => `${c.subject}/${c.id}`));
  const out: { subject: string; id: string }[] = [];
  for (const c of concepts) for (const id of c.confusables) {
    const k = `${c.subject}/${id}`;
    if (have.has(k) || out.some((o) => `${o.subject}/${o.id}` === k)) continue;
    out.push({ subject: c.subject, id });
  }
  return out.slice(0, max);
}
