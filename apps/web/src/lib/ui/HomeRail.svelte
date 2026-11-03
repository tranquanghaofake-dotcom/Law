<script lang="ts">
  import StreakCard from '$lib/art/StreakCard.svelte';
  // Rail phải của trang Hôm nay (≥ 1440 px): chuỗi + vòng 30 ngày + tuần, hẹn ôn 7 ngày (chức danh đã có ở đáy sidebar).
  // Một số tiến độ duy nhất lấy từ streakView (cardFor/progressOf) — cùng số với chú thích trên thẻ chuyên cần.
  import { header } from './header.svelte';
  import WeekDots from './WeekDots.svelte';
  import { streakView } from './streakView';
  let { week, dueDays }: { week: boolean[]; dueDays: number[] } = $props();

  const sv = $derived(streakView(header.streak, header.longest));
  const cycleNote = $derived(sv.left === 0 && sv.tier ? 'Vòng đã hoàn tất' : sv.nextTierName ? `Còn ${sv.left} ngày tới thẻ ${sv.nextTierName}` : sv.tier ? `Còn ${sv.left} ngày hoàn tất vòng` : 'Học hôm nay để bắt đầu chuỗi');

  const SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const FULL = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
  const bars = $derived.by(() => {
    const max = Math.max(1, ...dueDays);
    const now = new Date();
    return dueDays.map((n, i) => {
      const d = new Date(now); d.setDate(d.getDate() + i);
      const wd = (d.getDay() + 6) % 7;
      return { n, h: n ? Math.max(10, Math.round((n / max) * 100)) : 0, short: i === 0 ? 'Nay' : SHORT[wd], full: i === 0 ? 'Hôm nay (gồm cả quá hạn)' : i === 1 ? 'Ngày mai' : FULL[wd] };
    });
  });
  const tomorrow = $derived(dueDays[1] ?? 0);
  const total = $derived(dueDays.reduce((a, b) => a + b, 0));
</script>

<section class="rail-block rb-streak" style="--fire:{sv.glow}">
  <p class="kicker">Chuỗi</p>
  <StreakCard count={header.streak} longest={header.longest} />
  <div class="rs-head">
    <p class="rail-big">{sv.count} <span class="muted small">ngày liên tiếp</span></p>
    <p class="small muted">Kỷ lục {sv.longest}</p>
  </div>
  <div class="rs-cycle">
    <p class="rs-row"><span>{sv.tierName ? `Vòng ${sv.tierName}` : 'Vòng 30 ngày'}</span><b>{sv.day}/{sv.total}</b></p>
    <div class="bar" role="progressbar" aria-label="Tiến độ vòng 30 ngày" aria-valuemin="0" aria-valuemax={sv.total} aria-valuenow={sv.day}><span style="width:{sv.pct}%"></span></div>
    <p class="small muted">{cycleNote}</p>
  </div>
  <WeekDots days={week} todayLabel />
</section>

<section class="rail-block rb-due">
  <p class="kicker">Hẹn ôn</p>
  <p class="due-line"><span class="muted">Ngày mai:</span> <b>{tomorrow}</b> khái niệm</p>
  <ol class="due-bars" aria-label="Số khái niệm đến hạn trong 7 ngày tới">
    {#each bars as b, i (i)}
      <li class:today={i === 0} class:tm={i === 1}>
        <span class="n small" aria-hidden="true">{b.n || ''}</span>
        <span class="col" aria-hidden="true"><span style="height:{b.h}%"></span></span>
        <span class="d small" aria-hidden="true">{b.short}</span>
        <span class="sr-only">{b.full}: {b.n} khái niệm</span>
      </li>
    {/each}
  </ol>
  <p class="small muted">{total ? `Tổng 7 ngày: ${total} khái niệm` : 'Chưa có khái niệm nào hẹn ôn trong 7 ngày tới'}</p>
</section>
