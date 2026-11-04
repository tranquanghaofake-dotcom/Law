// Đợt 9: nâng IndexedDB v1 → v2 gỡ trường độ tự tin cũ (`hyperAt`, `conf`), giữ nguyên mọi dữ liệu khác.
import { beforeEach, describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import Dexie from 'dexie';
import { LuyenLuatDB } from '$lib/store/db';

beforeEach(() => { (globalThis as any).indexedDB = new IDBFactory(); });

describe('db v2: bỏ độ tự tin', () => {
  it('xoá hyperAt và conf, giữ tiến độ, log ôn, chuỗi, cài đặt', async () => {
    const old = new Dexie('mig');
    old.version(1).stores({ concepts: 'conceptId, subject, updatedAt', reviews: '++id, conceptId, at', stats: 'key', settings: 'key' });
    await old.table('concepts').put({ conceptId: 'a', subject: 'hp', level: 2, card: { due: new Date(0) }, wrongStreak: 1, updatedAt: 5, hyperAt: 99 });
    await old.table('reviews').bulkAdd([
      { conceptId: 'a', rating: 1, level: 1, elapsedMs: 900, at: 7, conf: 'chac' },
      { conceptId: 'a', rating: 3, level: 1, elapsedMs: 900, at: 8 },
    ]);
    await old.table('stats').put({ key: 'streak', value: { count: 4 } });
    await old.table('settings').put({ key: 'tts', value: true });
    old.close();

    const db = new LuyenLuatDB('mig');
    const c = await db.concepts.get('a');
    expect(c).toMatchObject({ conceptId: 'a', subject: 'hp', level: 2, wrongStreak: 1, updatedAt: 5 });
    expect('hyperAt' in c!).toBe(false);
    const rows = await db.reviews.toArray();
    expect(rows.map((r) => [r.rating, r.at])).toEqual([[1, 7], [3, 8]]);
    expect(rows.some((r) => 'conf' in r)).toBe(false);
    expect((await db.stats.get('streak'))?.value).toEqual({ count: 4 });
    expect((await db.settings.get('tts'))?.value).toBe(true);
    db.close();
  });
});
