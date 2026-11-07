import { BLANK_RE } from '$lib/content/schema';

/** NFC, chữ thường, bỏ dấu câu (giữ chữ có dấu tiếng Việt và số), gộp khoảng trắng. */
export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseCloze(text: string): { parts: string[]; blanks: string[] } {
  const parts: string[] = [];
  const blanks: string[] = [];
  let last = 0;
  for (const m of text.matchAll(BLANK_RE)) {
    parts.push(text.slice(last, m.index));
    blanks.push(m[1].trim());
    last = (m.index ?? 0) + m[0].length;
  }
  parts.push(text.slice(last));
  return { parts, blanks };
}

export function gradeCloze(
  blanks: string[],
  answers: string[],
  synonyms?: Record<string, string[]>,
): { correct: boolean; perBlank: boolean[] } {
  const perBlank = blanks.map((b, i) => {
    const accepted = [b, ...(synonyms?.[b] ?? [])].map(normalize);
    return accepted.includes(normalize(answers[i] ?? ''));
  });
  return { correct: perBlank.every(Boolean), perBlank };
}

export function buildBank(blanks: string[], extra: string[], rng: () => number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of [...blanks, ...extra]) {
    const k = normalize(w);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(w);
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function gradeRecall(text: string, keywords: string[]): { hits: string[]; missing: string[]; score: number } {
  const t = ` ${normalize(text)} `;
  const hits = keywords.filter((k) => t.includes(` ${normalize(k)} `) || t.includes(normalize(k)));
  const missing = keywords.filter((k) => !hits.includes(k));
  return { hits, missing, score: keywords.length ? hits.length / keywords.length : 0 };
}

/** Nhận định 3 phần: Đúng/Sai 0,25 · căn cứ 0,25 · lập luận 0,5. 1 điểm = đúng; ≥ 0,5 = gần đúng (FSRS Hard, giữ bậc); < 0,5 = sai. */
export function scoreNhanDinh(
  item: { answer: boolean; parts: { basis: { answer: number }; reason: { answer: number } } },
  pick: { tf: boolean; basis: number; reason: number },
): { score: number; parts: { tf: boolean; basis: boolean; reason: boolean }; correct: boolean; grade: 'dung' | 'gan' | 'sai' } {
  const parts = { tf: pick.tf === item.answer, basis: pick.basis === item.parts.basis.answer, reason: pick.reason === item.parts.reason.answer };
  const score = (parts.tf ? 0.25 : 0) + (parts.basis ? 0.25 : 0) + (parts.reason ? 0.5 : 0);
  const grade = score === 1 ? 'dung' : score >= 0.5 ? 'gan' : 'sai';
  return { score, parts, correct: grade !== 'sai', grade };
}
