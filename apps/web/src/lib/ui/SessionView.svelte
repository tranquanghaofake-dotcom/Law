<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  import type { Concept, Level } from '$lib/content/types';
  import { clozeModeFor, type Step } from '$lib/engine/session';
  import { ratingProfile } from '$lib/engine/fsrs';
  import { recordsProgress } from '$lib/engine/step';
  import { answer as runAnswer, createRunner, isLast, mistakes, next as runNext, summary, type RunnerState } from '$lib/engine/runner';
  import { repo } from '$lib/store/progress-repo';
  import { stats } from '$lib/store/stats';
  import { settings } from '$lib/store/settings.svelte';
  import { LESSON_FIRST_BONUS, SESSION_BONUS } from '$lib/game/xp';
  import { rankFor, type RankInfo } from '$lib/game/rank';
  import { applySession, type StreakEvent } from '$lib/game/streak';
  import { sfx } from '$lib/fx/sfx';
  import { burst, reducedMotion } from '$lib/fx/confetti';
  import { buzz, buzzCombo } from '$lib/fx/haptics';
  import { sparks, stampConfetti } from '$lib/fx/sparks';
  import { tts } from '$lib/fx/tts.svelte';
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
  import { nextReview } from '$lib/ui/dueByDay';
  import { isTypingTarget } from '$lib/ui/cards/types';
  import { onDestroy, onMount, tick, untrack } from 'svelte';
  import { feedbackSpeech, promptSpeech } from '$lib/ui/session/speech';
  import { barMarks } from '$lib/ui/session/marks';
  import { submitRecord } from '$lib/ui/session/record';
  import { xpSources } from '$lib/ui/session/xpSources';
  import type { XpFloat } from '$lib/ui/session/combo';
  import FloatXp from '$lib/ui/session/FloatXp.svelte';
  import PretestBar from '$lib/ui/session/PretestBar.svelte';
  import { getPref } from '$lib/ui/session/prefs';
  import { hintSeen, markHintSeen } from '$lib/ui/hints';
  import { go } from '$lib/router.svelte';
  import { edgeGlow, fireStyle, glowLevel } from '$lib/ui/session/combo';
  import ComboStamp from '$lib/ui/session/ComboStamp.svelte';
  import { stampFor, TIMING, type Stamp } from '$lib/ui/session/reward';
  import { bossBadge } from '$lib/ui/session/badge';
  import { lessonGate } from '$lib/ui/lessonState';

  let { steps, concepts, levels, upDays = {}, lessonId, lessonConcepts, onagain, onnext, title, retryAlt }: {
    steps: Step[]; concepts: Concept[]; levels: Record<string, Level>;
    /** Ngày lên bậc gần nhất theo khái niệm (luật giãn cách bậc ≥ 4, cùng luật với repo.record). */
    upDays?: Record<string, string>;
    lessonId?: string; onagain?: () => void; onnext?: () => void; title?: string;
    /** Khái niệm của đợt (phiên học đợt): để màn kết thúc biết đợt sau đã mở chưa. */
    lessonConcepts?: string[];
    /** Vòng sửa sai: câu khác của cùng khái niệm/bậc (null → lặp câu cũ). Không truyền = lặp câu cũ. */
    retryAlt?: (step: Step) => Step | null;
  } = $props();

  // svelte-ignore state_referenced_locally
  let run = $state<RunnerState>(createRunner(steps, levels, upDays));
  let result = $state<AnswerResult | null>(null);
  let ended = $state<null | { streak: number; streakEvent: StreakEvent; rankBefore: RankInfo; rankAfter: RankInfo; dueTomorrow: number; promotion: string | null; dueNow: number; nextDue: ReturnType<typeof nextReview> }>(null);
  let confirmExit = $state(false);
  /** Phần tử đang có focus trước khi mở hộp Thoát bằng Esc, để trả về khi đóng. */
  let returnFocus: HTMLElement | null = null;
  // gợi ý một lần: lửa chuỗi và dấu mộc theo mốc (không chặn học, tắt bằng một chạm)
  let showHint = $state(!hintSeen('session-glow'));
  function dismissHint() { showHint = false; markHintSeen('session-glow'); }
  /** thông tin thưởng của câu vừa trả lời, hiện ở phản hồi */
  let reward = $state<{ xp: number; golden: boolean; levelTo: number | null; retry: boolean }>({ xp: 0, golden: false, levelTo: null, retry: false });
  /** dấu mộc "×3 CHUỖI!" và XP đang hiện ở bộ đếm (đếm lên sau khi chữ +XP bay tới) */
  let stamp = $state<Stamp | null>(null);
  let shownXp = $state(0);
  let floats = $state<XpFloat[]>([]);
  let floatId = 0;
  let sources = $state<ReturnType<typeof xpSources>>([]);
  let record = $state<ReturnType<typeof submitRecord> | null>(null);
  let lastPoint: { x: number; y: number; t: number } | null = null;
  const rng = Math.random;

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
  const golden = $derived(!!step?.meta?.golden && step.item.type !== 'intro');
  const retry = $derived(step?.meta?.kind === 'retry');
  const pretest = $derived(step?.meta?.kind === 'pretest');
  const bossText = $derived(bossBadge(!!lessonId, run.steps.slice(0, run.retryStart ?? run.steps.length).filter((s) => s.item.type !== 'intro').length));
  // câu đoán khái niệm từ định nghĩa/ví dụ: không tô khái niệm đang hỏi (lộ đáp án)
  const hideCurrent = $derived(step?.meta?.gen === 'def-term' || step?.meta?.gen === 'example-concept');

  // Giọng đọc đề/khái niệm ngay khi thẻ hiện (05/11/2026); đáp án chỉ đọc sau khi trả lời (onanswer → feedbackSpeech).
  // Thẻ trắc nghiệm báo thứ tự phương án đã xáo qua onshown (chạy lúc khởi tạo thẻ, trước effect này).
  let shownOptions: string[] | undefined;
  function onshown(o: string[]) { shownOptions = o; }
  // chỉ chạy khi CHỈ SỐ câu đổi (run bị gán lại ở mỗi lần trả lời — theo dõi thẳng `run` sẽ đọc đề đè lên đáp án)
  const stepIndex = $derived(run.i);
  $effect(() => {
    const i = stepIndex;
    untrack(() => {
      const s = run.steps[i];
      if (!s || run.done || ended || result || !concept || !settings.tts || !tts.available) return;
      tts.speak(promptSpeech(s.item, concept, shownOptions));
    });
  });

  sfx.preload();
  onDestroy(() => { tts.stop(); sfx.stopCombo(); floatTimers.forEach(clearTimeout); floatTimers.clear(); });
  /** hẹn giờ có dọn khi huỷ component */
  function later(fn: () => void, ms: number) {
    const t = setTimeout(() => { floatTimers.delete(t); fn(); }, ms);
    floatTimers.add(t);
  }

  // chữ "+10" bay lên ở chỗ vừa bấm; bàn phím thì bay từ giữa thẻ câu hỏi
  const floatTimers = new Set<ReturnType<typeof setTimeout>>();
  function spawnFloat(text: string, gold: boolean) {
    if (reducedMotion() || typeof document === 'undefined') return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    if (lastPoint && Date.now() - lastPoint.t < 1500) { x = lastPoint.x; y = lastPoint.y; }
    else { const r = document.querySelector('.question-card')?.getBoundingClientRect(); if (r) { x = r.left + r.width / 2; y = r.top + Math.min(r.height / 2, 160); } }
    const id = (floatId += 1);
    const fx = Math.min(Math.max(x, 40), window.innerWidth - 40), fy = Math.max(y, 60);
    const chip = document.querySelector('.session-bar .xp-chip')?.getBoundingClientRect();
    const fly = chip ? { dx: chip.left + chip.width / 2 - fx, dy: chip.top + chip.height / 2 - fy } : {};
    floats = [...floats, { id, x: fx, y: fy, text, golden: gold, fire: run.combo > 0 ? fireStyle(run.combo) : undefined, ...fly }];
    floatTimers.add(setTimeout(() => (floats = floats.filter((f) => f.id !== id)), 1100));
  }
  function onpointer(e: PointerEvent) { lastPoint = { x: e.clientX, y: e.clientY, t: Date.now() }; }

  async function onanswer(r0: AnswerResult) {
    const cur = step;
    const comboBefore = run.combo;
    const r: AnswerResult = r0;
    const isRetry = cur.meta?.kind === 'retry';
    const clozeAt = clozeMode; // chế độ điền (chọn/gõ) của bước này, trước khi runner ghi kết quả
    const { state, levelUp, sfx: snd, xpGained } = runAnswer(run, r);
    run = state;
    if (cur.item.type === 'intro') { sfx.play('intro'); runNextStep(); return; }
    // Tự đọc phản hồi NGAY trong lượt xử lý cử chỉ (trước mọi await) để trình duyệt cho phát tiếng.
    if (settings.tts && tts.available) tts.speak(feedbackSpeech(cur.item, r));
    // ghi tiến độ NGAY sau mỗi câu (Review Focus #1); vòng sửa sai và câu đoán trước không ghi, không đổi bậc
    if (recordsProgress(cur)) {
      try { await repo.record({ conceptId: cur.conceptId, subject: concept.subject, correct: r.correct, elapsedMs: r.elapsedMs, now: new Date(), retention: settings.retention, rating: { ...ratingProfile(cur.item, clozeAt), partial: r.selfGrade === 'gan' } }); } catch (e) { console.warn(e); }
    }
    if (xpGained) await stats.addXp(xpGained);
    const gold = !!cur.meta?.golden;
    // khoảnh khắc thưởng: dấu mộc ở mốc chuỗi (âm thanh dời về lúc dấu chạm giấy)
    const calm = reducedMotion();
    const fx = r.correct && snd === 'correct' ? stampFor(comboBefore, run.combo) : null;
    const showStamp = !!fx && !calm;
    if (r.correct && snd === 'correct') sfx.playCombo(run.combo, showStamp ? TIMING.stampLand : 0); else sfx.play(snd, { combo: run.combo });
    if (!r.correct) buzz('bad'); else if (glowLevel(run.combo) > 0) buzzCombo(glowLevel(run.combo)); else buzz('ok');
    if (r.correct && gold) sfx.play('golden');
    // tiếng đóng mộc: dấu mốc chuỗi (to) hoặc dấu "ĐÚNG" nhỏ trên hộp đáp án — khớp lúc dấu chạm giấy
    if (r.correct) sfx.stamp({ heavy: showStamp, delay: showStamp ? TIMING.stampLand : TIMING.sealLand });
    if (fx && showStamp) {
      stamp = fx;
      if (fx.confetti) later(() => stampConfetti(fx.tier, fx.combo >= 10), TIMING.stampLand);
    }
    const up = levelUp && !isRetry;
    if (up) { sfx.play('levelup'); burst(run.levels[cur.conceptId] >= 6 ? 'levelup' : 'small'); }
    if (xpGained > 0) spawnFloat(`+${xpGained}`, gold);
    // bộ đếm XP cộng dồn khi chữ +XP bay tới nơi (giảm chuyển động: cộng ngay)
    if (xpGained > 0 && !calm) later(() => (shownXp = run.xp), TIMING.xpFly); else shownXp = run.xp;
    reward = { xp: xpGained, golden: gold && r.correct, levelTo: up ? run.levels[cur.conceptId] : null, retry: isRetry };
    result = r;
    if (r.correct && !calm) { await tick(); celebrate(); }
  }

  /** nút đáp án đúng nảy lên và bung hạt sáng theo màu bậc, ngay từ nút đó (không có nút → chỗ vừa bấm / giữa thẻ câu hỏi) */
  function celebrate() {
    if (typeof document === 'undefined') return;
    const el = document.querySelector<HTMLElement>('.step-wrap .opt.correct, .step-wrap .opt.locked');
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    if (el) { const b = el.getBoundingClientRect(); x = b.left + b.width / 2; y = b.top + b.height / 2; }
    else if (lastPoint && Date.now() - lastPoint.t < 1500) { x = lastPoint.x; y = lastPoint.y; }
    else { const b = document.querySelector('.question-card')?.getBoundingClientRect(); if (b) { x = b.left + b.width / 2; y = b.top + Math.min(b.height / 2, 160); } }
    const level = glowLevel(run.combo);
    sparks(x, y, edgeGlow(run.combo).tier ?? 'do', 10 + level * 5);
    if (el) {
      el.classList.remove('reward-bounce'); void el.offsetWidth; el.classList.add('reward-bounce');
      later(() => el.classList.remove('reward-bounce'), 600);
    }
  }

  function runNextStep() {
    tts.stop();
    shownOptions = undefined;
    result = null;
    run = runNext(run, retryAlt);
    if (run.done) finish();
  }

  async function finish() {
    sfx.stopCombo();
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
    // lý do quay lại ở màn cuối: còn bài đến hạn ngay + lần ôn tới; lỗi truy vấn không được chặn màn kết thúc
    let dueNow = 0, nextDue: ReturnType<typeof nextReview> = null;
    try {
      dueNow = (await repo.due(new Date())).length;
      nextDue = nextReview((await repo.all()).map((c) => c.card.due));
    } catch { /* bỏ qua */ }
    await refreshHeader();
    await refreshShelf();
    await refreshSidenav();
    const titleAfter = currentTitle();
    const promotion = titleAfter !== titleBefore ? titleAfter : null;
    if (promotion) { sfx.play('rankup'); burst('rankup'); buzz('milestone'); }
    ended = { streak: st.count, streakEvent: event, rankBefore, rankAfter, dueTomorrow, promotion, dueNow, nextDue };
  }

  /** Bỏ qua câu đoán trước: ghi như sai nhưng không đụng tiến độ, sang thẻ giới thiệu ngay. */
  function skipPretest() {
    run = runAnswer(run, { correct: false, elapsedMs: 0, chosen: 'bo-qua' }).state;
    runNextStep();
  }

  function exit() { tts.stop(); sfx.stopCombo(); sfx.play('exit'); go('home'); }
  /** Hộp Thoát mở ra: focus vào nút an toàn (Ở lại) thay vì để rơi về body. */
  function focusOnMount(node: HTMLElement) { node.focus({ preventScroll: true }); }
  function onkey(e: KeyboardEvent) {
    if (e.key === 'Escape' && !ended) {
      e.preventDefault();
      if (isTypingTarget(e)) (e.target as HTMLElement).blur();
      if (confirmExit) closeConfirm(); else openConfirm();
    }
  }
  /** Mở hộp Thoát (Esc hoặc nút ← trên thanh phiên): nhớ phần tử đang focus để trả lại khi đóng. */
  function openConfirm() {
    const a = document.activeElement as HTMLElement | null;
    returnFocus = a && a !== document.body ? a : null;
    confirmExit = true;
  }
  /** Đóng hộp (Esc hoặc "Ở lại"): trả focus về chỗ cũ rồi xoá, tránh nhảy về phần tử cũ ở lần mở sau. */
  function closeConfirm() {
    confirmExit = false;
    const r = returnFocus; returnFocus = null;
    if (r?.isConnected) tick().then(() => r.focus({ preventScroll: true }));
  }
