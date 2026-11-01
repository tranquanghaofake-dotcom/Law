<script lang="ts">
  import type { Level, Subject } from '$lib/content/types';
  import { hashFor } from '$lib/router.svelte';
  import { lessonStates, type LessonSt as St } from '$lib/ui/lessonState';
  let { subject, levels, grade }: { subject: Subject; levels: Record<string, Level>; grade: string | null } = $props();

  const states = $derived(lessonStates(subject, levels));
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
        {@const st = states[l.id]}
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
