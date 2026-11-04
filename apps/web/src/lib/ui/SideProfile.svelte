<script lang="ts">
  // Thẻ hồ sơ mini ở đáy sidebar: chuỗi (huy hiệu ngọn lửa theo màu chu kỳ), chức danh có ấn, tiến độ tới chức kế tiếp.
  // Cả khối là liên kết tới Hồ sơ. Số liệu chuỗi lấy từ streakView — cùng nguồn với rail Hôm nay và topbar.
  import StreakBadge from '$lib/art/StreakBadge.svelte';
  import { careerState, displayTitle } from '$lib/game/career';
  import { header } from './header.svelte';
  import { shelf } from './shelf.svelte';
  import { career } from './career.svelte';
  import { streakView, postProgress } from './streakView';

  const sv = $derived(streakView(header.streak, header.longest));
  const cs = $derived(careerState(shelf.books));
  const title = $derived(displayTitle(cs, career.branch));
  const pp = $derived(postProgress(cs.next[career.branch]));

  // ≥ 1280 px (sidebar đầy đủ): thẻ chuyên cần + biển tên/ma-nơ-canh của tủ trưng bày, cỡ cố định theo cột; hẹp hơn giữ thẻ mini.
  let wide = $state(typeof matchMedia !== 'undefined' && matchMedia('(min-width: 1280px)').matches);
  $effect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(min-width: 1280px)');
    const on = () => (wide = mq.matches);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  });
  // Nạp lười: chỉ màn rộng mới tải Portrait/GarmentFlat.
  const loadWide = () => import('./SideWide.svelte');
</script>

<a class="me" class:cold={sv.count === 0} class:wide href="#/toi" style="--fire:{sv.flame}; --glow:{sv.glow}">
  {#if wide}
    {#await loadWide() then m}<m.default />{/await}
  {:else}
    <span class="me-streak">
      <span class="me-badge"><StreakBadge count={header.streak} longest={header.longest} size={44} /></span>
      <span class="me-days"><b><span class="sr-only">Chuỗi </span>{sv.count}</b><span class="me-unit">ngày</span><span class="me-tier">{sv.label}</span></span>
    </span>
    <span class="me-rank"><span class="seal" aria-hidden="true">§</span><span class="me-title">{title.title}</span></span>
  {/if}
  <span class="me-next">
    {#if pp}
      <span class="bar" aria-hidden="true"><span style="width:{pp.pct}%"></span></span>
      <span class="me-next-t">{pp.have}/{pp.need} sách · kế tiếp: {pp.title}</span>
    {:else}
      <span class="me-next-t">Đã đạt chức cao nhất của nhánh</span>
    {/if}
  </span>
</a>
