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
