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

// Bộ đề 10 câu: bộ đã làm xong thì thêm id vào SETS_DONE (cùng quy tắc như trên).
const SETS_DONE: string[] = ['chuyen-khoan-nham', 'dat-coc', 'nghi-viec-giu-luong', 'dan-su-de-1', 'pldc-quan-he-phap-luat', 'pldc-vi-pham-phap-luat', 'dan-su-de-2', 'dan-su-2-de-1', 'dan-su-2-de-2', 'lao-dong-de-1', 'lao-dong-de-2', 'lao-dong-2-de-1', 'lao-dong-2-de-2', 'hanh-chinh-de-1', 'hanh-chinh-de-2', 'hanh-chinh-de-3', 'hinh-su-de-1', 'hinh-su-de-2', 'ly-luan-nn-pl-de-1', 'to-tung-dan-su-de-1', 'to-tung-dan-su-de-2', 'dau-tu-de-1', 'ly-luan-nn-pl-de-2', 'xay-dung-vbpl-de-1', 'xay-dung-vbpl-de-2', 'an-sinh-xa-hoi-de-1', 'dat-dai-de-1', 'dat-dai-de-2', 'dau-tu-de-2', 'an-sinh-xa-hoi-de-2', 'canh-tranh-de-1', 'canh-tranh-de-2', 'ngan-hang-de-1', 'ngan-hang-de-2', 'tai-chinh-de-1', 'tai-chinh-de-2', 'tai-chinh-doanh-nghiep-de-1', 'so-huu-tri-tue-de-1', 'so-huu-tri-tue-de-2', 'tai-chinh-doanh-nghiep-de-2', 'tai-san-tri-tue-de-1', 'tai-san-tri-tue-de-2', 'thuong-mai-1-de-1', 'thuong-mai-1-de-2', 'thuong-mai-1-de-3', 'thuong-mai-de-1', 'thuong-mai-de-2', 'hon-nhan-gia-dinh-de-1', 'hon-nhan-gia-dinh-de-2'];

describe('why: bộ đề đã làm', () => {
  it('danh sách SETS_DONE trỏ tới bộ đề có thật', () => {
    const ids = readdirSync(join(DATA_DIR, 'sets')).map((f) => f.replace(/\.json$/, ''));
    for (const id of SETS_DONE) expect(ids, id).toContain(id);
  });
  for (const id of SETS_DONE) {
    it(id, () => {
      const s = JSON.parse(readFileSync(join(DATA_DIR, 'sets', `${id}.json`), 'utf8')) as { questions: Item[] };
      for (const q of s.questions) {
        expect(q.why?.length, `${id}: ${q.q}`).toBe(4);
        q.why!.forEach((w, k) => expect(w.startsWith('Đúng'), `${id}: ${q.q} #${k}`).toBe(k === q.answer));
      }
    });
  }
});
