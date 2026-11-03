import { describe, expect, it } from 'vitest';
import { streakView, postProgress } from '$lib/ui/streakView';
import { progressOf, cardFor } from '$lib/game/card';
import { careerState } from '$lib/game/career';

describe('streakView — một số tiến độ duy nhất cho rail, sidebar, topbar', () => {
  it('chưa có chuỗi: 0/30, chưa có màu chu kỳ', () => {
    const v = streakView(0, 0);
    expect(v).toMatchObject({ count: 0, day: 0, total: 30, tier: null, pct: 0, left: 30 });
  });
  it('lấy `day` từ cardFor (có cộng ngày mốc), không tính tay (streak − 1) % 30 + 1', () => {
    // chuỗi 2 ngày: ngày 1 là mốc (+2), ngày 2 (+1) → tiến độ 3 — khớp chú thích thẻ "Đỏ · 3/30"
    const v = streakView(2, 2);
    expect(v.day).toBe(3);
    expect(v.day).toBe(cardFor(2, 2).day);
    expect(v.day).toBe(progressOf(2));
    expect(v.tierName).toBe('Đỏ');
    expect(v.left).toBe(27);
    expect(v.pct).toBe(10);
  });
  it('sang vòng mới: Xanh lam, ngày về đầu vòng', () => {
    let n = 1; while (progressOf(n) <= 30) n++;
    const v = streakView(n, n);
    expect(v.tier).toBe('lam');
    expect(v.tierName).toBe('Xanh lam');
    expect(v.day).toBeGreaterThanOrEqual(1);
    expect(v.nextTierName).toBe('Tím');
  });
  it('kỷ lục lấy max(longest, count); màu lửa là hex cho mọi trạng thái', () => {
    expect(streakView(3, 10).longest).toBe(10);
    expect(streakView(12, 5).longest).toBe(12);
    expect(streakView(2, 2).color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(streakView(0, 0).color).toMatch(/^#[0-9a-f]{6}$/i);
  });
  it('nhãn ngắn gọn dùng chung', () => {
    expect(streakView(2, 2).label).toBe('Đỏ · 3/30');
    expect(streakView(0, 0).label).toBe('Chưa có chuỗi');
  });
});

describe('postProgress — tiến độ tới chức kế tiếp "x/y sách"', () => {
  it('chưa có sách: 0/tổng điều kiện của chức kế tiếp (Công chức cấp xã cần 2 sách)', () => {
    const st = careerState([]);
    const p = postProgress(st.next['hanh-phap']);
    expect(p).toMatchObject({ have: 0, need: 2, pct: 0, title: 'Công chức cấp xã' });
  });
  it('đã có một phần: đếm đúng phần đã đủ, không vượt số cần của từng điều kiện', () => {
    const st = careerState([{ field: 'hien-phap', level: 1 }, { field: 'hien-phap', level: 1 }]);
    const p = postProgress(st.next['hanh-phap']);
    expect(p).toMatchObject({ have: 1, need: 2, pct: 50 });
  });
  it('hết chức để lên (next = null) → null', () => {
    expect(postProgress(null)).toBeNull();
  });
});
