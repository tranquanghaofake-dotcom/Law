import { beforeEach, describe, expect, it } from 'vitest';
import type { ContentIndex } from '$lib/content/types';
import { stats } from '$lib/store/stats';

const index: ContentIndex = { subjects: [], conceptCount: {}, sets: [{ id: 'dat-coc', group: 'dan-su', title: 'Đặt cọc', subtitle: '', updated: '2026-10-31', count: 10 }] };

describe('ensureV1Migrated', () => {
  beforeEach(() => localStorage.clear());
  it('chuyển best:<id> từ localStorage vào stats một lần, xoá khỏi localStorage, gọi lại không lỗi', async () => {
    localStorage.setItem('best:dat-coc', '9');
    await stats.ensureV1Migrated(index);
    expect(await stats.best('dat-coc')).toBe(9);
    expect(localStorage.getItem('best:dat-coc')).toBeNull();
    await stats.setBest('dat-coc', 10);
    localStorage.setItem('best:dat-coc', '3');
    await stats.ensureV1Migrated(index); // đã chạy rồi → không ghi đè
    expect(await stats.best('dat-coc')).toBe(10);
  });
});
