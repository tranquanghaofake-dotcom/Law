<!-- Mây khối (cát tường): đường viền gợn + xoắn trong. flip để lật ngang. -->
<script lang="ts">
  let { x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean } = $props();
</script>
<g transform="translate({x} {y}) scale({flip ? -s : s} {s})">
  <path class="f-card k" d="M-46 0c-4-12 8-22 20-17c2-14 22-20 32-8c8-11 28-8 30 7c12-2 18 10 12 18z" stroke-width="1.5" />
  <path class="k" d="M-28-6a6 6 0 1 1 6-6a3 3 0 1 1-3 3M6-10a7 7 0 1 1 7-7a3.5 3.5 0 1 1-3.5 3.5M30-4a5 5 0 1 1 5-5" stroke-width="1.2" />
  <path class="k" d="M-58 6h38M-30 11h22" stroke-width="1.2" />
</g>
