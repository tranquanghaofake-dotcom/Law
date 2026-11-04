import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Concept, Level, Subject } from '$lib/content/types';
import { buildLearnSession, buildReviewSession, clozeModeFor, finalize, kickerFor, passFor, pickItem, type Step } from '$lib/engine/session';
import { mulberry32 } from '$lib/engine/rng';
import { typeKey } from '$lib/engine/arrange';

const WORDS = ['tài sản', 'nghĩa vụ', 'hợp đồng', 'thừa kế', 'bồi thường', 'chiếm hữu', 'đại diện', 'thời hiệu'];
// định nghĩa khác hẳn nhau (câu sinh loại các khái niệm có định nghĩa chồng nhau)
const DEFS = [
  'việc một bên chuyển giao tài sản cho bên kia để nhận lại một khoản tiền tương ứng',
  'quyền của người thừa kế được nhận di sản theo hàng do luật định sẵn',
  'nghĩa vụ bồi thường khi gây thiệt hại ngoài hợp đồng do lỗi của mình',
  'sự kiện pháp lý làm chấm dứt tư cách chủ thể của pháp nhân trong doanh nghiệp',
  'thời hạn mà khi kết thúc thì phát sinh hoặc mất quyền khởi kiện trước tòa',
  'biện pháp bảo đảm bằng cách giao giữ một vật có giá trị cho người có quyền',
  'hình thức đại diện theo ủy quyền được xác lập bằng văn bản giữa hai người',
  'trạng thái nắm giữ, chi phối vật một cách trực tiếp như chủ sở hữu thật',
];
function concept(id: string, k = 0, o: Partial<Concept> = {}): Concept {
  const w = WORDS[k % WORDS.length];
  return {
    id, subject: 'hp', chapter: 'c', term: `Chế định ${id}`,
    definition: `Chế định ${id} là ${DEFS[k % DEFS.length]}.`,
    plain: 'Giải thích ngắn.', example: `Ông K và bà L gặp chuyện về ${w} lần ${k + 1}.`,
    source: { kind: 'statute', cite: 'Đ1' }, checked: '2026-11-01', confusables: [], keywords: ['a', 'b', 'c'],
    items: [
      { type: 'mcq', level: 1, q: `q1 ${id}`, options: ['1', '2', '3', '4'], answer: 0, explain: 'e' },
      { type: 'pair', level: 2, left: `Bên ${id}`, right: 'x', cases: [{ text: `t ${id}`, answer: 'left' }, { text: `u ${id}`, answer: 'right' }], explain: 'e' },
      { type: 'cloze', level: 3, text: `A {{b${id}}}` },
      { type: 'case', level: 4, q: `q4 ${id}`, options: ['1', '2', '3', '4'], answer: 1, explain: 'e' },
      { type: 'truefalse', level: 4, statement: `s ${id}`, answer: false, explain: 'e' },
      { type: 'recall', level: 5, q: `q5 ${id}`, model: 'm', keywords: ['a', 'b', 'c'] },
    ],
    ...o,
  };
}
const ids = ['a', 'b', 'c', 'd', 'e'];
const concepts = ids.map((id, k) => concept(id, k));
const levels = (l: Level) => Object.fromEntries(ids.map((i) => [i, l])) as Record<string, Level>;
const scored = (s: Step[]) => s.filter((x) => x.item.type !== 'intro');
const noClash = (s: Step[]) => s.every((x, k) => k === 0 || x.conceptId !== s[k - 1].conceptId || s[k - 1].item.type === 'intro');

describe('passFor', () => {
  it('bậc thấp nhất 0 → pass 1; 1–2 → pass 2; ≥3 → pass 3', () => {
    expect(passFor({ a: 0, b: 3 })).toBe(1);
    expect(passFor({ a: 1, b: 2 })).toBe(2);
    expect(passFor({ a: 2 })).toBe(2);
    expect(passFor({ a: 3, b: 6 })).toBe(3);
  });
});

