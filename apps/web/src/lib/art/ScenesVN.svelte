<!-- Phông Việt Nam cho tủ trưng bày (đợt 8): phố cổ Hội An đèn lồng, chùa Thiên Mụ, ruộng bậc thang, Nhà hát Lớn, đình làng Bắc Bộ.
     Khung 520×325, mặt đất y=301, khối phẳng + nét mảnh như các cảnh khác. Cách điệu từ kiến trúc/cảnh quan có thật; không cờ, Quốc huy, logo.
     Nạp lười qua ScenesMore.svelte (cùng bó với các cảnh bổ sung). -->
<script lang="ts">
  import type { ArtName } from './registry';
  import Clouds from './Clouds.svelte';
  import Tree from './parts/Tree.svelte';
  import Lantern from './parts/Lantern.svelte';
  import Pad from './parts/Pad.svelte';
  import { bricks, tiles, ripples, balustrade } from './kit';
  let { name }: { name: ArtName } = $props();
  const f = (n: number) => +n.toFixed(1);

  // ── Thiên Mụ: tháp Phước Duyên 7 tầng, tám cạnh, thu nhỏ dần
  const tiers = Array.from({ length: 7 }, (_, i) => ({ yb: 250 - i * 24, w: 27 - i * 2.4, eave: 38 - i * 2.8 }));
  // ── Ruộng bậc thang: các dải ruộng uốn theo sườn đồi
  const terr = Array.from({ length: 9 }, (_, i) => {
    const y = 150 + i * 19, a = 6 + i * 0.7, ph = i * 0.1;
    const pts: string[] = [];
    for (let x = -10; x <= 530; x += 30) pts.push(`${x} ${f(y + Math.sin(x / 85 + ph) * a)}`);
    return { y, d: 'M' + pts.join('L'), fill: i % 2 ? 'f-water' : 'f-leaf' };
  });
  // ── Hội An: dây đèn lồng vắt qua phố
  const strings = [[24, 130, 258, 150, 496, 128], [10, 168, 260, 196, 510, 164]];
  // ── Nhà hát Lớn: cột và cửa vòm
  const cols = Array.from({ length: 8 }, (_, i) => 178 + i * 23.4);
</script>

