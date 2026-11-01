import type { Concept, Item } from '$lib/content/types';
import type { IntroItem } from '$lib/engine/session';

export type AnswerResult = { correct: boolean; elapsedMs: number; chosen?: string; selfGrade?: 'dung' | 'gan' | 'sai' };

export type CardProps<I = Item | IntroItem> = {
  concept: Concept;
  item: I;
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
