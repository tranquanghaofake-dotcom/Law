import { describe, it, expect } from 'vitest';
import { dragOffset, shouldDismiss } from '$lib/ui/sheetDrag';

describe('kéo ngăn kéo xuống để đóng', () => {
  it('kéo xuống đi theo ngón tay; kéo lên bị hãm (cao su), không âm quá 24 px', () => {
    expect(dragOffset(60)).toBe(60);
    expect(dragOffset(-100)).toBeGreaterThanOrEqual(-24);
    expect(dragOffset(-100)).toBeLessThan(0);
  });
  it('đóng khi kéo quá 30% chiều cao (tối thiểu 96 px) hoặc vuốt nhanh xuống; còn lại bật về', () => {
    expect(shouldDismiss(130, 0.1, 400)).toBe(true);
    expect(shouldDismiss(40, 0.9, 400)).toBe(true);
    expect(shouldDismiss(60, 0.2, 400)).toBe(false);
    expect(shouldDismiss(100, 0.1, 200)).toBe(true); // ngăn kéo thấp: ngưỡng tối thiểu 96 px
    expect(shouldDismiss(-20, 1.5, 400)).toBe(false);
  });
});
