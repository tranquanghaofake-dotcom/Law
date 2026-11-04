import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPref, setPref, purgeLegacyPrefs, PREF_DEFAULT } from '$lib/ui/session/prefs';

afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

describe('prefs (localStorage)', () => {
  it('mặc định: đoán trước tắt', () => {
    expect(PREF_DEFAULT).toEqual({ pretest: false });
    expect(getPref('pretest')).toBe(false);
  });
  it('lưu và đọc lại', () => {
    setPref('pretest', true);
    expect(getPref('pretest')).toBe(true);
  });
  it('localStorage ném lỗi thì rơi về mặc định, không ném', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('chặn'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('chặn'); });
    expect(getPref('pretest')).toBe(false);
    expect(() => setPref('pretest', true)).not.toThrow();
    expect(() => purgeLegacyPrefs()).not.toThrow();
  });
  it('purgeLegacyPrefs xoá khoá độ tự tin cũ, giữ khoá khác', () => {
    localStorage.setItem('ll.pref.confidence', '1');
    setPref('pretest', true);
    purgeLegacyPrefs();
    expect(localStorage.getItem('ll.pref.confidence')).toBeNull();
    expect(getPref('pretest')).toBe(true);
  });
});
