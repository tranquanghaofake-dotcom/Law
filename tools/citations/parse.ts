// Tách văn bản luật thành Điều → khoản → điểm, và tách trích dẫn "điểm x khoản y Điều N <tên văn bản>" khỏi câu chữ.
import { resolveLawAt, scanLaws, type Resolved } from './laws';

export type Clause = { num: string; text: string; points: Map<string, string> };
export type Article = { num: string; title: string; text: string; clauses: Map<string, Clause>; points: Map<string, string> };
export type LawDoc = { file: string; articles: Map<string, Article> };

// Dòng mở đầu Điều: "Điều 12. Tên", "Điều 12: …", "Điều 12" (Hiến pháp), "Điều thứ 12", có thể có #, **.
// Không nhận "Điều 1 của Luật số 83/2025…" (ghi chú VBHN) hay "Điều này".
const ARTICLE_RE = /^\s*[#*>\s]*Điều\s+(?:thứ\s+)?(\d+[a-zđ]?)\s*(?:[.:](.*)|\**\s*$)/u;
// "1. …", "1.Cá nhân…" (thiếu dấu cách), "1\. …" (markdown). Sau dấu chấm phải là chữ (tránh "1.000 đồng").
// Dòng chỉ có "4." (bản chữ ngắt dòng, nội dung ở dòng sau) cũng là đầu khoản.
const CLAUSE_RE = /^\s*[*]*(\d+[a-zđ]?)\s*\\?\.\s*(\p{L}.*|)$/u;
const POINT_RE = /^\s*[*]*([a-zđ]\d?)\s*\\?\)\s*(\S.*)$/u;

export function parseLaw(file: string, text: string): LawDoc {
  const articles = new Map<string, Article>();
  let cur: Article | null = null;
  let clause: Clause | null = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\r$/, '');
    const a = ARTICLE_RE.exec(line);
    if (a) {
      const num = a[1];
      const existing = articles.get(num);
      // Trùng số (vd. nhiều bản Hiến pháp trong một file trích): gộp vào điều đã có.
      cur = existing ?? { num, title: (a[2] ?? '').trim(), text: '', clauses: new Map(), points: new Map() };
      if (!existing) articles.set(num, cur);
      cur.text += (a[2] ?? '') + '\n';
      clause = null;
      // Tiêu đề và khoản 1 dính một dòng: "Điều 22. Mức hưởng … 1. Người tham gia …".
      const glued = /^(.*?\S)\s+1\s*\.\s*(\p{Lu}.*)$/u.exec(a[2] ?? '');
      if (glued && !existing) {
        cur.title = glued[1].trim();
        clause = { num: '1', text: glued[2] + '\n', points: new Map() };
        cur.clauses.set('1', clause);
      }
      continue;
    }
    if (!cur) continue;
    if (/^\s*#{1,3}\s/.test(line) || /^\s*(Chương|Mục|Phần thứ)\s+[\dIVXLC]+/u.test(line)) { // tiêu đề chương/mục: không thuộc điều
      clause = null;
      continue;
    }
    cur.text += line + '\n';
    const c = CLAUSE_RE.exec(line);
    if (c) {
      clause = cur.clauses.get(c[1]) ?? { num: c[1], text: '', points: new Map() };
      cur.clauses.set(c[1], clause);
      clause.text += c[2] + '\n';
      continue;
    }
    const p = POINT_RE.exec(line);
    if (p) {
      if (clause) { clause.points.set(p[1], (clause.points.get(p[1]) ?? '') + p[2] + '\n'); clause.text += line + '\n'; }
      else cur.points.set(p[1], (cur.points.get(p[1]) ?? '') + p[2] + '\n');
      continue;
    }
    if (clause) clause.text += line + '\n';
  }
  return { file, articles };
}

