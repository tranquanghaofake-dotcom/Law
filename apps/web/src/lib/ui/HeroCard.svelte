<script lang="ts">
  import type { HeroState } from './today';
  import { hashFor } from '$lib/router.svelte';
  let { state }: { state: HeroState } = $props();
  const lessonHref = (s: Extract<HeroState, { lesson: unknown }>) => hashFor('lesson', { subject: s.subject.id, lesson: s.lesson.id });
</script>

<section class="card hero-card {state.kind}" aria-labelledby="hero-kicker">
  {#if state.kind === 'due'}
    <p class="kicker" id="hero-kicker">ÔN HÔM NAY</p>
    <p class="headline"><span class="big">{state.count}</span><span>khái niệm sắp quên · ~{state.minutes} phút</span></p>
    {#if state.terms.length}<p class="terms">{#each state.terms as t (t)}<span class="chip">{t}</span>{/each}</p>{/if}
    <a class="btn primary" href={hashFor('review')}>Ôn ngay →</a>
  {:else if state.kind === 'continue'}
    <p class="kicker" id="hero-kicker">TIẾP TỤC</p>
    <p class="headline"><b>{state.subject.title} › {state.lesson.title}</b></p>
    <p class="progress-line"><span class="bar" aria-hidden="true"><span style="width:{(state.done / state.total) * 100}%"></span></span><span class="muted">{state.done}/{state.total} khái niệm đã nhớ</span></p>
    <a class="btn primary" href={lessonHref(state)}>Học tiếp →</a>
  {:else if state.kind === 'next'}
    <p class="kicker" id="hero-kicker">ĐỢT MỚI</p>
    <p class="headline"><b>{state.subject.title} › {state.lesson.title}</b></p>
    <p class="muted">{state.lesson.concepts.length} khái niệm · ~{state.minutes} phút</p>
    <a class="btn primary" href={lessonHref(state)}>Bắt đầu →</a>
  {:else if state.kind === 'start'}
    <p class="kicker" id="hero-kicker">BẮT ĐẦU</p>
    <p class="headline"><b>{state.subject.title} › {state.lesson.title}</b></p>
    <p class="muted">Mỗi khái niệm đi qua 6 bậc: gặp → nhận biết → phân biệt → điền → tình huống → tự trả lời. Ôn đúng lúc sắp quên.</p>
    <a class="btn primary" href={lessonHref(state)}>Học đợt đầu tiên →</a>
  {:else}
    <p class="kicker" id="hero-kicker">ĐÃ HỌC HẾT</p>
    <p class="headline"><b>Bạn đã học hết các đợt hiện có.</b></p>
    <p class="muted">Lịch ôn sẽ gọi bạn khi khái niệm sắp quên. <a href={hashFor('subjects')}>Xem môn →</a></p>
  {/if}
</section>
