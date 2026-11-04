// Tủ sách thật (Hồ sơ): chia các môn vào 4–5 tầng theo thứ tự kệ nhóm ngành (SHELVES), mỗi môn một cuốn đại diện.
// Gáy cao theo số chương, dày theo số khái niệm (có chặn min/max); độ sáng theo tỉ lệ sách chương đã nhận.
// Không tách một kệ nhóm ngành sang hai tầng; mỗi tầng 1–2 kệ; cân độ rộng bằng quy hoạch động (tầng rộng nhất nhỏ nhất).
import type { Subject } from '$lib/content/types';
import type { BookRec } from '$lib/game/books';
import { coverFor } from '$lib/art/covers';
import { orderedSubjects, shelfOf, type Shelf } from './shelves';

/** Khoảng dày/cao của gáy (px thiết kế). */
export const SPINE_W = [30, 44] as const;
export const SPINE_H = [96, 140] as const;
/** Khe giữa hai gáy, đệm hai đầu mỗi kệ (cho vách ngăn) — tính vào độ rộng để cân tầng. */
export const SPINE_GAP = 4;
export const BAY_PAD = 14;

const clamp = (n: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, n));

/** Kích thước gáy: dày theo số khái niệm, cao theo số chương. */
export function spineSize(chapters: number, concepts: number): { w: number; h: number } {
  return { w: Math.round(clamp(28 + concepts * 0.17, SPINE_W)), h: Math.round(clamp(84 + chapters * 3.8, SPINE_H)) };
}

/** Nâng độ bão hoà (HSL) của màu thân bìa lên ≥ `min` để gáy trên kệ không bị xám; màu gần trung tính (s < .05) giữ nguyên. */
export function spineColor(hex: string, min = 0.6): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (d === 0) return hex.toLowerCase();
  let sat = d / (1 - Math.abs(2 * l - 1));
  if (sat < 0.05 || sat >= min) return hex.toLowerCase();
  sat = min;
  const h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  const c = (1 - Math.abs(2 * l - 1)) * sat, x = c * (1 - Math.abs((h % 2) - 1)), m = l - c / 2;
  const [r1, g1, b1] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h) % 6];
  return '#' + [r1, g1, b1].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
}

/** Sàn cỡ chữ trên gáy (px thiết kế, tủ hẹp nhất --k = 1): không để chữ có thông tin < 12 px (audit HT7). */
export const SPINE_FONT_MIN = 12;
export const SPINE_FONT_MAX = 13;
/** Bề dài chữ (đơn vị = cỡ chữ) khi xếp dọc: đo thực tế Be Vietnam Pro 800 có dấu ≈ 0,7/ký tự, khoảng trắng ≈ 0,35. */
const textLen = (text: string) => [...text].reduce((n, ch) => n + (ch === ' ' ? 0.35 : 0.7), 0);
/** Vùng chữ thực = h − khung gáy − đệm/viền ô tên (4 px). */
const fitFont = (text: string, h: number) => (h - SPINE_CHROME - 4) / Math.max(0.7, textLen(text));

/**
 * Viết tắt tên môn cho gáy: từ thường → chữ cái đầu viết hoa, giữ nguyên từ đã viết tắt (NN&PL, DN, VBPL) và số.
 * "Tài sản trí tuệ" → "TSTT", "Thương mại 1" → "TM 1", "Lý luận NN&PL" → "LLNN&PL".
 */
export function abbreviate(short: string): string {
  const words = short.trim().split(/\s+/);
  let out = '';
  for (const w of words) {
    if (/^\d+$/.test(w)) out += ` ${w}`;
    else if (w.length > 1 && w === w.toUpperCase()) out += w;
    else out += w[0].toUpperCase();
  }
  return out.trim();
}

/** Nhãn trên gáy: tên đầy đủ nếu vừa ở cỡ ≥ 12 px, không thì viết tắt (tên đầy đủ vẫn có trong nhãn trợ năng và ngăn chi tiết). */
export function spineLabel(short: string, h: number): string {
  if (fitFont(short, h) >= SPINE_FONT_MIN) return short;
  const ab = abbreviate(short);
  if (fitFont(ab, h) >= SPINE_FONT_MIN) return ab;
  return ab.replace(/[^\p{L}\p{N}]/gu, ''); // gáy rất thấp: bỏ cả dấu & và khoảng trắng ("LSNN&PL" → "LSNNPL")
}

