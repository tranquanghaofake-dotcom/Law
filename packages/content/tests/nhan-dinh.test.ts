import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR } from '../src/build';

// Nhận định chấm 3 phần (spec docs/specs/2026-11-07-nhan-dinh-3-phan-design.md) — thí điểm môn Dân sự.
const ND_DONE = ['dan-su'];
const LAWS: Record<string, string> = { 'dan-su': 'blds-2015.txt' };
type Tf = { type: string; statement: string; explain: string; source?: { cite: string }; parts?: { basis: { options: string[]; answer: number }; reason: { options: string[]; answer: number } } };
const dieu = (s: string) => [...s.matchAll(/Điều (\d+)/g)].map((m) => m[1]);

describe('nhận định 3 phần', () => {
  for (const sub of ND_DONE) {
    it(`${sub}: mọi câu Đúng/Sai có parts; căn cứ đúng trỏ tới điều có thật và khớp lời giải thích`, () => {
      const law = readFileSync(join(DATA_DIR, 'laws', LAWS[sub]), 'utf8');
      const dir = join(DATA_DIR, 'concepts', sub);
      let n = 0;
      for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
        const c = JSON.parse(readFileSync(join(dir, f), 'utf8')) as { source: { cite: string }; items: Tf[] };
        for (const it of c.items.filter((i) => i.type === 'truefalse')) {
          n++;
          const where = `${f}: ${it.statement}`;
          expect(it.parts, where).toBeDefined();
          const ok = it.parts!.basis.options[it.parts!.basis.answer];
          for (const d of dieu(it.parts!.basis.options.join(' '))) expect(law, `${where} — Điều ${d}`).toMatch(new RegExp(`^Điều ${d}\\.`, 'm'));
          const known = new Set(dieu(`${it.explain} ${(it.source ?? c.source).cite}`));
          expect(dieu(ok).some((d) => known.has(d)), `${where} — căn cứ đúng «${ok}»`).toBe(true);
          expect(new Set(it.parts!.basis.options).size, where).toBe(4);
          expect(new Set(it.parts!.reason.options).size, where).toBe(4);
        }
      }
      expect(n).toBeGreaterThan(0);
    });
  }
});
