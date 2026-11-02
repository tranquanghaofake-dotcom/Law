<script lang="ts">
  // Rail phải trang môn: ôn của môn, sách của môn (thay phẩm hàm), khái niệm khó.
  import { hashFor } from '$lib/router.svelte';
  import { shelf, refreshShelf } from './shelf.svelte';
  let { subjectId, due, difficult }: { subjectId: string; due: number; difficult: { id: string; term: string }[] } = $props();
  if (!shelf.ready) refreshShelf();
  const books = $derived(shelf.books.filter((b) => b.subject === subjectId));
  const by = (lv: number) => books.filter((b) => b.level >= lv).length;
</script>

<section class="rail-block">
  <p class="kicker">Ôn của môn</p>
  <p class="rail-big">{due} <span class="muted small">khái niệm đến hạn</span></p>
  {#if due}<a class="small" href={hashFor('review', { subject: subjectId })}>Ôn ngay →</a>{/if}
</section>
<section class="rail-block">
  <p class="kicker">Sách của môn</p>
  <p class="rail-big">{by(1)}/{books.length} <span class="muted small">chương có sách</span></p>
  <p class="muted small">cấp 2: {by(2)} · cấp 3: {by(3)}</p>
  <a class="small" href={hashFor('profile')}>Xem tủ sách →</a>
</section>
{#if difficult.length}
  <section class="rail-block">
    <p class="kicker">Khái niệm khó</p>
    <ul class="plain-list">{#each difficult as d (d.id)}<li><a href={hashFor('concepts', { subject: subjectId, concept: d.id })}>{d.term}</a></li>{/each}</ul>
  </section>
{/if}
