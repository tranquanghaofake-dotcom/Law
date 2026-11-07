import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { conceptSchema, quizSetSchema, subjectSchema } from '../src/schema';

const root = join(__dirname, '..', 'data');
const dir = join(root, 'concepts', 'hon-nhan-gia-dinh');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const norm = (s: string) => s.normalize('NFC').replace(/\(…\)/g, ' ').replace(/\s+([.,;:])/g, '$1').replace(/\s+/g, ' ').trim();

describe('nội dung Luật Hôn nhân và gia đình', () => {
  it('25 khái niệm hợp lệ, nguồn statute Luật Hôn nhân và gia đình 2014 (VBHN 121/VBHN-VPQH), có recall và 2 cloze', () => {
    expect(files.length).toBe(25);
    for (const f of files) {
      const c = conceptSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      expect(c.source.kind).toBe('statute');
      expect(c.source.cite).toMatch(/Luật Hôn nhân và gia đình 2014$/);
      expect(c.source.url).toMatch(/121-VBHN-VPQH-2025/);
      expect(c.checked).toBe('2026-11-07');
      expect(c.items.filter((i) => i.type === 'recall').length).toBe(1);
      expect(c.items.filter((i) => i.type === 'cloze').length).toBe(2);
    }
  });
  it('mọi câu trắc nghiệm, tình huống đều giải thích vì sao từng phương án đúng/sai (why)', () => {
    for (const f of files) {
      const c = conceptSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      for (const it of c.items) if (it.type === 'mcq' || it.type === 'case') expect(it.why?.length, `${f}: ${it.q}`).toBe(4);
    }
  });
  it('6 chương, khái niệm nằm đúng chương', () => {
    const s = subjectSchema.parse(JSON.parse(readFileSync(join(root, 'subjects', 'hon-nhan-gia-dinh.json'), 'utf8')));
    expect(s.chapters.length).toBe(6);
    for (const ch of s.chapters) for (const l of ch.lessons) for (const id of l.concepts) {
      expect(JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')).chapter).toBe(ch.id);
    }
  });
  it('definition và cloze xuất hiện nguyên văn trong VBHN Luật Hôn nhân và gia đình (từng câu)', () => {
    const law = norm(readFileSync(join(root, 'laws', 'hngd-vbhn-2025.txt'), 'utf8'));
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

describe('đề kiểm tra Hôn nhân và gia đình', () => {
  const ids = ['hon-nhan-gia-dinh-de-1', 'hon-nhan-gia-dinh-de-2'];
  it('2 đề × 10 câu, hợp lệ, nhóm hon-nhan-gia-dinh, căn cứ Điều … Luật Hôn nhân và gia đình 2014, link VBHN 121', () => {
    for (const id of ids) {
      const s = quizSetSchema.parse(JSON.parse(readFileSync(join(root, 'sets', `${id}.json`), 'utf8')));
      expect(s.group).toBe('hon-nhan-gia-dinh');
      expect(s.questions).toHaveLength(10);
      for (const q of s.questions) {
        expect(q.basis, q.q).toMatch(/Điều \d+ Luật Hôn nhân và gia đình 2014$/);
        expect(q.url, q.q).toContain('121-VBHN-VPQH-2025');
        expect(q.why, q.q).toHaveLength(4);
      }
    }
  });
  it('đáp án rải đều: mỗi vị trí A–D xuất hiện ít nhất 3 lần trong 20 câu', () => {
    const pos = [0, 0, 0, 0];
    for (const id of ids) for (const q of JSON.parse(readFileSync(join(root, 'sets', `${id}.json`), 'utf8')).questions) pos[q.answer]++;
    for (const n of pos) expect(n).toBeGreaterThanOrEqual(3);
  });
});
