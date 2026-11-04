<script lang="ts">
  import Loading from '$lib/ui/Loading.svelte';
  import Glyph from '$lib/art/Glyph.svelte';
  import Vignette from '$lib/art/Vignette.svelte';
  import { vignetteFor } from '$lib/art/registry';
  // Luyện đề: phiếu đề thi 10 câu, dải số liệu, gợi ý, lọc theo kệ và sắp xếp (spec §5.1; đợt 5 mục 3).
  import type { ContentIndex } from '$lib/content/types';
  import { loadIndex } from '$lib/content/loader';
  import { stats } from '$lib/store/stats';
  import { hashFor } from '$lib/router.svelte';
  import { GROUPS, filterSetsByShelf, shelfOfGroup } from '$lib/ui/groups';
  import { SHELVES, OTHER_SHELF } from '$lib/ui/shelves';
  import { estMinutes, groupByShelf, orderIds, pickRandom, quizStats, quizStatus, shelfFor, shelfProgress, sortSets, suggestSets, ticketNo, type SortMode } from '$lib/ui/quiz';
  import { setRail } from '$lib/ui/rail.svelte';
  import QuizRail from '$lib/ui/QuizRail.svelte';

  type SetRow = ContentIndex['sets'][number];
  const SORTS: { id: SortMode; label: string }[] = [{ id: 'shelf', label: 'Theo kệ' }, { id: 'new-first', label: 'Chưa làm trước' }, { id: 'low-first', label: 'Điểm thấp trước' }];

  let index = $state<ContentIndex | null>(null);
  let best = $state<Record<string, number | null>>({});
  let pick = $state<string | null>(null);
  let sort = $state<SortMode>('shelf');
  let seed = $state(Math.floor(Math.random() * 0xffffffff));
  let randId = $state<string | null>(null);
  let error = $state('');
  document.title = 'Luyện đề · Luyện Luật';
  loadIndex()
    .then(async (i) => { await stats.ensureV1Migrated(i); for (const s of i.sets) best[s.id] = await stats.best(s.id); randId = pickRandom(i.sets, seed)?.id ?? null; index = i; })
    .catch((e: Error) => (error = e.message));

  const all = $derived(index?.sets ?? []);
  const order = $derived(orderIds(all));
  const usedShelves = $derived([...SHELVES, OTHER_SHELF].filter((sh) => all.some((s) => shelfOfGroup(s.group) === sh.id)));
  const shown = $derived(sortSets(filterSetsByShelf(all, pick), best, sort));
  const st = $derived(quizStats(all, best));
  const sug = $derived(suggestSets(all, best, order));
  const rand = $derived(all.find((s) => s.id === randId) ?? null);

  function reshuffle() { seed += 1; randId = pickRandom(all, seed, randId)?.id ?? null; }
  const meta = (s: SetRow) => `Đề ${ticketNo(order, s.id)} · ${GROUPS[s.group] ?? s.group} · ${s.count} câu`;
  $effect(() => { if (index) return setRail(QuizRail, { byShelf: shelfProgress(all, best) }); });
</script>

<header class="qz-head">
  <h1>Luyện đề 10 câu</h1>
  <p class="muted">Bộ 10 câu tình huống theo ngành luật; kết quả không ghi vào lịch ôn.</p>
