<script lang="ts">
  import type { Concept, Level } from '$lib/content/types';
  import { clozeModeFor, type Step } from '$lib/engine/session';
  import { recordsProgress } from '$lib/engine/step';
  import { isHypercorrection, shouldAskConfidence, type Confidence } from '$lib/engine/confidence';
  import { answer as runAnswer, createRunner, isLast, mistakes, next as runNext, summary, type RunnerState } from '$lib/engine/runner';
  import { repo } from '$lib/store/progress-repo';
  import { stats } from '$lib/store/stats';
  import { settings } from '$lib/store/settings.svelte';
  import { LESSON_FIRST_BONUS, SESSION_BONUS } from '$lib/game/xp';
  import { rankFor, type RankInfo } from '$lib/game/rank';
  import { applySession, type StreakEvent } from '$lib/game/streak';
  import { sfx } from '$lib/fx/sfx';
  import { burst, reducedMotion } from '$lib/fx/confetti';
  import { buzz } from '$lib/fx/haptics';
  import { tts } from '$lib/fx/tts.svelte';
  import { createReveal } from '$lib/fx/reveal.svelte';
  import { refreshHeader } from '$lib/ui/header.svelte';
  import { refreshSidenav } from '$lib/ui/sidenav.svelte';
  import { refreshShelf } from '$lib/ui/shelf.svelte';
  import { currentTitle } from '$lib/ui/career.svelte';
  import { cardFor, type AnswerResult } from '$lib/ui/cards';
  import { firstComparable } from '$lib/engine/compare';
  import Feedback from '$lib/ui/Feedback.svelte';
  import SessionBar from '$lib/ui/SessionBar.svelte';
  import LessonPanel from '$lib/ui/LessonPanel.svelte';
  import LessonStrip from '$lib/ui/LessonStrip.svelte';
  import SessionEnd from '$lib/ui/SessionEnd.svelte';
  import Reveal from '$lib/ui/Reveal.svelte';
  import { isTypingTarget } from '$lib/ui/cards/types';
  import { onDestroy } from 'svelte';
  import { feedbackSpeech } from '$lib/ui/session/speech';
  import { barMarks } from '$lib/ui/session/marks';
  import { submitRecord } from '$lib/ui/session/record';
  import { xpSources } from '$lib/ui/session/xpSources';
  import type { XpFloat } from '$lib/ui/session/combo';
  import FloatXp from '$lib/ui/session/FloatXp.svelte';
  import BossIntro from '$lib/ui/session/BossIntro.svelte';
  import ConfidenceBar from '$lib/ui/session/ConfidenceBar.svelte';
  import HyperNote from '$lib/ui/session/HyperNote.svelte';
  import PretestBar from '$lib/ui/session/PretestBar.svelte';
  import { getPref } from '$lib/ui/session/prefs';
  import { go } from '$lib/router.svelte';

  let { steps, concepts, levels, lessonId, onagain, onnext, title }: {
    steps: Step[]; concepts: Concept[]; levels: Record<string, Level>; lessonId?: string; onagain?: () => void; onnext?: () => void; title?: string;
  } = $props();

  // svelte-ignore state_referenced_locally
  let run = $state<RunnerState>(createRunner(steps, levels));
  // svelte-ignore state_referenced_locally
  const reveal = createReveal(Math.max(12, steps.filter((s) => s.item.type !== 'intro').length));
  let result = $state<AnswerResult | null>(null);
  let ended = $state<null | { streak: number; streakEvent: StreakEvent; rankBefore: RankInfo; rankAfter: RankInfo; dueTomorrow: number; promotion: string | null }>(null);
  let confirmExit = $state(false);
  /** thông tin thưởng của câu vừa trả lời, hiện ở phản hồi */
  let reward = $state<{ xp: number; golden: boolean; levelTo: number | null; retry: boolean }>({ xp: 0, golden: false, levelTo: null, retry: false });
  let bossSeen = $state(-1);
  /** độ tự tin người học chọn cho bước hiện tại (tuỳ chọn; xoá khi sang bước sau) */
  let conf = $state<Confidence | undefined>(undefined);
  const confOn = getPref('confidence');
  let floats = $state<XpFloat[]>([]);
  let floatId = 0;
  let sources = $state<ReturnType<typeof xpSources>>([]);
  let record = $state<ReturnType<typeof submitRecord> | null>(null);
  let lastPoint: { x: number; y: number; t: number } | null = null;
  const rng = Math.random;
  const art = `${import.meta.env.BASE_URL ?? '/'}art/van-mieu-01.webp`;

  const step = $derived(run.steps[run.i]);
  const concept = $derived(concepts.find((c) => c.id === step?.conceptId)!);
  const Card = $derived(step ? cardFor(step.item) : null);
  const confusableTerms = $derived(concept ? concept.confusables.map((id) => concepts.find((c) => c.id === id)?.term ?? id) : []);
  const confusableConcepts = $derived(concept ? concept.confusables.map((id) => concepts.find((c) => c.id === id)).filter((c): c is Concept => !!c) : []);
  const compareWith = $derived(concept && step && (step.item.type === 'sort' || step.item.type === 'pair') ? firstComparable(concept, concepts) : null);
  const speak = $derived(settings.tts && tts.available ? (t: string) => tts.speak(t) : undefined);
  // chốt chế độ cloze theo bậc lúc BẮT ĐẦU bước (không đổi khi đang xem phản hồi)
  const clozeMode = $derived.by(() => { const i = run.i; return clozeModeFor((run.results[i] ? run.results[i].levelBefore : run.levels[run.steps[i]?.conceptId]) ?? 0); });

  // vòng sửa sai được nối vào cuối: thanh tiến độ đếm riêng đoạn đó
  const inRetry = $derived(run.retryStart !== null && run.i >= run.retryStart);
  const barTotal = $derived(inRetry ? run.steps.length - run.retryStart! : (run.retryStart ?? run.steps.length));
  const barDone = $derived(inRetry ? run.i - run.retryStart! : run.i);
  const marks = $derived(inRetry ? [] : barMarks(run.steps.slice(0, run.retryStart ?? run.steps.length), run.i));
  const showBoss = $derived(step?.meta?.kind === 'boss' && step.item.type !== 'intro' && bossSeen !== run.i);
  const golden = $derived(!!step?.meta?.golden && step.item.type !== 'intro');
  const retry = $derived(step?.meta?.kind === 'retry');
  const pretest = $derived(step?.meta?.kind === 'pretest');
  // hỏi độ tự tin ở nửa số câu từ bậc 2 (nhẹ phiên); chỉ khi chưa trả lời; không hỏi ở ghép cặp (dùng phím A–D)
  const askConf = $derived(confOn && !result && !!step && step.item.type !== 'match' && shouldAskConfidence(step, run.i, { minLevel: 2, every: 2 }));
  const hyper = $derived(!!result && isHypercorrection(result.correct, result.conf));
  // câu đoán khái niệm từ định nghĩa/ví dụ: không tô khái niệm đang hỏi (lộ đáp án)
  const hideCurrent = $derived(step?.meta?.gen === 'def-term' || step?.meta?.gen === 'example-concept');

  sfx.preload();
  onDestroy(() => tts.stop());

  // chữ "+10" bay lên ở chỗ vừa bấm; bàn phím thì bay từ giữa thẻ câu hỏi
  function spawnFloat(text: string, gold: boolean) {
    if (reducedMotion() || typeof document === 'undefined') return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    if (lastPoint && Date.now() - lastPoint.t < 1500) { x = lastPoint.x; y = lastPoint.y; }
    else { const r = document.querySelector('.question-card')?.getBoundingClientRect(); if (r) { x = r.left + r.width / 2; y = r.top + Math.min(r.height / 2, 160); } }
    const id = (floatId += 1);
    floats = [...floats, { id, x: Math.min(Math.max(x, 40), window.innerWidth - 40), y: Math.max(y, 60), text, golden: gold }];
    setTimeout(() => (floats = floats.filter((f) => f.id !== id)), 1100);
  }
  function onpointer(e: PointerEvent) { lastPoint = { x: e.clientX, y: e.clientY, t: Date.now() }; }

  async function onanswer(r0: AnswerResult) {
    const cur = step;
    const r: AnswerResult = askConf && conf ? { ...r0, conf } : r0;
    const isRetry = cur.meta?.kind === 'retry';
    const { state, levelUp, sfx: snd, xpGained } = runAnswer(run, r);
    run = state;
    if (cur.item.type === 'intro') { sfx.play('intro'); runNextStep(); return; }
    // Tự đọc phản hồi NGAY trong lượt xử lý cử chỉ (trước mọi await) để trình duyệt cho phát tiếng.
    if (settings.tts && tts.available) tts.speak(feedbackSpeech(cur.item, r));
    // ghi tiến độ NGAY sau mỗi câu (Review Focus #1); vòng sửa sai và câu đoán trước không ghi, không đổi bậc
    if (recordsProgress(cur)) {
      try { await repo.record({ conceptId: cur.conceptId, subject: concept.subject, correct: r.correct, elapsedMs: r.elapsedMs, now: new Date(), retention: settings.retention, conf: r.conf }); } catch (e) { console.warn(e); }
    }
    if (xpGained) await stats.addXp(xpGained);
    const gold = !!cur.meta?.golden;
    sfx.play(snd, { combo: run.combo });
    buzz(r.correct ? 'ok' : 'bad');
    if (r.correct) {
      reveal.reveal();
      if (gold) sfx.play('golden');
      else if (run.combo > 0 && run.combo % 5 === 0) sfx.play('combo');
    }
    const up = levelUp && !isRetry;
    if (up) { sfx.play('levelup'); burst(run.levels[cur.conceptId] >= 6 ? 'levelup' : 'small'); }
    if (xpGained > 0) spawnFloat(`+${xpGained}`, gold);
    reward = { xp: xpGained, golden: gold && r.correct, levelTo: up ? run.levels[cur.conceptId] : null, retry: isRetry };
    result = r;
  }

  function runNextStep() {
    tts.stop();
    result = null;
    conf = undefined;
    run = runNext(run);
    if (run.done) finish();
  }

  async function finish() {
    const xpBefore = (await stats.xp()) - run.xp;
    let bonus = SESSION_BONUS;
    if (lessonId && (await stats.markLesson(lessonId))) bonus += LESSON_FIRST_BONUS;
    const xpAfter = await stats.addXp(bonus);
    run = { ...run, xp: run.xp + bonus };
    const sm = summary(run);
    sources = xpSources(sm.xpParts, { session: SESSION_BONUS, lesson: bonus - SESSION_BONUS });
    record = submitRecord({ bestCombo: sm.bestCombo, correct: sm.correct, total: sm.total });
    const { state: st, event } = applySession(await stats.streak(), new Date());
    await stats.setStreak(st);
    const rankBefore = rankFor(Math.max(0, xpBefore));
    const rankAfter = rankFor(xpAfter);
    const titleBefore = currentTitle();
    const tomorrow = new Date(Date.now() + 86400000);
    const dueTomorrow = (await repo.due(tomorrow)).length;
    await refreshHeader();
    await refreshShelf();
    await refreshSidenav();
    const titleAfter = currentTitle();
    const promotion = titleAfter !== titleBefore ? titleAfter : null;
    if (promotion) { sfx.play('rankup'); burst('rankup'); buzz('milestone'); }
    ended = { streak: st.count, streakEvent: event, rankBefore, rankAfter, dueTomorrow, promotion };
  }

  /** Bỏ qua câu đoán trước: ghi như sai nhưng không đụng tiến độ, sang thẻ giới thiệu ngay. */
  function skipPretest() {
    run = runAnswer(run, { correct: false, elapsedMs: 0, chosen: 'bo-qua' }).state;
    runNextStep();
  }

  function exit() { tts.stop(); sfx.play('exit'); go('home'); }
  function onkey(e: KeyboardEvent) {
    if (e.key === 'Escape' && !ended) { e.preventDefault(); if (isTypingTarget(e)) (e.target as HTMLElement).blur(); confirmExit = !confirmExit; }
  }
