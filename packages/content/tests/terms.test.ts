import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildContent, DATA_DIR } from '../src/build';

describe('dist/terms (bảng tên khái niệm theo môn)', () => {
  const out = mkdtempSync(join(tmpdir(), 'll-terms-'));
  const { errors } = buildContent(DATA_DIR, out);

  it('build không lỗi và sinh terms/hien-phap.json', () => {
    expect(errors).toEqual([]);
    expect(existsSync(join(out, 'terms', 'hien-phap.json'))).toBe(true);
  });

  it('terms/hien-phap.json có đúng số khái niệm của môn và tên không rỗng', () => {
    const terms: Record<string, string> = JSON.parse(readFileSync(join(out, 'terms', 'hien-phap.json'), 'utf8'));
    const files = readdirSync(join(DATA_DIR, 'concepts', 'hien-phap')).filter((f) => f.endsWith('.json'));
    expect(Object.keys(terms).length).toBe(101);
    expect(Object.keys(terms).length).toBe(files.length);
    expect(typeof terms['chu-quyen-nhan-dan']).toBe('string');
    expect(terms['chu-quyen-nhan-dan'].trim().length).toBeGreaterThan(0);
  });

  it('mỗi môn có file terms; khóa là id khái niệm, giá trị là term của khái niệm', () => {
    const subjects = readdirSync(join(DATA_DIR, 'subjects')).filter((f) => f.endsWith('.json'));
    for (const f of subjects) {
      const sid = f.replace('.json', '');
      const terms: Record<string, string> = JSON.parse(readFileSync(join(out, 'terms', `${sid}.json`), 'utf8'));
      for (const [id, term] of Object.entries(terms)) {
        const c = JSON.parse(readFileSync(join(DATA_DIR, 'concepts', sid, `${id}.json`), 'utf8'));
        expect(term).toBe(c.term);
      }
    }
  });
});
