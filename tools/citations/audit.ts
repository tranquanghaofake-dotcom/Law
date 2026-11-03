// Công cụ dò trích dẫn (đợt 7). Đi qua mọi item của concepts/*/*.json và mọi câu sets/*.json, tách trích dẫn
// điều/khoản/điểm, ánh xạ sang laws/*.txt và gắn cờ. Chạy:
//   npx tsx tools/citations/audit.ts [thư-mục-ra]        (mặc định $DOT7/audit)
// Ra: <ra>/flags/<môn>.jsonl, <ra>/summary.md, <ra>/stats.json.
// Loại cờ: khong-anh-xa, dieu-khong-ton-tai, khoan-diem-khong-ton-tai, lech-noi-dung, thuat-ngu-cu, hai-dap-an.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildUrlMap, EXCERPT_FILES, scanLaws, urlKey, type Resolved } from './laws';
import { extractCitations, features, normOption, overlap, parseLaw, type Article, type Citation, type LawDoc } from './parse';
import { findOldTerms } from './terms';

export const FLAG_KINDS = ['khong-anh-xa', 'dieu-khong-ton-tai', 'khoan-diem-khong-ton-tai', 'lech-noi-dung', 'thuat-ngu-cu', 'hai-dap-an'] as const;
export type FlagKind = (typeof FLAG_KINDS)[number];

export type Flag = {
  mon: string;
  file: string;
  kind: 'concept' | 'set';
  id: string;
  /** Chỉ số item (câu trong bộ đề); -1 = phần khái niệm (source, plain, example, definition). */
  item: number;
  item_type: string;
  loai: FlagKind;
  trich_dan: string;
  van_ban: string | null;
  doan_luat: string;
  goi_y: string;
  diem?: number;
  ly_do?: string;
  lich_su?: boolean;
};

/** Ngưỡng lệch nội dung: điểm trùng (0,7 × tỉ lệ bigram + 0,3 × tỉ lệ tiếng) với đoạn được trích < ngưỡng. */
export const LECH_THRESHOLD = Number(process.env.CITATIONS_LECH ?? 0.2);
/** Gợi ý điều khác khi điều khác trong cùng văn bản có điểm ≥ max(ngưỡng này, điểm hiện tại + 0,25). */
export const SUGGEST_MIN = 0.45;

type Feat = ReturnType<typeof features>;

export class LawStore {
  docs = new Map<string, LawDoc>();
  feats = new Map<string, Feat>();
  headers: Record<string, string> = {};
  constructor(public lawsDir: string) {
    for (const f of readdirSync(lawsDir).filter((x) => x.endsWith('.txt'))) {
      const text = readFileSync(join(lawsDir, f), 'utf8');
      this.headers[f] = text.split('\n').slice(0, 6).join('\n');
      this.docs.set(f, parseLaw(f, text));
    }
  }
  feat(key: string, text: string): Feat {
    let v = this.feats.get(key);
    if (!v) { v = features(text); this.feats.set(key, v); }
    return v;
  }
  unitText(file: string, a: Article, clause?: string, point?: string): string {
    if (clause && point) return a.clauses.get(clause)?.points.get(point) ?? '';
    if (clause) return a.clauses.get(clause)?.text ?? '';
    if (point) return a.points.get(point) ?? '';
    return a.title + '\n' + a.text;
  }
}

const SNIP = 600;
const cut = (s: string, n = SNIP) => { const t = s.replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };

/** Tìm tên văn bản đầu tiên nhận ra được ở bất kỳ đâu trong chuỗi (dùng cho source.cite, basis). */
export function findLawIn(text: string | undefined): Resolved | null {
  if (!text) return null;
  return scanLaws(text)[0]?.law ?? null;
}

type Ctx = { law: Resolved | null; url?: string };

