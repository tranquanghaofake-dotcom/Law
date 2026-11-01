<!-- Vườn bia: bia đá trên lưng rùa, tường mái ngói và cổng phía sau, án thư có chiếu chỉ, ấn triện, bút lông (cảm hứng bia tiến sĩ Văn Miếu — cách điệu). Khung 520×325. -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  import Tree from './parts/Tree.svelte';
  import { tiles } from './kit';
  const steles = [
    { x: 260, w: 66, h: 128, s: 1 },
    { x: 128, w: 44, h: 88, s: 0.72 },
    { x: 392, w: 44, h: 88, s: 0.72 },
  ];
</script>

<Clouds cy={122} r={104} puffs={false} />
<!-- tường mái ngói + cổng nhỏ phía sau -->
<rect class="f-card k" x="20" y="206" width="480" height="40" stroke-width="1.6" />
<path class="f-seal k" d="M14 206h492l-8-10H22z" stroke-width="1.4" />
<path class="ks" d={tiles(26, 494, 197, 205, 8, 0)} stroke-width="1" />
<path class="kw" d="M20 226h480" stroke-width="1" />
<Tree x={64} y={246} s={0.95} /><Tree x={462} y={246} s={0.9} />
{#each steles as st (st.x)}
  {@const top = 300 - 22 * st.s - st.h}
  {@const L = st.x - st.w / 2}
  <!-- bia -->
  <path class="f-shade k" d="M{L} {top + 18}q{st.w / 2} -30 {st.w} 0v{st.h - 18}H{L}z" stroke-width="1.8" />
  <path class="f-seal k" d="M{L - 3} {top + 18}q{st.w / 2 + 3} -34 {st.w + 6} 0q-{st.w / 2 + 3} -22 -{st.w + 6} 0z" stroke-width="1.2" />
  <path class="ka" d="M{st.x - st.w * 0.28} {top + 6}q{st.w * 0.1} -8 {st.w * 0.2} 0M{st.x + st.w * 0.08} {top + 6}q{st.w * 0.1} -8 {st.w * 0.2} 0" stroke-width="1.4" />
  <circle class="f-acc k" cx={st.x} cy={top + 5} r={3.5 * st.s + 1} stroke-width="1" />
  <rect class="f-cream k" x={st.x - st.w * 0.3} y={top + 22} width={st.w * 0.6} height={12 * st.s} stroke-width="1" />
  <path class="k" d={Array.from({ length: Math.round(6 * st.s) + 1 }, (_, i) => `M${L + 8 + i * ((st.w - 16) / Math.round(6 * st.s))} ${top + 22 + 16 * st.s}v${st.h - 30 - 18 * st.s}`).join('')} stroke-width=".8" stroke-dasharray="3 2" />
  <!-- rùa đội bia -->
  <g transform="translate({st.x} {300 - 12 * st.s}) scale({st.s})">
    <path class="f-leaf2 k" d="M{st.w / 2 + 8} -2q16-6 22 2q-4 8-20 6z" stroke-width="1.6" />
    <circle class="f-void" cx={st.w / 2 + 24} cy="-1" r="1.6" />
    <ellipse class="f-leaf2 k" cx="0" cy="0" rx={st.w / 2 + 14} ry="14" stroke-width="1.8" />
    <path class="k" d="M-{st.w / 2} -6h{st.w}M-{st.w / 2 + 6} 4h{st.w + 12}M-14 -12v18M14 -12v18M-{st.w / 4 + 8} -10v14M{st.w / 4 + 8} -10v14" stroke-width="1" />
    <path class="f-leaf2 k" d="M-{st.w / 2 + 2} 10l-6 6h10zM{st.w / 2 + 2} 10l6 6h-10zM-{st.w / 2 + 12} 0q-8 2-10 6" stroke-width="1.3" />
  </g>
{/each}
<!-- án thư nhỏ giữa hai bia: chiếu chỉ, ấn triện, bút lông -->
<rect class="f-acc2 k" x="322" y="286" width="44" height="5" stroke-width="1.3" />
<path class="k" d="M326 291v10M362 291v10" stroke-width="1.8" />
<rect class="f-cream k" x="326" y="279" width="20" height="7" rx="3.5" stroke-width="1.1" />
<circle class="f-acc k" cx="326" cy="282.5" r="3.4" stroke-width=".9" /><circle class="f-acc k" cx="346" cy="282.5" r="3.4" stroke-width=".9" />
<rect class="f-seal k" x="350" y="277" width="10" height="9" rx="1" stroke-width="1" />
<rect class="f-acc2 k" x="352.5" y="271" width="5" height="6" rx="1" stroke-width=".9" />
