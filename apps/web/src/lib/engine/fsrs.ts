import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type ReviewLog } from 'ts-fsrs';
import type { Level } from '$lib/content/types';
import type { Confidence } from './confidence';

export type MemoryCard = Card;
export { Rating };
export type { ReviewLog };

export function newCard(now: Date): MemoryCard {
  return createEmptyCard(now);
}

/**
 * Quy ước rating (spec 2.3): sai = Again; đúng chậm >12s = Hard; đúng nhanh <4s ở bậc ≥3 = Easy; còn lại Good.
 * (đợt 7, đề xuất ①) `conf` tuỳ chọn: đúng mà "Đoán" = Hard (không nâng thẻ như đúng thật); đúng mà "Tạm" không lên Easy;
 * "Chắc" hoặc không có `conf` = như cũ. Sai luôn là Again (mức "chắc mà sai" đánh dấu riêng, xem confidence.ts).
 */
export function ratingFor(correct: boolean, elapsedMs: number, level: Level, conf?: Confidence): Rating {
  if (!correct) return Rating.Again;
  if (conf === 'doan') return Rating.Hard;
  if (elapsedMs > 12000) return Rating.Hard;
  if (elapsedMs < 4000 && level >= 3 && conf !== 'tam') return Rating.Easy;
  return Rating.Good;
}

export function review(card: MemoryCard, rating: Rating, now: Date, retention = 0.9): { card: MemoryCard; log: ReviewLog } {
  const f = fsrs(generatorParameters({ request_retention: retention }));
  const r = f.next(card, now, rating as Exclude<Rating, Rating.Manual>);
  return { card: r.card, log: r.log };
}

export function isDue(card: MemoryCard, now: Date): boolean {
  return new Date(card.due).getTime() <= now.getTime();
}
