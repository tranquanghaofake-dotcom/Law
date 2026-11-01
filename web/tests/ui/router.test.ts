import { describe, expect, it } from 'vitest';
import { parseHash } from '$lib/router.svelte';

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
});
