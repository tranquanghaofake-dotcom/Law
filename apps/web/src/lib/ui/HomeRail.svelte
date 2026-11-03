<script lang="ts">
  import StreakCard from '$lib/art/StreakCard.svelte';
  // Rail phải của trang Hôm nay (≥ 1440 px): chuỗi + tuần, hẹn ôn (chức danh đã có ở đáy sidebar).
  import { header } from './header.svelte';
  import WeekDots from './WeekDots.svelte';
  let { week, dueTomorrow, dueWeek }: { week: boolean[]; dueTomorrow: number; dueWeek: number } = $props();
</script>

<section class="rail-block">
  <p class="kicker">Chuỗi</p>
  <StreakCard count={header.streak} longest={header.longest} />
  <p class="rail-big">{header.streak} <span class="muted small">ngày · ngày {header.streak ? ((header.streak - 1) % 30) + 1 : 0}/30 của thẻ</span></p>
  <WeekDots days={week} />
</section>
<section class="rail-block">
  <p class="kicker">Hẹn ôn</p>
  <p class="rail-big">Mai {dueTomorrow} <span class="muted small">· 7 ngày tới {dueWeek}</span></p>
</section>
