<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  import StreakCard from '$lib/art/StreakCard.svelte';
  import CountUp from './CountUp.svelte';
  import StreakIgnite from '$lib/art/StreakIgnite.svelte';
  import { shouldIgnite, IGNITE_KEY } from './ignite';
  import { localDay } from '$lib/game/streak';
  import { onMount } from 'svelte';
  import type { Concept, Level } from '$lib/content/types';
  import type { StreakEvent } from '$lib/game/streak';
  import type { RankInfo } from '$lib/game/rank';
  import type { Step } from '$lib/engine/session';
  import { hashFor } from '$lib/router.svelte';
  import { LEVEL_NAMES } from '$lib/game/levels';
  import { reviewTexts } from './cards/answer';
  import { endAction, type EndButton } from './endAction';
  import type { nextReview } from './dueByDay';
  import type { XpSource } from './session/xpSources';
  let { summary, concepts, streak, streakEvent, dueTomorrow, onhome, onagain, onnext, mistakes = [], promotion = null, sources = [], record = null, retryTotal: retryProp = 0, gate = null, kind = 'lesson', dueNow = 0, next = null }: {
    summary: { correct: number; total: number; xp: number; levelUps: { conceptId: string; to: Level }[]; bestCombo?: number; golden?: number; fixed?: number; retried?: number; pretest?: { total: number; correct: number }; held?: number };
    concepts: Concept[]; streak: number; streakEvent: StreakEvent; rankBefore: RankInfo; rankAfter: RankInfo; dueTomorrow: number;
    onhome: () => void; onagain?: () => void; onnext?: () => void; mistakes?: Step[]; promotion?: string | null;
    /** XP chia theo nguồn */
    sources?: XpSource[];
    /** kỷ lục phiên (localStorage): cờ phá kỷ lục kèm kỷ lục cũ */
    record?: { comboBeaten: boolean; rateBeaten: boolean; before: { bestCombo: number; bestRate: number } } | null;
    /** số câu bước vào vòng sửa sai (mẫu số của "sửa được x/y") */
    retryTotal?: number;
    /** Cổng mở đợt sau (phiên học đợt): chưa xong thì mời học lượt tiếp đợt này thay vì "Học đợt tiếp". null = không xét. */
    gate?: { done: boolean; remaining: number; total: number } | null;
    /** phiên đợt hay phiên ôn (quyết định nút chính) */
    kind?: 'lesson' | 'review';
    /** số khái niệm đến hạn ngay lúc kết thúc phiên, và lần ôn gần nhất chưa tới */
    dueNow?: number;
    next?: ReturnType<typeof nextReview>;
  } = $props();
  const retryTotal = $derived(retryProp || summary.retried || 0);
  // màn thắp chuỗi toàn màn hình: lần đầu chuỗi tăng trong ngày (ghi ngày đã chiếu ở localStorage)
  let igniting = $state(false);
  let mini: HTMLSpanElement | undefined = $state();
  onMount(() => {
    const today = localDay(new Date());
    let shown: string | null = null;
    try { shown = localStorage.getItem(IGNITE_KEY); } catch { /* bỏ qua */ }
    if (!shouldIgnite(streakEvent, today, shown)) return;
    try { localStorage.setItem(IGNITE_KEY, today); } catch { /* bỏ qua */ }
    igniting = true;
  });
  const term = (id: string) => concepts.find((c) => c.id === id)?.term ?? id;
  const conceptOf = (id: string) => concepts.find((c) => c.id === id);
  const explainOf = (s: Step) => ('explain' in s.item ? s.item.explain : '');
  const streakMsg = $derived(({ started: 'Bắt đầu chuỗi ngày.', extended: 'Chuỗi +1 ngày.', 'same-day': 'Hôm nay đã tính chuỗi.', froze: 'Bùa giữ chuỗi đã cứu bạn.', reset: 'Chuỗi bắt đầu lại từ 1.' } as Record<StreakEvent, string>)[streakEvent]);
  const action = $derived(endAction({ kind, gate, hasNext: !!onnext, hasAgain: !!onagain, dueNow, next }));
  const handlers: Record<string, (() => void) | undefined> = { get again() { return onagain; }, get next() { return onnext; }, get home() { return onhome; } };
  /** Cuộn tới mục "Xem lại câu sai" (jsdom không có scrollIntoView). */
  let mistakesEl: HTMLElement | undefined = $state();
  function toMistakes() { mistakesEl?.scrollIntoView?.({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' }); }
  const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rate = $derived(summary.total ? summary.correct / summary.total : 0);
  const R = 52, C = 2 * Math.PI * R;
  const recordMsg = $derived(!record ? '' : record.comboBeaten && record.rateBeaten ? 'Kỷ lục phiên mới: cả combo và tỉ lệ đúng.' : record.comboBeaten ? `Kỷ lục combo mới: ${summary.bestCombo} liên tiếp (trước đó ${record.before.bestCombo}).` : record.rateBeaten ? `Kỷ lục tỉ lệ đúng mới: ${Math.round(rate * 100)}% (trước đó ${Math.round(record.before.bestRate * 100)}%).` : '');
</script>

{#snippet btn(b: EndButton, primary: boolean)}
  {#if b.act === 'review'}<a class="btn {primary ? 'primary' : 'ghost'}" href={hashFor('review')}>{b.label}</a>
  {:else}<button class="btn {primary ? 'primary' : 'ghost'}" type="button" onclick={handlers[b.act]}>{b.label}</button>{/if}
{/snippet}
<section class="card session-end" aria-label="Kết thúc phiên">
  <p class="kicker">Xong phiên</p>
  <p class="memory-line">{#if summary.levelUps.length}<b>{summary.levelUps.length} khái niệm nhớ chắc hơn</b> (lên bậc){:else}Chưa khái niệm nào lên bậc phiên này. <span class="muted small">Lên bậc cần nhớ lại qua nhiều lần ôn, không chỉ một phiên.</span>{/if}</p>
  {#if summary.held}<p class="held-note muted small">{summary.held} khái niệm trả lời đúng nhưng giữ bậc: từ bậc 4 cần ôn lại vào một ngày khác mới lên — nhớ qua nhiều ngày mới tính là thuần thục.</p>{/if}
  <div class="end-top">
    <div class="end-ring" role="img" aria-label="Tỉ lệ đúng {Math.round(rate * 100)} phần trăm">
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle class="trk" cx="60" cy="60" r={R} /><circle class="val" cx="60" cy="60" r={R} stroke-dasharray={C} stroke-dashoffset={C * (1 - rate)} transform="rotate(-90 60 60)" style="--c:{C}" /></svg>
      <p class="score"><b>{summary.correct}</b><small>/{summary.total} đúng</small></p>
    </div>
    <div class="end-stats">
      <p class="xp">+<CountUp value={summary.xp} from={0} duration={1100} /> XP</p>
      {#if retryTotal > 0 || (summary.pretest && summary.pretest.total > 0)}
        <dl class="stat-list">
          {#if retryTotal > 0}<div><dt>Sửa được</dt><dd>{summary.fixed ?? 0}/{retryTotal}</dd></div>{/if}
          {#if summary.pretest && summary.pretest.total > 0}<div><dt>Đoán trước đúng</dt><dd>{summary.pretest.correct}/{summary.pretest.total}</dd></div>{/if}
        </dl>
      {/if}
    </div>
  </div>
  {#if recordMsg}<p class="record-msg" role="status"><span class="seal-stamp" aria-hidden="true"><Glyph name="star-fill" size={14} /></span> {recordMsg}</p>{/if}
  {#if promotion}<p class="promotion"><span class="seal-stamp" aria-hidden="true">§</span> Thăng chức: <b>{promotion}</b> <span class="muted small">(chức danh mô phỏng)</span></p>{/if}
  {#if mistakes.length}<p class="end-mistakes"><button class="btn ghost" type="button" onclick={toMistakes}>Xem {mistakes.length} câu sai ↓</button></p>{/if}
  <div class="end-next">
    {#if action.hint}<p class="end-hint">{action.hint}</p>{/if}
    <div class="row">
      {@render btn(action.primary, true)}
      {#each action.secondary as sb (sb.act)}{@render btn(sb, false)}{/each}
    </div>
    {#if gate && !gate.done}
      <p class="gate-note small muted">Đợt sau mở khi cả {gate.total} khái niệm đạt bậc 3 · {LEVEL_NAMES[3]} (còn {gate.remaining}). Mỗi lượt học lại đưa khái niệm lên bậc cao hơn. {#if onnext}<button type="button" class="linklike" onclick={onnext}>Học vượt sang đợt sau</button>{/if}</p>
    {/if}
  </div>
  <p class="streak"><span class="streak-mini" class:away={igniting} bind:this={mini}><StreakCard count={streak} longest={streak} size="mini" /></span> Chuỗi {streak} ngày · {streakMsg}</p>
  {#if igniting}<StreakIgnite count={streak} longest={streak} origin={mini} onclose={() => (igniting = false)} />{/if}
  {#if summary.levelUps.length}
    <h2>Khái niệm lên bậc</h2>
    <ul class="levelups">
      {#each summary.levelUps as u (u.conceptId)}
        <li><span class="seal-stamp" aria-hidden="true">{u.to}</span> {term(u.conceptId)} <span class="muted">→ bậc {u.to} · {LEVEL_NAMES[u.to]}</span></li>
      {/each}
    </ul>
  {/if}
  {#if summary.bestCombo !== undefined || summary.golden || sources.length}
    <details class="end-detail">
      <summary>Chi tiết điểm</summary>
      <dl class="stat-list">
        {#if summary.bestCombo !== undefined}<div><dt>Combo dài nhất</dt><dd>{summary.bestCombo}</dd></div>{/if}
        {#if summary.golden}<div><dt>Câu vàng</dt><dd>{summary.golden}</dd></div>{/if}
      </dl>
      {#if sources.length}
        <ul class="xp-sources" aria-label="XP theo nguồn">
          {#each sources as s (s.key)}
            <li><span>{s.label}</span><b>+{s.xp}</b></li>
          {/each}
        </ul>
      {/if}
    </details>
  {/if}
</section>
{#if mistakes.length}
  <section class="mistakes" aria-label="Xem lại câu sai" bind:this={mistakesEl}>
    <h2>Xem lại câu sai ({mistakes.length})</h2>
    {#each mistakes as m, k (k)}
      {@const c = conceptOf(m.conceptId)}
      {@const rv = reviewTexts(m, concepts)}
      <div class="card item">
        <p class="kicker">{#if c}<a href={hashFor('concepts', { subject: c.subject, concept: c.id })}>{c.term}</a>{:else}{m.conceptId}{/if}</p>
        <b>{rv.prompt}</b>
        {#if m.item.type === 'match' || m.item.type === 'pair' || m.item.type === 'sort'}
          <!-- dạng nhiều dòng: gập gọn, chỉ mở khi cần xem đủ -->
          {@const lines = rv.answer.split('\n')}
          <details class="ans-more"><summary>Đáp án ({lines.length} dòng) — bấm để xem</summary>
            <ul>{#each lines as ln, j (j)}<li>{ln.length > 160 ? ln.slice(0, 157) + '…' : ln}</li>{/each}</ul>
          </details>
        {:else}<p class="ans">Đáp án: {rv.answer}</p>{/if}
        {#if explainOf(m)}<p>{explainOf(m)}</p>{/if}
      </div>
    {/each}
  </section>
{/if}
