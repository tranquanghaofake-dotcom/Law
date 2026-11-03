<script lang="ts">
  // Phần "Chuyên cần & tiến độ" ở Hồ sơ: thẻ chuyên cần + chuỗi + tuần + khái niệm theo bậc.
  // Đợt 6: Hồ sơ (Profile.svelte) chỉ đặt component này; bố cục bên trong do người sở hữu file này quyết định.
  import StreakCard from '$lib/art/StreakCard.svelte';
  import WeekDots from './WeekDots.svelte';
  import { LEVEL_NAMES } from '$lib/game/levels';
  import type { StreakState } from '$lib/game/streak';
  import { hashFor } from '$lib/router.svelte';
  let { streak, xp, week, byLevel }: { streak: StreakState; xp: number; week: boolean[]; byLevel: number[] } = $props();
  const learned = $derived(byLevel.slice(1).reduce((a, b) => a + b, 0));
  const maxCol = $derived(Math.max(1, ...byLevel));
</script>

<div class="streak-pane profile">
  <StreakCard count={streak.count} longest={streak.longest} />
  <p class="streak-line"><b>{streak.count}</b> ngày · {xp} XP · dài nhất {streak.longest} · bùa giữ chuỗi {streak.freezes}/2</p>
  <WeekDots days={week} />
</div>
<p class="kicker" style="margin-top:16px">Khái niệm theo bậc</p>
{#if learned === 0}
  <p class="empty muted">Chưa học khái niệm nào · <a href={hashFor('home')}>Học đợt đầu tiên →</a></p>
{:else}
  <div class="levels" role="img" aria-label={byLevel.map((n, i) => `${LEVEL_NAMES[i]}: ${n}`).join(', ')}>
    {#each byLevel as n, i (i)}
      <div class="col"><span class="n">{n}</span><span class="stick cell lv{i}" style="height:{Math.max(4, (n / maxCol) * 80)}px"></span><span class="small muted">{i}</span></div>
    {/each}
  </div>
  <p class="small muted">0 chưa học · 6 thuần thục</p>
{/if}
