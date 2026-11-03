<script lang="ts">
  import type { QuizSet, QuizQuestion } from '$lib/content/types';
  import { loadIndex, loadSet } from '$lib/content/loader';
  import { shuffle } from '$lib/engine/session';
  import { repo } from '$lib/store/progress-repo';
  import { stats } from '$lib/store/stats';
  import { settings } from '$lib/store/settings.svelte';
  import { sfx } from '$lib/fx/sfx';
  import { buzz } from '$lib/fx/haptics';
  import { hashFor, route } from '$lib/router.svelte';
  import { isTypingTarget, KEYS } from '$lib/ui/cards/types';
  import { GROUPS } from '$lib/ui/groups';
  import { nextAfter, orderIds, shelfFor, ticketNo, verdictFor } from '$lib/ui/quiz';

  type Q = QuizQuestion & { shuffled: string[]; answerIdx: number };
  let set = $state<QuizSet | null>(null);
  let qs = $state<Q[]>([]);
  let i = $state(0);
  let score = $state(0);
  let chosen = $state<number | null>(null);
  let wrong = $state<{ n: number; q: Q; picked: string }[]>([]);
  let results = $state<boolean[]>([]);
  let prevBest = $state<number | null>(null);
  let sets = $state<{ id: string; group: string }[]>([]);
  let finished = $state(false);
  let error = $state('');
  let shareLabel = $state('Chia sẻ');
  let start = Date.now();

  async function load() {
    try {
      set = await loadSet(route.params.id);
      document.title = `${set.title} · Luyện Luật`;
      qs = set.questions.map((q) => { const order = shuffle([0, 1, 2, 3], Math.random); return { ...q, shuffled: order.map((k) => q.options[k]), answerIdx: order.indexOf(q.answer) }; });
      i = 0; score = 0; chosen = null; wrong = []; results = []; prevBest = null; finished = false; start = Date.now();
    } catch (e) { error = (e as Error).message; }
  }
  $effect(() => { void route.params.id; load(); });
  loadIndex().then((x) => (sets = x.sets)).catch(() => { /* không có "Đề tiếp theo" */ });

  const q = $derived(qs[i]);

  async function pick(k: number) {
    if (chosen !== null || !q) return;
    chosen = k;
    const ok = k === q.answerIdx;
    results = [...results, ok];
    if (ok) score += 1; else wrong = [...wrong, { n: i + 1, q, picked: q.shuffled[k] }];
    sfx.play(ok ? 'correct' : 'wrong'); buzz(ok ? 'ok' : 'bad');
    if (q.concept && set) {
      try { await repo.record({ conceptId: q.concept, subject: set.group, correct: ok, elapsedMs: Date.now() - start, now: new Date(), retention: settings.retention }); } catch { /* bỏ qua */ }
    }
    start = Date.now();
  }
  async function next() {
    if (chosen === null) return;
    chosen = null;
    if (i + 1 < qs.length) { i += 1; return; }
    finished = true;
    const b = await stats.best(set!.id);
    prevBest = b;
    if (b == null || score > b) await stats.setBest(set!.id, score);
  }
  async function share() {
    const data = { title: set!.title, text: `Mình được ${score}/${qs.length} câu "${set!.title}". Thử xem bạn được mấy câu?`, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(`${data.text} ${data.url}`); shareLabel = 'Đã chép link'; }
    } catch { /* người dùng hủy */ }
  }
  function onkey(e: KeyboardEvent) {
    if (isTypingTarget(e) || finished) return;
    const n = Number(e.key);
    if (n >= 1 && n <= 4) { e.preventDefault(); pick(n - 1); }
    if (e.key === 'Enter') { e.preventDefault(); next(); }
  }
  const cls = (k: number) => chosen === null ? '' : k === q.answerIdx ? 'correct' : k === chosen ? 'wrong' : 'dim';
  const verdict = $derived(verdictFor(score, qs.length));
  const shelf = $derived(set ? shelfFor(set.group) : null);
  const nextSet = $derived(set ? nextAfter(sets, set.id) : null);
  const no = $derived(set ? ticketNo(orderIds(sets), set.id) : null);
  const R = 52, C = 2 * Math.PI * R; // vòng điểm (SVG)
  const record = $derived(prevBest == null ? 'Lần đầu làm đề này: điểm đã được ghi lại.' : score > prevBest ? `Kỷ lục mới: trước đó ${prevBest}/${qs.length}.` : score === prevBest ? `Bằng điểm cao nhất của bạn (${prevBest}/${qs.length}).` : `Điểm cao nhất của bạn vẫn là ${prevBest}/${qs.length}.`);
  const dotState = (k: number) => (k < results.length ? (results[k] ? 'ok' : 'bad') : k === i ? 'cur' : 'todo');
</script>

