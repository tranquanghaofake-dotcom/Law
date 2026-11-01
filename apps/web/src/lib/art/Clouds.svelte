<!-- Nền chung của tranh (khung 520×325): mặt trời là mặt trống đồng (vành răng, vòng chấm, chim lạc, sao giữa), mây khối, núi xa tuỳ chọn, mặt đất có cỏ. -->
<script lang="ts">
  import { ring, star, around } from './kit';
  import Puff from './parts/Puff.svelte';
  import Bird from './parts/Bird.svelte';
  let { cy = 148, r = 120, sun = true, hills = false, ground = true, puffs = true }: { cy?: number; r?: number; sun?: boolean; hills?: boolean; ground?: boolean; puffs?: boolean } = $props();
  const birds = $derived(around(260, cy, r - 34, 10));
</script>

{#if sun}
  <circle class="f-sun" cx="260" {cy} {r} />
  <g class="sun-spin">
    <path class="f-sunline" d={ring(260, cy, r - 13, r - 4, 52)} />
    <circle class="kg" cx="260" {cy} r={r - 17} stroke-width="1.6" />
    <circle class="kg" cx="260" {cy} r={r - 22} stroke-width="1.4" stroke-dasharray="1 5" />
    <g class="f-sunline">{#each birds as b (b.deg)}<Bird x={b.x} y={b.y} deg={b.deg} s={1.1} />{/each}</g>
  </g>
  <circle class="kg" cx="260" {cy} r={r - 46} stroke-width="1.4" />
  <path class="f-sunline" d={star(260, cy, r * 0.42, r * 0.15, 14)} opacity=".55" />
{/if}
{#if hills}
  <path class="f-hill" d="M0 262c30-40 64-58 96-40c26-30 60-34 88-6c34-34 84-30 116 4c36-30 86-34 118 2c30-18 72-12 102 16v62H0z" />
{/if}
<g class="k drift" stroke-width="1.6">
  <path d="M18 92h74a12 12 0 1 0-12-12a7 7 0 1 1 7 7M40 110h52a9 9 0 1 0-9-9" />
  <path d="M502 78h-74a12 12 0 1 1 12-12a7 7 0 1 0-7 7M480 96h-52a9 9 0 1 1 9-9" />
</g>
{#if puffs}<Puff x={78} y={250} s={1} /><Puff x={444} y={244} s={0.9} flip />{/if}
{#if ground}
  <rect class="f-line" x="40" y="301" width="440" height="5" rx="2.5" />
  <rect class="f-line" x="14" y="313" width="492" height="3" rx="1.5" />
  <path class="k" d="M62 301l-3-7M66 301l1-8M70 301l4-6M448 301l-3-7M452 301l1-8M456 301l4-6M120 313l-2-5M123 313l1-6M396 313l-2-5M399 313l1-6" stroke-width="1.1" />
{/if}
