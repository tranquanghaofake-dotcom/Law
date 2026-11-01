<script lang="ts">
  import SubjectArt from '$lib/art/SubjectArt.svelte';
  import { PAGE_ART } from '$lib/art/registry';
  // Danh mục khái niệm của một môn: đọc nhanh định nghĩa, căn cứ, khái niệm dễ nhầm; tìm không dấu; ★ đánh dấu.
  import type { Concept, Level, Subject } from '$lib/content/types';
  import { loadConcepts, loadSubject } from '$lib/content/loader';
  import { repo } from '$lib/store/progress-repo';
  import { stars } from '$lib/store/stars.svelte';
  import { hashFor, route } from '$lib/router.svelte';
  import { LEVEL_NAMES } from '$lib/game/levels';
  import { matchConcept } from '$lib/ui/conceptSearch';
  import { tick } from 'svelte';

  type Group = { lessonId: string; title: string; concepts: Concept[] };
  let subject = $state<Subject | null>(null);
  let byId = $state<Record<string, Concept>>({});
  let levels = $state<Record<string, Level>>({});
  let error = $state('');
  let query = $state('');
  let onlyStarred = $state(false);
  let open = $state<string[]>([]);

  const groups = $derived.by<Group[]>(() => {
    if (!subject) return [];
    return subject.chapters.flatMap((ch) => ch.lessons.map((l) => ({
      lessonId: l.id,
      title: l.title,
      concepts: l.concepts.map((id) => byId[id]).filter((c): c is Concept => !!c)
        .filter((c) => matchConcept(c, query) && (!onlyStarred || stars.has(c.id))),
    }))).filter((g) => g.concepts.length);
  });
  const shown = $derived(groups.reduce((n, g) => n + g.concepts.length, 0));
  const total = $derived(Object.keys(byId).length);
  const starredCount = $derived(stars.ids.filter((id) => byId[id]).length);

  async function load() {
    subject = null; error = '';
    try {
      const s = await loadSubject(route.params.subject);
      const ids = s.chapters.flatMap((c) => c.lessons.flatMap((l) => l.concepts));
      const loaded = await Promise.allSettled(ids.map((id) => loadConcepts(s.id, [id])));
      const m: Record<string, Concept> = {};
      for (const r of loaded) if (r.status === 'fulfilled') for (const c of r.value) m[c.id] = c;
      byId = m;
      levels = await repo.levels(ids);
      await stars.load();
      subject = s;
      document.title = `Khái niệm · ${s.title} · Luyện Luật`;
      const target = route.params.concept;
      if (target) {
        open = [target];
        await tick();
        document.getElementById(`c-${target}`)?.scrollIntoView({ block: 'start' });
      }
    } catch (e) { error = (e as Error).message; }
  }
  $effect(() => { void route.params.subject; void route.params.concept; load(); });

  function toggle(id: string) { open = open.includes(id) ? open.filter((x) => x !== id) : [...open, id]; }
  const termOf = (id: string) => byId[id]?.term ?? id;
</script>

{#if error}
  <section class="card"><p class="muted">Không tải được môn: {error}</p><a class="btn ghost" href={hashFor('subjects')}>Về Môn học</a></section>
{:else if !subject}
  <p class="loading">Đang tải…</p>
{:else}
  <nav class="crumbs small muted" aria-label="Vị trí"><a href={hashFor('subjects')}>Môn học</a> › <a href={hashFor('subject', { subject: subject.id })}>{subject.title}</a> › Khái niệm</nav>
  <header class="page-head">
    <SubjectArt name={PAGE_ART.concepts} class="head-art" />
    <h1>Khái niệm · {subject.short}</h1>
    <p class="muted">{total} khái niệm. Bấm vào tên để xem định nghĩa nguyên văn, căn cứ và khái niệm dễ nhầm.</p>
  </header>

  <div class="concept-tools">
    <label class="search">
      <span class="sr-only">Tìm khái niệm</span>
      <input type="search" placeholder="Tìm khái niệm (gõ không dấu cũng được)" bind:value={query} autocomplete="off" />
    </label>
    <button type="button" class="filter" aria-pressed={onlyStarred} onclick={() => (onlyStarred = !onlyStarred)}>★ Đã đánh dấu ({starredCount})</button>
  </div>

  {#if !shown}
    <section class="card"><p class="muted">{onlyStarred && !starredCount ? 'Chưa đánh dấu khái niệm nào. Bấm ☆ cạnh tên để đánh dấu.' : 'Không có khái niệm khớp.'}</p></section>
  {/if}

  {#each groups as g (g.lessonId)}
    <p class="kicker">{g.title}</p>
    <ul class="concept-list">
      {#each g.concepts as c (c.id)}
        {@const lv = levels[c.id] ?? 0}
        {@const isOpen = open.includes(c.id)}
        <li class="concept-entry" class:open={isOpen} id="c-{c.id}">
          <div class="entry-head">
            <button type="button" class="entry-toggle" aria-expanded={isOpen} aria-controls="body-{c.id}" onclick={() => toggle(c.id)}>
              <span class="cell lv{lv}" title="Bậc {lv} · {LEVEL_NAMES[lv]}" aria-hidden="true"></span>
              <span class="entry-term">{c.term}</span>
              <span class="sr-only">, bậc {lv} {LEVEL_NAMES[lv]}</span>
              <span class="chev" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
            </button>
            <button type="button" class="star" aria-pressed={stars.has(c.id)} aria-label="Đánh dấu {c.term}" title={stars.has(c.id) ? 'Bỏ đánh dấu' : 'Đánh dấu'} onclick={() => stars.toggle(c.id)}>{stars.has(c.id) ? '★' : '☆'}</button>
          </div>
          {#if isOpen}
            <div class="entry-body" id="body-{c.id}">
              <blockquote class="quote">{c.definition}</blockquote>
              <p>{c.plain}</p>
              <p class="muted"><b>Ví dụ:</b> {c.example}</p>
              {#if c.note}<p class="note small"><b>Cập nhật luật:</b> {c.note}</p>{/if}
              {#if c.confusables.length}
                <p class="small">Dễ nhầm với:
                  {#each c.confusables as id, k (id)}{#if k}{', '}{/if}{#if byId[id]}<a href={hashFor('concepts', { subject: subject.id, concept: id })}>{termOf(id)}</a>{:else}{termOf(id)}{/if}{/each}
                </p>
              {/if}
              <p class="source muted small">Nguồn: {c.source.cite}{#if c.source.url}{' · '}<a href={c.source.url} target="_blank" rel="noopener">Xem văn bản</a>{/if}{' · '}đối chiếu {c.checked}</p>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/each}
{/if}
