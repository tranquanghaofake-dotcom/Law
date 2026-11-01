<!-- Toà nghị viện: bệ bậc, hàng cột có đầu/chân cột, tường kính chia ô, khối trụ tròn có lam đứng, cây hai bên (cảm hứng Nhà Quốc hội — cách điệu). Khung 520×325. -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  import Tree from './parts/Tree.svelte';
  const cols = Array.from({ length: 15 }, (_, i) => 120 + i * 20);
  const fins = Array.from({ length: 14 }, (_, i) => 192 + i * 10.5);
  let meander = ''; for (let x = 104; x < 416; x += 12) meander += `M${x} 147v-6h6v4h-3`;
</script>

<Clouds cy={140} r={116} puffs={false} />
<Tree x={64} y={301} s={1.15} /><Tree x={456} y={301} s={1.05} />
<!-- khối trụ tròn -->
<rect class="f-card" x="186" y="80" width="148" height="48" />
<rect class="f-shade" x="292" y="80" width="42" height="48" />
<path class="k" d={fins.map((x) => `M${x} 84v44`).join('')} stroke-width="1" />
<rect class="k" x="186" y="80" width="148" height="48" stroke-width="1.8" />
<ellipse class="f-acc k" cx="260" cy="80" rx="76" ry="10" stroke-width="1.8" />
<ellipse class="ks" cx="260" cy="79" rx="60" ry="6.5" stroke-width="1.4" />
<rect class="f-cream k" x="178" y="124" width="164" height="6" stroke-width="1.4" />
<!-- mái bằng + diềm hoa văn chữ công -->
<rect class="f-cream k" x="84" y="128" width="352" height="10" stroke-width="1.8" />
<rect class="f-shade" x="86" y="137" width="348" height="2" />
<rect class="f-seal k" x="100" y="138" width="320" height="12" stroke-width="1.6" />
<path class="ka" d={meander} stroke-width="1.2" />
<!-- tường kính phía sau hàng cột -->
<rect class="f-void" x="112" y="150" width="296" height="120" />
<path class="kp" d="M112 172h296M112 194h296M112 216h296M112 238h296" stroke-width=".9" opacity=".55" />
<!-- hàng cột -->
{#each cols as x (x)}
  <rect class="f-card k" x={x - 4.5} y="155" width="9" height="110" stroke-width="1.3" />
  <path class="kw" d="M{x - 1.5} 160v100M{x + 1.5} 160v100" stroke-width=".8" />
  <rect class="f-cream k" x={x - 6.5} y="150" width="13" height="5" stroke-width="1.2" />
  <rect class="f-cream k" x={x - 6.5} y="265" width="13" height="5" stroke-width="1.2" />
{/each}
<!-- bệ, bậc -->
<rect class="f-card k" x="96" y="270" width="328" height="12" stroke-width="1.8" />
<rect class="f-shade" x="98" y="278" width="324" height="3" />
<rect class="f-card k" x="132" y="282" width="256" height="9" stroke-width="1.6" />
<rect class="f-card k" x="150" y="291" width="220" height="10" stroke-width="1.6" />
<path class="k" d="M150 296h220" stroke-width=".8" />
<!-- cuốn sách mở ở bậc giữa: Hiến pháp -->
<path class="f-cream k" d="M234 286q13-7 26 0q13-7 26 0v9q-13-6-26 0q-13-6-26 0z" stroke-width="1.4" />
<path class="k" d="M260 286v9M240 289h14M266 289h14" stroke-width=".9" />
