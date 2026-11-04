import { describe, expect, it } from 'vitest';
import { Rating } from 'ts-fsrs';
import type { StepItem } from '$lib/engine/step';
import { hardAfterMs, isDue, newCard, ratingFor, ratingProfile, review } from '$lib/engine/fsrs';

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
  it('nhận biết (chọn/Đúng-Sai) không bao giờ Easy dù trả lời nhanh — đoán trúng không được giãn lịch xa', () => {
    expect(ratingFor(true, 1500, 4)).toBe(Rating.Good);
    expect(ratingFor(true, 1500, 4, { mode: 'recognize', chars: 40 })).toBe(Rating.Good);
  });
  it('mốc Hard tăng theo độ dài đề: tình huống dài đọc 20 s vẫn là Good', () => {
    expect(hardAfterMs(0)).toBe(12000);
    expect(hardAfterMs(400)).toBeGreaterThan(20000);
    expect(ratingFor(true, 20000, 4, { mode: 'recognize', chars: 400 })).toBe(Rating.Good);
    expect(ratingFor(true, 20000, 4, { mode: 'recognize', chars: 60 })).toBe(Rating.Hard);
  });
  it('dạng tự viết (gõ, tự nhớ lại) không bị Hard chỉ vì viết lâu', () => {
    expect(ratingFor(true, 45000, 5, { mode: 'produce', chars: 80 })).toBe(Rating.Good);
  });
  it('tự chấm "Gần đúng" là Hard', () => {
    expect(ratingFor(true, 5000, 5, { mode: 'produce', partial: true })).toBe(Rating.Hard);
  });
});

describe('ratingProfile', () => {
  const mcq: StepItem = { type: 'mcq', level: 1, q: 'Câu hỏi', options: ['một', 'hai', 'ba', 'bốn'], answer: 0, explain: '' };
  it('trắc nghiệm: nhận biết, đếm chữ đề + phương án', () => {
    expect(ratingProfile(mcq, 'bank')).toEqual({ mode: 'recognize', chars: 'Câu hỏi'.length + 'mộthaibabốn'.length });
  });
  it('điền khuyết: chọn từ ngân hàng là nhận biết, gõ là tự viết; tự nhớ lại là tự viết', () => {
    const cloze = { type: 'cloze', level: 3, text: 'A {{b}} c', explain: '' } as StepItem;
    expect(ratingProfile(cloze, 'bank').mode).toBe('recognize');
    expect(ratingProfile(cloze, 'type').mode).toBe('produce');
    expect(ratingProfile({ type: 'recall', level: 5, q: 'Nêu', model: 'm', keywords: [] } as never, 'bank').mode).toBe('produce');
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
