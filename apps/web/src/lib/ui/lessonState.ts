// Trạng thái từng đợt của một môn theo bậc khái niệm — dùng chung cho trang Hôm nay, trang Môn, lưới bậc.
import type { Lesson, Level, Subject } from '$lib/content/types';

export type LessonSt = 'done' | 'current' | 'locked';

/** Đợt coi là xong khi mọi khái niệm ≥ 3 (đã qua bậc phân biệt). */
export const LESSON_DONE_LEVEL: Level = 3;

export function lessonsOf(subject: Subject): Lesson[] {
  return subject.chapters.flatMap((c) => c.lessons);
}

export function isLessonDone(lesson: Lesson, levels: Record<string, Level>): boolean {
  return lesson.concepts.every((c) => (levels[c] ?? 0) >= LESSON_DONE_LEVEL);
}

/** done = mọi khái niệm ≥ 3; đợt chưa xong đầu tiên = current; còn lại locked. */
export function lessonStates(subject: Subject, levels: Record<string, Level>): Record<string, LessonSt> {
  const out: Record<string, LessonSt> = {};
  let currentFound = false;
  for (const l of lessonsOf(subject)) {
    if (isLessonDone(l, levels)) out[l.id] = 'done';
    else if (!currentFound) { out[l.id] = 'current'; currentFound = true; }
    else out[l.id] = 'locked';
  }
  return out;
}

/** Đợt đang mở (chưa xong đầu tiên); null khi học hết môn. */
export function currentLesson(subject: Subject, levels: Record<string, Level>): Lesson | null {
  return lessonsOf(subject).find((l) => !isLessonDone(l, levels)) ?? null;
}

/** Đợt dở: chưa xong nhưng đã có ít nhất một khái niệm được học (bậc ≥ 1). */
export function inProgressLesson(subject: Subject, levels: Record<string, Level>): Lesson | null {
  return lessonsOf(subject).find((l) => !isLessonDone(l, levels) && l.concepts.some((c) => (levels[c] ?? 0) >= 1)) ?? null;
}
