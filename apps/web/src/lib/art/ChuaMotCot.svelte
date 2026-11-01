<!-- Điện thờ trên một cột đá giữa hồ sen, có bậc lên, lan can, cửa bức bàn (cảm hứng Chùa Một Cột — cách điệu). Khung 520×325. -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  import Tree from './parts/Tree.svelte';
  import Lotus from './parts/Lotus.svelte';
  import Pad from './parts/Pad.svelte';
  import { tiles, balustrade, ripples } from './kit';
  let steps = 'M96 262'; for (let i = 0; i < 9; i++) steps += `h10v-7`; steps += 'h8v7h-8';
  for (let i = 0; i < 9; i++) steps += `v7h-10`; steps += 'z';
</script>

<Clouds cy={132} r={112} ground={false} puffs={false} />
<!-- bờ + cây phía sau -->
<path class="f-hill" d="M0 262q40-18 90-14q30 2 40 14zM520 262q-40-16-96-10q-24 3-34 10z" />
<Tree x={52} y={258} s={1} /><Tree x={474} y={256} s={0.85} />
<!-- hồ -->
<path class="f-water" d="M0 258q130-12 260-6t260 6v67H0z" />
<path class="kw" d={ripples(8, 270, 504, 6, 3)} stroke-width="1.3" />
<!-- cột đá + phản chiếu -->
<rect class="f-card k" x="250" y="210" width="20" height="74" stroke-width="1.8" />
<rect class="f-shade" x="262" y="212" width="7" height="71" />
<path class="k" d="M250 228h20M250 246h20M250 264h20" stroke-width="1.1" />
<path class="kw" d="M254 290v10M266 292v16M260 312v8" stroke-width="1.6" />
<!-- giá đỡ chéo -->
<path class="k" d="M260 226l-52-18M260 226l52-18M260 218l-36-12M260 218l36-12" stroke-width="2" />
<!-- sàn + lan can -->
<rect class="f-seal2 k" x="196" y="198" width="128" height="10" stroke-width="1.8" />
<rect class="f-cream k" x="200" y="186" width="120" height="12" stroke-width="1.4" />
<path class="k" d={balustrade(200, 186, 120, 12, 7)} stroke-width="1" />
<!-- điện thờ -->
<rect class="f-seal k" x="214" y="146" width="92" height="40" stroke-width="1.8" />
<g class="f-void ka" stroke-width="1.2">
  <rect x="222" y="154" width="20" height="32" /><rect x="250" y="152" width="20" height="34" /><rect x="278" y="154" width="20" height="32" />
</g>
<path class="ka" d="M232 154v32M222 166h20M222 176h20M260 152v34M250 164h20M250 175h20M288 154v32M278 166h20M278 176h20" stroke-width=".9" />
<path class="ka" d="M216 146v40M304 146v40" stroke-width="2" />
<!-- mái -->
<path class="f-seal k" d="M172 112q16 28 42 28h92q26 0 42-28q-30 10-62-4h-52q-32 14-62 4z" stroke-width="2" />
<path class="ks" d={tiles(194, 326, 118, 136, 8, 0.07)} stroke-width="1.4" />
<path class="ks" d="M186 124q12 12 28 14h92q16-2 28-14" stroke-width="2.4" />
<rect class="f-seal2 k" x="212" y="140" width="96" height="6" stroke-width="1.4" />
<path class="ka" d="M226 106h68" stroke-width="5" />
<!-- lưỡng long chầu nguyệt -->
<path class="ka" d="M230 106q-10-4-8-14q4-8 12-6q6 2 4 8q-2 3-6 2M290 106q10-4 8-14q-4-8-12-6q-6 2-4 8q2 3 6 2" stroke-width="2.4" />
<path class="ka" d="M172 112q-6-9 1-15q6 0 6 6M348 112q6-9-1-15q-6 0-6 6" stroke-width="2.6" />
<circle class="f-seal ka" cx="260" cy="92" r="7" stroke-width="2.4" />
<path class="f-acc k" d="M260 70c-5 7-6 12-4 16h8c2-4 1-9-4-16z" stroke-width="1.3" />
<!-- bậc lên chùa -->
<path class="f-card k" d={steps} stroke-width="1.5" />
<path class="k" d="M96 248l94-56M100 252l92-56" stroke-width="1.4" />
<path class="k" d="M106 252v-10M126 240v-10M146 228v-10M166 216v-10M186 204v-10" stroke-width="1.1" />
<!-- sen -->
<Pad x={40} y={286} r={22} /><Pad x={120} y={304} r={18} /><Pad x={200} y={292} r={14} /><Pad x={330} y={300} r={18} /><Pad x={410} y={284} r={22} /><Pad x={478} y={308} r={16} />
<Lotus x={64} y={282} s={1} stem={6} /><Lotus x={150} y={300} s={0.7} stem={4} /><Lotus x={436} y={280} s={1.05} stem={6} /><Lotus x={360} y={296} s={0.75} stem={4} />
