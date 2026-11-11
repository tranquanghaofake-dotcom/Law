import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearContentCache,
  loadConcepts,
  loadIndex,
  loadSet,
  loadSubject,
  loadSubjects,
  loadTerms,
  loadSubjectConcepts,
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

  it('loadSubject lấy từ file gộp subjects.json: 25 môn gọi song song chỉ fetch 1 lần', async () => {
    const f = mockFetch(() => [{ id: 'hien-phap' }, { id: 'dan-su' }]);
    vi.stubGlobal('fetch', f);
    const [a, b, c] = await Promise.all([loadSubject('hien-phap'), loadSubject('hien-phap'), loadSubject('dan-su')]);
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0][0]).toBe('/content/subjects.json');
    expect(a.id).toBe('hien-phap');
    expect(b).toBe(a);
    expect(c.id).toBe('dan-su');
  });

  it('loadSubjects trả mọi môn và dùng chung bộ nhớ với loadSubject', async () => {
    const f = mockFetch(() => [{ id: 'hien-phap' }, { id: 'dan-su' }]);
    vi.stubGlobal('fetch', f);
    const all = await loadSubjects();
    expect(all.map((s) => s.id)).toEqual(['hien-phap', 'dan-su']);
    expect(await loadSubject('dan-su')).toBe(all[1]);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('file gộp lỗi thì loadSubject quay về file lẻ của môn', async () => {
    const f = mockFetch((url) => ({ id: url }), ['status']);
    vi.stubGlobal('fetch', f);
    const s = await loadSubject('hien-phap');
    expect(f.mock.calls.map((c) => c[0])).toEqual(['/content/subjects.json', '/content/subjects/hien-phap.json']);
    expect(s.id).toBe('/content/subjects/hien-phap.json');
  });

  it('môn không có trong file gộp: hỏi file lẻ, không có thì báo lỗi như trước', async () => {
    const f = vi.fn(async (url: string) =>
      url.endsWith('subjects.json')
        ? { ok: true, status: 200, json: async () => [{ id: 'hien-phap' }] }
        : { ok: false, status: 404, json: async () => ({}) },
    );
    vi.stubGlobal('fetch', f);
    await expect(loadSubject('khong-co')).rejects.toThrow('Không tải được subjects/khong-co.json (404)');
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

describe('content/loader — gói khái niệm theo môn (HT12)', () => {
  beforeEach(() => clearContentCache());
  afterEach(() => vi.unstubAllGlobals());

  it('loadSubjectConcepts tải 1 file bundles/<môn>.json; loadConcepts sau đó không fetch lại', async () => {
    const f = mockFetch((url) => (url.includes('bundles/') ? [{ id: 'a', term: 'A' }, { id: 'b', term: 'B' }] : { id: 'x' }));
    vi.stubGlobal('fetch', f);
    const all = await loadSubjectConcepts('hp');
    expect(all.map((c) => c.id)).toEqual(['a', 'b']);
    expect(f.mock.calls[0][0]).toBe('/content/bundles/hp.json');
    const [a] = await loadConcepts('hp', ['a']);
    expect(a.id).toBe('a');
    expect(f).toHaveBeenCalledTimes(1);
  });
});
