import { beforeEach, describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import Dexie from 'dexie';
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

describe('progress repo — fallback chỉ khi IndexedDB không mở được (C1/I2)', () => {
  it('importAll file hỏng → ném lỗi, KHÔNG chuyển sang bộ nhớ, dữ liệu cũ còn', async () => {
    (globalThis as any).indexedDB = new IDBFactory();
    const repo = createRepo('t7');
    await repo.record({ conceptId: 'a', subject: 'hp', correct: true, elapsedMs: 3000, now });
    await expect(repo.importAll('không phải json')).rejects.toThrow();
    await expect(repo.importAll(JSON.stringify({ concepts: [{ conceptId: 'x' }] }))).rejects.toThrow();
    expect(repo.available).toBe(true);
    expect((await repo.get('a'))?.level).toBe(1);
    await repo.record({ conceptId: 'b', subject: 'hp', correct: true, elapsedMs: 3000, now });
    // ghi mới vẫn vào IndexedDB: repo khác cùng tên DB đọc được
    expect((await createRepo('t7').get('b'))?.level).toBe(1);
  });
  it('open() thất bại lúc chạy → chuyển sang bộ nhớ và storage.available=false', async () => {
    const f = new IDBFactory();
    f.open = (() => { throw new DOMException('blocked', 'SecurityError'); }) as any;
    (globalThis as any).indexedDB = f;
    const saved = Dexie.dependencies.indexedDB;
    Dexie.dependencies.indexedDB = f as any; // Dexie giữ tham chiếu indexedDB lúc nạp module
    const { storage } = await import('$lib/store/status.svelte');
    storage.available = true;
    const repo = createRepo('t8');
    const p = await repo.record({ conceptId: 'a', subject: 'hp', correct: true, elapsedMs: 3000, now });
    expect(p.level).toBe(1);
    expect(repo.available).toBe(false);
    expect(storage.available).toBe(false);
    Dexie.dependencies.indexedDB = saved;
  });
});
