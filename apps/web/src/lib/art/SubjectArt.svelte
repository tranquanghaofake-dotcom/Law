<script lang="ts">
  // Hình kiến trúc dựng bằng khối phẳng + nét mảnh. Màu lấy từ token (.art .f-* / .s-* trong app.css) nên tự đổi theo chế độ tối.
  import type { ArtName } from './registry';
  import KhueVanCac from './KhueVanCac.svelte';
  import QuocHoi from './QuocHoi.svelte';
  import TamQuan from './TamQuan.svelte';
  let { name, class: cls = '' }: { name: ArtName; class?: string } = $props();
</script>

<svg class="art {cls}" viewBox="0 0 320 200" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
  {#if name === 'khue-van-cac'}<KhueVanCac />{:else if name === 'quoc-hoi'}<QuocHoi />{:else}<TamQuan />{/if}
</svg>
