<script lang="ts">
  // Phần "Điểm yếu" ở Hồ sơ (spec 2026-11-07-ban-do-diem-yeu): tối đa 3 bài sai nhiều nhất trong 90 ngày + tỷ lệ đúng theo bậc.
  import { LEVEL_NAMES } from '$lib/game/levels';
  import type { WeakData } from './weak';
  let { data, ready = true }: { data: WeakData; ready?: boolean } = $props();
  const pct = (r: number) => `${Math.round(r * 100)}%`;
</script>

<div class="wk">
  {#if !ready}
    <p class="muted small">Đang tính…</p>
  {:else if !data.items.length}
    <p class="empty muted">Làm thêm ít nhất 5 câu trong một bài để xem điểm yếu.</p>
  {:else}
    <p class="kicker">Bài hay sai nhất · 90 ngày gần đây</p>
    <ol class="wk-list">
      {#each data.items as w (w.subject + '/' + w.lesson)}
        <li class="wk-item">
          <div class="wk-txt">
            <span class="wk-sub small muted">{w.short}</span>
            <b class="wk-title">{w.lessonTitle}</b>
            <span class="wk-rate small">{w.correct}/{w.tries} đúng ({pct(w.rate)})</span>
          </div>
          <a class="btn ghost wk-go" href={w.href}>Ôn bài này</a>
        </li>
      {/each}
    </ol>
  {/if}
  {#if ready && data.levels.length}
    <p class="kicker wk-k">Tỷ lệ đúng theo bậc</p>
    <ul class="wk-lv">
      {#each data.levels as l (l.level)}
        <li><span class="small">{l.level} · {LEVEL_NAMES[l.level]}</span><span class="sp-bar"><span class="cell lv{l.level}" style="width:{Math.max(3, l.rate * 100)}%"></span></span><b class="small">{pct(l.rate)}</b></li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .wk-list { list-style: none; margin: var(--sp-2) 0 0; padding: 0; display: grid; gap: var(--sp-2); }
  .wk-item { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-3); padding: var(--sp-2) 0; border-bottom: 1px solid var(--line); }
  .wk-txt { display: grid; gap: 2px; min-width: 0; }
  .wk-title { overflow-wrap: anywhere; }
  .wk-rate { color: var(--bad); }
  .wk-go { flex: none; }
  .wk-k { margin-top: var(--sp-4); }
  .wk-lv { list-style: none; margin: var(--sp-2) 0 0; padding: 0; display: grid; gap: 6px; }
  .wk-lv li { display: grid; grid-template-columns: 9rem 1fr 3rem; align-items: center; gap: var(--sp-2); }
  .wk-lv b { text-align: right; }
</style>
