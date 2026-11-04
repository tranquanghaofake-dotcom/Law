<script lang="ts">
  // Hình thu nhỏ/lớn của kỳ quan: nét nền mờ + các nét đã thắp (màu theo bậc, quầng bằng nét dày mờ — không dùng filter).
  // Dùng cho dải "Thắp sáng", overlay mốc 5·8·13 và thẻ cuối phiên. Nét mới (khoá theo chỉ số) vẽ dần khi vừa gắn vào.
  import { reducedMotion } from '$lib/fx/confetti';
  import type { Wonder } from '$lib/fx/wonders';
  import type { GlowTier } from './combo';
  import { strokeColors } from './reward';

  // px: bề rộng hiển thị gần đúng (px) để nét vẽ dày cỡ ~1,6 px màn hình bất kể co giãn (đơn vị = 800 / px).
  let { wonder, lit = [], bold = false, label = '', px = 92 }: { wonder: Wonder; lit?: { i: number; tier: GlowTier }[]; bold?: boolean; label?: string; px?: number } = $props();
  const unit = $derived(800 / Math.max(40, px));
  const rm = $derived(reducedMotion());
  const shown = $derived(lit.filter((l) => wonder.paths[l.i]).map((l) => ({ ...l, d: wonder.paths[l.i], k: strokeColors(l.tier, l.i) })));
</script>

<svg class="wonder-art" class:bold class:rm viewBox={wonder.viewBox} preserveAspectRatio="xMidYMid meet" fill="none" stroke-linecap="round" stroke-linejoin="round" role={label ? 'img' : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : 'true'} focusable="false" style="--u:{unit}px">
  <g class="base">{#each wonder.paths as d, i (i)}<path {d} />{/each}</g>
  <g class="lit">
    {#each shown as s (s.i)}
      <g style="--c:{s.k.line};--g:{s.k.glow}">
        <path class="halo" d={s.d} pathLength="1" />
        <path class="core" d={s.d} pathLength="1" />
      </g>
    {/each}
  </g>
</svg>

<style>
  .wonder-art { display: block; width: 100%; height: 100%; overflow: visible; }
  .base path { stroke: var(--ink, #14213d); stroke-width: calc(var(--u) * 0.7); opacity: .26; }
  .core { stroke: var(--c); stroke-width: calc(var(--u) * 1.35); opacity: .95; }
  .halo { stroke: var(--g); stroke-width: calc(var(--u) * 3.4); opacity: .28; }
  .bold .base path { stroke-width: calc(var(--u) * 1); opacity: .28; }
  .bold .core { stroke-width: calc(var(--u) * 2.4); opacity: 1; }
  .bold .halo { stroke-width: calc(var(--u) * 8); opacity: .4; }
  .lit path { stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw .7s ease-out forwards; }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  /* giảm chuyển động: không vẽ dần, nét hiện ngay */
  .rm .lit path { stroke-dasharray: none; stroke-dashoffset: 0; animation: none; }
</style>