function lawFromCtx(store: LawStore, urlMap: Map<string, string>, cite: string | undefined, url: string | undefined): Resolved | null {
  const r = findLawIn(cite);
  if (r) return r;
  if (url) {
    const f = urlMap.get(urlKey(url));
    if (f) return { ok: true, file: f, label: f, excerpt: EXCERPT_FILES.has(f), matched: '' };
  }
  void store;
  return null;
}

type Unit = {
  noted?: boolean;
  item: number;
  item_type: string;
  /** Văn bản tách trích dẫn (không gồm phương án nhiễu, không gồm câu Sai). */
  citeTexts: string[];
  /** Văn bản dò thuật ngữ cũ. */
  termTexts: string[];
  /** Khẳng định cần khớp với điều được trích; null = không chấm. */
  claim: string | null;
  ctx: Resolved | null;
  options?: string[];
  answer?: number;
};

/** Câu hỏi phủ định ("… KHÔNG thuộc …"): đáp án đúng vốn không có trong điều luật → chỉ chấm câu hỏi. */
const NEG_Q = /KHÔNG|không (phải|thuộc|được liệt kê|bao gồm|nằm trong)/u;

type Src = { kind?: string; cite?: string; url?: string } | undefined;

function conceptUnits(c: any, ctxOf: (s: Src) => Resolved | null, conceptLaw: Resolved | null): Unit[] {
  const units: Unit[] = [];
  units.push({
    // Khái niệm đã có note nêu luật sửa đổi 2025–2026 → thuật ngữ cũ ở plain/example coi là đã được giải thích.
    noted: typeof c.note === 'string' && /\d+\/20(25|26)\/(QH|NĐ-CP|UBTVQH)\d*/u.test(c.note),
    item: -1, item_type: 'concept',
    citeTexts: [c.source?.cite ?? '', c.plain ?? '', c.example ?? '', c.definition ?? ''],
    termTexts: [c.term ?? '', c.plain ?? '', c.example ?? ''],
    claim: null, ctx: conceptLaw,
  });
  (c.items as any[]).forEach((it, i) => {
    const ctx = ctxOf(it.source) ?? conceptLaw;
    const src = it.source?.cite ?? '';
    const u: Unit = { item: i, item_type: it.type, citeTexts: [src], termTexts: [], claim: null, ctx };
    switch (it.type) {
      case 'mcq':
      case 'case': {
        const right = it.options[it.answer] ?? '';
        u.citeTexts.push(it.q, it.explain, right);
        u.termTexts.push(`${it.q} → ${right}`, it.explain);
        u.claim = NEG_Q.test(it.q) ? it.q : `${it.q} ${right}`;
        u.options = it.options;
        u.answer = it.answer;
        break;
      }
      case 'truefalse':
        u.citeTexts.push(it.explain);
        if (it.answer) u.citeTexts.push(it.statement);
        // Câu Sai cố ý dùng chế định cũ ("vẫn còn cấp huyện") là đúng sư phạm: chỉ dò giải thích.
        u.termTexts.push(...(it.answer ? [it.statement] : []), it.explain);
        u.claim = it.answer ? it.statement : null;
        break;
      case 'cloze':
        u.citeTexts.push(it.text);
        u.termTexts.push(it.text);
        u.claim = String(it.text).replace(/\{\{|\}\}/g, '');
        break;
      case 'pair':
        u.citeTexts.push(it.explain, ...it.cases.map((x: any) => x.basis ?? ''), ...it.cases.map((x: any) => x.text));
        // Gộp nhãn hai bên với tình huống: nhãn ("Luật NSNN 2015") là ngữ cảnh của tình huống ("Có ngân sách cấp huyện").
        u.termTexts.push(`${it.left} / ${it.right}: ${it.cases.map((x: any) => x.text).join('; ')}`, it.explain);
        break;
      case 'recall':
        u.citeTexts.push(it.q, it.model);
        u.termTexts.push(it.q, it.model);
        u.claim = it.model;
        break;
    }
    units.push(u);
  });
  return units;
}

const lyDo = (c: Citation) => (!c.law ? 'theo-ngu-canh' : c.inherited ? 'ten-nhac-truoc' : 'ten-ro');

