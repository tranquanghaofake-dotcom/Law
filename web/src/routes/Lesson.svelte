<script lang="ts">
  import type { Concept, Level, Subject } from '$lib/content/types';
  import { loadConcepts, loadSubject } from '$lib/content/loader';
  import { buildLearnSession, type Step } from '$lib/engine/session';
  import { repo } from '$lib/store/progress-repo';
  import { route } from '$lib/router.svelte';
  import SessionView from '$lib/ui/SessionView.svelte';

  type Loaded = { steps: Step[]; concepts: Concept[]; levels: Record<string, Level>; lessonId: string; title: string };
  let data = $state<Loaded | null>(null);
  let error = $state('');
  let gen = $state(0);

  async function load() {
    data = null; error = '';
    try {
      const subject: Subject = await loadSubject(route.params.subject);
      const lesson = subject.chapters.flatMap((c) => c.lessons).find((l) => l.id === route.params.lesson);
      if (!lesson) throw new Error('Không tìm thấy đợt học.');
      const concepts = await loadConcepts(subject.id, lesson.concepts);
      const levels = await repo.levels(lesson.concepts);
      const steps = buildLearnSession(concepts, levels, Math.random);
      data = { steps, concepts, levels, lessonId: `${subject.id}/${lesson.id}`, title: lesson.title };
      document.title = `${lesson.title} · Luyện Luật`;
    } catch (e) { error = (e as Error).message; }
  }
  $effect(() => { void route.params.subject; void route.params.lesson; void gen; load(); });
</script>

{#if error}
  <section class="card"><p class="muted">Không tải được dữ liệu: {error}</p><a class="btn ghost" href="#/">Về trang chủ</a></section>
{:else if !data}
  <p class="loading">Đang tải…</p>
{:else}
  {#key gen}
    <SessionView steps={data.steps} concepts={data.concepts} levels={data.levels} lessonId={data.lessonId} onagain={() => (gen += 1)} />
  {/key}
{/if}
