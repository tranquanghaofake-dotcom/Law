import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { conceptSchema, subjectSchema } from '../src/schema';

const root = join(__dirname, '..', 'data');
const dir = join(root, 'concepts', 'to-tung-hanh-chinh');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
// File luật giữ ký hiệu đánh số kiểu markdown ("1\. "); bỏ dấu "\" khi so.
const norm = (s: string) => s.normalize('NFC').replace(/\\\./g, '.').replace(/\s+([.,;:])/g, '$1').replace(/\s+/g, ' ').trim();

describe('nội dung Luật Tố tụng hành chính', () => {
  it('25 khái niệm hợp lệ, nguồn statute Luật Tố tụng hành chính 2015 (VBHN 13/VBHN-VPQH 2026), có recall và 2 cloze', () => {
    expect(files.length).toBe(25);
    for (const f of files) {
      const c = conceptSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      expect(c.source.kind).toBe('statute');
      expect(c.source.cite).toMatch(/Luật Tố tụng hành chính 2015$/);
      expect(c.checked).toBe('2026-11-07');
      expect(c.items.filter((i) => i.type === 'recall').length).toBe(1);
      expect(c.items.filter((i) => i.type === 'cloze').length).toBe(2);
      for (const it of c.items) if (it.type === 'mcq' || it.type === 'case') expect(it.why?.length, `${f}: ${it.q}`).toBe(4);
    }
  });
  it('id khái niệm không trùng với môn khác (tiến độ lưu theo id)', () => {
    const others = readdirSync(join(root, 'concepts')).filter((d) => d !== 'to-tung-hanh-chinh').flatMap((d) => readdirSync(join(root, 'concepts', d)));
    for (const f of files) expect(others, f).not.toContain(f);
  });
  it('7 chương, khái niệm nằm đúng chương', () => {
    const s = subjectSchema.parse(JSON.parse(readFileSync(join(root, 'subjects', 'to-tung-hanh-chinh.json'), 'utf8')));
    expect(s.chapters.length).toBe(7);
    for (const ch of s.chapters) for (const l of ch.lessons) for (const id of l.concepts) {
      expect(JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')).chapter).toBe(ch.id);
    }
  });
  it('definition và cloze xuất hiện nguyên văn trong VBHN Luật Tố tụng hành chính (từng câu)', () => {
    const law = norm(readFileSync(join(root, 'laws', 'ltthc-vbhn-2026.txt'), 'utf8'));
    for (const f of files) {
      const c = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      for (const part of norm(c.definition).split(/(?<=[.;:])\s+/)) expect(law, `${f}: "${part}"`).toContain(part);
      for (const it of c.items.filter((i: { type: string }) => i.type === 'cloze')) {
        const text = norm(it.text.replace(/\{\{([^{}]+)\}\}/g, '$1'));
        for (const part of text.split(/(?<=[.;:])\s+/)) expect(law, `${f} cloze: "${part}"`).toContain(part);
      }
    }
  });
});
