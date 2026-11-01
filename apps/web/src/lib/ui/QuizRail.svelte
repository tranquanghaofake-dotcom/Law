<script lang="ts">
  import { hashFor } from '$lib/router.svelte';
  let { done, perfect, total, retry }: { done: number; perfect: number; total: number; retry: { id: string; title: string; best: number; count: number } | null } = $props();
</script>

<section class="rail-block">
  <p class="kicker">Đã làm</p>
  <p class="rail-big">{done}<span class="muted small">/{total} đề</span></p>
  <p class="muted small">{perfect} đề đạt điểm tối đa</p>
</section>
{#if retry}
  <section class="rail-block">
    <p class="kicker">Nên làm lại</p>
    <p><a href={hashFor('quiz', { id: retry.id })}>{retry.title}</a> <span class="muted small">— {retry.best}/{retry.count}</span></p>
  </section>
{/if}
