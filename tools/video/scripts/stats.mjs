// Đọc số liệu thật từ packages/content/data → src/stats.json (video không gõ tay con số).
import fs from 'node:fs';
import path from 'node:path';
const DATA = path.join(import.meta.dirname, '..', '..', '..', 'packages', 'content', 'data');
const json = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const subjects = fs.readdirSync(path.join(DATA, 'subjects')).filter((f) => f.endsWith('.json')).map((f) => json(path.join(DATA, 'subjects', f)));
const conceptDir = path.join(DATA, 'concepts');
const terms = [];
for (const d of fs.readdirSync(conceptDir)) for (const f of fs.readdirSync(path.join(conceptDir, d))) if (f.endsWith('.json')) terms.push(json(path.join(conceptDir, d, f)).term);
const sets = fs.readdirSync(path.join(DATA, 'sets')).filter((f) => f.endsWith('.json')).length;
const laws = fs.readdirSync(path.join(DATA, 'laws')).filter((f) => f.endsWith('.txt')).length;
// Lấy mẫu thuật ngữ ngắn, rải đều để làm dải chữ chạy.
const short = terms.filter((t) => t.length <= 26).sort((a, b) => a.localeCompare(b, 'vi'));
const sample = Array.from({ length: 36 }, (_, i) => short[Math.floor((i * short.length) / 36)]);
const out = { subjects: subjects.length, subjectNames: subjects.map((s) => s.short ?? s.title), concepts: terms.length, sets, laws, sample };
fs.writeFileSync(path.join(import.meta.dirname, '..', 'src', 'stats.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`stats: ${out.subjects} môn · ${out.concepts} khái niệm · ${out.sets} bộ đề · ${out.laws} văn bản`);
