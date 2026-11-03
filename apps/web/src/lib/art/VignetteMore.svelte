<script lang="ts">
  // Tranh nhỏ bổ sung cho bộ đề (đợt 6), khung 160×100 — phần nền (mặt trời, mặt đất) nằm ở Vignette.svelte; nạp lười.
  // Vẽ đối tượng/tình huống mà luật điều chỉnh; tránh hình châm biếm cơ quan ban hành, không Quốc huy/Quốc kỳ/logo thật.
  import type { VignetteName } from './registry';
  import { bricks } from './kit';
  let { name }: { name: VignetteName } = $props();
</script>

{#if name === 'nha-nuoc'}
  <!-- trụ sở với mái vòm, hai cánh, bậc thềm -->
  <rect class="f-card k" x="22" y="52" width="116" height="38" stroke-width="1.3" /><path class="kw" d={bricks(22, 52, 116, 38, 8, 16)} stroke-width=".6" />
  <rect class="f-cream k" x="52" y="40" width="56" height="50" stroke-width="1.3" />
  <path class="f-acc k" d="M56 40q24-30 48 0z" stroke-width="1.3" /><rect class="f-cream k" x="74" y="12" width="12" height="9" stroke-width="1" /><path class="k" d="M80 12V6" stroke-width="1.2" /><circle class="f-seal" cx="80" cy="5" r="2.2" />
  <g class="f-void k" stroke-width=".9"><rect x="58" y="52" width="6" height="30" /><rect x="70" y="52" width="6" height="30" /><rect x="84" y="52" width="6" height="30" /><rect x="96" y="52" width="6" height="30" /></g>
  <rect class="f-card k" x="16" y="86" width="128" height="4" stroke-width="1" />
  <g class="f-void k" stroke-width=".8"><rect x="32" y="62" width="8" height="12" /><rect x="120" y="62" width="8" height="12" /></g>
{:else if name === 'thu-tuc'}
  <!-- quầy một cửa: số thứ tự, hồ sơ, con dấu -->
  <rect class="f-card k" x="14" y="34" width="86" height="56" stroke-width="1.3" /><rect class="f-void k" x="24" y="44" width="40" height="22" rx="1" stroke-width="1.2" /><path class="kp" d="M44 44v22" stroke-width=".8" />
  <rect class="f-acc2 k" x="14" y="66" width="86" height="8" stroke-width="1.2" /><rect class="f-cream k" x="70" y="46" width="22" height="14" stroke-width="1" /><path class="k" d="M74 51h14M74 55h10" stroke-width=".8" />
  <rect class="f-void k" x="112" y="14" width="34" height="22" rx="2" stroke-width="1.2" /><text class="f-acc" x="129" y="31" text-anchor="middle" style="font: 800 15px/1 var(--font-ui)">012</text>
  <rect class="f-cream k" x="108" y="50" width="26" height="34" stroke-width="1.1" /><path class="k" d="M112 58h18M112 63h18M112 68h10" stroke-width=".8" />
  <path class="f-acc2 k" d="M126 78h14v-6h-3v-6h-8v6h-3z" stroke-width="1" /><path class="ks" d="M122 84h22" stroke-width="2" />
{:else if name === 'thua-ke'}
  <!-- ngôi nhà, cây gia phả, bản di chúc -->
  <path class="f-seal k" d="M14 52l32-22l32 22z" stroke-width="1.3" /><rect class="f-cream k" x="20" y="52" width="52" height="38" stroke-width="1.3" />
  <rect class="f-void k" x="40" y="64" width="12" height="26" stroke-width="1" /><rect class="f-acc k" x="26" y="60" width="9" height="9" stroke-width="1" /><rect class="f-acc k" x="57" y="60" width="9" height="9" stroke-width="1" />
  <path class="k" d="M116 30v10M104 40h24M104 40v8M128 40v8" stroke-width="1.2" /><circle class="f-acc k" cx="116" cy="24" r="6" stroke-width="1.1" /><circle class="f-cream k" cx="104" cy="54" r="6" stroke-width="1.1" /><circle class="f-cream k" cx="128" cy="54" r="6" stroke-width="1.1" />
  <path class="f-cream k" d="M92 72h26v14q0 3-3 3H95q-3 0-3-3z" stroke-width="1.1" /><path class="k" d="M97 77h16M97 82h12" stroke-width=".8" /><path class="f-seal" d="M128 80l-6 6l4 2l5-4z" /><path class="f-acc k" d="M142 66q-10 4-13 16l3 1q3-8 10-17z" stroke-width="1" />
{:else if name === 'boi-thuong'}
  <!-- chậu hoa vỡ, mảnh vỡ, biên nhận bồi thường -->
  <path class="f-acc2 k" d="M30 90l-6-26l26-6l6 28z" stroke-width="1.3" /><path class="k" d="M36 74l8 4l-3 8" stroke-width="1.1" />
  <path class="f-acc2 k" d="M56 90l6-10l10 10zM68 90l8-6l8 6z" stroke-width="1.1" />
  <path class="f-leaf k" d="M36 56q-4-14 6-18q4 8-2 16zM44 55q6-14 16-10q-2 10-12 13z" stroke-width="1.1" />
  <path class="f-cream k" d="M96 20h40v66h-40z" stroke-width="1.3" /><path class="k" d="M102 30h28M102 37h28M102 44h28M102 51h18" stroke-width=".9" /><circle class="f-acc k" cx="118" cy="66" r="8" stroke-width="1.2" /><path class="k" d="M118 61v10M115 64h5a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 3h5" stroke-width="1" />
  <path class="ka" d="M80 56h10l-3-3M90 56l-3 3" stroke-width="1.4" />
{:else if name === 'toi-pham'}
  <!-- còng tay và quyển bộ luật -->
  <rect class="f-seal2 k" x="14" y="56" width="52" height="34" rx="2" stroke-width="1.3" /><path class="kg" d="M20 62h40M20 84h40" stroke-width="1" /><rect class="f-cream k" x="26" y="68" width="28" height="9" stroke-width=".9" />
  <g class="k" stroke-width="3.2"><circle cx="92" cy="50" r="15" fill="none" /><circle cx="134" cy="50" r="15" fill="none" /></g>
  <rect class="f-acc k" x="84" y="30" width="16" height="9" rx="2" stroke-width="1.3" /><rect class="f-acc k" x="126" y="30" width="16" height="9" rx="2" stroke-width="1.3" />
  <g class="f-card k" stroke-width="1.6"><ellipse cx="111" cy="50" rx="6" ry="3.4" /><ellipse cx="118" cy="50" rx="6" ry="3.4" /></g>
{:else if name === 'lao-dong-dac-thu'}
  <!-- vali, hộ chiếu, máy bay -->
  <path class="k" d="M40 44v-6q0-4 4-4h20q4 0 4 4v6" stroke-width="1.6" /><rect class="f-acc2 k" x="24" y="44" width="56" height="42" rx="4" stroke-width="1.3" /><path class="k" d="M24 58h56M36 44v42M68 44v42" stroke-width="1" /><rect class="f-gold k" x="48" y="55" width="8" height="7" rx="1" stroke-width=".9" />
  <rect class="f-seal2 k" x="90" y="52" width="26" height="34" rx="2" stroke-width="1.2" /><circle class="ka" cx="103" cy="64" r="6" stroke-width="1" /><path class="ka" d="M97 64h12M103 58q-4 6 0 12q4-6 0-12M96 77h14" stroke-width=".8" />
  <path class="f-cream k" d="M148 18q3 0 2 3l-14 12l4 14l-3 1l-8-10l-8 7l1 6l-2 1l-4-7l-7-4l1-3l6 1l7-8l-12-5l2-3l14 3l11-9z" stroke-width="1" />
  <path class="ka" d="M96 36q12-10 22-4" stroke-width="1.2" stroke-dasharray="3 3" />
{:else if name === 'thua-dat'}
  <!-- thửa đất, cột mốc, sổ chứng nhận -->
  <path class="f-leaf2 k" d="M14 74l30-14h54l-14 26H14z" stroke-width="1.3" /><path class="k" d="M24 74l26-10M36 79l34-14M52 82l32-14" stroke-width=".8" />
  <path class="f-cream k" d="M14 74h70v8H14z" stroke-width="1" /><path class="k" d="M44 60v-14" stroke-width="1.4" /><path class="f-seal k" d="M44 46h14l-4 4l4 4H44z" stroke-width="1" />
  <path class="k" d="M14 74V62M84 86V74" stroke-width="2" />
  <rect class="f-seal2 k" x="106" y="26" width="34" height="46" rx="2" stroke-width="1.3" /><circle class="kg" cx="123" cy="42" r="7" stroke-width="1" /><path class="kg" d="M123 35v14M116 42h14M110 58h26M112 64h22" stroke-width=".9" />
  <path class="ka" d="M92 52h10l-3-3" stroke-width="1.4" />
{:else if name === 'du-an'}
  <!-- cần cẩu, khung toà nhà, bản vẽ -->
  <path class="k" d="M30 90V12M24 90V12h12v78" stroke-width="1.2" /><path class="k" d="M24 22l12 8M24 34l12 8M24 46l12 8M24 58l12 8M24 70l12 8" stroke-width=".7" /><path class="f-acc k" d="M10 12h74v6H10z" stroke-width="1.2" /><path class="k" d="M72 18v22" stroke-width="1" /><rect class="f-seal k" x="66" y="40" width="12" height="8" stroke-width="1" /><rect class="f-acc2 k" x="14" y="18" width="10" height="9" stroke-width="1" />
  <rect class="f-card k" x="90" y="46" width="44" height="44" stroke-width="1.3" /><path class="k" d="M90 60h44M90 74h44M105 46v44M120 46v44" stroke-width=".9" /><rect class="f-shade" x="124" y="46" width="10" height="44" />
  <path class="f-cream k" d="M96 18l30-4l6 14l-30 4z" stroke-width="1" /><path class="ka" d="M102 24l20-3M104 28l20-3" stroke-width=".8" />
{:else if name === 'ngan-sach-thue'}
  <!-- biểu đồ tròn ngân sách + hoá đơn thuế -->
  <circle class="f-cream k" cx="52" cy="52" r="28" stroke-width="1.3" /><path class="f-acc k" d="M52 52V24a28 28 0 0 1 24 14z" stroke-width="1.1" /><path class="f-leaf k" d="M52 52l24-14a28 28 0 0 1 4 24z" stroke-width="1.1" /><path class="f-seal k" d="M52 52l28 10a28 28 0 0 1-30 18z" stroke-width="1.1" />
  <path class="f-cream k" d="M100 14h40v72l-6-4l-7 4l-7-4l-7 4l-7-4l-6 4z" stroke-width="1.3" /><circle class="f-acc k" cx="112" cy="32" r="4" stroke-width="1" /><circle class="f-acc k" cx="128" cy="48" r="4" stroke-width="1" /><path class="k" d="M129 29L111 52M108 62h24M108 70h16" stroke-width="1.3" />
{:else if name === 'von-dn'}
  <!-- cột đồng xu tăng dần + mũi tên -->
  <g class="f-gold k" stroke-width="1"><ellipse cx="28" cy="82" rx="12" ry="4" /><ellipse cx="28" cy="76" rx="12" ry="4" /><ellipse cx="62" cy="82" rx="12" ry="4" /><ellipse cx="62" cy="76" rx="12" ry="4" /><ellipse cx="62" cy="70" rx="12" ry="4" /><ellipse cx="62" cy="64" rx="12" ry="4" />
  <ellipse cx="96" cy="82" rx="12" ry="4" /><ellipse cx="96" cy="76" rx="12" ry="4" /><ellipse cx="96" cy="70" rx="12" ry="4" /><ellipse cx="96" cy="64" rx="12" ry="4" /><ellipse cx="96" cy="58" rx="12" ry="4" /><ellipse cx="96" cy="52" rx="12" ry="4" /><ellipse cx="96" cy="46" rx="12" ry="4" /></g>
  <path class="ka" d="M18 60l30-14l24-8l36-20M96 18h12v12" stroke-width="2" /><rect class="f-cream k" x="118" y="46" width="28" height="40" rx="2" stroke-width="1.2" /><path class="k" d="M123 56h18M123 63h18M123 70h10" stroke-width=".9" />
{:else if name === 'canh-tranh'}
  <!-- hai sạp hàng đối diện, nhãn giá -->
  <path class="f-seal k" d="M10 40h56l-4-12H14z" stroke-width="1.2" /><path class="f-card k" d="M14 40h48v50H14z" stroke-width="1.2" /><rect class="f-acc2 k" x="14" y="66" width="48" height="8" stroke-width="1" /><rect class="f-cream k" x="22" y="48" width="14" height="14" stroke-width=".9" />
  <path class="f-acc k" d="M94 40h56l-4-12H98z" stroke-width="1.2" /><path class="f-card k" d="M98 40h48v50H98z" stroke-width="1.2" /><rect class="f-acc2 k" x="98" y="66" width="48" height="8" stroke-width="1" /><rect class="f-cream k" x="124" y="48" width="14" height="14" stroke-width=".9" />
  <path class="f-cream k" d="M70 20l12-6l12 6v12H70z" stroke-width="1.1" /><text class="f-seal" x="82" y="29" text-anchor="middle" style="font: 800 9px/1 var(--font-ui)">VS</text><path class="ka" d="M70 56h12M90 56h-12M86 52l4 4l-4 4" stroke-width="1.2" />
{:else if name === 'ban-quyen'}
  <!-- ký hiệu bản quyền, quyển sách, nốt nhạc, bút -->
  <circle class="f-cream k" cx="80" cy="46" r="26" stroke-width="1.5" /><circle class="kg" cx="80" cy="46" r="21.5" stroke-width="1" stroke-dasharray="2 2.5" /><path class="k" d="M91 36a14 14 0 1 0 0 20" stroke-width="4" />
  <path class="f-cream k" d="M12 86q14-6 28 0V54q-14-6-28 0z" stroke-width="1.2" /><path class="k" d="M26 56v30M16 62h7M16 68h7M30 62h7M30 68h7" stroke-width=".8" />
  <path class="f-seal k" d="M128 22v36a7 6 0 1 1-4-5V28l16-4v26a7 6 0 1 1-4-5V22z" stroke-width="1.2" /><path class="f-acc2 k" d="M118 86l20-20l4 4l-20 20l-7 2z" stroke-width="1.1" />
{:else if name === 'nhan-hieu'}
  <!-- bảng hiệu cửa hàng, thẻ nhãn, dấu đăng ký -->
  <rect class="f-card k" x="14" y="30" width="62" height="60" stroke-width="1.3" /><rect class="f-seal k" x="10" y="22" width="70" height="12" stroke-width="1.3" /><text class="kp" x="45" y="31" text-anchor="middle" style="font: 800 8px/1 var(--font-ui); fill: var(--card)">CỬA HÀNG</text>
  <rect class="f-void k" x="22" y="48" width="18" height="42" stroke-width="1" /><rect class="f-cream k" x="48" y="46" width="22" height="18" stroke-width="1" />
  <path class="f-cream k" d="M96 24h38l8 8v32l-26 26l-26-26z" stroke-width="1.3" transform="translate(-4 -2)" /><circle class="f-void" cx="130" cy="31" r="3" />
  <circle class="f-seal k" cx="112" cy="58" r="11" stroke-width="1.2" /><path class="kp" d="M108 63V53h5a3 3 0 0 1 0 6h-5M113 59l4 4" stroke-width="1.4" />
{:else if name === 'bao-hiem'}
  <!-- chiếc ô che gia đình, thẻ bảo hiểm -->
  <path class="f-seal k" d="M24 52q0-34 56-34t56 34q-14-9-28 0q-14-9-28 0q-14-9-28 0q-14-9-28 0z" stroke-width="1.3" /><path class="k" d="M80 52v28a6 6 0 0 1-12 0" stroke-width="2" /><path class="kp" d="M52 28q-4 10-4 22M80 18v32M108 28q4 10 4 22" stroke-width=".9" />
  <circle class="f-cream k" cx="110" cy="66" r="5" stroke-width="1.1" /><path class="f-acc k" d="M101 90q0-14 9-14t9 14z" stroke-width="1.1" /><circle class="f-cream k" cx="126" cy="72" r="4" stroke-width="1" /><path class="f-leaf2 k" d="M119 90q0-10 7-10t7 10z" stroke-width="1" />
  <rect class="f-cream k" x="22" y="66" width="34" height="22" rx="3" stroke-width="1.2" /><path class="f-seal" d="M30 70h4v4h4v4h-4v4h-4v-4h-4v-4h4z" /><path class="k" d="M42 74h10M42 80h8" stroke-width=".9" />
{:else if name === 'doanh-nghiep'}
  <!-- ba quy mô: cửa hàng, văn phòng, toà tháp -->
  <path class="f-seal k" d="M10 62h34l-3-10H13z" stroke-width="1.1" /><rect class="f-card k" x="12" y="62" width="30" height="28" stroke-width="1.1" /><rect class="f-void k" x="20" y="72" width="12" height="18" stroke-width=".9" />
  <rect class="f-cream k" x="52" y="40" width="40" height="50" stroke-width="1.2" /><path class="k" d="M52 52h40M52 64h40M52 76h40M72 40v50" stroke-width=".8" /><rect class="f-acc k" x="48" y="36" width="48" height="5" stroke-width="1" />
  <rect class="f-card k" x="104" y="12" width="26" height="78" stroke-width="1.2" /><rect class="f-shade" x="122" y="12" width="8" height="78" /><path class="kw" d={Array.from({ length: 12 }, (_, i) => `M104 ${20 + i * 6}h26`).join('')} stroke-width=".8" /><path class="f-acc k" d="M100 12h34l-4-6h-26z" stroke-width="1" />
  <path class="ka" d="M44 72h6M92 72h8" stroke-width="1.2" />
{:else if name === 'mua-ban'}
  <!-- kiện hàng, hoá đơn, xe tải nhỏ -->
  <rect class="f-acc2 k" x="14" y="62" width="30" height="28" stroke-width="1.2" /><path class="k" d="M14 72h30M29 62v10" stroke-width="1" /><rect class="f-acc2 k" x="30" y="40" width="26" height="22" stroke-width="1.2"/>
  <path class="k" d="M34 49h26M47 40v9" stroke-width="1" />
  <rect class="f-card k" x="70" y="52" width="40" height="30" stroke-width="1.3" /><path class="f-seal k" d="M110 60h14l8 10v12h-22z" stroke-width="1.3" /><rect class="f-cream k" x="114" y="63" width="10" height="8" stroke-width=".8" />
  <circle class="f-void k" cx="82" cy="84" r="6" stroke-width="1.2" /><circle class="f-void k" cx="122" cy="84" r="6" stroke-width="1.2" /><path class="k" d="M76 62h28M76 68h18" stroke-width=".9" />
  <path class="f-cream k" d="M70 14h34v30H70z" stroke-width="1.1" /><path class="k" d="M75 21h24M75 27h24M75 33h14" stroke-width=".8" /><circle class="f-seal" cx="96" cy="37" r="3" />
{:else if name === 'khoi-kien'}
  <!-- đơn khởi kiện có dấu, toà án, búa -->
  <rect class="f-cream k" x="14" y="16" width="42" height="64" stroke-width="1.3" /><rect class="f-seal" x="14" y="16" width="42" height="9" /><path class="kp" d="M20 20.5h18" stroke-width="1" /><path class="k" d="M20 33h30M20 40h30M20 47h30M20 54h18" stroke-width=".9" /><circle class="f-seal k" cx="44" cy="68" r="6" stroke-width="1" /><path class="kp" d="M41 68l2 2l4-4" stroke-width="1.2" />
  <path class="f-card k" d="M76 44l32-18l32 18z" stroke-width="1.3" /><rect class="f-acc k" x="76" y="44" width="64" height="5" stroke-width="1" /><g class="f-card k" stroke-width="1"><rect x="82" y="49" width="6" height="30" /><rect x="96" y="49" width="6" height="30" /><rect x="114" y="49" width="6" height="30" /><rect x="128" y="49" width="6" height="30" /></g><rect class="f-card k" x="72" y="79" width="72" height="6" stroke-width="1" />
  <path class="ka" d="M60 62h10l-3-3" stroke-width="1.4" />
{:else if name === 'van-ban'}
  <!-- cuộn văn bản, bút lông, con dấu -->
  <rect class="f-acc2 k" x="14" y="22" width="132" height="8" rx="4" stroke-width="1.2" /><rect class="f-cream k" x="24" y="30" width="112" height="46" stroke-width="1.2" /><rect class="f-acc2 k" x="14" y="76" width="132" height="8" rx="4" stroke-width="1.2" />
  <path class="k" d="M32 40h54M32 47h54M32 54h54M32 61h36M96 40h32M96 47h32" stroke-width="1" /><text class="f-seal" x="112" y="62" text-anchor="middle" style="font: 800 8px/1 var(--font-ui)">ĐIỀU 1</text>
{/if}
