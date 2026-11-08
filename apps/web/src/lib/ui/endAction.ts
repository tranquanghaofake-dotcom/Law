// Nút hành động ở màn cuối phiên (spec docs/specs/2026-11-07-man-cuoi-phien-design.md §2.3): hàm thuần, có test.
import type { nextReview } from './dueByDay';

export type EndCtx = {
  /** phiên đợt (có `lessonConcepts`) hay phiên ôn */
  kind: 'lesson' | 'review';
  /** cổng mở đợt sau; null = không xét */
  gate: { done: boolean } | null;
  hasNext: boolean;
  hasAgain: boolean;
  /** số khái niệm đến hạn ngay lúc kết thúc phiên */
  dueNow: number;
  next: ReturnType<typeof nextReview>;
};
export type EndAct = 'again' | 'next' | 'review' | 'home';
export type EndButton = { act: EndAct; label: string };
export type EndAction = { primary: EndButton; secondary: EndButton[]; hint: string | null };

const HOME: EndButton = { act: 'home', label: 'Về Hôm nay' };

export function endAction(c: EndCtx): EndAction {
  const gateOpen = !!c.gate && !c.gate.done && c.hasAgain;
  let primary: EndButton;
  if (gateOpen) primary = { act: 'again', label: 'Học lượt tiếp đợt này →' };
  else if (c.kind === 'review' && c.dueNow > 0) primary = { act: 'review', label: `Ôn tiếp (còn ${c.dueNow}) →` };
  else if (c.hasNext) primary = { act: 'next', label: 'Học đợt tiếp →' };
  else if (c.hasAgain) primary = { act: 'again', label: 'Học lại đợt này' };
  else primary = HOME;

  const secondary: EndButton[] = [];
  if (primary.act === 'next' && c.dueNow > 0) secondary.push({ act: 'review', label: `Ôn ${c.dueNow} khái niệm đến hạn` });
  if (primary.act !== 'home') secondary.push(HOME);

  let hint: string | null = null;
  if (c.dueNow > 0) hint = `Còn ${c.dueNow} khái niệm đến hạn ôn ngay.`;
  else if (c.next) {
    const when = c.next.inDays === 0 ? `lúc ${c.next.time} hôm nay` : c.next.inDays === 1 ? 'ngày mai' : `ngày ${c.next.date}`;
    hint = `Ôn lại ${when} · ${c.next.count} khái niệm.`;
  }
  return { primary, secondary, hint };
}
