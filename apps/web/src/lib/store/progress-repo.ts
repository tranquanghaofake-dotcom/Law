import type { Level } from '$lib/content/types';
import { isDue, newCard, ratingFor, review } from '$lib/engine/fsrs';
import { nextLevel } from '$lib/engine/progress';
import { LuyenLuatDB, type ConceptProgress, type ReviewRow } from './db';
import { storage } from './status.svelte';

export type { ConceptProgress };

export type RecordInput = { conceptId: string; subject: string; correct: boolean; elapsedMs: number; now: Date; retention?: number };

export type ProgressRepo = {
  available: boolean;
  get(id: string): Promise<ConceptProgress | undefined>;
  levels(ids: string[]): Promise<Record<string, Level>>;
  record(p: RecordInput): Promise<ConceptProgress>;
  due(now: Date, subject?: string): Promise<ConceptProgress[]>;
  difficult(): Promise<ConceptProgress[]>;
  all(subject?: string): Promise<ConceptProgress[]>;
  reviewCount(): Promise<number>;
  exportAll(): Promise<string>;
  importAll(json: string): Promise<void>;
  clear(): Promise<void>;
};

/** Kho trong bộ nhớ: dùng khi IndexedDB bị chặn (chế độ riêng tư) để ứng dụng vẫn chạy. */
type Store = {
  concepts: Map<string, ConceptProgress>;
  reviews: ReviewRow[];
};

function applyRecord(prev: ConceptProgress | undefined, p: RecordInput): { next: ConceptProgress; row: ReviewRow } {
  const level: Level = prev?.level ?? 0;
  const card = prev?.card ?? newCard(p.now);
  const rating = ratingFor(p.correct, p.elapsedMs, level);
  const r = review(card, rating, p.now, p.retention ?? 0.9);
  const next: ConceptProgress = {
    conceptId: p.conceptId,
    subject: p.subject,
    level: nextLevel(level, p.correct),
    card: r.card,
    wrongStreak: p.correct ? 0 : (prev?.wrongStreak ?? 0) + 1,
    updatedAt: p.now.getTime(),
  };
  const row: ReviewRow = { conceptId: p.conceptId, rating, level, elapsedMs: p.elapsedMs, at: p.now.getTime() };
  return { next, row };
}

type ExportFile = { v: number; concepts?: ConceptProgress[]; reviews?: ReviewRow[]; stats?: { key: string; value: unknown }[]; settings?: { key: string; value: unknown }[] };

/** Kiểm tra file xuất trước khi ghi: sai định dạng thì ném lỗi, KHÔNG đụng dữ liệu hiện có. */
export function parseExport(json: string): ExportFile {
  const d = JSON.parse(json) as Partial<ExportFile>;
  if (!d || typeof d !== 'object' || d.v !== 1) throw new Error('File không đúng định dạng Luyện Luật (thiếu v=1).');
  for (const c of d.concepts ?? []) {
    if (typeof c.conceptId !== 'string' || typeof c.subject !== 'string' || typeof c.level !== 'number' || !c.card || c.card.due == null)
      throw new Error(`Khái niệm '${(c as { conceptId?: string }).conceptId ?? '?'}' trong file thiếu trường bắt buộc.`);
  }
  return d as ExportFile;
}

function memoryRepo(): ProgressRepo {
  const s: Store = { concepts: new Map(), reviews: [] };
  const list = (subject?: string) => [...s.concepts.values()].filter((c) => !subject || c.subject === subject);
  return {
    available: false,
    async get(id) { return s.concepts.get(id); },
    async levels(ids) { return Object.fromEntries(ids.map((id) => [id, s.concepts.get(id)?.level ?? 0])) as Record<string, Level>; },
    async record(p) {
      const { next, row } = applyRecord(s.concepts.get(p.conceptId), p);
      s.concepts.set(p.conceptId, next);
      s.reviews.push({ ...row, id: s.reviews.length + 1 });
      return next;
    },
    async due(now, subject) { return list(subject).filter((c) => isDue(c.card, now)); },
    async difficult() { return list().filter((c) => c.wrongStreak >= 3); },
    async all(subject) { return list(subject); },
    async reviewCount() { return s.reviews.length; },
    async exportAll() { return JSON.stringify({ v: 1, concepts: list(), reviews: s.reviews }); },
    async importAll(json) {
      const d = parseExport(json);
      s.concepts = new Map((d.concepts ?? []).map((c) => [c.conceptId, c]));
      s.reviews = d.reviews ?? [];
    },
    async clear() { s.concepts.clear(); s.reviews = []; },
  };
}

