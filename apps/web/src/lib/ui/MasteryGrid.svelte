<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  // Lưới bậc kiểu Khan Academy: mỗi đợt một hàng, mỗi khái niệm một ô tô theo bậc 0–6 (spec §4.2).
  import type { Level, Subject } from '$lib/content/types';
  import { hashFor } from '$lib/router.svelte';
  import { LEVEL_NAMES } from '$lib/game/levels';
  import type { LessonSt } from './lessonState';
  import Emblem from '$lib/art/Emblem.svelte';
  import { emblemFor } from '$lib/art/registry';
  let { subject, levels, terms, states }: { subject: Subject; levels: Record<string, Level>; terms: Record<string, string>; states: Record<string, LessonSt> } = $props();

  import Sheet from './Sheet.svelte';
  // Đợt chưa tới lượt: hỏi bằng hộp trong app (SJ-6) thay confirm() gốc của trình duyệt.
  let skipTo = $state<{ id: string; title: string } | null>(null);
  let skipOpen = $state(false);
  const current = $derived(subject.chapters.flatMap((c) => c.lessons).find((l) => states[l.id] === 'current'));
  function onclick(e: MouseEvent, st: LessonSt, l: { id: string; title: string }) {
    if (st !== 'locked') return;
    e.preventDefault();
    skipTo = l; skipOpen = true;
  }
</script>

<div class="mastery">
  {#each subject.chapters as ch (ch.id)}
    <h2 class="chapter" id="chapter-{ch.id}"><Emblem name={emblemFor(subject.id, ch.id)} size={42} /><span class="chapter-title">{ch.title}</span>{#if ch.advanced} <span class="advanced-tag" title="Ngoài giáo trình">Nâng cao</span>{/if}</h2>
    <ol class="lesson-rows">
      {#each ch.lessons as l (l.id)}
        {@const st = states[l.id] ?? 'locked'}
        <li class="lesson-row {st}" id="lesson-{l.id}">
          <div class="head">
            <h3 class="lesson-h"><a href={hashFor('lesson', { subject: subject.id, lesson: l.id })} onclick={(e) => onclick(e, st, l)}>{l.title}</a></h3>
            {#if st === 'locked'}<span class="locked-tag">Chưa mở</span>{:else if st === 'current'}<span class="next-tag">Tiếp theo cho bạn</span>{:else if st === 'done'}<span class="muted small"><Glyph name="check" size={14} /> đã qua</span>{/if}
          </div>
          <ul class="cells" aria-label="Bậc từng khái niệm của đợt {l.title}">
            {#each l.concepts as c (c)}
              {@const lv = levels[c] ?? 0}
              <li><a class="cell-item" href={hashFor('concepts', { subject: subject.id, concept: c })} title="{terms[c] ?? c} · bậc {lv} · {LEVEL_NAMES[lv]}"><span class="cell cell-n lv{lv}" aria-hidden="true">{lv}</span><span class="cell-term">{terms[c] ?? c}</span><span class="sr-only">, bậc {lv}, {LEVEL_NAMES[lv]}</span></a></li>
            {/each}
          </ul>
        </li>
      {/each}
    </ol>
  {/each}
</div>

<Sheet bind:open={skipOpen} title="Đợt này chưa tới lượt">
  {#if skipTo}
    <p>«{skipTo.title}» nằm sau đợt bạn đang học{#if current} («{current.title}»){/if}. Học vượt vẫn được — tiến độ các đợt trước giữ nguyên, bạn quay lại học chúng lúc nào cũng được.</p>
    <div class="row">
      <!-- svelte-ignore a11y_autofocus -->
      <button type="button" class="btn ghost" autofocus onclick={() => (skipOpen = false)}>Ở lại</button>
      <a class="btn primary" href={hashFor('lesson', { subject: subject.id, lesson: skipTo.id })} onclick={() => (skipOpen = false)}>Học vượt →</a>
    </div>
  {/if}
</Sheet>
