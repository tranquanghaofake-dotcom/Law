import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { ART_NAMES, EMBLEM_NAMES, SET_ART, SUBJECT_ART, VIGNETTE_NAMES, artFor, emblemFor, hasOwnArt, vignetteFor } from '$lib/art/registry';

const DATA = '../../packages/content/data';
const load = (dir: string) => readdirSync(`${DATA}/${dir}`).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(`${DATA}/${dir}/${f}`, 'utf8')));
const subjects: { id: string; chapters: { id: string }[] }[] = load('subjects');
const sets: { id: string; group: string }[] = load('sets');
const count = <T>(xs: T[]) => xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<T, number>());

describe('tranh minh hoạ toàn wiki (đợt 6): đủ phủ và giới hạn lặp', () => {
  it('mọi môn có cảnh đầu trang riêng, mỗi cảnh ≤ 2 môn, mọi tên cảnh đã đăng ký', () => {
    expect(subjects.length).toBeGreaterThanOrEqual(23);
    for (const s of subjects) { expect(hasOwnArt(s.id), s.id).toBe(true); expect(ART_NAMES).toContain(artFor(s.id)); }
    for (const [art, n] of count(subjects.map((s) => artFor(s.id)))) expect(n, `cảnh ${art} dùng cho ${n} môn`).toBeLessThanOrEqual(2);
    expect(Object.keys(SUBJECT_ART).sort()).toEqual(subjects.map((s) => s.id).sort());
  });
  it('mọi bộ đề có tranh nhỏ khai báo riêng (không rơi về nhóm), mỗi tranh ≤ 3 bộ, ≥ 16 tranh khác nhau', () => {
    expect(sets.length).toBeGreaterThanOrEqual(47);
    for (const s of sets) { expect(SET_ART[s.id], s.id).toBeDefined(); expect(VIGNETTE_NAMES).toContain(vignetteFor(s)); }
    const used = count(sets.map((s) => vignetteFor(s)));
    for (const [v, n] of used) expect(n, `tranh ${v} dùng cho ${n} bộ đề`).toBeLessThanOrEqual(3);
    expect(used.size).toBeGreaterThanOrEqual(16);
  });
  it('mọi chương có huy hiệu khai báo riêng và không trùng trong cùng một môn', () => {
    for (const s of subjects) {
      const names = s.chapters.map((c) => emblemFor(s.id, c.id));
      expect(names.every((n) => EMBLEM_NAMES.includes(n)), s.id).toBe(true);
      expect(new Set(names).size, `${s.id}: ${names.join(',')}`).toBe(names.length);
    }
  });
  it('chương ngoài bảng tra rơi về hình cuốn sách; môn lạ rơi về cổng tam quan', () => {
    expect(emblemFor('mon-la', 'c1')).toBe('sach');
    expect(artFor('mon-la')).toBe('tam-quan');
  });
});
