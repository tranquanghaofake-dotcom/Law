<script lang="ts">
  import Loading from '$lib/ui/Loading.svelte';
  import type { Concept, Level } from '$lib/content/types';
  import { loadIndex, loadSubject, loadConcepts, loadConceptPool, loadTerms } from '$lib/content/loader';
  import { buildReviewSession, type Step } from '$lib/engine/session';
  import { reviewPoolIds } from '$lib/engine/pool';
  import { repo } from '$lib/store/progress-repo';
  import { retrievability } from '$lib/engine/fsrs';
  import SessionView from '$lib/ui/SessionView.svelte';
  import { hashFor, route } from '$lib/router.svelte';
  const subjectId = route.params.subject as string | undefined;

  let data = $state<{ steps: Step[]; concepts: Concept[]; levels: Record<string, Level>; upDays: Record<string, string> } | null>(null);
  let empty = $state(false);
  let error = $state('');

  async function load() {
    try {
      document.title = `Ôn hôm nay · Luyện Luật`;
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
      // sắp quên nhất ôn trước khi đến hạn nhiều hơn số bước một phiên
      const now = new Date();
      const urgency = Object.fromEntries(due.map((p) => [p.conceptId, retrievability(p.card, now)]));
      const upDays = Object.fromEntries(due.flatMap((p) => (p.upDay ? [[p.conceptId, p.upDay]] : []))) as Record<string, string>;
      // phương án nhiễu: khái niệm dễ nhầm (≤ 8) + bảng tên của các môn đang ôn
      const extra = reviewPoolIds(concepts);
      const subjectsInUse = [...new Set(concepts.map((c) => c.subject))];
      const [pools, termList] = await Promise.all([
        Promise.all(subjectsInUse.map((sid) => loadConceptPool(sid, extra.filter((x) => x.subject === sid).map((x) => x.id)))),
        Promise.all(subjectsInUse.map((sid) => loadTerms(sid).catch(() => ({})))),
      ]);
      const ctx = { pool: pools.flat(), terms: Object.fromEntries(subjectsInUse.map((sid, k) => [sid, termList[k]])) };
      data = { steps: buildReviewSession(concepts, levels, Math.random, undefined, ctx, urgency), concepts, levels, upDays };
    } catch (e) { error = (e as Error).message; }
  }
  load();
</script>

{#if error}
  <section class="card"><p class="muted">Không tải được dữ liệu: {error}</p><a class="btn ghost" href="#/">Về Hôm nay</a></section>
{:else if empty}
  <section class="card"><h1>Ôn hôm nay</h1><p>Chưa có gì cần ôn{subjectId ? ' trong môn này' : ''}. Học mới một đợt rồi quay lại nhé.</p>{#if subjectId}<a class="btn primary" href={hashFor('subject', { subject: subjectId })}>Về môn</a>{:else}<a class="btn primary" href="#/">Về Hôm nay</a>{/if}</section>
{:else if !data}
  <Loading />
{:else}
  <SessionView steps={data.steps} concepts={data.concepts} levels={data.levels} upDays={data.upDays} title="Ôn hôm nay" />
{/if}
