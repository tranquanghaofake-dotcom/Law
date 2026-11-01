<script lang="ts">
  // Trang môn (tạm: lộ trình đợt; Task 6 thay bằng lưới bậc theo spec §4.2).
  import type { Level, Subject } from '$lib/content/types';
  import { loadSubject } from '$lib/content/loader';
  import { repo } from '$lib/store/progress-repo';
  import { route } from '$lib/router.svelte';
  import { gradeFor } from '$lib/game/rank';
  import SubjectPath from '$lib/ui/SubjectPath.svelte';

  let subject = $state<Subject | null>(null);
  let levels = $state<Record<string, Level>>({});
  let error = $state('');
  const grade = $derived.by(() => {
    if (!subject) return null;
    const ids = subject.chapters.flatMap((c) => c.lessons.flatMap((l) => l.concepts));
    return ids.length ? gradeFor(ids.filter((id) => (levels[id] ?? 0) >= 5).length / ids.length) : null;
  });

  async function load() {
    subject = null; error = '';
    try {
      const s = await loadSubject(route.params.subject);
      levels = await repo.levels(s.chapters.flatMap((c) => c.lessons.flatMap((l) => l.concepts)));
      subject = s;
      document.title = `${s.title} · Luyện Luật`;
    } catch (e) { error = (e as Error).message; }
  }
  $effect(() => { void route.params.subject; load(); });
</script>

{#if error}
  <section class="card"><p class="muted">Không tải được môn: {error}</p><a class="btn ghost" href="#/mon">Về Môn học</a></section>
{:else if !subject}
  <p class="loading">Đang tải…</p>
{:else}
  <SubjectPath {subject} {levels} {grade} />
{/if}
