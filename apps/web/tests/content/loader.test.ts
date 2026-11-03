import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearContentCache,
  loadConcepts,
  loadIndex,
  loadSet,
  loadSubject,
  loadTerms,
} from '$lib/content/loader';

// fetch giả: trả JSON theo đường dẫn; `fail` đặt trước các lần lỗi (status hoặc reject mạng).
function mockFetch(body: (url: string) => unknown, fail: Array<'status' | 'network'> = []) {
  const queue = [...fail];
  return vi.fn(async (url: string) => {
    const next = queue.shift();
    if (next === 'network') throw new TypeError('Failed to fetch');
    if (next === 'status') return { ok: false, status: 500, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => body(url) };
  });
}

describe('content/loader — mỗi file chỉ tải một lần', () => {
  beforeEach(() => {
    clearContentCache();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loadIndex gọi 3 lần song song chỉ fetch 1 lần và trả cùng một kết quả', async () => {
    const f = mockFetch(() => ({ subjects: [], conceptCount: {} }));
    vi.stubGlobal('fetch', f);
    const [a, b, c] = await Promise.all([loadIndex(), loadIndex(), loadIndex()]);
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0][0]).toBe('/content/index.json');
    expect(b).toBe(a);
    expect(c).toBe(a);
  });

  it('loadSubject theo khoá: cùng id gọi song song chỉ fetch 1 lần, id khác fetch riêng', async () => {
    const f = mockFetch((url) => ({ id: url }));
    vi.stubGlobal('fetch', f);
    await Promise.all([loadSubject('hien-phap'), loadSubject('hien-phap'), loadSubject('dan-su')]);
    expect(f).toHaveBeenCalledTimes(2);
    expect(f.mock.calls.map((c) => c[0])).toEqual([
      '/content/subjects/hien-phap.json',
      '/content/subjects/dan-su.json',
    ]);
  });

  it('loadTerms theo môn: gọi lặp chỉ fetch 1 lần', async () => {
    const f = mockFetch(() => ({ a: 'Khái niệm A' }));
    vi.stubGlobal('fetch', f);
    const [x, y] = await Promise.all([loadTerms('hien-phap'), loadTerms('hien-phap')]);
    await loadTerms('hien-phap');
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0][0]).toBe('/content/terms/hien-phap.json');
    expect(y).toBe(x);
  });

  it('loadConcepts nhớ theo file: lần sau chỉ fetch file chưa có trong bộ nhớ', async () => {
    const f = mockFetch((url) => ({ id: url.split('/').pop()?.replace('.json', '') }));
    vi.stubGlobal('fetch', f);
    await Promise.all([loadConcepts('hien-phap', ['a', 'b']), loadConcepts('hien-phap', ['b', 'c'])]);
    expect(f).toHaveBeenCalledTimes(3);
    await loadConcepts('hien-phap', ['a', 'c']);
    expect(f).toHaveBeenCalledTimes(3);
  });

  it('loadSet theo id: gọi lặp chỉ fetch 1 lần', async () => {
    const f = mockFetch(() => ({ id: 'hien-phap-de-1' }));
    vi.stubGlobal('fetch', f);
    await Promise.all([loadSet('hien-phap-de-1'), loadSet('hien-phap-de-1')]);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('lỗi HTTP: không nhớ lỗi, lần sau thử lại và thành công', async () => {
    const f = mockFetch(() => ({ subjects: [] }), ['status']);
    vi.stubGlobal('fetch', f);
    await expect(loadIndex()).rejects.toThrow('index.json (500)');
    await expect(loadIndex()).resolves.toEqual({ subjects: [] });
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('lỗi mạng khi nhiều lời gọi song song: tất cả báo lỗi, lần sau fetch lại đúng 1 lần', async () => {
    const f = mockFetch(() => ({ subjects: [] }), ['network']);
    vi.stubGlobal('fetch', f);
    const results = await Promise.allSettled([loadIndex(), loadIndex()]);
    expect(results.map((r) => r.status)).toEqual(['rejected', 'rejected']);
    expect(f).toHaveBeenCalledTimes(1);
    await loadIndex();
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('loadConcepts: file lỗi không làm hỏng file đã nhớ; lần sau chỉ fetch lại file lỗi', async () => {
    const f = mockFetch((url) => ({ url }), ['status']);
    vi.stubGlobal('fetch', f);
    await expect(loadConcepts('dan-su', ['a', 'b'])).rejects.toThrow();
    expect(f).toHaveBeenCalledTimes(2);
    await loadConcepts('dan-su', ['a', 'b']);
    // 'a' hoặc 'b' có một file lỗi: chỉ file đó được fetch lại
    expect(f).toHaveBeenCalledTimes(3);
  });

  it('clearContentCache xoá bộ nhớ: lời gọi sau đó fetch lại', async () => {
    const f = mockFetch(() => ({ subjects: [] }));
    vi.stubGlobal('fetch', f);
    await loadIndex();
    clearContentCache();
    await loadIndex();
    expect(f).toHaveBeenCalledTimes(2);
  });
});
