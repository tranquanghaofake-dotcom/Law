import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Concept, ItemMcq, ItemPair } from '$lib/content/types';
import { candidates, definitionsOverlap, genDefTerm, genDefTrueFalse, genExampleConcept, genMatch, genSort, genStats, genTermDef, isGenericPair, pickDistractors, resetGenStats } from '$lib/engine/generate';
import { mulberry32 } from '$lib/engine/rng';
import { informative, leaks, MASK, overlaps } from '$lib/engine/text';

const DEFS: Record<string, string> = {
  a: 'việc một bên chuyển giao tài sản cho bên kia để nhận lại một khoản tiền tương ứng',
  b: 'quyền của người thừa kế được nhận di sản theo hàng do luật định sẵn',
  c: 'nghĩa vụ bồi thường khi gây thiệt hại ngoài hợp đồng do lỗi của mình',
  d: 'sự kiện pháp lý làm chấm dứt tư cách chủ thể của pháp nhân trong doanh nghiệp',
  e: 'thời hạn mà khi kết thúc thì phát sinh hoặc mất quyền khởi kiện trước tòa',
  f: 'biện pháp bảo đảm bằng cách giao giữ một vật có giá trị cho người có quyền',
  g: 'hình thức đại diện theo ủy quyền được xác lập bằng văn bản giữa hai người',
  h: 'trạng thái nắm giữ, chi phối vật một cách trực tiếp như chủ sở hữu thật',
  z: 'chế tài hành chính áp dụng cho tổ chức vi phạm quy định về môi trường sống',
};
function C(id: string, o: Partial<Concept> = {}): Concept {
  return {
    id, subject: 'ds', chapter: 'c1', term: `Chế định ${id}`, definition: `Chế định ${id} là ${DEFS[id] ?? `quy định riêng số ${id} về quan hệ dân sự`}.`,
    plain: `Giải thích dễ hiểu cho ${id}.`, example: `Anh A làm việc thứ ${id} với chị B trong một hợp đồng.`,
    source: { kind: 'statute', cite: `Điều ${id}` }, checked: '2026-11-01', confusables: [], keywords: ['a'], items: [], ...o,
  };
}
const rng = mulberry32(1);

describe('candidates', () => {
  it('xếp tầng: dễ nhầm (cả hai chiều) → cùng chương → cùng môn → chỉ tên; bỏ khác môn và trùng tên', () => {
    const a = C('a', { confusables: ['b'] });
    const b = C('b', { chapter: 'c2' });
    const d = C('d', { chapter: 'c3', confusables: ['a'] });
    const e = C('e');
    const f = C('f', { chapter: 'c9' });
    const g = C('g', { subject: 'khac' });
    const h = C('h', { term: 'chế định a' }); // trùng tên với a
    const list = candidates(a, [a, b, d, e, f, g, h], { ds: { a: 'Chế định a', z: 'Chế định z', e: 'Chế định e' } });
    expect(list.map((x) => [x.id, x.tier])).toEqual([['b', 1], ['d', 1], ['e', 2], ['f', 3], ['z', 4]]);
  });
});

describe('pickDistractors', () => {
  it('ưu tiên tầng thấp, trong tầng ưu tiên độ dài gần đáp án, bỏ gần trùng', () => {
    const cands = [
      { id: 'x', term: 'rất dài rất dài rất dài rất dài rất dài rất dài', tier: 2 as const },
      { id: 'y', term: 'ngắn', tier: 2 as const },
      { id: 'z', term: 'tầng một', tier: 1 as const },
      { id: 'w', term: 'Ngắn.', tier: 3 as const },
    ];
    const got = pickDistractors(cands, 3, rng, 5, (c) => c.term).map((x) => x.cand.id);
    expect(got).toEqual(['z', 'y', 'x']);
  });
});

