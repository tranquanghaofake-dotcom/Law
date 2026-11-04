<script lang="ts">
  import Loading from '$lib/ui/Loading.svelte';
  import type { Concept, Level, Subject } from '$lib/content/types';
  import { loadConceptPool, loadConcepts, loadSubject, loadTerms } from '$lib/content/loader';
  import { buildLearnSession, type Step } from '$lib/engine/session';
  import { lessonPoolIds } from '$lib/engine/pool';
  import { repo } from '$lib/store/progress-repo';
  import { route } from '$lib/router.svelte';
  import SessionView from '$lib/ui/SessionView.svelte';
  import { getPref } from '$lib/ui/session/prefs';
  import { go } from '$lib/router.svelte';
  import { lessonsOf } from '$lib/ui/lessonState';

  type Loaded = { steps: Step[]; concepts: Concept[]; levels: Record<string, Level>; upDays: Record<string, string>; lessonId: string; title: string; next: string | null; subject: string };
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
      // khái niệm dễ nhầm/cùng chương (≤ 8) + bảng tên môn: làm phương án nhiễu, gộp tình huống Phân biệt
      const [levels, upDays, pool, terms] = await Promise.all([
        repo.levels(lesson.concepts),
        repo.upDays(lesson.concepts),
        loadConceptPool(subject.id, lessonPoolIds(subject, concepts)),
        loadTerms(subject.id).catch(() => ({})),
      ]);
      const steps = buildLearnSession(concepts, levels, Math.random, { pool, terms: { [subject.id]: terms } }, { pretest: getPref('pretest') ? 2 : 0 });
      const all = lessonsOf(subject); const i = all.findIndex((l) => l.id === lesson.id);
      data = { steps, concepts, levels, upDays, lessonId: `${subject.id}/${lesson.id}`, title: lesson.title, next: all[i + 1]?.id ?? null, subject: subject.id };
      document.title = `${lesson.title} · Luyện Luật`;
    } catch (e) { error = (e as Error).message; }
  }
  // Rời màn: route.params về {} trước khi màn huỷ, không tải /content/subjects/undefined.json.
  $effect(() => { void gen; if (route.name === 'lesson' && route.params.subject && route.params.lesson) load(); });
</script>

{#if error}
  <section class="card"><p class="muted">Không tải được dữ liệu: {error}</p><a class="btn ghost" href="#/">Về Hôm nay</a></section>
{:else if !data}
  <Loading />
{:else}
  {#key gen}
    <SessionView steps={data.steps} concepts={data.concepts} levels={data.levels} upDays={data.upDays} lessonId={data.lessonId} title={data.title} onagain={() => (gen += 1)} onnext={data.next ? () => go('lesson', { subject: data!.subject, lesson: data!.next! }) : undefined} />
  {/key}
{/if}
