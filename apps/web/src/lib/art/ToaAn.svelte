<!-- Toà nhà xét xử tân cổ điển: trán tường tam giác có cán cân, hàng cột có rãnh, cửa vòm, lan can mái, đèn đường, cây (cách điệu, không phải công trình cụ thể). Khung 520×325. -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  import Tree from './parts/Tree.svelte';
  import { balustrade } from './kit';
  const cols = [200, 226, 250, 270, 294, 320];
  const wins = [86, 116, 146, 360, 390, 420];
</script>

<Clouds cy={136} r={112} puffs={false} />
<Tree x={40} y={301} s={1} /><Tree x={482} y={301} s={0.95} />
<!-- cánh hai bên -->
<rect class="f-card" x="70" y="176" width="118" height="114" /><rect class="f-card" x="332" y="176" width="118" height="114" />
<rect class="f-shade" x="420" y="176" width="30" height="114" /><rect class="f-shade" x="158" y="176" width="30" height="114" />
<g class="k" stroke-width="1.8" fill="none"><rect x="70" y="176" width="118" height="114" /><rect x="332" y="176" width="118" height="114" /></g>
<path class="kw" d="M70 230h118M332 230h118" stroke-width="1" />
<rect class="f-seal2 k" x="64" y="170" width="130" height="7" stroke-width="1.5" /><rect class="f-seal2 k" x="326" y="170" width="130" height="7" stroke-width="1.5" />
<rect class="f-cream k" x="68" y="158" width="122" height="12" stroke-width="1.3" /><rect class="f-cream k" x="330" y="158" width="122" height="12" stroke-width="1.3" />
<path class="k" d={balustrade(68, 158, 122, 12, 7) + balustrade(330, 158, 122, 12, 7)} stroke-width=".9" />
{#each wins as x (x)}
  <path class="f-void k" d="M{x} 222v-26a9 9 0 0 1 18 0v26z" stroke-width="1.4" />
  <path class="kp" d="M{x + 9} 188v34M{x} 206h18" stroke-width=".9" />
  <path class="ka" d="M{x - 3} 196a12 12 0 0 1 24 0" stroke-width="1.6" />
  <rect class="f-void k" x={x} y="244" width="18" height="30" stroke-width="1.4" />
  <path class="kp" d="M{x + 9} 244v30M{x} 258h18" stroke-width=".9" />
  <rect class="f-cream k" x={x - 2} y="274" width="22" height="3" stroke-width="1" />
{/each}
<!-- khối giữa -->
<rect class="f-void" x="186" y="160" width="148" height="130" />
<rect class="f-acc k" x="178" y="150" width="164" height="10" stroke-width="1.6" />
<path class="f-card k" d="M174 150l86-54l86 54z" stroke-width="1.8" />
<path class="k" d="M190 144l70-44l70 44z" stroke-width="1.2" />
<!-- cán cân trong trán tường -->
<circle class="f-cream k" cx="260" cy="128" r="13" stroke-width="1.3" />
<path class="k" d="M260 112v26M252 138h16M244 120h32M244 120l-5 8M244 120l5 8M276 120l-5 8M276 120l5 8" stroke-width="1.2" />
<g class="f-acc k" stroke-width="1"><path d="M237 128h14a7 3 0 0 1-14 0zM269 128h14a7 3 0 0 1-14 0z" /></g>
<circle class="f-acc k" cx="260" cy="112" r="2.4" stroke-width="1" />
<!-- hàng cột có rãnh -->
{#each cols as x (x)}
  <rect class="f-card k" x={x - 6} y="166" width="12" height="118" stroke-width="1.4" />
  <path class="kw" d="M{x - 2} 170v110M{x + 2} 170v110" stroke-width=".8" />
  <rect class="f-cream k" x={x - 9} y="160" width="18" height="6" stroke-width="1.2" />
  <path class="k" d="M{x - 9} 163q-3 0-3-3M{x + 9} 163q3 0 3-3" stroke-width="1" />
  <rect class="f-cream k" x={x - 8} y="284" width="16" height="6" stroke-width="1.2" />
{/each}
<path class="f-seal2 k" d="M252 290v-36a8 8 0 0 1 16 0v36z" stroke-width="1.4" />
<!-- bậc -->
<rect class="f-card k" x="176" y="290" width="168" height="5" stroke-width="1.4" />
<rect class="f-card k" x="160" y="295" width="200" height="6" stroke-width="1.4" />
<!-- đèn đường -->
{#each [154, 366] as x (x)}
  <path class="k" d="M{x} 301v-46" stroke-width="2" />
  <path class="k" d="M{x - 6} 255h12" stroke-width="1.6" />
  <path class="f-acc k" d="M{x - 5} 255l-2-10h14l-2 10z" stroke-width="1.2" />
  <path class="f-seal2 k" d="M{x - 7} 245l7-6l7 6z" stroke-width="1.1" />
{/each}