describe('genDefTerm', () => {
  it('che thuật ngữ trong định nghĩa, đáp án đúng nằm trong 4 phương án khác nhau', () => {
    const a = C('a', { confusables: ['b'] });
    const cands = candidates(a, [a, C('b'), C('c'), C('d')]);
    const it = genDefTerm(a, cands, rng)!;
    expect(it.type).toBe('mcq');
    expect(it.options.length).toBe(4);
    expect(new Set(it.options).size).toBe(4);
    expect(it.options[it.answer]).toBe(a.term);
    expect(it.q).toContain(MASK);
    expect(leaks(it.q, a.term)).toBe(false);
  });
  it('thiếu phương án (< 2 nhiễu) → null', () => {
    const a = C('a');
    expect(genDefTerm(a, candidates(a, [a, C('b')]), rng)).toBeNull();
  });
  it('3 phương án vẫn được (giao diện hỗ trợ 2–4)', () => {
    const a = C('a');
    expect(genDefTerm(a, candidates(a, [a, C('b'), C('c')]), rng)!.options.length).toBe(3);
  });
});

describe('genTermDef', () => {
  it('phương án là định nghĩa đã che thuật ngữ, không lộ tên khái niệm hỏi', () => {
    const a = C('a');
    const it = genTermDef(a, candidates(a, [a, C('b'), C('c'), C('d')]), rng)!;
    expect(it.q).toContain(a.term);
    for (const o of it.options) expect(o.includes('Chế định')).toBe(false);
    expect(it.options[it.answer]).toContain(DEFS.a);
  });
  it('chỉ dùng ứng viên có đủ dữ liệu (không dùng bảng tên)', () => {
    const a = C('a');
    expect(genTermDef(a, candidates(a, [a, C('b')], { ds: { x: 'X', y: 'Y' } }), rng)).toBeNull();
  });
});

describe('genExampleConcept', () => {
  it('ví dụ chứa tên khái niệm → null (lộ đáp án)', () => {
    const a = C('a', { example: 'Đây là Chế định a điển hình.' });
    expect(genExampleConcept(a, candidates(a, [a, C('b'), C('c'), C('d')]), rng)).toBeNull();
  });
  it('bỏ nhiễu có tên xuất hiện trong ví dụ hoặc bao hàm khái niệm', () => {
    const a = C('a', { term: 'Quỹ đóng', example: 'Nhà đầu tư không được bán lại chứng chỉ cho công ty quản lý quỹ; muốn thoát phải bán trên sàn như cổ phiếu.' });
    const pool = [a, C('b', { term: 'Công ty quản lý quỹ' }), C('c', { term: 'Quỹ mở' }), C('d', { term: 'Quỹ đóng đại chúng' }), C('e', { term: 'Quỹ thành viên' }), C('f', { term: 'Ngân hàng giám sát' })];
    const it = genExampleConcept(a, candidates(a, pool), rng)!;
    expect(it.level).toBe(4);
    expect(it.options[it.answer]).toBe('Quỹ đóng');
    expect(it.options).not.toContain('Công ty quản lý quỹ');
    expect(it.options).not.toContain('Quỹ đóng đại chúng');
    expect(it.options.length).toBe(4);
  });
});

describe('genMatch', () => {
  it('3–4 cặp cùng môn, text đã che mọi thuật ngữ trong nhóm', () => {
    const a = C('a');
    const m = genMatch(a, [C('b'), C('c', { subject: 'khac' }), C('d'), C('e'), C('f')], rng)!;
    expect(m.pairs.length).toBe(4);
    expect(m.pairs.map((p) => p.conceptId).sort()).toEqual(['a', 'b', 'd', 'e']);
    for (const p of m.pairs) expect(p.text.startsWith(MASK)).toBe(true);
    expect(genMatch(a, [C('b')], rng)).toBeNull();
  });
});

