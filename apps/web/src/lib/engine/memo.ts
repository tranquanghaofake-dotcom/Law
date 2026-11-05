// "Ghi nhớ nhanh" sau câu trả lời: thay đoạn sớ dài bằng lời gọn + sơ đồ nhánh.
// Chỉ cắt/ghép trường có sẵn (explain, plain, keywords) hoặc sơ đồ do người soạn (`memo`, gắn nhãn diễn giải). Không tự viết khẳng định pháp lý.
import type { Concept } from '$lib/content/types';
import type { StepItem } from './step';
import { isCiteOnly } from './why';
import { clip } from './text';

export type Seg = { t: string; b: boolean };

const CAPS = /(?<!\p{L})\p{Lu}{2,}(?:\s+\p{Lu}{2,})*(?!\p{L})/gu;
const ROMAN = /^[IVXLCDM]+$/;

/** Cụm IN HOA (tác giả dùng để nhấn ý trong `plain`) → khúc in đậm. Bỏ số La Mã và viết tắt 2 chữ cái. */
export function emphasis(text: string): Seg[] {
  const out: Seg[] = [];
  let pos = 0;
  for (const m of text.matchAll(CAPS)) {
    const s = m[0], i = m.index ?? 0;
    const letters = s.replace(/\s+/g, '');
    if (letters.length < 3 || (!/\s/.test(s) && ROMAN.test(s))) continue;
    if (i > pos) out.push({ t: text.slice(pos, i), b: false });
    out.push({ t: s, b: true });
    pos = i + s.length;
  }
  if (pos < text.length) out.push({ t: text.slice(pos), b: false });
  return out.length ? out : [{ t: text, b: false }];
}

function firstSentence(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim();
  const m = t.match(/^.+?[.!?](?=\s|$)/u);
  return m ? m[0] : t;
}

const LEAD_MAX = 165;

/** Lời gọn (1 câu, ≤ 170 ký tự) + phần đầy đủ để mở thêm (null nếu lời gọn đã là tất cả). */
export function gistOf(concept: Concept, item: StepItem): { lead: string; full: string | null; fromPlain: boolean } {
  const explain = (item.type === 'recall' ? item.model : 'explain' in item ? item.explain : '').replace(/\s+/g, ' ').trim();
  if (isCiteOnly(explain)) return { lead: clip(firstSentence(concept.plain), LEAD_MAX), full: null, fromPlain: true };
  const lead = clip(firstSentence(explain), LEAD_MAX);
  return { lead, full: explain.length > lead.length + 10 ? explain : null, fromPlain: false };
}

export type Branch = { label: string; children: string[]; icon?: string };

/** Nhánh sơ đồ: sơ đồ do người soạn (`memo.tree`) nếu có, không thì ≤ 4 dấu hiệu (`keywords`). */
export function branchesOf(concept: Concept): { authored: boolean; nodes: Branch[] } {
  const tree = concept.memo?.tree;
  if (tree?.length) return { authored: true, nodes: tree.map((n) => ({ label: n.label, children: n.children ?? [], ...(n.icon ? { icon: n.icon } : {}) })) };
  return { authored: false, nodes: concept.keywords.filter((k) => k.trim()).slice(0, 4).map((label) => ({ label, children: [] })) };
}
