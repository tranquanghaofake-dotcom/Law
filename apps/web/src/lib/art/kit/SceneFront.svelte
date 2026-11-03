<!-- Lớp GẦN của cảnh, vẽ sau cùng: bóng đổ dưới chân, sương thấp, vệt sáng quét chậm (tắt khi giảm chuyển động), vân giấy có mặt nạ tròn mờ dần. -->
<script lang="ts">
  let { grain = true }: { grain?: boolean } = $props();
</script>
<ellipse cx="260" cy="304" rx="215" ry="8" fill="url(#kg-shadow)" />
<ellipse cx="260" cy="298" rx="272" ry="34" fill="url(#kg-haze)" opacity=".55" />
<g mask="url(#kg-edge)" style="pointer-events:none"><rect class="kit-sweep" x="-150" y="30" width="120" height="270" fill="url(#kg-sweepg)" /></g>
{#if grain}<rect x="0" y="0" width="520" height="325" filter="url(#kg-grain)" mask="url(#kg-grainmask)" opacity=".3" style="mix-blend-mode:multiply;pointer-events:none" />{/if}
