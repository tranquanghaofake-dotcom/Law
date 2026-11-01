<script lang="ts">
  // Tranh nhỏ cho bộ đề 10 câu: vẽ đối tượng/tình huống mà luật điều chỉnh. Tránh hình châm biếm cơ quan ban hành (vd. cán cân + tiền).
  import type { VignetteName } from './registry';
  let { name, class: cls = '' }: { name: VignetteName; class?: string } = $props();
  const doors = [22, 50, 78];
</script>

<svg class="art vignette {cls}" viewBox="0 0 160 100" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
  <circle class="f-sun" cx="80" cy="54" r="40" />
  <circle class="s-sunline" cx="80" cy="54" r="34" stroke-dasharray="2 4" />
  <rect class="f-line" x="10" y="90" width="140" height="3" rx="1.5" />
  {#if name === 'quan-he'}
    <!-- hai chủ thể + văn bản có dấu: quan hệ pháp luật -->
    <circle class="f-card s-line" cx="34" cy="38" r="9" />
    <path class="f-acc s-line" d="M18 90v-22q0-16 16-16t16 16v22z" />
    <circle class="f-card s-line" cx="126" cy="38" r="9" />
    <path class="f-seal s-line" d="M110 90v-22q0-16 16-16t16 16v22z" />
    <path class="f-card s-line" d="M64 30h26l8 8v46H64z" />
    <path class="s-line s-thin" d="M90 30v8h8M70 46h22M70 54h22M70 62h14" />
    <circle class="f-seal s-line s-thin" cx="88" cy="74" r="6" />
    <path class="s-line s-thin" d="M50 64h10l-3-3M110 64h-10l3 3" />
  {:else if name === 'vi-pham'}
    <!-- đèn giao thông + biên bản: vi phạm và trách nhiệm -->
    <rect class="f-void s-line" x="30" y="16" width="20" height="50" rx="5" />
    <circle class="f-seal" cx="40" cy="28" r="5" /><circle class="f-acc" cx="40" cy="41" r="5" /><circle class="f-leaf" cx="40" cy="54" r="5" />
    <path class="s-line" d="M40 66v24" />
    <path class="f-card s-line" d="M74 26h52v62H74z" />
    <path class="s-line s-thin" d="M82 36h36M82 44h36M82 52h28M82 60h36M82 68h20" />
    <circle class="f-seal s-line s-thin" cx="112" cy="76" r="8" />
    <circle class="s-line s-thin s-paper" cx="112" cy="76" r="5" />
    <path class="f-acc s-line" d="M128 58l14-14l4 4l-14 14l-6 2z" />
  {:else if name === 'dat-coc'}
    <!-- dãy nhà trọ + chìa khoá + phong bì cọc -->
    <path class="f-seal s-line" d="M8 46l50-14l50 14z" />
    <rect class="f-card s-line" x="14" y="46" width="88" height="44" />
    <g class="f-void">{#each doors as x (x)}<rect x={x} y="62" width="12" height="28" />{/each}</g>
    <g class="f-acc">{#each doors as x (x)}<rect x={x + 2} y="52" width="8" height="6" />{/each}</g>
    <path class="f-card s-line" d="M112 60h36v26h-36z" />
    <path class="s-line s-thin" d="M112 60l18 14l18-14" />
    <circle class="f-acc s-line" cx="124" cy="36" r="7" />
    <circle class="f-sun s-line s-thin" cx="124" cy="36" r="2.5" />
    <path class="s-line" d="M131 36h16M141 36v5M146 36v4" />
  {:else if name === 'chuyen-khoan'}
    <!-- điện thoại chuyển khoản → ngân hàng -->
    <rect class="f-void s-line" x="22" y="14" width="40" height="72" rx="6" />
    <rect class="f-card" x="26" y="22" width="32" height="54" rx="2" />
    <path class="s-line s-thin" d="M30 30h24M30 38h16" />
    <rect class="f-acc s-line s-thin" x="30" y="48" width="24" height="12" rx="2" />
    <path class="s-line s-thin" d="M34 66h16" />
    <path class="s-line" d="M68 48h22l-6-6M90 48l-6 6" />
    <path class="f-seal s-line" d="M96 40l28-16l28 16z" />
    <rect class="f-card s-line" x="98" y="40" width="52" height="6" />
    <g class="f-card s-line s-thin"><rect x="102" y="46" width="6" height="36" /><rect x="114" y="46" width="6" height="36" /><rect x="128" y="46" width="6" height="36" /><rect x="140" y="46" width="6" height="36" /></g>
    <rect class="f-card s-line" x="96" y="82" width="56" height="8" />
  {:else}
    <!-- nhà máy mái răng cưa + đồng hồ + phong bì lương -->
    <path class="f-card s-line" d="M10 90V52l20-12v12l20-12v12l20-12v50z" />
    <rect class="f-seal s-line" x="72" y="20" width="10" height="70" />
    <path class="s-line s-thin" d="M72 30h10M72 40h10" />
    <g class="f-void"><rect x="16" y="64" width="10" height="10" /><rect x="34" y="64" width="10" height="10" /><rect x="52" y="64" width="10" height="10" /></g>
    <circle class="f-card s-line" cx="116" cy="36" r="18" />
    <path class="s-line" d="M116 24v12l8 6" />
    <path class="s-line s-thin" d="M116 20v2M116 50v2M100 36h2M130 36h2" />
    <rect class="f-acc s-line" x="98" y="62" width="44" height="26" rx="2" />
    <path class="s-line s-thin" d="M98 62l22 14l22-14" />
  {/if}
</svg>
