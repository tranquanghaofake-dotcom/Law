import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { conceptSchema, subjectSchema } from '../src/schema';

const root = join(__dirname, '..', 'data');
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

describe('nguyên văn (I6)', () => {
  const law = readFileSync(join(root, 'laws', 'hien-phap-2013.txt'), 'utf8');
  const norm = (s: string) => s.normalize('NFC').replace(/\\\./g, '.').replace(/\s+/g, ' ').replace(/hoà/g, 'hòa').replace(/Hoà/g, 'Hòa').trim();
  const lawN = norm(law);
  it('mọi definition kiểu statute xuất hiện nguyên văn trong toàn văn Hiến pháp (từng câu)', () => {
    for (const f of files) {
      const c = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      for (const sentence of norm(c.definition).split(/(?<=\.)\s+/)) {
        expect(lawN, `${f}: "${sentence}"`).toContain(sentence);
      }
    }
  });
  it('ví dụ về bảo vệ Hiến pháp không gán cho UBTVQH quyền bãi bỏ văn bản của Chính phủ', () => {
    const c = JSON.parse(readFileSync(join(dir, 'bao-ve-hien-phap.json'), 'utf8'));
    expect(c.example).not.toMatch(/thường vụ Quốc hội đình chỉ, bãi bỏ/);
    expect(c.example).toMatch(/Điều 74/);
  });
});