describe('genSort', () => {
  const pair = (left: string, right: string, cases: [string, 'left' | 'right'][]): ItemPair => ({ type: 'pair', level: 2, left, right, cases: cases.map(([text, answer]) => ({ text, answer })), explain: `${left}/${right}` });
  it('gộp tình huống cùng cặp nhãn và tình huống mang một nhãn ở pair khác; ≥ 4, trộn, có cả hai cột', () => {
    const a = C('a', { term: 'Cổ phiếu', items: [pair('Cổ phiếu', 'Trái phiếu', [['t1', 'left'], ['t2', 'right']])] });
    const b = C('b', { term: 'Trái phiếu', items: [pair('Trái phiếu', 'Cổ phiếu', [['t3', 'left'], ['t4', 'right']])] });
    const c = C('c', { items: [pair('Cổ phiếu', 'Chứng chỉ quỹ', [['t5', 'left'], ['t6', 'right']])] });
    const s = genSort(a, [b, c], rng)!;
    expect(s.type).toBe('sort');
    expect(s.cases.length).toBeGreaterThanOrEqual(4);
    expect(s.cases.length).toBeLessThanOrEqual(6);
    const byText = Object.fromEntries(s.cases.map((x) => [x.text.split(' — ').pop()!, x.answer]));
    const t5 = s.cases.find((x) => x.text.endsWith('t5'));
    if (t5) expect(t5.text).toBe('Chế định c — t5'); // gộp từ khái niệm khác: ghi kèm tên khái niệm gốc
    expect(s.cases.find((x) => x.text.endsWith('t1'))!.text).toBe('t1'); // tên "Cổ phiếu" chính là nhãn → không ghi kèm
    expect(byText).toMatchObject({ t1: 'left', t2: 'right' }); // tình huống của chính khái niệm luôn giữ
    const expected: Record<string, string> = { t3: 'right', t4: 'left', t5: 'left', [a.example]: 'left', [b.example]: 'right' };
    for (const [t, ans] of Object.entries(byText)) if (t in expected) expect(ans).toBe(expected[t]);
    expect(byText.t6).toBeUndefined(); // nhãn "Chứng chỉ quỹ" không thuộc cặp này
    const t3 = s.cases.find((x) => x.text === 't3');
    if (t3) expect(t3.conceptId).toBe('b');
  });
  it('nhãn chung chung ("Được phép | Bị cấm") không gộp từ khái niệm khác', () => {
    const p = pair('Được phép', 'Bị cấm', [['x1', 'left'], ['x2', 'right']]);
    expect(isGenericPair(p)).toBe(true);
    expect(isGenericPair(pair('Xâm phạm', 'Không xâm phạm', []))).toBe(true);
    expect(isGenericPair(pair('Quỹ đóng', 'Quỹ mở', []))).toBe(false);
    const a = C('a', { items: [p] });
    const b = C('b', { items: [pair('Được phép', 'Bị cấm', [['x3', 'left'], ['x4', 'right']])] });
    expect(genSort(a, [b], rng)).toBeNull();
  });
  it('không đủ 4 tình huống → null (không hỏi câu suy ra được)', () => {
    const a = C('a', { items: [pair('Quỹ đóng', 'Quỹ mở', [['q1', 'left'], ['q2', 'right'], ['q3', 'left']])] });
    expect(genSort(a, [], rng)).toBeNull();
  });
  it('lấy ví dụ của khái niệm có tên trùng nhãn khi ví dụ không lộ nhãn', () => {
    const a = C('a', { term: 'Quỹ đóng', example: 'Chứng chỉ chỉ bán lại trên sàn.', items: [pair('Quỹ đóng', 'Quỹ mở', [['q1', 'left'], ['q2', 'right'], ['q3', 'right']])] });
    const b = C('b', { term: 'Quỹ mở', example: 'Nhà đầu tư bán lại chứng chỉ cho quỹ bất cứ phiên nào; quỹ mở luôn mua lại.' });
    const s = genSort(a, [b], rng)!;
    expect(s.cases.map((x) => x.text)).toContain('Chứng chỉ chỉ bán lại trên sàn.');
    expect(s.cases.map((x) => x.text)).not.toContain(b.example); // lộ nhãn "quỹ mở"
  });
});

