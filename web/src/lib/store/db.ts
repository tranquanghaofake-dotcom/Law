import Dexie, { type EntityTable } from 'dexie';
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
  }
}