export type Citation = {
  /** Đoạn chữ gốc của trích dẫn, vd. "điểm a khoản 1 Điều 5 Luật Đất đai 2024". */
  raw: string;
  article: string;
  clauses: string[];
  points: string[];
  /** Tên văn bản đọc được ngay sau trích dẫn (hoặc sau cả cụm trích dẫn liền nhau), hoặc tên văn bản nhắc gần nhất
   *  trước đó trong cùng chuỗi ("BLDS 2015: … (Điều 418)", "Luật Doanh nghiệp Điều 188"). null = dùng ngữ cảnh item. */
  law: Resolved | null;
  /** true khi law lấy từ tên nhắc trước đó (không đứng ngay sau trích dẫn). */
  inherited: boolean;
  /** Trong 60 ký tự quanh trích dẫn có dấu hiệu lịch sử ("đã bãi bỏ", "cũ", "hết hiệu lực"…). */
  history: boolean;
  index: number;
};

const NUM = String.raw`\d+[a-zđ]?`;
const NUMS = String.raw`${NUM}(?:\s*(?:,|và|hoặc|–|-|đến)\s*${NUM})*`;
const PT = String.raw`[a-zđ]\d?`;
const PTS = String.raw`${PT}(?:\s*(?:,|và|hoặc|–|-|đến)\s*${PT})*`;
const CITE_RE = new RegExp(
  String.raw`(?:(?:các\s+)?điểm\s+(${PTS})\s*,?\s+)?(?:(?:các\s+)?khoản\s+(${NUMS})\s*,?\s+)?(?:(?:các\s+)?Điều\s+(${NUMS}))(?![\d\p{L}/])`,
  'giu',
);

const HIST_NEAR = /đã (bị )?bãi bỏ|được bãi bỏ|không còn|hết hiệu lực|đã bị thay thế|\bcũ\b|trước đây|trước (ngày )?0?1\/0?[17]\/20(25|26)/iu;

function expand(list: string, isPoint: boolean): string[] {
  const out: string[] = [];
  const parts = list.split(/\s*(?:,|và|hoặc)\s*/u).filter(Boolean);
  for (const p of parts) {
    const r = /^(\S+)\s*(?:–|-|đến)\s*(\S+)$/u.exec(p);
    if (r && !isPoint && /^\d+$/.test(r[1]) && /^\d+$/.test(r[2])) {
      const a = Number(r[1]);
      const b = Number(r[2]);
      if (b > a && b - a <= 30) for (let i = a; i <= b; i++) out.push(String(i));
      else out.push(r[1], r[2]);
    } else if (r) out.push(r[1], r[2]);
    else out.push(p);
  }
  return out;
}

/**
 * Tách mọi trích dẫn trong chuỗi. Mỗi "Điều" trong một cụm (Điều 9, 10) là một trích dẫn riêng.
 * Cụm trích dẫn nối nhau bằng ",", ";", "và", "hoặc" dùng chung tên văn bản đứng sau trích dẫn cuối cụm.
 */
