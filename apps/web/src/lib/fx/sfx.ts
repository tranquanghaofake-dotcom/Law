import { Howl } from 'howler';
import { settings } from '$lib/store/settings.svelte';
import { comboSfxPlan } from './comboSfx';

/** Âm thanh Kenney Interface Sounds (CC0), xem static/sfx/LICENSE.txt. */
export type SfxName = 'correct' | 'wrong' | 'levelup' | 'select' | 'rankup' | 'intro' | 'exit' | 'golden';

const FILES: Record<SfxName, string> = {
  correct: 'confirmation_001',
  wrong: 'error_004',
  levelup: 'bong_001',
  select: 'select_001',
  rankup: 'maximize_006',
  intro: 'question_003',
  exit: 'drop_002',
  golden: 'glass_004', // cùng tệp glass_004 nhưng cao hơn một quãng 5 (rate 1,5) và phát đôi: nghe khác hẳn
};

const base = `${import.meta.env.BASE_URL ?? '/'}sfx/`;
const cache = new Map<string, Howl>();

function howlFile(file: string): Howl {
  let h = cache.get(file);
  if (!h) {
    h = new Howl({ src: [`${base}${file}.ogg`], preload: true, volume: 0.6 });
    cache.set(file, h);
  }
  return h;
}
const comboTimers = new Set<ReturnType<typeof setTimeout>>();
const howl = (name: SfxName): Howl => howlFile(FILES[name]);

export const sfx = {
  preload(): void {
    for (const n of Object.keys(FILES) as SfxName[]) howl(n);
    for (const c of [1, 2, 3, 5, 8, 13]) for (const l of comboSfxPlan(c)) howlFile(l.file);
  },
  /** `lead` (ms) dời cả dàn âm về sau để khớp lúc dấu mộc chạm giấy. Trả lời đúng với chuỗi `combo`: ghép tệp/tốc độ/độ trễ theo mốc 1/2/3/5/8/13 (xem comboSfx.ts). Tôn trọng settings.sound, kể cả lúc lớp trễ phát. */
  playCombo(combo: number, lead = 0): void {
    if (!settings.sound) return;
    for (const l of comboSfxPlan(combo)) {
      const delay = l.delay + lead;
      const go = () => {
        if (!settings.sound) return;
        try { const h = howlFile(l.file); const id = h.play(); h.rate(l.rate, id); h.volume(l.volume, id); } catch { /* autoplay bị chặn: bỏ qua */ }
      };
      if (delay > 0) {
        const t = setTimeout(() => { comboTimers.delete(t); go(); }, delay);
        comboTimers.add(t);
      } else go();
    }
  },
  /** Huỷ các lớp âm combo còn chờ phát (gọi khi thoát/hết phiên). */
  stopCombo(): void {
    for (const t of comboTimers) clearTimeout(t);
    comboTimers.clear();
  },
  /** Phát hiệu ứng đơn. (Câu đúng trong phiên dùng playCombo.) */
  play(name: SfxName, opts: { combo?: number } = {}): void {
    if (!settings.sound) return;
    try {
      const h = howl(name);
      const id = h.play();
      if (name === 'correct') h.rate(1 + Math.min(opts.combo ?? 0, 6) * 0.04, id);
      if (name === 'golden') { h.rate(1.5, id); setTimeout(() => { try { h.rate(1.9, h.play()); } catch { /* bỏ qua */ } }, 110); }
    } catch { /* autoplay bị chặn: bỏ qua */ }
  },
};
