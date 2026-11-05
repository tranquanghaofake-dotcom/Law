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

describe('MemoCard: Ghi nhớ nhanh', () => {
  it('sơ đồ: gốc là tên khái niệm, mỗi dấu hiệu một nhánh', () => {
    const { container } = render(MemoCard, { props: { concept: c(), item } });
    expect(container.querySelector('.memo-root')?.textContent).toContain('Quan hệ pháp luật Hiến pháp');
    expect([...container.querySelectorAll('.memo-branch > .memo-node')].map((n) => n.textContent?.trim())).toEqual(['chủ thể đặc biệt', 'quan hệ chung và cụ thể', 'quy phạm và sự kiện']);
    expect(container.querySelector('.memo-tag')).toBeNull();
  });
  it('lời gọn là câu đầu; phần còn lại và ví dụ nằm trong mục mở thêm', () => {
    const { container } = render(MemoCard, { props: { concept: c(), item } });
    expect(container.querySelector('.memo-lead')?.textContent).toBe('Chủ thể đặc biệt là dấu hiệu chính.');
    const more = [...container.querySelectorAll('details summary')].map((s) => s.textContent?.trim());
    expect(more).toEqual(['Ví dụ', 'Giải thích đầy đủ']);
  });
  it('sơ đồ người soạn: gắn nhãn "Diễn giải để học", có mẹo nhớ và nhánh con', () => {
    const memo = { hook: 'Nhớ CHỦ THỂ.', tree: [{ label: 'Chủ thể', children: ['Nhân dân', 'cử tri'] }, { label: 'Phân loại' }] };
    const { container } = render(MemoCard, { props: { concept: c({ memo }), item } });
    expect(container.querySelector('.memo-tag')?.textContent).toContain('Diễn giải để học, không phải nguyên văn');
    expect(container.querySelector('.memo-hook b')?.textContent).toBe('CHỦ THỂ');
    expect(container.querySelectorAll('.memo-leaf')).toHaveLength(2);
  });
  it('có mẹo nhớ và giải thích chỉ là số điều → không lặp câu gọn lấy từ plain', () => {
    const memo = { hook: 'Nhớ CHỦ THỂ.' };
    const cite: StepItem = { ...item, explain: 'Điều 1.' } as StepItem;
    const { container } = render(MemoCard, { props: { concept: c({ memo }), item: cite } });
    expect(container.querySelector('.memo-lead')).toBeNull();
  });
});

describe('Feedback gọn', () => {
  it('nguồn và lời miễn trừ thu vào một dòng "Nguồn" đóng sẵn', () => {
    const { container } = render(Feedback, { props: { result: { correct: true, elapsedMs: 1 }, item, concept: c(), onnext: () => {} } });
    const src = container.querySelector('details.fb-source') as HTMLDetailsElement;
    expect(src.open).toBe(false);
    expect(src.querySelector('summary')?.textContent).toContain('Nguồn');
    expect(src.textContent).toContain('không phải tư vấn pháp lý');
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
