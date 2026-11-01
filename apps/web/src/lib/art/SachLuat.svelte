<!-- Sách luật bìa cứng (khung kép, mặt trống đồng, chữ LUẬT), chồng sách, nghiên mực và bút lông, ấn đỏ, sách mở và cán cân (cảm hứng bìa sách luật in trong nước — cách điệu, không dùng Quốc huy). Khung 520×325. -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  import { ring, star, spokes } from './kit';
</script>

<Clouds cy={136} r={112} puffs={false} />
<!-- chồng sách nằm -->
{#each [[66, 282, 'f-ink'], [74, 266, 'f-acc'], [62, 250, 'f-seal']] as [x, y, c] (y)}
  <rect class="{c} k" x={x} y={y} width="124" height="16" rx="2" stroke-width="1.6" />
  <rect class="f-cream k" x={(x as number) + 118} y={(y as number) + 2} width="8" height="12" stroke-width="1.1" />
  <path class="kw" d="M{(x as number) + 120} {(y as number) + 5}h5M{(x as number) + 120} {(y as number) + 8}h5M{(x as number) + 120} {(y as number) + 11}h5" stroke-width=".8" />
  <path class="kp" d="M{(x as number) + 10} {(y as number) + 3}v10M{(x as number) + 16} {(y as number) + 3}v10M{(x as number) + 30} {(y as number) + 8}h40" stroke-width="1.1" />
{/each}
<!-- nghiên mực + bút lông trên chồng sách -->
<ellipse class="f-shade k" cx="104" cy="244" rx="26" ry="7" stroke-width="1.5" />
<ellipse class="f-void" cx="100" cy="243" rx="12" ry="3.4" />
<path class="f-acc2 k" d="M128 246l40-46l4 3l-40 46z" stroke-width="1.3" />
<path class="f-ink k" d="M168 200l8-10l2 9z" stroke-width="1.1" />
<!-- sách đứng: gáy + bìa -->
<rect class="f-void k" x="196" y="64" width="16" height="232" rx="3" stroke-width="1.6" />
<path class="ka" d="M198 90h12M198 96h12M198 264h12M198 270h12" stroke-width="1.6" />
<rect class="f-cover k" x="208" y="64" width="124" height="232" rx="3" stroke-width="1.8" />
<rect class="s-goldline" x="218" y="74" width="104" height="212" stroke-width="2" />
<rect class="s-goldline" x="223" y="79" width="94" height="202" stroke-width="1" />
<path class="s-goldline" d="M218 92h10V74M322 92h-10V74M218 268h10v18M322 268h-10v18" stroke-width="1.4" />
<!-- mặt trống đồng thay Quốc huy -->
<circle class="f-gold" cx="270" cy="130" r="26" />
<path class="f-cover" d={ring(270, 130, 20, 25, 28)} />
<circle class="s-goldline" cx="270" cy="130" r="18" stroke-width="1.2" style="stroke: var(--cover-ink, #8e1f19)" />
<path class="f-cover" d={star(270, 130, 13, 5, 12)} />
<path class="s-goldline" d={spokes(270, 130, 15, 17, 24)} stroke-width="1" style="stroke: #8e1f19" />
<!-- tiêu đề -->
<text class="f-gold art-title" x="270" y="196" text-anchor="middle" style="font-size: 30px">LUẬT</text>
<path class="s-goldline" d="M236 210h68M246 222h48M256 254h28" stroke-width="1.4" />
<rect class="s-goldline" x="262" y="260" width="16" height="11" stroke-width="1.2" />
<!-- ấn đỏ -->
<rect class="f-seal k" x="344" y="276" width="24" height="24" rx="2" stroke-width="1.4" transform="rotate(-6 356 288)" />
<rect class="kp" x="348" y="280" width="16" height="16" stroke-width="1.2" transform="rotate(-6 356 288)" />
<path class="kp" d="M352 286h8M352 291h8M356 283v12" stroke-width="1.1" transform="rotate(-6 356 288)" />
<!-- sách mở trên giá -->
<path class="f-acc2 k" d="M378 301l18-14h88l18 14z" stroke-width="1.4" />
<path class="f-card k" d="M384 290q26-12 52 0q26-12 52 0v-40q-26-12-52 0q-26-12-52 0z" stroke-width="1.6" />
<path class="kw" d="M392 260h36M392 268h36M392 276h30M444 260h36M444 268h36M444 276h24" stroke-width="1.3" />
<path class="k" d="M436 250v40" stroke-width="1.2" />
<!-- cán cân -->
<path class="f-acc2 k" d="M418 234h36l-6-8h-24z" stroke-width="1.3" />
<path class="k" d="M436 226v-74M406 160h60" stroke-width="2.2" />
<circle class="f-acc k" cx="436" cy="152" r="4" stroke-width="1.2" />
<path class="k" d="M406 160l-9 22M406 160l9 22M466 160l-9 22M466 160l9 22" stroke-width="1.1" />
<g class="f-acc k" stroke-width="1.3"><path d="M394 182h24a12 5 0 0 1-24 0zM454 182h24a12 5 0 0 1-24 0z" /></g>
