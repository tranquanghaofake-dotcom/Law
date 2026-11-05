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
