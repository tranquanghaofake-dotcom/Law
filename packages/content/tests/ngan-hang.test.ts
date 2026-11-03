import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { conceptSchema, subjectSchema } from '../src/schema';

const root = join(__dirname, '..', 'data');
const dir = join(root, 'concepts', 'ngan-hang');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const norm = (s: string) => s.normalize('NFC').replace(/\(…\)/g, ' ').replace(/\s+([.,;:])/g, '$1').replace(/\s+/g, ' ').trim();

describe('nội dung Luật Ngân hàng', () => {
  it('mọi khái niệm hợp lệ, nguồn statute, có recall và 2 cloze', () => {
    expect(files.length).toBe(21);
    const TEXTBOOK_CH: string[] = [];
    for (const f of files) {
      const c = conceptSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      if (c.source.kind === 'textbook') {
        expect(TEXTBOOK_CH, f).toContain(c.chapter);
        expect(c.source.cite, f).toMatch(/chưa đối chiếu nguyên văn/);
      } else {
        expect(c.source.kind, f).toBe('statute');
        expect(c.source.cite).toMatch(/(Luật Các tổ chức tín dụng 2024 \(VBHN 143\/2026\/VBHN-LQ-VPQH\)|Luật Ngân hàng Nhà nước Việt Nam 2010 \(VBHN 141\/2026\/VBHN-LQ-VPQH\)|Pháp lệnh Ngoại hối 2005 \(VBHN 140\/2026\/VBHN-PL-VPQH\)|Luật Bảo hiểm tiền gửi 2025 \(111\/2025\/QH15\))$/);
        expect(c.source.url).toMatch(/^https:\/\/thuvienphapluat\.vn\//);
      }
      expect(c.checked).toBe('2026-11-01');
      expect(c.items.filter((i) => i.type === 'recall').length).toBe(1);
      expect(c.items.filter((i) => i.type === 'cloze').length).toBe(2);
    }
  });
  it('7 vấn đề theo đề cương HLU, khái niệm nằm đúng vấn đề', () => {
    const s = subjectSchema.parse(JSON.parse(readFileSync(join(root, 'subjects', 'ngan-hang.json'), 'utf8')));
    expect(s.chapters.length).toBe(7);
    for (const ch of s.chapters) for (const l of ch.lessons) for (const id of l.concepts) {
      expect(JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')).chapter).toBe(ch.id);
    }
  });
  it('definition xuất hiện nguyên văn trong văn bản luật (từng câu)', () => {
    const LAWS: [string, string][] = [["Luật Ngân hàng Nhà nước", "lnhnn-vbhn-2026.txt"], ["Pháp lệnh Ngoại hối", "plnh-vbhn-2026.txt"], ["Luật Bảo hiểm tiền gửi", "lbhtg-2025.txt"]];
    const cache: Record<string, string> = {};
    const lawFor = (cite: string) => { const hit = LAWS.find(([k]) => cite.includes(k)); const file = hit ? hit[1] : 'ltctd-vbhn-2026.txt'; return (cache[file] ??= norm(readFileSync(join(root, 'laws', file), 'utf8'))); };
    for (const f of files) {
      const c = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      if (c.source.kind !== 'statute') continue;
      const law = lawFor(c.source.cite);
      for (const part of norm(c.definition).split(/(?<=[.;:])\s+/)) expect(law, `${f}: "${part}"`).toContain(part);
    }
  });
  it('đề kiểm tra: 10 câu, có căn cứ điều luật và link', () => {
    for (const id of ["ngan-hang-de-1", "ngan-hang-de-2"]) {
      const s = JSON.parse(readFileSync(join(root, 'sets', `${id}.json`), 'utf8'));
      expect(s.group).toBe('ngan-hang');
      expect(s.questions.length).toBe(10);
      for (const q of s.questions) {
        expect(q.basis).toMatch(/Điều \d+ (Luật|Pháp lệnh)/);
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
      expect(c.note, c.id).toMatch(/\d+\/\d{4}\/QH\d+/);
      expect(c.note, c.id).toMatch(/hiệu lực/);
    }
  });
});
