// `npm run quality` (ở gốc): ghi docs/review/chat-luong-cau.md — danh sách câu cần viết lại theo quy tắc NBME.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATA_DIR } from './build';
import { lintAll, type Rule } from './quality';
import type { Concept } from './types';

const concepts: Concept[] = readdirSync(join(DATA_DIR, 'concepts')).flatMap((s) =>
  readdirSync(join(DATA_DIR, 'concepts', s)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(DATA_DIR, 'concepts', s, f), 'utf8')) as Concept));
const found = lintAll(concepts);

const TITLE: Record<Rule, string> = {
  'stem-phu-dinh': 'Stem phủ định (cái nào KHÔNG/SAI…): đổi sang hỏi khẳng định',
  clang: 'Đáp án đúng trùng chữ với stem nhiều nhất: viết lại nhiễu cho trùng chữ tương đương',
  'tf-tuyet-doi': 'Nhận định Sai chứa từ tuyệt đối (mọi/chỉ/luôn/đều…): thêm nhận định Sai không có mẹo này',
};
const lines = [`# Chất lượng câu hỏi theo NBME / Haladyna (tự sinh bởi \`npm run quality\`)`, '', `Tổng khái niệm: ${concepts.length}. Chỉ liệt kê, không tự sửa. Ngưỡng chặn tăng nằm ở \`packages/content/tests/quality.test.ts\`.`, ''];
for (const r of Object.keys(TITLE) as Rule[]) {
  const list = found.filter((f) => f.rule === r);
  lines.push(`## ${TITLE[r]} — ${list.length} câu`, '');
  const bySubject = new Map<string, typeof list>();
  for (const f of list) bySubject.set(f.subject, [...(bySubject.get(f.subject) ?? []), f]);
  for (const [s, fs] of [...bySubject].sort((a, b) => b[1].length - a[1].length)) {
    lines.push(`### ${s} (${fs.length})`);
    for (const f of fs) lines.push(`- \`${f.conceptId}\` #${f.item}: ${f.text.replace(/\s+/g, ' ')}`);
    lines.push('');
  }
}
const out = join(dirname(fileURLToPath(import.meta.url)), '../../../docs/review/chat-luong-cau.md');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join('\n'));
console.log(`Đã ghi ${out}: ${Object.keys(TITLE).map((r) => `${r}=${found.filter((f) => f.rule === r).length}`).join(', ')}`);
