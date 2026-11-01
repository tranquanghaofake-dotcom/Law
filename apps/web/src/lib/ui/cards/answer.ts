// Câu hỏi và đáp án dạng chữ của một item: dùng cho phản hồi sau câu và màn xem lại câu sai.
import type { Item } from '$lib/content/types';
import type { IntroItem } from '$lib/engine/session';

const BLANK = /\{\{([^{}]+)\}\}/g;

export function promptText(item: Item | IntroItem): string {
  switch (item.type) {
    case 'mcq': case 'case': case 'recall': return item.q;
    case 'truefalse': return item.statement;
    case 'cloze': return item.text.replace(BLANK, '___');
    case 'pair': return `Phân biệt: ${item.left} hay ${item.right}`;
    default: return '';
  }
}

export function answerText(item: Item | IntroItem): string {
  switch (item.type) {
    case 'mcq': case 'case': return item.options[item.answer];
    case 'truefalse': return item.answer ? 'Đúng' : 'Sai';
    case 'cloze': return [...item.text.matchAll(BLANK)].map((m) => m[1]).join(' · ');
    case 'recall': return item.model;
    case 'pair': return item.cases.map((c) => `${c.text} → ${c.answer === 'left' ? item.left : item.right}`).join('\n');
    default: return '';
  }
}
