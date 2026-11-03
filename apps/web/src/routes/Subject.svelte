<script lang="ts">
  // Trang môn: tổng quan, chú giải, lưới bậc theo đợt, local nav chương (spec §4.2).
  import type { Level, Subject } from '$lib/content/types';
  import { loadConcepts, loadSubject } from '$lib/content/loader';
  import { repo } from '$lib/store/progress-repo';
  import { hashFor, route } from '$lib/router.svelte';
  import { currentLesson, lessonStates } from '$lib/ui/lessonState';
  import { chapterCounts, subjectSummary } from '$lib/ui/subjectSummary';
  import { setRail } from '$lib/ui/rail.svelte';
  import MasteryGrid from '$lib/ui/MasteryGrid.svelte';
  import LevelLegend from '$lib/ui/LevelLegend.svelte';
  import SubjectRail from '$lib/ui/SubjectRail.svelte';
  import SubjectArt from '$lib/art/SubjectArt.svelte';
  import { artFor, emblemFor, hasOwnArt } from '$lib/art/registry';
  import Emblem from '$lib/art/Emblem.svelte';
  import BookCover from '$lib/art/BookCover.svelte';
  import { shelfOf } from '$lib/ui/shelves';
  import { coverTitle } from '$lib/ui/bookCover';
  /** Nhãn ngắn cho mục lục chương: "Chương 7. Quốc hội…" → "Chương 7"; "Nâng cao: …" → "Nâng cao". */
  const shortTitle = (t: string) => t.split(/[.:]/)[0].trim();

  let subject = $state<Subject | null>(null);
  let levels = $state<Record<string, Level>>({});
  let terms = $state<Record<string, string>>({});
  let due = $state(0);
  let difficult = $state<{ id: string; term: string }[]>([]);
  let error = $state('');

  const summary = $derived(subject ? subjectSummary(subject, levels) : null);
  const counts = $derived(subject ? chapterCounts(subject, levels) : {});
  const states = $derived(subject ? lessonStates(subject, levels) : {});
  const next = $derived(subject ? currentLesson(subject, levels) : null);

  async function load() {
    subject = null; error = '';
    try {
      const s = await loadSubject(route.params.subject);
      const ids = s.chapters.flatMap((c) => c.lessons.flatMap((l) => l.concepts));
      levels = await repo.levels(ids);
      const known = new Set(ids);
      due = (await repo.due(new Date(), s.id)).filter((p) => known.has(p.conceptId)).length;
      const hard = (await repo.difficult()).filter((p) => p.subject === s.id && known.has(p.conceptId)).slice(0, 5).map((p) => p.conceptId);
      const loaded = await Promise.allSettled(ids.map((id) => loadConcepts(s.id, [id])));
      const t: Record<string, string> = {};
      for (const r of loaded) if (r.status === 'fulfilled') for (const c of r.value) t[c.id] = c.term;
      terms = t;
      difficult = hard.map((id) => ({ id, term: t[id] ?? id }));
      subject = s;
      document.title = `${s.title} · Luyện Luật`;
    } catch (e) { error = (e as Error).message; }
  }
  $effect(() => { void route.params.subject; load(); });
  $effect(() => {
    if (!subject || !summary) return;
    return setRail(SubjectRail, { subjectId: subject.id, due, difficult });
  });
</script>

{#if error}
  <section class="card"><p class="muted">Không tải được môn: {error}</p><a class="btn ghost" href={hashFor('subjects')}>Về Môn học</a></section>
{:else if !subject || !summary}
  <p class="loading">Đang tải…</p>
{:else}
  <nav class="crumbs small muted" aria-label="Vị trí"><a href={hashFor('subjects')}>Môn học</a> › {subject.title}</nav>
  <header class="subject-head">
    {#if hasOwnArt(subject.id)}
      <SubjectArt name={artFor(subject.id)} class="head-art" />
    {:else}
      <BookCover class="head-cover" title={coverTitle(subject.title)} color={shelfOf(subject.id).color} percent={summary.percent} state={summary.mastered === summary.total && summary.total > 0 ? 'done' : summary.mastered > 0 ? 'learning' : 'new'} w={132} />
    {/if}
    <h1>{subject.title}</h1>
    <p class="muted">Thuần thục <b>{summary.percent}%</b> · {summary.mastered}/{summary.total} khái niệm</p>
    <div class="bar" aria-hidden="true"><span style="width:{summary.percent}%"></span></div>
    <div class="row">
      {#if next}<span class="next-cta"><a class="btn primary" href={hashFor('lesson', { subject: subject.id, lesson: next.id })}>Học tiếp →</a><span class="next-hint small muted">{next.title}</span></span>{/if}
      {#if due}<a class="btn ghost" href={hashFor('review', { subject: subject.id })}>Ôn {due} khái niệm của môn</a>{/if}
      <a class="more" href={hashFor('concepts', { subject: subject.id })}>Danh mục khái niệm</a>
    </div>
  </header>
  {#if subject.chapters.length > 1}
    <nav class="local-nav small" aria-label="Chương trong môn">
      {#each subject.chapters as ch (ch.id)}<a href="#chapter-{ch.id}" title={ch.title} onclick={(e) => { e.preventDefault(); document.getElementById(`chapter-${ch.id}`)?.scrollIntoView({ behavior: 'smooth' }); }}><Emblem name={emblemFor(subject.id, ch.id)} size={26} /><span>{shortTitle(ch.title)}</span><small class="cnt">{counts[ch.id]?.mastered ?? 0}/{counts[ch.id]?.total ?? 0}</small></a>{/each}
    </nav>
  {/if}
  <LevelLegend />
  <MasteryGrid {subject} {levels} {terms} {states} />
{/if}
