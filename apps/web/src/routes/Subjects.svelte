<script lang="ts">
  // Tủ sách giáo trình: mỗi môn một bìa, xếp theo kệ nhóm ngành + thứ tự chương trình học, có ô tìm và chip lọc (spec phần nhìn đợt 4 §3.3).
  import type { Level, Subject } from '$lib/content/types';
  import { loadIndex, loadSubject } from '$lib/content/loader';
  import { repo } from '$lib/store/progress-repo';
  import { hashFor } from '$lib/router.svelte';
  import { subjectSummary, type SubjectSummary } from '$lib/ui/subjectSummary';
  import { SHELVES, OTHER_SHELF, shelfOf, orderedSubjects, byRecency, lastStudiedBySubject, type Shelf } from '$lib/ui/shelves';
  import { coverTitle, matchSubject } from '$lib/ui/bookCover';
  import { knownConcepts } from '$lib/ui/today';
  import SubjectArt from '$lib/art/SubjectArt.svelte';
  import BookCover from '$lib/art/BookCover.svelte';
  import { PAGE_ART } from '$lib/art/registry';

  type Item = { subject: Subject; s: SubjectSummary; shelf: Shelf; state: 'new' | 'learning' | 'done' };
  let items = $state<Item[] | null>(null);
  let recent = $state<Record<string, number>>({});
  let query = $state('');
  let pick = $state<string | null>(null);
  let error = $state('');
  document.title = 'Môn học · Luyện Luật';
  (async () => {
    try {
      const index = await loadIndex();
      const subs = orderedSubjects(await Promise.all(index.subjects.filter((s) => (index.conceptCount[s.id] ?? 0) > 0).map((s) => loadSubject(s.id))));
      const all = await repo.all();
      const levels = Object.fromEntries(all.map((p) => [p.conceptId, p.level])) as Record<string, Level>;
      recent = lastStudiedBySubject(all, knownConcepts(subs));
      items = subs.map((subject) => {
        const s = subjectSummary(subject, levels);
        const state = s.total > 0 && s.mastered === s.total ? 'done' : recent[subject.id] != null ? 'learning' : 'new';
        return { subject, s, shelf: shelfOf(subject.id), state };
      });
    } catch (e) { error = (e as Error).message; }
  })();

  const q = $derived(query.trim());
  const filtered = $derived((items ?? []).filter((it) => matchSubject(it.subject, q) && (!pick || it.shelf.id === pick)));
  /** Kệ hiển thị: theo SHELVES, chỉ kệ có môn; môn lạ vào kệ Khác. Khi tìm: một lưới "Kết quả". */
  const shelves = $derived.by(() => {
    if (q) return [{ shelf: { ...OTHER_SHELF, id: 'ket-qua', name: `Kết quả cho “${q}”` }, items: filtered }];
    return [...SHELVES, OTHER_SHELF].map((shelf) => ({ shelf, items: filtered.filter((it) => it.shelf.id === shelf.id) })).filter((g) => g.items.length);
  });
  const studying = $derived(!q && !pick ? byRecency((items ?? []).filter((it) => it.state === 'learning').map((it) => it.subject), recent).slice(0, 4).map((s) => (items ?? []).find((it) => it.subject.id === s.id)!) : []);
  const usedShelves = $derived([...SHELVES, OTHER_SHELF].filter((sh) => (items ?? []).some((it) => it.shelf.id === sh.id)));
</script>

{#snippet cover(it: Item, w: number)}
  {@const short = coverTitle(it.subject.title)}
  <li>
    <a class="cover-link" href={hashFor('subject', { subject: it.subject.id })} data-shelf={it.shelf.id} title={it.subject.title}>
      <BookCover title={short} color={it.shelf.color} percent={it.s.percent} state={it.state} {w} />
      <span class="name">{short}{#if short !== it.subject.title}<span class="sr-only">{it.subject.title.slice(short.length)}</span>{/if}</span>
      <span class="small muted">{it.s.mastered}/{it.s.total}{#if it.state === 'learning'} · đang học{:else if it.state === 'done'} · xong{/if}</span>
    </a>
  </li>
{/snippet}

<header class="page-head subjects-head">
  <SubjectArt name={PAGE_ART.subjects} class="head-art" />
  <h1>Môn học</h1>
  <label class="finder">
    <span class="sr-only">Tìm môn</span>
    <input type="search" placeholder="Tìm môn: gõ không dấu hoặc viết tắt (ds, ttds, hp)" bind:value={query} autocomplete="off" />
  </label>
</header>
{#if error}
  <section class="card"><p class="muted">Không tải được dữ liệu: {error}</p></section>
{:else if !items}
  <p class="loading">Đang tải…</p>
{:else}
  <div class="shelf-chips" role="group" aria-label="Lọc theo nhóm ngành">
    <button type="button" class="filter" aria-pressed={pick === null} onclick={() => (pick = null)}>Tất cả</button>
    {#each usedShelves as sh (sh.id)}
      <button type="button" class="filter" aria-pressed={pick === sh.id} onclick={() => (pick = pick === sh.id ? null : sh.id)} style="--shelf:{sh.color}"><span class="dot" aria-hidden="true"></span>{sh.name}</button>
    {/each}
  </div>
  {#if studying.length}
    <section class="shelf-sec studying">
      <h2 class="section-title"><b>Đang học</b> <span class="small">gần đây nhất trước</span></h2>
      <ul class="cover-grid">{#each studying as it (it.subject.id)}{@render cover(it, 108)}{/each}</ul>
    </section>
  {/if}
  {#each shelves as g (g.shelf.id)}
    <section class="shelf-sec" data-shelf={g.shelf.id} style="--shelf:{g.shelf.color}">
      <h2 class="section-title shelf-title"><span class="dot" aria-hidden="true"></span><b>{g.shelf.name}</b> <span class="small">{g.items.length} môn</span></h2>
      <ul class="cover-grid">{#each g.items as it (it.subject.id)}{@render cover(it, 108)}{/each}</ul>
      <div class="plank" aria-hidden="true"></div>
    </section>
  {:else}
    <p class="muted empty">Không có môn nào khớp “{q}”. Thử gõ không dấu hoặc viết tắt (ví dụ “ds”, “ttds”).</p>
  {/each}
{/if}
