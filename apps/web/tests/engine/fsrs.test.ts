import { describe, expect, it } from 'vitest';
import { Rating } from 'ts-fsrs';
import { isDue, newCard, ratingFor, review } from '$lib/engine/fsrs';

describe('ratingFor', () => {
  it('sai luôn là Again', () => {
    expect(ratingFor(false, 1000, 5)).toBe(Rating.Again);
  });
  it('đúng nhưng chậm (>12s) là Hard', () => {
    expect(ratingFor(true, 13000, 1)).toBe(Rating.Hard);
  });
  it('đúng bình thường là Good', () => {
    expect(ratingFor(true, 3000, 2)).toBe(Rating.Good);
  });
  it('đúng nhanh (<4s) ở bậc ≥3 là Easy', () => {
    expect(ratingFor(true, 3000, 3)).toBe(Rating.Easy);
  });
});

describe('review', () => {
  it('sau Good thẻ mới có due trong tương lai và chưa đến hạn', () => {
    const now = new Date('2026-11-01T08:00:00Z');
    const { card, log } = review(newCard(now), Rating.Good, now);
    expect(card.due.getTime()).toBeGreaterThan(now.getTime());
    expect(log.rating).toBe(Rating.Good);
    expect(isDue(card, now)).toBe(false);
    expect(isDue(card, new Date(now.getTime() + 30 * 86400000))).toBe(true);
  });
});
