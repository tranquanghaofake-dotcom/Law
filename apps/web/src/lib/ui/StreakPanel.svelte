<script lang="ts">
  // Phần "Chuyên cần & tiến độ" ở Hồ sơ. ≥ 768 px: hai cột cân nhau — thẻ chuyên cần | số chuỗi lớn + lưới số liệu + tuần; điện thoại xếp dọc.
  // Dưới cùng: khái niệm theo bậc dạng thanh ngang (mỗi bậc một hàng, có tên bậc) cao ≤ 120 px.
  import StreakCard from '$lib/art/StreakCard.svelte';
  import WeekDots from './WeekDots.svelte';
  import CountUp from './CountUp.svelte';
  import { LEVEL_NAMES } from '$lib/game/levels';
  import type { StreakState } from '$lib/game/streak';
  import { hashFor } from '$lib/router.svelte';
  let { streak, xp, week, byLevel, ready = true }: { streak: StreakState; xp: number; week: boolean[]; byLevel: number[]; ready?: boolean } = $props();
  const learned = $derived(byLevel.slice(1).reduce((a, b) => a + b, 0));
  const maxCol = $derived(Math.max(1, ...byLevel));
  const stats = $derived([
    { k: 'Chuỗi hiện tại', v: `${streak.count} ngày` },
    { k: 'Kỷ lục', v: `${streak.longest} ngày` },
    { k: 'Điểm kinh nghiệm', v: `${xp} XP` },
    { k: 'Bùa giữ chuỗi', v: `${streak.freezes}/2` },
  ]);
</script>

<div class="sp">
  <div class="sp-card"><StreakCard count={streak.count} longest={streak.longest} /></div>
  <div class="sp-side">
    <p class="sp-big"><b><CountUp value={streak.count} key="streak" {ready} /></b><span>ngày liên tiếp</span></p>
    <dl class="sp-stats">
      {#each stats as s (s.k)}<div><dt>{s.k}</dt><dd>{#if s.k === 'Điểm kinh nghiệm'}<CountUp value={xp} key="xp" {ready} /> XP{:else}{s.v}{/if}</dd></div>{/each}
    </dl>
    <p class="kicker sp-k">7 ngày gần nhất</p>
    <WeekDots days={week} todayLabel />
  </div>
</div>
<div class="sp-levels">
  <p class="kicker sp-k">Khái niệm theo bậc ghi nhớ</p>
  {#if learned === 0}
    <p class="empty muted">Chưa học khái niệm nào · <a href={hashFor('home')}>Học đợt đầu tiên →</a></p>
  {:else}
    <ul class="sp-lv" aria-label={byLevel.map((n, i) => `Bậc ${i} ${LEVEL_NAMES[i]}: ${n}`).join(', ')}>
      {#each byLevel as n, i (i)}
        <li><span class="sp-lvn small">{i} · {LEVEL_NAMES[i]}</span><span class="sp-bar"><span class="cell lv{i}" style="width:{n ? Math.max(3, (n / maxCol) * 100) : 0}%"></span></span><b class="small">{n}</b></li>
      {/each}
    </ul>
    <p class="small muted sp-note">Bậc 0 = chưa học · bậc 6 = tinh thông (nhớ lâu).</p>
  {/if}
</div>
