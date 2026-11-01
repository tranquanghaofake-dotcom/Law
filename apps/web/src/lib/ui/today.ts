// Chọn thẻ hành động duy nhất của trang Hôm nay theo trạng thái người học (spec §3.1).
import type { Lesson, Level, Subject } from '$lib/content/types';
import { currentLesson, inProgressLesson, LESSON_DONE_LEVEL } from './lessonState';
import { REVIEW_MAX_STEPS } from '$lib/engine/session';

export type HeroState =
  | { kind: 'due'; count: number; terms: string[]; minutes: number }
  | { kind: 'continue'; subject: Subject; lesson: Lesson; done: number; total: number }
  | { kind: 'next'; subject: Subject; lesson: Lesson; minutes: number }
  | { kind: 'start'; subject: Subject; lesson: Lesson }
  | { kind: 'done' };

export type HeroInput = {
  due: { conceptId: string; term?: string }[];
  subjects: Subject[];
  levels: Record<string, Level>;
  /** Số bước của phiên ôn (nếu đã dựng); mặc định = số khái niệm đến hạn. */
  dueSteps?: number;
};

/** 25 giây một bước, làm tròn, tối thiểu 1 phút. */
export const minutesFor = (steps: number): number => Math.max(1, Math.round((steps * 25) / 60));

/** Đợt học mới (pass 1): giới thiệu + 1 bài mỗi khái niệm. */
const LEARN_STEPS_PER_CONCEPT = 2;

/** Tập id khái niệm còn tồn tại trong các môn hiện có. */
export function knownConcepts(subjects: Subject[]): Set<string> {
  return new Set(subjects.flatMap((s) => s.chapters.flatMap((c) => c.lessons.flatMap((l) => l.concepts))));
}

export function pickHeroState({ due, subjects, levels, dueSteps }: HeroInput): HeroState {
  const known = knownConcepts(subjects);
  // Tiến độ cũ có thể trỏ tới khái niệm/môn đã bỏ khỏi nội dung: bỏ qua, không để kẹt ở thẻ 'due'.
  const liveDue = due.filter((d) => known.has(d.conceptId));
  if (liveDue.length > 0) {
    return { kind: 'due', count: liveDue.length, terms: liveDue.slice(0, 3).map((d) => d.term ?? d.conceptId), minutes: minutesFor(Math.min(dueSteps ?? liveDue.length, REVIEW_MAX_STEPS)) };
  }
  for (const subject of subjects) {
    const lesson = inProgressLesson(subject, levels);
    if (lesson) {
      const done = lesson.concepts.filter((c) => (levels[c] ?? 0) >= LESSON_DONE_LEVEL).length;
      return { kind: 'continue', subject, lesson, done, total: lesson.concepts.length };
    }
  }
  const hasProgress = Object.entries(levels).some(([id, lv]) => lv > 0 && known.has(id));
  for (const subject of subjects) {
    const lesson = currentLesson(subject, levels);
    if (!lesson) continue;
    if (hasProgress) return { kind: 'next', subject, lesson, minutes: minutesFor(lesson.concepts.length * LEARN_STEPS_PER_CONCEPT) };
    return { kind: 'start', subject, lesson };
  }
  return { kind: 'done' };
}
