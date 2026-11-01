<script lang="ts">
  // Luyện đề: kiểm tra nhanh 10 câu, lọc theo nhóm (spec §5.1).
  import type { ContentIndex } from '$lib/content/types';
  import { loadIndex } from '$lib/content/loader';
  import { stats } from '$lib/store/stats';
  import { hashFor } from '$lib/router.svelte';
  import { GROUPS, filterSets, groupSets } from '$lib/ui/groups';
  import { setRail } from '$lib/ui/rail.svelte';
  import QuizRail from '$lib/ui/QuizRail.svelte';

  let index = $state<ContentIndex | null>(null);
  let best = $state<Record<string, number | null>>({});
  let group = $state<string | null>(null);
  let error = $state('');
  document.title = 'Luyện đề · Luyện Luật';
  loadIndex()
    .then(async (i) => { await stats.ensureV1Migrated(i); for (const s of i.sets) best[s.id] = await stats.best(s.id); index = i; })
    .catch((e: Error) => (error = e.message));

  const groupsAll = $derived(groupSets(index?.sets ?? []));
  const shown = $derived(groupSets(filterSets(index?.sets ?? [], group)));
  const railData = $derived.by(() => {
    const sets = index?.sets ?? [];
    const done = sets.filter((s) => best[s.id] != null);
    const perfect = done.filter((s) => best[s.id] === s.count).length;
    const worst = done.filter((s) => (best[s.id] ?? 0) < s.count).sort((a, b) => (best[a.id] ?? 0) / a.count - (best[b.id] ?? 0) / b.count)[0];
    return { done: done.length, perfect, total: sets.length, retry: worst ? { id: worst.id, title: worst.title, best: best[worst.id] ?? 0, count: worst.count } : null };
  });
  $effect(() => { if (index) return setRail(QuizRail, railData); });
</script>

<h1>Luyện đề 10 câu</h1>
<p class="muted">Luyện đề là kiểm tra nhanh 10 câu, không ghi vào lịch ôn. Muốn nhớ lâu, học khái niệm ở <a href={hashFor('subjects')}>Môn học</a>.</p>
{#if error}
  <section class="card"><p class="muted">Không tải được dữ liệu: {error}</p></section>
{:else if !index}
  <p class="loading">Đang tải…</p>
{:else}
  <div class="filters" role="group" aria-label="Lọc theo nhóm">
    <button type="button" class="filter" aria-pressed={group === null} onclick={() => (group = null)}>Tất cả</button>
    {#each groupsAll as [g] (g)}<button type="button" class="filter" aria-pressed={group === g} onclick={() => (group = g)}>{GROUPS[g] ?? g}</button>{/each}
  </div>
  {#each shown as [g, sets] (g)}
    <p class="kicker">{GROUPS[g] ?? g}</p>
    <div class="sets">
      {#each sets as set (set.id)}
        <a class="set" href={hashFor('quiz', { id: set.id })}>
          <div><span class="chip">{GROUPS[set.group] ?? set.group}</span><h3>{set.title}</h3></div>
          <span class="meta">{#if best[set.id] != null}<span class="best">{best[set.id]}/{set.count}</span>điểm cao nhất{:else}{set.count} câu{/if}</span>
          <p>{set.subtitle}</p>
        </a>
      {/each}
    </div>
  {/each}
{/if}
