<script lang="ts">
  // Mốc 5·8·13: phủ toàn màn hình kỳ quan sáng rực ~1,2 s rồi mờ dần. Bấm để bỏ qua. Chỉ animate opacity/transform.
  import { onDestroy, onMount } from 'svelte';
  import type { Wonder } from '$lib/fx/wonders';
  import type { GlowTier } from './combo';
  import { litPercent, TIMING } from './reward';
  import WonderArt from './WonderArt.svelte';

  let { wonder, lit, onend }: { wonder: Wonder; lit: { i: number; tier: GlowTier }[]; onend: () => void } = $props();
  const innerWidth = typeof window === 'undefined' ? 760 : window.innerWidth;
  const pct = $derived(litPercent(lit.length, wonder.paths.length));
  let timer: ReturnType<typeof setTimeout> | undefined;
  let done = false;
  function finish() { if (done) return; done = true; clearTimeout(timer); onend(); }
  onMount(() => { timer = setTimeout(finish, TIMING.flashTotal); });
  onDestroy(() => clearTimeout(timer));
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="wonder-flash" aria-hidden="true" onclick={finish} style="--dur:{TIMING.flashTotal}ms">
  <div class="art"><WonderArt {wonder} {lit} bold px={Math.min(760, innerWidth * 0.92)} /></div>
  <p class="cap"><b>Đã thắp sáng {pct}%</b> · {wonder.name} <span>{wonder.place}</span></p>
  <p class="skip">Chạm để bỏ qua</p>
</div>

<style>
  .wonder-flash {
    position: fixed; inset: 0; z-index: 70; display: grid; place-content: center; justify-items: center; gap: var(--sp-3);
    background: color-mix(in srgb, var(--paper) 88%, #fff7df); cursor: pointer; padding: var(--sp-4);
    animation: flash-life var(--dur) ease both;
  }
  .art { width: min(92vw, 760px); aspect-ratio: 4 / 3; max-height: 62vh; }
  .cap { margin: 0; font-size: var(--fs-lg); text-align: center; }
  .cap span { display: block; font-size: var(--fs-sm); color: var(--muted); }
  .skip { margin: 0; font-size: var(--fs-xs); color: var(--muted); }
  @keyframes flash-life { 0% { opacity: 0; } 14% { opacity: 1; } 68% { opacity: 1; } 100% { opacity: 0; } }
</style>
