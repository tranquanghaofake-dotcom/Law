import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { conceptSchema, subjectSchema } from '../src/schema';

const root = join(__dirname, '..', 'data');
const dir = join(root, 'concepts', 'chung-khoan');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const norm = (s: string) => s.normalize('NFC').replace(/\(…\)/g, ' ').replace(/\s+/g, ' ').replace(/chứngkhoán/g, 'chứng khoán').replace(/công ty con(?=trong|được)/g, 'công ty con ').replace(/khoán bao gồmhoạt/g, 'khoán bao gồm hoạt').trim();

describe('nội dung Luật Chứng khoán', () => {
  it('mọi khái niệm hợp lệ, nguồn statute trỏ VBHN trên vbpl.vn, có recall và 2 cloze', () => {
    expect(files.length).toBe(30);
    for (const f of files) {
      const c = conceptSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      expect(c.source.kind).toBe('statute');
      expect(c.source.cite).toMatch(/VBHN 102\/VBHN-VPQH/);
      expect(c.source.url).toMatch(/^https:\/\/vbpl\.vn\//);
      expect(c.items.filter((i) => i.type === 'recall').length).toBe(1);
      expect(c.items.filter((i) => i.type === 'cloze').length).toBe(2);
    }
  });
  it('chương I theo giáo trình ĐH Luật Hà Nội, khái niệm nằm đúng chương', () => {
    const s = subjectSchema.parse(JSON.parse(readFileSync(join(root, 'subjects', 'chung-khoan.json'), 'utf8')));
    expect(s.chapters[0].title).toMatch(/^Chương I\. Khái niệm về luật chứng khoán/);
    for (const ch of s.chapters) for (const l of ch.lessons) for (const id of l.concepts) {
      expect(JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')).chapter).toBe(ch.id);
    }
  });
  it('definition xuất hiện nguyên văn trong văn bản hợp nhất (từng câu)', () => {
    const law = norm(readFileSync(join(root, 'laws', 'chung-khoan-vbhn-2026.txt'), 'utf8'));
    for (const f of files) {
      const c = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      for (const part of norm(c.definition).split(/(?<=[.;:])\s+/)) expect(law, `${f}: "${part}"`).toContain(part);
    }
  });
  it('note (cập nhật luật) luôn nêu số hiệu văn bản sửa đổi và hiệu lực', () => {
    const withNote = files.map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8'))).filter((c) => c.note);
    expect(withNote.length).toBeGreaterThan(0);
    for (const c of withNote) {
      expect(c.note, c.id).toMatch(/\d+\/\d{4}\/QH\d+/);
      expect(c.note, c.id).toMatch(/hiệu lực/);
    }
  });
});
