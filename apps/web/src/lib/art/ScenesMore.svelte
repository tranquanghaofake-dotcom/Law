<!-- Cảnh đầu trang bổ sung (đợt 6) cho các môn chưa có cảnh riêng. Khung 520×325, mặt đất y=301, khối phẳng + nét mảnh như các cảnh khác.
     Cách điệu, không phải công trình/thương hiệu cụ thể; không Quốc huy, Quốc kỳ, chân dung, logo. Nạp lười từ SubjectArt.svelte. -->
<script lang="ts">
  import type { ArtName } from './registry';
  import Clouds from './Clouds.svelte';
  import Tree from './parts/Tree.svelte';
  import QuocHoi from './QuocHoi.svelte';
  import { bricks, tiles } from './kit';
  let { name }: { name: ArtName } = $props();
  const grid = (x: number, y: number, w: number, h: number, nx: number, ny: number) => {
    let d = '';
    for (let i = 1; i < nx; i++) d += `M${x + (w * i) / nx} ${y}v${h}`;
    for (let j = 1; j < ny; j++) d += `M${x} ${y + (h * j) / ny}h${w}`;
    return d;
  };
  const row = (n: number, x0: number, dx: number) => Array.from({ length: n }, (_, i) => x0 + i * dx);
</script>

{#if name === 'quoc-hoi'}
  <QuocHoi />
{:else if name === 'nha-lang'}
  <!-- ngôi nhà ba gian mái ngói, sân, cây cau; hợp đồng dân sự gắn với nhà ở, tài sản, gia đình -->
  <Clouds cy={128} r={104} puffs={false} />
  <Tree x={70} y={301} s={1.15} /><Tree x={462} y={301} s={1} />
  <path class="f-seal k" d="M120 168l140-62l140 62z" stroke-width="1.8" /><path class="ks" d={tiles(150, 370, 140, 166, 8, 0.1)} stroke-width="1" opacity=".7" />
  <path class="f-seal2 k" d="M104 172h312l-14 16H118z" stroke-width="1.6" />
  <rect class="f-cream k" x="136" y="188" width="248" height="113" stroke-width="1.8" /><rect class="f-shade" x="354" y="188" width="30" height="113" />
  <path class="kw" d={bricks(136, 262, 248, 39, 8, 20)} stroke-width=".8" />
  <g class="f-acc2 k" stroke-width="1.6"><rect x="150" y="188" width="8" height="113" /><rect x="226" y="188" width="8" height="113" /><rect x="286" y="188" width="8" height="113" /><rect x="362" y="188" width="8" height="113" /></g>
  <path class="f-void k" d="M240 301v-62a20 20 0 0 1 40 0v62z" stroke-width="1.6" /><path class="kp" d="M260 219v82M240 262h40" stroke-width="1" />
  <g class="f-void k" stroke-width="1.4"><rect x="164" y="214" width="48" height="44" /><rect x="308" y="214" width="48" height="44" /></g>
  <path class="ka" d="M164 236h48M188 214v44M308 236h48M332 214v44" stroke-width="1.2" />
  <rect class="f-card k" x="116" y="293" width="288" height="8" stroke-width="1.4" />
  <path class="f-gold k" d="M248 186h24v10h-24z" stroke-width="1.2" /><path class="k" d="M260 120v-10" stroke-width="1.4" />
{:else if name === 'hop-dong'}
  <!-- bàn ký kết: hai bản hợp đồng, bút, con dấu, chìa khoá trao tay, nhà thu nhỏ làm đối tượng giao dịch -->
  <Clouds cy={130} r={104} puffs={false} />
  <Tree x={44} y={301} s={1} /><Tree x={478} y={301} s={0.95} />
  <rect class="f-acc2 k" x="80" y="210" width="360" height="22" rx="3" stroke-width="1.8" /><path class="k" d="M110 232v69M410 232v69" stroke-width="5" /><path class="kw" d="M90 221h340" stroke-width="1" />
  <path class="f-cream k" d="M120 120h130v92H120z" stroke-width="1.6" /><path class="k" d="M134 138h100M134 150h100M134 162h100M134 174h60" stroke-width="1.1" />
  <path class="f-card k" d="M270 112h130v100H270z" stroke-width="1.6" /><path class="k" d="M284 130h100M284 142h100M284 154h100M284 166h50" stroke-width="1.1" /><rect class="f-shade" x="370" y="112" width="30" height="100" />
  <path class="ks" d="M296 192q8-12 16 0t16 0t16-2" stroke-width="2" /><circle class="f-seal k" cx="196" cy="188" r="15" stroke-width="1.6" /><circle class="kp" cx="196" cy="188" r="10" stroke-width="1" /><path class="kp" d="M191 188l4 4l8-9" stroke-width="2" />
  <path class="f-acc k" d="M352 70l14 8l-34 70l-12 4l2-12z" stroke-width="1.5" /><path class="k" d="M326 142l4 8" stroke-width="1.6" />
  <path class="f-gold k" d="M236 262a10 10 0 1 1 6 9l-4 4h-6v-6l4-4" stroke-width="1.4" /><path class="k" d="M244 268h40M274 268v8M282 268v6" stroke-width="2" />
  <path class="f-seal k" d="M150 262l22-16l22 16z" stroke-width="1.4" /><rect class="f-cream k" x="156" y="262" width="32" height="30" stroke-width="1.4" /><rect class="f-void" x="166" y="274" width="12" height="18" />
{:else if name === 'cang-bien'}
  <!-- cảng biển: tàu chở container, cần cẩu, sóng -->
  <Clouds cy={118} r={100} puffs={false} ground={false} />
  <rect class="f-water" x="16" y="262" width="488" height="40" rx="20" opacity=".55" /><path class="s-water" d="M40 276q10-5 20 0t20 0t20 0M330 288q10-5 20 0t20 0t20 0M170 296q10-5 20 0t20 0" stroke-width="1.4" fill="none" />
  <path class="f-acc2 k" d="M60 244h330l-34 40H100z" stroke-width="1.8" /><path class="f-seal" d="M72 256h300l-8 10H80z" opacity=".5" />
  <g stroke-width="1.4" class="k"><rect class="f-seal" x="110" y="214" width="46" height="30" /><rect class="f-acc" x="158" y="214" width="46" height="30" /><rect class="f-leaf" x="206" y="214" width="46" height="30" /><rect class="f-acc" x="134" y="184" width="46" height="30" /><rect class="f-cream" x="182" y="184" width="46" height="30" /><rect class="f-seal2" x="158" y="154" width="46" height="30" /></g>
  <path class="kw" d="M122 214v30M134 214v30M170 214v30M182 214v30M218 214v30M230 214v30" stroke-width=".8" />
  <rect class="f-cream k" x="296" y="196" width="60" height="48" stroke-width="1.6" /><path class="f-void k" d="M304 206h44v14h-44z" stroke-width="1" /><rect class="f-seal k" x="318" y="172" width="12" height="24" stroke-width="1.4" />
  <path class="k" d="M404 301V84M436 301V84M404 84h32M404 120l32-16M404 160l32-24M404 200l32-24M404 240l32-24M404 280l32-24" stroke-width="1.6" /><path class="f-acc k" d="M330 84h140v12H330z" stroke-width="1.6" /><path class="k" d="M352 96v50" stroke-width="1.2" /><rect class="f-seal k" x="338" y="146" width="28" height="20" stroke-width="1.4" />
  <path class="f-card k" d="M390 301h60v-14h-60z" stroke-width="1.4" />
{:else if name === 'pho-hang'}
  <!-- dãy cửa hiệu hai bên phố: mái hiên, biển hiệu, cửa kính, sạp đối diện nhau -->
  <Clouds cy={122} r={100} puffs={false} />
  <Tree x={40} y={301} s={0.95} /><Tree x={482} y={301} s={0.95} />
  <rect class="f-cream k" x="70" y="156" width="104" height="145" stroke-width="1.8" /><path class="f-seal k" d="M62 156h120l-8-22H70z" stroke-width="1.6" /><path class="kp" d="M80 156l-4-22M96 156l-2-22M112 156v-22M128 156l2-22M144 156l4-22M160 156l6-22" stroke-width="1" />
  <rect class="f-void k" x="82" y="176" width="52" height="64" stroke-width="1.4" /><path class="kp" d="M108 176v64M82 208h52" stroke-width=".8" /><rect class="f-void k" x="144" y="196" width="22" height="105" stroke-width="1.4" /><rect class="f-acc k" x="82" y="244" width="52" height="14" stroke-width="1.2" />
  <rect class="f-card k" x="190" y="104" width="140" height="197" stroke-width="1.8" /><rect class="f-shade" x="304" y="104" width="26" height="197" /><rect class="f-acc k" x="184" y="94" width="152" height="12" stroke-width="1.6" />
  <path class="kw" d={grid(190, 118, 140, 120, 5, 6)} stroke-width="1" /><rect class="f-seal k" x="214" y="248" width="92" height="22" rx="2" stroke-width="1.4" /><path class="kp" d="M226 259h68" stroke-width="2" /><rect class="f-void k" x="236" y="270" width="28" height="31" stroke-width="1.4" />
  <rect class="f-cream k" x="346" y="168" width="104" height="133" stroke-width="1.8" /><path class="f-acc k" d="M338 168h120l-8-22H346z" stroke-width="1.6" /><path class="kp" d="M348 168l-3-22M366 168l-1-22M384 168v-22M402 168l1-22M420 168l3-22M438 168l5-22" stroke-width="1" />
  <rect class="f-void k" x="360" y="188" width="76" height="52" stroke-width="1.4" /><path class="kp" d="M398 188v52" stroke-width=".8" /><rect class="f-cream k" x="372" y="204" width="20" height="14" stroke-width="1" /><rect class="f-cream k" x="404" y="204" width="20" height="14" stroke-width="1" />
  <path class="f-gold k" d="M236 82h48l8 12h-64z" stroke-width="1.2" /><path class="ka" d="M158 118l12-6v12zM356 126l12-6v12z" stroke-width="1.2" />
{:else if name === 'nha-may'}
  <!-- khu công nghiệp: xưởng mái răng cưa, ống khói, hàng công nhân mũ bảo hộ -->
  <Clouds cy={118} r={100} puffs={false} />
  <path class="f-cream k" d="M70 301V190l60-40v40l60-40v40l60-40v40l60-40v40h50v111z" stroke-width="1.8" /><path class="f-shade" d="M130 150l-60 40v8l60-40zM190 150l-60 40v8l60-40zM250 150l-60 40v8l60-40zM310 150l-60 40v8l60-40z" />
  <path class="kw" d={bricks(70, 214, 340, 87, 10, 24)} stroke-width=".8" />
  <g class="f-void k" stroke-width="1.2">{#each row(6, 92, 54) as x (x)}<rect x={x} y="224" width="32" height="22" />{/each}</g>
  <rect class="f-acc k" x="206" y="256" width="68" height="45" stroke-width="1.6" /><path class="k" d="M240 256v45M206 278h68" stroke-width="1" />
  <rect class="f-seal k" x="418" y="100" width="26" height="201" stroke-width="1.8" /><path class="kp" d="M418 124h26M418 150h26" stroke-width="1.6" /><path class="k drift" d="M424 90q6-12 14 0q6-12 14-2" stroke-width="1.4" opacity=".7" />
  <rect class="f-seal2 k" x="448" y="170" width="20" height="131" stroke-width="1.6" />
  <g transform="translate(60 0)">{#each [0, 1, 2] as i (i)}<g transform="translate({i * 26} 0)"><circle class="f-cream k" cx="26" cy="272" r="6" stroke-width="1.3" /><path class="f-acc k" d="M19 270q0-9 7-9t7 9z" stroke-width="1.2" /><path class="f-acc2 k" d="M17 301q0-18 9-18t9 18z" stroke-width="1.3" /></g>{/each}</g>
{:else if name === 'san-bay'}
  <!-- lao động đi nước ngoài: máy bay cất cánh, nhà ga, vali -->
  <Clouds cy={124} r={104} puffs={false} />
  <rect class="f-card k" x="60" y="196" width="190" height="105" stroke-width="1.8" /><rect class="f-shade" x="222" y="196" width="28" height="105" /><path class="f-acc k" d="M52 196h206l-10-18H62z" stroke-width="1.6" />
  <path class="kw" d={grid(60, 210, 190, 70, 8, 3)} stroke-width="1" /><rect class="f-void k" x="130" y="258" width="50" height="43" stroke-width="1.4" /><path class="kp" d="M155 258v43" stroke-width="1" />
  <rect class="f-cream k" x="200" y="150" width="22" height="46" stroke-width="1.5" /><path class="f-seal k" d="M196 150h30l-4-10h-22z" stroke-width="1.2" /><rect class="f-void k" x="204" y="160" width="14" height="10" stroke-width="1" />
  <g transform="translate(40 -14)"><path class="f-cream k" d="M268 164l130-36q14-4 22 4l-8 16l-60 20l-48 52l-18-4l26-44l-62 12l-14 12l-12-4l12-18z" stroke-width="1.6" /><path class="f-seal" d="M398 128q14-4 22 4l-6 10l-22-6z" /></g>
  <path class="ka" d="M340 182q-30 26-68 30M370 166q-40 34-84 40" stroke-width="1.4" stroke-dasharray="4 4" />
  <rect class="f-seal2 k" x="320" y="262" width="44" height="34" rx="4" stroke-width="1.6" /><path class="k" d="M332 262v-8q0-4 4-4h16q4 0 4 4v8M320 276h44" stroke-width="1.4" /><rect class="f-acc k" x="376" y="274" width="32" height="22" rx="3" stroke-width="1.4" />
{:else if name === 'ruong-lua'}
  <!-- ruộng bậc thang nhiều tầng xa–gần: núi xa, tầng ruộng thu nhỏ dần, bờ ruộng uốn, đường đất, người cấy lúa đội nón, cột mốc, sổ chứng nhận -->
  <Clouds cy={110} r={96} puffs={false} hills ground={false} />
  <clipPath id="sm-ruong"><rect x="16" y="150" width="488" height="152" rx="34" /></clipPath>
  <g clip-path="url(#sm-ruong)">
    <path class="f-hill2" d="M0 190q60-34 130-14t140-6t130 8t120-4v140H0z" />
    <path class="f-leaf2 k" d="M0 196q130-16 260-6t260-4v30q-130-6-260 0t-260-6z" stroke-width="1.2" />
    <path class="f-leaf k" d="M0 214q130-18 260-8t260-6v34q-130-8-260-2t-260-8z" stroke-width="1.3" />
    <path class="f-leaf2 k" d="M0 236q130-22 260-10t260-8v40q-130-10-260-2t-260-10z" stroke-width="1.4" />
    <path class="f-leaf k" d="M0 262q130-26 260-12t260-10v70H0z" stroke-width="1.5" />
    <path class="f-water" d="M40 242q60-8 110-2v10q-50-4-110 2zM330 236q60-6 120 0v9q-60-4-120 2z" opacity=".55" />
    <path class="k" d={Array.from({ length: 22 }, (_, i) => `M${12 + i * 24} ${204 + (i % 3)}l-1-5M${18 + i * 24} ${206 - (i % 2)}l1-6`).join('') + Array.from({ length: 16 }, (_, i) => `M${20 + i * 32} ${230 + (i % 3) * 2}l-2-7M${27 + i * 32} ${232}l2-8`).join('')} stroke-width="1" />
    <path class="f-acc2 k" d="M244 320q-4-30 6-52t14-44t0-34l10-2q-2 18 0 34t-8 46t-2 52z" stroke-width="1.4" />
    <path class="kw" d="M258 280q6-20 8-36M262 250q4-14 4-26" stroke-width="1" />
  </g>
  <Tree x={62} y={198} s={0.5} /><Tree x={452} y={196} s={0.45} />
  <g transform="translate(150 292)"><path class="f-acc k" d="M-18 -42h36l-18-17z" stroke-width="1.5" /><circle class="f-cream k" cx="0" cy="-34" r="7" stroke-width="1.4" /><path class="f-seal2 k" d="M-11 6q0-28 11-28t11 28z" stroke-width="1.5" /><path class="k" d="M-14 -4l-12 12M14 -4l14 8" stroke-width="2.2" /><path class="kw" d="M-30 12q10-4 20 0M16 8q8-4 16 0" stroke-width="1.2" /></g>
  <rect class="f-cream k" x="372" y="262" width="12" height="38" stroke-width="1.6" /><path class="f-acc k" d="M384 266h22l-5 7l5 7h-22z" stroke-width="1.3" />
  <rect class="f-seal2 k" x="424" y="272" width="42" height="28" rx="2" stroke-width="1.5" /><circle class="kg" cx="445" cy="283" r="6" stroke-width="1" /><path class="kg" d="M432 293h26" stroke-width="1" />
{:else if name === 'toa-ngan-hang'}
  <!-- trụ sở ngân hàng: mặt tiền cột, bậc thềm, két sắt, đồng xu -->
  <Clouds cy={130} r={106} puffs={false} />
  <Tree x={44} y={301} s={1} /><Tree x={478} y={301} s={0.95} />
  <rect class="f-cream k" x="110" y="168" width="300" height="12" stroke-width="1.6" /><path class="f-card k" d="M110 168l150-72l150 72z" stroke-width="1.8" /><circle class="f-gold k" cx="260" cy="148" r="16" stroke-width="1.6" /><path class="k" d="M260 138v20M254 144h9a4 4 0 0 1 0 8h-6a4 4 0 0 0 0 8h10" stroke-width="1.6" />
  <g class="f-card k" stroke-width="1.5">{#each row(6, 128, 48) as x (x)}<rect x={x} y="180" width="20" height="94" />{/each}</g>
  <rect class="f-void k" x="232" y="226" width="56" height="48" stroke-width="1.5" /><circle class="f-acc k" cx="260" cy="250" r="12" stroke-width="1.5" /><path class="k" d="M260 238v24M248 250h24" stroke-width="1.2" />
  <rect class="f-card k" x="100" y="274" width="320" height="9" stroke-width="1.5" /><rect class="f-card k" x="90" y="283" width="340" height="9" stroke-width="1.5" /><rect class="f-card k" x="80" y="292" width="360" height="9" stroke-width="1.5" />
  <g class="f-gold k" stroke-width="1.2"><ellipse cx="52" cy="296" rx="16" ry="5" /><ellipse cx="52" cy="290" rx="16" ry="5" /><ellipse cx="52" cy="284" rx="16" ry="5" /><ellipse cx="468" cy="296" rx="16" ry="5" /><ellipse cx="468" cy="290" rx="16" ry="5" /></g>
{:else if name === 'ngan-sach'}
  <!-- ngân sách và thuế: biểu đồ tròn, cột thu–chi, hoá đơn %, tháp tiền -->
  <Clouds cy={128} r={104} puffs={false} />
  <circle class="f-cream k" cx="170" cy="190" r="74" stroke-width="1.8" /><path class="f-acc k" d="M170 190V116a74 74 0 0 1 64 37z" stroke-width="1.5" /><path class="f-leaf k" d="M170 190l64-37a74 74 0 0 1 10 51z" stroke-width="1.5" /><path class="f-seal k" d="M170 190l74 14a74 74 0 0 1-78 60z" stroke-width="1.5" /><path class="f-acc2 k" d="M170 190l-4 74A74 74 0 0 1 98 150z" stroke-width="1.5" />
  <circle class="f-card k" cx="170" cy="190" r="20" stroke-width="1.5" /><path class="k" d="M170 178v24M163 185h9a4 4 0 0 1 0 8h-7a4 4 0 0 0 0 8h11" stroke-width="1.6" />
  <path class="k" d="M296 301V110M296 301h180" stroke-width="2" /><rect class="f-acc k" x="314" y="226" width="30" height="75" stroke-width="1.5" /><rect class="f-leaf k" x="352" y="190" width="30" height="111" stroke-width="1.5" /><rect class="f-acc k" x="390" y="150" width="30" height="151" stroke-width="1.5" /><rect class="f-seal k" x="428" y="120" width="30" height="181" stroke-width="1.5" />
  <path class="ka" d="M312 214l40-30l40-38l60-34M440 94h12v12" stroke-width="2" />
  <path class="f-cream k" d="M300 70h56v62l-8-5l-10 5l-10-5l-10 5l-10-5l-8 5z" stroke-width="1.5" /><circle class="f-acc k" cx="316" cy="88" r="5" stroke-width="1.1" /><circle class="f-acc k" cx="340" cy="112" r="5" stroke-width="1.1" /><path class="k" d="M342 84l-26 32" stroke-width="1.6" />
{:else if name === 'tri-tue'}
  <!-- tài sản trí tuệ: bóng đèn ý tưởng, ký hiệu bản quyền, nhãn hiệu, sách, bút -->
  <Clouds cy={132} r={108} puffs={false} />
  <path class="f-gold k" d="M260 56a58 58 0 0 1 32 106v28h-64v-28a58 58 0 0 1 32-106z" stroke-width="2" /><path class="k" d="M236 200h48M240 212h40M246 224h28" stroke-width="3" /><path class="kg" d="M260 20v18M196 52l12 12M324 52l-12 12M168 112h18M334 112h18" stroke-width="2.4" />
  <path class="k" d="M244 150v-34h32v34M244 116l8 10l8-10l8 10l8-10" stroke-width="1.6" />
  <circle class="f-cream k" cx="110" cy="206" r="40" stroke-width="2" /><circle class="kg" cx="110" cy="206" r="33" stroke-width="1.2" stroke-dasharray="2 3" /><path class="k" d="M128 190a22 22 0 1 0 0 32" stroke-width="6" />
  <path class="f-cream k" d="M360 290q40-14 80 0V210q-40-14-80 0z" stroke-width="1.8" /><path class="k" d="M400 214v76M370 226h20M370 240h20M410 226h20M410 240h20" stroke-width="1.2" />
  <path class="f-cream k" d="M392 150h56l20 20v50h-76z" stroke-width="1.6" transform="translate(0 -40)" /><circle class="f-seal k" cx="456" cy="112" r="14" stroke-width="1.6" /><path class="kp" d="M450 118V106h7a4 4 0 0 1 0 8h-7M457 114l5 6" stroke-width="2" />
  <path class="f-acc2 k" d="M70 120l50-50l10 10l-50 50l-18 6z" stroke-width="1.6" />
{:else if name === 'phap-dinh'}
  <!-- pháp đình hình sự: bàn hội đồng xét xử, biển chức danh, tập hồ sơ vụ án buộc dây, còng; hai cột (không vẽ búa gỗ) -->
  <Clouds cy={130} r={106} puffs={false} />
  <g class="f-card k" stroke-width="1.7"><rect x="64" y="104" width="30" height="190" /><rect x="426" y="104" width="30" height="190" /></g><rect class="f-acc k" x="56" y="94" width="46" height="12" stroke-width="1.5" /><rect class="f-acc k" x="418" y="94" width="46" height="12" stroke-width="1.5" /><rect class="f-card k" x="52" y="294" width="54" height="8" stroke-width="1.4" /><rect class="f-card k" x="414" y="294" width="54" height="8" stroke-width="1.4" />
  <path class="f-acc2 k" d="M150 170h220v131H150z" stroke-width="1.8" /><path class="kg" d="M150 186h220M164 170v131M356 170v131" stroke-width="1.2" opacity=".8" /><rect class="f-acc k" x="140" y="158" width="240" height="14" rx="2" stroke-width="1.6" />
  <rect class="f-seal2 k" x="172" y="116" width="80" height="42" stroke-width="1.6" /><path class="kg" d="M180 124h64M180 150h64" stroke-width="1.2" /><rect class="f-cream k" x="190" y="130" width="44" height="12" stroke-width="1" />
  <rect class="f-cream k" x="296" y="140" width="64" height="18" rx="2" stroke-width="1.6" /><rect class="f-card k" x="300" y="128" width="56" height="12" rx="2" stroke-width="1.6" /><rect class="f-cream k" x="304" y="117" width="48" height="11" rx="2" stroke-width="1.6" /><path class="ks" d="M328 114v44M316 134h24" stroke-width="2" /><circle class="f-seal" cx="328" cy="134" r="3.4" />
  <path class="kg" d="M200 196h120M200 252h120M258 196v56" stroke-width="1.2" opacity=".7" />
  <g transform="translate(262 149) scale(.5)"><circle class="f-card k" cx="0" cy="0" r="16" stroke-width="4" /><circle class="f-card k" cx="36" cy="0" r="16" stroke-width="4" /><path class="k" d="M16 0h4" stroke-width="5" /></g>
{:else if name === 'che-cho'}
  <!-- an sinh xã hội: chiếc ô lớn che mái nhà, gia đình, người cao tuổi, cây thuốc, thẻ -->
  <Clouds cy={132} r={106} puffs={false} />
  <Tree x={58} y={301} s={1.05} /><Tree x={466} y={301} s={1} />
  <path class="f-seal k" d="M110 168q0-98 150-98t150 98q-38-24-75 0q-38-24-75 0q-38-24-75 0q-37-24-75 0z" stroke-width="1.8" /><path class="kp" d="M160 98q-14 34-14 68M210 78q-12 40-12 88M260 70v96M310 78q12 40 12 88M360 98q14 34 14 68" stroke-width="1.1" /><path class="k" d="M260 70v-14M260 168v82a14 14 0 0 1-28 0" stroke-width="3" />
  <path class="f-cream k" d="M170 266l90-52l90 52z" stroke-width="1.6" transform="translate(0 4)" /><rect class="f-cream k" x="188" y="270" width="144" height="31" stroke-width="1.6" /><rect class="f-void k" x="252" y="278" width="16" height="23" stroke-width="1.2" />
  <circle class="f-cream k" cx="358" cy="266" r="9" stroke-width="1.4" /><path class="f-acc k" d="M344 301q0-26 14-26t14 26z" stroke-width="1.4" /><circle class="f-cream k" cx="392" cy="276" r="6" stroke-width="1.3" /><path class="f-leaf2 k" d="M382 301q0-18 10-18t10 18z" stroke-width="1.3" /><path class="k" d="M148 301l8-30M150 281l-8 4" stroke-width="2" />
{:else if name === 'cuon-van-ban'}
  <!-- xây dựng văn bản pháp luật: cuộn giấy lớn, bút lông, con dấu, chồng hồ sơ, quy trình mũi tên -->
  <Clouds cy={130} r={104} puffs={false} />
  <rect class="f-acc2 k" x="104" y="96" width="312" height="16" rx="8" stroke-width="1.8" /><rect class="f-cream k" x="122" y="112" width="276" height="156" stroke-width="1.8" /><rect class="f-shade" x="372" y="112" width="26" height="156" /><rect class="f-acc2 k" x="104" y="268" width="312" height="16" rx="8" stroke-width="1.8" />
  <text class="f-seal" x="260" y="142" text-anchor="middle" style="font: 800 15px/1 var(--font-ui); letter-spacing: .12em">DỰ THẢO</text><path class="k" d="M142 160h200M142 174h200M142 188h200M142 202h130M142 224h100" stroke-width="1.3" />
  <circle class="f-seal k" cx="336" cy="232" r="20" stroke-width="1.6" /><circle class="kp" cx="336" cy="232" r="14" stroke-width="1.2" /><path class="kp" d="M328 232l6 6l11-12" stroke-width="2.4" />
  <path class="f-acc2 k" d="M436 70l22 22l-90 130l-26 6l6-26z" stroke-width="1.7" /><path class="k" d="M446 80l22 22" stroke-width="1.6" />
  <path class="ka" d="M78 190h18l-5-5M96 190l-5 5M424 262h18l-5-5" stroke-width="1.6" />
  <rect class="f-card k" x="48" y="262" width="46" height="9" stroke-width="1.3" /><rect class="f-cream k" x="52" y="253" width="40" height="9" stroke-width="1.3" /><rect class="f-card k" x="50" y="244" width="44" height="9" stroke-width="1.3" />
{/if}
