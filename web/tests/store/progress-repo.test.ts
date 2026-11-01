import { beforeEach, describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { createRepo } from '$lib/store/progress-repo';

const now = new Date('2026-11-01T08:00:00Z');

describe('progress repo (IndexedDB)', () => {
  beforeEach(() => {
    // DB mới cho mỗi test
    (globalThis as any).indexedDB = new IDBFactory();
  });

  it('record đúng trên khái niệm mới → bậc 1, due tương lai, 1 review log', async () => {
    const repo = createRepo('t1');
    const p = await repo.record({ conceptId: 'a', subject: 'hp', correct: true, elapsedMs: 3000, now });
    expect(p.level).toBe(1);
    expect(new Date(p.card.due).getTime()).toBeGreaterThan(now.getTime());
    expect(await repo.reviewCount()).toBe(1);
  });

  it('sai 3 lần → nằm trong difficult()', async () => {
    const repo = createRepo('t2');
    for (let i = 0; i < 3; i++) await repo.record({ conceptId: 'a', subject: 'hp', correct: false, elapsedMs: 1000, now });
    const d = await repo.difficult();
    expect(d.map((x) => x.conceptId)).toEqual(['a']);
  });

  it('levels: thiếu → 0', async () => {
    const repo = createRepo('t3');
    await repo.record({ conceptId: 'a', subject: 'hp', correct: true, elapsedMs: 3000, now });
    expect(await repo.levels(['a', 'zzz'])).toEqual({ a: 1, zzz: 0 });
  });

  it('exportAll → xóa → importAll khôi phục', async () => {
    const repo = createRepo('t4');
    await repo.record({ conceptId: 'a', subject: 'hp', correct: true, elapsedMs: 3000, now });
    const json = await repo.exportAll();
    await repo.clear();
    expect(await repo.get('a')).toBeUndefined();
    await repo.importAll(json);
    expect((await repo.get('a'))?.level).toBe(1);
  });

  it('due() trả khái niệm đến hạn theo môn', async () => {
    const repo = createRepo('t5');
    await repo.record({ conceptId: 'a', subject: 'hp', correct: true, elapsedMs: 3000, now });
    await repo.record({ conceptId: 'b', subject: 'ds', correct: true, elapsedMs: 3000, now });
    const later = new Date(now.getTime() + 60 * 86400000);
    expect((await repo.due(later)).map((x) => x.conceptId).sort()).toEqual(['a', 'b']);
    expect((await repo.due(later, 'hp')).map((x) => x.conceptId)).toEqual(['a']);
    expect(await repo.due(now)).toEqual([]);
  });
});

describe('progress repo (không có IndexedDB)', () => {
  it('available=false và record vẫn trả kết quả', async () => {
    (globalThis as any).indexedDB = undefined;
    const repo = createRepo('t6');
    const p = await repo.record({ conceptId: 'a', subject: 'hp', correct: true, elapsedMs: 3000, now });
    expect(repo.available).toBe(false);
    expect(p.level).toBe(1);
    expect(await repo.levels(['a'])).toEqual({ a: 1 });
  });
});
