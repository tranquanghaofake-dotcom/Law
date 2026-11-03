// Câu hỏi và đáp án dạng chữ của một item: dùng cho phản hồi sau câu và màn xem lại câu sai.
import type { StepItem } from '$lib/engine/session';

const BLANK = /\{\{([^{}]+)\}\}/g;

export function promptText(item: StepItem): string {
  switch (item.type) {
    case 'mcq': case 'case': case 'recall': return item.q;
    case 'truefalse': return item.statement;
    case 'cloze': return item.text.replace(BLANK, '___');
    case 'pair': case 'sort': return `Phân biệt: ${item.left} hay ${item.right}`;
    case 'match': return 'Ghép thuật ngữ với mô tả';
    default: return '';
  }
}

export function answerText(item: StepItem): string {
  switch (item.type) {
    case 'mcq': case 'case': return item.options[item.answer];
    case 'truefalse': return item.answer ? 'Đúng' : 'Sai';
    case 'cloze': return [...item.text.matchAll(BLANK)].map((m) => m[1]).join(' · ');
    case 'recall': return item.model;
    case 'pair': case 'sort': return item.cases.map((c) => `${c.text} → ${c.answer === 'left' ? item.left : item.right}`).join('\n');
    case 'match': return item.pairs.map((p) => `${p.term} — ${p.text}`).join('\n');
    default: return '';
  }
}
