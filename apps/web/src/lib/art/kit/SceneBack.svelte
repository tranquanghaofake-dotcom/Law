<!-- Lớp XA của cảnh (khung 520×325), vẽ trước cảnh: nền trời gradient, quầng sáng, hai dải đồi xa (hạt theo tên cảnh để mỗi cảnh một đường chân trời), mây xa trôi chậm. -->
<script lang="ts">
  import { ridge, seedOf } from '../kit';
  let { name }: { name: string } = $props();
  const seed = $derived(seedOf(name));
</script>
<g mask="url(#kg-edge)" class="kit-back">
  <rect x="0" y="20" width="520" height="285" fill="url(#kg-sky)" />
  <ellipse cx="260" cy="150" rx="250" ry="125" fill="url(#kg-glow)" opacity=".75" />
  <path d={ridge(seed, 270, 34, 64)} fill="url(#kg-far)" />
  <path d={ridge(seed + 11, 292, 22, 48)} fill="url(#kg-mid)" />
  <g class="kit-farcloud" opacity=".6" fill="url(#kg-card)">
    <ellipse cx="96" cy="112" rx="30" ry="7" /><ellipse cx="116" cy="106" rx="18" ry="7" />
    <ellipse cx="420" cy="86" rx="34" ry="7" /><ellipse cx="444" cy="80" rx="18" ry="7" />
  </g>
</g>
