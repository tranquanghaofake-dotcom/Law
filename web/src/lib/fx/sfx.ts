import { Howl } from 'howler';
import { settings } from '$lib/store/settings.svelte';

/** Âm thanh Kenney Interface Sounds (CC0), xem static/sfx/LICENSE.txt. */
export type SfxName = 'correct' | 'wrong' | 'levelup' | 'combo' | 'select' | 'rankup' | 'intro' | 'exit';

const FILES: Record<SfxName, string> = {
  correct: 'confirmation_001',
  wrong: 'error_004',
  levelup: 'bong_001',
  combo: 'glass_004',
  select: 'select_001',
  rankup: 'maximize_006',
  intro: 'question_003',
  exit: 'drop_002',
};

const base = `${import.meta.env.BASE_URL ?? '/'}sfx/`;
const cache = new Map<SfxName, Howl>();

function howl(name: SfxName): Howl {
  let h = cache.get(name);
  if (!h) {
    h = new Howl({ src: [`${base}${FILES[name]}.ogg`], preload: true, volume: 0.6 });
    cache.set(name, h);
  }
  return h;
}

export const sfx = {
  preload(): void {
    for (const n of Object.keys(FILES) as SfxName[]) howl(n);
  },
  /** `combo` = số đúng liên tiếp; cao độ tăng 4%/bậc, tối đa 6 bậc. */
  play(name: SfxName, opts: { combo?: number } = {}): void {
    if (!settings.sound) return;
    try {
      const h = howl(name);
      const id = h.play();
      if (name === 'correct') h.rate(1 + Math.min(opts.combo ?? 0, 6) * 0.04, id);
    } catch { /* autoplay bị chặn: bỏ qua */ }
  },
};
