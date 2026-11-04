import type { Concept } from '$lib/content/types';
import type { StepItem, StepMeta } from '$lib/engine/session';

export type AnswerResult = { correct: boolean; elapsedMs: number; chosen?: string; selfGrade?: 'dung' | 'gan' | 'sai' };

export type CardProps<I = StepItem> = {
  concept: Concept;
  item: I;
  /** Đợt 6: nhãn dạng sinh tự động, câu vàng, vòng sửa sai (xem lib/engine/step.ts). */
  meta?: StepMeta;
  rng: () => number;
  onanswer: (r: AnswerResult) => void;
  onspeak?: (text: string) => void;
};

export const KEYS = ['A', 'B', 'C', 'D'] as const;

/** Phím tắt chỉ áp dụng khi không gõ trong ô nhập. */
export function isTypingTarget(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}

const INTERACTIVE = 'a[href], button, summary, select, input, textarea, [role="button"], [role="link"], [contenteditable=""], [contenteditable="true"]';

/** Phím Enter/Space đang nhắm vào một phần tử tự xử lý được (link, nút, ô nhập…): phím tắt toàn cục phải nhường cho hành vi gốc. */
export function isInteractiveTarget(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  if (!t || typeof t.closest !== 'function') return false;
  return t.isContentEditable || !!t.closest(INTERACTIVE);
}
