// Đợt 7 — engine cho 3 đề xuất trong docs/specs/2026-11-03-phuong-phap-hoc-design.md:
// (① độ tự tin đã bỏ ở đợt 9) ③ đoán trước + thẻ giới thiệu ba lớp; ⑤ xen kẽ có chủ đích cặp dễ nhầm.
import { describe, expect, it } from 'vitest';
import { Rating } from 'ts-fsrs';
import type { Concept, Level } from '$lib/content/types';
import { ratingFor } from '$lib/engine/fsrs';
import { buildLearnSession, buildPretest, buildReviewSession, introLayers, pickReviewConcepts, type Step } from '$lib/engine/session';
import { nearConfusables } from '$lib/engine/arrange';
import { recordsProgress } from '$lib/engine/step';
import { answer, createRunner, next, summary } from '$lib/engine/runner';
import { mulberry32 } from '$lib/engine/rng';

const DEFS = [
  'việc một bên chuyển giao tài sản cho bên kia để nhận lại một khoản tiền tương ứng',
  'quyền của người thừa kế được nhận di sản theo hàng do luật định sẵn',
  'nghĩa vụ bồi thường khi gây thiệt hại ngoài hợp đồng do lỗi của mình',
  'sự kiện pháp lý làm chấm dứt tư cách chủ thể của pháp nhân trong doanh nghiệp',
  'thời hạn mà khi kết thúc thì phát sinh hoặc mất quyền khởi kiện trước tòa',
  'biện pháp bảo đảm bằng cách giao giữ một vật có giá trị cho người có quyền',
];
const WORDS = ['tài sản', 'nghĩa vụ', 'hợp đồng', 'thừa kế', 'bồi thường', 'chiếm hữu'];
function concept(id: string, k = 0, o: Partial<Concept> = {}): Concept {
  return {
    id, subject: 'hp', chapter: 'c', term: `Chế định ${id}`,
    definition: `Chế định ${id} là ${DEFS[k % DEFS.length]}.`,
    plain: 'Giải thích ngắn.', example: `Ông K và bà L gặp chuyện về ${WORDS[k % WORDS.length]} lần ${k + 1}.`,
    source: { kind: 'statute', cite: 'Đ1' }, checked: '2026-11-01', confusables: [], keywords: ['chuyển giao tài sản', 'khoản tiền', 'tự nguyện'],
    items: [
      { type: 'mcq', level: 1, q: `q1 ${id}`, options: ['1', '2', '3', '4'], answer: 0, explain: 'e' },
      { type: 'cloze', level: 3, text: `A {{b${id}}}` },
      { type: 'case', level: 4, q: `q4 ${id}`, options: ['1', '2', '3', '4'], answer: 1, explain: 'e' },
      { type: 'recall', level: 5, q: `q5 ${id}`, model: 'm', keywords: ['a', 'b', 'c'] },
    ],
    ...o,
  };
}
const mcqStep = (conceptId: string, level: Level = 2, meta: Step['meta'] = { kind: 'learn' }): Step => ({
  conceptId, level, meta, item: { type: 'mcq', level: 1, q: 'q', options: ['1', '2', '3', '4'], answer: 0, explain: 'e' },
});

describe('rating FSRS', () => {
  it('quy ước: sai = Again; đúng chậm = Hard; đúng nhanh ở bậc ≥ 3 = Easy', () => {
    expect(ratingFor(true, 3000, 3)).toBe(Rating.Easy);
    expect(ratingFor(true, 13000, 1)).toBe(Rating.Hard);
    expect(ratingFor(false, 1000, 5)).toBe(Rating.Again);
  });
  it('runner: câu sai vào vòng sửa sai theo thứ tự lượt chính', () => {
    let s = createRunner([mcqStep('a'), mcqStep('b'), mcqStep('c')], { a: 2, b: 2, c: 2 });
    s = answer(s, { correct: false, elapsedMs: 1000 }).state; s = next(s);
    s = answer(s, { correct: false, elapsedMs: 1000 }).state; s = next(s);
    s = answer(s, { correct: true, elapsedMs: 1000 }).state; s = next(s);
    expect(s.steps.slice(s.retryStart!).map((x) => x.conceptId)).toEqual(['a', 'b']);
    expect(summary(s)).not.toHaveProperty('hyper');
  });
});

