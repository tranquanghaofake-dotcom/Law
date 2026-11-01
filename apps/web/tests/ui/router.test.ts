import { describe, expect, it } from 'vitest';
import { hashFor, parseHash } from '$lib/router.svelte';

describe('parseHash', () => {
  it('#/bo/<id> → quiz (giữ link v1)', () => {
    expect(parseHash('#/bo/dat-coc')).toEqual({ name: 'quiz', params: { id: 'dat-coc' } });
  });
  it('#/hoc/<subject>/<lesson> → lesson', () => {
    expect(parseHash('#/hoc/hien-phap/hp-1')).toEqual({ name: 'lesson', params: { subject: 'hien-phap', lesson: 'hp-1' } });
  });
  it('#/on, #/toi, #/cai-dat', () => {
    expect(parseHash('#/on').name).toBe('review');
    expect(parseHash('#/toi').name).toBe('profile');
    expect(parseHash('#/cai-dat').name).toBe('settings');
  });
  it('hash lạ hoặc rỗng → home', () => {
    expect(parseHash('#/khong-co')).toEqual({ name: 'home', params: {} });
    expect(parseHash('')).toEqual({ name: 'home', params: {} });
  });
  it('#/mon, #/mon/<id>, #/luyen-de', () => {
    expect(parseHash('#/mon')).toEqual({ name: 'subjects', params: {} });
    expect(parseHash('#/mon/hien-phap')).toEqual({ name: 'subject', params: { subject: 'hien-phap' } });
    expect(parseHash('#/luyen-de')).toEqual({ name: 'quizzes', params: {} });
  });
  it('#/on/<subject> → review theo môn; #/on vẫn ôn tất cả', () => {
    expect(parseHash('#/on/hien-phap')).toEqual({ name: 'review', params: { subject: 'hien-phap' } });
    expect(parseHash('#/on')).toEqual({ name: 'review', params: {} });
  });
  it('hashFor đảo ngược parseHash cho route mới', () => {
    for (const h of ['#/mon', '#/mon/hien-phap', '#/luyen-de', '#/on/hien-phap']) {
      const r = parseHash(h);
      expect(hashFor(r.name, r.params)).toBe(h);
    }
  });
});