<svelte:window onkeydown={onkey} />
{#if error}
  <section class="card"><p class="muted">Không tải được bộ câu hỏi: {error}</p><a class="btn ghost" href="#/">Về trang chủ</a></section>
{:else if !set || !q}
  <p class="loading">Đang tải…</p>
{:else if finished}
  <section class="card qr {verdict.tier}" style="--shelf:{shelf?.color}" aria-labelledby="qr-h">
    <div class="qr-ring">
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle class="trk" cx="60" cy="60" r={R} /><circle class="val" cx="60" cy="60" r={R} stroke-dasharray={C} stroke-dashoffset={C * (1 - score / qs.length)} transform="rotate(-90 60 60)" style="--c:{C}" /></svg>
      <p class="score"><b>{score}</b><small>/{qs.length}</small></p>
    </div>
    <div class="qr-body">
      <p class="kicker">{no ? `Đề ${no} · ` : ''}{GROUPS[set.group] ?? set.group}</p>
      <h1 id="qr-h">{verdict.title}</h1>
      <p class="qr-set">{set.title}</p>
      <p class="msg">{verdict.msg}</p>
      <p class="qr-rec small muted">{record}</p>
      <ol class="qdots done" aria-label="Kết quả từng câu">
        {#each results as r, k (k)}<li class={r ? 'ok' : 'bad'}><span class="sr-only">Câu {k + 1} {r ? 'đúng' : 'sai'}</span></li>{/each}
      </ol>
      <div class="row">
        <button class="btn {verdict.tier === 'perfect' && nextSet ? 'ghost' : 'primary'}" type="button" onclick={load}>Làm lại</button>
        {#if nextSet}<a class="btn {verdict.tier === 'perfect' ? 'primary' : 'ghost'}" href={hashFor('quiz', { id: nextSet.id })}>Đề tiếp theo</a>{/if}
        <a class="btn ghost" href="#/luyen-de">Về Luyện đề</a>
        <button class="btn ghost" type="button" onclick={share}>{shareLabel}</button>
      </div>
    </div>
  </section>
  {#if wrong.length}
    <section class="review" aria-labelledby="rv-h"><h2 id="rv-h">Câu cần xem lại <span class="muted">({wrong.length})</span></h2>
      {#each wrong as w (w.n)}
        <article class="card item rv">
          <p class="rv-n">Câu {w.n}</p><b>{w.q.q}</b>
          <p class="rv-pick">Bạn chọn: <span>{w.picked}</span></p>
          <p class="ans">Đáp án đúng: {w.q.options[w.q.answer]}</p>
          <p>{w.q.explain}</p><p class="source muted">Căn cứ: {w.q.basis}{#if w.q.url} · <a href={w.q.url} target="_blank" rel="noopener">Xem điều luật</a>{/if}</p>
        </article>
      {/each}
    </section>
  {:else}
    <p class="qr-clean" role="status">Không sai câu nào. Bạn có thể sang đề khác.</p>
  {/if}
{:else}
  <div class="session-bar">
    <a class="exit" href="#/luyen-de" aria-label="Về Luyện đề">←</a>
    <div class="qdots" role="progressbar" aria-label="Tiến độ bộ câu hỏi" aria-valuemin="0" aria-valuemax={qs.length} aria-valuenow={i} aria-valuetext="Câu {i + 1} trên {qs.length}, đúng {score}">
      {#each qs as _, k (k)}<span class={dotState(k)}></span>{/each}
    </div>
    <span class="count">{i + 1}/{qs.length}</span>
  </div>
  <article class="card question-card" style="--shelf:{shelf?.color}" aria-label="Câu hỏi trắc nghiệm">
    <div class="qhead"><span class="qno">Câu {i + 1}</span><h1 class="qset">{set.title}</h1></div>
    <p class="question">{q.q}</p>
    <div class="options" role="group" aria-label="Phương án">
      {#each q.shuffled as o, k}
        <button class="opt {cls(k)}" type="button" disabled={chosen !== null} onclick={() => pick(k)}><span class="key" aria-hidden="true">{KEYS[k]}</span><span>{o}</span></button>
      {/each}
    </div>
  </article>
  {#if chosen !== null}
    <div class="feedback {chosen === q.answerIdx ? 'ok' : 'bad'}" role="status">
      <p class="verdict">{chosen === q.answerIdx ? 'Chính xác.' : `Chưa đúng. Đáp án: ${KEYS[q.answerIdx]}`}</p>
      <p>{q.explain}</p>
      <p class="source muted">Căn cứ: {q.basis}{#if q.url} · <a href={q.url} target="_blank" rel="noopener">Xem điều luật</a>{/if}</p>
      <button class="btn" type="button" onclick={next}>{i === qs.length - 1 ? 'Xem kết quả' : 'Câu tiếp →'} <kbd>↵</kbd></button>
    </div>
  {/if}
{/if}
