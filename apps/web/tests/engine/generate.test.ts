import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Concept, ItemCloze, ItemMcq, ItemPair } from '$lib/content/types';
import { blankKind, candidates, clozeExtras, definitionsOverlap, genDefTerm, genExampleConcept, genMatch, genSort, genStats, genTermDef, isGenericPair, pickDistractors, resetGenStats } from '$lib/engine/generate';
import { mulberry32 } from '$lib/engine/rng';
import { clangs, informative, leaks, MASK, overlaps } from '$lib/engine/text';

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

describe('pickDistractors: nhiễu cùng dạng với đáp án (không lộ vì hình thức)', () => {
  const c = (id: string, term: string, tier: 1 | 2 | 3 | 4 = 2) => ({ id, term, tier });
  it('bỏ nhiễu dài gấp nhiều lần đáp án khi còn đủ nhiễu vừa dạng, kể cả ở tầng thấp hơn', () => {
    const cands = [
      c('a', 'Người thừa kế không phụ thuộc vào nội dung di chúc', 1),
      c('b', 'Chiếm hữu', 2), c('c', 'Đại diện', 3), c('d', 'Thời hiệu', 3),
    ];
    const got = pickDistractors(cands, 3, mulberry32(1), 'Quyền sở hữu'.length, (x) => x.term).map((x) => x.cand.id).sort();
    expect(got).toEqual(['b', 'c', 'd']);
  });
  it('thiếu nhiễu vừa dạng thì vẫn bù bằng nhiễu lệch dạng (không bỏ câu)', () => {
    const cands = [c('a', 'Người thừa kế không phụ thuộc vào nội dung di chúc', 1), c('b', 'Chiếm hữu', 2)];
    expect(pickDistractors(cands, 2, mulberry32(1), 12, (x) => x.term)).toHaveLength(2);
  });
});

