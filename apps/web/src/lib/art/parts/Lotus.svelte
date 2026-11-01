<!-- Hoa sen: thân + ba lớp cánh + đài vàng. (x, y) là gốc hoa; s là tỉ lệ. -->
<script lang="ts">
  let { x, y, s = 1, stem = 22 }: { x: number; y: number; s?: number; stem?: number } = $props();
</script>
<g transform="translate({x} {y}) scale({s})">
  <path class="k" d="M0 0v{stem}" stroke-width="1.6" />
  <path class="f-lotus k" d="M0 0c-13-3-20-15-16-29c7 4 12 13 16 23c4-10 9-19 16-23c4 14-3 26-16 29z" stroke-width="1.3" />
  <path class="f-lotus2 k" d="M0 0c-6-8-7-20 0-32c7 12 6 24 0 32z" stroke-width="1.3" />
  <path class="k" d="M-9-6c-6-2-11-7-13-13M9-6c6-2 11-7 13-13" stroke-width=".9" />
  <path class="f-acc k" d="M-4-28q4-6 8 0z" stroke-width=".9" />
</g>