// ---------- Kiểm trên toàn bộ dữ liệu thật ----------
const DATA = resolve(process.cwd(), '../../packages/content/data/concepts');
const all: Concept[] = readdirSync(DATA).flatMap((s) => readdirSync(resolve(DATA, s)).map((f) => JSON.parse(readFileSync(resolve(DATA, s, f), 'utf8')) as Concept));

describe('dữ liệu thật: câu sinh hợp lệ', () => {
  const r = mulberry32(2026);
  const bySubject = new Map<string, Concept[]>();
  for (const c of all) bySubject.set(c.subject, [...(bySubject.get(c.subject) ?? []), c]);
  const check = (c: Concept, it: ItemMcq | null) => {
    if (!it) return;
    expect(it.options.length).toBeGreaterThanOrEqual(3);
    expect(it.options.length).toBeLessThanOrEqual(4);
    expect(new Set(it.options).size).toBe(it.options.length);
    expect(it.answer).toBeGreaterThanOrEqual(0);
  };
  it('def-term / term-def / example-concept / match / sort: cấu trúc đúng, không lộ đáp án', () => {
    for (const c of all) {
      const known = bySubject.get(c.subject)!;
      const cands = candidates(c, known);
      const d = genDefTerm(c, cands, r);
      check(c, d);
      if (d) { expect(d.options[d.answer]).toBe(c.term); expect(leaks(d.q.slice(1, d.q.lastIndexOf('»')), c.term)).toBe(false); }
      const t = genTermDef(c, cands, r);
      check(c, t);
      const e = genExampleConcept(c, cands, r);
      check(c, e);
      if (e) { expect(leaks(c.example, c.term)).toBe(false); for (const o of e.options) if (o !== c.term) expect(leaks(c.example, o)).toBe(false); }
      const s = genSort(c, known, r);
      if (s) {
        expect(s.cases.length).toBeGreaterThanOrEqual(4);
        expect(s.cases.some((x) => x.answer === 'left') && s.cases.some((x) => x.answer === 'right')).toBe(true);
      }
      const f = genDefTrueFalse(c, cands, false, r);
      if (f) {
        expect(f.answer).toBe(false);
        expect(f.statement.endsWith(`«${c.term}».`)).toBe(false);
      }
    }
  }, 30000);
});

describe('genDefTrueFalse', () => {
  it('Đúng: ghép định nghĩa với chính thuật ngữ; Sai: với khái niệm dễ nhầm có định nghĩa khác hẳn', () => {
    const a = C('a', { confusables: ['b'] });
    const b = C('b', { term: 'Trách nhiệm tài sản', definition: 'Trách nhiệm tài sản là một hình thức trách nhiệm hoàn toàn khác về tài sản.' });
    const cands = candidates(a, [a, b]);
    const t = genDefTrueFalse(a, cands, true, rng)!;
    expect(t).toMatchObject({ type: 'truefalse', level: 4, answer: true });
    expect(t.statement).toContain(`«${a.term}»`);
    expect(t.statement).toContain(MASK);
    const f = genDefTrueFalse(a, cands, false, rng)!;
    expect(f.answer).toBe(false);
    expect(f.statement).toContain(`«${b.term}»`);
    expect(f.explain).toContain(a.term);
  });
  it('Sai: không dùng khái niệm có định nghĩa gần trùng, tên bao hàm, hay khái niệm khác chương xa', () => {
    const a = C('a', { term: 'Quỹ đóng', definition: 'Quỹ đóng là quỹ đại chúng mà chứng chỉ quỹ không được mua lại theo yêu cầu.', confusables: ['b'] });
    const b = C('b', { term: 'Quỹ đóng đại chúng', definition: 'Một định nghĩa khác hẳn về tổ chức quỹ.' });
    const far = C('z', { chapter: 'xa', term: 'Chế định xa' });
    expect(genDefTrueFalse(a, candidates(a, [a, b, far]), false, rng)).toBeNull();
  });
});

