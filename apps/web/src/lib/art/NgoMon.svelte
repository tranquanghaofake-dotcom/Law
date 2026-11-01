<!-- Cổng thành có lầu năm mái phía trên (cảm hứng Ngọ Môn, Huế — cách điệu). -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  const bricks = [140, 150, 160, 170];
  const posts = Array.from({ length: 13 }, (_, i) => 76 + i * 14);
</script>

<Clouds cy={88} />
<!-- thành: thân chính + hai cánh -->
<rect class="f-card s-line" x="40" y="132" width="240" height="54" />
<g class="s-line s-thin">
  {#each bricks as y (y)}<path d="M40 {y}h52M228 {y}h52" />{/each}
  <path d="M40 132l0 54M92 132v54M228 132v54" />
</g>
<g class="f-void">
  <path d="M146 186v-28a14 14 0 0 1 28 0v28z" />
  <path d="M106 186v-20a9 9 0 0 1 18 0v20z" />
  <path d="M196 186v-20a9 9 0 0 1 18 0v20z" />
  <path d="M56 186v-14a6 6 0 0 1 12 0v14z" />
  <path d="M252 186v-14a6 6 0 0 1 12 0v14z" />
</g>
<rect class="f-acc s-line s-thin" x="146" y="138" width="28" height="10" />
<!-- lan can trên thành -->
<path class="s-line s-thin" d="M40 132v-6h240v6" />
<!-- lầu: tầng dưới -->
<path class="f-acc s-line" d="M52 120q8 8 18 8h180q10 0 18-8q-12 4-26-2h-182q-14 6-26 2z" />
<path class="s-line s-thin" d="M76 122h168" />
<g class="f-seal s-line s-thin">{#each posts as x (x)}<rect x={x - 2} y="102" width="4" height="16" />{/each}</g>
<path class="s-line s-thin" d="M70 110h180" />
<!-- mái trên: hai bên + giữa cao -->
<path class="f-acc s-line" d="M64 98q8 8 18 8h66v-10h-60q-12 4-24 2z" />
<path class="f-acc s-line" d="M256 98q-8 8-18 8h-66v-10h60q12 4 24 2z" />
<path class="f-acc s-line" d="M118 82q10 12 22 12h40q12 0 22-12q-14 4-30-2h-26q-16 6-30 2z" />
<path class="s-line s-bold" d="M136 80h48" />
<rect class="f-seal s-line s-thin" x="134" y="94" width="52" height="10" />
<g class="s-line s-thin"><path d="M88 100h56M176 100h56M134 88h52" /></g>
<path class="s-line" d="M136 80q-6-4-2-10M184 80q6-4 2-10" />
<circle class="f-seal s-line" cx="160" cy="72" r="4" />