describe('buildLearnSession', () => {
  it('pass 1: 5 intro + 5 bậc 1, intro đứng trước câu của chính nó, không liền khái niệm', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const steps = buildLearnSession(concepts, levels(0), mulberry32(seed));
      expect(steps.length).toBe(10);
      expect(steps.filter((s) => s.item.type === 'intro').length).toBe(5);
      expect(scored(steps).every((s) => s.level === 1)).toBe(true);
      for (const id of ids) {
        const intro = steps.findIndex((s) => s.conceptId === id && s.item.type === 'intro');
        const q = steps.findIndex((s) => s.conceptId === id && s.item.type !== 'intro');
        expect(q).toBeGreaterThan(intro);
      }
      expect(noClash(steps)).toBe(true);
    }
  });
  it('pass 1 dùng cả dạng sinh định nghĩa → thuật ngữ', () => {
    const gens = new Set<string>();
    for (let seed = 1; seed <= 10; seed++) for (const s of buildLearnSession(concepts, levels(0), mulberry32(seed))) gens.add(typeKey(s));
    expect(gens.has('def-term')).toBe(true);
    expect(gens.has('mcq')).toBe(true);
  });
  it('pass 2: 5 bước bậc 2 + 5 bước bậc 3, KHÔNG dùng pair 2 tình huống, xen kẽ, không liền khái niệm', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const steps = buildLearnSession(concepts, levels(1), mulberry32(seed));
      expect(steps.map((s) => s.level).sort()).toEqual([2, 2, 2, 2, 2, 3, 3, 3, 3, 3]);
      expect(steps.some((s) => s.item.type === 'pair')).toBe(false);
      expect(noClash(steps)).toBe(true);
    }
    const any = buildLearnSession(concepts, levels(1), mulberry32(3));
    expect(new Set(any.filter((s) => s.level === 2).map(typeKey)).size).toBeGreaterThanOrEqual(2);
  });
  it('pass 3: 5 bậc 4 + 5 bậc 5', () => {
    const steps = buildLearnSession(concepts, levels(3), mulberry32(5));
    expect(steps.map((s) => s.level).sort()).toEqual([4, 4, 4, 4, 4, 5, 5, 5, 5, 5]);
  });
  it('câu chốt: đúng 1 bước kind=boss, nằm cuối, ưu tiên tình huống', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const steps = buildLearnSession(concepts, levels(3), mulberry32(seed));
      expect(steps.filter((s) => s.meta?.kind === 'boss').length).toBe(1);
      expect(steps.at(-1)!.meta?.kind).toBe('boss');
      expect(steps.at(-1)!.item.type).toBe('case');
    }
  });
  it('câu vàng ~1/8: 10 bước tính điểm → 1 câu vàng, không phải câu chốt, không phải intro', () => {
    const steps = buildLearnSession(concepts, levels(1), mulberry32(9));
    const golden = steps.filter((s) => s.meta?.golden);
    expect(golden.length).toBe(1);
    expect(golden[0].meta?.kind).not.toBe('boss');
    const big = buildLearnSession(Array.from({ length: 8 }, (_, k) => concept('k' + k, k)), Object.fromEntries(Array.from({ length: 8 }, (_, k) => ['k' + k, 1])) as Record<string, Level>, mulberry32(2));
    expect(big.filter((s) => s.meta?.golden).length).toBe(2);
  });
  it('cùng seed → cùng phiên (tất định trong test)', () => {
    const a = buildLearnSession(concepts, levels(1), mulberry32(11));
    const b = buildLearnSession(concepts, levels(1), mulberry32(11));
    expect(a).toEqual(b);
  });
  it('mọi bước có meta.kicker; dạng def-term/example-concept không chứa tên khái niệm', () => {
    for (const lv of [0, 1, 3] as Level[]) for (let seed = 1; seed <= 5; seed++) {
      for (const s of buildLearnSession(concepts, levels(lv), mulberry32(seed))) {
        expect(s.meta?.kicker).toBeTruthy();
        if (s.meta?.gen === 'def-term' || s.meta?.gen === 'example-concept') expect(s.meta.kicker).not.toContain('Chế định');
      }
    }
  });
});

describe('đợt có bậc lẫn lộn (I3)', () => {
  it('khái niệm bậc cao không nhận intro và không bị kéo về bậc thấp; bậc 6 → dạng 3–5', () => {
    const lv = { a: 0, b: 3, c: 0, d: 0, e: 6 } as Record<string, Level>;
    const steps = buildLearnSession(concepts, lv, mulberry32(1));
    expect(steps.filter((s) => s.item.type === 'intro').map((s) => s.conceptId).sort()).toEqual(['a', 'c', 'd']);
    expect(steps.find((s) => s.conceptId === 'b' && s.item.type !== 'intro')!.level).toBe(3);
    for (let seed = 1; seed <= 20; seed++) {
      const e = buildLearnSession(concepts, lv, mulberry32(seed)).find((s) => s.conceptId === 'e')!;
      expect(e.level).toBeGreaterThanOrEqual(3);
      expect(e.level).toBeLessThanOrEqual(5);
    }
  });
  it('clozeModeFor: bậc < 3 ngân hàng từ, từ bậc 3 gõ', () => {
    expect(clozeModeFor(2)).toBe('bank');
    expect(clozeModeFor(3)).toBe('type');
    expect(clozeModeFor(6)).toBe('type');
  });
});

describe('buildReviewSession', () => {
  it('giới hạn 20 bước, mỗi khái niệm 1 bước, có câu chốt cuối', () => {
    const many = Array.from({ length: 25 }, (_, i) => concept('c' + i, i));
    const lv = Object.fromEntries(many.map((c) => [c.id, 6])) as Record<string, Level>;
    const steps = buildReviewSession(many, lv, mulberry32(4));
    expect(steps.length).toBe(20);
    expect(new Set(steps.map((s) => s.conceptId)).size).toBe(20);
    expect(steps.at(-1)!.meta?.kind).toBe('boss');
    expect(steps.every((s) => s.level >= 3)).toBe(true);
  });
});

