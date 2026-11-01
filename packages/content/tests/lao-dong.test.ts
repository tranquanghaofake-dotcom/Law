import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { conceptSchema, subjectSchema } from '../src/schema';

const root = join(__dirname, '..', 'data');
const dir = join(root, 'concepts', 'lao-dong');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const norm = (s: string) => s.normalize('NFC').replace(/\(…\)/g, ' ').replace(/\s+([.,;:])/g, '$1').replace(/\s+/g, ' ').trim();

describe('nội dung Luật Lao động', () => {
  it('mọi khái niệm hợp lệ, nguồn statute BLLĐ (VBHN 2025), có recall và 2 cloze', () => {
    expect(files.length).toBe(25);
    for (const f of files) {
      const c = conceptSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      expect(c.source.kind).toBe('statute');
      expect(c.source.cite).toMatch(/Bộ luật Lao động 2019 \(VBHN 125\/VBHN-VPQH 2025\)$/);
      expect(c.source.url).toMatch(/^https:\/\/thuvienphapluat\.vn\//);
      expect(c.checked).toBe('2026-11-01');
      expect(c.items.filter((i) => i.type === 'recall').length).toBe(1);
      expect(c.items.filter((i) => i.type === 'cloze').length).toBe(2);
    }
  });
  it('9 vấn đề theo đề cương HLU, khái niệm nằm đúng vấn đề', () => {
    const s = subjectSchema.parse(JSON.parse(readFileSync(join(root, 'subjects', 'lao-dong.json'), 'utf8')));
    expect(s.chapters.length).toBe(9);
    for (const ch of s.chapters) for (const l of ch.lessons) for (const id of l.concepts) {
      expect(JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')).chapter).toBe(ch.id);
    }
  });
  it('definition xuất hiện nguyên văn trong VBHN Bộ luật Lao động 2025 (từng câu)', () => {
    const law = norm(readFileSync(join(root, 'laws', 'blld-vbhn-2025.txt'), 'utf8'));
    for (const f of files) {
      const c = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      for (const part of norm(c.definition).split(/(?<=[.;:])\s+/)) expect(law, `${f}: "${part}"`).toContain(part);
    }
  });
  it('đề kiểm tra lao động: 10 câu, có căn cứ điều luật và link', () => {
    for (const id of ['lao-dong-de-1', 'lao-dong-de-2']) {
      const s = JSON.parse(readFileSync(join(root, 'sets', `${id}.json`), 'utf8'));
      expect(s.group).toBe('lao-dong');
      expect(s.questions.length).toBe(10);
      for (const q of s.questions) {
        expect(q.basis).toMatch(/Điều \d+ BLLĐ 2019 \(VBHN 125\/VBHN-VPQH 2025\)/);
        expect(q.url).toMatch(/^https:\/\/thuvienphapluat\.vn\//);
      }
    }
  });
});

