<script lang="ts">
  // Bộ đếm XP của phiên: đổi số thì đếm lên mượt (chỉ đổi chữ). Giảm chuyển động: hiện số ngay.
  import { onDestroy } from 'svelte';
  import { reducedMotion } from '$lib/fx/confetti';
  import { countAt } from './reward';

  let { value = 0 }: { value?: number } = $props();
  // svelte-ignore state_referenced_locally
  let shown = $state(value);
  let bump = $state(false);
  let raf = 0;
  let bumpTimer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    const to = value;
    const from = shown;
    cancelAnimationFrame(raf);
    if (to === from) return;
    if (reducedMotion() || typeof requestAnimationFrame === 'undefined') { shown = to; return; }
    bump = true; clearTimeout(bumpTimer); bumpTimer = setTimeout(() => (bump = false), 420);
    const t0 = performance.now();
    const step = (t: number) => {
      const p = (t - t0) / 450;
      shown = countAt(from, to, p);
      if (p < 1) raf = requestAnimationFrame(step); else shown = to;
    };
    raf = requestAnimationFrame(step);
  });
  onDestroy(() => { cancelAnimationFrame(raf); clearTimeout(bumpTimer); });
</script>

<span class="xp-chip" class:bump aria-label="XP phiên này: {value}"><b>{shown}</b> XP</span>

<style>
  .xp-chip { flex: none; font-size: var(--fs-sm); font-weight: 700; color: var(--accent-text, var(--ink)); font-variant-numeric: tabular-nums; min-width: 52px; text-align: right; transform-origin: 100% 50%; }
  .xp-chip b { font-weight: 800; }
  .bump { animation: xp-bump .42s cubic-bezier(.3, 1.6, .5, 1); }
  @keyframes xp-bump { 0% { transform: scale(1); } 40% { transform: scale(1.28); } 100% { transform: scale(1); } }
</style>
