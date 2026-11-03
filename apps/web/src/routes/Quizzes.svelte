<script lang="ts">
  import SubjectArt from '$lib/art/SubjectArt.svelte';
  import { PAGE_ART } from '$lib/art/registry';
  import Vignette from '$lib/art/Vignette.svelte';
  import { vignetteFor } from '$lib/art/registry';
  // Luyện đề: kiểm tra nhanh 10 câu, lọc theo nhóm (spec §5.1).
  import type { ContentIndex } from '$lib/content/types';
  import { loadIndex } from '$lib/content/loader';
  import { stats } from '$lib/store/stats';
  import { hashFor } from '$lib/router.svelte';
  import { GROUPS, filterSetsByShelf, groupSets, shelfOfGroup } from '$lib/ui/groups';
  import { SHELVES, OTHER_SHELF } from '$lib/ui/shelves';
  import { setRail } from '$lib/ui/rail.svelte';
  import QuizRail from '$lib/ui/QuizRail.svelte';

  let index = $state<ContentIndex | null>(null);
  let best = $state<Record<string, number | null>>({});
  let pick = $state<string | null>(null);
  let error = $state('');
  document.title = 'Luyện đề · Luyện Luật';
  loadIndex()
    .then(async (i) => { await stats.ensureV1Migrated(i); for (const s of i.sets) best[s.id] = await stats.best(s.id); index = i; })
    .catch((e: Error) => (error = e.message));

  const usedShelves = $derived([...SHELVES, OTHER_SHELF].filter((sh) => (index?.sets ?? []).some((s) => shelfOfGroup(s.group) === sh.id)));
  const shown = $derived(groupSets(filterSetsByShelf(index?.sets ?? [], pick)));
  const railData = $derived.by(() => {
    const sets = index?.sets ?? [];
    const done = sets.filter((s) => best[s.id] != null);
    const perfect = done.filter((s) => best[s.id] === s.count).length;
    const worst = done.filter((s) => (best[s.id] ?? 0) < s.count).sort((a, b) => (best[a.id] ?? 0) / a.count - (best[b.id] ?? 0) / b.count)[0];
    return { done: done.length, perfect, total: sets.length, retry: worst ? { id: worst.id, title: worst.title, best: best[worst.id] ?? 0, count: worst.count } : null };
  });
  $effect(() => { if (index) return setRail(QuizRail, railData); });
</script>

<header class="page-head">
  <SubjectArt name={PAGE_ART.quizzes} class="head-art" />
  <h1>Luyện đề 10 câu</h1>
  <p class="muted">Bộ 10 câu tình huống theo ngành luật; kết quả không ghi vào lịch ôn.</p>
</header>
{#if error}
  <section class="card"><p class="muted">Không tải được dữ liệu: {error}</p></section>
{:else if !index}
  <p class="loading">Đang tải…</p>
{:else}
  <div class="shelf-chips" role="group" aria-label="Lọc theo nhóm ngành">
    <button type="button" class="filter" aria-pressed={pick === null} onclick={() => (pick = null)}>Tất cả</button>
    {#each usedShelves as sh (sh.id)}
      <button type="button" class="filter" aria-pressed={pick === sh.id} onclick={() => (pick = pick === sh.id ? null : sh.id)} style="--shelf:{sh.color}"><span class="dot" aria-hidden="true"></span>{sh.name}</button>
    {/each}
  </div>
  {#each shown as [g, sets] (g)}
    <p class="kicker">{GROUPS[g] ?? g}</p>
    <div class="sets">
      {#each sets as set (set.id)}
        <a class="set" href={hashFor('quiz', { id: set.id })}>
          <Vignette name={vignetteFor(set)} class="set-art" />
          <div><h3>{set.title}</h3></div>
          <span class="meta">{#if best[set.id] != null}<span class="best">{best[set.id]}/{set.count}</span>điểm cao nhất{:else}{set.count} câu{/if}</span>
          <p>{set.subtitle}</p>
        </a>
      {/each}
    </div>
  {/each}
{/if}