describe('genDefTerm: đề bài không che dày đặc', () => {
  it('định nghĩa nhắc thuật ngữ ≥ 3 lần thì dùng đoạn đầu (ít chỗ che hơn) nếu đủ thông tin', () => {
    const def = 'Đại diện là việc cá nhân, pháp nhân nhân danh và vì lợi ích của người được đại diện xác lập giao dịch dân sự với bên thứ ba. Người đại diện chỉ được hành động trong phạm vi đại diện. Giao dịch vượt phạm vi đại diện không làm phát sinh nghĩa vụ.';
    const c = C('a', { term: 'Đại diện', definition: def });
    const q = genDefTerm(c, ['b', 'c', 'd'].map((id) => ({ id, term: `Chế định ${id}`, tier: 2 as const, concept: C(id) })), mulberry32(3))!;
    expect(q).not.toBeNull();
    const stem = q.q.split('\n')[0];
    expect((stem.match(/\[…\]/g) ?? []).length).toBeLessThanOrEqual(2);
    expect(stem).toContain('xác lập giao dịch dân sự với bên thứ ba');
    expect(stem).not.toContain('Giao dịch vượt phạm vi');
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
  it('che cả phần ngoặc của tên (vd. "quan điểm Mác – Lênin") để định nghĩa không lộ đáp án', () => {
    const a = C('a', {
      term: 'Nguồn gốc của nhà nước (quan điểm Mác – Lênin)',
      definition: 'Theo chủ nghĩa Mác – Lênin, nhà nước không phải hiện tượng vĩnh cửu; nhà nước chỉ xuất hiện khi xã hội có chế độ tư hữu và phân hóa thành các giai cấp đối kháng.',
    });
    const it = genDefTerm(a, candidates(a, [a, C('b'), C('c'), C('d')]), rng)!;
    expect(it.q).not.toMatch(/Mác/);
    expect(it.options[it.answer]).toBe(a.term);
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

describe('genTermDef: phương án không bị cắt giữa chừng', () => {
  it('định nghĩa đúng quá dài (phải cắt "…") → null', () => {
    const a = C('a', { definition: `Chế định a là ${'việc chuyển giao tài sản có điều kiện cho bên kia '.repeat(8)}.` });
    expect(genTermDef(a, candidates(a, [a, C('b'), C('c'), C('d')]), rng)).toBeNull();
  });
  it('nhiễu có định nghĩa quá dài bị bỏ; còn đủ nhiễu ngắn thì vẫn ra câu và không phương án nào có "…"', () => {
    const a = C('a');
    const long = C('x', { definition: `Chế định x là ${'quan hệ phức tạp giữa nhiều chủ thể khác nhau '.repeat(8)}.` });
    const it = genTermDef(a, candidates(a, [a, long, C('b'), C('c'), C('d')]), rng)!;
    for (const o of it.options) expect(/ …$|\(…\)$/.test(o)).toBe(false);
  });
});

describe('genExampleConcept: ví dụ phải là minh hoạ, phương án không lồng nhau', () => {
  it('ví dụ dạng so sánh/đối chiếu (không phải một minh hoạ) → null', () => {
    const a = C('a', { example: 'So sánh với thời Lê: cả hai đều có Lục bộ; thời Nguyễn thêm Nội các và Cơ mật viện giúp vua.' });
    expect(genExampleConcept(a, candidates(a, [a, C('b'), C('c'), C('d')]), rng)).toBeNull();
  });
  it('bỏ nhiễu là khái niệm con/cha của đáp án (tên lồng nhau)', () => {
    const a = C('a', { term: 'Thời hiệu thừa kế', example: 'Người chết năm 2000, đến nay đã quá ba mươi năm mà không ai khởi kiện chia di sản.' });
    const pool = [a, C('b', { term: 'Thời hiệu' }), C('c', { term: 'Quyền sở hữu' }), C('d', { term: 'Di chúc miệng' }), C('e', { term: 'Người thừa kế' })];
    for (let seed = 1; seed <= 10; seed++) {
      const it = genExampleConcept(a, candidates(a, pool), mulberry32(seed));
      if (it) expect(it.options).not.toContain('Thời hiệu');
    }
  });
  it('câu hỏi trung tính ("Ví dụ trên…"), lời giải thích nêu dấu hiệu của khái niệm', () => {
    const a = C('a', { keywords: ['chuyển giao tài sản', 'nhận lại tiền', 'có hoàn trả'] });
    const it = genExampleConcept(a, candidates(a, [a, C('b'), C('c'), C('d')]), rng)!;
    expect(it.q).toContain('Ví dụ trên');
    expect(it.q).not.toContain('Tình huống trên');
    expect(it.explain).toContain('chuyển giao tài sản');
    expect(it.explain).toContain('nhận lại tiền');
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

describe('genMatch: mô tả không bị cắt giữa chừng', () => {
  it('khái niệm có cả định nghĩa lẫn plain đều quá dài → bị bỏ khỏi cặp', () => {
    const long = `${'quan hệ phức tạp giữa nhiều chủ thể khác nhau '.repeat(8)}.`;
    const x = C('x', { definition: `Chế định x là ${long}`, plain: long });
    const m = genMatch(C('a'), [x, C('b'), C('d'), C('e')], rng)!;
    expect(m.pairs.map((p) => p.conceptId)).not.toContain('x');
    for (const p of m.pairs) expect(/ …$|\(…\)$/.test(p.text)).toBe(false);
  });
});

describe('genSort', () => {
  const T = (k: string) => `Nhà đầu tư gặp ${k} trong thực tế`; // tình huống đủ dài (≥ 3 tiếng)
  const pair = (left: string, right: string, cases: [string, 'left' | 'right'][]): ItemPair => ({ type: 'pair', level: 2, left, right, cases: cases.map(([text, answer]) => ({ text, answer })), explain: `${left}/${right}` });
  it('gộp tình huống cùng cặp nhãn và tình huống mang một nhãn ở pair khác; ≥ 4, trộn, có cả hai cột', () => {
    const a = C('a', { term: 'Cổ phiếu', items: [pair('Cổ phiếu', 'Trái phiếu', [[T('t1'), 'left'], [T('t2'), 'right']])] });
    const b = C('b', { term: 'Trái phiếu', items: [pair('Trái phiếu', 'Cổ phiếu', [[T('t3'), 'left'], [T('t4'), 'right']])] });
    const c = C('c', { items: [pair('Cổ phiếu', 'Chứng chỉ quỹ', [[T('t5'), 'left'], [T('t6'), 'right']])] });
    const s = genSort(a, [b, c], rng)!;
    expect(s.type).toBe('sort');
    expect(s.cases.length).toBeGreaterThanOrEqual(4);
    expect(s.cases.length).toBeLessThanOrEqual(6);
    const byText = Object.fromEntries(s.cases.map((x) => [x.text.split(' — ').pop()!, x.answer]));
    const t5 = s.cases.find((x) => x.text.endsWith(T('t5')));
    if (t5) expect(t5.text).toBe(`Chế định c — ${T('t5')}`); // gộp từ khái niệm khác: ghi kèm tên khái niệm gốc
    expect(s.cases.find((x) => x.text.endsWith(T('t1')))!.text).toBe(T('t1')); // tên "Cổ phiếu" chính là nhãn → không ghi kèm
    expect(byText).toMatchObject({ [T('t1')]: 'left', [T('t2')]: 'right' }); // tình huống của chính khái niệm luôn giữ
    const expected: Record<string, string> = { [T('t3')]: 'right', [T('t4')]: 'left', [T('t5')]: 'left', [a.example]: 'left', [b.example]: 'right' };
    for (const [t, ans] of Object.entries(byText)) if (t in expected) expect(ans).toBe(expected[t]);
    expect(byText[T('t6')]).toBeUndefined(); // nhãn "Chứng chỉ quỹ" không thuộc cặp này
    const t3 = s.cases.find((x) => x.text === T('t3'));
    if (t3) expect(t3.conceptId).toBe('b');
  });
  it('nhãn chung chung ("Được phép | Bị cấm") không gộp từ khái niệm khác', () => {
    const p = pair('Được phép', 'Bị cấm', [[T('x1'), 'left'], [T('x2'), 'right']]);
    expect(isGenericPair(p)).toBe(true);
    expect(isGenericPair(pair('Xâm phạm', 'Không xâm phạm', []))).toBe(true);
    expect(isGenericPair(pair('Quỹ đóng', 'Quỹ mở', []))).toBe(false);
    const a = C('a', { items: [p] });
    const b = C('b', { items: [pair('Được phép', 'Bị cấm', [[T('x3'), 'left'], [T('x4'), 'right']])] });
    expect(genSort(a, [b], rng)).toBeNull();
  });
  it('nhãn đối lập "X | Không phải X" với tình huống chỉ là tên gọi trơn (< 5 tiếng) → bỏ cả câu', () => {
    const p = pair('Đương sự', 'Không phải đương sự', [['Bị đơn', 'left'], ['Người làm chứng', 'right'], ['Nguyên đơn', 'left'], ['Người phiên dịch', 'right']]);
    expect(isGenericPair(p)).toBe(true);
    expect(genSort(C('a', { items: [p] }), [], rng)).toBeNull();
  });
  it('nhãn đối lập nhưng tình huống đủ ngữ cảnh (≥ 5 tiếng) thì giữ', () => {
    const p = pair('Cần áp dụng pháp luật', 'Không cần áp dụng pháp luật', [['Cơ quan nhà nước ra quyết định giải quyết vụ việc cụ thể', 'left'], ['Hai bên tự nguyện thực hiện đúng hợp đồng đã ký', 'right'], ['Tòa án giải quyết tranh chấp thừa kế giữa các con', 'left'], ['Người dân tự thanh toán tiền theo hợp đồng', 'right']]);
    expect(genSort(C('a', { items: [p] }), [], rng)).not.toBeNull();
  });
  it('tình huống quá cụt (< 3 tiếng) bị bỏ khỏi câu xếp cột thường', () => {
    const a = C('a', { items: [pair('Quỹ đóng', 'Quỹ mở', [['Quỹ X', 'left'], ['Chứng chỉ bán lại trên sàn giao dịch', 'left'], ['Nhà đầu tư rút vốn bất cứ phiên nào', 'right'], ['Quỹ được mua lại theo yêu cầu của nhà đầu tư', 'right'], ['Cổ phiếu niêm yết trên sàn như thường', 'left']])] });
    const s = genSort(a, [], rng)!;
    expect(s.cases.map((x) => x.text)).not.toContain('Quỹ X');
  });
  it('không đủ 4 tình huống → null (không hỏi câu suy ra được)', () => {
    const a = C('a', { items: [pair('Quỹ đóng', 'Quỹ mở', [[T('q1'), 'left'], [T('q2'), 'right'], [T('q3'), 'left']])] });
    expect(genSort(a, [], rng)).toBeNull();
  });
  it('lấy ví dụ của khái niệm có tên trùng nhãn khi ví dụ không lộ nhãn', () => {
    const a = C('a', { term: 'Quỹ đóng', example: 'Chứng chỉ chỉ bán lại trên sàn.', items: [pair('Quỹ đóng', 'Quỹ mở', [[T('q1'), 'left'], [T('q2'), 'right'], [T('q3'), 'right']])] });
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
    }
  }, 30000);
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

describe('chống clang association: đáp án đúng không nổi bật vì trùng chữ với stem', () => {
  it('pickDistractors: ưu tiên nhiễu trùng chữ với stem ngang đáp án đúng', () => {
    const cands = [
      { id: 'x', term: 'Quyền khác đối với vật', tier: 2 as const },
      { id: 'y', term: 'Thời hiệu thừa kế', tier: 2 as const },
      { id: 'z', term: 'Thời hiệu khởi kiện', tier: 2 as const },
    ];
    const out = pickDistractors(cands, 2, mulberry32(1), 20, (c) => c.term, { stem: 'Thời hiệu khởi kiện vụ án dân sự', correct: 'Thời hiệu khởi kiện' });
    expect(out.map((o) => o.cand.id)).toEqual(['z', 'y']);
  });
  it('dữ liệu thật: tỉ lệ câu sinh mà đáp án đúng là phương án duy nhất trùng chữ với stem giảm so với trước (đo 42,6 % → 31 %; ngẫu nhiên thuần ≈ 25 %)', () => {
    const r = mulberry32(5);
    const bySubject = new Map<string, Concept[]>();
    for (const c of all) bySubject.set(c.subject, [...(bySubject.get(c.subject) ?? []), c]);
    const tally = { n: 0, clang: 0 };
    for (const c of all) {
      const known = bySubject.get(c.subject)!;
      const cands = candidates(c, known, undefined, r);
      for (const [it, stem] of [[genTermDef(c, cands, r), c.term], [genExampleConcept(c, cands, r), c.example]] as const) {
        if (!it) continue;
        tally.n++;
        if (clangs(stem, it.options, it.answer)) tally.clang++;
      }
    }
    expect(tally.n).toBeGreaterThan(100);
    expect(tally.clang / tally.n).toBeLessThan(0.35);
  }, 60000);
});

describe('clozeExtras: nhiễu ngân hàng từ cùng loại, cùng môn', () => {
  const cl = (text: string) => ({ type: 'cloze' as const, level: 3 as const, text });
  const a = C('a', { items: [cl('Thời hạn là {{90 ngày}} kể từ ngày nhận.')] });
  const mk = (id: string, text: string, o: Partial<Concept> = {}) => C(id, { items: [cl(text)], ...o });
  it('blankKind: số/tỉ lệ khác chữ', () => {
    expect(blankKind('90 ngày')).toBe('num');
    expect(blankKind('hai phần ba')).toBe('num');
    expect(blankKind('an toàn xã hội')).toBe('word');
  });
  it('chỗ trống số → nhiễu là số của câu khác cùng môn, không lấy chữ, không lấy khác môn', () => {
    const known = [a, mk('b', 'Tối đa {{60 ngày}} làm việc.'), mk('c', 'Quá {{một phần ba}} số thành viên.'), mk('d', 'Người {{đại diện}} ký.'), mk('e', 'Mức {{30 ngày}}.', { subject: 'khac' })];
    const out = clozeExtras(a, a.items[0] as ItemCloze, known, rng)!;
    expect(out.sort()).toEqual(['một phần ba', '60 ngày'].sort());
  });
  it('bỏ nhiễu xuất hiện trong chính câu, hoặc giống chỗ trống; thiếu nhiễu → null', () => {
    const k1 = [a, mk('b', 'Còn {{kể từ ngày}} nhận.'), mk('c', 'Hạn {{90 ngày}} khác.')];
    expect(clozeExtras(a, a.items[0] as ItemCloze, k1, rng)).toBeNull();
  });
  it('ưu tiên cùng chương', () => {
    const near = mk('n', 'Tối đa {{45 ngày}}.', { chapter: 'c1' });
    const far1 = mk('f1', 'Tối đa {{20 ngày}}.', { chapter: 'c9' });
    const far2 = mk('f2', 'Tối đa {{10 ngày}}.', { chapter: 'c9' });
    for (let seed = 1; seed <= 10; seed++) expect(clozeExtras(a, a.items[0] as ItemCloze, [a, far1, far2, near], mulberry32(seed))).toContain('45 ngày');
  });
  it('dữ liệu thật: nhiễu cùng loại với chỗ trống và không nằm trong câu', () => {
    const r = mulberry32(3);
    let n = 0;
    for (const c of all) for (const it of c.items) {
      if (it.type !== 'cloze') continue;
      const ex = clozeExtras(c, it, all, r);
      if (!ex) continue;
      n++;
      const kinds = new Set([...it.text.matchAll(/\{\{([^{}]+)\}\}/g)].map((m) => blankKind(m[1])));
      for (const e of ex) { expect(kinds.has(blankKind(e))).toBe(true); expect(new RegExp(`(?<![\\p{L}\\p{N}])${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'iu').test(it.text.replace(/\{\{[^{}]+\}\}/g, ' '))).toBe(false); }
    }
    expect(n).toBeGreaterThan(800); // phần lớn trong 1.480 câu có nhiễu thay được
  }, 60000);
});
