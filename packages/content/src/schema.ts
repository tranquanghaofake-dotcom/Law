import { z } from 'zod';

const dateYmd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'ngày phải dạng YYYY-MM-DD');

export const sourceSchema = z.object({
  kind: z.enum(['statute', 'textbook', 'primary']),
  cite: z.string().min(1),
  url: z.string().url().optional(),
});

const fourOptions = z
  .array(z.string().min(1))
  .refine((o) => o.length === 4 && new Set(o).size === 4, { message: 'cần đúng 4 phương án khác nhau' });

const mcqBase = {
  q: z.string().min(1),
  options: fourOptions,
  answer: z.number().int().min(0).max(3),
  explain: z.string().min(1),
  source: sourceSchema.optional(),
  /** Vì sao từng phương án đúng/sai (tuỳ chọn, cùng thứ tự `options`): sai câu nào thì hiện câu giải thích của đúng phương án đó. */
  why: z.array(z.string().min(1, 'why không được để trống')).length(4, 'why cần 4 lời giải thích, mỗi phương án một câu').optional(),
};

export const itemMcqSchema = z.object({ type: z.literal('mcq'), level: z.literal(1), ...mcqBase });
export const itemCaseSchema = z.object({ type: z.literal('case'), level: z.literal(4), ...mcqBase });

export const itemPairSchema = z.object({
  type: z.literal('pair'),
  level: z.literal(2),
  left: z.string().min(1),
  right: z.string().min(1),
  // basis (đợt 7, tuỳ chọn): căn cứ điều/khoản của riêng tình huống, vd. "Khoản 1 Điều 12 Luật Cạnh tranh 2018"
  cases: z.array(z.object({ text: z.string().min(1), answer: z.enum(['left', 'right']), basis: z.string().min(1).optional() })).min(2, 'pair cần ít nhất 2 tình huống'),
  explain: z.string().min(1),
});

export const BLANK_RE = /\{\{([^{}]+)\}\}/g;

export const itemClozeSchema = z.object({
  type: z.literal('cloze'),
  level: z.literal(3),
  text: z.string().refine((t) => {
    const n = [...t.matchAll(BLANK_RE)].length;
    return n >= 1 && n <= 3;
  }, { message: 'cloze cần 1–3 chỗ trống dạng {{...}}' }),
  synonyms: z.record(z.string(), z.array(z.string())).optional(),
  bank_extra: z.array(z.string()).optional(),
  source: sourceSchema.optional(),
});

export const itemRecallSchema = z.object({
  type: z.literal('recall'),
  level: z.literal(5),
  q: z.string().min(1),
  model: z.string().min(1),
  keywords: z.array(z.string().min(1)).min(3, 'recall cần 3–5 từ khóa').max(5, 'recall cần 3–5 từ khóa'),
});

export const itemTrueFalseSchema = z.object({
  type: z.literal('truefalse'),
  level: z.literal(4),
  statement: z.string().min(1),
  answer: z.boolean(),
  explain: z.string().min(1),
  source: sourceSchema.optional(),
});

export const itemSchema = z.discriminatedUnion('type', [
  itemMcqSchema,
  itemCaseSchema,
  itemPairSchema,
  itemClozeSchema,
  itemRecallSchema,
  itemTrueFalseSchema,
]);

const slug = z.string().regex(/^[a-z0-9-]+$/, 'id chỉ gồm chữ thường, số, gạch nối');

