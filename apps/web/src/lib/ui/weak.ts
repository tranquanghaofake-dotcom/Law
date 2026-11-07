// Nạp dữ liệu cho phần "Điểm yếu" ở Hồ sơ: lượt trả lời 90 ngày + bản đồ khái niệm → (môn, bài) từ nội dung.
import { repo } from '$lib/store/progress-repo';
import { loadIndex, loadSubject } from '$lib/content/loader';
import { accuracyByLevel, weakLessons, type LevelAcc } from '$lib/engine/weak';
import { hashFor } from '$lib/router.svelte';

export type WeakItem = { subject: string; short: string; lesson: string; lessonTitle: string; href: string; tries: number; correct: number; rate: number };
export type WeakData = { items: WeakItem[]; levels: LevelAcc[] };

const DAY = 86_400_000;

export async function loadWeak(now = Date.now()): Promise<WeakData> {
  const rows = await repo.reviews(new Date(now - 90 * DAY));
  if (!rows.length) return { items: [], levels: [] };
  const subjectOf = new Map((await repo.all()).map((p) => [p.conceptId, p.subject]));
  const subjects = [...new Set(rows.map((r) => subjectOf.get(r.conceptId)).filter((s): s is string => !!s))];
  const idx = await loadIndex();
  const short = new Map(idx.subjects.map((s) => [s.id, s.short]));
  const lessonOf = new Map<string, { subject: string; lesson: string }>();
  const title = new Map<string, string>();
  for (const sid of subjects) {
    try {
      const s = await loadSubject(sid);
      for (const ch of s.chapters) for (const l of ch.lessons) {
        title.set(`${sid}/${l.id}`, l.title);
        for (const c of l.concepts) if (!lessonOf.has(c)) lessonOf.set(c, { subject: sid, lesson: l.id });
      }
    } catch { /* môn không tải được: bỏ qua */ }
  }
  const items = weakLessons(rows, (id) => lessonOf.get(id), { now }).map((w) => ({
    ...w,
    short: short.get(w.subject) ?? w.subject,
    lessonTitle: title.get(`${w.subject}/${w.lesson}`) ?? w.lesson,
    href: hashFor('lesson', { subject: w.subject, lesson: w.lesson }),
  }));
  return { items, levels: accuracyByLevel(rows, { now }) };
}
