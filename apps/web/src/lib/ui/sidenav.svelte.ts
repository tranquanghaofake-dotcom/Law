/** Khối "Đang học" của sidebar: làm mới cùng lúc với refreshShelf() (sau phiên học). */
import type { Level } from '$lib/content/types';
import { loadIndex, loadSubject } from '$lib/content/loader';
import { repo } from '$lib/store/progress-repo';
import { knownConcepts } from './today';
import { orderedSubjects, lastStudiedBySubject } from './shelves';
import { sideStudy, type SideStudy } from './sideStudy';

export const sidenav = $state<{ study: SideStudy | null }>({ study: null });

export async function refreshSidenav(): Promise<void> {
  try {
    const idx = await loadIndex();
    const subjects = orderedSubjects(await Promise.all(idx.subjects.filter((s) => (idx.conceptCount[s.id] ?? 0) > 0).map((s) => loadSubject(s.id))));
    const known = knownConcepts(subjects);
    const all = await repo.all();
    const levels = Object.fromEntries(all.map((p) => [p.conceptId, p.level])) as Record<string, Level>;
    const dueCount = (await repo.due(new Date())).filter((p) => known.has(p.conceptId)).length;
    sidenav.study = sideStudy({ subjects, levels, recent: lastStudiedBySubject(all, known), dueCount });
  } catch { /* chưa tải được nội dung: không hiện khối */ }
}
