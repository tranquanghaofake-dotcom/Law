<!-- Lớp GẦN của cảnh, vẽ sau cùng: bóng đổ dưới chân, sương thấp, vệt sáng quét chậm (tắt khi giảm chuyển động), vân giấy có mặt nạ tròn mờ dần. -->
<script lang="ts">
  let { grain = true }: { grain?: boolean } = $props();
  // Vân giấy là ẢNH dựng sẵn (trình duyệt raster một lần rồi giữ trong bộ nhớ đệm) thay cho filter feTurbulence áp trực tiếp —
  // filter trực tiếp bị tính lại mỗi khung hình khi bất kỳ chi tiết nào trong cảnh chuyển động.
  const GRAIN = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="520" height="325"><filter id="g" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 -.18"/></filter><rect width="520" height="325" filter="url(#g)"/></svg>');
</script>
<ellipse cx="260" cy="304" rx="215" ry="8" fill="url(#kg-shadow)" />
<ellipse cx="260" cy="298" rx="272" ry="34" fill="url(#kg-haze)" opacity=".55" />
<g mask="url(#kg-edge)" style="pointer-events:none"><rect class="kit-sweep" x="-150" y="30" width="120" height="270" fill="url(#kg-sweepg)" /></g>
{#if grain}<image href={GRAIN} x="0" y="0" width="520" height="325" mask="url(#kg-grainmask)" opacity=".3" style="mix-blend-mode:multiply;pointer-events:none" />{/if}
