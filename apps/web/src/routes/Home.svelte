<script lang="ts">
  // Trang Hôm nay = state router: một thẻ hành động, môn đang học, một thẻ kiểm tra nhanh (spec §3).
  import type { ContentIndex, Level, Subject } from '$lib/content/types';
  import { loadIndex, loadSubject, loadConcepts } from '$lib/content/loader';
  import { repo } from '$lib/store/progress-repo';
  import { stats } from '$lib/store/stats';
  import { subjectSummary } from '$lib/ui/subjectSummary';
  import { weekFlags, weekStart } from '$lib/ui/week';
  import { hashFor } from '$lib/router.svelte';
  import { GROUPS, pickQuickQuiz } from '$lib/ui/groups';
  import { knownConcepts, pickHeroState, type HeroState } from '$lib/ui/today';
  import { setRail } from '$lib/ui/rail.svelte';
  import HeroCard from '$lib/ui/HeroCard.svelte';
  import HomeRail from '$lib/ui/HomeRail.svelte';
  import Vignette from '$lib/art/Vignette.svelte';
  import { vignetteFor, artFor } from '$lib/art/registry';
  import SubjectArt from '$lib/art/SubjectArt.svelte';

  type Row = { subject: Subject; grade: string | null; mastered: number; total: number };
  let index = $state<ContentIndex | null>(null);
  let hero = $state<HeroState | null>(null);
  let rows = $state<Row[]>([]);
  let quick = $state<{ set: ContentIndex['sets'][number]; best: number | null } | null>(null);
  let week = $state<boolean[]>(Array(7).fill(false));
  let dueTomorrow = $state(0);
  let hard = $state<{ id: string; subject: string; term: string }[]>([]);
  let error = $state('');

  async function load() {
    try {
      document.title = 'Hôm nay · Luyện Luật';
      const idx = await loadIndex();
      index = idx;
      await stats.ensureV1Migrated(idx);
      const subjects = await Promise.all(idx.subjects.map((s) => loadSubject(s.id)));
      const all = await repo.all();
      const levels = Object.fromEntries(all.map((p) => [p.conceptId, p.level])) as Record<string, Level>;

      const known = knownConcepts(subjects);
      const due = (await repo.due(new Date())).filter((p) => known.has(p.conceptId)); // bỏ tiến độ của khái niệm đã xoá
      const terms: Record<string, string> = {};
      if (due.length) {
        const bySubject = new Map<string, string[]>();
        for (const p of due.slice(0, 3)) bySubject.set(p.subject, [...(bySubject.get(p.subject) ?? []), p.conceptId]);
        for (const [sid, ids] of bySubject) { try { for (const c of await loadConcepts(sid, ids)) terms[c.id] = c.term; } catch { /* file lỗi: giữ slug */ } }
      }
      hero = pickHeroState({ due: due.map((p) => ({ conceptId: p.conceptId, term: terms[p.conceptId] })), subjects, levels });

      const started = new Set(all.filter((p) => p.level > 0 && known.has(p.conceptId)).map((p) => p.subject));
      rows = subjects
        .filter((s) => started.size === 0 || started.has(s.id))
        .map((s) => { const x = subjectSummary(s, levels); return { subject: s, grade: x.grade, mastered: x.mastered, total: x.total }; });

      // khái niệm khó: sai ≥ 3 lần liên tiếp, tối đa 5 (Memrise "Difficult words")
      const hardP = (await repo.difficult()).filter((p) => known.has(p.conceptId)).slice(0, 5);
      const hardTerms: Record<string, string> = {};
      const hardBy = new Map<string, string[]>();
      for (const p of hardP) hardBy.set(p.subject, [...(hardBy.get(p.subject) ?? []), p.conceptId]);
      for (const [sid, ids] of hardBy) { try { for (const c of await loadConcepts(sid, ids)) hardTerms[c.id] = c.term; } catch { /* file lỗi: giữ slug */ } }
      hard = hardP.map((p) => ({ id: p.conceptId, subject: p.subject, term: hardTerms[p.conceptId] ?? p.conceptId }));

      // một thẻ kiểm tra nhanh: đề chưa đạt điểm tối đa đầu tiên, không thì đề đầu (spec §3.3)
      const best: Record<string, number | null> = {};
      for (const set of idx.sets) best[set.id] = await stats.best(set.id);
      quick = pickQuickQuiz(idx.sets, best);

      // rail: 7 ngày có phiên, hẹn ôn ngày mai
      week = weekFlags(await repo.reviewDays(weekStart()));
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(23, 59, 59, 999);
      dueTomorrow = (await repo.due(tomorrow)).length;
    } catch (e) { error = (e as Error).message; }
  }
  load();
  $effect(() => { if (hero) return setRail(HomeRail, { week, dueTomorrow }); });
</script>

{#if error}
  <section class="card"><p class="muted">Không tải được dữ liệu ({error}). Nếu mở file trực tiếp, hãy chạy <code>npm run dev</code> ở gốc repo.</p></section>
{:else if !index || !hero}
  <p class="loading">Đang tải…</p>
{:else}
  <HeroCard state={hero} />

  {#if rows.length}
    <h2 class="section-title"><b>Môn đang học</b></h2>
    <ul class="subject-rows">
      {#each rows as r (r.subject.id)}
        <li><a class="subject-row" href={hashFor('subject', { subject: r.subject.id })}>
          <SubjectArt name={artFor(r.subject.id)} class="row-art" />
          <span class="title"><b>{r.subject.title}</b></span>
          <span class="bar" aria-hidden="true"><span style="width:{r.total ? (r.mastered / r.total) * 100 : 0}%"></span></span>
          <span class="muted small">{r.mastered}/{r.total} thuần thục</span>
          <span class="arrow" aria-hidden="true">→</span>
        </a></li>
      {/each}
    </ul>
  {/if}

  {#if hard.length}
    <h2 class="section-title"><b>Khái niệm khó</b> <span class="small">sai ≥ 3 lần liền</span></h2>
    <ul class="hard-list">
      {#each hard as h (h.id)}<li><a href={hashFor('concepts', { subject: h.subject, concept: h.id })}>{h.term}</a></li>{/each}
    </ul>
  {/if}

  {#if quick}
    <h2 class="section-title"><b>Kiểm tra nhanh</b> <a class="more" href={hashFor('quizzes')}>Tất cả đề →</a></h2>
    <div class="sets one">
      <a class="set" href={hashFor('quiz', { id: quick.set.id })}>
        <Vignette name={vignetteFor(quick.set)} class="set-art" />
        <div><span class="chip">{GROUPS[quick.set.group] ?? quick.set.group}</span><h3>{quick.set.title}</h3></div>
        <span class="meta">{#if quick.best != null}<span class="best">{quick.best}/{quick.set.count}</span>điểm cao nhất{:else}{quick.set.count} câu{/if}</span>
        <p>{quick.set.subtitle}</p>
      </a>
    </div>
  {/if}
{/if}
