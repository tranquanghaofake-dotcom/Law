import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR } from '../src/build';

// Giải thích từng phương án (`why`) — làm theo đợt, mỗi đợt 1–3 môn (07/11/2026).
// Môn đã làm xong thì thêm vào WHY_DONE: từ đó mọi câu trắc nghiệm, tình huống của môn phải có đủ 4 lời giải thích,
// lời của đáp án đúng bắt đầu bằng "Đúng", lời của nhiễu không bắt đầu bằng "Đúng".
const WHY_DONE = ['hon-nhan-gia-dinh', 'canh-tranh', 'lao-dong-2', 'an-sinh-xa-hoi', 'to-tung-dan-su', 'tai-chinh', 'tai-chinh-doanh-nghiep', 'dau-tu', 'dat-dai', 'so-huu-tri-tue', 'tai-san-tri-tue', 'xay-dung-vbpl', 'ngan-hang', 'thuong-mai', 'dan-su', 'thuong-mai-1', 'lao-dong', 'dan-su-2', 'hanh-chinh', 'ly-luan-nn-pl', 'hinh-su', 'lich-su-nn-pl', 'hien-phap', 'chung-khoan'];

type Item = { type: string; q?: string; options?: string[]; answer?: number; why?: string[] };

describe('why: giải thích từng phương án ở các môn đã làm', () => {
  for (const sub of WHY_DONE) {
    it(sub, () => {
      const dir = join(DATA_DIR, 'concepts', sub);
      for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
        const c = JSON.parse(readFileSync(join(dir, f), 'utf8')) as { items: Item[] };
        for (const it of c.items.filter((i) => i.type === 'mcq' || i.type === 'case')) {
          const where = `${sub}/${f}: ${it.q}`;
          expect(it.why?.length, where).toBe(4);
          it.why!.forEach((w, k) => expect(w.startsWith('Đúng'), `${where} #${k}`).toBe(k === it.answer));
        }
      }
    });
  }
});
