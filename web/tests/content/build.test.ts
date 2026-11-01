import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildContent } from '../../scripts/build-content';

function fixture(withBad = false) {
  const root = mkdtempSync(join(tmpdir(), 'll-content-'));
  mkdirSync(join(root, 'subjects')); mkdirSync(join(root, 'concepts', 'hp'), { recursive: true }); mkdirSync(join(root, 'sets'));
  const concept = (id: string) => ({
    id, subject: 'hp', chapter: 'c1', term: id, definition: 'Đ', plain: 'P', example: 'E',
    source: { kind: 'statute', cite: 'Điều 1' }, checked: '2026-11-01', confusables: [], keywords: ['a', 'b', 'c'],
    items: [
      { type: 'mcq', level: 1, q: 'q', options: ['1', '2', '3', '4'], answer: 0, explain: 'e' },
      { type: 'cloze', level: 3, text: 'A {{b}} c' },
      { type: 'truefalse', level: 4, statement: 's', answer: true, explain: 'e' },
    ],
  });
  writeFileSync(join(root, 'subjects', 'hp.json'), JSON.stringify({ id: 'hp', title: 'Hiến pháp', short: 'HP', chapters: [{ id: 'c1', title: 'C1', lessons: [{ id: 'l1', title: 'L1', concepts: ['a', 'b'] }] }] }));
  writeFileSync(join(root, 'concepts', 'hp', 'a.json'), JSON.stringify(concept('a')));
  writeFileSync(join(root, 'concepts', 'hp', 'b.json'), JSON.stringify(concept('b')));
  writeFileSync(join(root, 'sets', 'x.json'), JSON.stringify({ id: 'x', group: 'pldc', title: 'X', subtitle: 'S', updated: '2026-10-31', questions: [{ q: 'q', options: ['1', '2', '3', '4'], answer: 0, explain: 'e', basis: 'Điều 1', url: '' }] }));
  if (withBad) writeFileSync(join(root, 'concepts', 'hp', 'c.json'), JSON.stringify({ ...concept('c'), items: [] }));
  return root;
}

describe('buildContent', () => {
  it('ghi index.json với 1 môn, 2 khái niệm, 1 bộ', () => {
    const root = fixture();
    const { errors, index } = buildContent(root);
    expect(errors).toEqual([]);
    expect(index.subjects.length).toBe(1);
    expect(index.conceptCount.hp).toBe(2);
    expect(index.sets.length).toBe(1);
    expect(index.sets[0].count).toBe(1);
    expect(existsSync(join(root, 'index.json'))).toBe(true);
    expect(JSON.parse(readFileSync(join(root, 'index.json'), 'utf8')).subjects[0].id).toBe('hp');
  });
  it('báo lỗi theo file khi khái niệm sai', () => {
    const { errors } = buildContent(fixture(true));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/c\.json/);
  });
  it('báo lỗi khi đợt tham chiếu khái niệm không tồn tại', () => {
    const root = fixture();
    writeFileSync(join(root, 'subjects', 'hp.json'), JSON.stringify({ id: 'hp', title: 'Hiến pháp', short: 'HP', chapters: [{ id: 'c1', title: 'C1', lessons: [{ id: 'l1', title: 'L1', concepts: ['a', 'zzz'] }] }] }));
    const { errors } = buildContent(root);
    expect(errors.join('\n')).toMatch(/zzz/);
  });
});
