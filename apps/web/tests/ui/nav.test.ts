import { describe, expect, it } from 'vitest';
import { NAV, activeNav } from '$lib/ui/nav';

describe('NAV', () => {
  it('đúng 4 mục, matches phủ hết RouteName ngoài phiên', () => {
    expect(NAV).toHaveLength(4);
    const covered = NAV.flatMap((n) => n.matches);
    for (const r of ['home', 'subjects', 'subject', 'quizzes', 'profile', 'settings'] as const) expect(covered).toContain(r);
  });
  it('activeNav: subject → Môn học, settings → Hồ sơ, lesson → null', () => {
    expect(activeNav('subject')).toBe('subjects');
    expect(activeNav('settings')).toBe('profile');
    expect(activeNav('lesson')).toBeNull();
  });
  it('mọi mục có nhãn chữ và href dạng hash', () => {
    for (const n of NAV) { expect(n.label.length).toBeGreaterThan(2); expect(n.href.startsWith('#/')).toBe(true); }
  });
});
