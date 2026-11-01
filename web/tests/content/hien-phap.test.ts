import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { conceptSchema, subjectSchema } from '$lib/content/schema';

const root = join(__dirname, '..', '..', 'content');
const dir = join(root, 'concepts', 'hien-phap');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

describe('nội dung Luật Hiến pháp', () => {
  it('có 10 khái niệm hợp lệ, nguồn statute trỏ vbpl.vn, ngày đối chiếu 2026-11-01', () => {
    expect(files.length).toBe(10);
    for (const f of files) {
      const c = conceptSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      expect(c.source.kind).toBe('statute');
      expect(c.source.url).toMatch(/^https:\/\/vbpl\.vn\//);
      expect(c.checked).toBe('2026-11-01');
      expect(c.items.filter((i) => i.type === 'recall').length).toBe(1);
      expect(c.items.filter((i) => i.type === 'cloze').length).toBe(2);
    }
  });
  it('môn có 2 đợt, mỗi đợt 5 khái niệm, confusables nằm trong cùng môn', () => {
    const s = subjectSchema.parse(JSON.parse(readFileSync(join(root, 'subjects', 'hien-phap.json'), 'utf8')));
    const lessons = s.chapters.flatMap((c) => c.lessons);
    expect(lessons.length).toBe(2);
    for (const l of lessons) expect(l.concepts.length).toBe(5);
    const ids = new Set(files.map((f) => f.replace('.json', '')));
    for (const f of files) {
      const c = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      for (const x of c.confusables) expect(ids.has(x)).toBe(true);
    }
  });
});
