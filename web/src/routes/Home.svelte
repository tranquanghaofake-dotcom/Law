<script lang="ts">
  import type { ContentIndex, Level, Subject } from '$lib/content/types';
  import { loadIndex, loadSubject } from '$lib/content/loader';
  import { repo } from '$lib/store/progress-repo';
  import { stats } from '$lib/store/stats';
  import { gradeFor } from '$lib/game/rank';
  import SubjectPath from '$lib/ui/SubjectPath.svelte';

  const GROUPS: Record<string, string> = { pldc: 'Pháp luật đại cương', 'dan-su': 'Luật Dân sự', 'lao-dong': 'Luật Lao động', 'hinh-su': 'Luật Hình sự', 'hien-phap': 'Luật Hiến pháp' };

  let index = $state<ContentIndex | null>(null);
  let subjects = $state<Subject[]>([]);
  let levels = $state<Record<string, Level>>({});
  let grades = $state<Record<string, string | null>>({});
  let due = $state(0);
  let best = $state<Record<string, number | null>>({});
  let error = $state('');

  async function load() {
    try {
      document.title = 'Luyện Luật';
      index = await loadIndex();
      subjects = await Promise.all(index.subjects.map((s) => loadSubject(s.id)));
      const all = await repo.all();
      levels = Object.fromEntries(all.map((p) => [p.conceptId, p.level]));
      for (const s of subjects) {
        const ids = s.chapters.flatMap((c) => c.lessons.flatMap((l) => l.concepts));
        const mastered = ids.filter((id) => (levels[id] ?? 0) >= 5).length;
        grades[s.id] = ids.length ? gradeFor(mastered / ids.length) : null;
      }
      due = (await repo.due(new Date())).length;
      // nhập điểm cao nhất từ web v1 (localStorage) một lần
      for (const set of index.sets) {
        let b = await stats.best(set.id);
        if (b == null) {
          try {
            const old = localStorage.getItem(`best:${set.id}`);
            if (old != null) { b = Number(JSON.parse(old)); await stats.setBest(set.id, b); localStorage.removeItem(`best:${set.id}`); }
          } catch { /* bỏ qua */ }
        }
        best[set.id] = b;
      }
    } catch (e) { error = (e as Error).message; }
  }
  load();
  const groups = $derived.by(() => {
    const m = new Map<string, ContentIndex['sets']>();
    for (const s of index?.sets ?? []) m.set(s.group, [...(m.get(s.group) ?? []), s]);
    return [...m.entries()];
  });
</script>

{#if error}
  <section class="card"><p class="muted">Không tải được dữ liệu ({error}). Nếu mở file trực tiếp, hãy chạy <code>npm run dev</code> trong thư mục web/.</p></section>
{:else if !index}
  <p class="loading">Đang tải…</p>
{:else}
  <section class="hero">
    <h1>Nhớ luật như nhớ tên bạn.</h1>
    <p class="muted">Học từng khái niệm qua 6 bậc: gặp, nhận biết, phân biệt, điền, tình huống, tự trả lời. Ôn đúng lúc sắp quên.</p>
  </section>
  <a class="card today {due ? 'has-due' : ''}" href={due ? '#/on' : '#/'} aria-label={due ? `Ôn hôm nay ${due} khái niệm` : 'Chưa có gì cần ôn'}>
    <span class="kicker">Ôn hôm nay</span>
    {#if due}<span class="big">{due}</span><span>khái niệm đang chờ. Vào ôn →</span>
    {:else}<span class="big">0</span><span>Chưa có gì cần ôn — học mới nào.</span>{/if}
  </a>
  {#each subjects as s (s.id)}
    <SubjectPath subject={s} {levels} grade={grades[s.id] ?? null} />
  {/each}
  <h2 class="section-title"><b>Luyện đề 10 câu</b> kiểm tra nhanh</h2>
  {#each groups as [g, sets] (g)}
    <p class="kicker">{GROUPS[g] ?? g}</p>
    <div class="sets">
      {#each sets as set (set.id)}
        <a class="set" href="#/bo/{encodeURIComponent(set.id)}">
          <div><span class="chip">{GROUPS[set.group] ?? set.group}</span><h3>{set.title}</h3></div>
          <span class="meta">{#if best[set.id] != null}<span class="best">{best[set.id]}/{set.count}</span>điểm cao nhất{:else}{set.count} câu{/if}</span>
          <p>{set.subtitle}</p>
        </a>
      {/each}
    </div>
  {/each}
{/if}
