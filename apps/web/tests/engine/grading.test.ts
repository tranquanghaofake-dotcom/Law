import { describe, expect, it } from 'vitest';
import { buildBank, gradeCloze, gradeRecall, normalize, parseCloze } from '$lib/engine/grading';

describe('normalize', () => {
  it('hạ chữ thường, bỏ dấu câu, gộp khoảng trắng', () => {
    expect(normalize('Tài  sản, ')).toBe('tài sản');
  });
  it('chuẩn hóa NFD về NFC', () => {
    expect(normalize('tài sản')).toBe('tài sản');
  });
});

describe('parseCloze', () => {
  it('tách parts và blanks', () => {
    expect(parseCloze('A {{b}} c')).toEqual({ parts: ['A ', ' c'], blanks: ['b'] });
    expect(parseCloze('{{x}} và {{y}}.')).toEqual({ parts: ['', ' và ', '.'], blanks: ['x', 'y'] });
  });
});

describe('gradeCloze', () => {
  it('chấp nhận khác hoa thường và dấu câu', () => {
    expect(gradeCloze(['quyền tài sản'], ['Quyền tài sản.'])).toEqual({ correct: true, perBlank: [true] });
  });
  it('chấp nhận từ đồng nghĩa khai báo', () => {
    expect(gradeCloze(['tiền'], ['tiền tệ'], { tiền: ['tiền tệ'] }).correct).toBe(true);
  });
  it('sai một chỗ thì không đúng', () => {
    expect(gradeCloze(['vật', 'tiền'], ['vật', 'vàng'])).toEqual({ correct: false, perBlank: [true, false] });
  });
});

describe('buildBank', () => {
  it('gồm blanks + extra, không trùng', () => {
    const bank = buildBank(['vật', 'tiền'], ['hoa lợi', 'tiền'], () => 0.5);
    expect(bank.sort()).toEqual(['hoa lợi', 'tiền', 'vật']);
  });
});

describe('gradeRecall', () => {
  it('tìm từ khóa có mặt và thiếu', () => {
    const r = gradeRecall('Vì quyền tài sản là quyền trị giá được bằng tiền.', ['quyền tài sản', 'trị giá được bằng tiền', 'Điều 115']);
    expect(r.hits).toEqual(['quyền tài sản', 'trị giá được bằng tiền']);
    expect(r.missing).toEqual(['Điều 115']);
    expect(r.score).toBeCloseTo(2 / 3);
  });
});
