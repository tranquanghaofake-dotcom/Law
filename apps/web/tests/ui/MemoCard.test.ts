import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import MemoCard from '$lib/ui/MemoCard.svelte';
import Feedback from '$lib/ui/Feedback.svelte';
import type { Concept } from '$lib/content/types';
import type { StepItem } from '$lib/engine/session';

afterEach(cleanup);
const c = (o: Partial<Concept> = {}): Concept => ({
  id: 'a', subject: 's', chapter: 'c', term: 'Quan hệ pháp luật Hiến pháp', definition: 'Định nghĩa.', plain: 'Có CHỦ THỂ đặc biệt. Câu hai.', example: 'Cử tri đi bỏ phiếu.',
  source: { kind: 'textbook', cite: 'Giáo trình Luật Hiến pháp, Chương 1 — tóm lược quan điểm học thuật', url: 'https://vbpl.vn/x' }, checked: '2026-11-01', confusables: [],
  keywords: ['chủ thể đặc biệt', 'quan hệ chung và cụ thể', 'quy phạm và sự kiện'], items: [], ...o,
});
const item: StepItem = { type: 'mcq', level: 1, q: 'q', options: ['A', 'B'], answer: 0, explain: 'Chủ thể đặc biệt là dấu hiệu chính. Câu hai dài dòng giải thích thêm nhiều chi tiết của giáo trình.' };

describe('MemoCard: Ghi nhớ nhanh (gọn)', () => {
  it('chưa có sơ đồ người soạn: mỗi dấu hiệu một dòng, kèm lời gọn; không có ô gốc tên khái niệm', () => {
    const { container } = render(MemoCard, { props: { concept: c(), item } });
    expect(container.querySelector('.memo-root')).toBeNull();
    expect([...container.querySelectorAll('.memo-row .memo-k')].map((n) => n.textContent?.trim())).toEqual(['chủ thể đặc biệt', 'quan hệ chung và cụ thể', 'quy phạm và sự kiện']);
    expect(container.querySelector('.memo-lead')?.textContent).toBe('Chủ thể đặc biệt là dấu hiệu chính.');
    expect(container.querySelector('details')).toBeNull();
  });
  it('sơ đồ người soạn: nhánh một dòng "Nhãn: ý · ý", mẹo nhớ có nhãn diễn giải, không lời gọn', () => {
    const memo = { hook: 'Nhớ CHỦ THỂ.', tree: [{ label: 'Chủ thể', children: ['Nhân dân', 'cử tri'] }, { label: 'Phân loại' }] };
    const { container } = render(MemoCard, { props: { concept: c({ memo }), item } });
    const rows = [...container.querySelectorAll('.memo-row')].map((r) => r.textContent?.replace(/\s+/g, ' ').trim());
    expect(rows).toEqual(['Chủ thể: Nhân dân · cử tri', 'Phân loại']);
    expect(container.querySelector('.memo-hook b')?.textContent).toBe('CHỦ THỂ');
    expect(container.querySelector('.memo-tag')?.textContent).toContain('diễn giải');
    expect(container.querySelector('.memo-tag .sr-only')?.textContent).toContain('không phải nguyên văn');
    expect(container.querySelector('.memo-lead')).toBeNull();
  });
});

describe('Feedback gọn', () => {
  it('ngoài sơ đồ chỉ còn MỘT mục "Xem thêm" đóng sẵn, chứa giải thích, ví dụ, nguồn, lời miễn trừ', () => {
    const { container } = render(Feedback, { props: { result: { correct: true, elapsedMs: 1 }, item, concept: c(), onnext: () => {} } });
    const more = container.querySelectorAll('details');
    expect(more).toHaveLength(1);
    const d = more[0] as HTMLDetailsElement;
    expect(d.classList.contains('fb-more')).toBe(true);
    expect(d.open).toBe(false);
    expect(d.querySelector('summary')?.textContent).toContain('Xem thêm');
    for (const t of ['Câu hai dài dòng', 'Cử tri đi bỏ phiếu.', 'Nguồn', 'không phải tư vấn pháp lý']) expect(d.textContent).toContain(t);
    expect(container.querySelector('.memo')).toBeTruthy();
  });
});

describe('Feedback: dấu "ĐÚNG" khi trả lời đúng', () => {
  it('câu đúng có dấu mộc nhỏ (ẩn với trình đọc màn hình), câu sai không', () => {
    const ok = render(Feedback, { props: { result: { correct: true, elapsedMs: 1 }, item, concept: c(), onnext: () => {} } });
    const seal = ok.container.querySelector('.ok-seal');
    expect(seal?.textContent).toContain('ĐÚNG');
    expect(seal?.getAttribute('aria-hidden')).toBe('true');
    cleanup();
    const bad = render(Feedback, { props: { result: { correct: false, elapsedMs: 1 }, item, concept: c(), onnext: () => {} } });
    expect(bad.container.querySelector('.ok-seal')).toBeNull();
  });
});

describe('MemoCard: Hiểu nhanh + hình theo loại khái niệm', () => {
  const tree = [{ label: 'Hiến pháp' }, { label: 'Luật', children: ['Quốc hội'] }, { label: 'Nghị định', children: ['Chính phủ'] }];
  const mk = (kind: string) => c({ memo: { gist: 'Văn bản luật có thứ bậc.', kind: kind as never, hook: 'Cao nhất là Hiến pháp.', tree } });
  it('Hiểu nhanh hiện đầu tiên, không còn lời gọn lấy từ giải thích', () => {
    const { container } = render(MemoCard, { props: { concept: mk('tree'), item } });
    const first = container.querySelector('.memo > *');
    expect(first?.classList.contains('memo-gist')).toBe(true);
    expect(first?.textContent).toBe('Văn bản luật có thứ bậc.');
    expect(container.querySelector('.memo-lead')).toBeNull();
  });
  it.each([
    ['ladder', '.memo-ladder li', 3],
    ['checklist', '.memo-check li', 3],
    ['steps', '.memo-steps li', 3],
    ['tree', '.memo-rows .memo-row', 3],
  ])('kind=%s vẽ đúng kiểu hình', (kind, sel, n) => {
    const { container } = render(MemoCard, { props: { concept: mk(kind), item } });
    expect(container.querySelectorAll(sel)).toHaveLength(n);
    expect(container.querySelector('.memo')?.getAttribute('data-kind')).toBe(kind);
  });
  it('kind=compare: hai cột từ hai nhánh đầu, mỗi cột có tiêu đề và các ý', () => {
    const { container } = render(MemoCard, { props: { concept: mk('compare'), item } });
    const cols = container.querySelectorAll('.memo-compare .memo-col');
    expect(cols).toHaveLength(2);
    expect(cols[1].querySelector('.memo-col-h')?.textContent).toBe('Luật');
    expect(cols[1].textContent).toContain('Quốc hội');
  });
  it('bậc thang: bậc trên cùng là nhánh đầu, có thứ tự (ol)', () => {
    const { container } = render(MemoCard, { props: { concept: mk('ladder'), item } });
    expect(container.querySelector('ol.memo-ladder li')?.textContent).toContain('Hiến pháp');
  });
});
