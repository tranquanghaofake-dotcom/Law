import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { conceptSchema, subjectSchema } from '../src/schema';

const root = join(__dirname, '..', 'data');
const dir = join(root, 'concepts', 'hanh-chinh');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const norm = (s: string) => s.normalize('NFC').replace(/\(…\)/g, ' ').replace(/\s+([.,;:])/g, '$1').replace(/\s+/g, ' ').trim();

describe('nội dung Luật Hành chính', () => {
  it('mọi khái niệm hợp lệ, nguồn statute (vấn đề học thuyết 1, 2, 3, 4, 5, 6, 10, 11 dùng nguồn textbook ghi rõ chưa đối chiếu), có recall và 2 cloze', () => {
    expect(files.length).toBe(30);
    const TEXTBOOK_CH: string[] = ["v1", "v2", "v3", "v4", "v5", "v6", "v10", "v11"];
    for (const f of files) {
      const c = conceptSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      if (TEXTBOOK_CH.includes(c.chapter)) {
        expect(c.source.kind, f).toBe('textbook');
        expect(c.source.cite, f).toMatch(/chưa đối chiếu nguyên văn/);
      } else {
        expect(c.source.kind, f).toBe('statute');
        expect(c.source.cite).toMatch(/(Luật Xử lý vi phạm hành chính \(VBHN 90\/VBHN-VPQH 2026\)|Luật Tố tụng hành chính 2015 \(VBHN 13\/VBHN-VPQH 2026\)|Luật Tổ chức Chính phủ 2025 \(63\/2025\/QH15\)|Luật Cán bộ, công chức 2025 \(80\/2025\/QH15\)|Luật Khiếu nại 2011 \(VBHN 28\/VBHN-VPQH 2026\)|Luật Tố cáo 2018 \(VBHN 29\/VBHN-VPQH 2026\))$/);
        expect(c.source.url).toMatch(/^https:\/\/thuvienphapluat\.vn\//);
      }
      expect(c.checked).toBe('2026-11-01');
      expect(c.items.filter((i) => i.type === 'recall').length).toBe(1);
      expect(c.items.filter((i) => i.type === 'cloze').length).toBe(2);
    }
  });
  it('15 vấn đề theo đề cương HLU, khái niệm nằm đúng vấn đề', () => {
    const s = subjectSchema.parse(JSON.parse(readFileSync(join(root, 'subjects', 'hanh-chinh.json'), 'utf8')));
    expect(s.chapters.length).toBe(15);
    for (const ch of s.chapters) for (const l of ch.lessons) for (const id of l.concepts) {
      expect(JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')).chapter).toBe(ch.id);
    }
  });
  it('definition xuất hiện nguyên văn trong văn bản luật (từng câu)', () => {
    const LAWS: [string, string][] = [["Luật Tố tụng hành chính", "ltthc-vbhn-2026.txt"], ["Luật Tổ chức Chính phủ", "ltccp-2025.txt"], ["Luật Cán bộ, công chức", "lcbcc-2025.txt"], ["Luật Khiếu nại", "lkn-vbhn-2026.txt"], ["Luật Tố cáo", "ltc-vbhn-2026.txt"]];
    const cache: Record<string, string> = {};
    const lawFor = (cite: string) => { const hit = LAWS.find(([k]) => cite.includes(k)); const file = hit ? hit[1] : 'xlvphc-vbhn-2026.txt'; return (cache[file] ??= norm(readFileSync(join(root, 'laws', file), 'utf8'))); };
    for (const f of files) {
      const c = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      if (c.source.kind !== 'statute') continue;
      const law = lawFor(c.source.cite);
      for (const part of norm(c.definition).split(/(?<=[.;:])\s+/)) expect(law, `${f}: "${part}"`).toContain(part);
    }
  });
  it('đề kiểm tra: 10 câu, có căn cứ điều luật và link', () => {
    for (const id of ["hanh-chinh-de-1", "hanh-chinh-de-2", "hanh-chinh-de-3"]) {
      const s = JSON.parse(readFileSync(join(root, 'sets', `${id}.json`), 'utf8'));
      expect(s.group).toBe('hanh-chinh');
      expect(s.questions.length).toBe(10);
      for (const q of s.questions) {
        expect(q.basis).toMatch(/Điều \d+ Luật (XLVPHC|Tố tụng hành chính|Tổ chức Chính phủ|Cán bộ, công chức|Khiếu nại|Tố cáo)/);
        expect(q.url).toMatch(/^https:\/\/thuvienphapluat\.vn\//);
      }
    }
  });
});
