<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  import type { Snippet } from 'svelte';
  import type { RouteName } from '$lib/router.svelte';
  import { NAV, activeNav } from './nav';
  import { header } from './header.svelte';
  import { rail } from './rail.svelte';
  import { careerState, displayTitle } from '$lib/game/career';
  import { shelf } from './shelf.svelte';
  import { career } from './career.svelte';
  import { storage } from '$lib/store/status.svelte';
  import StreakFlame from './StreakFlame.svelte';
  import StreakCard from '$lib/art/StreakCard.svelte';
  import RankBadge from './RankBadge.svelte';
  import Icon from '$lib/art/Icon.svelte';
  import Bookshelf from './Bookshelf.svelte';

  let { active, children }: { active: RouteName; children: Snippet } = $props();
  const current = $derived(activeNav(active));
  const cs = $derived(careerState(shelf.books));
  const title = $derived(displayTitle(cs, career.branch));
  const nextPost = $derived(cs.next[career.branch]?.post.title ?? null);
  const Rail = $derived(rail.current?.component);
  const railProps = $derived(rail.current?.props ?? {});
</script>

<div class="shell" class:has-rail={!!Rail}>
  <header class="topbar">
    <a class="brand" href="#/"><span class="mark" aria-hidden="true">§</span> Luyện Luật</a>
    <div class="meta"><StreakFlame count={header.streak} longest={header.longest} /><RankBadge /></div>
  </header>

  <nav class="sidenav" aria-label="Điều hướng chính">
    <a class="brand" href="#/"><span class="mark" aria-hidden="true">§</span><span class="name"> Luyện Luật</span></a>
    <ul>
      {#each NAV as n (n.name)}
        <li><a class="item" class:on={current === n.name} href={n.href} aria-current={current === n.name ? 'page' : undefined}>
          <span class="ico"><Icon name={n.name} /></span><span class="lbl">{n.label}</span></a></li>
      {/each}
    </ul>
    <div class="side-shelf"><p class="kicker">Tủ sách</p><Bookshelf size="side" /></div>
    <a class="me" href="#/toi">
      <span class="flame" class:cold={header.streak === 0}><StreakCard count={header.streak} longest={header.longest} size="mini" /><span class="sr-only">Chuỗi </span>{header.streak}<span class="sr-only"> ngày,</span></span>
      <span class="rank"><span class="seal" aria-hidden="true">§</span><span class="rank-title">{title.title}</span></span>
      {#if nextPost}<span class="xp-line muted">kế tiếp: {nextPost}</span>{/if}
    </a>
  </nav>

  <main class="content" id="main" tabindex="-1">
    {#if !storage.available}
      <p class="banner" role="alert">⚠ Trình duyệt đang chặn lưu trữ (chế độ riêng tư?). Bạn vẫn học được nhưng tiến độ sẽ mất khi đóng tab.</p>
    {/if}
    {@render children()}
  </main>

  {#if Rail}
    <aside class="rail" aria-label="Thông tin thêm"><Rail {...railProps} /></aside>
  {/if}


  <nav class="tabbar" aria-label="Điều hướng chính">
    {#each NAV as n (n.name)}
      <a class:on={current === n.name} href={n.href} aria-current={current === n.name ? 'page' : undefined}>
        <span class="ico"><Icon name={n.name} /></span><span class="lbl">{n.label}</span></a>
    {/each}
  </nav>
</div>
