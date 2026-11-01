import { beforeEach, describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { createStars } from '$lib/store/stars.svelte';

describe('★ đánh dấu khái niệm', () => {
  beforeEach(() => { (globalThis as any).indexedDB = new IDBFactory(); });

  it('toggle thêm rồi bỏ; has() phản ánh đúng', async () => {
    const s = createStars('s1');
    expect(s.has('a')).toBe(false);
    expect(await s.toggle('a')).toBe(true);
    expect(s.has('a')).toBe(true);
    expect(await s.toggle('a')).toBe(false);
    expect(s.has('a')).toBe(false);
  });

  it('lưu vào IndexedDB: kho mới cùng tên nạp lại được', async () => {
    const a = createStars('s2');
    await a.toggle('x'); await a.toggle('y');
    const b = createStars('s2');
    await b.load();
    expect(b.ids).toEqual(['x', 'y']);
  });
});
