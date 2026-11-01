import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { conceptSchema, subjectSchema } from '../src/schema';

const root = join(__dirname, '..', 'data');
const dir = join(root, 'concepts', 'so-huu-tri-tue');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const norm = (s: string) => s.normalize('NFC').replace(/\(…\)/g, ' ').replace(/đểnghiên/g, 'để nghiên').replace(/\s+([.,;:])/g, '$1').replace(/\s+/g, ' ').trim();

describe('nội dung Luật Sở hữu trí tuệ', () => {
  it('mọi khái niệm hợp lệ, nguồn statute Luật SHTT (VBHN 2026), có recall và 2 cloze', () => {
    expect(files.length).toBe(23);
    for (const f of files) {
      const c = conceptSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      expect(c.source.kind).toBe('statute');
      expect(c.source.cite).toMatch(/Luật Sở hữu trí tuệ \(VBHN 67\/VBHN-VPQH 2026\)$/);
      expect(c.source.url).toMatch(/^https:\/\/thuvienphapluat\.vn\//);
      expect(c.checked).toBe('2026-11-01');
      expect(c.items.filter((i) => i.type === 'recall').length).toBe(1);
      expect(c.items.filter((i) => i.type === 'cloze').length).toBe(2);
    }
  });
  it('14 vấn đề theo đề cương HLU, khái niệm nằm đúng vấn đề', () => {
    const s = subjectSchema.parse(JSON.parse(readFileSync(join(root, 'subjects', 'so-huu-tri-tue.json'), 'utf8')));
    expect(s.chapters.length).toBe(14);
    for (const ch of s.chapters) for (const l of ch.lessons) for (const id of l.concepts) {
      expect(JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')).chapter).toBe(ch.id);
    }
  });
  it('definition xuất hiện nguyên văn trong VBHN Luật SHTT 2026 (từng câu)', () => {
    const law = norm(readFileSync(join(root, 'laws', 'shtt-vbhn-2026.txt'), 'utf8'));
    for (const f of files) {
      const c = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      for (const part of norm(c.definition).split(/(?<=[.;:])\s+/)) expect(law, `${f}: "${part}"`).toContain(part);
    }
  });
  it('đề kiểm tra SHTT: 10 câu, có căn cứ điều luật và link', () => {
    for (const id of ['so-huu-tri-tue-de-1', 'so-huu-tri-tue-de-2']) {
      const s = JSON.parse(readFileSync(join(root, 'sets', `${id}.json`), 'utf8'));
      expect(s.group).toBe('so-huu-tri-tue');
      expect(s.questions.length).toBe(10);
      for (const q of s.questions) {
        expect(q.basis).toMatch(/Điều \d+ Luật SHTT \(VBHN 67\/VBHN-VPQH 2026\)/);
        expect(q.url).toMatch(/^https:\/\/thuvienphapluat\.vn\//);
      }
    }
  });
});

describe('ghi chú sửa đổi Luật SHTT', () => {
  it('note nêu số hiệu luật sửa đổi và hiệu lực', () => {
    const dir2 = join(__dirname, '..', 'data', 'concepts', 'so-huu-tri-tue');
    const withNote = readdirSync(dir2).map((f) => JSON.parse(readFileSync(join(dir2, f), 'utf8'))).filter((c) => c.note);
    expect(withNote.length).toBeGreaterThan(0);
    for (const c of withNote) {
      expect(c.note, c.id).toMatch(/\d+\/\d{4}\/QH\d+/);
      expect(c.note, c.id).toMatch(/hiệu lực/);
    }
  });
});