</script>

<svelte:window onkeydown={onkey} onpointerdowncapture={onpointer} />
<Reveal {reveal} src={art} />
<FloatXp {floats} />
<div class="session-main">
  <h1 class="sr-only">{title ?? 'Phiên học'}</h1>
  {#if ended}
    <SessionEnd summary={summary(run)} {sources} {record} retryTotal={summary(run).retried} {concepts} streak={ended.streak} streakEvent={ended.streakEvent} rankBefore={ended.rankBefore} rankAfter={ended.rankAfter} dueTomorrow={ended.dueTomorrow} promotion={ended.promotion} onhome={() => go('home')} {onagain} {onnext} mistakes={mistakes(run)} />
  {:else if step && Card}
    <SessionBar done={barDone} total={barTotal} {title} combo={run.combo} {marks} {inRetry} onexit={() => (confirmExit = true)} />
    {#if lessonId}<LessonStrip {concepts} levels={run.levels} current={hideCurrent ? '' : (step?.conceptId ?? '')} />{/if}
    {#if confirmExit}
      <div class="card confirm" role="dialog" aria-label="Thoát phiên">
        <p>Thoát, giữ tiến độ? Những câu đã trả lời đã được lưu.</p>
        <div class="row"><button class="btn" type="button" onclick={exit}>Thoát</button><button class="btn ghost" type="button" onclick={() => (confirmExit = false)}>Ở lại</button></div>
      </div>
    {/if}
    {#if showBoss}
      {#key run.i}<BossIntro ondone={() => (bossSeen = run.i)} />{/key}
    {:else}
      <div class="step-wrap" class:golden class:retry class:boss={step.meta?.kind === 'boss'}>
        {#if golden}<p class="step-badge gold"><span aria-hidden="true">★</span> Câu vàng · đúng được ×2 XP</p>
        {:else if retry}<p class="step-badge retry">Sửa sai · không ghi vào tiến độ nhớ</p>
        {:else if step.meta?.kind === 'boss'}<p class="step-badge boss">Câu chốt</p>{/if}
        {#if pretest}<PretestBar answered={!!result} onskip={skipPretest} />{/if}
        {#if askConf}<ConfidenceBar value={conf} onpick={(c) => (conf = c)} />{/if}
        {#key run.i}
          <Card {concept} item={step.item} meta={step.meta} {rng} {onanswer} onspeak={speak} mode={clozeMode} />
        {/key}
      </div>
      {#if result}
        {#if hyper}<HyperNote term={concept.term} confusableTerms={confusableConcepts.map((c) => c.term)} retry={reward.retry} />{/if}
        <Feedback {result} item={step.item} {concept} {confusableTerms} confusables={confusableConcepts} {compareWith} onnext={runNextStep} onspeak={speak} last={isLast(run)} xp={reward.xp} golden={reward.golden} levelTo={reward.levelTo} retry={reward.retry} />
      {/if}
    {/if}
  {/if}
</div>
{#if !ended}
  <LessonPanel {concepts} levels={run.levels} current={hideCurrent ? '' : (step?.conceptId ?? '')} />
{/if}