/** Cỡ chữ gáy (px thiết kế) cho nhãn đã chọn bằng `spineLabel`: kẹp 12–13. */
export function spineFont(label: string, h: number): number {
  return Math.round(Math.max(SPINE_FONT_MIN, Math.min(SPINE_FONT_MAX, fitFont(label, h))) * 10) / 10;
}
/** Phần gáy không dành cho tên: nhãn kem + đai vàng đầu, chân gáy (px thiết kế). */
export const SPINE_CHROME = 44;

export type CaseBook = {
  id: string; title: string; short: string; href: string; color: string;
  /** Số chương (= số sách có thể nhận), số khái niệm, kích thước gáy. */
  total: number; concepts: number; w: number; h: number;
  /** Số sách đã nhận (cấp ≥ 1), số sách cấp 3, còn sách "cần ôn", mức sáng 0–1. */
  got: number; level3: number; needsReview: boolean; lit: number;
};
export type CaseBay = { shelfId: string; name: string; color: string; books: CaseBook[]; width: number };
export type CaseRow = { bays: CaseBay[]; width: number };

function toBay(shelf: Shelf, books: CaseBook[]): CaseBay {
  return { shelfId: shelf.id, name: shelf.name, color: shelf.color, books, width: books.reduce((n, b) => n + b.w + SPINE_GAP, 0) + BAY_PAD * 2 };
}

/** Chia dãy kệ (giữ thứ tự) thành `k` tầng liền nhau, mỗi tầng ≤ `per` kệ, sao cho tầng rộng nhất là nhỏ nhất. */
function partition(widths: number[], k: number, per: number): number[] {
  const n = widths.length;
  const pre = [0]; widths.forEach((w) => pre.push(pre[pre.length - 1] + w));
  const best: number[][] = Array.from({ length: k + 1 }, () => Array(n + 1).fill(Infinity));
  const cut: number[][] = Array.from({ length: k + 1 }, () => Array(n + 1).fill(0));
  best[0][0] = 0;
  for (let j = 1; j <= k; j++) {
    for (let i = j; i <= n; i++) {
      for (let p = Math.max(j - 1, i - per); p <= i - 1; p++) {
        const v = Math.max(best[j - 1][p], pre[i] - pre[p]);
        if (v < best[j][i]) { best[j][i] = v; cut[j][i] = p; }
      }
    }
  }
  const sizes: number[] = [];
  for (let j = k, i = n; j >= 1; j--) { const p = cut[j][i]; sizes.unshift(i - p); i = p; }
  return sizes;
}

export function bookcaseRows(subjects: readonly Subject[], books: readonly BookRec[], opts: { tiers?: number } = {}): CaseRow[] {
  const ordered = orderedSubjects(subjects);
  const bySubject = new Map<string, BookRec[]>();
  for (const b of books) { const l = bySubject.get(b.subject) ?? []; l.push(b); bySubject.set(b.subject, l); }
  const spine = (s: Subject, shelf: Shelf): CaseBook => {
    const mine = bySubject.get(s.id) ?? [];
    const total = s.chapters.length;
    const concepts = s.chapters.reduce((n, c) => n + c.lessons.reduce((m, l) => m + l.concepts.length, 0), 0);
    const got = mine.filter((b) => b.level > 0).length;
    return {
      id: s.id, title: s.title, short: s.short, href: `#/mon/${s.id}`, color: spineColor(coverFor(s.id, s.title, shelf.color).palette.body), total, concepts, ...spineSize(total, concepts),
      got, level3: mine.filter((b) => b.level === 3).length, needsReview: mine.some((b) => b.needsReview), lit: total > 0 ? Math.min(1, got / total) : 0,
    };
  };
  const bays: CaseBay[] = [];
  for (const s of ordered) {
    const shelf = shelfOf(s.id);
    const last = bays[bays.length - 1];
    const book = spine(s, shelf);
    if (last && last.shelfId === shelf.id) { last.books.push(book); } else bays.push({ shelfId: shelf.id, name: shelf.name, color: shelf.color, books: [book], width: 0 });
  }
  const done = bays.map((b) => toBay({ id: b.shelfId, name: b.name, color: b.color, subjects: [] }, b.books));
  if (!done.length) return [];
  const k = Math.min(done.length, Math.max(1, opts.tiers ?? 5));
  const sizes = partition(done.map((b) => b.width), k, Math.max(2, Math.ceil(done.length / k)));
  const rows: CaseRow[] = [];
  let at = 0;
  for (const n of sizes) { const bs = done.slice(at, at + n); at += n; rows.push({ bays: bs, width: bs.reduce((x, b) => x + b.width, 0) }); }
  return rows;
}

