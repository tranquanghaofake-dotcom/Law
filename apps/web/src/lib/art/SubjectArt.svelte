<script lang="ts">
  // Cảnh kiến trúc/thiên nhiên dựng bằng khối phẳng + nét mảnh. Màu lấy từ token (.art .f-* / .s-* trong app.css); bộ kit (kit/) thêm lớp xa–gần, gradient ánh sáng, vân giấy, chuyển động nhẹ.
  import { ART_MORE, type ArtName } from './registry';
  import KhueVanCac from './KhueVanCac.svelte';
  import TamQuan from './TamQuan.svelte';
  import ChuaMotCot from './ChuaMotCot.svelte';
  import HaLong from './HaLong.svelte';
  import NgoMon from './NgoMon.svelte';
  import ToaAn from './ToaAn.svelte';
  import SachLuat from './SachLuat.svelte';
  import SanGiaoDich from './SanGiaoDich.svelte';
  import BiaTienSi from './BiaTienSi.svelte';
  import SceneBack from './kit/SceneBack.svelte';
  import SceneFront from './kit/SceneFront.svelte';
  import './kit/kit.css';
  let { name, class: cls = '' }: { name: ArtName; class?: string } = $props();
  const SCENES = { 'khue-van-cac': KhueVanCac, 'tam-quan': TamQuan, 'chua-mot-cot': ChuaMotCot, 'ha-long': HaLong, 'ngo-mon': NgoMon, 'toa-an': ToaAn, 'sach-luat': SachLuat, 'san-giao-dich': SanGiaoDich, 'bia-tien-si': BiaTienSi };
  const Scene = $derived(SCENES[name as keyof typeof SCENES] ?? TamQuan);
  const more = $derived(ART_MORE.includes(name));
</script>

<svg class="art art-lit scene-lit {cls}" viewBox="0 0 520 325" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
  <SceneBack {name} />
  {#if more}
    {#await import('./ScenesMore.svelte') then m}<m.default {name} />{/await}
  {:else}
    <Scene />
  {/if}
  <SceneFront />
</svg>
