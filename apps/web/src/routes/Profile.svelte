<script lang="ts">
  // Hồ sơ: hai tab Tổng quan (#/toi) · Cài đặt (#/cai-dat) (spec §5.2).
  import type { Level } from '$lib/content/types';
  import { loadIndex, loadSubject } from '$lib/content/loader';
  import { repo } from '$lib/store/progress-repo';
  import { storage } from '$lib/store/status.svelte';
  import { stats, EMPTY_STREAK } from '$lib/store/stats';
  import { rankFor, RANKS } from '$lib/game/rank';
  import { LEVEL_NAMES } from '$lib/game/levels';
  import type { StreakState } from '$lib/game/streak';
  import { hashFor, route } from '$lib/router.svelte';
  import { subjectSummary, type SubjectSummary } from '$lib/ui/subjectSummary';
  import { weekFlags, weekStart } from '$lib/ui/week';
  import WeekDots from '$lib/ui/WeekDots.svelte';
  import Settings from './Settings.svelte';

  const onSettings = $derived(route.name === 'settings');
  let xp = $state(0);
  let streak = $state<StreakState>(EMPTY_STREAK);
  let byLevel = $state<number[]>([0, 0, 0, 0, 0, 0, 0]);
  let week = $state<boolean[]>(Array(7).fill(false));
  let subjects = $state<{ id: string; title: string; s: SubjectSummary }[]>([]);
  let msg = $state('');
  const rank = $derived(rankFor(xp));
  const learned = $derived(byLevel.slice(1).reduce((a, b) => a + b, 0));
  const maxCol = $derived(Math.max(1, ...byLevel));

  async function load() {
    try {
      xp = await stats.xp();
      streak = await stats.streak();
      const all = await repo.all();
      const counts = [0, 0, 0, 0, 0, 0, 0];
      for (const p of all) counts[p.level] += 1;
      byLevel = counts;
      week = weekFlags(await repo.reviewDays(weekStart()));
      const levels = Object.fromEntries(all.map((p) => [p.conceptId, p.level])) as Record<string, Level>;
      const index = await loadIndex();
      const out = [];
      for (const s of index.subjects) { const sub = await loadSubject(s.id); out.push({ id: s.id, title: s.title, s: subjectSummary(sub, levels) }); }
      subjects = out;
    } catch (e) { msg = `Không tải được dữ liệu: ${(e as Error).message}`; }
  }
  $effect(() => { document.title = onSettings ? 'Cài đặt · Luyện Luật' : 'Hồ sơ · Luyện Luật'; });
  load();

  async function exportData() {
    const json = await repo.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `luyen-luat-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(a.href);
  }
  async function importData(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    try { await repo.importAll(await f.text()); msg = 'Đã nhập dữ liệu.'; await load(); } catch { msg = 'File không hợp lệ.'; }
  }
</script>

<h1>Hồ sơ</h1>
<div class="tabs" role="tablist" aria-label="Hồ sơ">
  <a role="tab" href={hashFor('profile')} aria-selected={!onSettings} class:on={!onSettings}>Tổng quan</a>
  <a role="tab" href={hashFor('settings')} aria-selected={onSettings} class:on={onSettings}>⚙ Cài đặt</a>
</div>

{#if onSettings}
  <div role="tabpanel"><Settings /></div>
{:else}
  <div role="tabpanel" class="profile-grid">
    <section class="card profile">
      <p class="kicker">Bậc khoa cử</p>
      <p class="rank-line"><span class="seal big-seal" aria-hidden="true">§</span> <b>{rank.rank}</b> cấp {rank.tier} · {xp} XP</p>
      <div class="bar" aria-hidden="true"><span style="width:{rank.progress * 100}%"></span></div>
      {#if rank.nextXp}<p class="muted small">còn {rank.nextXp - xp} XP tới {RANKS[rank.index + 1].name}</p>{/if}
      <p class="kicker" style="margin-top:16px">Chuỗi ngày</p>
      <p>🔥 <b>{streak.count}</b> ngày · dài nhất {streak.longest} · bùa giữ chuỗi {streak.freezes}/2</p>
      <WeekDots days={week} />
    </section>
    <section class="card">
      <p class="kicker">Phẩm hàm theo môn</p>
      <ul class="plain-list grade-list">
        {#each subjects as x (x.id)}
          <li><a href={hashFor('subject', { subject: x.id })}><b>{x.title}</b> · {x.s.grade ?? 'Chưa có phẩm'}</a>
            <span class="bar" aria-hidden="true"><span style="width:{x.s.percent}%"></span></span>
            <span class="muted small">{x.s.mastered}/{x.s.total} khái niệm bậc ≥ 5</span></li>
        {:else}<li class="muted">Chưa có môn nào.</li>{/each}
      </ul>
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
    </section>
    <section class="card wide">
      <p class="kicker">Dữ liệu</p>
      <p class="muted small">Tiến độ lưu trong trình duyệt này. Xuất file để chuyển máy hoặc lưu dự phòng.</p>
      <div class="row">
        <button class="btn ghost" type="button" onclick={exportData}>Xuất dữ liệu</button>
        <label class="btn ghost">Nhập dữ liệu<input type="file" accept="application/json" class="sr-only" onchange={importData} /></label>
      </div>
      {#if msg}<p role="status">{msg}</p>{/if}
      {#if !storage.available}<p class="muted">⚠ Trình duyệt đang chặn lưu trữ: tiến độ sẽ mất khi đóng tab.</p>{/if}
    </section>
  </div>
{/if}
