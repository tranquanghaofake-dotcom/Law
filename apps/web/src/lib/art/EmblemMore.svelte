<script lang="ts">
  // Huy hiệu chương bổ sung (đợt 6): biểu tượng nội dung vẽ trong khung 64×64, đặt trong vành trống đồng của Emblem.svelte.
  // Nạp lười (dynamic import) để không phình gói chính. Nét học từ ngôn ngữ hình khối của dự án; ý tưởng hình tham khảo bộ icon mở (Tabler MIT, Lucide ISC, Phosphor MIT) nhưng tự vẽ lại.
  import type { EmblemName } from './registry';
  let { name }: { name: EmblemName } = $props();
</script>

{#if name === 'nguoi'}
  <circle class="f-cream k" cx="32" cy="22" r="7" /><path class="f-acc k" d="M18 49q0-15 14-15t14 15z" />
{:else if name === 'nhom-nguoi'}
  <circle class="f-cream k" cx="21" cy="26" r="5" stroke-width="1.1" /><path class="f-acc k" d="M11 47q0-12 10-12t10 12z" stroke-width="1.1" />
  <circle class="f-cream k" cx="43" cy="26" r="5" stroke-width="1.1" /><path class="f-seal k" d="M33 47q0-12 10-12t10 12z" stroke-width="1.1" />
  <circle class="f-cream k" cx="32" cy="21" r="6" /><path class="f-leaf2 k" d="M21 49q0-15 11-15t11 15z" />
{:else if name === 'nha'}
  <path class="f-seal k" d="M13 31l19-16l19 16z" /><rect class="f-cream k" x="18" y="31" width="28" height="17" />
  <rect class="f-void k" x="28" y="37" width="8" height="11" stroke-width="1.1" /><rect class="f-acc k" x="21" y="35" width="5" height="5" stroke-width="1" />
{:else if name === 'chia-khoa'}
  <circle class="f-acc k" cx="23" cy="26" r="9" /><circle class="f-void" cx="23" cy="26" r="3" />
  <path class="k" d="M30 32l17 16M40 42l5-5M45 47l5-5" stroke-width="2.2" />
{:else if name === 'hop-dong'}
  <rect class="f-cream k" x="17" y="13" width="26" height="35" rx="1.5" /><path class="k" d="M22 21h16M22 26h16M22 31h10" stroke-width="1.1" />
  <circle class="f-seal" cx="36" cy="40" r="4" /><path class="f-acc2 k" d="M34 49l12-14l4 3l-12 14l-5 1z" stroke-width="1.1" />
{:else if name === 'dong-xu'}
  <circle class="f-acc k" cx="32" cy="32" r="16" /><circle class="ks" cx="32" cy="32" r="11" stroke-width="1" stroke-dasharray="2 2" />
  <path class="k" d="M32 22v20M27 27.5h7a3.5 3.5 0 0 1 0 7h-5a3.5 3.5 0 0 0 0 7h8" stroke-width="1.6" />
{:else if name === 'khien'}
  <path class="f-leaf2 k" d="M32 12l15 5v12c0 10-6 17-15 21c-9-4-15-11-15-21V17z" /><path class="kp" d="M24 31l6 6l11-12" stroke-width="2.4" />
{:else if name === 'khoa'}
  <path class="k" d="M24 28v-7a8 8 0 0 1 16 0v7" stroke-width="2.4" /><rect class="f-acc k" x="18" y="28" width="28" height="21" rx="3" />
  <circle class="f-void" cx="32" cy="37" r="3.4" /><path class="k" d="M32 38v6" stroke-width="2" />
{:else if name === 'dong-ho'}
  <circle class="f-cream k" cx="32" cy="32" r="18" /><path class="kg" d="M32 17v3M32 44v3M17 32h3M44 32h3" stroke-width="1.6" /><path class="k" d="M32 32V21M32 32l8 5" stroke-width="2" /><circle class="f-seal" cx="32" cy="32" r="2" />
{:else if name === 'lich'}
  <rect class="f-cream k" x="14" y="18" width="36" height="31" rx="2" /><rect class="f-seal k" x="14" y="18" width="36" height="8" rx="2" />
  <path class="k" d="M23 14v7M41 14v7" stroke-width="2.2" /><g class="f-acc2"><rect x="19" y="31" width="5" height="4" /><rect x="29.5" y="31" width="5" height="4" /><rect x="40" y="31" width="5" height="4" /><rect x="19" y="39" width="5" height="4" /><rect class="f-seal" x="29.5" y="39" width="5" height="4" /></g>
{:else if name === 'di-chuc'}
  <path class="f-cream k" d="M16 17h26v28q0 4-4 4H20q-4 0-4-4z" /><path class="k" d="M22 25h14M22 30h14M22 35h8" stroke-width="1.1" />
  <path class="f-acc k" d="M50 12q-14 6-17 24l4 2q4-8 13-26z" stroke-width="1.1" /><path class="k" d="M33 38l-3 8" stroke-width="1.2" />
{:else if name === 'gia-pha'}
  <path class="k" d="M32 22v8M18 30h28M18 30v8M32 30v8M46 30v8" stroke-width="1.4" />
  <circle class="f-acc k" cx="32" cy="17" r="6" /><circle class="f-cream k" cx="18" cy="43" r="5.5" /><circle class="f-cream k" cx="32" cy="43" r="5.5" /><circle class="f-cream k" cx="46" cy="43" r="5.5" />
{:else if name === 'ho-so'}
  <rect class="f-cream k" x="14" y="38" width="36" height="10" rx="1.5" /><rect class="f-card k" x="15" y="28" width="34" height="10" rx="1.5" /><rect class="f-cream k" x="16" y="18" width="32" height="10" rx="1.5" />
  <path class="ks" d="M32 16v34M26 33h12" stroke-width="1.6" /><circle class="f-seal" cx="32" cy="33" r="2.4" />
{:else if name === 'cong-tay'}
  <circle class="f-cream k" cx="22" cy="32" r="10" stroke-width="2" /><circle class="f-cream k" cx="42" cy="32" r="10" stroke-width="2" /><path class="k" d="M30 32h4" stroke-width="3" />
  <circle class="f-void" cx="22" cy="32" r="3.5" /><circle class="f-void" cx="42" cy="32" r="3.5" />
{:else if name === 'canh-bao'}
  <path class="f-acc k" d="M32 13l19 34H13z" /><path class="k" d="M32 24v12" stroke-width="3" /><circle class="f-void" cx="32" cy="41.5" r="2" />
{:else if name === 'thu-tuc'}
  <rect class="f-cream k" x="17" y="16" width="30" height="34" rx="2" /><rect class="f-acc2 k" x="25" y="12" width="14" height="7" rx="2" stroke-width="1.2" />
  <path class="ks" d="M22 27l2 2l3-4M22 36l2 2l3-4" stroke-width="1.6" /><path class="k" d="M30 27h12M30 36h12M22 44h20" stroke-width="1.1" />
{:else if name === 'bien-ban'}
  <path class="f-cream k" d="M18 13h20l8 8v29H18z" /><path class="f-shade k" d="M38 13v8h8" stroke-width="1" /><path class="k" d="M23 26h18M23 31h18M23 36h10" stroke-width="1.1" />
  <path class="ks" d="M24 45q3-4 5 0t5-1t5 0" stroke-width="1.3" /><circle class="f-seal" cx="42" cy="44" r="3" />
{:else if name === 'con-dau'}
  <rect class="f-acc2 k" x="25" y="12" width="14" height="10" rx="5" /><path class="f-acc k" d="M28 22h8l2 12H26z" />
  <rect class="f-acc2 k" x="16" y="34" width="32" height="7" rx="1.5" /><path class="ks" d="M19 49h26" stroke-width="2.4" />
{:else if name === 'the-id'}
  <rect class="f-cream k" x="12" y="19" width="40" height="27" rx="3" /><circle class="f-acc k" cx="23" cy="29" r="4.5" stroke-width="1.1" /><path class="f-acc k" d="M16 41q0-7 7-7t7 7z" stroke-width="1.1" />
  <path class="k" d="M35 28h12M35 33h12M35 38h8" stroke-width="1.2" />
{:else if name === 'mu-bao-ho'}
  <path class="f-acc k" d="M14 40q0-20 18-20t18 20z" /><rect class="f-acc2 k" x="10" y="40" width="44" height="6" rx="3" /><path class="k" d="M32 20v20M24 24q-3 6-3 16M40 24q3 6 3 16" stroke-width="1.1" />
{:else if name === 'bao-hiem'}
  <path class="f-seal k" d="M12 32q0-18 20-18t20 18q-5-4-10 0q-5-4-10 0q-5-4-10 0q-5-4-10 0z" /><path class="k" d="M32 32v13a4 4 0 0 1-8 0" stroke-width="2" />
{:else if name === 'y-te'}
  <circle class="f-cream k" cx="32" cy="32" r="18" /><path class="f-seal k" d="M28 20h8v8h8v8h-8v8h-8v-8h-8v-8h8z" stroke-width="1.2" />
{:else if name === 'tre-em'}
  <circle class="f-cream k" cx="24" cy="30" r="5" stroke-width="1.2" /><path class="f-acc k" d="M16 48q0-12 8-12t8 12z" stroke-width="1.2" />
  <path class="k" d="M40 48V30" stroke-width="1.2" /><circle class="f-seal k" cx="40" cy="22" r="8" /><path class="kp" d="M36 20q1-3 4-3" stroke-width="1.2" />
{:else if name === 'nu'}
  <circle class="f-cream k" cx="32" cy="20" r="6.5" /><path class="f-void" d="M25 20q0-9 7-9t7 9q0 6-2 10q0-8-5-8t-5 8q-2-4-2-10z" />
  <path class="f-seal k" d="M32 28l-10 21h20z" /><path class="k" d="M26 36h12" stroke-width="1.1" />
{:else if name === 'may-bay'}
  <path class="f-cream k" d="M52 14q3 0 2 4L40 32l5 17l-4 2l-9-14l-9 9l1 8l-3 1l-5-9l-9-5l1-3l8 1l9-9L10 19l2-4l17 5l14-13z" stroke-width="1.2" />
{:else if name === 'tau'}
  <rect class="f-seal k" x="18" y="22" width="9" height="9" stroke-width="1.1" /><rect class="f-acc k" x="27" y="22" width="9" height="9" stroke-width="1.1" /><rect class="f-leaf2 k" x="36" y="22" width="9" height="9" stroke-width="1.1" />
  <path class="f-acc2 k" d="M10 33h44l-7 12H17z" /><path class="kw" d="M8 51q4-3 8 0t8 0t8 0t8 0t8 0t8 0" stroke-width="1.4" />
{:else if name === 'nha-may'}
  <rect class="f-cream k" x="40" y="14" width="7" height="20" /><path class="kw" d="M42 11q4-3 2-6" stroke-width="1.2" />
  <path class="f-cream k" d="M12 48V30l9-6v6l9-6v6l9-6v6h6v24z" /><g class="f-void"><rect x="17" y="36" width="5" height="5" /><rect x="26" y="36" width="5" height="5" /><rect x="35" y="36" width="5" height="5" /></g><rect class="f-acc k" x="29" y="42" width="10" height="6" stroke-width="1" />
{:else if name === 'ruong'}
  <path class="f-leaf2 k" d="M10 44q22-12 44 0v6H10z" /><path class="f-leaf k" d="M10 35q22-12 44 0v6q-22-12-44 0z" /><path class="f-leaf2 k" d="M10 26q22-12 44 0v6q-22-12-44 0z" />
  <circle class="f-gold" cx="48" cy="17" r="5" />
{:else if name === 'thue'}
  <path class="f-cream k" d="M17 12h30v38l-5-3l-5 3l-5-3l-5 3l-5-3l-5 3z" /><circle class="f-acc k" cx="26" cy="23" r="3.2" stroke-width="1.1" /><circle class="f-acc k" cx="38" cy="35" r="3.2" stroke-width="1.1" /><path class="k" d="M39 20L25 39" stroke-width="1.8" />
{:else if name === 'bieu-do'}
  <path class="k" d="M12 14v36h42" stroke-width="1.6" /><rect class="f-acc k" x="18" y="34" width="8" height="16" /><rect class="f-leaf k" x="30" y="24" width="8" height="26" /><rect class="f-seal k" x="42" y="16" width="8" height="34" />
{:else if name === 'bong-den'}
  <path class="f-gold k" d="M32 12a13 13 0 0 1 7 24v5H25v-5a13 13 0 0 1 7-24z" /><path class="k" d="M26 45h12M28 49h8" stroke-width="2" /><path class="kg" d="M32 5v3M14 18l3 2M50 18l-3 2M10 32h3M51 32h3" stroke-width="1.6" />
{:else if name === 'ban-quyen'}
  <circle class="f-cream k" cx="32" cy="32" r="18" /><circle class="kg" cx="32" cy="32" r="14.5" stroke-width="1" stroke-dasharray="1.5 2" /><path class="k" d="M39 26a9 9 0 1 0 0 12" stroke-width="3" />
{:else if name === 'nhan-hieu'}
  <path class="f-cream k" d="M32 12l18 0v18l-22 22l-18-18z" /><circle class="f-void" cx="42" cy="21" r="3" /><path class="f-seal" d="M28 28l8 8l-5 5l-8-8z" opacity=".85" /><path class="k" d="M24 32l8 8" stroke-width="1.2" />
{:else if name === 'giong-cay'}
  <path class="k" d="M32 46V28" stroke-width="2" /><path class="f-leaf k" d="M32 30c-10 0-15-6-14-13c10 0 14 5 14 13z" /><path class="f-leaf2 k" d="M32 26c8-1 13-6 12-12c-9 0-12 5-12 12z" /><path class="f-acc2 k" d="M16 46h32l-3 5H19z" />
{:else if name === 'ban-do'}
  <path class="f-cream k" d="M12 20l13-5l14 5l13-5v30l-13 5l-14-5l-13 5z" /><path class="kw" d="M25 15v30M39 20v30" stroke-width="1" />
  <path class="f-seal k" d="M32 14c-6 0-9 4-9 8c0 6 9 14 9 14s9-8 9-14c0-4-3-8-9-8z" /><circle class="f-card" cx="32" cy="22" r="3" />
{:else if name === 'loa'}
  <path class="f-acc k" d="M14 27l22-10v30l-22-10z" /><rect class="f-acc2 k" x="10" y="26" width="6" height="12" rx="1.5" stroke-width="1.1" /><path class="k" d="M18 40l3 10h6l-2-8" stroke-width="1.3" />
  <path class="ka" d="M42 25q5 7 0 14M47 21q8 11 0 22" stroke-width="1.6" />
{:else if name === 'vuong-mien'}
  <path class="f-gold k" d="M12 44l-1-24l12 11l9-15l9 15l12-11l-1 24z" /><rect class="f-acc2 k" x="12" y="44" width="40" height="6" rx="1.5" /><circle class="f-seal" cx="32" cy="38" r="2.4" />
{:else if name === 'sap-nhap'}
  <circle class="f-acc k" cx="25" cy="32" r="14" opacity=".85" /><circle class="f-leaf k" cx="39" cy="32" r="14" opacity=".75" /><path class="kp" d="M32 22.5a14 14 0 0 1 0 19a14 14 0 0 1 0-19z" stroke-width="1.2" />
{:else if name === 'mat-na'}
  <path class="f-cream k" d="M14 20q18-8 36 0v12q0 14-18 18q-18-4-18-18z" /><path class="f-void" d="M20 27q5-3 9 1q-4 4-9-1zM35 28q4-4 9-1q-5 5-9 1z" /><path class="k" d="M24 40q8 6 16 0" stroke-width="1.6" />
{:else if name === 'huan-chuong'}
  <path class="f-seal k" d="M22 11l7 17l-5 3zM42 11l-7 17l5 3z" stroke-width="1.1" /><circle class="f-gold k" cx="32" cy="37" r="12" /><path class="k" d="M32 31l2.2 4.6l5 .7l-3.6 3.5l.9 5l-4.5-2.4l-4.5 2.4l.9-5l-3.6-3.5l5-.7z" stroke-width="1" />
{:else if name === 'trai-tim'}
  <path class="f-seal k" d="M32 49C15 38 12 26 18 20c5-5 12-3 14 3c2-6 9-8 14-3c6 6 3 18-14 29z" /><path class="kp" d="M20 24q2-4 6-3" stroke-width="1.5" />
{:else if name === 'tui-do'}
  <path class="k" d="M25 22v-4q0-3 3-3h8q3 0 3 3v4" stroke-width="2" /><rect class="f-acc2 k" x="12" y="22" width="40" height="26" rx="3" /><path class="k" d="M12 33h40" stroke-width="1.3" /><rect class="f-gold k" x="28" y="30" width="8" height="7" rx="1" stroke-width="1" />
{:else if name === 'tranh-chap'}
  <path class="f-acc k" d="M8 32h14v-7l10 9l-10 9v-7H8z" stroke-width="1.2" /><path class="f-seal k" d="M56 32H42v-7l-10 9l10 9v-7h14z" stroke-width="1.2" transform="translate(0 -4)" />
  <path class="kg" d="M32 14v6M24 16l3 4M40 16l-3 4" stroke-width="1.6" />
{:else if name === 'quy-trinh'}
  <rect class="f-cream k" x="23" y="11" width="18" height="10" rx="2" /><rect class="f-acc k" x="23" y="27" width="18" height="10" rx="2" /><rect class="f-seal k" x="23" y="43" width="18" height="10" rx="2" />
  <path class="k" d="M32 21v6M32 37v6M30 25l2 2l2-2M30 41l2 2l2-2" stroke-width="1.3" />
{:else if name === 'but-long'}
  <path class="f-acc2 k" d="M48 10l6 6l-26 26l-8 2l2-8z" /><path class="k" d="M44 14l6 6" stroke-width="1.2" /><path class="ks" d="M12 52q6-6 12-2t14-2" stroke-width="2" />
{:else if name === 'dieu-luat'}
  <rect class="f-cream k" x="15" y="13" width="34" height="38" rx="2" /><text class="f-ink" x="32" y="42" text-anchor="middle" style="font: 800 30px/1 var(--font-ui)">§</text>
{:else if name === 'xich'}
  <rect class="k" x="11" y="25" width="26" height="14" rx="7" stroke-width="4" transform="rotate(-20 24 32)" /><rect class="ka" x="27" y="25" width="26" height="14" rx="7" stroke-width="4" transform="rotate(-20 40 32)" />
{:else if name === 'cay'}
  <path class="f-acc2 k" d="M28 50l2-18h4l2 18z" /><circle class="f-leaf k" cx="22" cy="28" r="10" /><circle class="f-leaf k" cx="42" cy="28" r="10" /><circle class="f-leaf k" cx="32" cy="19" r="11" /><circle class="f-leaf2" cx="29" cy="17" r="3" />
{:else if name === 'muc-tieu'}
  <circle class="f-cream k" cx="30" cy="34" r="18" /><circle class="f-seal k" cx="30" cy="34" r="12" stroke-width="1.1" /><circle class="f-cream k" cx="30" cy="34" r="6" stroke-width="1.1" /><circle class="f-seal" cx="30" cy="34" r="2.4" />
  <path class="k" d="M30 34l20-20M45 12l5 2l-1 6" stroke-width="1.8" />
{:else if name === 'khoi'}
  <rect class="f-acc k" x="14" y="36" width="20" height="14" /><rect class="f-leaf k" x="34" y="36" width="16" height="14" /><rect class="f-seal k" x="20" y="22" width="20" height="14" /><rect class="f-cream k" x="30" y="10" width="14" height="12" stroke-width="1.1" />
{:else if name === 'ngoai-te'}
  <circle class="f-acc k" cx="23" cy="28" r="12" /><text class="f-ink" x="23" y="33" text-anchor="middle" style="font: 800 15px/1 var(--font-ui)">$</text>
  <circle class="f-cream k" cx="41" cy="38" r="12" /><text class="f-ink" x="41" y="43" text-anchor="middle" style="font: 800 15px/1 var(--font-ui)">€</text>
{:else if name === 'pha-san'}
  <circle class="f-acc k" cx="32" cy="30" r="15" /><path class="k" d="M32 15l-4 9l7 5l-6 7l3 9" stroke-width="2" /><path class="f-seal k" d="M32 56v-8M26 52l6 6l6-6" stroke-width="1.8" transform="translate(0 -6)" />
{:else if name === 'cam'}
  <circle class="f-cream k" cx="32" cy="32" r="18" /><circle class="ks" cx="32" cy="32" r="15" stroke-width="4" /><path class="ks" d="M21 43L43 21" stroke-width="4" />
{/if}