{#if name === 'hoi-an'}
  <!-- phố cổ: ba dãy nhà tường vàng mái ngói âm dương, cửa gỗ, ban công, đèn lồng giăng ngang phố, sông Hoài và thuyền nhỏ -->
  <Clouds cy={96} r={96} puffs={false} />
  <path class="f-hill" d="M0 232q70-20 150-8t170-10t200 14v73H0z" opacity=".55" />
  <!-- nhà trái -->
  <rect class="f-cream k" x="14" y="180" width="130" height="121" stroke-width="1.6" /><rect class="f-shade" x="124" y="180" width="20" height="121" />
  <path class="f-seal2 k" d="M6 182l22-26h104l22 26z" stroke-width="1.6" /><path class="ks" d={tiles(22, 150, 160, 182, 6, 0.08)} stroke-width="1" />
  <g class="f-acc2 k" stroke-width="1.3"><rect x="28" y="196" width="26" height="36" /><rect x="70" y="196" width="26" height="36" /><rect x="112" y="196" width="22" height="36" /></g>
  <path class="ka" d="M41 196v36M28 214h26M83 196v36M70 214h26M123 196v36M112 214h22" stroke-width="1" />
  <path class="k" d="M24 238h110" stroke-width="3" /><path class="k" d={balustrade(24, 233, 110, 6, 8)} stroke-width="1" />
  <rect class="f-acc2 k" x="34" y="252" width="30" height="49" stroke-width="1.5" /><rect class="f-void k" x="80" y="256" width="40" height="45" stroke-width="1.5" /><path class="kp" d="M100 256v45" stroke-width="1" />
  <!-- nhà giữa, cao, có gác lửng, biển hiệu -->
  <rect class="f-gold k" x="156" y="152" width="176" height="149" stroke-width="1.7" opacity=".9" /><rect class="f-shade" x="312" y="152" width="20" height="149" />
  <path class="f-seal2 k" d="M146 154l30-34h136l30 34z" stroke-width="1.7" /><path class="ks" d={tiles(160, 340, 122, 154, 6, 0.1)} stroke-width="1" />
  <path class="ks" d="M146 154q10 10 26 12M358 154q-10 10-26 12" stroke-width="2" />
  <path class="k" d={bricks(156, 270, 176, 31, 8, 20)} stroke-width=".7" opacity=".5" />
  <g class="f-acc2 k" stroke-width="1.3"><rect x="170" y="170" width="28" height="44" /><rect x="214" y="170" width="28" height="44" /><rect x="258" y="170" width="28" height="44" /><rect x="302" y="170" width="20" height="44" /></g>
  <path class="ka" d="M184 170v44M170 192h28M228 170v44M214 192h28M272 170v44M258 192h28M312 170v44" stroke-width="1" />
  <rect class="f-card k" x="166" y="222" width="150" height="10" stroke-width="1.2" /><path class="k" d={balustrade(166, 232, 150, 6, 7)} stroke-width="1" /><path class="k" d="M160 238h162" stroke-width="3" />
  <path class="f-void k" d="M190 301v-52a30 30 0 0 1 60 0v52z" stroke-width="1.6" /><path class="kp" d="M220 249v52M190 280h60" stroke-width="1" />
  <rect class="f-seal k" x="264" y="252" width="50" height="14" stroke-width="1.2" /><path class="ka" d="M270 259h38" stroke-width="1.6" />
  <!-- nhà phải -->
  <rect class="f-cream k" x="352" y="188" width="150" height="113" stroke-width="1.6" /><rect class="f-shade" x="482" y="188" width="20" height="113" />
  <path class="f-seal2 k" d="M344 190l24-28h118l24 28z" stroke-width="1.6" /><path class="ks" d={tiles(372, 500, 164, 190, 6, 0.08)} stroke-width="1" />
  <g class="f-acc2 k" stroke-width="1.3"><rect x="368" y="204" width="28" height="34" /><rect x="412" y="204" width="28" height="34" /><rect x="456" y="204" width="28" height="34" /></g>
  <path class="ka" d="M382 204v34M368 221h28M426 204v34M412 221h28M470 204v34M456 221h28" stroke-width="1" />
  <rect class="f-void k" x="372" y="256" width="44" height="45" stroke-width="1.5" /><rect class="f-acc2 k" x="436" y="252" width="42" height="49" stroke-width="1.5" />
  <!-- đèn lồng giăng ngang phố -->
  {#each strings as s, i (i)}<path class="k" d="M{s[0]} {s[1]}Q{s[2]} {s[3]} {s[4]} {s[5]}" stroke-width="1" fill="none" />{/each}
  <Lantern x={62} y={140} len={8} s={0.9} /><Lantern x={118} y={146} len={6} s={0.8} /><Lantern x={176} y={152} len={6} s={0.95} />
  <Lantern x={232} y={156} len={6} s={1.05} /><Lantern x={290} y={156} len={6} s={0.95} /><Lantern x={348} y={152} len={6} s={0.85} /><Lantern x={410} y={142} len={6} s={0.9} /><Lantern x={466} y={136} len={8} s={0.8} />
  <Lantern x={100} y={178} len={6} s={0.7} /><Lantern x={176} y={200} len={6} s={0.7} /><Lantern x={344} y={198} len={6} s={0.7} /><Lantern x={440} y={170} len={6} s={0.7} />
  <!-- đèn lồng vàng/cam trước hiên -->
  <g class="k" stroke-width="1"><path d="M146 238v10M342 238v10M392 240v8" /><ellipse class="f-gold" cx="146" cy="256" rx="8" ry="10" /><ellipse class="f-acc" cx="342" cy="256" rx="8" ry="10" /><ellipse class="f-gold" cx="392" cy="256" rx="7" ry="9" /></g>
  <!-- bờ sông, nước, thuyền -->
  <path class="f-card k" d="M0 301h520v6H0z" stroke-width="1.2" />
  <path class="f-water" d="M0 307h520v18H0z" /><path class="kw" d={ripples(4, 310, 500, 3, 5)} stroke-width="1.2" />
  <path class="f-seal k" d="M330 306q40 14 94 0z" stroke-width="1.4" /><path class="ka" d="M360 306q0-12 26-12q26 0 28 12" stroke-width="1.4" fill="none" />
  <path class="f-gold" d="M70 312h22v3H70zM100 316h18v3h-18z" opacity=".6" />
{:else if name === 'thien-mu'}
  <!-- chùa Thiên Mụ: tháp Phước Duyên bảy tầng tám cạnh trên bậc đá, điện chính mái cong, núi sau, sông Hương, thuyền, cây cổ thụ -->
  <Clouds cy={118} r={104} puffs={false} />
  <path class="f-hill" d="M0 214q60-34 130-18t120-24t130 20t140-6v95H0z" opacity=".7" />
  <path class="f-hill2" d="M0 250q80-20 160-6t180-8t180 14v51H0z" opacity=".8" />
  <Tree x={52} y={262} s={1.2} /><Tree x={92} y={266} s={0.85} /><Tree x={478} y={262} s={1.15} /><Tree x={436} y={268} s={0.8} />
  <!-- bậc đá + nền tháp -->
  <path class="f-card k" d="M178 301l16-22h132l16 22z" stroke-width="1.5" /><path class="k" d="M170 301h180M184 290h152M194 280h132" stroke-width="1" />
  <path class="kw" d="M234 301l8-22M260 301v-22M286 301l-8-22" stroke-width="1" />
  <rect class="f-cream k" x="196" y="262" width="128" height="17" stroke-width="1.5" /><path class="k" d={balustrade(196, 262, 128, 17, 8)} stroke-width="1" />
  <!-- tháp 7 tầng -->
  {#each tiers as t, i (i)}
    <rect class="f-seal k" x={260 - t.w} y={t.yb - 20} width={t.w * 2} height="20" stroke-width="1.5" />
    <rect class="f-void k" x={260 - 4.5} y={t.yb - 17} width="9" height="14" rx="4" stroke-width="1.1" />
    <path class="ka" d="M{260 - t.w + 3} {t.yb - 17}v14M{260 + t.w - 3} {t.yb - 17}v14" stroke-width="1" />
    <path class="f-seal2 k" d="M{260 - t.eave} {t.yb - 17}q{t.eave * 0.36 + 3} {-1.4} {t.eave * 0.8} {-8.6}h{t.eave * 0.4}q{t.eave * 0.44} {7.2} {t.eave * 0.8 + 0.4} {8.6}z" stroke-width="1.5" />
    <path class="ks" d="M{260 - t.eave + 4} {t.yb - 19}q{t.eave - 4} {-6} {t.eave * 2 - 8} 0" stroke-width="1" />
  {/each}
  <path class="k" d="M260 82v-22" stroke-width="2" /><path class="f-gold k" d="M260 62q-8-8 0-20q8 12 0 20z" stroke-width="1.2" /><circle class="f-gold k" cx="260" cy="66" r="3" stroke-width="1" />
  <!-- điện thờ bên phải: mái cong, hàng cột -->
  <rect class="f-cream k" x="376" y="238" width="104" height="63" stroke-width="1.6" /><rect class="f-shade" x="466" y="238" width="14" height="63" />
  <path class="f-seal2 k" d="M364 240q12 22 38 22h52q26 0 38-22q-26 8-52-2h-24q-26 10-52 2z" stroke-width="1.7" /><path class="ks" d={tiles(386, 468, 232, 252, 7, 0.08)} stroke-width="1" />
  <path class="ks" d="M364 240q-4-8 2-12M492 240q4-8-2-12" stroke-width="2" />
  <g class="f-acc2 k" stroke-width="1.4">{#each [384, 410, 436, 462] as x (x)}<rect {x} y="248" width="6" height="53" />{/each}</g>
  <path class="f-void k" d="M398 301v-30a14 14 0 0 1 28 0v30z" stroke-width="1.4" /><path class="kp" d="M412 271v30" stroke-width="1" />
  <!-- sông Hương, thuyền rồng, bóng tháp -->
  <path class="f-water" d="M0 301h520v24H0z" /><path class="kw" d={ripples(6, 306, 500, 4, 7)} stroke-width="1.2" />
  <path class="kw" d="M246 306v14M260 306v18M274 306v14" stroke-width="1.8" />
  <path class="f-gold k" d="M84 310q30 10 70 0l-6-8H92z" stroke-width="1.3" /><path class="ka" d="M96 302q0-12 22-12q22 0 22 12" stroke-width="1.4" fill="none" /><path class="k" d="M154 310q8-6 6-14" stroke-width="1.4" />
{:else if name === 'ruong-bac-thang'}
  <!-- ruộng bậc thang mùa nước đổ: núi xa mờ sương, các thửa ruộng uốn theo sườn, nhà sàn nhỏ, người đội nón -->
  <Clouds cy={96} r={100} puffs={false} />
  <path class="f-hill2" d="M0 150l50-52l50 30l60-62l60 70l50-34l60 58l60-40l60 56l70-42v136H0z" opacity=".75" />
  <path class="f-hill" d="M0 176l70-34l60 28l80-44l70 40l70-28l70 36l100-38v158H0z" opacity=".9" />
  <path class="f-card" d="M0 142q60-12 120 0t120-4t120 6t160-6v14H0z" opacity=".55" />
  {#each terr as t, i (i)}
    <path class={t.fill} d="{t.d}L530 330L-10 330z" opacity={i % 2 ? 0.92 : 1} />
    <path class="k" d={t.d} stroke-width={1.2 + i * 0.12} fill="none" />
    <path class="kw" d={ripples(40 + (i % 3) * 30, t.y + 6 + i * 0.4, 380, 1, i + 3)} stroke-width="1" opacity=".6" />
  {/each}
  <!-- nhà sàn mái cong trên thửa cao -->
  <rect class="f-acc2 k" x="318" y="116" width="62" height="26" stroke-width="1.5" />
  <path class="f-seal2 k" d="M308 118l18-24h46l18 24q-20-6-40-6t-42 6z" stroke-width="1.5" /><path class="ks" d={tiles(322, 372, 96, 114, 6, 0.1)} stroke-width="1" />
  <path class="k" d="M326 142v12M350 142v12M374 142v12" stroke-width="2" /><rect class="f-void k" x="340" y="124" width="16" height="18" stroke-width="1.2" />
  <path class="kw" d="M200 150v-8M204 150v-12M208 150v-8" stroke-width="1" />
  <!-- người đội nón gánh trên bờ ruộng -->
  <g class="k" stroke-width="1.6" fill="none"><path d="M170 232v-24M170 220l-8 12M170 220l8 12M170 208q-14-2-22 4M170 208q14-2 22 4M148 212v8M192 212v8" /></g>
  <path class="f-cream k" d="M158 196l12-8l12 8z" stroke-width="1.3" /><circle class="f-skin k" cx="170" cy="199" r="4" stroke-width="1.1" />
  <path class="f-seal k" d="M164 202h12v14h-12z" stroke-width="1.2" opacity=".85" />
  <Pad x={430} y={262} r={12} /><Tree x={34} y={198} s={0.8} /><Tree x={494} y={188} s={0.75} />
{:else if name === 'nha-hat-lon'}
  <!-- Nhà hát Lớn: tiền sảnh cột Corinth, mặt tiền có đầu hồi, mái vòm đồng xanh, cánh bên cửa vòm, bậc thềm -->
  <Clouds cy={110} r={106} puffs={false} />
  <Tree x={34} y={301} s={1.2} /><Tree x={486} y={301} s={1.15} />
  <!-- vòm -->
  <path class="f-leaf k" d="M214 128q0-48 46-48t46 48z" stroke-width="1.6" /><path class="kw" d="M232 128q4-40 28-48M260 128V80M288 128q-4-40-28-48" stroke-width="1" />
  <rect class="f-cream k" x="204" y="128" width="112" height="14" stroke-width="1.5" /><path class="k" d="M260 80V64" stroke-width="2" /><circle class="f-gold k" cx="260" cy="60" r="4" stroke-width="1" />
  <path class="f-void k" d="M236 142v-6a24 24 0 0 1 48 0v6z" stroke-width="1" opacity=".0" />
  <!-- thân + cánh -->
  <rect class="f-cream k" x="70" y="170" width="380" height="131" stroke-width="1.7" /><rect class="f-shade" x="430" y="170" width="20" height="131" />
  <path class="k" d="M64 170h392M70 178h380" stroke-width="2" /><path class="k" d={balustrade(76, 160, 368, 10, 8)} stroke-width="1" /><path class="k" d="M76 160h368" stroke-width="1.6" />
  <path class="kw" d={bricks(70, 262, 380, 39, 8, 22)} stroke-width=".7" opacity=".6" />
  {#each [86, 112, 138, 360, 386, 412] as x (x)}
    <path class="f-void k" d="M{x} 232v-34a8.5 8.5 0 0 1 17 0v34z" stroke-width="1.3" /><path class="kp" d="M{x + 8.5} 190v42" stroke-width=".8" />
    <path class="k" d="M{x - 3} 198q11.5-18 23 0" stroke-width="1" fill="none" />
  {/each}
  <!-- tiền sảnh: đầu hồi, hàng cột, cửa vòm, bậc -->
  <path class="f-cream k" d="M162 150l98-36l98 36z" stroke-width="1.7" /><path class="f-shade" d="M184 150l76-27l76 27z" opacity=".6" />
  <circle class="f-gold k" cx="260" cy="138" r="8" stroke-width="1.2" /><path class="k" d="M252 138h16M260 130v16" stroke-width="1" />
  <rect class="f-card k" x="158" y="150" width="204" height="14" stroke-width="1.5" /><path class="k" d="M158 156h204" stroke-width="1" />
  {#each cols as x (x)}
    <rect class="f-card k" x={x} y="164" width="9" height="119" stroke-width="1.3" /><path class="kw" d="M{x + 3} 166v115M{x + 6} 166v115" stroke-width=".7" />
    <path class="f-gold k" d="M{x - 2.5} 164h14l-2 8h-10zM{x - 2.5} 283h14v6h-14z" stroke-width="1" />
  {/each}
  <path class="f-void k" d="M232 283v-62a28 28 0 0 1 56 0v62z" stroke-width="1.6" /><path class="kp" d="M260 221v62M232 262h56" stroke-width="1" />
  <rect class="f-card k" x="150" y="289" width="220" height="6" stroke-width="1.3" /><rect class="f-card k" x="140" y="295" width="240" height="6" stroke-width="1.3" /><path class="kw" d="M232 295v6M260 295v6M288 295v6" stroke-width="1" />
  <path class="k" d="M96 301h330" stroke-width="1" /><path class="f-water" d="M0 301h520v24H0z" opacity=".0" />
{:else}
  <!-- đình làng Bắc Bộ: mái ngói đồ sộ với đầu đao cong, bờ nóc có rồng chầu, hàng cột lim, cửa bức bàn, sân gạch, cây đa và giếng làng -->
  <Clouds cy={118} r={104} puffs={false} />
  <path class="f-hill" d="M0 238q70-18 150-6t160-6t210 8v67H0z" opacity=".6" />
  <!-- cây đa -->
  <path class="f-hill2 k" d="M22 301q4-60 14-88q-26-4-30-30q6-24 36-26q10-26 44-18q30 4 30 28q24 6 18 34q-4 18-26 24q6 40 2 76z" stroke-width="1.4" opacity=".92" />
  <path class="k" d="M46 301q-2-40 6-70M64 301q0-34-4-60M72 230q10 30 8 71" stroke-width="2" />
  <path class="ks" d="M88 194v28M96 196v36M104 198v24" stroke-width="1.4" />
  <!-- nền thềm đá -->
  <rect class="f-card k" x="104" y="278" width="352" height="23" stroke-width="1.6" /><path class="k" d="M104 288h352" stroke-width="1" /><path class="kw" d={bricks(104, 288, 352, 13, 6, 22)} stroke-width=".7" />
  <path class="k" d="M236 278v23M284 278v23" stroke-width="1" />
  <!-- thân đình: sàn, cột, ván bưng, cửa bức bàn -->
  <rect class="f-cream k" x="124" y="196" width="312" height="82" stroke-width="1.6" /><rect class="f-shade" x="418" y="196" width="18" height="82" />
  <g class="f-acc2 k" stroke-width="1.4">{#each [124, 168, 212, 256, 300, 344, 388, 430] as x (x)}<rect {x} y="190" width="7" height="88" />{/each}</g>
  <path class="f-void k" d="M222 278v-62h76v62z" stroke-width="1.5" /><path class="kp" d="M241 216v62M260 216v62M279 216v62" stroke-width="1" />
  <g class="f-acc2 k" stroke-width="1.2"><rect x="138" y="214" width="62" height="46" /><rect x="320" y="214" width="62" height="46" /><rect x="394" y="214" width="30" height="46" /></g>
  <path class="ka" d="M138 237h62M169 214v46M320 237h62M351 214v46M394 237h30M409 214v46" stroke-width="1" />
  <path class="ka" d="M128 204h304M128 208h304" stroke-width="1.4" />
  <rect class="f-gold k" x="236" y="196" width="48" height="12" stroke-width="1.2" /><path class="ks" d="M242 202h36" stroke-width="1.6" />
  <!-- mái hai tầng đao cong -->
  <path class="f-seal2 k" d="M86 196q22-2 44-34h300q22 32 44 34q-30 14-64 6h-260q-34 8-64-6z" stroke-width="1.8" />
  <path class="ks" d={tiles(130, 430, 164, 198, 8, 0.07)} stroke-width="1.1" />
  <path class="f-seal k" d="M132 162q20-28 52-34h152q32 6 52 34z" stroke-width="1.7" /><path class="ks" d={tiles(176, 344, 130, 160, 8, 0.08)} stroke-width="1" />
  <path class="k" d="M170 164h180" stroke-width="2" />
  <path class="ks" d="M86 196q-12-4-14-18q10 0 16 10M474 196q12-4 14-18q-10 0-16 10M132 162q-10-6-10-20q10 2 14 14M428 162q10-6 10-20q-10 2-14 14" stroke-width="2.4" fill="none" />
  <!-- bờ nóc: lưỡng long chầu nhật -->
  <rect class="f-seal2 k" x="176" y="120" width="168" height="10" stroke-width="1.5" />
  <path class="f-gold k" d="M260 120q-10-8 0-20q10 12 0 20z" stroke-width="1.2" /><circle class="f-acc k" cx="260" cy="104" r="6" stroke-width="1.2" />
  <path class="ka" d="M180 120q-10-6-6-18q8-4 10 4q-4 4-2 8M340 120q10-6 6-18q-8-4-10 4q4 4 2 8M210 120q-6-8 0-14M310 120q6-8 0-14" stroke-width="2.2" fill="none" />
  <!-- sân gạch, giếng, ao sen -->
  <path class="f-card k" d="M0 301h520v6H0z" stroke-width="1.2" /><path class="kw" d={bricks(0, 307, 520, 18, 6, 22)} stroke-width=".8" />
  <path class="f-water" d="M360 308h160v17H360z" /><Pad x={410} y={316} r={9} /><Pad x={466} y={314} r={7} />
  <g class="k" stroke-width="1.3"><ellipse class="f-hill2" cx="70" cy="306" rx="20" ry="5" /><path class="f-card" d="M50 306v-8h40v8" /></g>
{/if}
