<!-- Cây tán tròn nhiều lớp, thân nâu, có điểm sáng. (x, y) là gốc cây. -->
<script lang="ts">
  let { x, y, s = 1 }: { x: number; y: number; s?: number } = $props();
</script>
<g transform="translate({x} {y}) scale({s})">
  <path class="f-acc2 k" d="M-3 0l1-26l-8-8M2 0l-1-22l7-10" stroke-width="1.2" />
  <path class="f-acc2 k" d="M-4 0h8l-1-30h-6z" stroke-width="1.2" />
  <circle class="f-leaf k" cx="-14" cy="-40" r="14" stroke-width="1.3" />
  <circle class="f-leaf k" cx="14" cy="-42" r="15" stroke-width="1.3" />
  <circle class="f-leaf k" cx="0" cy="-58" r="17" stroke-width="1.3" />
  <path class="f-leaf2" d="M-8-62a8 8 0 0 1 10-6a6 6 0 0 0-6 8zM10-48a6 6 0 0 1 8-4a5 5 0 0 0-5 6zM-20-44a5 5 0 0 1 7-3a4 4 0 0 0-4 5z" />
  <path class="k" d="M-2-46q4 4 8 2M-12-34q3 3 6 1" stroke-width="1" />
</g>
