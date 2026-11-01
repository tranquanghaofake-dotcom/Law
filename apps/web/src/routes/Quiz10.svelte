<script lang="ts">
  import type { QuizSet, QuizQuestion } from '$lib/content/types';
  import { loadSet } from '$lib/content/loader';
  import { shuffle } from '$lib/engine/session';
  import { repo } from '$lib/store/progress-repo';
  import { stats } from '$lib/store/stats';
  import { settings } from '$lib/store/settings.svelte';
  import { sfx } from '$lib/fx/sfx';
  import { buzz } from '$lib/fx/haptics';
  import { route } from '$lib/router.svelte';
  import { isTypingTarget, KEYS } from '$lib/ui/cards/types';

  type Q = QuizQuestion & { shuffled: string[]; answerIdx: number };
  let set = $state<QuizSet | null>(null);
  let qs = $state<Q[]>([]);
  let i = $state(0);
  let score = $state(0);
  let chosen = $state<number | null>(null);
  let wrong = $state<Q[]>([]);
  let finished = $state(false);
  let error = $state('');
  let shareLabel = $state('Chia sẻ');
  let start = Date.now();

  async function load() {
    try {
      set = await loadSet(route.params.id);
      document.title = `${set.title} · Luyện Luật`;
      qs = set.questions.map((q) => { const order = shuffle([0, 1, 2, 3], Math.random); return { ...q, shuffled: order.map((k) => q.options[k]), answerIdx: order.indexOf(q.answer) }; });
      i = 0; score = 0; chosen = null; wrong = []; finished = false; start = Date.now();
    } catch (e) { error = (e as Error).message; }
  }
  $effect(() => { void route.params.id; load(); });

  const q = $derived(qs[i]);

  async function pick(k: number) {
    if (chosen !== null || !q) return;
    chosen = k;
    const ok = k === q.answerIdx;
    if (ok) score += 1; else wrong = [...wrong, q];
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
  const msg = $derived(score === qs.length ? 'Tuyệt đối. Bạn nắm chắc phần này.' : score >= qs.length * 0.7 ? 'Khá chắc. Xem lại vài câu sai bên dưới.' : 'Nên đọc lại giải thích và thử lần nữa.');
</script>

<svelte:window onkeydown={onkey} />
{#if error}
  <section class="card"><p class="muted">Không tải được bộ câu hỏi: {error}</p><a class="btn ghost" href="#/">Về trang chủ</a></section>
{:else if !set || !q}
  <p class="loading">Đang tải…</p>
{:else if finished}
  <div class="session-bar"><a class="exit" href="#/luyen-de" aria-label="Về Luyện đề">←</a><h2 style="margin:0;flex:1;font-size:17px">{set.title}</h2></div>
  <section class="card result">
    <p class="score"><b>{score}</b><small>/{qs.length}</small></p><p class="msg">{msg}</p>
    <div class="row">
      <button class="btn" type="button" onclick={load}>Làm lại</button>
      <button class="btn ghost" type="button" onclick={share}>{shareLabel}</button>
    </div>
    <div class="row"><a class="btn primary" href="#/luyen-de">Chọn bộ khác</a><a class="btn ghost" href="#/">Hôm nay</a></div>
  </section>
  {#if wrong.length}
    <section class="review"><h2>Các câu cần xem lại</h2>
      {#each wrong as w (w.q)}
        <div class="card item"><b>{w.q}</b><p class="ans">Đáp án: {w.options[w.answer]}</p><p>{w.explain}</p><p class="source muted">Căn cứ: {w.basis}{#if w.url} · <a href={w.url} target="_blank" rel="noopener">Xem điều luật</a>{/if}</p></div>
      {/each}
    </section>
  {/if}
{:else}
  <div class="session-bar">
    <a class="exit" href="#/" aria-label="Về trang chủ">←</a>
    <div class="progress" role="progressbar" aria-label="Tiến độ bộ câu hỏi" aria-valuemin="0" aria-valuemax={qs.length} aria-valuenow={i}><span style="width:{(i / qs.length) * 100}%"></span></div>
    <span class="count">{i + 1}/{qs.length}</span>
  </div>
  <article class="card question-card" aria-label="Câu hỏi trắc nghiệm">
    <p class="kicker">{set.title}</p>
    <p class="question">{q.q}</p>
    <div class="options" role="group" aria-label="Phương án">
      {#each q.shuffled as o, k}
        <button class="opt {cls(k)}" type="button" disabled={chosen !== null} aria-label="{KEYS[k]}. {o}" onclick={() => pick(k)}><span class="key" aria-hidden="true">{KEYS[k]}</span><span>{o}</span></button>
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
