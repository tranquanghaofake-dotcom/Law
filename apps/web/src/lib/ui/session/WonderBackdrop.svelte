<script lang="ts">
  // Nền phiên học: kỳ quan Việt Nam vẽ line-art lớn, mờ; mỗi câu đúng làm sáng thêm vài nét (vẽ dần) với màu theo bậc.
  // Hết phiên: mọi nét còn lại sáng nốt (vàng).
  import { reducedMotion } from '$lib/fx/confetti';
  import type { Wonder } from '$lib/fx/wonders';
  import { COMBO_COLORS, type GlowTier } from './combo';

  let { wonder = null, lit = [], complete = false }: { wonder?: Wonder | null; lit?: { i: number; tier: GlowTier }[]; complete?: boolean } = $props();
  const rm = reducedMotion();
  const FINAL = { line: '#d9a21e', glow: '#f2c14e', alt: '#d9a21e' };

  const shown = $derived.by(() => {
    if (!wonder) return [];
    const by = new Map<number, GlowTier | 'final'>(lit.map((l) => [l.i, l.tier]));
    const out: { i: number; d: string; tier: GlowTier | 'final'; late: boolean }[] = [];
    wonder.paths.forEach((d, i) => {
      const t = by.get(i);
      if (t) out.push({ i, d, tier: t, late: false });
      else if (complete) out.push({ i, d, tier: 'final', late: true });
    });
    return out;
  });
  function col(tier: GlowTier | 'final', i: number) {
    const c = tier === 'final' ? FINAL : COMBO_COLORS[tier];
    // Trắng – đen: nét chẵn đen, nét lẻ trắng, quầng ngược màu → thấy được trên mọi nền
    if (tier === 'trang-den') return i % 2 ? { line: c.line, glow: c.alt } : { line: c.alt, glow: c.line };
    return { line: c.line, glow: c.glow };
  }
</script>

{#if wonder}
  <div class="wonder" class:rm aria-hidden="true" data-wonder={wonder.id}>
    <svg viewBox={wonder.viewBox} preserveAspectRatio="xMidYMid meet" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g class="base">{#each wonder.paths as d, i (i)}<path {d} />{/each}</g>
      <g class="lit">
        {#each shown as s (s.i)}
          {@const k = col(s.tier, s.i)}
          <g style="--c:{k.line};--g:{k.glow};--d:{s.late ? (0.2 + (s.i % 24) * 0.05).toFixed(2) : 0}s" class:late={s.late}>
            <path class="halo" d={s.d} pathLength="1" />
            <path class="core" d={s.d} pathLength="1" />
          </g>
        {/each}
      </g>
    </svg>
  </div>
{/if}

<style>
  .wonder { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
  svg {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    width: min(max(100vw, 680px), calc(100vh * 1.25)); height: auto; overflow: visible;
  }
  .base path { stroke: var(--ink, #14213d); stroke-width: 1.5; opacity: .13; }
  .lit path { stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw .9s ease-out var(--d, 0s) forwards; }
  .core { stroke: var(--c); stroke-width: 2.2; opacity: .8; }
  .halo { stroke: var(--g); stroke-width: 7; opacity: .22; }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  /* giảm chuyển động: không vẽ dần, chỉ đổi độ mờ */
  .rm .lit path { stroke-dasharray: none; stroke-dashoffset: 0; animation: fade .3s linear var(--d, 0s) backwards; }
  @keyframes fade { from { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .lit path { stroke-dasharray: none; stroke-dashoffset: 0; animation: fade .3s linear var(--d, 0s) backwards; }
  }
</style>
