import { describe, expect, it } from 'vitest';
import type { Subject } from '$lib/content/types';
import { currentLesson, inProgressLesson, lessonGate, lessonStates } from '$lib/ui/lessonState';

const subject: Subject = {
  id: 'hp', title: 'Luật Hiến pháp', short: 'HP',
  chapters: [{ id: 'c1', title: 'Khái quát', lessons: [
    { id: 'hp-1', title: 'Hiến pháp là gì', concepts: ['a', 'b'] },
    { id: 'hp-2', title: 'Sửa đổi', concepts: ['c', 'd'] },
  ] }],
};

describe('lessonStates', () => {
  it('đợt xong khi mọi khái niệm ≥ 3; đợt chưa xong đầu tiên là current; còn lại locked', () => {
    expect(lessonStates(subject, { a: 3, b: 3 })).toEqual({ 'hp-1': 'done', 'hp-2': 'current' });
    expect(lessonStates(subject, {})).toEqual({ 'hp-1': 'current', 'hp-2': 'locked' });
  });
  it('inProgressLesson: đã học ít nhất 1 khái niệm và chưa xong', () => {
    expect(inProgressLesson(subject, { a: 1 })?.id).toBe('hp-1');
    expect(inProgressLesson(subject, {})).toBeNull();
    expect(inProgressLesson(subject, { a: 3, b: 3 })).toBeNull();
    expect(inProgressLesson(subject, { a: 3 })?.id).toBe('hp-1'); // đã bắt đầu, chưa xong
  });
  it('currentLesson: đợt đầu khi chưa học; null khi học hết', () => {
    expect(currentLesson(subject, {})?.id).toBe('hp-1');
    expect(currentLesson(subject, { a: 3, b: 3, c: 4, d: 6 })).toBeNull();
  });
});

describe('lessonGate', () => {
  it('đếm khái niệm chưa đạt bậc 3 của đợt; xong khi không còn khái niệm nào', () => {
    expect(lessonGate(['a', 'b', 'c'], { a: 3, b: 1 })).toEqual({ done: false, remaining: 2, total: 3 });
    expect(lessonGate(['a', 'b'], { a: 3, b: 4 })).toEqual({ done: true, remaining: 0, total: 2 });
  });
});
