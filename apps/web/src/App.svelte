<script lang="ts">
  import type { Component } from 'svelte';
  import { route, type RouteName } from '$lib/router.svelte';
  import { settings, loadSettings } from '$lib/store/settings.svelte';
  import Shell from '$lib/ui/Shell.svelte';
  import Glyph from '$lib/art/Glyph.svelte';
  import Home from './routes/Home.svelte';
  import Subjects from './routes/Subjects.svelte';
  import Subject from './routes/Subject.svelte';
  import Quizzes from './routes/Quizzes.svelte';
  import NotFound from './routes/NotFound.svelte';
  import { storage } from '$lib/store/status.svelte';
  import KitDefs from '$lib/art/kit/KitDefs.svelte';

  // Màn tải ngay: vào app là thấy, không chờ mạng. Các màn nặng ít dùng ngay tách chunk theo route (import động).
  const eager: Partial<Record<RouteName, Component>> = {
    home: Home, subjects: Subjects, subject: Subject, quizzes: Quizzes, notfound: NotFound,
  };
  type Loader = () => Promise<{ default: Component }>;
  const lazy: Partial<Record<RouteName, Loader>> = {
    concepts: () => import('./routes/Concepts.svelte'),
    lesson: () => import('./routes/Lesson.svelte'),
    review: () => import('./routes/Review.svelte'),
    quiz: () => import('./routes/Quiz10.svelte'),
    profile: () => import('./routes/Profile.svelte'),
    settings: () => import('./routes/Profile.svelte'),
  };
  // Promise chỉ có khi route là màn lazy; đổi route thì derived tạo lại.
  const pending = $derived(lazy[route.name]?.());
  // Trong phiên học shell ẩn hoàn toàn: một màn một việc (spec §2.4).
  const inSession = $derived(route.name === 'lesson' || route.name === 'review' || route.name === 'quiz');

  $effect(() => {
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion === 'on');
    document.documentElement.classList.toggle('motion-on', settings.reducedMotion === 'off');
  });
  loadSettings();
</script>

{#snippet view()}
  {#if pending}
    {#await pending}
      <p class="loading">Đang tải…</p>
    {:then m}
      {@const Lazy = m.default}
      <Lazy />
    {:catch}
      <section class="card"><p class="muted">Không tải được màn này. Thử tải lại trang.</p></section>
    {/await}
  {:else}
    {@const Eager = eager[route.name] ?? NotFound}
    <Eager />
  {/if}
{/snippet}

{#if inSession}
  {#if !storage.available}
    <p class="banner" role="alert"><Glyph name="warn" size={16} /> Trình duyệt đang chặn lưu trữ (chế độ riêng tư?). Bạn vẫn học được nhưng tiến độ sẽ mất khi đóng tab.</p>
  {/if}
  <main class="layout" class:with-aside={route.name === 'lesson' || route.name === 'review'} id="main" tabindex="-1">
    {@render view()}
  </main>
{:else}
  <Shell active={route.name}>
    {@render view()}
  </Shell>
{/if}

<KitDefs />
