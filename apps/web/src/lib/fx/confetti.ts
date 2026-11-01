import confetti from 'canvas-confetti';
import { settings } from '$lib/store/settings.svelte';

export function reducedMotion(): boolean {
  if (settings.reducedMotion === 'on') return true;
  if (settings.reducedMotion === 'off') return false;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function colors(): string[] {
  const css = getComputedStyle(document.documentElement);
  return [css.getPropertyValue('--accent').trim() || '#d97a1e', css.getPropertyValue('--seal').trim() || '#b3261e', '#f2c14e'];
}

export function burst(kind: 'small' | 'levelup' | 'rankup'): void {
  if (typeof document === 'undefined' || reducedMotion()) return;
  const c = colors();
  if (kind === 'small') confetti({ particleCount: 24, spread: 45, startVelocity: 25, origin: { y: 0.7 }, colors: c, scalar: 0.8, ticks: 90 });
  else if (kind === 'levelup') confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: c, ticks: 140 });
  else {
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors: c, ticks: 200 });
    setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 }, colors: c }), 250);
    setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 }, colors: c }), 250);
  }
}
