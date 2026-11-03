<script lang="ts">
  // Huy hiệu chương: biểu tượng nội dung chương đặt trong vành trống đồng nhỏ (viewBox 64×64). Trang trí, aria-hidden.
  import type { EmblemName } from './registry';
  import { ring } from './kit';
  let { name, size = 44 }: { name: EmblemName; size?: number } = $props();
</script>

<svg class="art emblem" viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
  <circle class="f-sun" cx="32" cy="32" r="31" />
  <path class="f-sunline" d={ring(32, 32, 27, 31, 28)} />
  <circle class="kg" cx="32" cy="32" r="25.5" stroke-width="1" stroke-dasharray="1 2.5" />
  <g stroke-width="1.4">
  {#if name === 'sach'}
    <rect class="f-cream k" x="21" y="15" width="23" height="33" rx="2" /><rect class="f-void" x="19" y="15" width="4" height="33" rx="1" />
    <path class="k" d="M27 24h12M27 29h12M27 34h8" stroke-width="1.1" />
  {:else if name === 'sach-hp'}
    <rect class="f-cream k" x="21" y="14" width="24" height="35" rx="2" /><rect class="f-void" x="19" y="14" width="4" height="35" rx="1" />
    <circle class="f-acc k" cx="33" cy="21" r="3.6" stroke-width="1" />
    <rect class="f-seal" x="23" y="27" width="22" height="6" /><path class="kp" d="M27 30h14" stroke-width="1" />
    <path class="k" d="M27 38h12M29 42h8" stroke-width="1.1" />
  {:else if name === 'cuon-lap-hien'}
    <rect class="f-cream k" x="19" y="19" width="26" height="25" />
    <rect class="f-acc2 k" x="16" y="15" width="32" height="5" rx="2.5" /><rect class="f-acc2 k" x="16" y="43" width="32" height="5" rx="2.5" />
    <path class="k" d="M23 26h18M23 30h18M23 34h12" stroke-width="1.1" />
    <circle class="f-seal" cx="39" cy="38" r="3.4" />
  {:else if name === 'cot-tru'}
    <path class="f-card k" d="M16 24l16-10l16 10z" /><rect class="f-acc k" x="16" y="24" width="32" height="3" stroke-width="1.1" />
    <g class="f-card k" stroke-width="1.1"><rect x="19" y="27" width="4" height="15" /><rect x="27" y="27" width="4" height="15" /><rect x="33" y="27" width="4" height="15" /><rect x="41" y="27" width="4" height="15" /></g>
    <rect class="f-card k" x="15" y="42" width="34" height="4" /><rect class="f-card k" x="13" y="46" width="38" height="3" />
  {:else if name === 'quyen-nguoi'}
    <path class="f-leaf2 k" d="M32 13l14 5v10c0 10-6 16-14 21c-8-5-14-11-14-21V18z" />
    <circle class="f-cream k" cx="27" cy="27" r="3.2" stroke-width="1.1" /><circle class="f-cream k" cx="37" cy="27" r="3.2" stroke-width="1.1" />
    <path class="f-acc k" d="M21 40q0-8 6-8t6 8z" stroke-width="1.1" /><path class="f-seal k" d="M31 40q0-8 6-8t6 8z" stroke-width="1.1" />
  {:else if name === 'ho-chieu'}
    <rect class="f-seal2 k" x="21" y="13" width="22" height="34" rx="2.5" />
    <circle class="ka" cx="32" cy="26" r="6" stroke-width="1.2" /><path class="ka" d="M26 26h12M32 20q-4 6 0 12q4-6 0-12" stroke-width="1" />
    <path class="ka" d="M26 37h12M28 41h8" stroke-width="1.2" />
  {:else if name === 'hom-phieu'}
    <path class="f-cream k" d="M26 16h14v14l-3 4H26z" /><path class="ks" d="M29 23l3 3l5-6" stroke-width="1.8" />
    <rect class="f-card k" x="17" y="30" width="30" height="19" rx="1.5" /><rect class="f-shade" x="38" y="31" width="8" height="17" />
    <rect class="f-void" x="24" y="32" width="16" height="2.4" rx="1" /><rect class="f-seal k" x="27" y="39" width="10" height="5" stroke-width="1" />
  {:else if name === 'nghi-truong'}
    <rect class="f-card k" x="22" y="18" width="20" height="10" /><ellipse class="f-acc k" cx="32" cy="18" rx="10" ry="2.6" stroke-width="1.1" />
    <rect class="f-cream k" x="14" y="28" width="36" height="3" stroke-width="1.1" />
    <rect class="f-void" x="16" y="31" width="32" height="13" />
    <g class="f-card k" stroke-width=".9"><rect x="17" y="31" width="3" height="13" /><rect x="23" y="31" width="3" height="13" /><rect x="29" y="31" width="3" height="13" /><rect x="35" y="31" width="3" height="13" /><rect x="41" y="31" width="3" height="13" /></g>
    <rect class="f-card k" x="13" y="44" width="38" height="4" stroke-width="1.1" />
  {:else if name === 'an-trien'}
    <path class="f-cream k" d="M15 30l20-14l14 18l-20 14z" /><path class="k" d="M22 30l12-8M25 34l12-8" stroke-width="1" />
    <rect class="f-seal k" x="25" y="35" width="15" height="8" rx="1" /><rect class="f-acc2 k" x="29" y="25" width="7" height="10" rx="1" stroke-width="1.1" />
    <circle class="f-acc k" cx="32.5" cy="23" r="3.2" stroke-width="1.1" />
  {:else if name === 'tru-so'}
    <rect class="f-cream k" x="27" y="13" width="10" height="16" /><circle class="f-card k" cx="32" cy="20" r="3.4" stroke-width="1" /><path class="k" d="M32 18v2l1.5 1" stroke-width=".9" />
    <path class="f-seal k" d="M25 13l7-4l7 4z" stroke-width="1.1" />
    <rect class="f-card k" x="14" y="29" width="36" height="18" /><rect class="f-shade" x="40" y="30" width="9" height="16" />
    <g class="f-void"><rect x="18" y="33" width="4" height="5" /><rect x="25" y="33" width="4" height="5" /><rect x="35" y="33" width="4" height="5" /><rect x="42" y="33" width="4" height="5" /><rect x="29" y="39" width="6" height="8" /></g>
  {:else if name === 'can-can'}
    <path class="k" d="M32 13v31M17 20h30" stroke-width="2" /><circle class="f-acc k" cx="32" cy="13" r="2.4" stroke-width="1" />
    <path class="k" d="M17 20l-5 12M17 20l5 12M47 20l-5 12M47 20l5 12" stroke-width="1" />
    <g class="f-acc k" stroke-width="1.1"><path d="M10 32h14a7 3 0 0 1-14 0zM40 32h14a7 3 0 0 1-14 0z" /></g>
    <path class="f-acc2 k" d="M24 49h16l-3-5H27z" stroke-width="1.1" />
  {:else if name === 'lang-xa'}
    <path class="f-seal k" d="M12 30q5 6 11 6h18q6 0 11-6q-8 3-15-1H27q-7 4-15 1z" />
    <path class="ka" d="M25 28h14" stroke-width="2" />
    <rect class="f-card k" x="20" y="36" width="24" height="12" /><rect class="f-void" x="29" y="39" width="6" height="9" />
    <path class="f-seal k" d="M32 9c-4 0-6 3-6 6c0 4 6 9 6 9s6-5 6-9c0-3-2-6-6-6z" stroke-width="1.1" /><circle class="f-cream" cx="32" cy="15" r="2" />
  {:else if name === 'kinh-te'}
    <path class="f-hill2 k" d="M12 46l10-8h22l8 8z" stroke-width="1.1" /><path class="k" d="M20 42h26M18 44h30" stroke-width=".8" />
    <g class="f-acc k" stroke-width="1.1"><ellipse cx="25" cy="36" rx="7" ry="2.5" /><ellipse cx="25" cy="32" rx="7" ry="2.5" /><ellipse cx="25" cy="28" rx="7" ry="2.5" /></g>
    <path class="k" d="M40 38V22" stroke-width="1.3" />
    <path class="f-leaf k" d="M40 26c-7 0-10-5-9-10c6 0 9 4 9 10zM40 22c6-1 9-5 8-10c-6 1-9 5-8 10z" stroke-width="1.1" />
  {:else if name === 'nen'}
    <path class="k" d="M15 14v34h34" stroke-width="1.4" />
    <path class="k" d="M22 18v24M30 22v20M38 14v22M45 20v18" stroke-width="1" />
    <rect class="f-leaf k" x="20" y="24" width="4" height="12" stroke-width="1" /><rect class="f-seal k" x="28" y="27" width="4" height="9" stroke-width="1" />
    <rect class="f-leaf k" x="36" y="18" width="4" height="14" stroke-width="1" /><rect class="f-leaf k" x="43" y="23" width="4" height="10" stroke-width="1" />
  {:else if name === 'co-phieu'}
    <rect class="f-cream k" x="13" y="17" width="38" height="28" rx="1.5" /><rect class="ka" x="16" y="20" width="32" height="22" stroke-width="1" />
    <path class="k" d="M21 26h22M21 30h22M21 34h12" stroke-width="1" />
    <circle class="f-seal k" cx="42" cy="37" r="4.2" stroke-width="1" /><path class="ks" d="M40 41l-1 6l3-2l3 2l-1-6" stroke-width="1" />
  {:else if name === 'bang-dien'}
    <rect class="f-void k" x="12" y="14" width="40" height="26" rx="2" />
    <g class="f-leaf"><rect x="16" y="18" width="8" height="3" /><rect x="16" y="28" width="8" height="3" /><rect x="40" y="23" width="8" height="3" /></g>
    <g class="f-seal"><rect x="28" y="18" width="8" height="3" /><rect x="40" y="33" width="8" height="3" /></g>
    <g class="f-acc"><rect x="40" y="18" width="8" height="3" /><rect x="28" y="28" width="8" height="3" /><rect x="16" y="33" width="8" height="3" /><rect x="28" y="33" width="8" height="3" /><rect x="16" y="23" width="8" height="3" /><rect x="28" y="23" width="8" height="3" /></g>
    <path class="k" d="M24 40v8M40 40v8M20 48h24" stroke-width="1.4" />
  {:else if name === 'luu-ky'}
    <rect class="f-shade k" x="15" y="15" width="34" height="30" rx="2" /><rect class="k" x="19" y="19" width="26" height="22" rx="1" stroke-width="1" />
    <circle class="f-card k" cx="30" cy="30" r="6" stroke-width="1.1" /><path class="k" d="M30 24v3M30 33v3M24 30h3M33 30h3" stroke-width="1" />
    <rect class="f-acc k" x="40" y="26" width="3" height="8" rx="1" stroke-width=".9" />
    <path class="k" d="M19 45v4M45 45v4" stroke-width="1.6" />
  {:else if name === 'van-phong'}
    <rect class="f-card k" x="24" y="11" width="16" height="38" /><rect class="f-shade" x="34" y="12" width="5" height="36" />
    <path class="kw" d="M24 17h16M24 23h16M24 29h16M24 35h16M24 41h16M30 11v38" stroke-width=".9" />
    <rect class="f-cream k" x="14" y="29" width="10" height="20" /><rect class="f-cream k" x="40" y="33" width="10" height="16" />
    <path class="k" d="M12 49h40" stroke-width="1.4" />
  {:else if name === 'quy'}
    <path class="f-cream k" d="M20 26h24l-2 22H22z" /><rect class="f-acc2 k" x="18" y="22" width="28" height="5" rx="1.5" stroke-width="1.1" />
    <g class="f-acc k" stroke-width="1"><circle cx="27" cy="40" r="3.5" /><circle cx="35" cy="42" r="3.5" /><circle cx="31" cy="35" r="3.5" /></g>
    <path class="k" d="M32 22V12" stroke-width="1.2" /><path class="f-leaf k" d="M32 15c-5 0-8-3-7-7c4 0 7 3 7 7zM32 13c4-1 7-4 6-8c-4 1-6 4-6 8z" stroke-width="1" />
  {:else if name === 'kinh-lup'}
    <path class="k" d="M13 44l9-8l7 4l8-10l7 3" stroke-width="1.4" /><path class="kw" d="M13 48h38" stroke-width="1.2" />
    <circle class="f-card k" cx="36" cy="25" r="9" stroke-width="1.6" /><path class="k" d="M30 25l4 2l5-6" stroke-width="1.2" />
    <path class="f-acc2 k" d="M42 31l8 8l-3 3l-8-8z" stroke-width="1.1" />
  {:else if name === 'bat-tay'}
    <path class="f-acc k" d="M10 34l9-9l6 6l-9 9z" /><path class="f-seal k" d="M54 34l-9-9l-6 6l9 9z" />
    <path class="f-cream k" d="M19 28l8-5h7l9 6l-4 4l-6-3l-2 2l6 5l-3 3l-5-4l-1 3l-4-3l-1 2z" stroke-width="1.2" />
    <path class="k" d="M30 30l-3 3M33 33l-3 3" stroke-width="1" />
  {:else if name === 'trong-dong'}
    <ellipse class="f-acc2 k" cx="32" cy="21" rx="18" ry="6" />
    <path class="ka" d="M32 17.5l1 2.6h2.8l-2.2 1.6l.8 2.6l-2.4-1.6l-2.4 1.6l.8-2.6l-2.2-1.6H31z" fill="var(--accent)" stroke="none" />
    <ellipse class="kp" cx="32" cy="21" rx="13" ry="4" stroke-width=".8" stroke-dasharray="1.5 1.5" />
    <path class="f-acc k" d="M14 21v6q0 6 4 10l-1 10h30l-1-10q4-4 4-10v-6q0 6-18 6t-18-6z" />
    <path class="ks" d="M16 30q16 5 32 0M18 37q14 4 28 0" stroke-width="1" />
  {:else if name === 'bia-rua'}
    <path class="f-shade k" d="M24 14q8-5 16 0v24H24z" /><path class="k" d="M28 20v14M32 20v14M36 20v14" stroke-width=".9" />
    <path class="f-seal k" d="M22 14q10-7 20 0l-2 2q-8-5-16 0z" stroke-width="1" />
    <ellipse class="f-leaf2 k" cx="32" cy="42" rx="16" ry="6" /><path class="f-leaf2 k" d="M47 40q6-1 7 2q-2 3-7 2z" stroke-width="1.1" />
    <path class="k" d="M22 47l-2 3M42 47l2 3M26 40h12" stroke-width="1" />
  {:else if name === 'bo-luat-cu'}
    <path class="f-cream k" d="M12 44q10-5 20 0q10-5 20 0V24q-10-5-20 0q-10-5-20 0z" /><path class="k" d="M32 24v20" stroke-width="1" />
    <path class="kw" d="M16 29h12M16 33h12M16 37h9M36 29h12M36 33h12M36 37h9" stroke-width="1" />
    <path class="f-void k" d="M40 9l5 2l-9 19l-2-1z" stroke-width="1" /><path class="ka" d="M35 28l-1 4l3-3" stroke-width="1" />
  {:else}
    <rect class="f-card k" x="17" y="12" width="30" height="38" rx="1.5" /><rect class="f-seal" x="17" y="12" width="30" height="5" />
    <text class="f-ink" x="32" y="27" text-anchor="middle" style="font: 800 7px/1 var(--font-ui)">1945</text>
    <path class="k" d="M22 31h20M22 35h20M22 39h12" stroke-width=".9" />
    <circle class="f-seal" cx="38" cy="44" r="4" /><path class="k" d="M22 45q3-3 5 0t5-1" stroke-width="1" />
  {/if}
  </g>
</svg>
