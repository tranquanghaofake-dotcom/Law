<!-- Vịnh núi đá vôi ba lớp xa gần, thuyền buồm cánh dơi, thuyền nan người đội nón lá (cảm hứng vịnh Hạ Long — cách điệu). Khung 520×325. -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  import Puff from './parts/Puff.svelte';
  import { ripples } from './kit';
  const ribs = [0, 1, 2, 3, 4, 5, 6];
</script>

<Clouds cy={112} r={84} ground={false} puffs={false} />
<Puff x={110} y={96} s={0.75} /><Puff x={430} y={70} s={0.65} flip />
<!-- lớp núi xa -->
<path class="f-hill" d="M0 252c10-40 18-80 40-84c18-2 16 44 30 44c12 0 12-62 38-64c24 0 18 68 34 68c12 0 14-26 26-26c14 0 10 40 24 50h320v20H0z" />
<path class="f-hill" d="M330 250c4-30 14-56 30-58c14 0 12 26 22 26c10 0 12-44 32-46c22 0 26 50 40 52c12 2 18-20 30-20c10 0 14 26 36 46z" />
<!-- núi gần bên phải, nếp đá -->
<path class="f-hill2 k" d="M290 254c-8-56 4-120 32-126c22-4 24 40 32 40c12 0 12-48 34-48c26 0 30 70 26 134z" stroke-width="1.8" />
<path class="k" d="M312 140c-6 30-4 70 2 112M336 160c-2 26 0 60 6 92M372 128c4 36 0 80-4 124M396 150c0 30-2 70-6 102" stroke-width="1.2" />
<path class="f-leaf" d="M318 134q8-8 14 2q-8 2-14-2zM378 122q8-8 16 2q-8 3-16-2zM300 200q6-4 10 2q-6 2-10-2z" />
<!-- núi gần bên trái -->
<path class="f-hill2 k" d="M48 254c-6-40 6-84 26-88c20-4 22 34 30 34c10 0 12-20 24-20c18 0 20 40 14 74z" stroke-width="1.8" />
<path class="k" d="M70 176c-4 24-2 52 2 78M104 204c0 18 0 34-2 50M130 196c2 20 0 40-2 58" stroke-width="1.2" />
<!-- mặt nước + phản chiếu -->
<rect class="f-water" x="0" y="252" width="520" height="73" />
<path class="kw" d={ripples(6, 262, 508, 7, 11)} stroke-width="1.3" />
<path class="kw" d="M318 258v10M340 258v6M372 258v12M396 258v8M72 258v10M104 258v6" stroke-width="1.6" />
<!-- thuyền buồm cánh dơi -->
<g>
  <path class="f-seal k" d="M218 250v-74q-26 34-26 74z" stroke-width="1.6" />
  <path class="f-seal k" d="M236 250v-96q36 42 32 96z" stroke-width="1.6" />
  <path class="f-seal k" d="M274 250v-62q22 28 18 62z" stroke-width="1.6" />
  <g class="ks" stroke-width="1.2">
    {#each ribs as i (i)}<path d="M{218 - 3 - i * 2.6} {184 + i * 10}q{(5 + i * 2.6) / 2} -3 {5 + i * 2.6} -2M236 {164 + i * 13}q{12 + i * 2.4} -4 {24 + i * 2.2} -2M274 {196 + i * 8}q{6 + i} -2 {12 + i * 1.6} -1" />{/each}
  </g>
  <path class="k" d="M218 172v84M236 150v106M274 186v70" stroke-width="2" />
  <path class="f-acc k" d="M236 150l12 4l-12 4z" stroke-width="1" />
  <path class="f-acc2 k" d="M180 254h128l-12 18h-104z" stroke-width="1.8" />
  <path class="kp" d="M188 262h112" stroke-width="1" />
  <rect class="f-seal2 k" x="250" y="242" width="30" height="12" stroke-width="1.4" />
  <path class="kw" d="M190 280h108M204 288h80" stroke-width="1.6" />
</g>
<!-- thuyền nan, người đội nón lá -->
<g>
  <path class="f-acc2 k" d="M70 294q34 10 70 0l-6 8q-30 6-58 0z" stroke-width="1.5" />
  <path class="f-seal2 k" d="M100 294v-14q4-5 8 0v14z" stroke-width="1.3" />
  <path class="f-cream k" d="M92 280l12-12l12 12z" stroke-width="1.3" />
  <path class="k" d="M110 286l26 22" stroke-width="1.6" />
  <path class="kw" d="M66 310h80" stroke-width="1.5" />
</g>
<!-- chim -->
<path class="k" d="M178 70q5-5 10 0q5-5 10 0M206 56q4-4 8 0q4-4 8 0M330 92q4-4 8 0q4-4 8 0" stroke-width="1.5" />
