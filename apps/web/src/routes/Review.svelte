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
  import { nextReview } from '$lib/ui/dueByDay';
  import Glyph from '$lib/art/Glyph.svelte';
  import { loadWeak, type WeakItem } from '$lib/ui/weak';
  const subjectId = route.params.subject as string | undefined;

  let data = $state<{ steps: Step[]; concepts: Concept[]; levels: Record<string, Level>; upDays: Record<string, string> } | null>(null);
  let empty = $state(false);
  // Trạng thái rỗng: lần ôn tới (null = chưa có hẹn) và đã học khái niệm nào chưa
  let upcoming = $state<{ learned: number; next: ReturnType<typeof nextReview>; stale: number }>({ learned: 0, next: null, stale: 0 });
  // stale: số khái niệm đến hạn mà nội dung không còn (đổi id/bị xoá) — không được nói "hết bài"
  async function loadUpcoming(stale = 0) {
    const all = await repo.all(subjectId);
    upcoming = { learned: all.length, next: nextReview(all.map((c) => c.card.due)), stale };
    empty = true;
    loadWeak().then((w) => { weak = w.items[0] ?? null; }).catch(() => { /* không có gợi ý */ });
  }
  let error = $state('');
  /** Bài hay sai nhất (90 ngày): gợi ý luyện thêm khi hết bài đến hạn, để trang Ôn không là ngõ cụt. */
  let weak = $state<WeakItem | null>(null);

  async function load() {
    try {
      document.title = `Ôn hôm nay · Luyện Luật`;
      const due = await repo.due(new Date(), subjectId);
      if (!due.length) { await loadUpcoming(); return; }
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
      if (!concepts.length) { await loadUpcoming(due.length); return; }
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
  <section class="card review-empty">
    <h1>Ôn hôm nay</h1>
    {#if !upcoming.learned}
      <p>Bạn chưa học khái niệm nào{subjectId ? ' trong môn này' : ''}. Học một đợt (khoảng 5 phút), khái niệm sẽ được hẹn ôn đúng lúc sắp quên.</p>
      <a class="btn primary" href={subjectId ? hashFor('subject', { subject: subjectId }) : hashFor('home')}>Học đợt đầu tiên →</a>
    {:else}
      {#if upcoming.stale}
        <p class="re-stale"><Glyph name="warn" size={18} /> Có {upcoming.stale} khái niệm đến hạn nhưng không còn trong nội dung hiện tại (có thể đã được sửa hoặc gộp). Tiến độ của chúng vẫn được giữ.</p>
      {:else if upcoming.next?.inDays === 0}
        <p class="re-ok"><Glyph name="check" size={20} /> Chưa tới giờ ôn — vừa học xong nên khái niệm được hẹn ôn lại sau ít phút.</p>
        <p class="re-next">Quay lại lúc <b>{upcoming.next.time} hôm nay</b> · {upcoming.next.count} khái niệm.</p>
      {:else}
        <p class="re-ok"><Glyph name="check" size={20} /> Hôm nay không còn khái niệm nào cần ôn{subjectId ? ' trong môn này' : ''}.</p>
        {#if upcoming.next}<p class="re-next">Lần ôn tới: <b>{upcoming.next.inDays === 1 ? 'ngày mai' : `${upcoming.next.inDays} ngày nữa`}</b> ({upcoming.next.date}) · {upcoming.next.count} khái niệm.</p>{/if}
      {/if}
      {#if weak && !upcoming.stale}
        <p class="re-weak">Muốn luyện thêm? Bài bạn hay sai nhất: <b>{weak.lessonTitle}</b> ({weak.short}, đúng {weak.correct}/{weak.tries}). <a href={weak.href}>Ôn bài này →</a></p>
      {/if}
      <div class="row">
        <a class="btn primary" href={subjectId ? hashFor('subject', { subject: subjectId }) : hashFor('home')}>Học đợt mới →</a>
        <a class="btn ghost" href={hashFor('quizzes')}>Luyện đề</a>
      </div>
    {/if}
  </section>
{:else if !data}
  <Loading />
{:else}
  <SessionView steps={data.steps} concepts={data.concepts} levels={data.levels} upDays={data.upDays} title="Ôn hôm nay" />
{/if}
