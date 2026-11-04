// Hạt sáng bung từ chính nút đáp án đúng, màu theo bậc chuỗi. Dùng canvas-confetti (đã có), tắt khi giảm chuyển động.
import confetti from 'canvas-confetti';
import { reducedMotion } from './confetti';
import { COMBO_COLORS, type GlowTier } from '$lib/ui/session/combo';

export function sparkColors(tier: GlowTier): string[] {
  const c = COMBO_COLORS[tier];
  return tier === 'trang-den' ? ['#ffffff', c.glow, '#f2c14e', '#050507'] : [c.line, c.glow, '#ffffff'];
}

/** Bung `count` hạt từ điểm (x, y) toạ độ viewport. */
export function sparks(x: number, y: number, tier: GlowTier, count = 18): void {
  if (typeof window === 'undefined' || reducedMotion()) return;
  confetti({
    particleCount: count, spread: 70, startVelocity: 22, gravity: 0.9, decay: 0.9, ticks: 60, scalar: 0.7,
    shapes: ['circle'], colors: sparkColors(tier), disableForReducedMotion: true,
    origin: { x: Math.min(1, Math.max(0, x / window.innerWidth)), y: Math.min(1, Math.max(0, y / window.innerHeight)) },
  });
}

/** Confetti nhẹ cho khoảnh khắc đóng dấu (mốc 5 và 10+): hai dòng từ hai bên, màu bậc. */
export function stampConfetti(tier: GlowTier, heavy: boolean): void {
  if (typeof window === 'undefined' || reducedMotion()) return;
  const colors = sparkColors(tier);
  const n = heavy ? 36 : 24;
  confetti({ particleCount: n, angle: 60, spread: 55, origin: { x: 0.05, y: 0.75 }, colors, scalar: 0.85, ticks: 110, disableForReducedMotion: true });
  confetti({ particleCount: n, angle: 120, spread: 55, origin: { x: 0.95, y: 0.75 }, colors, scalar: 0.85, ticks: 110, disableForReducedMotion: true });
}
