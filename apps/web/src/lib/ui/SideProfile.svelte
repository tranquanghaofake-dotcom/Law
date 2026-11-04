<script lang="ts">
  // Tủ gọn ở đáy sidebar (một khối): biển tên mạ vàng (chức danh · số sách) → chuỗi (huy hiệu lửa theo màu chu kỳ) →
  // kệ sách một hàng sau ô kính → tiến độ tới chức kế tiếp. Biển và thanh tiến độ là liên kết tới Hồ sơ.
  // Số liệu chuỗi lấy từ streakView — cùng nguồn với rail Hôm nay và topbar. Ma-nơ-canh/thẻ lớn chỉ còn ở trang Hồ sơ.
  // Rail hẹp (< 1280 px): chỉ huy hiệu + số ngày + ấn; chữ khác ẩn khỏi mắt nhưng giữ cho trình đọc màn hình.
  import StreakBadge from '$lib/art/StreakBadge.svelte';
  import Bookshelf from './Bookshelf.svelte';
  import CountUp from './CountUp.svelte';
  import { careerState, displayTitle } from '$lib/game/career';
  import { header } from './header.svelte';
  import { shelf } from './shelf.svelte';
  import { career } from './career.svelte';
  import { streakView, postProgress } from './streakView';

  const sv = $derived(streakView(header.streak, header.longest));
  const cs = $derived(careerState(shelf.books));
  const title = $derived(displayTitle(cs, career.branch));
  const pp = $derived(postProgress(cs.next[career.branch]));
  const earned = $derived(shelf.books.filter((b) => b.level > 0));
  const lv3 = $derived(earned.filter((b) => b.level === 3).length);
</script>

<div class="me-cab" class:cold={sv.count === 0} style="--fire:{sv.flame}; --glow:{sv.glow}">
  <a class="me" href="#/toi">
    <span class="me-rank"><span class="seal" aria-hidden="true">§</span><span class="me-title">{title.title}</span><span class="me-sub">{earned.length} sách · {lv3} cấp 3</span></span>
    <span class="me-streak">
      <span class="me-badge"><StreakBadge count={header.streak} longest={header.longest} size={44} /></span>
      <span class="me-days"><b><span class="sr-only">Chuỗi </span>{sv.count}</b><span class="me-unit">ngày</span><span class="me-tier">{sv.label}</span></span>
    </span>
  </a>
  <div class="side-glass"><Bookshelf size="side" compact /></div>
  <a class="me-next" href="#/toi">
    {#if pp}
      <span class="bar" aria-hidden="true"><span style="width:{pp.pct}%"></span></span>
      <span class="me-next-t"><CountUp value={pp.have} key="post-have" ready={shelf.ready} />/{pp.need} sách · kế tiếp: {pp.title}</span>
    {:else}
      <span class="me-next-t">Đã đạt chức cao nhất của nhánh</span>
    {/if}
  </a>
</div>
