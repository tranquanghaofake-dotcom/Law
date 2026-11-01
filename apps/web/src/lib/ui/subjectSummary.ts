// Số liệu đầu trang môn và thẻ danh sách môn (spec §4.1–4.2).
import type { Level, Subject } from '$lib/content/types';
import { GRADES, gradeFor } from '$lib/game/rank';
import { masteredCount } from '$lib/game/levels';

export type SubjectSummary = {
  chapters: number; lessons: number; total: number; mastered: number; percent: number;
  grade: string | null; nextGrade: string | null; needForNext: number;
};

export function subjectSummary(subject: Subject, levels: Record<string, Level>): SubjectSummary {
  const lessons = subject.chapters.flatMap((c) => c.lessons);
  const ids = lessons.flatMap((l) => l.concepts);
  const total = ids.length;
  const mastered = masteredCount(ids, levels);
  const ratio = total ? mastered / total : 0;
  const grade = total ? gradeFor(ratio) : null;
  const idx = grade ? GRADES.indexOf(grade) : -1; // -1 = chưa có phẩm
  const nextGrade = idx < GRADES.length - 1 ? GRADES[idx + 1] : null;
  // phẩm thứ k (1-based) cần tỉ lệ ≥ k/10
  const needForNext = nextGrade && total ? Math.max(0, Math.ceil(((idx + 2) / 10) * total - 1e-9) - mastered) : 0;
  return { chapters: subject.chapters.length, lessons: lessons.length, total, mastered, percent: Math.round(ratio * 100), grade, nextGrade, needForNext };
}
