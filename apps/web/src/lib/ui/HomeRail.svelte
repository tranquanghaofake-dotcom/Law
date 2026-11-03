<script lang="ts">
  import StreakCard from '$lib/art/StreakCard.svelte';
  import Glyph from '$lib/art/Glyph.svelte';
  // Rail phải của trang Hôm nay (≥ 1440 px): chuỗi tuần, bậc, hẹn ôn ngày mai, dòng pháp lý (spec §3.4).
  import { header } from './header.svelte';
  import { careerState, displayTitle } from '$lib/game/career';
  import { shelf, refreshShelf } from './shelf.svelte';
  import { career } from './career.svelte';
  import WeekDots from './WeekDots.svelte';
  let { week, dueTomorrow }: { week: boolean[]; dueTomorrow: number } = $props();
  if (!shelf.ready) refreshShelf();
  const cs = $derived(careerState(shelf.books));
  const t = $derived(displayTitle(cs, career.branch));
  const nx = $derived(cs.next[career.branch]);
</script>

<section class="rail-block">
  <p class="kicker">Chuỗi</p>
  <StreakCard count={header.streak} longest={header.longest} />
  <p class="rail-big">{header.streak} <span class="muted small">ngày · ngày {header.streak ? ((header.streak - 1) % 30) + 1 : 0}/30 của thẻ</span></p>
  <WeekDots days={week} />
</section>
<section class="rail-block">
  <p class="kicker">Chức danh</p>
  <p class="rank-line"><span class="seal big-seal" aria-hidden="true">§</span> <b>{t.title}</b></p>
  {#if nx}<p class="muted small">Kế tiếp: <b>{nx.post.title}</b> — còn thiếu {nx.missing.reduce((n, m) => n + m.req.count - m.have, 0)} sách</p>{/if}
  <a class="small" href="#/toi">Xem lộ trình →</a>
</section>
<section class="rail-block">
  <p class="kicker">Hẹn ôn ngày mai</p>
  <p class="rail-big">{dueTomorrow} <span class="muted small">khái niệm</span></p>
</section>
