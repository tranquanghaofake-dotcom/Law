// Kiểm tra mọi JSON trong data/ và sinh dist/ (bản sao data + index.json) cho app phục vụ tại /content/.
//   npm run build            (trong packages/content, hoặc `npm run content` ở gốc)
// Bộ/khái niệm sai định dạng được in lỗi (tiếng Việt) và tiến trình trả 1 để không lên web.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZodError, ZodType } from 'zod';
import { conceptSchema, quizSetSchema, subjectSchema } from './schema';
import type { Concept, ContentIndex, QuizSet, Subject } from './types';

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

function fmt(e: ZodError): string {
  return e.issues.map((i) => `${i.path.join('.') || '(gốc)'}: ${i.message}`).join('; ');
}

function parseFile<T>(path: string, schema: ZodType<T>): Parsed<T> {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    return { ok: false, error: `${basename(path)}: JSON lỗi — ${(err as Error).message}` };
  }
  const r = schema.safeParse(raw);
  if (!r.success) return { ok: false, error: `${basename(path)}: ${fmt(r.error)}` };
  return { ok: true, value: r.data as T };
}

function jsonFiles(dir: string): string[] {
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => join(dir, f)) : [];
}

/** Thư mục con của data/ được đưa lên web. `laws/` (toàn văn) chỉ dùng để test đối chiếu, không ship. */
const PUBLISHED_DIRS = ['subjects', 'concepts', 'sets'];

/**
 * Kiểm tra toàn bộ nội dung trong `root` (data/) và ghi `index.json`.
 * Nếu `outDir` khác `root`: xoá outDir, sao chép các thư mục publish vào đó rồi ghi index.json ở đó.
 */
export function buildContent(root: string, outDir: string = root): { errors: string[]; index: ContentIndex } {
  const errors: string[] = [];
  const subjects: Subject[] = [];
  const concepts = new Map<string, Map<string, Concept>>(); // subject → id → concept
  const sets: QuizSet[] = [];

  for (const f of jsonFiles(join(root, 'subjects'))) {
    const p = parseFile(f, subjectSchema);
    if (!p.ok) { errors.push(`subjects/${p.error}`); continue; }
    if (p.value.id !== basename(f, '.json')) errors.push(`subjects/${basename(f)}: id '${p.value.id}' phải trùng tên file`);
    subjects.push(p.value);
  }

  const conceptsRoot = join(root, 'concepts');
  const subjectDirs = existsSync(conceptsRoot) ? readdirSync(conceptsRoot, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : [];
  for (const sid of subjectDirs) {
    const map = new Map<string, Concept>();
    for (const f of jsonFiles(join(conceptsRoot, sid))) {
      const p = parseFile(f, conceptSchema);
      if (!p.ok) { errors.push(`concepts/${sid}/${p.error}`); continue; }
      if (p.value.id !== basename(f, '.json')) errors.push(`concepts/${sid}/${basename(f)}: id '${p.value.id}' phải trùng tên file`);
      if (p.value.subject !== sid) errors.push(`concepts/${sid}/${basename(f)}: subject '${p.value.subject}' phải là '${sid}'`);
      map.set(p.value.id, p.value);
    }
    concepts.set(sid, map);
  }

  for (const s of subjects) {
    const map = concepts.get(s.id) ?? new Map<string, Concept>();
    for (const ch of s.chapters) for (const l of ch.lessons) for (const cid of l.concepts) {
      if (!map.has(cid)) errors.push(`subjects/${s.id}.json: đợt '${l.id}' tham chiếu khái niệm '${cid}' không tồn tại trong concepts/${s.id}/`);
    }
    for (const c of map.values()) for (const x of c.confusables) {
      if (!map.has(x)) errors.push(`concepts/${s.id}/${c.id}.json: confusables '${x}' không tồn tại`);
    }
  }

  for (const f of jsonFiles(join(root, 'sets'))) {
    const p = parseFile(f, quizSetSchema);
    if (!p.ok) { errors.push(`sets/${p.error}`); continue; }
    if (p.value.id !== basename(f, '.json')) errors.push(`sets/${basename(f)}: id '${p.value.id}' phải trùng tên file`);
    sets.push(p.value);
  }

  const index: ContentIndex = {
    subjects: subjects.map(({ id, title, short }) => ({ id, title, short })),
    conceptCount: Object.fromEntries(subjects.map((s) => [s.id, concepts.get(s.id)?.size ?? 0])),
    sets: sets.map(({ questions, ...rest }) => ({ ...rest, count: questions.length })),
  };

  if (outDir !== root) {
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(outDir, { recursive: true });
    for (const d of PUBLISHED_DIRS) if (existsSync(join(root, d))) cpSync(join(root, d), join(outDir, d), { recursive: true });
  }
  writeFileSync(join(outDir, 'index.json'), JSON.stringify(index, null, 1) + '\n', 'utf8');
  return { errors, index };
}

const here = fileURLToPath(new URL('.', import.meta.url));
export const DATA_DIR = join(here, '..', 'data');
export const DIST_DIR = join(here, '..', 'dist');

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const root = process.argv[2] ?? DATA_DIR;
  const out = process.argv[3] ?? DIST_DIR;
  const { errors, index } = buildContent(root, out);
  for (const e of errors) console.error(`[content] LỖI ${e}`);
  const nConcepts = Object.values(index.conceptCount).reduce((a, b) => a + b, 0);
  console.log(`[content] ${index.subjects.length} môn, ${nConcepts} khái niệm, ${index.sets.length} bộ, ${errors.length} lỗi → ${out}`);
  process.exit(errors.length ? 1 : 0);
}
