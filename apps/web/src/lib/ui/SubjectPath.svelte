<script lang="ts">
  import type { Level, Subject } from '$lib/content/types';
  import { hashFor } from '$lib/router.svelte';
  let { subject, levels, grade }: { subject: Subject; levels: Record<string, Level>; grade: string | null } = $props();

  type St = 'done' | 'current' | 'locked';
  const lessons = $derived(subject.chapters.flatMap((ch) => ch.lessons.map((l) => ({ ...l, chapter: ch.title }))));
  const states = $derived.by(() => {
    const out: St[] = [];
    let currentFound = false;
    for (const l of lessons) {
      const done = l.concepts.every((c) => (levels[c] ?? 0) >= 3);
      if (done) out.push('done');
      else if (!currentFound) { out.push('current'); currentFound = true; }
      else out.push('locked');
    }
    return out;
  });
  function onclick(e: MouseEvent, st: St) {
    if (st === 'locked' && !confirm('Đợt này nằm sau đợt đang học. Thi vượt?')) e.preventDefault();
  }
</script>

<section class="subject">
  <h2>{subject.title} {#if grade}<span class="chip">{grade}</span>{/if}</h2>
  {#each subject.chapters as ch (ch.id)}
    <p class="kicker">{ch.title}</p>
    <ol class="path">
      {#each ch.lessons as l (l.id)}
        {@const st = states[lessons.findIndex((x) => x.id === l.id)]}
        <li>
          <a class="node {st}" href={hashFor('lesson', { subject: subject.id, lesson: l.id })} onclick={(e) => onclick(e, st)} aria-label="{l.title} — {st === 'done' ? 'đã xong' : st === 'current' ? 'đang học' : 'chưa mở'}">
            <span class="dot" aria-hidden="true">{st === 'done' ? '✓' : st === 'current' ? '▶' : '·'}</span>
            <span class="label"><b>{l.title}</b><span class="muted small">{l.concepts.length} khái niệm</span></span>
          </a>
        </li>
      {/each}
    </ol>
  {/each}
</section>