// ---------- Hồi quy đợt 6 (ảnh a5/1280-light-01-match-mid): hai mô tả ghép cặp gần trùng ----------
describe('mô tả chồng nhau không cùng xuất hiện trong một câu', () => {
  const hp = all.filter((c) => c.subject === 'hien-phap');
  const get = (id: string) => hp.find((c) => c.id === id)!;
  const hienPhap = get('hien-phap');
  const hieuLuc = get('hieu-luc-phap-ly-toi-cao');

  it('"Hiến pháp" và "Hiệu lực pháp lý cao nhất của Hiến pháp" có định nghĩa chồng nhau ("hòa"/"hoà" coi như một)', () => {
    expect(definitionsOverlap(hienPhap, hieuLuc)).toBe(true);
    expect(overlaps('luật cơ bản của nước Cộng hòa xã hội chủ nghĩa Việt Nam', 'Đây là luật cơ bản của nước Cộng hoà xã hội chủ nghĩa Việt Nam, có hiệu lực cao nhất')).toBe(true);
  });
  it('mô tả chỉ còn "[…]" + vài chữ là ít thông tin', () => {
    expect(informative(`${MASK} là ${MASK} của Nhà nước.`)).toBe(false);
    expect(informative(`${MASK} là luật cơ bản của nước, có hiệu lực pháp lý cao nhất.`)).toBe(true);
  });
  it('ghép cặp: không có hai mô tả chồng nhau / ít thông tin (cả hai thứ tự, nhiều seed)', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const r = mulberry32(seed);
      for (const [main, other] of [[hienPhap, hieuLuc], [hieuLuc, hienPhap]]) {
        const rest = hp.filter((c) => c.chapter === main.chapter && c.id !== main.id && c.id !== other.id);
        const m = genMatch(main, [other, ...rest], r);
        if (!m) continue;
        for (const p of m.pairs) expect(informative(p.text)).toBe(true);
        for (let i = 0; i < m.pairs.length; i++) for (let j = 0; j < i; j++) expect(overlaps(m.pairs[i].text, m.pairs[j].text)).toBe(false);
      }
    }
  });
  it('định nghĩa → thuật ngữ của "Hiến pháp" không lấy "Hiệu lực pháp lý cao nhất…" làm nhiễu', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const d = genDefTerm(hienPhap, candidates(hienPhap, hp), mulberry32(seed));
      if (d) expect(d.options).not.toContain(hieuLuc.term);
    }
  });
  it('toàn dữ liệu: ghép cặp không có mô tả chồng nhau; câu định nghĩa không lấy nhiễu có định nghĩa chồng', () => {
    const r = mulberry32(99);
    resetGenStats();
    let match = 0, defTerm = 0;
    for (const c of all) {
      const same = all.filter((x) => x.subject === c.subject && x.id !== c.id);
      const near = same.filter((x) => x.chapter === c.chapter || c.confusables.includes(x.id));
      const m = genMatch(c, near, r);
      if (m) {
        match++;
        for (let i = 0; i < m.pairs.length; i++) {
          expect(informative(m.pairs[i].text)).toBe(true);
          for (let j = 0; j < i; j++) expect(overlaps(m.pairs[i].text, m.pairs[j].text), `${c.id}: ${m.pairs[i].conceptId} ~ ${m.pairs[j].conceptId}`).toBe(false);
        }
      }
      const d = genDefTerm(c, candidates(c, same), r);
      if (d) {
        defTerm++;
        for (const o of d.options) {
          const x = same.find((y) => y.term === o);
          if (x) expect(definitionsOverlap(c, x), `${c.id} ~ ${x.id}`).toBe(false);
        }
      }
    }
    // số liệu ghi engine.md (GEN_STATS_OUT=<file> để ghi ra file)
    if (process.env.GEN_STATS_OUT) writeFileSync(process.env.GEN_STATS_OUT, JSON.stringify({ match, defTerm, ...genStats }));
  }, 60000);
});
