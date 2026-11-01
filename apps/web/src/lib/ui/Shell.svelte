<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  import type { Snippet } from 'svelte';
  import type { RouteName } from '$lib/router.svelte';
  import { NAV, activeNav } from './nav';
  import { header } from './header.svelte';
  import { rail } from './rail.svelte';
  import { rankFor, RANKS } from '$lib/game/rank';
  import { storage } from '$lib/store/status.svelte';
  import StreakFlame from './StreakFlame.svelte';
  import RankBadge from './RankBadge.svelte';
  import Icon from '$lib/art/Icon.svelte';
  import Bookshelf from './Bookshelf.svelte';

  let { active, children }: { active: RouteName; children: Snippet } = $props();
  const current = $derived(activeNav(active));
  const info = $derived(rankFor(header.xp));
  const Rail = $derived(rail.current?.component);
  const railProps = $derived(rail.current?.props ?? {});
</script>

<div class="shell" class:has-rail={!!Rail}>
  <header class="topbar">
    <a class="brand" href="#/"><span class="mark" aria-hidden="true">§</span> Luyện Luật</a>
    <div class="meta"><StreakFlame count={header.streak} /><RankBadge xp={header.xp} /></div>
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
      <span class="flame" class:cold={header.streak === 0}><Glyph name="flame" size={16} /><span class="sr-only">Chuỗi </span>{header.streak}<span class="sr-only"> ngày,</span></span>
      <span class="rank"><span class="seal" aria-hidden="true">§</span><span>{info.rank}</span> <span class="tier">{info.tier}</span></span>
      {#if info.nextXp}<span class="xp-line muted">còn {info.nextXp - header.xp} XP tới {RANKS[info.index + 1].name}</span>{/if}
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

  <footer class="foot muted">
    <p><strong>Thông tin pháp luật chung, không phải tư vấn pháp lý.</strong> Nội dung do Trần Quang Hào, sinh viên Luật Kinh tế, biên soạn từ văn bản pháp luật hiện hành; luôn đối chiếu nguyên văn trước khi áp dụng cho trường hợp cụ thể.</p>
  </footer>

  <nav class="tabbar" aria-label="Điều hướng chính">
    {#each NAV as n (n.name)}
      <a class:on={current === n.name} href={n.href} aria-current={current === n.name ? 'page' : undefined}>
        <span class="ico"><Icon name={n.name} /></span><span class="lbl">{n.label}</span></a>
    {/each}
  </nav>
</div>
