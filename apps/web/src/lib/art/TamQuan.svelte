<!-- Cổng tam quan: ba lối, cổng giữa hai tầng mái, câu đối, hoành phi, cánh cửa đinh (cách điệu). Khung 520×325. -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  import Tree from './parts/Tree.svelte';
  import Lantern from './parts/Lantern.svelte';
  import { bricks, tiles, balustrade } from './kit';
  let studs = ''; for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) studs += `M${245 + c * 6} ${236 + r * 12}h.1M${269 + c * 6} ${236 + r * 12}h.1`;
</script>

<Clouds cy={140} r={116} puffs={false} />
<Tree x={40} y={301} s={0.95} /><Tree x={482} y={301} s={0.9} />
<!-- hai cổng bên -->
{#each [96, 344] as x (x)}
  <rect class="f-card" x={x} y="206" width="80" height="95" />
  <rect class="f-shade" x={x + 56} y="206" width="24" height="95" />
  <path class="kw" d={bricks(x, 206, 80, 95, 9, 20)} stroke-width="1" />
  <rect class="k" x={x} y="206" width="80" height="95" stroke-width="1.8" />
  <path class="f-void ka" d="M{x + 24} 301v-40a16 16 0 0 1 32 0v40z" stroke-width="2.2" />
  <path class="f-seal k" d="M{x - 14} 190q8 16 22 16h64q14 0 22-16q-18 6-36 0h-36q-18 6-36 0z" stroke-width="1.8" />
  <path class="ks" d={tiles(x - 2, x + 82, 193, 203, 7, 0.05)} stroke-width="1.3" />
  <path class="ka" d="M{x + 22} 189h36" stroke-width="4" />
{/each}
<!-- cổng giữa -->
<rect class="f-card" x="186" y="150" width="148" height="151" />
<rect class="f-shade" x="296" y="150" width="38" height="151" />
<path class="kw" d={bricks(186, 150, 148, 151, 9, 22)} stroke-width="1" />
<rect class="k" x="186" y="150" width="148" height="151" stroke-width="2" />
<!-- câu đối hai bên -->
<g class="f-cream k" stroke-width="1.4"><rect x="198" y="192" width="14" height="96" /><rect x="308" y="192" width="14" height="96" /></g>
<path class="ks" d="M202 200h6M202 212h6M202 224h6M202 236h6M202 248h6M202 260h6M202 272h6M312 200h6M312 212h6M312 224h6M312 236h6M312 248h6M312 260h6M312 272h6" stroke-width="1.6" />
<!-- vòm lớn + cánh cửa đinh -->
<path class="f-void ka" d="M232 301v-62a28 28 0 0 1 56 0v62z" stroke-width="2.6" />
<path class="f-seal2 k" d="M240 301v-70h19v70zM261 301v-70h19v70z" stroke-width="1.2" />
<path class="ka" d={studs} stroke-width="2.6" />
<!-- hoành phi -->
<rect class="f-acc k" x="226" y="166" width="68" height="18" stroke-width="1.6" />
<path class="k" d="M236 175h48" stroke-width="1.4" stroke-dasharray="5 3" />
<!-- mái dưới cổng giữa -->
<path class="f-seal k" d="M160 136q12 18 30 18h140q18 0 30-18q-26 8-56-2h-88q-30 10-56 2z" stroke-width="2" />
<path class="ks" d={tiles(178, 342, 140, 152, 8, 0.05)} stroke-width="1.4" />
<path class="ka" d="M206 132h108" stroke-width="5" />
<path class="ka" d="M160 136q-6-8 0-14q6-1 7 5M360 136q6-8 0-14q-6-1-7 5" stroke-width="2.6" />
<!-- tầng giữa -->
<rect class="f-cream k" x="206" y="112" width="108" height="20" stroke-width="1.6" />
<path class="k" d={balustrade(206, 118, 108, 10, 7)} stroke-width="1" />
<!-- mái trên -->
<path class="f-seal k" d="M184 100q10 16 26 16h100q16 0 26-16q-22 7-46-2h-60q-24 9-46 2z" stroke-width="2" />
<path class="ks" d={tiles(200, 320, 104, 114, 8, 0.06)} stroke-width="1.4" />
<path class="ka" d="M222 96h76" stroke-width="5" />
<path class="ka" d="M222 96q-12-5-7-18q7-5 12 2q-2 6-8 5M298 96q12-5 7-18q-7-5-12 2q2 6 8 5" stroke-width="2.6" />
<path class="f-acc k" d="M260 66c-6 8-8 14-5 20h10c3-6 1-12-5-20z" stroke-width="1.4" />
<circle class="f-seal ka" cx="260" cy="90" r="6.5" stroke-width="2.4" />
<Lantern x={184} y={100} len={12} s={0.8} /><Lantern x={336} y={100} len={12} s={0.8} />
