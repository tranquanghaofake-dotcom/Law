// Đợt 7, đề xuất ①: kho tiến độ ghi độ tự tin (`conf`) và đánh dấu "chắc mà sai" (`hyperAt`); bản ghi cũ không đổi.
import { beforeEach, describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { Rating } from 'ts-fsrs';
import { createRepo } from '$lib/store/progress-repo';
import { calibration } from '$lib/engine/confidence';

const now = new Date('2026-11-01T08:00:00Z');
const later = (min: number) => new Date(now.getTime() + min * 60000);

describe('progress repo + độ tự tin', () => {
  beforeEach(() => { (globalThis as any).indexedDB = new IDBFactory(); });

  it('không có conf: log và thẻ như trước (không có trường conf/hyperAt)', async () => {
    const repo = createRepo('c0');
    const p = await repo.record({ conceptId: 'a', subject: 'hp', correct: true, elapsedMs: 3000, now });
    expect(p.hyperAt).toBeUndefined();
    const rows = await repo.reviewsSince(new Date(0));
    expect(rows.length).toBe(1);
    expect('conf' in rows[0]).toBe(false);
  });

  it('"chắc mà sai" → hyperAt, nằm trong hypercorrections(); đúng với Tạm/Chắc thì xoá; đúng mà Đoán thì giữ', async () => {
    const repo = createRepo('c1');
    await repo.record({ conceptId: 'a', subject: 'hp', correct: false, elapsedMs: 2000, now, conf: 'chac' });
    await repo.record({ conceptId: 'b', subject: 'hp', correct: false, elapsedMs: 2000, now: later(1), conf: 'tam' });
    expect((await repo.hypercorrections()).map((c) => c.conceptId)).toEqual(['a']);
    await repo.record({ conceptId: 'a', subject: 'hp', correct: true, elapsedMs: 2000, now: later(2), conf: 'doan' });
    expect((await repo.hypercorrections()).map((c) => c.conceptId)).toEqual(['a']);
    await repo.record({ conceptId: 'a', subject: 'hp', correct: true, elapsedMs: 2000, now: later(3), conf: 'tam' });
    expect(await repo.hypercorrections()).toEqual([]);
  });

  it('đúng mà Đoán ghi Hard trong log; conf lưu vào log và tính được độ chuẩn', async () => {
    const repo = createRepo('c2');
    await repo.record({ conceptId: 'a', subject: 'hp', correct: true, elapsedMs: 3000, now, conf: 'doan' });
    await repo.record({ conceptId: 'b', subject: 'hp', correct: false, elapsedMs: 3000, now, conf: 'chac' });
    const rows = await repo.reviewsSince(new Date(0));
    expect(rows.map((r) => [r.rating, r.conf])).toEqual([[Rating.Hard, 'doan'], [Rating.Again, 'chac']]);
    expect(calibration(rows).hyper).toBe(1);
  });

  it('xuất/nhập giữ conf và hyperAt (trường tuỳ chọn)', async () => {
    const repo = createRepo('c3');
    await repo.record({ conceptId: 'a', subject: 'hp', correct: false, elapsedMs: 3000, now, conf: 'chac' });
    const json = await repo.exportAll();
    const repo2 = createRepo('c4');
    await repo2.importAll(json);
    expect((await repo2.hypercorrections()).map((c) => c.conceptId)).toEqual(['a']);
    expect((await repo2.reviewsSince(new Date(0)))[0].conf).toBe('chac');
  });

  it('bỏ qua conf không hợp lệ (dữ liệu lạ) → như không có', async () => {
    const repo = createRepo('c5');
    await repo.record({ conceptId: 'a', subject: 'hp', correct: true, elapsedMs: 3000, now, conf: 'xyz' as never });
    expect('conf' in (await repo.reviewsSince(new Date(0)))[0]).toBe(false);
  });
});