export function unitOfSet(fname: string, group: string, dirs: string[]): string {
  const stem = fname.replace(/\.json$/, '');
  if (group === 'pldc') return 'pldc';
  let best: string | null = null;
  for (const d of dirs) if ((stem === d || stem.startsWith(d + '-')) && (best === null || d.length > best.length)) best = d;
  return best ?? group;
}

function bestArticle(store: LawStore, file: string, claim: Feat): { num: string; score: number } | null {
  const doc = store.docs.get(file);
  if (!doc) return null;
  let best: { num: string; score: number } | null = null;
  for (const a of doc.articles.values()) {
    const sc = overlap(claim, store.feat(`${file}#${a.num}`, a.title + '\n' + a.text));
    if (sc !== null && (!best || sc > best.score)) best = { num: a.num, score: sc };
  }
  return best;
}

export function audit(dataDir: string): Flag[] {
  const store = new LawStore(join(dataDir, 'laws'));
  const sourcesMd = existsSync(join(dataDir, 'SOURCES.md')) ? readFileSync(join(dataDir, 'SOURCES.md'), 'utf8') : '';
  const urlMap = buildUrlMap(store.headers, sourcesMd);
  const ctxOf = (s: Src) => lawFromCtx(store, urlMap, s?.cite, s?.url);
  const flags: Flag[] = [];
  const conceptsDir = join(dataDir, 'concepts');
  const dirs = readdirSync(conceptsDir).filter((d) => !d.startsWith('.'));
  const subjectDefault = new Map<string, Resolved>();

  type Job = { mon: string; file: string; kind: 'concept' | 'set'; id: string; units: Unit[] };
  const jobs: Job[] = [];
  for (const d of dirs) {
    const counts = new Map<string, { r: Resolved; n: number }>();
    const local: { f: string; c: any; law: Resolved | null }[] = [];
    for (const f of readdirSync(join(conceptsDir, d)).filter((x) => x.endsWith('.json')).sort()) {
      const c = JSON.parse(readFileSync(join(conceptsDir, d, f), 'utf8'));
      const law = ctxOf(c.source);
      if (law?.ok) { const k = law.file; const e = counts.get(k) ?? { r: law, n: 0 }; e.n++; counts.set(k, e); }
      local.push({ f, c, law });
    }
    const def = [...counts.values()].sort((a, b) => b.n - a.n)[0]?.r;
    if (def) subjectDefault.set(d, def);
    for (const { f, c, law } of local) {
      const units = conceptUnits(c, ctxOf, law ?? def ?? null);
      // note của khái niệm áp cho mọi item; môn lịch sử: mọi chế định cũ là nội dung lịch sử.
      const noted = units[0].noted || d === 'lich-su-nn-pl';
      for (const u of units) u.noted = noted;
      jobs.push({ mon: d, file: `concepts/${d}/${f}`, kind: 'concept', id: c.id, units });
    }
  }
  const setDir = join(dataDir, 'sets');
  for (const f of readdirSync(setDir).filter((x) => x.endsWith('.json')).sort()) {
    const s = JSON.parse(readFileSync(join(setDir, f), 'utf8'));
    const mon = unitOfSet(f, s.group, dirs);
    const units: Unit[] = (s.questions as any[]).map((q, i) => {
      const right = q.options[q.answer] ?? '';
      const ctx = findLawIn(q.basis) ?? (q.url ? lawFromCtx(store, urlMap, undefined, q.url) : null) ?? subjectDefault.get(mon) ?? null;
      return { item: i, item_type: 'set', citeTexts: [q.basis, q.q, q.explain, right], termTexts: [`${q.q} → ${right}`, q.explain], claim: NEG_Q.test(q.q) ? q.q : `${q.q} ${right}`, ctx, options: q.options, answer: q.answer };
    });
    jobs.push({ mon, file: `sets/${f}`, kind: 'set', id: s.id, units });
  }

  for (const job of jobs) {
    for (const u of job.units) {
      const base = { mon: job.mon, file: job.file, kind: job.kind, id: job.id, item: u.item, item_type: u.item_type };
      const seen = new Set<string>();
      const push = (fl: Omit<Flag, keyof typeof base>, dedupe?: string) => {
        const key = `${fl.loai}|${dedupe ?? fl.trich_dan}`;
        if (seen.has(key)) return;
        seen.add(key);
        flags.push({ ...base, ...fl });
      };
      // 1. Trích dẫn
      const cites: { c: Citation; law: Resolved | null }[] = [];
      for (const t of u.citeTexts) for (const c of extractCitations(t ?? '')) cites.push({ c, law: c.law ?? u.ctx });
      const resolvedArticles: { file: string; a: Article; c: Citation }[] = [];
      for (const { c, law } of cites) {
        if (!law) {
          push({ loai: 'khong-anh-xa', trich_dan: c.raw, van_ban: null, doan_luat: '', goi_y: 'Không xác định được văn bản: ghi rõ tên văn bản sau "Điều N" hoặc thêm source.cite cho item.', ly_do: 'khong-ro-van-ban' });
          continue;
        }
        if (!law.ok) {
          push({ loai: 'khong-anh-xa', trich_dan: c.raw, van_ban: law.label, doan_luat: '', ly_do: law.reason,
            goi_y: law.reason === 'van-ban-cu' ? 'Văn bản cũ/đã bị thay thế: nếu dùng như luật hiện hành thì đổi sang văn bản hiện hành (kiểm số điều theo văn bản mới); nếu là nội dung lịch sử thì ghi rõ mốc.' : 'Văn bản chưa có toàn văn trong kho: kiểm tay trên vbpl.vn hoặc bỏ qua nếu chỉ là dẫn chiếu phụ.' });
          continue;
        }
        if (law.excerpt) continue;
        const doc = store.docs.get(law.file);
        if (!doc) continue;
        const a = doc.articles.get(c.article);
        if (!a) {
          push({ loai: 'dieu-khong-ton-tai', trich_dan: c.raw, van_ban: law.file, doan_luat: '', lich_su: c.history, goi_y: `${law.file} không có Điều ${c.article} (văn bản có ${doc.articles.size} điều). Kiểm số điều hoặc văn bản được trích.${c.history ? ' Câu có dấu hiệu nói về điều đã bãi bỏ/văn bản cũ: nhiều khả năng báo nhầm.' : ''}`, ly_do: lyDo(c) }, `${law.file}#${c.article}`);
          continue;
        }
        let missing = '';
        for (const k of c.clauses) if (!a.clauses.has(k)) missing ||= `khoản ${k}`;
        if (!missing) for (const p of c.points) {
          const inClause = c.clauses.length ? c.clauses.some((k) => a.clauses.get(k)?.points.has(p)) : a.points.has(p) || [...a.clauses.values()].some((x) => x.points.has(p));
          if (!inClause) missing ||= `điểm ${p}`;
        }
        if (missing) {
          push({ loai: 'khoan-diem-khong-ton-tai', trich_dan: c.raw, van_ban: law.file, doan_luat: cut(`Điều ${a.num}. ${a.title}\n${a.text}`), goi_y: `Điều ${a.num} không có ${missing} (có ${a.clauses.size} khoản${a.points.size ? `, ${a.points.size} điểm trực tiếp` : ''}).`, ly_do: lyDo(c) }, `${law.file}#${c.article}#${missing}`);
          continue;
        }
        resolvedArticles.push({ file: law.file, a, c });
      }
      // 2. Lệch nội dung: lấy điểm cao nhất giữa các đơn vị được trích.
      if (u.claim && resolvedArticles.length) {
        const cf = features(u.claim);
        let best: { score: number; text: string; raw: string; file: string; num: string } | null = null;
        for (const { file, a, c } of resolvedArticles) {
          const units: [string, string][] = [];
          if (c.clauses.length) for (const k of c.clauses) {
            if (c.points.length) for (const p of c.points) units.push([`${file}#${a.num}.${k}.${p}`, store.unitText(file, a, k, p)]);
            units.push([`${file}#${a.num}.${k}`, store.unitText(file, a, k)]);
          }
          units.push([`${file}#${a.num}`, store.unitText(file, a)]);
          for (const [key, text] of units) {
            const sc = overlap(cf, store.feat(key, text));
            if (sc !== null && (!best || sc > best.score)) best = { score: sc, text, raw: c.raw, file, num: a.num };
          }
        }
        if (best && best.score < LECH_THRESHOLD) {
          const alt = bestArticle(store, best.file, cf);
          const hint = alt && alt.num !== best.num && alt.score >= Math.max(SUGGEST_MIN, best.score + 0.25) ? ` Điều ${alt.num} cùng văn bản khớp hơn (điểm ${alt.score}).` : '';
          push({ loai: 'lech-noi-dung', trich_dan: best.raw, van_ban: best.file, doan_luat: cut(best.text), diem: best.score,
            goi_y: `Khẳng định ít trùng với đoạn được trích (điểm ${best.score} < ${LECH_THRESHOLD}).${hint} Đọc đoạn luật: đúng ý nhưng diễn đạt khác → báo nhầm; sai điều → sửa số điều; sai nội dung → sửa đáp án/giải thích.` });
        }
      }
      // 3. Thuật ngữ cũ
      for (const t of u.termTexts) {
        if (!t) continue;
        for (const h of findOldTerms(t)) {
          const i = t.normalize('NFC').indexOf(h.match);
          const hist = h.history || !!u.noted;
          push({ loai: 'thuat-ngu-cu', trich_dan: h.match, van_ban: null, doan_luat: cut(t.normalize('NFC').slice(Math.max(0, i - 200), i + 300)), lich_su: hist, ly_do: h.term.id,
            goi_y: `${h.term.label} → hiện hành: ${h.term.now}. Căn cứ: ${h.term.basis}.${h.history ? ' Câu có dấu hiệu nói về lịch sử/so sánh trước–sau: kiểm, nhiều khả năng báo nhầm.' : u.noted ? ' Khái niệm có note về luật sửa đổi (hoặc thuộc môn lịch sử): kiểm note đã nói rõ chưa.' : ''}` });
        }
      }
      // 4. Hai đáp án
      if (u.options && u.answer !== undefined) {
        const no = u.options.map(normOption);
        const right = no[u.answer];
        no.forEach((o, i) => {
          if (i === u.answer) return;
          // Nhiễu bắt đầu bằng trọn đáp án đúng ("Có" / "Có, nếu…"; "Cá nhân" / "Cá nhân hoặc tổ chức").
          // Không xét chứa ở giữa: "Quốc hội" ⊂ "Ủy ban thường vụ Quốc hội" là hai cơ quan khác nhau.
          const contains = right.length >= 2 && o.startsWith(right + ' ');
          if (o === right || contains) {
            push({ loai: 'hai-dap-an', trich_dan: `phương án ${i}: "${u.options![i]}"`, van_ban: null, doan_luat: u.options!.map((x, k) => `${k === u.answer ? '✓' : '·'} ${x}`).join(' | '),
              goi_y: o === right ? 'Nhiễu trùng đáp án đúng sau chuẩn hoá: viết lại nhiễu.' : 'Nhiễu chứa trọn đáp án đúng: kiểm xem nhiễu có cũng đúng không; nếu đúng (hoặc đúng một phần) thì viết lại nhiễu.' });
          }
        });
      }
    }
  }
  return mergeRanges(flags);
}

