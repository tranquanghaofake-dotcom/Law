<!-- Cổng thành năm cửa, lầu năm mái vàng phía trên (cảm hứng Ngọ Môn, Huế — cách điệu). Khung 520×325. -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  import Lantern from './parts/Lantern.svelte';
  import { bricks, tiles, balustrade } from './kit';
  const posts = Array.from({ length: 22 }, (_, i) => 116 + i * 13.5);
</script>

<Clouds cy={130} r={112} puffs={false} />
<!-- tường thành: thân giữa + hai cánh khuất bóng -->
<rect class="f-card" x="40" y="214" width="440" height="87" />
<rect class="f-shade" x="40" y="214" width="96" height="87" /><rect class="f-shade" x="384" y="214" width="96" height="87" />
<path class="kw" d={bricks(40, 214, 440, 87, 9, 22)} stroke-width="1" />
<rect class="k" x="40" y="214" width="440" height="87" stroke-width="2" />
<path class="k" d="M136 214v87M384 214v87" stroke-width="1.4" />
<rect class="f-seal2 k" x="36" y="206" width="448" height="8" stroke-width="1.6" />
<path class="ka" d="M42 210h436" stroke-width="1" stroke-dasharray="5 4" />
<!-- năm cửa -->
<g class="f-void ka" stroke-width="2.2">
  <path d="M238 301v-42a22 22 0 0 1 44 0v42z" />
  <path d="M168 301v-32a15 15 0 0 1 30 0v32z" /><path d="M322 301v-32a15 15 0 0 1 30 0v32z" />
  <path d="M78 301v-24a10 10 0 0 1 20 0v24z" /><path d="M422 301v-24a10 10 0 0 1 20 0v24z" />
</g>
<rect class="f-acc k" x="234" y="222" width="52" height="12" stroke-width="1.5" />
<path class="k" d="M242 228h36" stroke-width="1.2" stroke-dasharray="4 3" />
<!-- lầu: tầng dưới, hàng cột đỏ, lan can -->
<rect class="f-cream k" x="108" y="194" width="304" height="12" stroke-width="1.5" />
<path class="k" d={balustrade(108, 194, 304, 12, 7)} stroke-width=".9" />
{#each posts as x (x)}<rect class="f-seal k" x={x - 2.5} y="172" width="5" height="22" stroke-width="1" />{/each}
<path class="f-acc k" d="M88 166q10 12 24 12h296q14 0 24-12q-18 6-34 0H122q-16 6-34 0z" stroke-width="1.8" />
<path class="ks" d={tiles(104, 416, 168, 176, 7, 0.03)} stroke-width="1.2" />
<!-- mái trên: hai bên + giữa cao -->
<path class="f-acc k" d="M110 148q8 12 20 12h104v-14H136q-14 4-26 2z" stroke-width="1.8" />
<path class="f-acc k" d="M410 148q-8 12-20 12H286v-14h98q14 4 26 2z" stroke-width="1.8" />
<path class="ks" d={tiles(122, 230, 150, 158, 7, 0)} stroke-width="1.1" /><path class="ks" d={tiles(290, 398, 150, 158, 7, 0)} stroke-width="1.1" />
<rect class="f-seal2 k" x="206" y="132" width="108" height="34" stroke-width="1.6" />
<path class="ka" d="M220 140h80M220 158h80M232 140v18M260 140v18M288 140v18" stroke-width="1" />
<path class="f-acc k" d="M188 116q12 16 28 16h88q16 0 28-16q-20 6-44-2h-56q-24 8-44 2z" stroke-width="1.8" />
<path class="ks" d={tiles(204, 316, 120, 130, 7, 0.06)} stroke-width="1.2" />
<path class="ks" d="M226 112h68" stroke-width="5" />
<path class="ks" d="M226 112q-10-4-6-14q6-4 10 2q-1 5-6 4M294 112q10-4 6-14q-6-4-10 2q1 5 6 4" stroke-width="2.4" />
<circle class="f-seal ka" cx="260" cy="104" r="6" stroke-width="2.2" />
<Lantern x={92} y={168} len={8} s={0.75} /><Lantern x={428} y={168} len={8} s={0.75} />
