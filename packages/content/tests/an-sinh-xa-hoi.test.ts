import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { conceptSchema, subjectSchema } from '../src/schema';

const root = join(__dirname, '..', 'data');
const dir = join(root, 'concepts', 'an-sinh-xa-hoi');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const norm = (s: string) => s.normalize('NFC').replace(/\(…\)/g, ' ').replace(/\s+([.,;:])/g, '$1').replace(/\s+/g, ' ').trim();

describe('nội dung Luật An sinh xã hội', () => {
  it('mọi khái niệm hợp lệ, nguồn statute (vấn đề học thuyết 1, 6 dùng nguồn textbook ghi rõ chưa đối chiếu), có recall và 2 cloze', () => {
    expect(files.length).toBe(12);
    const TEXTBOOK_CH: string[] = ["v1", "v6"];
    for (const f of files) {
      const c = conceptSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      if (TEXTBOOK_CH.includes(c.chapter)) {
        expect(c.source.kind, f).toBe('textbook');
        expect(c.source.cite, f).toMatch(/chưa đối chiếu nguyên văn/);
      } else {
        expect(c.source.kind, f).toBe('statute');
        expect(c.source.cite).toMatch(/(Luật Bảo hiểm xã hội 2024 \(VBHN 19\/VBHN-VPQH 2026\)|Luật Việc làm 2025 \(74\/2025\/QH15\)|Luật Bảo hiểm y tế \(VBHN 40\/VBHN-VPQH 2026\)|Pháp lệnh Ưu đãi người có công với cách mạng 2020 \(02\/2020\/UBTVQH14\))$/);
        expect(c.source.url).toMatch(/^https:\/\/thuvienphapluat\.vn\//);
      }
      expect(c.checked).toBe('2026-11-01');
      expect(c.items.filter((i) => i.type === 'recall').length).toBe(1);
      expect(c.items.filter((i) => i.type === 'cloze').length).toBe(2);
    }
  });
  it('6 vấn đề theo đề cương HLU, khái niệm nằm đúng vấn đề', () => {
    const s = subjectSchema.parse(JSON.parse(readFileSync(join(root, 'subjects', 'an-sinh-xa-hoi.json'), 'utf8')));
    expect(s.chapters.length).toBe(6);
    for (const ch of s.chapters) for (const l of ch.lessons) for (const id of l.concepts) {
      expect(JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')).chapter).toBe(ch.id);
    }
  });
  it('definition xuất hiện nguyên văn trong văn bản luật (từng câu)', () => {
    const LAWS: [string, string][] = [["Luật Việc làm", "lvl-2025.txt"], ["Luật Bảo hiểm y tế", "lbhyt-vbhn-2026.txt"], ["Pháp lệnh Ưu đãi", "plud-2020.txt"]];
    const cache: Record<string, string> = {};
    const lawFor = (cite: string) => { const hit = LAWS.find(([k]) => cite.includes(k)); const file = hit ? hit[1] : 'lbhxh-2024.txt'; return (cache[file] ??= norm(readFileSync(join(root, 'laws', file), 'utf8'))); };
    for (const f of files) {
      const c = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      if (c.source.kind !== 'statute') continue;
      const law = lawFor(c.source.cite);
      for (const part of norm(c.definition).split(/(?<=[.;:])\s+/)) expect(law, `${f}: "${part}"`).toContain(part);
    }
  });
  it('đề kiểm tra: 10 câu, có căn cứ điều luật và link', () => {
    for (const id of ["an-sinh-xa-hoi-de-1", "an-sinh-xa-hoi-de-2"]) {
      const s = JSON.parse(readFileSync(join(root, 'sets', `${id}.json`), 'utf8'));
      expect(s.group).toBe('an-sinh-xa-hoi');
      expect(s.questions.length).toBe(10);
      for (const q of s.questions) {
        expect(q.basis).toMatch(/Điều \d+ (Luật Bảo hiểm xã hội|Luật Việc làm|Luật Bảo hiểm y tế|Pháp lệnh Ưu đãi)/);
        expect(q.url).toMatch(/^https:\/\/thuvienphapluat\.vn\//);
      }
    }
  });
});

describe('ghi chú sửa đổi', () => {
  it('note nêu số hiệu luật sửa đổi và hiệu lực', () => {
    const withNote = files.map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8'))).filter((c) => c.note);
    expect(withNote.length).toBeGreaterThan(0);
    for (const c of withNote) {
      expect(c.note, c.id).toMatch(/\d+\/\d{4}\/(UBTV)?QH\d+/);
      expect(c.note, c.id).toMatch(/hiệu lực/);
    }
  });
});
