import { describe, expect, it } from 'vitest';
import { buildBank, gradeChecklist, gradeCloze, gradeRecall, normalize, parseCloze, scoreNhanDinh } from '$lib/engine/grading';

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

describe('scoreNhanDinh: chấm nhận định 0,25 · 0,25 · 0,5', () => {
  const item = { answer: false, parts: { basis: { options: ['a', 'b', 'c', 'd'], answer: 2 }, reason: { options: ['a', 'b', 'c', 'd'], answer: 0 } } };
  it('đúng cả 3 phần: 1 điểm, tính là đúng', () => {
    expect(scoreNhanDinh(item, { tf: false, basis: 2, reason: 0 })).toEqual({ score: 1, parts: { tf: true, basis: true, reason: true }, correct: true, grade: 'dung' });
  });
  it('sai Đúng/Sai nhưng đúng căn cứ, lập luận: 0,75, gần đúng', () => {
    expect(scoreNhanDinh(item, { tf: true, basis: 2, reason: 0 })).toMatchObject({ score: 0.75, correct: true, grade: 'gan' });
  });
  it('chỉ đúng lập luận: 0,5, gần đúng; chỉ đúng Đúng/Sai và căn cứ: 0,5, gần đúng', () => {
    expect(scoreNhanDinh(item, { tf: true, basis: 1, reason: 0 })).toMatchObject({ score: 0.5, grade: 'gan' });
    expect(scoreNhanDinh(item, { tf: false, basis: 2, reason: 3 })).toMatchObject({ score: 0.5, grade: 'gan' });
  });
  it('dưới 0,5: tính là sai', () => {
    expect(scoreNhanDinh(item, { tf: false, basis: 1, reason: 3 })).toMatchObject({ score: 0.25, correct: false, grade: 'sai' });
  });
});

describe('gradeChecklist: tự chấm từng ý', () => {
  it('đủ hết = dung; ≥ một nửa = gan; ít hơn = sai; rỗng = sai', () => {
    expect(gradeChecklist([true, true, true])).toBe('dung');
    expect(gradeChecklist([true, true, false, false])).toBe('gan');
    expect(gradeChecklist([true, false, false, false])).toBe('sai');
    expect(gradeChecklist([false, false])).toBe('sai');
    expect(gradeChecklist([])).toBe('sai');
  });
});
