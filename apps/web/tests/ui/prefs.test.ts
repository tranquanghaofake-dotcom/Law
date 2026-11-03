import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPref, setPref, PREF_DEFAULT } from '$lib/ui/session/prefs';

afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

describe('prefs (localStorage)', () => {
  it('mặc định: độ tự tin bật, đoán trước tắt', () => {
    expect(PREF_DEFAULT).toEqual({ confidence: true, pretest: false });
    expect(getPref('confidence')).toBe(true);
    expect(getPref('pretest')).toBe(false);
  });
  it('lưu và đọc lại', () => {
    setPref('pretest', true);
    setPref('confidence', false);
    expect(getPref('pretest')).toBe(true);
    expect(getPref('confidence')).toBe(false);
  });
  it('localStorage ném lỗi thì rơi về mặc định, không ném', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('chặn'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('chặn'); });
    expect(getPref('confidence')).toBe(true);
    expect(() => setPref('confidence', false)).not.toThrow();
  });
});
