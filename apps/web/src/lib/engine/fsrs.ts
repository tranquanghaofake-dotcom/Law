import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type ReviewLog } from 'ts-fsrs';
import type { Level } from '$lib/content/types';
import type { StepItem } from './step';

export type MemoryCard = Card;
export { Rating };
export type { ReviewLog };

export function newCard(now: Date): MemoryCard {
  return createEmptyCard(now);
}

/** Cách người học trả lời: `recognize` = chọn/nhận ra (trắc nghiệm, Đúng/Sai, ghép, điền chọn từ); `produce` = tự viết (điền gõ, tự nhớ lại). */
export type AnswerMode = 'recognize' | 'produce';
export type RatingOpts = { mode?: AnswerMode; chars?: number; partial?: boolean };

/** Mốc "đúng mà chậm" (ms) theo số ký tự phải đọc: tối thiểu 12 s, thêm ~50 ms/ký tự sau 160 ký tự đầu. */
export function hardAfterMs(chars: number): number {
  return Math.max(12000, 4000 + 50 * chars);
}

/**
 * Quy ước rating (sửa 04/11/2026, thay spec 2.3):
 * sai = Again · tự chấm "Gần đúng" = Hard ·
 * tự viết (gõ, tự nhớ lại) đúng = Good — không phạt Hard vì viết lâu (viết 1–3 câu luôn quá 12 s) ·
 * nhận biết đúng = Good, chậm hơn `hardAfterMs(chars)` = Hard, KHÔNG BAO GIỜ Easy
 * (trắc nghiệm 4 phương án đoán trúng 25 %, Đúng/Sai 50 % — Easy làm thẻ nhảy ~8 ngày từ một lần đoán).
 * `level` giữ trong chữ ký cho tương thích, không còn dùng.
 */
export function ratingFor(correct: boolean, elapsedMs: number, _level: Level, opts: RatingOpts = {}): Rating {
  if (!correct) return Rating.Again;
  if (opts.partial) return Rating.Hard;
  if (opts.mode === 'produce') return Rating.Good;
  return elapsedMs > hardAfterMs(opts.chars ?? 0) ? Rating.Hard : Rating.Good;
}

const len = (...xs: string[]) => xs.reduce((n, x) => n + x.length, 0);

/** Cách trả lời + số ký tự phải đọc của một bước. `clozeMode` lấy từ `clozeModeFor` (session) để khỏi kéo bộ sinh câu vào bundle chính. */
export function ratingProfile(item: StepItem, clozeMode: 'bank' | 'type'): { mode: AnswerMode; chars: number } {
  switch (item.type) {
    case 'mcq': case 'case': return { mode: 'recognize', chars: len(item.q, ...item.options) };
    case 'truefalse': return { mode: 'recognize', chars: len(item.statement) };
    case 'cloze': return { mode: clozeMode === 'type' ? 'produce' : 'recognize', chars: len(item.text) };
    case 'recall': return { mode: 'produce', chars: len(item.q) };
    case 'pair': case 'sort': return { mode: 'recognize', chars: len(item.left, item.right, ...item.cases.map((c) => c.text)) };
    case 'match': return { mode: 'recognize', chars: len(...item.pairs.map((p) => p.term + p.text)) };
    default: return { mode: 'recognize', chars: 0 };
  }
}

export function review(card: MemoryCard, rating: Rating, now: Date, retention = 0.9): { card: MemoryCard; log: ReviewLog } {
  const f = fsrs(generatorParameters({ request_retention: retention }));
  const r = f.next(card, now, rating as Exclude<Rating, Rating.Manual>);
  return { card: r.card, log: r.log };
}

export function isDue(card: MemoryCard, now: Date): boolean {
  return new Date(card.due).getTime() <= now.getTime();
}