const memoLabel = z.string().min(1).max(60, 'nhãn sơ đồ tối đa 60 ký tự');
/** Lời thường (thẻ hiện mặc định, giọng đọc): không viết tắt / IN HOA (≥ 2 chữ hoa liền nhau), không "(…)". */
export function plainIssue(s: string): string | null {
  if (/\p{Lu}{2,}/u.test(s)) return `"${s}": có viết tắt hoặc IN HOA`;
  if (/\(…\)|\.\.\./.test(s)) return `"${s}": có dấu (…)`;
  return null;
}
const tokens = (s: string) => s.toLowerCase().normalize('NFC').split(/[^\p{L}\p{N}]+/u).filter((w) => w.length >= 2);
/** Tỉ lệ chữ của `a` có mặt trong `b`. */
export function overlap(a: string, b: string): number {
  const ta = tokens(a), tb = new Set(tokens(b));
  return ta.length ? ta.filter((w) => tb.has(w)).length / ta.length : 0;
}
/** Bộ icon nhánh sơ đồ (hình vẽ ở apps/web/src/lib/art/memoIcons.ts). */
export const MEMO_ICONS = ['state', 'scales', 'scroll', 'book', 'doc', 'list', 'pen', 'vote', 'announce', 'stamp', 'calendar', 'clock', 'pause', 'end', 'cycle', 'infinity', 'check', 'ban', 'warn', 'question', 'idea', 'bolt', 'star', 'crown', 'new', 'person', 'people', 'family', 'child', 'handshake', 'fist', 'mask', 'heart', 'conflict', 'eye', 'search', 'compare', 'arrow', 'top', 'stairs', 'door', 'target', 'link', 'puzzle', 'measure', 'chart', 'calc', 'money', 'bank', 'cart', 'gift', 'box', 'tool', 'company', 'home', 'village', 'key', 'lock', 'unlock', 'shield', 'map', 'globe', 'flag', 'pin', 'plant', 'vehicle', 'health', 'device', 'trash', 'cut', 'animal', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6'] as const;

export const MEMO_KINDS = ['ladder', 'checklist', 'steps', 'compare', 'tree'] as const;

export const memoSchema = z.object({
  /** Hiểu nhanh: câu lời thường ≤ 25 chữ nói khái niệm là gì, để làm gì. */
  gist: z.string().min(1).refine((g) => g.trim().split(/\s+/).length <= 25, 'Hiểu nhanh tối đa 25 chữ').optional(),
  /** Kiểu hình: bậc thang, danh sách điều kiện, các bước, hai cột, cây. */
  kind: z.enum(MEMO_KINDS).optional(),
  hook: z.string().min(1).max(160, 'mẹo nhớ tối đa 160 ký tự').optional(),
  tree: z.array(z.object({ label: memoLabel, icon: z.enum(MEMO_ICONS, { message: 'icon nhánh phải là tên trong bộ icon' }).optional(), children: z.array(memoLabel).max(4, 'mỗi nhánh tối đa 4 ý').optional() })).min(2, 'sơ đồ cần 2–6 nhánh').max(6, 'sơ đồ cần 2–6 nhánh').optional(),
  /** Tình huống hỏi – đáp: tự trả lời trong đầu trước khi xem đáp. */
  case: z.object({
    q: z.string().min(1).refine((q) => q.trim().endsWith('?'), 'câu hỏi tình huống phải kết thúc bằng dấu hỏi'),
    a: z.string().min(1).refine((a) => a.trim().split(/\s+/).length <= 30, 'đáp tình huống tối đa 30 chữ'),
  }).optional(),
  /** Câu phân biệt với khái niệm hay nhầm (id), dùng thay hai cột cụm từ khi trả lời sai. */
  contrast: z.array(z.object({ with: slug, text: z.string().min(1).refine((t) => t.trim().split(/\s+/).length <= 40, 'câu phân biệt tối đa 40 chữ') })).optional(),
}).refine((m) => !!m.hook || !!m.tree, { message: 'memo cần hook hoặc tree' })
  // có gist = khái niệm đã chuyển sang "lời thường": mọi chữ hiện mặc định phải đạt luật viết
  .superRefine((m, ctx) => {
    if (!m.gist) return;
    const texts = [m.gist, m.hook ?? '', ...(m.tree ?? []).flatMap((n) => [n.label, ...(n.children ?? [])]), m.case?.q ?? '', m.case?.a ?? '', ...(m.contrast ?? []).map((c) => c.text)].filter(Boolean);
    for (const t of texts) {
      const issue = plainIssue(t);
      if (issue) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `phải là lời thường — ${issue}` });
    }
    // mẹo nhớ phải là cách nhớ mới (so sánh, vần, chữ tắt), không nhắc lại Hiểu nhanh
    if (m.hook && overlap(m.hook, m.gist) > 0.5) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `mẹo nhớ nhắc lại Hiểu nhanh — "${m.hook}"` });
  });

export const conceptSchema = z.object({
  id: slug,
  subject: slug,
  chapter: slug,
  term: z.string().min(1),
  definition: z.string().min(1),
  plain: z.string().min(1),
  example: z.string().min(1),
  source: sourceSchema,
  checked: dateYmd,
  confusables: z.array(slug),
  keywords: z.array(z.string().min(1)),
  // Ghi chú khi luật hiện hành đã khác giáo trình (giáo trình là kim chỉ nam, luật mới ghi kèm).
  note: z.string().min(1).optional(),
  // Sơ đồ/mẹo nhớ do người soạn: DIỄN GIẢI để học, không phải nguyên văn (giao diện gắn nhãn rõ).
  memo: memoSchema.optional(),
  items: z.array(itemSchema).refine((items) => items.some((i) => i.level === 1), { message: 'thiếu item bậc 1 (mcq)' })
    .refine((items) => items.some((i) => i.level === 3), { message: 'thiếu item bậc 3 (cloze)' })
    .refine((items) => items.some((i) => i.level === 4), { message: 'thiếu item bậc 4 (case hoặc truefalse)' }),
}).superRefine((c, ctx) => {
  // khái niệm đã có Hiểu nhanh: ví dụ hiện mặc định trên thẻ cũng phải là lời thường
  const issue = c.memo?.gist ? plainIssue(c.example) : null;
  if (issue) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['example'], message: `ví dụ phải là lời thường — ${issue}` });
});

export const lessonSchema = z.object({ id: slug, title: z.string().min(1), concepts: z.array(slug).min(1) });
export const chapterSchema = z.object({ id: slug, title: z.string().min(1), advanced: z.boolean().optional(), lessons: z.array(lessonSchema).min(1) });
export const subjectSchema = z.object({ id: slug, title: z.string().min(1), short: z.string().min(1), chapters: z.array(chapterSchema).min(1) });

export const quizQuestionSchema = z.object({
  q: z.string().min(1),
  options: fourOptions,
  answer: z.number().int().min(0).max(3),
  explain: z.string().min(1),
  basis: z.string().min(1),
  url: z.string().optional(),
  concept: slug.optional(),
  why: z.array(z.string().min(1, 'why không được để trống')).length(4, 'why cần 4 lời giải thích, mỗi phương án một câu').optional(),
});
export const quizSetSchema = z.object({
  id: slug,
  group: slug,
  title: z.string().min(1),
  subtitle: z.string(),
  updated: dateYmd,
  questions: z.array(quizQuestionSchema).min(1),
});
