import { describe, expect, it } from 'vitest';
import { bossBadge } from '$lib/ui/session/badge';

describe('bossBadge', () => {
  it('phiên học đợt: "tổng hợp đợt vừa học"', () => {
    expect(bossBadge(true, 6)).toBe('Câu chốt · tổng hợp đợt vừa học');
  });
  it('phiên ôn: không nói "đợt vừa học"; phiên ôn ngắn (< 3 câu tính điểm) không gắn nhãn', () => {
    expect(bossBadge(false, 5)).toBe('Câu chốt · cuối phiên ôn');
    expect(bossBadge(false, 1)).toBeNull();
    expect(bossBadge(false, 2)).toBeNull();
  });
});
