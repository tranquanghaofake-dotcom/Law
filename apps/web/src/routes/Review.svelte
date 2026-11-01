<script lang="ts">
  import type { Concept, Level } from '$lib/content/types';
  import { loadIndex, loadSubject, loadConcepts } from '$lib/content/loader';
  import { buildReviewSession, type Step } from '$lib/engine/session';
  import { repo } from '$lib/store/progress-repo';
  import SessionView from '$lib/ui/SessionView.svelte';
  import { hashFor, route } from '$lib/router.svelte';
  const subjectId = route.params.subject as string | undefined;

  let data = $state<{ steps: Step[]; concepts: Concept[]; levels: Record<string, Level> } | null>(null);
  let empty = $state(false);
  let error = $state('');

  async function load() {
    try {
      document.title = 'Ôn hôm nay · Luyện Luật';
      const due = await repo.due(new Date(), subjectId);
      if (!due.length) { empty = true; return; }
      const index = await loadIndex();
      const bySubject = new Map<string, string[]>();
      for (const p of due) bySubject.set(p.subject, [...(bySubject.get(p.subject) ?? []), p.conceptId]);
      const concepts: Concept[] = [];
      for (const [sid, ids] of bySubject) {
        if (!index.subjects.some((s) => s.id === sid)) continue;
        await loadSubject(sid); // kiểm tra môn còn tồn tại
        // khái niệm đã bị xoá khỏi nội dung (404) thì bỏ qua, không làm hỏng cả phiên ôn
        const loaded = await Promise.allSettled(ids.map((id) => loadConcepts(sid, [id])));
        for (const r of loaded) if (r.status === 'fulfilled') concepts.push(...r.value);
      }
      if (!concepts.length) { empty = true; return; }
      const levels = Object.fromEntries(due.map((p) => [p.conceptId, p.level])) as Record<string, Level>;
      data = { steps: buildReviewSession(concepts, levels, Math.random), concepts, levels };
    } catch (e) { error = (e as Error).message; }
  }
  load();
</script>

{#if error}
  <section class="card"><p class="muted">Không tải được dữ liệu: {error}</p><a class="btn ghost" href="#/">Về trang chủ</a></section>
{:else if empty}
  <section class="card"><h1>Ôn hôm nay</h1><p>Chưa có gì cần ôn{subjectId ? ' trong môn này' : ''}. Học mới một đợt rồi quay lại nhé.</p>{#if subjectId}<a class="btn primary" href={hashFor('subject', { subject: subjectId })}>Về môn</a>{:else}<a class="btn primary" href="#/">Về Hôm nay</a>{/if}</section>
{:else if !data}
  <p class="loading">Đang tải…</p>
{:else}
  <SessionView steps={data.steps} concepts={data.concepts} levels={data.levels} />
{/if}
