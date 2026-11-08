import { afterEach, describe, expect, it, vi } from 'vitest';
import { revealDelta, revealFeedback } from '$lib/ui/revealFeedback';

describe('revealDelta — cuộn bao nhiêu để thấy thẻ phản hồi', () => {
  it('thẻ đã lộ đủ (đầu thẻ còn ≥ 160 px phía trên mép dưới) → không cuộn', () => {
    expect(revealDelta(300, 844)).toBe(0);
    expect(revealDelta(684, 844)).toBe(0);
  });
  it('đầu thẻ ở sát hoặc dưới mép dưới → cuộn để đầu thẻ lên khoảng 35 % chiều cao khung nhìn', () => {
    expect(revealDelta(700, 844)).toBe(Math.round(700 - 844 * 0.35));
    expect(revealDelta(1002, 844)).toBe(Math.round(1002 - 844 * 0.35));
  });
  it('đầu thẻ nằm phía trên khung nhìn (âm) → không cuộn', () => {
    expect(revealDelta(-50, 844)).toBe(0);
  });
});

describe('revealFeedback (action)', () => {
  afterEach(() => { vi.restoreAllMocks(); });
  const setup = (top: number) => {
    const node = document.createElement('div');
    vi.spyOn(node, 'getBoundingClientRect').mockReturnValue({ top, bottom: top + 700, left: 0, right: 0, width: 0, height: 700, x: 0, y: top, toJSON() {} });
    const scrollBy = vi.fn(); window.scrollBy = scrollBy as never;
    return { node, scrollBy };
  };
  it('thẻ nằm dưới mép màn hình → cuộn xuống', async () => {
    const { node, scrollBy } = setup(1000);
    revealFeedback(node);
    await vi.waitFor(() => expect(scrollBy).toHaveBeenCalled());
    expect(scrollBy.mock.calls[0][0].top).toBe(revealDelta(1000, window.innerHeight));
  });
  it('thẻ đã thấy được → không cuộn', async () => {
    const { node, scrollBy } = setup(200);
    revealFeedback(node);
    await new Promise((r) => setTimeout(r, 60));
    expect(scrollBy).not.toHaveBeenCalled();
  });
  it('huỷ trước khi khung hình tới → không cuộn', async () => {
    const { node, scrollBy } = setup(1000);
    revealFeedback(node).destroy();
    await new Promise((r) => setTimeout(r, 60));
    expect(scrollBy).not.toHaveBeenCalled();
  });
});
