<script lang="ts">
  import Vignette from '$lib/art/Vignette.svelte';
  import { vignetteFor } from '$lib/art/registry';
  // Luyện đề: phiếu đề thi 10 câu, dải số liệu, gợi ý, lọc theo kệ và sắp xếp (spec §5.1; đợt 5 mục 3).
  import type { ContentIndex } from '$lib/content/types';
  import { loadIndex } from '$lib/content/loader';
  import { stats } from '$lib/store/stats';
  import { hashFor } from '$lib/router.svelte';
  import { GROUPS, filterSetsByShelf, shelfOfGroup } from '$lib/ui/groups';
  import { SHELVES, OTHER_SHELF } from '$lib/ui/shelves';
  import { estMinutes, orderIds, pickRandom, quizStats, quizStatus, shelfFor, shelfProgress, sortSets, suggestSets, ticketNo, type SortMode } from '$lib/ui/quiz';
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
  const R = 19, C = 2 * Math.PI * R; // vòng tiến độ nhỏ (SVG)

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
  <p class="loading">Đang tải…</p>
{:else}
  <ul class="qz-stats" aria-label="Số liệu luyện đề">
    <li>
      <svg class="qz-ring" viewBox="0 0 44 44" aria-hidden="true" focusable="false"><circle class="trk" cx="22" cy="22" r={R} /><circle class="val" cx="22" cy="22" r={R} stroke-dasharray={C} stroke-dashoffset={C * (1 - st.donePct / 100)} transform="rotate(-90 22 22)" /></svg>
      <span class="qs-t"><b>{st.done}<small>/{st.total}</small></b><span>Đã làm</span></span>
    </li>
    <li><span class="qs-t"><b>{st.perfect}<small aria-hidden="true">★</small></b><span>Đạt tối đa</span></span></li>
    <li><span class="qs-t"><b>{st.avgPct === null ? '—' : `${st.avgPct}%`}</b><span>Điểm trung bình</span></span></li>
  </ul>

  <section aria-labelledby="qz-sug-h">
    <h2 class="section-title" id="qz-sug-h"><b>Gợi ý cho bạn</b></h2>
    <div class="qz-sug">
      <div class="sug" style:--shelf={sug.next ? shelfFor(sug.next.group).color : undefined}>
        <p class="sug-k">Đề tiếp theo</p>
        {#if sug.next}
          <a class="sug-t" href={hashFor('quiz', { id: sug.next.id })}>{sug.next.title}</a>
          <p class="sug-m">{meta(sug.next)}</p>
        {:else}
          <p class="sug-t none">Bạn đã làm hết các đề.</p><p class="sug-m">Làm lại để nâng điểm.</p>
        {/if}
      </div>
      <div class="sug" style:--shelf={sug.retry ? shelfFor(sug.retry.group).color : undefined}>
        <p class="sug-k">Làm lại đề chưa đạt</p>
        {#if sug.retry}
          <a class="sug-t" href={hashFor('quiz', { id: sug.retry.id })}>{sug.retry.title}</a>
          <p class="sug-m">Điểm cao nhất {best[sug.retry.id]}/{sug.retry.count} · còn {sug.retry.count - (best[sug.retry.id] ?? 0)} câu</p>
        {:else}
          <p class="sug-t none">{st.done ? 'Mọi đề đã làm đều đạt tối đa.' : 'Chưa có đề nào cần làm lại.'}</p><p class="sug-m">{st.done ? 'Giữ nhịp bằng đề mới.' : 'Làm vài đề, mình sẽ gợi ý đề yếu nhất.'}</p>
        {/if}
      </div>
      <div class="sug" style:--shelf={rand ? shelfFor(rand.group).color : undefined}>
        <p class="sug-k">Đề ngẫu nhiên</p>
        {#if rand}
          <div aria-live="polite">
            <a class="sug-t" href={hashFor('quiz', { id: rand.id })}>{rand.title}</a>
            <p class="sug-m">{meta(rand)}</p>
          </div>
          <button type="button" class="sug-btn" onclick={reshuffle}><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false"><path d="M3 6h9a4 4 0 0 1 0 8H8M3 6l3-3M3 6l3 3M17 14H8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>Xáo đề khác</button>
        {/if}
      </div>
    </div>
  </section>

  <h2 class="section-title" id="qz-all-h"><b>Tất cả đề</b></h2>
  <div class="qz-tools">
    <div class="shelf-chips" role="group" aria-label="Lọc theo nhóm ngành">
      <button type="button" class="filter" aria-pressed={pick === null} onclick={() => (pick = null)}>Tất cả</button>
      {#each usedShelves as sh (sh.id)}
        <button type="button" class="filter" aria-pressed={pick === sh.id} onclick={() => (pick = pick === sh.id ? null : sh.id)} style="--shelf:{sh.color}"><span class="dot" aria-hidden="true"></span>{sh.name}</button>
      {/each}
    </div>
    <div class="qz-sort" role="group" aria-label="Sắp xếp đề">
      <span class="qz-sort-l" aria-hidden="true">Sắp xếp</span>
      {#each SORTS as o (o.id)}
        <button type="button" class="filter" aria-pressed={sort === o.id} onclick={() => (sort = o.id)}>{o.label}</button>
      {/each}
    </div>
  </div>
  <p class="qz-count small muted" role="status">Hiện {shown.length}/{all.length} đề</p>

  <div class="tickets">
    {#each shown as set (set.id)}
      {@const b = best[set.id]}
      {@const status = quizStatus(b, set.count)}
      <a class="ticket {status}" href={hashFor('quiz', { id: set.id })} style="--shelf:{shelfFor(set.group).color}">
        <div class="tk-head"><span class="tk-no">Đề {ticketNo(order, set.id)}</span><span class="tk-grp">{GROUPS[set.group] ?? set.group}</span></div>
        <div class="tk-body">
          <div class="tk-text"><h3>{set.title}</h3><p>{set.subtitle}</p></div>
          <div class="tk-pic">
            <Vignette name={vignetteFor(set)} class="tk-art" />
            {#if b != null}<span class="tk-stamp"><span class="sr-only">điểm cao nhất </span>{b}/{set.count}</span>{/if}
          </div>
        </div>
        <div class="tk-foot">
          <span class="tk-meta">{set.count} câu · ~{estMinutes(set.count)} phút</span>
          {#if status === 'new'}<span class="tk-st new">Mới</span>{:else if status === 'perfect'}<span class="tk-st perfect">Tối đa <span aria-hidden="true">★</span></span>{:else}<span class="tk-st done">Đã làm</span>{/if}
        </div>
      </a>
    {/each}
  </div>
{/if}
