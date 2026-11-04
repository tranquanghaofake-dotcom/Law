import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { conceptSchema, subjectSchema } from '../src/schema';

const root = join(__dirname, '..', 'data');
const dir = join(root, 'concepts', 'ly-luan-nn-pl');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const norm = (s: string) => s.normalize('NFC').replace(/\(…\)/g, ' ').replace(/\s+([.,;:])/g, '$1').replace(/\s+/g, ' ').trim();

describe('nội dung Lý luận chung về Nhà nước và Pháp luật', () => {
  it('mọi khái niệm hợp lệ, nguồn statute (vấn đề học thuyết 1, 2, 4, 5, 6, 7, 8 dùng nguồn textbook ghi rõ chưa đối chiếu), có recall và 2 cloze', () => {
    expect(files.length).toBe(30);
    const TEXTBOOK_CH: string[] = ["v1", "v2", "v4", "v5", "v6", "v7", "v8"];
    for (const f of files) {
      const c = conceptSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      if (c.source.kind === 'textbook') {
        expect(TEXTBOOK_CH, f).toContain(c.chapter);
        expect(c.source.cite, f).toMatch(/chưa đối chiếu nguyên văn/);
      } else {
        expect(c.source.kind, f).toBe('statute');
        expect(c.source.cite).toMatch(/(Hiến pháp 2013|Bộ luật Dân sự 2015|Bộ luật Hình sự 2015 \(sửa đổi, bổ sung năm 2017, 2025\)|Luật Xử lý vi phạm hành chính \(sửa đổi, bổ sung đến năm 2025\)|Luật Ban hành văn bản quy phạm pháp luật 2025 \(sửa đổi, bổ sung năm 2025\))$/);
        expect(c.source.url).toMatch(/^https:\/\/(thuvienphapluat|vbpl)\.vn\//);
      }
      expect(c.checked).toBe('2026-11-01');
      expect(c.items.filter((i) => i.type === 'recall').length).toBe(1);
      expect(c.items.filter((i) => i.type === 'cloze').length).toBe(2);
    }
  });
  it('8 vấn đề theo đề cương HLU, khái niệm nằm đúng vấn đề', () => {
    const s = subjectSchema.parse(JSON.parse(readFileSync(join(root, 'subjects', 'ly-luan-nn-pl.json'), 'utf8')));
    expect(s.chapters.length).toBe(8);
    for (const ch of s.chapters) for (const l of ch.lessons) for (const id of l.concepts) {
      expect(JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')).chapter).toBe(ch.id);
    }
  });
  it('definition xuất hiện nguyên văn trong văn bản luật (từng câu)', () => {
    const LAWS: [string, string][] = [["Bộ luật Dân sự", "blds-2015.txt"], ["Bộ luật Hình sự", "blhs-vbhn-2025.txt"], ["Xử lý vi phạm hành chính", "xlvphc-vbhn-2026.txt"], ["Ban hành văn bản", "bhvbqppl-vbhn-2025.txt"]];
    const cache: Record<string, string> = {};
    const lawFor = (cite: string) => { const hit = LAWS.find(([k]) => cite.includes(k)); const file = hit ? hit[1] : 'hien-phap-2013.txt'; return (cache[file] ??= norm(readFileSync(join(root, 'laws', file), 'utf8'))); };
    for (const f of files) {
      const c = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      if (c.source.kind !== 'statute') continue;
      const law = lawFor(c.source.cite);
      for (const part of norm(c.definition).split(/(?<=[.;:])\s+/)) expect(law, `${f}: "${part}"`).toContain(part);
    }
  });
  it('đề kiểm tra: 10 câu, có căn cứ điều luật và link', () => {
    for (const id of ["ly-luan-nn-pl-de-1", "ly-luan-nn-pl-de-2"]) {
      const s = JSON.parse(readFileSync(join(root, 'sets', `${id}.json`), 'utf8'));
      expect(s.group).toBe('ly-luan-nn-pl');
      expect(s.questions.length).toBe(10);
      for (const q of s.questions) {
        expect(q.basis).toMatch(/(Điều|Khoản|Điểm) .*(Hiến pháp 2013|Bộ luật Dân sự 2015|Bộ luật Hình sự 2015|Luật Xử lý vi phạm hành chính|Luật Ban hành văn bản quy phạm pháp luật)/);
        expect(q.url).toMatch(/^https:\/\/(thuvienphapluat|vbpl)\.vn\//);
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
