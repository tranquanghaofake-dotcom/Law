<script lang="ts">
  // Rail phải trang môn (≥ 1440): ôn của môn, phẩm kế tiếp, khái niệm khó (spec §4.2).
  import { hashFor } from '$lib/router.svelte';
  let { subjectId, due, nextGrade, needForNext, difficult }: { subjectId: string; due: number; nextGrade: string | null; needForNext: number; difficult: { id: string; term: string }[] } = $props();
</script>

<section class="rail-block">
  <p class="kicker">Ôn của môn này</p>
  <p class="rail-big">{due} <span class="muted small">khái niệm</span></p>
  {#if due}<a class="small" href={hashFor('review', { subject: subjectId })}>Ôn ngay →</a>{/if}
</section>
{#if nextGrade}
  <section class="rail-block">
    <p class="kicker">Phẩm hàm kế tiếp</p>
    <p><b>{nextGrade}</b> <span class="muted small">— thêm {needForNext} khái niệm thuần thục (bậc ≥ 5)</span></p>
  </section>
{/if}
{#if difficult.length}
  <section class="rail-block">
    <p class="kicker">Khái niệm khó</p>
    <ul class="plain-list">{#each difficult as d (d.id)}<li><a href={hashFor('concepts', { subject: subjectId, concept: d.id })}>{d.term}</a></li>{/each}</ul>
  </section>
{/if}
