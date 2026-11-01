<script lang="ts">
  import type { ContentIndex, Level } from '$lib/content/types';
  import { loadIndex, loadSubject } from '$lib/content/loader';
  import { repo } from '$lib/store/progress-repo';
  import { stats, EMPTY_STREAK } from '$lib/store/stats';
  import { gradeFor, rankFor, RANKS } from '$lib/game/rank';
  import type { StreakState } from '$lib/game/streak';

  let xp = $state(0);
  let streak = $state<StreakState>(EMPTY_STREAK);
  let byLevel = $state<number[]>([0, 0, 0, 0, 0, 0, 0]);
  let subjects = $state<{ id: string; title: string; grade: string | null; mastered: number; total: number }[]>([]);
  let msg = $state('');
  const rank = $derived(rankFor(xp));
  const LEVEL_NAMES = ['Chưa học', 'Gặp', 'Nhận biết', 'Phân biệt', 'Điền', 'Tình huống', 'Thuần thục'];

  async function load() {
    document.title = 'Hồ sơ · Luyện Luật';
    xp = await stats.xp();
    streak = await stats.streak();
    const all = await repo.all();
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const p of all) counts[p.level] += 1;
    byLevel = counts;
    const index: ContentIndex = await loadIndex();
    const out = [];
    for (const s of index.subjects) {
      const sub = await loadSubject(s.id);
      const ids = sub.chapters.flatMap((c) => c.lessons.flatMap((l) => l.concepts));
      const lv = Object.fromEntries(all.filter((p) => p.subject === s.id).map((p) => [p.conceptId, p.level])) as Record<string, Level>;
      const mastered = ids.filter((id) => (lv[id] ?? 0) >= 5).length;
      out.push({ id: s.id, title: s.title, grade: ids.length ? gradeFor(mastered / ids.length) : null, mastered, total: ids.length });
    }
    subjects = out;
  }
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

<section class="card profile">
  <h1>Hồ sơ</h1>
  <p class="rank-line"><span class="seal big-seal" aria-hidden="true">§</span> <b>{rank.rank}</b> cấp {rank.tier} · {xp} XP
    {#if rank.nextXp}<span class="muted">· còn {rank.nextXp - xp} XP tới {RANKS[rank.index + 1].name}</span>{/if}</p>
  <div class="bar" aria-hidden="true"><span style="width:{rank.progress * 100}%"></span></div>
  <p>🔥 Chuỗi <b>{streak.count}</b> ngày · dài nhất {streak.longest} · bùa giữ chuỗi {streak.freezes}/2</p>
</section>
<section class="card">
  <h2 style="margin-top:0">Phẩm hàm theo môn</h2>
  {#each subjects as s (s.id)}
    <p><b>{s.title}</b>: {s.grade ?? 'Chưa có phẩm'} <span class="muted">({s.mastered}/{s.total} khái niệm bậc ≥ 5)</span></p>
  {:else}<p class="muted">Chưa có môn nào.</p>{/each}
</section>
<section class="card">
  <h2 style="margin-top:0">Khái niệm theo bậc</h2>
  <div class="levels" role="img" aria-label={byLevel.map((n, i) => `${LEVEL_NAMES[i]}: ${n}`).join(', ')}>
    {#each byLevel as n, i}
      <div class="col"><span class="n">{n}</span><span class="stick" style="height:{Math.max(4, Math.min(80, n * 8))}px;opacity:{0.35 + i * 0.1}"></span><span class="small muted">{i}</span></div>
    {/each}
  </div>
  <p class="small muted">0 chưa học · 6 thuần thục</p>
</section>
<section class="card">
  <h2 style="margin-top:0">Dữ liệu</h2>
  <p class="muted small">Tiến độ lưu trong trình duyệt này. Xuất file để chuyển máy hoặc lưu dự phòng.</p>
  <div class="row">
    <button class="btn ghost" type="button" onclick={exportData}>Xuất dữ liệu</button>
    <label class="btn ghost">Nhập dữ liệu<input type="file" accept="application/json" class="sr-only" onchange={importData} /></label>
  </div>
  {#if msg}<p role="status">{msg}</p>{/if}
  {#if !repo.available}<p class="muted">⚠ Trình duyệt đang chặn lưu trữ: tiến độ sẽ mất khi đóng tab.</p>{/if}
</section>
