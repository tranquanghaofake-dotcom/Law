<script lang="ts">
  import type { Concept, Level } from '$lib/content/types';
  let { concepts, levels, current }: { concepts: Concept[]; levels: Record<string, Level>; current: string } = $props();
  const NAMES = ['Chưa gặp', 'Gặp', 'Nhận biết', 'Phân biệt', 'Điền', 'Tình huống', 'Tự trả lời', 'Thuần thục'];
</script>

<aside class="aside lesson-panel" aria-label="Khái niệm trong đợt">
  <p class="kicker">Đợt này</p>
  <ul>
    {#each concepts as c (c.id)}
      {@const lv = levels[c.id] ?? 0}
      <li class:current={c.id === current}>
        <span class="ring" style="--p:{(lv / 6) * 100}" role="img" aria-label="Bậc {lv} trên 6"><b>{lv}</b></span>
        <span class="info"><span class="term">{c.term}</span><span class="muted small">{NAMES[lv + 1 - (lv === 0 ? 1 : 0)] ?? ''}</span></span>
      </li>
    {/each}
  </ul>
  <p class="muted small">Bậc 0–6: mỗi lần đúng lên một bậc, sai tụt một bậc. Bậc 6 vào vòng ôn.</p>
</aside>
