<script lang="ts">
  // Trang Hôm nay = state router: một thẻ hành động, môn đang học, một thẻ kiểm tra nhanh (spec §3).
  import type { ContentIndex, Level, Subject } from '$lib/content/types';
  import { loadIndex, loadSubject, loadConcepts } from '$lib/content/loader';
  import { repo } from '$lib/store/progress-repo';
  import { stats } from '$lib/store/stats';
  import { LuyenLuatDB } from '$lib/store/db';
  import { gradeFor } from '$lib/game/rank';
  import { localDay } from '$lib/game/streak';
  import { hashFor } from '$lib/router.svelte';
  import { GROUPS, sortGroups } from '$lib/ui/groups';
  import { pickHeroState, type HeroState } from '$lib/ui/today';
  import { setRail } from '$lib/ui/rail.svelte';
  import HeroCard from '$lib/ui/HeroCard.svelte';
  import HomeRail from '$lib/ui/HomeRail.svelte';

  type Row = { subject: Subject; grade: string | null; mastered: number; total: number };
  let index = $state<ContentIndex | null>(null);
  let hero = $state<HeroState | null>(null);
  let rows = $state<Row[]>([]);
  let quick = $state<{ set: ContentIndex['sets'][number]; best: number | null } | null>(null);
  let week = $state<boolean[]>(Array(7).fill(false));
  let dueTomorrow = $state(0);
  let error = $state('');

  async function load() {
    try {
      document.title = 'Hôm nay · Luyện Luật';
      const idx = await loadIndex();
      index = idx;
      await stats.migrateV1Best(idx);
      const subjects = await Promise.all(idx.subjects.map((s) => loadSubject(s.id)));
      const all = await repo.all();
      const levels = Object.fromEntries(all.map((p) => [p.conceptId, p.level])) as Record<string, Level>;

      const due = await repo.due(new Date());
      const terms: Record<string, string> = {};
      if (due.length) {
        const bySubject = new Map<string, string[]>();
        for (const p of due.slice(0, 3)) bySubject.set(p.subject, [...(bySubject.get(p.subject) ?? []), p.conceptId]);
        for (const [sid, ids] of bySubject) { try { for (const c of await loadConcepts(sid, ids)) terms[c.id] = c.term; } catch { /* môn đã bỏ */ } }
      }
      hero = pickHeroState({ due: due.map((p) => ({ conceptId: p.conceptId, term: terms[p.conceptId] })), subjects, levels });

      const started = new Set(all.filter((p) => p.level > 0).map((p) => p.subject));
      rows = subjects
        .filter((s) => started.size === 0 || started.has(s.id))
        .map((s) => { const ids = s.chapters.flatMap((c) => c.lessons.flatMap((l) => l.concepts)); const mastered = ids.filter((id) => (levels[id] ?? 0) >= 5).length; return { subject: s, grade: ids.length ? gradeFor(mastered / ids.length) : null, mastered, total: ids.length }; });

      // một thẻ kiểm tra nhanh: đề chưa đạt điểm tối đa gần nhất, không thì đề đầu tiên
      const sets = sortGroups([...new Map(idx.sets.map((s) => [s.group, idx.sets.filter((x) => x.group === s.group)])).entries()]).flatMap(([, v]) => v);
      let pick = sets[0] ?? null; let pickBest: number | null = null;
      for (const set of sets) { const b = await stats.best(set.id); if (b == null || b < set.count) { pick = set; pickBest = b; break; } }
      quick = pick ? { set: pick, best: pickBest } : null;

      // rail: 7 ngày có phiên, hẹn ôn ngày mai
      try {
        const db = new LuyenLuatDB();
        const since = Date.now() - 7 * 86400_000;
        const days = new Set((await db.reviews.where('at').above(since).toArray()).map((r) => localDay(new Date(r.at))));
        week = Array.from({ length: 7 }, (_, i) => days.has(localDay(new Date(Date.now() - (6 - i) * 86400_000))));
      } catch { /* chế độ riêng tư */ }
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(23, 59, 59, 999);
      dueTomorrow = (await repo.due(tomorrow)).length;
    } catch (e) { error = (e as Error).message; }
  }
  load();
  $effect(() => setRail(HomeRail, { week, dueTomorrow }));
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
          <span class="title"><b>{r.subject.title}</b>{#if r.grade}<span class="chip">{r.grade}</span>{/if}</span>
          <span class="bar" aria-hidden="true"><span style="width:{r.total ? (r.mastered / r.total) * 100 : 0}%"></span></span>
          <span class="muted small">{r.mastered}/{r.total} thuần thục</span>
          <span class="arrow" aria-hidden="true">→</span>
        </a></li>
      {/each}
    </ul>
  {/if}

  {#if quick}
    <h2 class="section-title"><b>Kiểm tra nhanh</b> <a class="more" href={hashFor('quizzes')}>Tất cả đề →</a></h2>
    <div class="sets one">
      <a class="set" href={hashFor('quiz', { id: quick.set.id })}>
        <div><span class="chip">{GROUPS[quick.set.group] ?? quick.set.group}</span><h3>{quick.set.title}</h3></div>
        <span class="meta">{#if quick.best != null}<span class="best">{quick.best}/{quick.set.count}</span>điểm cao nhất{:else}{quick.set.count} câu{/if}</span>
        <p>{quick.set.subtitle}</p>
      </a>
    </div>
  {/if}
{/if}