/** Một trích dẫn dạng khoảng ("Điều 102–116") thiếu nhiều điều → gộp thành một cờ. */
function mergeRanges(flags: Flag[]): Flag[] {
  const out: Flag[] = [];
  const byKey = new Map<string, Flag>();
  for (const f of flags) {
    if (f.loai !== 'dieu-khong-ton-tai') { out.push(f); continue; }
    const k = `${f.file}#${f.item}#${f.trich_dan}#${f.van_ban}`;
    const prev = byKey.get(k);
    const art = /không có Điều (\S+)/.exec(f.goi_y)?.[1] ?? '?';
    if (prev) { prev.goi_y = prev.goi_y.replace(/không có Điều ([^(]+?) \(/, (_m, a) => `không có Điều ${a}, ${art} (`); continue; }
    byKey.set(k, f);
    out.push(f);
  }
  return out;
}

export function summarize(flags: Flag[]): { byMon: Record<string, Record<string, number>>; total: Record<string, number> } {
  const byMon: Record<string, Record<string, number>> = {};
  const total: Record<string, number> = Object.fromEntries(FLAG_KINDS.map((k) => [k, 0]));
  for (const f of flags) {
    byMon[f.mon] ??= Object.fromEntries(FLAG_KINDS.map((k) => [k, 0]));
    byMon[f.mon][f.loai]++;
    total[f.loai]++;
  }
  return { byMon, total };
}

const here = fileURLToPath(new URL('.', import.meta.url));
export const DATA_DIR = join(here, '..', '..', 'packages', 'content', 'data');

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const out = process.argv[2] ?? '/tmp/claude-0/-home-user-Law/e583804c-8920-5d50-af2b-283ccb198358/scratchpad/dot7/audit';
  const flags = audit(DATA_DIR);
  const flagsDir = join(out, 'flags');
  rmSync(flagsDir, { recursive: true, force: true });
  mkdirSync(flagsDir, { recursive: true });
  const byMon = new Map<string, Flag[]>();
  for (const f of flags) { const a = byMon.get(f.mon) ?? []; a.push(f); byMon.set(f.mon, a); }
  for (const [mon, list] of byMon) writeFileSync(join(flagsDir, `${mon}.jsonl`), list.map((f) => JSON.stringify(f)).join('\n') + '\n', 'utf8');
  const { byMon: tbl, total } = summarize(flags);
  const short: Record<string, string> = { 'khong-anh-xa': 'không ánh xạ', 'dieu-khong-ton-tai': 'điều không có', 'khoan-diem-khong-ton-tai': 'khoản/điểm không có', 'lech-noi-dung': 'lệch nội dung', 'thuat-ngu-cu': 'thuật ngữ cũ', 'hai-dap-an': 'hai đáp án' };
  const rows = Object.keys(tbl).sort().map((m) => `| ${m} | ${FLAG_KINDS.map((k) => tbl[m][k]).join(' | ')} | ${FLAG_KINDS.reduce((s, k) => s + tbl[m][k], 0)} |`);
  const md = [
    `# Tổng kết cờ dò trích dẫn — ${new Date().toISOString().slice(0, 10)}`,
    '',
    `Sinh bởi \`npx tsx tools/citations/audit.ts\`. Ngưỡng lệch nội dung: điểm < ${LECH_THRESHOLD} (0,7 × tỉ lệ bigram tiếng + 0,3 × tỉ lệ tiếng không phải từ dừng của khẳng định có trong đoạn được trích; lấy điểm cao nhất giữa các đơn vị được trích của item). Cách xử lý: HUONG-DAN.md.`,
    '',
    `| Môn | ${FLAG_KINDS.map((k) => short[k]).join(' | ')} | Tổng |`,
    `|---|${FLAG_KINDS.map(() => '---:').join('|')}|---:|`,
    ...rows,
    `| **Tổng** | ${FLAG_KINDS.map((k) => `**${total[k]}**`).join(' | ')} | **${flags.length}** |`,
    '',
  ].join('\n');
  writeFileSync(join(out, 'summary.md'), md, 'utf8');
  writeFileSync(join(out, 'stats.json'), JSON.stringify({ total, byMon: tbl }, null, 1) + '\n', 'utf8');
  console.log(md);
}