describe('pickItem', () => {
  it('bậc 6 trả về item bậc 3–5', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const it6 = pickItem(concepts[0], 6, mulberry32(seed));
      expect(it6.level).toBeGreaterThanOrEqual(3);
      expect(it6.level).toBeLessThanOrEqual(5);
    }
  });
  it('thiếu loại ở bậc yêu cầu thì lấy bậc gần nhất thấp hơn', () => {
    const c = concept('z');
    c.items = c.items.filter((i) => i.level !== 5);
    expect(pickItem(c, 5, mulberry32(1)).level).toBe(4);
  });
});

describe('kickerFor', () => {
  it('thêm tên khái niệm khi an toàn, bỏ khi tên nằm trong phương án', () => {
    const c = concept('a');
    expect(kickerFor(c, c.items[0])).toBe('Nhận biết · Chế định a');
    expect(kickerFor(c, { ...c.items[0], options: ['Chế định a', '2', '3', '4'] } as never)).toBe('Nhận biết');
    expect(kickerFor(c, c.items[0], 'def-term')).toBe('Định nghĩa → thuật ngữ');
  });
});

describe('finalize', () => {
  it('câu chốt không đứng liền sau bước cùng khái niệm khi có thể', () => {
    const mk = (id: string, type: 'mcq' | 'case'): Step => ({ conceptId: id, level: 4, item: { type, level: type === 'case' ? 4 : 1, q: id, options: ['1', '2', '3', '4'], answer: 0, explain: '' } });
    const out = finalize([mk('a', 'mcq'), mk('b', 'mcq'), mk('c', 'mcq'), mk('a', 'case'), mk('b', 'mcq')], mulberry32(1));
    expect(out.at(-1)!.item.type).toBe('case');
    expect(noClash(out)).toBe(true);
  });
});

// ---------- Dữ liệu thật: số liệu đợt 6 ----------
const ROOT = resolve(process.cwd(), '../../packages/content/data');
const all: Concept[] = readdirSync(`${ROOT}/concepts`).flatMap((s) => readdirSync(`${ROOT}/concepts/${s}`).map((f) => JSON.parse(readFileSync(`${ROOT}/concepts/${s}/${f}`, 'utf8')) as Concept));
const subjects: Subject[] = readdirSync(`${ROOT}/subjects`).map((f) => JSON.parse(readFileSync(`${ROOT}/subjects/${f}`, 'utf8')) as Subject);

describe('dữ liệu thật: mọi đợt học ghép được phiên hợp lệ', () => {
  it('mỗi đợt × 3 pass: có câu chốt, không pair suy ra được, Đúng/Sai trong phiên gần 50/50', () => {
    const byKey = new Map(all.map((c) => [`${c.subject}/${c.id}`, c]));
    let tfT = 0, tfF = 0, sessions = 0, unbalanced = 0;
    for (const s of subjects) for (const ch of s.chapters) for (const l of ch.lessons) {
      const cs = l.concepts.map((id) => byKey.get(`${s.id}/${id}`)!);
      const pool = all.filter((x) => x.subject === s.id && (x.chapter === ch.id || cs.some((c) => c.confusables.includes(x.id))));
      for (const lv of [0, 1, 3] as Level[]) {
        const steps = buildLearnSession(cs, Object.fromEntries(cs.map((c) => [c.id, lv])), mulberry32(sessions + 1), { pool });
        sessions++;
        expect(steps.at(-1)!.meta?.kind).toBe('boss');
        expect(steps.some((x) => x.item.type === 'pair' && x.item.cases.length < 4)).toBe(false);
        let t = 0, f = 0;
        for (const x of steps) if (x.item.type === 'truefalse') { if (x.item.answer) t++; else f++; }
        tfT += t; tfF += f;
        if (Math.abs(t - f) > 1) unbalanced++;
      }
    }
    // ghi nhận: tỉ lệ Đúng trong các bước Đúng/Sai của mọi phiên thử
    expect(tfT / (tfT + tfF)).toBeGreaterThan(0.4);
    expect(unbalanced / sessions).toBeLessThan(0.1);
  }, 60000);
});

describe('buildReviewSession — ưu tiên khái niệm sắp quên', () => {
  it('quá số bước tối đa: lấy các khái niệm có xác suất còn nhớ thấp nhất', () => {
    const list = Array.from({ length: 10 }, (_, k) => concept(`r${k}`, k));
    const lv = Object.fromEntries(list.map((c) => [c.id, 1])) as Record<string, Level>;
    const urgency = Object.fromEntries(list.map((c, k) => [c.id, k / 10])); // r0 sắp quên nhất
    for (const seed of [1, 2, 3]) {
      const steps = buildReviewSession(list, lv, mulberry32(seed), 3, {}, urgency);
      expect(new Set(steps.map((s) => s.conceptId))).toEqual(new Set(['r0', 'r1', 'r2']));
    }
  });
});