describe('③ đoán trước + thẻ giới thiệu ba lớp', () => {
  const cs = ['a', 'b', 'c', 'd'].map((id, k) => concept(id, k));
  const lv0 = { a: 0, b: 0, c: 0, d: 0 } as Record<string, Level>;
  it('buildPretest: ≤ 2 câu "ví dụ → khái niệm", chỉ khái niệm mới, phương án là khái niệm cùng đợt', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const pre = buildPretest(cs, { ...lv0, d: 2 }, mulberry32(seed));
      expect(pre.length).toBe(2);
      for (const p of pre) {
        expect(p.meta?.kind).toBe('pretest');
        expect(p.conceptId).not.toBe('d');
        expect(p.item.type).toBe('mcq');
        if (p.item.type !== 'mcq') continue;
        expect(p.item.options.every((o) => cs.some((c) => c.term === o))).toBe(true);
        expect(recordsProgress(p)).toBe(false);
      }
    }
  });
  it('buildLearnSession: mặc định không có đoán trước; bật thì đặt đầu phiên, trước intro', () => {
    expect(buildLearnSession(cs, lv0, mulberry32(3)).some((s) => s.meta?.kind === 'pretest')).toBe(false);
    const steps = buildLearnSession(cs, lv0, mulberry32(3), {}, { pretest: 2 });
    expect(steps.slice(0, 2).every((s) => s.meta?.kind === 'pretest')).toBe(true);
    expect(steps.filter((s) => s.meta?.kind === 'pretest').length).toBe(2);
    // khái niệm đã học (pass 2) không có đoán trước
    const lv2 = { a: 2, b: 2, c: 2, d: 2 } as Record<string, Level>;
    expect(buildLearnSession(cs, lv2, mulberry32(3), {}, { pretest: 2 }).some((s) => s.meta?.kind === 'pretest')).toBe(false);
  });
  it('runner: đoán trước không đổi bậc, không XP, không combo, không vào vòng sửa sai, không tính điểm', () => {
    const pre = mcqStep('a', 1, { kind: 'pretest' });
    let s = createRunner([pre, mcqStep('b', 1)], { a: 0, b: 0 });
    const r = answer(s, { correct: false, elapsedMs: 500 });
    expect(r.xpGained).toBe(0);
    s = r.state;
    expect(s.levels.a).toBe(0);
    s = next(s);
    s = answer(s, { correct: true, elapsedMs: 500 }).state;
    s = next(s);
    expect(s.done).toBe(true);
    expect(s.retryStart).toBeNull();
    const sum = summary(s);
    expect(sum.total).toBe(1);
    expect(sum.pretest).toEqual({ total: 1, correct: 0 });
    expect(answer(createRunner([pre], { a: 0 }), { correct: true, elapsedMs: 1 }).state.combo).toBe(0);
  });
  it('introLayers: ví dụ → dấu hiệu (đánh dấu cụm có nguyên văn trong định nghĩa) → nguyên văn + nguồn', () => {
    const c = concept('a', 0);
    const L = introLayers(c);
    expect(L.example).toBe(c.example);
    expect(L.cues).toEqual([
      { text: 'chuyển giao tài sản', verbatim: true },
      { text: 'khoản tiền', verbatim: true },
      { text: 'tự nguyện', verbatim: false },
    ]);
    expect(L.definition).toBe(c.definition);
    expect(L.source).toEqual(c.source);
  });
});

describe('⑤ xen kẽ có chủ đích cặp dễ nhầm', () => {
  it('nearConfusables: cặp ở xa được kéo lại cách 1 câu; không liền cùng khái niệm', () => {
    const seq = ['a', 'x', 'y', 'z', 'w', 'b'].map((id) => mcqStep(id));
    const out = nearConfusables(seq, (p, q) => (p === 'a' && q === 'b') || (p === 'b' && q === 'a'));
    const ids = out.map((s) => s.conceptId);
    expect(ids.indexOf('b') - ids.indexOf('a')).toBe(2);
    expect(ids.slice().sort()).toEqual(['a', 'b', 'w', 'x', 'y', 'z']);
  });
  it('không đặt ngay sau bước vừa hiện tên khái niệm đó (tránh lộ đáp án)', () => {
    const seq = ['a', 'x', 'y', 'z', 'w', 'b'].map((id) => mcqStep(id));
    const out = nearConfusables(seq, (p, q) => [p, q].sort().join() === 'a,b', (from, to) => from.conceptId === 'x' && to === 'b');
    const ids = out.map((s) => s.conceptId);
    expect(ids[ids.indexOf('b') - 1]).not.toBe('x');
    expect(ids.indexOf('b') - ids.indexOf('a')).toBeGreaterThanOrEqual(2);
    expect(ids.indexOf('b') - ids.indexOf('a')).toBeLessThanOrEqual(4);
  });
  it('cặp đã gần (cách 1–3 câu) thì giữ nguyên; không động câu chốt', () => {
    const seq = ['a', 'x', 'b', 'y'].map((id) => mcqStep(id));
    expect(nearConfusables(seq, (p, q) => [p, q].sort().join() === 'a,b').map((s) => s.conceptId)).toEqual(['a', 'x', 'b', 'y']);
    const boss = mcqStep('b', 2, { kind: 'boss' });
    const s2 = [mcqStep('a'), mcqStep('x'), mcqStep('y'), mcqStep('z'), mcqStep('w'), boss];
    expect(nearConfusables(s2, (p, q) => [p, q].sort().join() === 'a,b').at(-1)).toBe(boss);
  });
  it('pickReviewConcepts: lấy khái niệm nào thì kéo khái niệm dễ nhầm (đang đến hạn) theo, trong giới hạn', () => {
    const a = concept('a', 0, { confusables: ['e'] });
    const list = [a, concept('b', 1), concept('c', 2), concept('d', 3), concept('e', 4)];
    expect(pickReviewConcepts(list, 3).map((c) => c.id)).toEqual(['a', 'e', 'b']);
    expect(pickReviewConcepts(list, 1).map((c) => c.id)).toEqual(['a']);
  });
  it('buildReviewSession: cặp dễ nhầm cùng vào phiên và cách nhau 1–3 câu (trừ khi một bên là câu chốt)', () => {
    const list = ['a', 'b', 'c', 'd', 'e', 'f'].map((id, k) => concept(id, k, id === 'a' ? { confusables: ['f'] } : {}));
    const lv = Object.fromEntries(list.map((c) => [c.id, 3])) as Record<string, Level>;
    let both = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const steps = buildReviewSession(list, lv, mulberry32(seed), 4);
      const ids = steps.map((s) => s.conceptId);
      // chỉ một bên khi bên kia rơi vào chỗ cuối cùng của giới hạn (không còn chỗ kéo theo)
      if (!(ids.includes('a') && ids.includes('f'))) continue;
      both++;
      const boss = steps.at(-1)!.conceptId;
      if (boss === 'a' || boss === 'f') continue;
      const d = Math.abs(ids.indexOf('a') - ids.indexOf('f'));
      expect(d).toBeGreaterThanOrEqual(2);
      expect(d).toBeLessThanOrEqual(4);
    }
    expect(both).toBeGreaterThan(10);
  });
});