export function extractCitations(text: string): Citation[] {
  const s = text.normalize('NFC');
  type Raw = { m: RegExpExecArray; law: Resolved | null; own: boolean };
  const raws: Raw[] = [];
  CITE_RE.lastIndex = 0;
  for (let m = CITE_RE.exec(s); m; m = CITE_RE.exec(s)) {
    const after = s.slice(m.index + m[0].length, m.index + m[0].length + 120);
    const law = resolveLawAt(after);
    raws.push({ m, law, own: !!law });
  }
  // Tên văn bản dùng chung trong cụm.
  for (let i = raws.length - 1; i >= 0; i--) {
    if (raws[i].law) continue;
    const next = raws[i + 1];
    if (!next || !next.law) continue;
    const between = s.slice(raws[i].m.index + raws[i].m[0].length, next.m.index);
    // Chỉ nối qua "," "và" "hoặc"; dấu ";" tách hai trích dẫn độc lập ("Khoản 2 Điều 92; khoản 2 Điều 12 BLHS").
    if (/^\s*(?:,|và|hoặc|,\s*và)?\s*$/u.test(between)) raws[i].law = next.law;
  }
  const mentions = scanLaws(s);
  const out: Citation[] = [];
  for (const r of raws) {
    const { m } = r;
    let law = r.law;
    let inherited = false;
    if (!law) {
      // Kế thừa tên văn bản nhắc trước đó: tên của một trích dẫn trước trong chuỗi, hoặc tên nhắc trong vòng 80 ký tự.
      // "Hiến pháp" trần (không năm) chỉ tính khi đứng sát trích dẫn — hay là từ thường ("không trái Hiến pháp").
      // Không kế thừa qua dấu ";" hoặc hết câu: đó là trích dẫn khác.
      const gapOk = (from: number) => !/[;]|\.\s/u.test(s.slice(from, m.index));
      const prevOwn = [...raws.slice(0, raws.indexOf(r))].reverse().find((x) => x.own && m.index - (x.m.index + x.m[0].length) <= 120 && gapOk(x.m.index + x.m[0].length));
      const prev = mentions.filter((x) => x.end <= m.index).pop();
      const near = prev && m.index - prev.end <= 80 && gapOk(prev.end) && (!/^\s*(của\s+)?Hiến pháp\s*$/iu.test(prev.law.matched) || m.index - prev.end <= 3);
      const pick = near && prev && (!prevOwn || prev.index > prevOwn.m.index) ? prev.law : prevOwn?.law ?? null;
      if (pick) { law = pick; inherited = true; }
    }
    const points = m[1] ? expand(m[1], true) : [];
    const clauses = m[2] ? expand(m[2], false) : [];
    const arts = expand(m[3], false);
    for (const a of arts) {
      out.push({
        raw: (m[0] + (r.own && law ? ' ' + law.matched.trim() : '')).replace(/\s+/g, ' ').trim(),
        article: a,
        // khoản/điểm chỉ gắn với Điều đầu tiên khi một cụm có nhiều Điều ("khoản 1 Điều 5, 6" hiếm, coi như thuộc Điều 5).
        clauses: a === arts[0] ? clauses : [],
        points: a === arts[0] ? points : [],
        law,
        inherited,
        history: HIST_NEAR.test(s.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60)),
        index: m.index,
      });
    }
  }
  return out;
}

// ---------- So khớp nội dung ----------

const STOP = new Set(
  ('và của là các có được cho trong theo với không này đó những một khi thì mà từ đến về hoặc tại do bị để phải nào gì ai nếu đã sẽ đang như trên dưới sau trước ra vào cũng hay bằng nhưng ' +
    'luật điều khoản điểm quy định trường hợp người việc nhà nước bộ cơ quan tổ chức cá nhân thực hiện').split(' '),
);

export function syllables(s: string): string[] {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/\{\{|\}\}/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(' ')
    .filter(Boolean);
}

/** Bigram tiếng liền nhau, bỏ bigram toàn từ dừng; kèm unigram không phải từ dừng. */
export function features(s: string): { uni: Set<string>; bi: Set<string> } {
  const t = syllables(s);
  const uni = new Set(t.filter((x) => !STOP.has(x) && !/^\d+$/.test(x)));
  const bi = new Set<string>();
  for (let i = 0; i + 1 < t.length; i++) if (!(STOP.has(t[i]) && STOP.has(t[i + 1]))) bi.add(t[i] + ' ' + t[i + 1]);
  return { uni, bi };
}

/** Tỉ lệ bigram của khẳng định có mặt trong đoạn luật (0–1). Ít bigram quá → null (không đủ để chấm). */
export function overlap(claim: { uni: Set<string>; bi: Set<string> }, law: { uni: Set<string>; bi: Set<string> }): number | null {
  if (claim.bi.size < 4) return null;
  let hb = 0;
  for (const b of claim.bi) if (law.bi.has(b)) hb++;
  let hu = 0;
  for (const u of claim.uni) if (law.uni.has(u)) hu++;
  const bi = hb / claim.bi.size;
  const uni = claim.uni.size ? hu / claim.uni.size : 0;
  return Math.round((0.7 * bi + 0.3 * uni) * 1000) / 1000;
}

/** Chuẩn hoá phương án để so trùng: thường, bỏ dấu câu, gộp khoảng trắng. */
export function normOption(s: string): string {
  return syllables(s).join(' ');
}
