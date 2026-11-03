<script lang="ts">
  import StreakCard from '$lib/art/StreakCard.svelte';
  import type { Concept, Level } from '$lib/content/types';
  import type { StreakEvent } from '$lib/game/streak';
  import type { RankInfo } from '$lib/game/rank';
  import type { Step } from '$lib/engine/session';
  import { hashFor } from '$lib/router.svelte';
  import { LEVEL_NAMES } from '$lib/game/levels';
  import { reviewTexts } from './cards/answer';
  import type { XpSource } from './session/xpSources';
  let { summary, concepts, streak, streakEvent, dueTomorrow, onhome, onagain, onnext, mistakes = [], promotion = null, sources = [], record = null, retryTotal: retryProp = 0 }: {
    summary: { correct: number; total: number; xp: number; levelUps: { conceptId: string; to: Level }[]; bestCombo?: number; golden?: number; fixed?: number; retried?: number };
    concepts: Concept[]; streak: number; streakEvent: StreakEvent; rankBefore: RankInfo; rankAfter: RankInfo; dueTomorrow: number;
    onhome: () => void; onagain?: () => void; onnext?: () => void; mistakes?: Step[]; promotion?: string | null;
    /** XP chia theo nguồn */
    sources?: XpSource[];
    /** kỷ lục phiên (localStorage): cờ phá kỷ lục kèm kỷ lục cũ */
    record?: { comboBeaten: boolean; rateBeaten: boolean; before: { bestCombo: number; bestRate: number } } | null;
    /** số câu bước vào vòng sửa sai (mẫu số của "sửa được x/y") */
    retryTotal?: number;
  } = $props();
  const retryTotal = $derived(retryProp || summary.retried || 0);
  const term = (id: string) => concepts.find((c) => c.id === id)?.term ?? id;
  const conceptOf = (id: string) => concepts.find((c) => c.id === id);
  const explainOf = (s: Step) => ('explain' in s.item ? s.item.explain : '');
  const streakMsg = $derived(({ started: 'Bắt đầu chuỗi ngày.', extended: 'Chuỗi +1 ngày.', 'same-day': 'Hôm nay đã tính chuỗi.', froze: 'Bùa giữ chuỗi đã cứu bạn.', reset: 'Chuỗi bắt đầu lại từ 1.' } as Record<StreakEvent, string>)[streakEvent]);
  const rate = $derived(summary.total ? summary.correct / summary.total : 0);
  const R = 52, C = 2 * Math.PI * R;
  const maxSrc = $derived(Math.max(1, ...sources.map((s) => s.xp)));
  const recordMsg = $derived(!record ? '' : record.comboBeaten && record.rateBeaten ? 'Kỷ lục phiên mới: cả combo và tỉ lệ đúng.' : record.comboBeaten ? `Kỷ lục combo mới: ${summary.bestCombo} liên tiếp (trước đó ${record.before.bestCombo}).` : record.rateBeaten ? `Kỷ lục tỉ lệ đúng mới: ${Math.round(rate * 100)}% (trước đó ${Math.round(record.before.bestRate * 100)}%).` : '');
</script>

<section class="card session-end" aria-label="Kết thúc phiên">
  <p class="kicker">Xong phiên</p>
  <div class="end-top">
    <div class="end-ring" role="img" aria-label="Tỉ lệ đúng {Math.round(rate * 100)} phần trăm">
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle class="trk" cx="60" cy="60" r={R} /><circle class="val" cx="60" cy="60" r={R} stroke-dasharray={C} stroke-dashoffset={C * (1 - rate)} transform="rotate(-90 60 60)" style="--c:{C}" /></svg>
      <p class="score"><b>{summary.correct}</b><small>/{summary.total} đúng</small></p>
    </div>
    <div class="end-stats">
      <p class="xp">+{summary.xp} XP</p>
      <dl class="stat-list">
        {#if summary.bestCombo !== undefined}<div><dt>Combo dài nhất</dt><dd>{summary.bestCombo}</dd></div>{/if}
        {#if summary.golden}<div><dt>Câu vàng</dt><dd>{summary.golden}</dd></div>{/if}
        {#if retryTotal > 0}<div><dt>Sửa được</dt><dd>{summary.fixed ?? 0}/{retryTotal}</dd></div>{/if}
        <div><dt>Tỉ lệ đúng</dt><dd>{Math.round(rate * 100)}%</dd></div>
      </dl>
    </div>
  </div>
  {#if recordMsg}<p class="record-msg" role="status"><span class="seal-stamp" aria-hidden="true">★</span> {recordMsg}</p>{/if}
  {#if sources.length}
    <ul class="xp-sources" aria-label="XP theo nguồn">
      {#each sources as s (s.key)}
        <li><span>{s.label}</span><i aria-hidden="true"><span style="width:{(s.xp / maxSrc) * 100}%"></span></i><b>+{s.xp}</b></li>
      {/each}
    </ul>
  {/if}
  {#if promotion}<p class="promotion"><span class="seal-stamp" aria-hidden="true">§</span> Thăng chức: <b>{promotion}</b> <span class="muted small">(chức danh mô phỏng)</span></p>{/if}
  <p class="streak"><StreakCard count={streak} longest={streak} size="mini" /> Chuỗi {streak} ngày · {streakMsg}</p>
  {#if summary.levelUps.length}
    <h2>Khái niệm lên bậc</h2>
    <ul class="levelups">
      {#each summary.levelUps as u (u.conceptId)}
        <li><span class="seal-stamp" aria-hidden="true">{u.to}</span> {term(u.conceptId)} <span class="muted">→ bậc {u.to} · {LEVEL_NAMES[u.to]}</span></li>
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
