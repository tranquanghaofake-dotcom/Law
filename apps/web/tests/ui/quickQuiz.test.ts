import { describe, expect, it } from 'vitest';
import { pickQuickQuiz } from '$lib/ui/groups';

const sets = [{ id: 'x', group: 'pldc', count: 10 }, { id: 'y', group: 'dan-su', count: 10 }];

describe('pickQuickQuiz', () => {
  it('đề đầu tiên chưa đạt tối đa, kèm điểm cao nhất của nó', () => {
    expect(pickQuickQuiz(sets, { x: 10, y: 6 })).toEqual({ set: sets[1], best: 6 });
    expect(pickQuickQuiz(sets, {})).toEqual({ set: sets[0], best: null });
  });
  it('mọi đề đạt tối đa → đề đầu với điểm 10/10, không mất điểm', () => {
    expect(pickQuickQuiz(sets, { x: 10, y: 10 })).toEqual({ set: sets[0], best: 10 });
  });
  it('không có đề → null', () => { expect(pickQuickQuiz([], {})).toBeNull(); });
});
