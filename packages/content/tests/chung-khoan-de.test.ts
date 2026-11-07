import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { quizSetSchema } from '../src/schema';

const root = join(__dirname, '..', 'data');
const read = (p: string) => readFileSync(join(root, p), 'utf8');

describe('đề nhận định Luật Chứng khoán (chung-khoan-de-1)', () => {
  const set = quizSetSchema.parse(JSON.parse(read('sets/chung-khoan-de-1.json')));
  it('đúng 10 câu, mỗi câu có why 4 dòng, đáp án đúng khác nhau về vị trí', () => {
    expect(set.id).toBe('chung-khoan-de-1');
    expect(set.group).toBe('chung-khoan');
    expect(set.questions.length).toBe(10);
    for (const q of set.questions) expect(q.why, q.q).toHaveLength(4);
    expect(new Set(set.questions.map((q) => q.answer)).size).toBeGreaterThan(1);
  });
  it('mọi "Điều N" trong căn cứ có thật trong văn bản tương ứng của kho laws', () => {
    const ck = read('laws/chung-khoan-vbhn-2026.txt');
    const tt = read('laws/tt-121-2020-btc-trich.txt');
    for (const q of set.questions) {
      const law = /Thông tư 121/.test(q.basis) ? tt : ck;
      const dieus = [...q.basis.matchAll(/Điều (\d+)/g)].map((m) => m[1]);
      expect(dieus.length, q.q).toBeGreaterThan(0);
      for (const d of dieus) expect(law, `${q.q} — Điều ${d}`).toMatch(new RegExp(`^Điều ${d}\\.`, 'm'));
    }
  });
});
