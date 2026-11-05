// Lời đọc đề ngay khi thẻ hiện (promptSpeech, không lộ đáp án) và lời đọc sau khi chọn đáp án: "Chính xác." / "Chưa đúng. Đáp án: …." + giải thích.
// Dạng nhiều dòng (ghép cặp, xếp cột) chỉ đọc tóm tắt đúng/sai và giải thích, không đọc cả danh sách.
import type { StepItem } from '$lib/engine/session';
import type { AnswerResult } from '$lib/ui/cards/types';
import type { Concept } from '$lib/content/types';
import { answerText, explainText } from '$lib/ui/cards/answer';
import { KEYS } from '$lib/ui/cards/types';
import { MASK } from '$lib/engine/text';

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
  const single = item.type === 'mcq' || item.type === 'case' || item.type === 'truefalse' || item.type === 'cloze';
  if (result.correct) {
    const a = single ? answerText(item) : '';
    parts.push(a ? `Chính xác. Đáp án: ${sentence(a)}` : 'Chính xác.');
  }
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

const SO = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu'];
type Node = { label: string; children?: string[] };
const item = (n: Node) => (n.children?.length ? `${n.label}: ${n.children.join(', ')}` : n.label);

/**
 * Đọc hình của thẻ (memo.kind + tree) để người NGHE cũng nắm được khung: bậc thang đọc "từ cao xuống thấp",
 * các bước / điều kiện / cây đọc "một, hai, ba", hai cột đọc "so sánh … còn …". Mỗi ý là một câu (dùng lại mp3).
 */
export function diagramSpeech(memo: { kind?: string; tree?: Node[] }): string {
  const tree = memo.tree ?? [];
  if (!tree.length) return '';
  const list = tree.map((n, i) => `${SO[i + 1] ? SO[i + 1][0].toUpperCase() + SO[i + 1].slice(1) : i + 1}, ${item(n)}.`).join(' ');
  const n = SO[tree.length] ?? String(tree.length);
  switch (memo.kind) {
    case 'ladder': return `Từ cao xuống thấp: ${tree.map((x, i) => (i ? 'rồi ' : '') + (x.children?.length ? `${x.label}, của ${x.children.join(', ')}` : x.label)).join('; ')}.`;
    case 'steps': return `Có ${n} bước. ${list}`;
    case 'checklist': return `Cần đủ ${n} điều. ${list}`;
    case 'compare': return `So sánh. ${item(tree[0])}.${tree[1] ? ` Còn ${item(tree[1])}.` : ''}`;
    default: return `Gồm ${n} ý. ${list}`;
  }
}

/** "[…]" (che tên khái niệm) đọc thành "chỗ trống". */
const unmask = (s: string) => s.split(MASK).join('chỗ trống');

/**
 * Lời đọc đề/khái niệm khi thẻ vừa hiện. Không bao giờ chứa đáp án hay giải thích.
 * `shown`: thứ tự phương án đang hiện trên thẻ (thẻ trắc nghiệm xáo phương án); thiếu thì theo dữ liệu.
 */
export function promptSpeech(item: StepItem, concept: Pick<Concept, 'term' | 'definition' | 'memo'>, shown?: string[]): string {
  switch (item.type) {
    case 'intro': {
      const hook = concept.memo?.hook;
      // có Hiểu nhanh (lời thường): đọc nó thay cho nguyên văn — nghe dễ hiểu, không có "(…)" hay viết tắt
      const gist = concept.memo?.gist;
      if (gist) return [sentence(concept.term), sentence(gist), diagramSpeech(concept.memo ?? {}), hook ? `Mẹo nhớ: ${sentence(hook)}` : '', concept.memo?.case ? `Thử nghĩ: ${sentence(concept.memo.case.q)}` : ''].filter(Boolean).join(' ');
      // giữ đúng dạng cũ "tên. định nghĩa" (trùng nút Nghe của thẻ) để dùng lại mp3 đã sinh
      const base = `${concept.term}. ${concept.definition}`;
      // định nghĩa kết thúc bằng ; hoặc : thì chốt câu để mẹo nhớ thành câu riêng (tệp riêng)
      return hook ? `${sentence(base.replace(/[;:,]\s*$/, ''))} Mẹo nhớ: ${sentence(hook)}` : base;
    }
    case 'mcq': case 'case': {
      // chữ cái là câu riêng → mp3 "Phương án A." dùng lại cho mọi câu hỏi
      const opts = (shown ?? item.options).map((o, i) => `Phương án ${KEYS[i] ?? i + 1}. ${sentence(unmask(o))}`);
      return [sentence(unmask(item.q)), ...opts].join(' ');
    }
    case 'recall': return sentence(unmask(item.q));
    case 'truefalse': return `Đúng hay sai? ${sentence(unmask(item.statement))}`;
    case 'cloze': return `Điền vào chỗ trống: ${sentence(unmask(item.text.replace(/\{\{[^{}]+\}\}/g, 'chỗ trống')))}`;
    case 'pair': case 'sort': return `Phân biệt: ${item.left} hay ${item.right}.`;
    case 'match': return 'Ghép thuật ngữ với mô tả.';
    default: return '';
  }
}
