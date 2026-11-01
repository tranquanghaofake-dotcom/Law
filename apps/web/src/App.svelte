<script lang="ts">
  import { route } from '$lib/router.svelte';
  import { settings, loadSettings } from '$lib/store/settings.svelte';
  import Shell from '$lib/ui/Shell.svelte';
  import Home from './routes/Home.svelte';
  import Subjects from './routes/Subjects.svelte';
  import Subject from './routes/Subject.svelte';
  import Quizzes from './routes/Quizzes.svelte';
  import Lesson from './routes/Lesson.svelte';
  import Review from './routes/Review.svelte';
  import Quiz10 from './routes/Quiz10.svelte';
  import Profile from './routes/Profile.svelte';
  import { storage } from '$lib/store/status.svelte';

  const views = { home: Home, subjects: Subjects, subject: Subject, quizzes: Quizzes, lesson: Lesson, review: Review, quiz: Quiz10, profile: Profile, settings: Profile } as const;
  const View = $derived(views[route.name]);
  // Trong phiên học shell ẩn hoàn toàn: một màn một việc (spec §2.4).
  const inSession = $derived(route.name === 'lesson' || route.name === 'review' || route.name === 'quiz');

  $effect(() => {
    document.documentElement.dataset.theme = settings.theme === 'auto' ? '' : settings.theme;
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion === 'on');
    document.documentElement.classList.toggle('motion-on', settings.reducedMotion === 'off');
  });
  loadSettings();
</script>

{#if inSession}
  {#if !storage.available}
    <p class="banner" role="alert">⚠ Trình duyệt đang chặn lưu trữ (chế độ riêng tư?). Bạn vẫn học được nhưng tiến độ sẽ mất khi đóng tab.</p>
  {/if}
  <main class="layout" class:with-aside={route.name === 'lesson' || route.name === 'review'} id="main" tabindex="-1">
    <View />
  </main>
{:else}
  <Shell active={route.name}>
    <View />
  </Shell>
{/if}