</header>
{#if error}
  <section class="card"><p class="muted">Không tải được dữ liệu: {error}</p></section>
{:else if !index}
  <Loading />
{:else}
  <p class="qz-line small" aria-label="Số liệu luyện đề"><b>{st.done}/{st.total}</b> đề đã làm · <b>{st.perfect}</b> đạt tối đa · điểm trung bình <b>{st.avgPct === null ? '—' : `${st.avgPct}%`}</b></p>

  <section class="qz-next card" aria-labelledby="qz-sug-h" style:--shelf={sug.next ? shelfFor(sug.next.group).color : undefined}>
    <h2 class="qz-next-k" id="qz-sug-h">{sug.next ? 'Đề tiếp theo' : 'Bạn đã làm hết các đề'}</h2>
    {#if sug.next}
      <p class="qz-next-t">{sug.next.title}</p>
      <p class="qz-next-m small muted">{meta(sug.next)} · ~{estMinutes(sug.next.count)} phút</p>
      <a class="btn primary" href={hashFor('quiz', { id: sug.next.id })}>Làm đề {ticketNo(order, sug.next.id)} →</a>
    {:else}
      <p class="qz-next-m small muted">Làm lại để nâng điểm, hoặc chọn đề ngẫu nhiên bên dưới.</p>
    {/if}
    <ul class="qz-alt small">
      {#if sug.retry}<li>Làm lại đề chưa đạt: <a href={hashFor('quiz', { id: sug.retry.id })}>{sug.retry.title}</a> <span class="muted">({best[sug.retry.id]}/{sug.retry.count})</span></li>{/if}
      {#if rand}<li><span aria-live="polite">Đề ngẫu nhiên: <a href={hashFor('quiz', { id: rand.id })}>{rand.title}</a></span>
        <button type="button" class="sug-btn" onclick={reshuffle}><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false"><path d="M3 6h9a4 4 0 0 1 0 8H8M3 6l3-3M3 6l3 3M17 14H8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>Xáo đề khác</button></li>{/if}
    </ul>
  </section>

  <h2 class="section-title" id="qz-all-h"><b>Tất cả đề</b></h2>
  <div class="qz-tools">
    <div class="shelf-chips" role="group" aria-label="Lọc theo nhóm ngành">
      <button type="button" class="filter" aria-pressed={pick === null} onclick={() => (pick = null)}>Tất cả</button>
      {#each usedShelves as sh (sh.id)}
        <button type="button" class="filter" aria-pressed={pick === sh.id} onclick={() => (pick = pick === sh.id ? null : sh.id)} style="--shelf:{sh.color}"><span class="dot" aria-hidden="true"></span>{sh.name}</button>
      {/each}
    </div>
    <label class="qz-sort-wrap small"><span>Sắp xếp</span>
      <select class="qz-sort" bind:value={sort}>
        {#each SORTS as o (o.id)}<option value={o.id}>{o.label}</option>{/each}
      </select>
    </label>
  </div>
  <p class="qz-count small muted" role="status">Hiện {shown.length}/{all.length} đề</p>

  {#snippet tickets(list: SetRow[], hTag: 'h3' | 'h4')}
    <div class="tickets">
      {#each list as set (set.id)}
        {@const b = best[set.id]}
        {@const status = quizStatus(b, set.count)}
        <a class="ticket {status}" href={hashFor('quiz', { id: set.id })} style="--shelf:{shelfFor(set.group).color}">
          <div class="tk-head"><span class="tk-no">Đề {ticketNo(order, set.id)}</span><span class="tk-grp">{GROUPS[set.group] ?? set.group}</span></div>
          <div class="tk-body">
            <div class="tk-text"><svelte:element this={hTag}>{set.title}</svelte:element><p>{set.subtitle}</p></div>
            <div class="tk-pic">
              <Vignette name={vignetteFor(set)} class="tk-art" />
              {#if b != null}<span class="tk-stamp"><span class="sr-only">điểm cao nhất </span>{b}/{set.count}</span>{/if}
            </div>
          </div>
          <div class="tk-foot">
            <span class="tk-meta">{set.count} câu · ~{estMinutes(set.count)} phút</span>
            {#if status === 'perfect'}<span class="tk-st perfect">Tối đa <Glyph name="star-fill" size={12} /></span>{:else if status === 'done'}<span class="tk-st done">Đã làm</span>{/if}
          </div>
        </a>
      {/each}
    </div>
  {/snippet}
  {#if sort === 'shelf' && pick === null}
    {#each groupByShelf(shown) as g (g.id)}
      <h3 class="qz-shelf-h" style="--shelf:{g.color}"><span class="dot" aria-hidden="true"></span>{g.name} <span class="muted small">{g.sets.length} đề</span></h3>
      {@render tickets(g.sets, 'h4')}
    {/each}
  {:else}
    {@render tickets(shown, 'h3')}
  {/if}
{/if}
