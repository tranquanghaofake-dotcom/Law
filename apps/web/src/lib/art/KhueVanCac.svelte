<!-- Gác hai tầng mái cong, cửa sổ tròn toả tia (cảm hứng Khuê Văn Các — không phải bản vẽ kiến trúc). -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  const spokes = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
</script>

<Clouds />
<!-- bệ, bậc -->
<rect class="f-card s-line" x="78" y="172" width="164" height="14" />
<path class="s-line s-thin" d="M78 179h164" />
<!-- tầng dưới: trụ gạch + ba vòm -->
<rect class="f-card s-line" x="92" y="124" width="136" height="48" />
<g class="f-void">
  <path d="M110 172v-26a13 13 0 0 1 26 0v26z" />
  <path d="M147 172v-28a13 13 0 0 1 26 0v28z" />
  <path d="M184 172v-26a13 13 0 0 1 26 0v26z" />
</g>
<path class="s-line s-thin" d="M92 132h136M100 140v26M220 140v26" />
<!-- mái dưới, đầu đao cong -->
<path class="f-seal s-line" d="M58 110q12 14 26 14h152q14 0 26-14q-20 6-44-2h-116q-24 8-44 2z" />
<path class="s-line s-thin s-paper" d="M96 116h128M106 112l-4 10M128 110v12M150 110v12M170 110v12M192 110v12M214 112l4 10" />
<path class="s-line s-bold" d="M104 108h112" />
<!-- tầng trên: lan can + cửa sổ tròn -->
<rect class="f-card s-line" x="116" y="72" width="88" height="36" />
<path class="s-line s-thin" d="M116 101h88M124 101v7M134 101v7M186 101v7M196 101v7" />
<circle class="f-void" cx="160" cy="88" r="13" />
<g class="s-line s-paper s-thin">
  {#each spokes as a (a)}<path d="M{160 + Math.cos(a) * 4} {88 + Math.sin(a) * 4}L{160 + Math.cos(a) * 11} {88 + Math.sin(a) * 11}" />{/each}
  <circle cx="160" cy="88" r="4" />
</g>
<!-- mái trên -->
<path class="f-seal s-line" d="M90 60q10 12 22 12h96q12 0 22-12q-16 5-36-3h-68q-20 8-36 3z" />
<path class="s-line s-bold" d="M126 56h68" />
<path class="s-line" d="M126 56q-6-4-2-10M194 56q6-4 2-10" />
<circle class="f-acc s-line" cx="160" cy="48" r="5" />
<path class="s-line s-thin" d="M160 43v-5" />
<!-- đèn lồng treo ở đầu đao -->
<g class="s-line s-thin"><path d="M94 62v12M226 62v12" /></g>
<g class="f-seal s-line s-thin">
  <rect x="89" y="74" width="10" height="13" rx="4" />
  <rect x="221" y="74" width="10" height="13" rx="4" />
</g>
