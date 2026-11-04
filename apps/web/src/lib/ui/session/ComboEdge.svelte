<script lang="ts">
  // Viền màn hình sáng dần theo mốc chuỗi đúng 1·2·3·5·8·13; sai (chuỗi 0) thì tắt dịu.
  import { reducedMotion } from '$lib/fx/confetti';
  import { edgeGlow, fireTheme, GLOW_MILESTONES, type EdgeGlow } from './combo';

  let { combo = 0 }: { combo?: number } = $props();
  const spec = $derived(edgeGlow(combo));
  // giữ thông số cuối để lúc tắt dịu vẫn đúng màu/độ dày (chỉ độ mờ về 0)
  // svelte-ignore state_referenced_locally
  let shown = $state<EdgeGlow>(spec);
  $effect(() => { if (spec.level > 0) shown = spec; });
  const c = $derived(fireTheme(shown.level ? GLOW_MILESTONES[shown.level - 1] : 0));
  const rm = $derived(reducedMotion());
</script>

<div
  class="combo-edge"
  class:rm
  class:inter={shown.tier === 'trang-den'}
  data-level={spec.level}
  data-tier={spec.level ? spec.tier : ''}
  aria-hidden="true"
  style="--w:{shown.width}px;--blur:{shown.blur}px;--line:{c.line};--glow:{c.glow};--alt:{c.alt};opacity:{spec.level ? shown.alpha : 0}"
></div>

<style>
  .combo-edge {
    position: fixed; inset: 0; z-index: 60; pointer-events: none;
    box-shadow:
      inset 0 0 0 var(--w) var(--line),
      inset 0 0 var(--blur) calc(var(--w) * 1.6) var(--glow);
    transition: opacity .9s ease, box-shadow .5s ease;
  }
  /* Trắng – đen giao thoa: vòng trắng ngoài, vòng đen trong (thấy được trên cả nền sáng lẫn tối) */
  .combo-edge.inter {
    box-shadow:
      inset 0 0 0 var(--w) var(--line),
      inset 0 0 0 calc(var(--w) * 2) var(--alt),
      inset 0 0 var(--blur) calc(var(--w) * 2.2) var(--glow);
  }
  /* giảm chuyển động: chỉ đổi độ mờ, không chuyển bề dày/quầng */
  .combo-edge.rm { transition: opacity .25s linear; }
</style>
