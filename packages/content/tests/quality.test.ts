import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR } from '../src/build';
import { isClang, lintAll, lintConcept, sharedWords } from '../src/quality';
import type { Concept } from '../src/types';

const c = (items: Concept['items']): Concept => ({ id: 'x', subject: 's', chapter: 'c', term: 'T', definition: 'd', plain: 'p', example: 'e', source: { kind: 'statute', cite: 'Điều 1' }, checked: '2026-11-01', confusables: [], keywords: [], items });
const mcq = (q: string, options: string[], answer = 0) => ({ type: 'mcq' as const, level: 1 as const, q, options, answer, explain: 'Điều 1.' });

describe('quy tắc NBME: từng quy tắc bắt đúng và không bắt nhầm', () => {
  it('stem phủ định', () => {
    expect(lintConcept(c([mcq('Trường hợp nào không phải hợp đồng?', ['a', 'b', 'c'])])).map((f) => f.rule)).toEqual(['stem-phu-dinh']);
    // phủ định in hoa KHÔNG + phương án ngắn: chấp nhận (NBME cho phép khi buộc phải dùng)
    expect(lintConcept(c([mcq('Loại nào KHÔNG thuộc danh sách tại khoản 1 Điều 4?', ['Sổ tiết kiệm', 'Cổ phiếu', 'Trái phiếu'])]))).toEqual([]);
    expect(lintConcept(c([mcq('Loại nào KHÔNG thuộc danh sách tại khoản 1 Điều 4?', ['x'.repeat(90), 'b', 'c'])])).map((f) => f.rule)).toEqual(['stem-phu-dinh']);
    expect(lintConcept(c([mcq('Nhận định nào sau đây sai?', ['a', 'b', 'c'])])).map((f) => f.rule)).toEqual(['stem-phu-dinh']);
    expect(lintConcept(c([mcq('Tòa án không tự áp dụng thời hiệu khi nào?', ['a', 'b', 'c'])]))).toEqual([]); // "không" thường trong nội dung luật
  });
  it('clang: đáp án đúng là phương án duy nhất trùng nhiều chữ với stem', () => {
    const q = 'Thời hiệu khởi kiện vụ án dân sự là bao lâu?';
    expect(isClang(q, ['Thời hiệu khởi kiện là hai năm', 'Ba năm', 'Mười năm'], 0)).toBe(true);
    expect(isClang(q, ['Hai năm', 'Ba năm', 'Mười năm'], 0)).toBe(false); // không trùng chữ nào
    expect(isClang(q, ['Thời hiệu khởi kiện hai năm', 'Thời hiệu khởi kiện ba năm', 'Mười năm'], 0)).toBe(false); // nhiễu cũng trùng ngang
    expect(sharedWords('Thời hiệu của quyền', 'quyền và thời hiệu')).toBe(3);
  });
  it('nhận định Sai có từ tuyệt đối', () => {
    const tf = (statement: string, answer: boolean) => ({ type: 'truefalse' as const, level: 4 as const, statement, answer, explain: 'x' });
    expect(lintConcept(c([tf('Mọi doanh nghiệp đều phải đăng ký.', false)])).map((f) => f.rule)).toEqual(['tf-tuyet-doi']);
    expect(lintConcept(c([tf('Mọi doanh nghiệp đều phải đăng ký.', true)]))).toEqual([]);
  });
});

// Ratchet: số câu vi phạm trên kho thật KHÔNG được tăng. Giảm được thì hạ ngưỡng xuống (đo 07/11/2026).
// Danh sách chi tiết để viết lại: `npm run quality` → docs/review/chat-luong-cau.md.
const concepts: Concept[] = readdirSync(join(DATA_DIR, 'concepts')).flatMap((s) => readdirSync(join(DATA_DIR, 'concepts', s)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(DATA_DIR, 'concepts', s, f), 'utf8')) as Concept));
const BASELINE = { 'stem-phu-dinh': 26, clang: 214, 'tf-tuyet-doi': 51 };

describe('kho thật: không thêm câu vi phạm', () => {
  const found = lintAll(concepts);
  const count = (r: string) => found.filter((f) => f.rule === r).length;
  for (const r of Object.keys(BASELINE)) it(`${r} ≤ ${BASELINE[r as keyof typeof BASELINE]}`, () => expect(count(r)).toBeLessThanOrEqual(BASELINE[r as keyof typeof BASELINE]));
});
