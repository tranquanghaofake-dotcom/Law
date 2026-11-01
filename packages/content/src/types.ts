// Kiểu dữ liệu nội dung. Nguồn sự thật về ràng buộc là schema.ts (zod); file này chỉ là kiểu TS.
export type Source = { kind: 'statute' | 'textbook' | 'primary'; cite: string; url?: string };

export type Level = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ItemMcq = {
  type: 'mcq' | 'case';
  level: 1 | 4;
  q: string;
  options: string[];
  answer: number;
  explain: string;
  source?: Source;
};
export type ItemPair = {
  type: 'pair';
  level: 2;
  left: string;
  right: string;
  cases: { text: string; answer: 'left' | 'right' }[];
  explain: string;
};
export type ItemCloze = {
  type: 'cloze';
  level: 3;
  text: string;
  synonyms?: Record<string, string[]>;
  bank_extra?: string[];
  source?: Source;
};
export type ItemRecall = { type: 'recall'; level: 5; q: string; model: string; keywords: string[] };
export type ItemTrueFalse = {
  type: 'truefalse';
  level: 4;
  statement: string;
  answer: boolean;
  explain: string;
  source?: Source;
};
export type Item = ItemMcq | ItemPair | ItemCloze | ItemRecall | ItemTrueFalse;

export type Concept = {
  id: string;
  subject: string;
  chapter: string;
  term: string;
  definition: string;
  plain: string;
  example: string;
  source: Source;
  checked: string;
  confusables: string[];
  keywords: string[];
  items: Item[];
};

export type Lesson = { id: string; title: string; concepts: string[] };
export type Chapter = { id: string; title: string; lessons: Lesson[] };
export type Subject = { id: string; title: string; short: string; chapters: Chapter[] };

/** Bộ 10 câu kiểu v1: giữ nguyên định dạng cũ (basis/url), thêm concept tùy chọn. */
export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  explain: string;
  basis: string;
  url?: string;
  concept?: string;
};
export type QuizSet = {
  id: string;
  group: string;
  title: string;
  subtitle: string;
  updated: string;
  questions: QuizQuestion[];
};

export type ContentIndex = {
  subjects: Pick<Subject, 'id' | 'title' | 'short'>[];
  conceptCount: Record<string, number>;
  sets: (Omit<QuizSet, 'questions'> & { count: number })[];
};
