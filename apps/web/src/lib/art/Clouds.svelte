<!-- Nền chung của mọi tranh: vầng mặt trời có vòng hoa văn trống đồng, mây cuộn, núi xa (tuỳ chọn), mặt đất. -->
<script lang="ts">
  let { sun = true, hills = false, ground = true, cy = 96, r = 74 }: { sun?: boolean; hills?: boolean; ground?: boolean; cy?: number; r?: number } = $props();
  // răng cưa vòng trống đồng: tam giác nhỏ quanh vành
  const teeth = Array.from({ length: 36 }, (_, i) => (i * Math.PI * 2) / 36);
</script>

{#if sun}
  <circle class="f-sun" cx="160" {cy} {r} />
  <g class="s-sunline">
    <circle cx="160" {cy} r={r - 9} />
    <circle cx="160" {cy} r={r - 15} stroke-dasharray="2 4" />
  </g>
  <g class="f-sunline">
    {#each teeth as a (a)}<path d="M{160 + Math.cos(a) * (r - 4)} {cy + Math.sin(a) * (r - 4)}l{Math.cos(a + 1.5) * 2.4} {Math.sin(a + 1.5) * 2.4}l{Math.cos(a) * -4} {Math.sin(a) * -4}z" />{/each}
  </g>
{/if}
{#if hills}
  <path class="f-hill" d="M0 160q30-44 60-30q18-34 46-14q30-30 62 6q34-36 70-4q26-22 52 4q18-6 30 8v40H0z" />
{/if}
<g class="s-line s-thin">
  <path d="M14 70h46a9 9 0 1 0-9-9a5 5 0 1 1 5 5" />
  <path d="M30 84h40a7 7 0 1 0-7-7" />
  <path d="M306 58h-46a9 9 0 1 1 9-9a5 5 0 1 0-5 5" />
  <path d="M292 72h-38a7 7 0 1 1 7-7" />
</g>
{#if ground}
  <g class="f-line">
    <rect x="40" y="186" width="240" height="4" rx="2" />
    <rect x="20" y="194" width="280" height="2" rx="1" />
  </g>
{/if}
