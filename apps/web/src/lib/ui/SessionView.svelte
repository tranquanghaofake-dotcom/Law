<script lang="ts">
  import type { Concept, Level } from '$lib/content/types';
  import { clozeModeFor, type Step } from '$lib/engine/session';
  import { answer as runAnswer, createRunner, next as runNext, summary, type RunnerState } from '$lib/engine/runner';
  import { repo } from '$lib/store/progress-repo';
  import { stats } from '$lib/store/stats';
  import { settings } from '$lib/store/settings.svelte';
  import { LESSON_FIRST_BONUS, SESSION_BONUS } from '$lib/game/xp';
  import { rankFor, type RankInfo } from '$lib/game/rank';
  import { applySession, type StreakEvent } from '$lib/game/streak';
  import { sfx } from '$lib/fx/sfx';
  import { burst } from '$lib/fx/confetti';
  import { buzz } from '$lib/fx/haptics';
  import { tts } from '$lib/fx/tts.svelte';
  import { createReveal } from '$lib/fx/reveal.svelte';
  import { refreshHeader } from '$lib/ui/header.svelte';
  import { cardFor, type AnswerResult } from '$lib/ui/cards';
  import Feedback from '$lib/ui/Feedback.svelte';
  import SessionBar from '$lib/ui/SessionBar.svelte';
  import LessonPanel from '$lib/ui/LessonPanel.svelte';
  import LessonStrip from '$lib/ui/LessonStrip.svelte';
  import SessionEnd from '$lib/ui/SessionEnd.svelte';
  import Reveal from '$lib/ui/Reveal.svelte';
  import { isTypingTarget } from '$lib/ui/cards/types';
  import { go } from '$lib/router.svelte';

  let { steps, concepts, levels, lessonId, onagain, onnext, title }: {
    steps: Step[]; concepts: Concept[]; levels: Record<string, Level>; lessonId?: string; onagain?: () => void; onnext?: () => void; title?: string;
  } = $props();

  // svelte-ignore state_referenced_locally
  let run = $state<RunnerState>(createRunner(steps, levels));
  // svelte-ignore state_referenced_locally
  const reveal = createReveal(Math.max(12, steps.filter((s) => s.item.type !== 'intro').length));
  let result = $state<AnswerResult | null>(null);
  let ended = $state<null | { streak: number; streakEvent: StreakEvent; rankBefore: RankInfo; rankAfter: RankInfo; dueTomorrow: number }>(null);
  let confirmExit = $state(false);
  const rng = Math.random;
  const art = `${import.meta.env.BASE_URL ?? '/'}art/van-mieu-01.webp`;

  const step = $derived(run.steps[run.i]);
  const concept = $derived(concepts.find((c) => c.id === step?.conceptId)!);
  const Card = $derived(step ? cardFor(step.item) : null);
  const confusableTerms = $derived(concept ? concept.confusables.map((id) => concepts.find((c) => c.id === id)?.term ?? id) : []);
  const speak = $derived(settings.tts && tts.available ? (t: string) => tts.speak(t) : undefined);
  // chốt chế độ cloze theo bậc lúc BẮT ĐẦU bước (không đổi khi đang xem phản hồi)
  const clozeMode = $derived.by(() => { const i = run.i; return clozeModeFor((run.results[i] ? run.results[i].levelBefore : run.levels[run.steps[i]?.conceptId]) ?? 0); });

  sfx.preload();

  async function onanswer(r: AnswerResult) {
    const cur = step;
    const { state, levelUp, sfx: snd, xpGained } = runAnswer(run, r);
    run = state;
    if (cur.item.type === 'intro') { sfx.play('intro'); runNextStep(); return; }
    // ghi tiến độ NGAY sau mỗi câu (Review Focus #1)
    try { await repo.record({ conceptId: cur.conceptId, subject: concept.subject, correct: r.correct, elapsedMs: r.elapsedMs, now: new Date(), retention: settings.retention }); } catch (e) { console.warn(e); }
    if (xpGained) await stats.addXp(xpGained);
    sfx.play(snd, { combo: run.combo });
    buzz(r.correct ? 'ok' : 'bad');
    if (r.correct) { reveal.reveal(); if (run.combo > 0 && run.combo % 5 === 0) sfx.play('combo'); }
    if (levelUp) { sfx.play('levelup'); burst(run.levels[cur.conceptId] >= 6 ? 'levelup' : 'small'); }
    result = r;
  }

  function runNextStep() {
    result = null;
    run = runNext(run);
    if (run.done) finish();
  }

  async function finish() {
    const xpBefore = (await stats.xp()) - run.xp;
    let bonus = SESSION_BONUS;
    if (lessonId && (await stats.markLesson(lessonId))) bonus += LESSON_FIRST_BONUS;
    const xpAfter = await stats.addXp(bonus);
    run = { ...run, xp: run.xp + bonus };
    const { state: st, event } = applySession(await stats.streak(), new Date());
    await stats.setStreak(st);
    const rankBefore = rankFor(Math.max(0, xpBefore));
    const rankAfter = rankFor(xpAfter);
    if (rankAfter.rank !== rankBefore.rank) { sfx.play('rankup'); burst('rankup'); buzz('milestone'); }
    const tomorrow = new Date(Date.now() + 86400000);
    const dueTomorrow = (await repo.due(tomorrow)).length;
    await refreshHeader();
    ended = { streak: st.count, streakEvent: event, rankBefore, rankAfter, dueTomorrow };
  }

  function exit() { sfx.play('exit'); go('home'); }
  function onkey(e: KeyboardEvent) {
    if (e.key === 'Escape' && !ended) { e.preventDefault(); if (isTypingTarget(e)) (e.target as HTMLElement).blur(); confirmExit = !confirmExit; }
  }
</script>

<svelte:window onkeydown={onkey} />
<Reveal {reveal} src={art} />
<div class="session-main">
  {#if ended}
    <SessionEnd summary={summary(run)} {concepts} streak={ended.streak} streakEvent={ended.streakEvent} rankBefore={ended.rankBefore} rankAfter={ended.rankAfter} dueTomorrow={ended.dueTomorrow} onhome={() => go('home')} {onagain} {onnext} />
  {:else if step && Card}
    <SessionBar done={run.i} total={run.steps.length} {title} onexit={() => (confirmExit = true)} />
    {#if lessonId}<LessonStrip {concepts} levels={run.levels} current={step?.conceptId ?? ''} />{/if}
    {#if confirmExit}
      <div class="card confirm" role="dialog" aria-label="Thoát phiên">
        <p>Thoát, giữ tiến độ? Những câu đã trả lời đã được lưu.</p>
        <div class="row"><button class="btn" type="button" onclick={exit}>Thoát</button><button class="btn ghost" type="button" onclick={() => (confirmExit = false)}>Ở lại</button></div>
      </div>
    {/if}
    {#key run.i}
      <Card {concept} item={step.item} {rng} {onanswer} onspeak={speak} mode={clozeMode} />
    {/key}
    {#if result}
      <Feedback {result} item={step.item} {concept} {confusableTerms} onnext={runNextStep} onspeak={speak} last={run.i === run.steps.length - 1} />
    {/if}
  {/if}
</div>
{#if !ended}
  <LessonPanel {concepts} levels={run.levels} current={step?.conceptId ?? ''} />
{/if}