</script>

<svelte:window onkeydown={onkey} onpointerdowncapture={onpointer} />
{#if stamp}{#key stamp}<ComboStamp {stamp} onend={() => (stamp = null)} />{/key}{/if}
<FloatXp {floats} />
<div class="session-main">
  <h1 class="sr-only">{title ?? 'Phiên học'}</h1>
  {#if ended}
    <SessionEnd summary={summary(run)} {sources} {record} retryTotal={summary(run).retried} {concepts} streak={ended.streak} streakEvent={ended.streakEvent} rankBefore={ended.rankBefore} rankAfter={ended.rankAfter} dueTomorrow={ended.dueTomorrow} dueNow={ended.dueNow} next={ended.nextDue} kind={lessonConcepts ? 'lesson' : 'review'} promotion={ended.promotion} onhome={() => go('home')} {onagain} {onnext} gate={lessonConcepts ? lessonGate(lessonConcepts, run.levels) : null} mistakes={mistakes(run)} />
  {:else if step && Card}
    <SessionBar done={barDone} total={barTotal} {title} combo={run.combo} xp={shownXp} {marks} {inRetry} onexit={openConfirm} />
    {#if confirmExit}
      <div class="card confirm" role="dialog" aria-label="Thoát phiên">
        <p>Thoát, giữ tiến độ? Những câu đã trả lời đã được lưu.</p>
        <div class="row"><button class="btn" type="button" onclick={exit}>Thoát</button><button class="btn ghost" type="button" onclick={closeConfirm} use:focusOnMount>Ở lại</button></div>
      </div>
    {/if}
      <div class="step-wrap" class:golden class:retry class:boss={step.meta?.kind === 'boss' && !!bossText}>
        {#if golden}<p class="step-badge gold"><Glyph name="star-fill" size={14} /> Câu vàng · đúng được ×2 XP</p>
        {:else if retry}<p class="step-badge retry">Sửa sai · không ghi vào tiến độ nhớ</p>
        {:else if step.meta?.kind === 'boss' && bossText}<p class="step-badge boss">{bossText}</p>{/if}
        {#if pretest}<PretestBar answered={!!result} onskip={skipPretest} />{/if}
        {#key run.i}
          <div class="step-in"><Card {concept} item={step.item} meta={step.meta} {rng} {onanswer} {onshown} onspeak={speak} mode={clozeMode} /></div>
        {/key}
      </div>
      {#if result}
        <Feedback {result} item={step.item} {concept} {confusableTerms} confusables={confusableConcepts} {compareWith} onnext={runNextStep} onspeak={speak} last={isLast(run)} xp={reward.xp} golden={reward.golden} levelTo={reward.levelTo} retry={reward.retry} />
      {/if}
    <!-- Hướng B, đợt 1: dải khái niệm của đợt và dòng mẹo nằm DƯỚI câu hỏi — là bối cảnh, không phải việc đang làm (trước đây đẩy câu hỏi xuống 31% màn hình). -->
    {#if lessonId}<LessonStrip {concepts} levels={run.levels} current={hideCurrent ? '' : (step?.conceptId ?? '')} />{/if}
    {#if showHint}
      <!-- Một dòng (không phải hộp): thẻ học vẫn ở màn đầu trên điện thoại -->
      <p class="session-hint small"><Glyph name="flame" size={16} /> <span>Mẹo: trả lời đúng liên tiếp để <b>giữ lửa chuỗi</b> và nhận XP nhân thêm; sai thì chuỗi về 0, điểm đã có vẫn giữ.</span><button class="hint-x" type="button" aria-label="Ẩn gợi ý" onclick={dismissHint}><Glyph name="close" size={16} /></button></p>
    {/if}
  {/if}
</div>
{#if !ended}
  <LessonPanel {concepts} levels={run.levels} current={hideCurrent ? '' : (step?.conceptId ?? '')} />
{/if}
