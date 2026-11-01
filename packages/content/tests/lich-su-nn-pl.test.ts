import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { conceptSchema, subjectSchema } from '../src/schema';

const root = join(__dirname, '..', 'data');
const dir = join(root, 'concepts', 'lich-su-nn-pl');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const norm = (s: string) => s.normalize('NFC').replace(/\s+/g, ' ').trim();

describe('nội dung Lịch sử Nhà nước và Pháp luật Việt Nam', () => {
  it('mọi khái niệm hợp lệ; nguồn textbook phải nói rõ là chưa đối chiếu nguyên văn', () => {
    for (const f of files) {
      const c = conceptSchema.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      expect(['primary', 'textbook']).toContain(c.source.kind);
      if (c.source.kind === 'textbook') expect(c.source.cite).toMatch(/chưa đối chiếu nguyên văn/);
    }
  });
  it('chương đánh số theo giáo trình ĐH Luật Hà Nội 2025 (Phần thứ hai: chương 5–8)', () => {
    const s = subjectSchema.parse(JSON.parse(readFileSync(join(root, 'subjects', 'lich-su-nn-pl.json'), 'utf8')));
    for (const ch of s.chapters) {
      expect(ch.title).toMatch(/^Chương [5-8]\. |^Nâng cao/);
      for (const l of ch.lessons) for (const id of l.concepts) expect(JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')).chapter).toBe(ch.id);
    }
  });
  it('definition kiểu primary khớp nguyên văn file sử liệu (bỏ qua đoạn lược "(…)")', () => {
    const src = norm(readFileSync(join(root, 'laws', 'lich-su-su-lieu.txt'), 'utf8'));
    for (const f of files) {
      const c = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      if (c.source.kind !== 'primary') continue;
      const quoted = norm(c.definition).split(' — ')[0];
      for (const part of quoted.split(/\s*\(…\)\s*/).map((p) => p.replace(/^[.,;]\s*/, '').replace(/[.,;]$/, '')).filter(Boolean)) {
        expect(src, `${f}: "${part}"`).toContain(part);
      }
    }
  });
});
