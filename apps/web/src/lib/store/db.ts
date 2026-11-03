import Dexie, { type EntityTable } from 'dexie';
import type { Level } from '$lib/content/types';
import type { MemoryCard } from '$lib/engine/fsrs';
import type { Confidence } from '$lib/engine/confidence';

export type ConceptProgress = {
  conceptId: string;
  subject: string;
  level: Level;
  card: MemoryCard;
  wrongStreak: number;
  updatedAt: number;
  /** (đợt 7, tuỳ chọn) Thời điểm lần "chắc mà sai" chưa được sửa; xoá khi trả lời đúng với độ tự tin Chắc/Tạm. */
  hyperAt?: number;
};
/** (đợt 7) `conf` tuỳ chọn: độ tự tin người học chọn trước khi xem đáp án; bản ghi cũ không có. */
export type ReviewRow = { id?: number; conceptId: string; rating: number; level: Level; elapsedMs: number; at: number; conf?: Confidence };
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
