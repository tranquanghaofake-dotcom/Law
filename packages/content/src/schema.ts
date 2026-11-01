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
};

export const itemMcqSchema = z.object({ type: z.literal('mcq'), level: z.literal(1), ...mcqBase });
export const itemCaseSchema = z.object({ type: z.literal('case'), level: z.literal(4), ...mcqBase });

export const itemPairSchema = z.object({
  type: z.literal('pair'),
  level: z.literal(2),
  left: z.string().min(1),
  right: z.string().min(1),
  cases: z.array(z.object({ text: z.string().min(1), answer: z.enum(['left', 'right']) })).min(2, 'pair cần ít nhất 2 tình huống'),
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
  items: z.array(itemSchema).refine((items) => items.some((i) => i.level === 1), { message: 'thiếu item bậc 1 (mcq)' })
    .refine((items) => items.some((i) => i.level === 3), { message: 'thiếu item bậc 3 (cloze)' })
    .refine((items) => items.some((i) => i.level === 4), { message: 'thiếu item bậc 4 (case hoặc truefalse)' }),
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
});
export const quizSetSchema = z.object({
  id: slug,
  group: slug,
  title: z.string().min(1),
  subtitle: z.string(),
  updated: dateYmd,
  questions: z.array(quizQuestionSchema).min(1),
});
