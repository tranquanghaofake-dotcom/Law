import Dexie, { type EntityTable, type Transaction } from 'dexie';
import type { Level } from '$lib/content/types';
import type { MemoryCard } from '$lib/engine/fsrs';

export type ConceptProgress = {
  conceptId: string;
  subject: string;
  level: Level;
  card: MemoryCard;
  wrongStreak: number;
  updatedAt: number;
};
export type ReviewRow = { id?: number; conceptId: string; rating: number; level: Level; elapsedMs: number; at: number };
export type StatRow = { key: string; value: unknown };
export type SettingRow = { key: string; value: unknown };

export class LuyenLuatDB extends Dexie {
  concepts!: EntityTable<ConceptProgress, 'conceptId'>;
  reviews!: EntityTable<ReviewRow, 'id'>;
  stats!: EntityTable<StatRow, 'key'>;
  settings!: EntityTable<SettingRow, 'key'>;

  constructor(name = 'luyen-luat') {
    super(name);
    this.version(1).stores({
      concepts: 'conceptId, subject, updatedAt',
      reviews: '++id, conceptId, at',
      stats: 'key',
      settings: 'key',
    });
    // v2 (đợt 9): bỏ cơ chế độ tự tin — xoá hai trường cũ `hyperAt` (concepts) và `conf` (reviews); không đổi chỉ mục, không đụng dữ liệu khác.
    this.version(2).stores({}).upgrade((tx) => purgeConfidence(tx));
  }
}

/** Gỡ trường độ tự tin khỏi bản ghi cũ (đợt 9). Chỉ xoá `hyperAt`/`conf`; tiến độ, lịch FSRS, log ôn giữ nguyên. */
export async function purgeConfidence(tx: Transaction): Promise<void> {
  await tx.table('concepts').toCollection().modify((c: Record<string, unknown>) => { delete c.hyperAt; });
  await tx.table('reviews').toCollection().modify((r: Record<string, unknown>) => { delete r.conf; });
}
