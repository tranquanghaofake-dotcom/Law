<script lang="ts">
  // Lưới bậc kiểu Khan Academy: mỗi đợt một hàng, mỗi khái niệm một ô tô theo bậc 0–6 (spec §4.2).
  import type { Level, Subject } from '$lib/content/types';
  import { hashFor } from '$lib/router.svelte';
  import { LEVEL_NAMES } from '$lib/game/levels';
  import type { LessonSt } from './lessonState';
  import Emblem from '$lib/art/Emblem.svelte';
  import { emblemFor } from '$lib/art/registry';
  let { subject, levels, terms, states }: { subject: Subject; levels: Record<string, Level>; terms: Record<string, string>; states: Record<string, LessonSt> } = $props();

  function onclick(e: MouseEvent, st: LessonSt) {
    if (st === 'locked' && !confirm('Đợt này nằm sau đợt đang học. Thi vượt?')) e.preventDefault();
  }
</script>

<div class="mastery">
  {#each subject.chapters as ch (ch.id)}
    <p class="kicker chapter" id="chapter-{ch.id}"><Emblem name={emblemFor(subject.id, ch.id)} size={42} /><span class="chapter-title">{ch.title}</span>{#if ch.advanced} <span class="advanced-tag" title="Ngoài giáo trình">Nâng cao</span>{/if}</p>
    <ol class="lesson-rows">
      {#each ch.lessons as l (l.id)}
        {@const st = states[l.id] ?? 'locked'}
        <li class="lesson-row {st}" id="lesson-{l.id}">
          <div class="head">
            <a href={hashFor('lesson', { subject: subject.id, lesson: l.id })} onclick={(e) => onclick(e, st)}>{l.title}</a>
            {#if st === 'current'}<span class="next-tag">TIẾP THEO CHO BẠN</span>{:else if st === 'done'}<span class="muted small">✓ đã qua</span>{/if}
          </div>
          <ul class="cells" aria-label="Bậc từng khái niệm của đợt {l.title}">
            {#each l.concepts as c (c)}
              {@const lv = levels[c] ?? 0}
              <li><a class="cell-item" href={hashFor('concepts', { subject: subject.id, concept: c })} title="{terms[c] ?? c} · bậc {lv} · {LEVEL_NAMES[lv]}" aria-label="{terms[c] ?? c}: bậc {lv}, {LEVEL_NAMES[lv]}"><span class="cell lv{lv}" aria-hidden="true"></span><span class="cell-term" aria-hidden="true">{terms[c] ?? c}</span></a></li>
            {/each}
          </ul>
        </li>
      {/each}
    </ol>
  {/each}
</div>
