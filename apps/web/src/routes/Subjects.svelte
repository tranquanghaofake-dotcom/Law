<script lang="ts">
  // Danh sách môn (tạm, Task 6 hoàn thiện theo spec §4.1).
  import type { ContentIndex } from '$lib/content/types';
  import { loadIndex } from '$lib/content/loader';
  import { hashFor } from '$lib/router.svelte';
  let index = $state<ContentIndex | null>(null);
  document.title = 'Môn học · Luyện Luật';
  loadIndex().then((i) => (index = i));
</script>

<h1>Môn học</h1>
{#if !index}
  <p class="loading">Đang tải…</p>
{:else}
  <div class="sets">
    {#each index.subjects.filter((s) => (index?.conceptCount[s.id] ?? 0) > 0) as s (s.id)}
      <a class="set" href={hashFor('subject', { subject: s.id })}>
        <div><span class="chip">{s.short}</span><h3>{s.title}</h3></div>
        <span class="meta">{index.conceptCount[s.id]} khái niệm</span>
        <p>Vào môn →</p>
      </a>
    {/each}
  </div>
{/if}
