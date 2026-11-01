<script lang="ts">
  // Cảnh kiến trúc/thiên nhiên dựng bằng khối phẳng + nét mảnh. Màu lấy từ token (.art .f-* / .s-* trong app.css) nên tự đổi theo chế độ tối.
  import type { ArtName } from './registry';
  import KhueVanCac from './KhueVanCac.svelte';
  import QuocHoi from './QuocHoi.svelte';
  import TamQuan from './TamQuan.svelte';
  import ChuaMotCot from './ChuaMotCot.svelte';
  import HaLong from './HaLong.svelte';
  import NgoMon from './NgoMon.svelte';
  import ToaAn from './ToaAn.svelte';
  import SachLuat from './SachLuat.svelte';
  let { name, class: cls = '' }: { name: ArtName; class?: string } = $props();
  const SCENES = { 'khue-van-cac': KhueVanCac, 'quoc-hoi': QuocHoi, 'tam-quan': TamQuan, 'chua-mot-cot': ChuaMotCot, 'ha-long': HaLong, 'ngo-mon': NgoMon, 'toa-an': ToaAn, 'sach-luat': SachLuat };
  const Scene = $derived(SCENES[name] ?? TamQuan);
</script>

<svg class="art {cls}" viewBox="0 0 520 325" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
  <Scene />
</svg>
