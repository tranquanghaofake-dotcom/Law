// Lời đọc sau khi chọn đáp án: "Chính xác." / "Chưa đúng. Đáp án: …." + giải thích.
// Dạng nhiều dòng (ghép cặp, xếp cột) chỉ đọc tóm tắt đúng/sai và giải thích, không đọc cả danh sách.
import type { StepItem } from '$lib/engine/session';
import type { AnswerResult } from '$lib/ui/cards/types';
import { answerText, explainText } from '$lib/ui/cards/answer';

const ratio = (chosen?: string) => {
  const m = chosen?.match(/^(\d+)\/(\d+)$/);
  return m ? { ok: Number(m[1]), total: Number(m[2]) } : null;
};

/** Gộp khoảng trắng và đảm bảo câu kết thúc bằng dấu chấm để giọng đọc ngắt nghỉ đúng. */
const sentence = (s: string) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t && !/[.!?…]$/.test(t) ? `${t}.` : t;
};

export function feedbackSpeech(item: StepItem, result: Pick<AnswerResult, 'correct' | 'chosen'>): string {
  const explain = sentence(explainText(item));
  const parts: string[] = [];
  if (result.correct) parts.push('Chính xác.');
  else if (item.type === 'pair' || item.type === 'sort') {
    const r = ratio(result.chosen);
    parts.push(r ? `Chưa đúng. Xếp đúng ${r.ok} trên ${r.total} tình huống.` : 'Chưa đúng.');
  } else if (item.type === 'match') {
    const r = ratio(result.chosen);
    parts.push(r ? `Chưa đúng. Ghép đúng ngay lần đầu ${r.ok} trên ${r.total} cặp.` : 'Chưa đúng.');
  } else if (item.type === 'recall') {
    parts.push('Chưa đúng.');
  } else {
    const a = answerText(item);
    parts.push(a ? `Chưa đúng. Đáp án: ${sentence(a)}` : 'Chưa đúng.');
  }
  if (explain) parts.push(explain);
  return parts.join(' ');
}