function dexieRepo(db: LuyenLuatDB): ProgressRepo {
  return {
    available: true,
    async get(id) { return db.concepts.get(id); },
    async levels(ids) {
      const rows = await db.concepts.bulkGet(ids);
      return Object.fromEntries(ids.map((id, i) => [id, rows[i]?.level ?? 0])) as Record<string, Level>;
    },
    async record(p) {
      return db.transaction('rw', db.concepts, db.reviews, async () => {
        const { next, row } = applyRecord(await db.concepts.get(p.conceptId), p);
        await db.concepts.put(next);
        await db.reviews.add(row);
        return next;
      });
    },
    async due(now, subject) {
      const rows = subject ? await db.concepts.where('subject').equals(subject).toArray() : await db.concepts.toArray();
      return rows.filter((c) => isDue(c.card, now));
    },
    async difficult() { return (await db.concepts.toArray()).filter((c) => c.wrongStreak >= 3); },
    async all(subject) { return subject ? db.concepts.where('subject').equals(subject).toArray() : db.concepts.toArray(); },
    async reviewCount() { return db.reviews.count(); },
    async exportAll() {
      const [concepts, reviews, stats, settings] = await Promise.all([db.concepts.toArray(), db.reviews.toArray(), db.stats.toArray(), db.settings.toArray()]);
      return JSON.stringify({ v: 1, concepts, reviews, stats, settings });
    },
    async importAll(json) {
      const d = parseExport(json);
      await db.transaction('rw', db.concepts, db.reviews, db.stats, db.settings, async () => {
        if (d.concepts) await db.concepts.bulkPut(d.concepts.map((c) => ({ ...c, card: { ...c.card, due: new Date(c.card.due), last_review: c.card.last_review ? new Date(c.card.last_review) : undefined } })));
        if (d.reviews) await db.reviews.bulkPut(d.reviews);
        if (d.stats) await db.stats.bulkPut(d.stats);
        if (d.settings) await db.settings.bulkPut(d.settings);
      });
    },
    async clear() { await Promise.all([db.concepts.clear(), db.reviews.clear()]); },
  };
}

/** Lỗi cho thấy IndexedDB không dùng được (bị chặn, không có API); lỗi khác là lỗi dữ liệu → ném ra ngoài. */
const OPEN_FAILURES = new Set(['OpenFailedError', 'MissingAPIError', 'InvalidStateError', 'SecurityError', 'UnknownError', 'DatabaseClosedError']);
function isStorageFailure(err: unknown): boolean {
  const name = (err as { name?: string } | null)?.name ?? '';
  const inner = (err as { inner?: { name?: string } } | null)?.inner?.name ?? '';
  return OPEN_FAILURES.has(name) || OPEN_FAILURES.has(inner);
}

function hasIndexedDB(): boolean {
  try { return typeof indexedDB !== 'undefined' && indexedDB !== null; } catch { return false; }
}

/** Tạo kho tiến độ; tự chuyển sang bộ nhớ nếu IndexedDB không dùng được. */
export function createRepo(name = 'luyen-luat'): ProgressRepo {
  if (!hasIndexedDB()) { storage.available = false; return memoryRepo(); }
  try {
    const db = new LuyenLuatDB(name);
    const real = dexieRepo(db);
    const mem = memoryRepo();
    // Nếu mở DB thất bại lúc chạy (bị chặn), chuyển hẳn sang bộ nhớ.
    let target: ProgressRepo = real;
    const proxy: ProgressRepo = {
      get available() { return target.available; },
      get: (id) => guard(() => target.get(id)),
      levels: (ids) => guard(() => target.levels(ids)),
      record: (p) => guard(() => target.record(p)),
      due: (n, s) => guard(() => target.due(n, s)),
      difficult: () => guard(() => target.difficult()),
      all: (s) => guard(() => target.all(s)),
      reviewCount: () => guard(() => target.reviewCount()),
      exportAll: () => guard(() => target.exportAll()),
      importAll: (j) => guard(() => target.importAll(j)),
      clear: () => guard(() => target.clear()),
    };
    async function guard<T>(fn: () => Promise<T>): Promise<T> {
      try {
        return await fn();
      } catch (err) {
        if (target === real && isStorageFailure(err)) {
          console.warn('[luyen-luat] IndexedDB không dùng được, chuyển sang bộ nhớ tạm:', err);
          target = mem;
          storage.available = false;
          return fn();
        }
        throw err;
      }
    }
    return proxy;
  } catch {
    storage.available = false;
    return memoryRepo();
  }
}

export const repo: ProgressRepo = createRepo();
