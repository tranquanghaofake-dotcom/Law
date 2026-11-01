<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  import type { Concept, Level } from '$lib/content/types';
  import type { StreakEvent } from '$lib/game/streak';
  import type { RankInfo } from '$lib/game/rank';
  import type { Step } from '$lib/engine/session';
  import { hashFor } from '$lib/router.svelte';
  import { answerText, promptText } from './cards/answer';
  let { summary, concepts, streak, streakEvent, rankBefore, rankAfter, dueTomorrow, onhome, onagain, onnext, mistakes = [] }: {
    summary: { correct: number; total: number; xp: number; levelUps: { conceptId: string; to: Level }[] };
    concepts: Concept[]; streak: number; streakEvent: StreakEvent; rankBefore: RankInfo; rankAfter: RankInfo; dueTomorrow: number;
    onhome: () => void; onagain?: () => void; onnext?: () => void; mistakes?: Step[];
  } = $props();
  const term = (id: string) => concepts.find((c) => c.id === id)?.term ?? id;
  const conceptOf = (id: string) => concepts.find((c) => c.id === id);
  const explainOf = (s: Step) => ('explain' in s.item ? s.item.explain : '');
  const ranked = $derived(rankAfter.rank !== rankBefore.rank || rankAfter.tier !== rankBefore.tier);
  const streakMsg = $derived(({ started: 'Bắt đầu chuỗi ngày.', extended: 'Chuỗi +1 ngày.', 'same-day': 'Hôm nay đã tính chuỗi.', froze: 'Bùa giữ chuỗi đã cứu bạn.', reset: 'Chuỗi bắt đầu lại từ 1.' } as Record<StreakEvent, string>)[streakEvent]);
</script>

<section class="card session-end" aria-label="Kết thúc phiên">
  <p class="kicker">Xong phiên</p>
  <p class="score"><b>{summary.correct}</b><small>/{summary.total} đúng</small></p>
  <p class="xp">+{summary.xp} XP {#if ranked}<span class="chip">Thăng: {rankAfter.rank} {rankAfter.tier}</span>{/if}</p>
  <p class="streak"><Glyph name="flame" /> Chuỗi {streak} ngày · {streakMsg}</p>
  {#if summary.levelUps.length}
    <h2>Lên bậc</h2>
    <ul class="levelups">
      {#each summary.levelUps as u (u.conceptId)}
        <li><span class="seal-stamp" aria-hidden="true">{u.to}</span> {term(u.conceptId)} <span class="muted">→ bậc {u.to}</span></li>
      {/each}
    </ul>
  {/if}
  <p class="muted">Hẹn ôn ngày mai: {dueTomorrow} khái niệm.</p>
  <div class="row">
    <button class="btn primary" type="button" onclick={onhome}>Về Hôm nay</button>
    {#if onnext}<button class="btn ghost" type="button" onclick={onnext}>Học đợt tiếp →</button>
    {:else if onagain}<button class="btn ghost" type="button" onclick={onagain}>Học lại đợt này</button>{/if}
  </div>
</section>

{#if mistakes.length}
  <section class="mistakes" aria-label="Xem lại câu sai">
    <h2>Xem lại câu sai ({mistakes.length})</h2>
    {#each mistakes as m, k (k)}
      {@const c = conceptOf(m.conceptId)}
      <div class="card item">
        <p class="kicker">{#if c}<a href={hashFor('concepts', { subject: c.subject, concept: c.id })}>{c.term}</a>{:else}{m.conceptId}{/if}</p>
        <b>{promptText(m.item)}</b>
        <p class="ans">Đáp án: {answerText(m.item)}</p>
        {#if explainOf(m)}<p>{explainOf(m)}</p>{/if}
      </div>
    {/each}
  </section>
{/if}
