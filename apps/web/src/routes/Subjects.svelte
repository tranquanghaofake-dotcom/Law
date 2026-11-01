<script lang="ts">
  // Danh sách môn có nội dung (spec §4.1).
  import type { Level, Subject } from '$lib/content/types';
  import { loadIndex, loadSubject } from '$lib/content/loader';
  import { repo } from '$lib/store/progress-repo';
  import { hashFor } from '$lib/router.svelte';
  import { subjectSummary, type SubjectSummary } from '$lib/ui/subjectSummary';
  import SubjectArt from '$lib/art/SubjectArt.svelte';
  import { artFor, PAGE_ART } from '$lib/art/registry';

  let items = $state<{ subject: Subject; s: SubjectSummary }[] | null>(null);
  let error = $state('');
  document.title = 'Môn học · Luyện Luật';
  (async () => {
    try {
      const index = await loadIndex();
      const subs = await Promise.all(index.subjects.filter((s) => (index.conceptCount[s.id] ?? 0) > 0).map((s) => loadSubject(s.id)));
      const levels = Object.fromEntries((await repo.all()).map((p) => [p.conceptId, p.level])) as Record<string, Level>;
      items = subs.map((subject) => ({ subject, s: subjectSummary(subject, levels) }));
    } catch (e) { error = (e as Error).message; }
  })();
</script>

<header class="page-head">
  <SubjectArt name={PAGE_ART.subjects} class="head-art" />
  <h1>Môn học</h1>
  <p class="muted">Mỗi môn chia thành chương → đợt 4–5 khái niệm. Học theo thứ tự đợt; ôn khi lịch gọi.</p>
</header>
{#if error}
  <section class="card"><p class="muted">Không tải được dữ liệu: {error}</p></section>
{:else if !items}
  <p class="loading">Đang tải…</p>
{:else}
  <div class="subject-cards">
    {#each items as { subject, s } (subject.id)}
      <a class="card frame subject-card" href={hashFor('subject', { subject: subject.id })}>
        <SubjectArt name={artFor(subject.id)} class="card-art" />
        <span class="title"><b>{subject.title}</b>{#if s.grade}<span class="chip">{s.grade}</span>{/if}</span>
        <span class="muted small">{s.chapters} chương · {s.lessons} đợt · {s.total} khái niệm</span>
        <span class="bar" aria-hidden="true"><span style="width:{s.percent}%"></span></span>
        <span class="small">Thuần thục {s.percent}% · Vào môn →</span>
      </a>
    {/each}
  </div>
{/if}
