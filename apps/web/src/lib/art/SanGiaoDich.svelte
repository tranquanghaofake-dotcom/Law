<!-- Sàn giao dịch chứng khoán: toà tháp kính, khối sảnh, bảng điện tử có biểu đồ nến và các ô giá (cách điệu, không phải sở giao dịch cụ thể, không logo). Khung 520×325. -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  import Tree from './parts/Tree.svelte';
  const candles = [
    { x: 150, o: 214, c: 204, h: 198, l: 220, up: true }, { x: 172, o: 206, c: 212, h: 200, l: 218, up: false },
    { x: 194, o: 212, c: 200, h: 194, l: 216, up: true }, { x: 216, o: 202, c: 196, h: 190, l: 208, up: true },
    { x: 238, o: 198, c: 206, h: 192, l: 212, up: false }, { x: 260, o: 206, c: 194, h: 188, l: 210, up: true },
    { x: 282, o: 196, c: 190, h: 184, l: 200, up: true }, { x: 304, o: 192, c: 200, h: 186, l: 204, up: false },
    { x: 326, o: 198, c: 188, h: 182, l: 202, up: true }, { x: 348, o: 190, c: 184, h: 178, l: 196, up: true },
  ];
  const cellColor = ['f-leaf', 'f-seal', 'f-acc', 'f-leaf', 'f-acc', 'f-leaf', 'f-seal', 'f-acc', 'f-leaf', 'f-leaf', 'f-seal', 'f-acc', 'f-acc', 'f-leaf', 'f-seal', 'f-leaf', 'f-acc', 'f-leaf'];
</script>

<Clouds cy={124} r={106} puffs={false} />
<Tree x={44} y={301} s={1.05} /><Tree x={478} y={301} s={1} />
<!-- toà tháp kính -->
<rect class="f-card" x="176" y="48" width="96" height="253" />
<rect class="f-shade" x="244" y="48" width="28" height="253" />
<path class="kw" d={Array.from({ length: 22 }, (_, i) => `M176 ${60 + i * 11}h96`).join('') + 'M200 48v253M224 48v253M248 48v253'} stroke-width="1" />
<rect class="k" x="176" y="48" width="96" height="253" stroke-width="1.8" />
<path class="f-seal k" d="M170 48h108l-8-10h-92z" stroke-width="1.6" />
<!-- khối sảnh -->
<rect class="f-cream k" x="272" y="132" width="132" height="169" stroke-width="1.8" />
<path class="k" d="M272 154h132M272 176h132M272 198h132" stroke-width="1" />
<rect class="f-acc k" x="268" y="126" width="140" height="7" stroke-width="1.4" />
<!-- bảng điện tử -->
<rect class="f-void k" x="122" y="170" width="276" height="104" rx="4" stroke-width="2" />
<rect class="k" x="128" y="176" width="264" height="92" rx="2" stroke-width=".8" opacity=".5" />
<path class="kp" d="M134 224h252" stroke-width=".8" opacity=".4" />
{#each candles as c (c.x)}
  <path class={c.up ? 'k' : 'k'} d="M{c.x} {c.h}V{c.l}" stroke-width="1.2" style="stroke: var({c.up ? '--ok' : '--seal'})" />
  <rect class={c.up ? 'f-leaf' : 'f-seal'} x={c.x - 4} y={Math.min(c.o, c.c)} width="8" height={Math.max(2, Math.abs(c.o - c.c))} />
{/each}
<path class="ka" d="M146 214q30-10 56-14t50-6t50-8t50-10" stroke-width="1.4" stroke-dasharray="3 3" />
{#each cellColor as col, i (i)}
  <rect class={col} x={136 + (i % 6) * 42} y={232 + Math.floor(i / 6) * 13} width="16" height="7" rx="1" />
  <rect class="f-line" x={156 + (i % 6) * 42} y={233 + Math.floor(i / 6) * 13} width="14" height="5" rx="1" opacity=".55" />
{/each}
<path class="k" d="M150 274v27M370 274v27" stroke-width="3" />
<!-- bậc sảnh -->
<rect class="f-card k" x="110" y="291" width="300" height="10" stroke-width="1.5" />
