<script lang="ts">
  // Luyện đề (tạm: lưới đề theo nhóm; Task 7 thêm lọc và rail theo spec §5.1).
  import type { ContentIndex } from '$lib/content/types';
  import { loadIndex } from '$lib/content/loader';
  import { stats } from '$lib/store/stats';
  import { hashFor } from '$lib/router.svelte';
  import { GROUPS, sortGroups } from '$lib/ui/groups';

  let index = $state<ContentIndex | null>(null);
  let best = $state<Record<string, number | null>>({});
  document.title = 'Luyện đề · Luyện Luật';
  loadIndex().then(async (i) => { for (const s of i.sets) best[s.id] = await stats.best(s.id); index = i; });
  const groups = $derived.by(() => {
    const m = new Map<string, ContentIndex['sets']>();
    for (const s of index?.sets ?? []) m.set(s.group, [...(m.get(s.group) ?? []), s]);
    return sortGroups([...m.entries()]);
  });
</script>

<h1>Luyện đề 10 câu</h1>
<p class="muted">Luyện đề là kiểm tra nhanh 10 câu, không ghi vào lịch ôn. Muốn nhớ lâu, học khái niệm ở <a href="#/mon">Môn học</a>.</p>
{#if !index}
  <p class="loading">Đang tải…</p>
{:else}
  {#each groups as [g, sets] (g)}
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
