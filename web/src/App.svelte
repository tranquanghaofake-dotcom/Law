<script lang="ts">
  import { route } from '$lib/router.svelte';
  import { settings, loadSettings } from '$lib/store/settings.svelte';
  import RankBadge from '$lib/ui/RankBadge.svelte';
  import StreakFlame from '$lib/ui/StreakFlame.svelte';
  import Home from './routes/Home.svelte';
  import Lesson from './routes/Lesson.svelte';
  import Review from './routes/Review.svelte';
  import Quiz10 from './routes/Quiz10.svelte';
  import Profile from './routes/Profile.svelte';
  import Settings from './routes/Settings.svelte';
  import { header } from '$lib/ui/header.svelte';

  const views = { home: Home, lesson: Lesson, review: Review, quiz: Quiz10, profile: Profile, settings: Settings } as const;
  const View = $derived(views[route.name]);
  const inSession = $derived(route.name === 'lesson' || route.name === 'review' || route.name === 'quiz');

  $effect(() => {
    document.documentElement.dataset.theme = settings.theme === 'auto' ? '' : settings.theme;
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion === 'on');
    document.documentElement.classList.toggle('motion-on', settings.reducedMotion === 'off');
  });
  loadSettings();
</script>

<header class="top">
  <a class="brand" href="#/"><span class="mark" aria-hidden="true">§</span> Luyện Luật</a>
  {#if !inSession}
    <nav class="meta" aria-label="Tiến độ">
      <StreakFlame count={header.streak} />
      <RankBadge xp={header.xp} />
      <a class="rank" href="#/cai-dat" aria-label="Cài đặt" title="Cài đặt">⚙</a>
    </nav>
  {/if}
</header>
<main class="layout" class:with-aside={route.name === 'lesson' || route.name === 'review'} id="main" tabindex="-1">
  <View />
</main>
<footer class="foot muted" style="max-width:1100px;margin:24px auto;padding:0 16px;font-size:13px">
  <p><strong>Thông tin pháp luật chung, không phải tư vấn pháp lý.</strong> Nội dung do Trần Quang Hào, sinh viên Luật Kinh tế, biên soạn từ văn bản pháp luật hiện hành; luôn đối chiếu nguyên văn trước khi áp dụng cho trường hợp cụ thể.</p>
</footer>
