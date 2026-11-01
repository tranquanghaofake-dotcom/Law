<script lang="ts">
  // Rail phải của trang Hôm nay (≥ 1440 px): chuỗi tuần, bậc, hẹn ôn ngày mai, dòng pháp lý (spec §3.4).
  import { header } from './header.svelte';
  import { rankFor, RANKS } from '$lib/game/rank';
  import WeekDots from './WeekDots.svelte';
  let { week, dueTomorrow }: { week: boolean[]; dueTomorrow: number } = $props();
  const info = $derived(rankFor(header.xp));
</script>

<section class="rail-block">
  <p class="kicker">Chuỗi</p>
  <p class="rail-big"><span aria-hidden="true">🔥</span> {header.streak} <span class="muted small">ngày</span></p>
  <WeekDots days={week} />
</section>
<section class="rail-block">
  <p class="kicker">Bậc khoa cử</p>
  <p class="rank-line"><span class="seal big-seal" aria-hidden="true">§</span> <b>{info.rank}</b> cấp {info.tier}</p>
  <div class="bar" aria-hidden="true"><span style="width:{info.progress * 100}%"></span></div>
  {#if info.nextXp}<p class="muted small">còn {info.nextXp - header.xp} XP tới {RANKS[info.index + 1].name}</p>{/if}
</section>
<section class="rail-block">
  <p class="kicker">Hẹn ôn ngày mai</p>
  <p class="rail-big">{dueTomorrow} <span class="muted small">khái niệm</span></p>
</section>
<p class="muted small legal"><strong>Thông tin pháp luật chung, không phải tư vấn pháp lý.</strong> Nội dung do Trần Quang Hào, sinh viên Luật Kinh tế, biên soạn từ văn bản pháp luật hiện hành; luôn đối chiếu nguyên văn trước khi áp dụng cho trường hợp cụ thể.</p>
