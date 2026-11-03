// Khối "Đang học" ở sidebar (≥ 1280): chỉ hiện khi thẻ chính của Hôm nay không phải ôn/bắt đầu/xong, để khỏi trùng.
import type { Level, Subject } from '$lib/content/types';
import { hashFor } from '$lib/router.svelte';
import { pickHeroState } from './today';

export type SideStudy = { subject: string; lesson: string; href: string };

export function sideStudy(a: { subjects: Subject[]; levels: Record<string, Level>; recent: Record<string, number>; dueCount: number }): SideStudy | null {
  if (a.dueCount > 0) return null;
  const h = pickHeroState({ due: [], subjects: a.subjects, levels: a.levels, recent: a.recent });
  if (h.kind !== 'continue' && h.kind !== 'next') return null;
  return { subject: h.subject.title, lesson: h.lesson.title, href: hashFor('lesson', { subject: h.subject.id, lesson: h.lesson.id }) };
}

/** Cuối ngày (23:59:59.999) sau `days` ngày kể từ `from`: mốc cho repo.due. */
export function dueWindow(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 59, 999);
  return d;
}
