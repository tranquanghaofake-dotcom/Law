<!-- Đèn lồng treo: dây, thân đỏ có nan, chóp và tua vàng. -->
<script lang="ts">
  let { x, y, len = 14, s = 1 }: { x: number; y: number; len?: number; s?: number } = $props();
</script>
<g transform="translate({x} {y}) scale({s})"><g class="sway">
  <path class="k" d="M0 0v{len}" stroke-width="1.2" />
  <rect class="f-acc k" x="-4" y={len} width="8" height="3" stroke-width="1" />
  <rect class="f-seal k" x="-7" y={len + 3} width="14" height="17" rx="6" stroke-width="1.2" />
  <path class="ks" d="M-3 {len + 4}v15M3 {len + 4}v15" stroke-width=".8" />
  <rect class="f-acc k" x="-4" y={len + 20} width="8" height="3" stroke-width="1" />
  <path class="ka" d="M0 {len + 23}v8M-2 {len + 25}v5M2 {len + 25}v5" stroke-width="1" />
</g></g>
