<!-- Gác hai tầng mái, cửa sổ tròn toả tia, hồ sen phía trước (cảm hứng Khuê Văn Các — cách điệu). Khung 520×325. -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  import Lantern from './parts/Lantern.svelte';
  import Lotus from './parts/Lotus.svelte';
  import Pad from './parts/Pad.svelte';
  import { bricks, tiles, spokes, balustrade, ripples } from './kit';
</script>

<Clouds cy={146} r={122} />
<!-- công trình vẽ ở hệ toạ độ gốc 520×440 rồi thu 0.75 cho đáy bệ chạm mặt đất -->
<g transform="translate(65 0) scale(.75)">
  <!-- bệ, bậc -->
  <path class="f-shade k" d="M100 386h320v14H100z" stroke-width="2" />
  <path class="f-card k" d="M120 372h280v14H120z" stroke-width="2" />
  <path class="k" d="M226 372v28M294 372v28M226 386h68M236 379h48M236 393h48" stroke-width="1.2" />
  <!-- tầng dưới: tường gạch, mặt phải khuất bóng -->
  <rect class="f-card" x="150" y="270" width="220" height="102" />
  <rect class="f-shade" x="292" y="270" width="78" height="102" />
  <path class="kw" d={bricks(150, 282, 220, 90, 9, 22)} stroke-width="1" />
  <rect class="k" x="150" y="270" width="220" height="102" stroke-width="2" />
  <rect class="f-seal2 k" x="146" y="270" width="228" height="12" stroke-width="1.6" />
  <path class="ka" d="M154 276h212" stroke-width="1.2" stroke-dasharray="6 4" />
  <g class="f-void ka" stroke-width="2.5">
    <path d="M172 372v-44a20 20 0 0 1 40 0v44z" /><path d="M240 372v-50a20 20 0 0 1 40 0v50z" /><path d="M308 372v-44a20 20 0 0 1 40 0v44z" />
  </g>
  <path class="ks" d="M250 322v50M270 322v50M182 330v42M202 330v42M318 330v42M338 330v42" stroke-width="1" />
  <!-- trụ góc -->
  <g class="f-card k" stroke-width="1.6"><rect x="150" y="282" width="10" height="90" /><rect x="360" y="282" width="10" height="90" /></g>
  <!-- mái dưới -->
  <path class="f-seal k" d="M76 236q22 30 50 30h268q28 0 50-30q-36 10-76-4H152q-40 14-76 4z" stroke-width="2" />
  <path class="ks" d={tiles(104, 416, 240, 262, 9, 0.05)} stroke-width="1.5" />
  <path class="ks" d="M98 244q14 14 32 16h260q18-2 32-16" stroke-width="2.5" />
  <path class="ka" d="M152 232h216" stroke-width="5" />
  <path class="ka" d="M76 236q-6-8 0-14q6-2 8 4M444 236q6-8 0-14q-6-2-8 4" stroke-width="3" />
  <!-- lan can tầng trên -->
  <rect class="f-cream k" x="178" y="222" width="164" height="12" stroke-width="1.6" />
  <path class="k" d={balustrade(178, 222, 164, 12, 8)} stroke-width="1" />
  <!-- gác gỗ -->
  <rect class="f-seal2 k" x="186" y="182" width="148" height="40" stroke-width="2" />
  <path class="ka" d="M200 182v40M320 182v40M186 190h148" stroke-width="2" />
  <path class="ka" d="M208 196h16v18h-16zM296 196h16v18h-16z" stroke-width="1.2" />
  <circle class="f-acc k" cx="260" cy="204" r="25" stroke-width="2" />
  <circle class="f-void" cx="260" cy="204" r="20.5" />
  <path class="ka" d={spokes(260, 204, 7, 20, 12)} stroke-width="2.4" />
  <circle class="ka" cx="260" cy="204" r="7" stroke-width="2" />
  <!-- mái trên -->
  <path class="f-seal k" d="M140 150q18 26 44 26h152q26 0 44-26q-30 9-64-6h-112q-34 15-64 6z" stroke-width="2" />
  <path class="ks" d={tiles(170, 350, 154, 172, 8, 0.06)} stroke-width="1.5" />
  <path class="ks" d="M156 160q12 12 28 14h152q16-2 28-14" stroke-width="2.5" />
  <path class="ka" d="M204 142h112" stroke-width="6" />
  <path class="ka" d="M204 142q-14-6-8-22q8-6 14 2q-2 8-10 6M316 142q14-6 8-22q-8-6-14 2q2 8 10 6M140 150q-6-10 2-16q6 0 6 6M380 150q6-10-2-16q-6 0-6 6" stroke-width="3" />
  <!-- ngọc + lửa trên nóc -->
  <path class="f-acc k" d="M260 98c-8 10-10 18-6 26h12c4-8 2-16-6-26z" stroke-width="1.5" />
  <circle class="f-seal ka" cx="260" cy="130" r="9" stroke-width="3" />
</g>
<!-- đèn lồng ở đầu đao -->
<Lantern x={174.5} y={112.5} len={14} s={0.9} />
<Lantern x={345.5} y={112.5} len={14} s={0.9} />
<!-- hồ sen tiền cảnh -->
<path class="f-water" d="M0 300q130-10 260-4t260 4v25H0z" />
<path class="kw" d={ripples(10, 308, 500, 2, 7)} stroke-width="1.3" />
<Pad x={46} y={304} r={22} /><Pad x={104} y={316} r={15} /><Pad x={430} y={306} r={24} /><Pad x={486} y={318} r={15} />
<Lotus x={70} y={300} s={0.95} stem={6} /><Lotus x={452} y={300} s={1.05} stem={6} /><Lotus x={124} y={312} s={0.6} stem={4} />
