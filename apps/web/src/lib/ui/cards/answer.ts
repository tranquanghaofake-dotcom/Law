// Câu hỏi và đáp án dạng chữ của một item: dùng cho phản hồi sau câu và màn xem lại câu sai.
import type { Concept } from '$lib/content/types';
import type { Step, StepItem } from '$lib/engine/session';
import { MASK } from '$lib/engine/text';

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

/** Câu điền khuyết đã điền đủ đáp án (sau khi trả lời hiện cả câu để đọc liền mạch, không chỉ từng chỗ trống). */
export function filledCloze(item: StepItem): string {
  return item.type === 'cloze' ? item.text.replace(BLANK, '$1') : '';
}

/** Lời giải thích của một item (recall dùng đáp án mẫu); chuỗi rỗng nếu không có. */
export function explainText(item: StepItem): string {
  if (item.type === 'recall') return item.model;
  return 'explain' in item ? item.explain : '';
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

/**
 * Màn xem lại câu sai: câu hỏi/đáp án sinh tự động ở dạng che "[…]" (để khỏi lộ đáp án lúc đang làm)
 * thì sau khi đã trả lời phải hiện văn bản đầy đủ — định nghĩa gốc của khái niệm.
 */
export function reviewTexts(step: Step, concepts: Concept[]): { prompt: string; answer: string } {
  const { item } = step;
  const c = concepts.find((x) => x.id === step.conceptId);
  const gen = step.meta?.gen;
  const full = (s: string): string => (c && s.includes(MASK) ? s.replace(/«[^«»]*»/, `«${c.definition}»`) : s);
  const prompt = promptText(item);
  const answer = answerText(item);
  if (item.type === 'mcq' && gen === 'def-term') return { prompt: full(prompt), answer };
  if (item.type === 'mcq' && gen === 'term-def' && c) return { prompt, answer: c.definition };
  if (item.type === 'truefalse' && gen === 'def-tf') return { prompt: full(prompt), answer };
  if (item.type === 'match') {
    const lines = item.pairs.map((p) => {
      const pc = concepts.find((x) => x.id === p.conceptId);
      return `${p.term} — ${pc && p.text.includes(MASK) ? fullMatchText(pc, p.text) : p.text}`;
    });
    return { prompt, answer: lines.join('\n') };
  }
  return { prompt, answer };
}

/** Mô tả ghép cặp lấy từ `plain` hoặc `definition`: chọn nguồn chứa đoạn không bị che dài nhất. */
function fullMatchText(c: Concept, masked: string): string {
  const seg = masked.split(MASK).map((s) => s.trim()).sort((a, b) => b.length - a.length)[0] ?? '';
  const core = seg.replace(/…$/, '').trim();
  return core && c.plain.includes(core) ? c.plain : c.definition;
}
