<script lang="ts">
  // Tranh nhỏ cho bộ đề 10 câu: vẽ đối tượng/tình huống mà luật điều chỉnh. Tránh hình châm biếm cơ quan ban hành (vd. cán cân + tiền).
  import type { VignetteName } from './registry';
  import { ring, bricks } from './kit';
  let { name, class: cls = '' }: { name: VignetteName; class?: string } = $props();
  const doors = [20, 46, 72];
</script>

<svg class="art vignette {cls}" viewBox="0 0 160 100" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
  <circle class="f-sun" cx="80" cy="52" r="40" />
  <path class="f-sunline" d={ring(80, 52, 35, 39, 32)} />
  <circle class="kg" cx="80" cy="52" r="32" stroke-width="1" stroke-dasharray="1 3" />
  <rect class="f-line" x="8" y="90" width="144" height="3" rx="1.5" />
  <path class="k" d="M14 90l-2-4M17 90l1-5M143 90l-2-4M146 90l1-5" stroke-width=".8" />
  {#if name === 'quan-he'}
    <!-- hai chủ thể + văn bản có dấu: quan hệ pháp luật -->
    <circle class="f-cream k" cx="32" cy="36" r="9" stroke-width="1.3" />
    <path class="f-void" d="M23 33q2-9 9-9q8 0 9 9q-4-4-9-4t-9 4z" />
    <path class="f-acc k" d="M16 90v-20q0-16 16-16t16 16v20z" stroke-width="1.3" />
    <path class="f-cream k" d="M28 54l4 6l4-6" stroke-width="1" />
    <path class="k" d="M24 72v18M40 72v18" stroke-width=".9" />
    <circle class="f-cream k" cx="128" cy="36" r="9" stroke-width="1.3" />
    <path class="f-void" d="M119 31q3-8 9-8q7 0 9 8q-3 3-9 3t-9-3z" />
    <path class="f-seal k" d="M112 90v-20q0-16 16-16t16 16v20z" stroke-width="1.3" />
    <path class="f-cream k" d="M124 54l4 7l4-7" stroke-width="1" />
    <path class="k" d="M120 72v18M136 72v18" stroke-width=".9" />
    <path class="f-card k" d="M62 28h28l8 8v50H62z" stroke-width="1.3" />
    <path class="f-shade k" d="M90 28v8h8z" stroke-width="1" />
    <path class="k" d="M68 42h24M68 49h24M68 56h24M68 63h16" stroke-width=".8" />
    <circle class="f-seal k" cx="88" cy="76" r="6.5" stroke-width="1" />
    <circle class="kp" cx="88" cy="76" r="4" stroke-width=".8" />
    <path class="k" d="M68 78h10" stroke-width="1" />
    <path class="ka" d="M50 66h8l-2.5-2.5M110 66h-8l2.5 2.5" stroke-width="1.4" />
  {:else if name === 'vi-pham'}
    <!-- đèn giao thông + biên bản có dấu + bút: vi phạm và trách nhiệm -->
    <rect class="f-void k" x="28" y="12" width="22" height="52" rx="5" stroke-width="1.3" />
    <path class="f-shade k" d="M24 18h4M24 34h4M24 50h4M50 18h4M50 34h4M50 50h4" stroke-width="1.2" />
    <circle class="f-seal" cx="39" cy="24" r="5.5" /><circle class="f-acc" cx="39" cy="38" r="5.5" opacity=".45" /><circle class="f-leaf" cx="39" cy="52" r="5.5" opacity=".45" />
    <path class="kp" d="M36 21a4 4 0 0 1 4-1.5" stroke-width="1" />
    <path class="k" d="M39 64v26" stroke-width="2" />
    <path class="f-card k" d="M72 22h50v66H72z" stroke-width="1.3" />
    <rect class="f-cream k" x="72" y="22" width="50" height="10" stroke-width="1.3" />
    <path class="k" d="M78 27h26M80 40h34M80 47h34M80 54h26M80 61h34M80 68h18" stroke-width=".8" />
    <circle class="f-seal k" cx="110" cy="76" r="8" stroke-width="1" />
    <circle class="kp" cx="110" cy="76" r="5" stroke-width=".8" />
    <circle class="kp" cx="110" cy="76" r="1.6" stroke-width=".8" />
    <path class="f-acc k" d="M126 58l16-16l4 4l-16 16l-6 2z" stroke-width="1.2" />
    <path class="f-void" d="M124 62l-2 6l6-2z" />
  {:else if name === 'dat-coc'}
    <!-- dãy nhà trọ + chìa khoá + phong bì cọc -->
    <path class="f-seal k" d="M6 46l50-16l50 16z" stroke-width="1.3" />
    <path class="ks" d="M20 42l36-11l36 11" stroke-width=".8" />
    <rect class="f-card" x="12" y="46" width="88" height="44" />
    <path class="kw" d={bricks(12, 46, 88, 44, 7, 14)} stroke-width=".6" />
    <rect class="k" x="12" y="46" width="88" height="44" stroke-width="1.3" />
    {#each doors as x (x)}
      <rect class="f-void k" x={x} y="62" width="14" height="28" stroke-width="1" />
      <circle class="f-acc" cx={x + 11} cy="77" r="1.2" />
      <rect class="f-cream k" x={x + 2} y="51" width="10" height="7" stroke-width=".8" />
      <path class="k" d="M{x + 7} 51v7" stroke-width=".6" />
    {/each}
    <path class="f-card k" d="M112 60h38v28h-38z" stroke-width="1.2" />
    <path class="k" d="M112 60l19 14l19-14M112 88l14-12M150 88l-14-12" stroke-width="1" />
    <circle class="f-seal k" cx="131" cy="72" r="4" stroke-width=".8" />
    <circle class="f-acc k" cx="124" cy="34" r="8" stroke-width="1.2" />
    <circle class="f-sun k" cx="124" cy="34" r="3" stroke-width=".8" />
    <path class="k" d="M132 34h18M142 34v6M147 34v4" stroke-width="1.6" />
  {:else if name === 'chuyen-khoan'}
    <!-- điện thoại chuyển khoản → ngân hàng (không vẽ tiền đặt lên cán cân) -->
    <rect class="f-void k" x="20" y="12" width="42" height="76" rx="7" stroke-width="1.3" />
    <rect class="f-card" x="24" y="20" width="34" height="58" rx="2" />
    <rect class="f-seal" x="24" y="20" width="34" height="9" />
    <path class="kp" d="M28 24.5h14" stroke-width="1" />
    <path class="k" d="M28 35h22M28 41h14" stroke-width=".8" />
    <rect class="f-acc k" x="28" y="48" width="26" height="12" rx="2" stroke-width="1" />
    <path class="k" d="M33 54h10l-2-2" stroke-width=".9" />
    <rect class="f-cream k" x="28" y="64" width="26" height="8" rx="2" stroke-width=".8" />
    <path class="kp" d="M36 83h10" stroke-width="1.2" />
    <path class="ka" d="M68 48h20l-5-5M88 48l-5 5" stroke-width="1.8" stroke-dasharray="3 3" />
    <path class="f-seal k" d="M94 38l30-17l30 17z" stroke-width="1.2" />
    <circle class="f-acc k" cx="124" cy="31" r="3" stroke-width=".8" />
    <rect class="f-cream k" x="96" y="38" width="56" height="6" stroke-width="1" />
    <g class="f-card k" stroke-width="1">
      <rect x="100" y="44" width="6" height="38" /><rect x="113" y="44" width="6" height="38" /><rect x="129" y="44" width="6" height="38" /><rect x="142" y="44" width="6" height="38" />
    </g>
    <rect class="f-card k" x="94" y="82" width="60" height="4" stroke-width="1" />
    <rect class="f-card k" x="90" y="86" width="68" height="4" stroke-width="1" />
  {:else}
    <!-- nhà máy mái răng cưa + đồng hồ + phong bì lương -->
    <path class="f-card k" d="M8 90V52l20-12v12l20-12v12l20-12v50z" stroke-width="1.3" />
    <path class="f-shade" d="M28 40l-20 12v2l20-12zM48 40l-20 12v2l20-12zM68 40l-20 12v2l20-12z" />
    <path class="kw" d={bricks(8, 56, 60, 34, 7, 12)} stroke-width=".6" />
    <rect class="f-seal k" x="72" y="16" width="10" height="74" stroke-width="1.2" />
    <path class="kp" d="M72 26h10M72 36h10" stroke-width="1" />
    <path class="k" d="M74 12q3-4 6 0q3-4 6 0" stroke-width=".9" opacity=".7" />
    <g class="f-void k" stroke-width=".8"><rect x="14" y="62" width="10" height="10" /><rect x="32" y="62" width="10" height="10" /><rect x="50" y="62" width="10" height="10" /></g>
    <rect class="f-void k" x="30" y="78" width="14" height="12" stroke-width=".8" />
    <circle class="f-card k" cx="116" cy="34" r="19" stroke-width="1.3" />
    <circle class="k" cx="116" cy="34" r="15.5" stroke-width=".7" />
    <path class="k" d="M116 22v12l8 6" stroke-width="1.6" />
    <path class="k" d="M116 18.5v2.5M116 47v2.5M100.5 34h2.5M129 34h2.5" stroke-width="1" />
    <rect class="f-acc k" x="98" y="62" width="46" height="26" rx="2" stroke-width="1.2" />
    <path class="k" d="M98 62l23 14l23-14" stroke-width="1" />
    <circle class="f-seal k" cx="121" cy="74" r="3.6" stroke-width=".8" />
  {/if}
</svg>
