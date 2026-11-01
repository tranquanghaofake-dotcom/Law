<!-- Lá sen nổi: elip có khía + gân. -->
<script lang="ts">
  let { x, y, r = 16 }: { x: number; y: number; r?: number } = $props();
  const ry = $derived(r * 0.36);
</script>
<g transform="translate({x} {y})">
  <path class="f-leaf k" d="M0 0L{r * 0.95} {-ry * 0.3}A{r} {ry} 0 1 1 {r * 0.95} {ry * 0.3}z" stroke-width="1.2" />
  <path class="kp" d="M0 0L{-r * 0.7} {-ry * 0.5}M0 0L{-r * 0.75} {ry * 0.4}M0 0L{-r * 0.1} {ry * 0.9}M0 0L{r * 0.4} {ry * 0.75}" stroke-width=".8" />
</g>
