<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  import type { Snippet } from 'svelte';
  import type { RouteName } from '$lib/router.svelte';
  import { NAV, activeNav } from './nav';
  import { header } from './header.svelte';
  import { rail } from './rail.svelte';
  import { sidenav, refreshSidenav } from './sidenav.svelte';
  import { storage } from '$lib/store/status.svelte';
  import StreakFlame from './StreakFlame.svelte';
  import SideProfile from './SideProfile.svelte';
  import RankBadge from './RankBadge.svelte';
  import Icon from '$lib/art/Icon.svelte';
  import { route } from '$lib/router.svelte';
  import { focusRouteHeading } from './routeFocus';
  import { parentHash, goBack } from './back';
  import SearchDialog from './SearchDialog.svelte';

  let { active, children }: { active: RouteName; children: Snippet } = $props();
  const current = $derived(activeNav(active));
  const Rail = $derived(rail.current?.component);
  const hasParent = $derived(parentHash(route) !== null);
  // Trang có breadcrumb riêng (Subject, Concepts): ≥ 768 ẩn nút Quay lại ngay từ lúc tải (không chờ breadcrumb → không giật)
  const hasCrumbs = $derived(route.name === 'subject' || route.name === 'concepts');
  refreshSidenav();
  const railProps = $derived(rail.current?.props ?? {});

  // Tìm kiếm toàn cục (spec 2026-11-11): nút trên thanh trên/thanh bên, phím "/" hoặc Ctrl/⌘ + K. Trong phiên học không có khung này nên không có ô tìm.
  let searchOpen = $state(false);
  function shortcut(e: KeyboardEvent) {
    if (searchOpen || e.defaultPrevented || document.querySelector('dialog[open]')) return; // đang mở hộp khác (Hồ sơ)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchOpen = true; return; }
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return; // đang gõ chữ: "/" là ký tự thường
    e.preventDefault();
    searchOpen = true;
  }
</script>

<svelte:window onkeydown={shortcut} />

<div class="shell" class:has-rail={!!Rail}>
  <!-- Bỏ qua điều hướng (WCAG 2.4.1). Router dùng hash: href="#main" sẽ thành route 404 → chặn mặc định, chỉ chuyển focus. -->
  <a class="skip-link" href="#main" onclick={(e) => { e.preventDefault(); focusRouteHeading(); }}>Bỏ qua tới nội dung</a>
  <header class="topbar">
    <a class="brand" href="#/"><span class="mark" aria-hidden="true">§</span><span class="name"> Luyện Luật</span></a>
    <div class="meta"><button type="button" class="search-btn" aria-label="Tìm kiếm" onclick={() => (searchOpen = true)}><Glyph name="search" size={22} /></button><StreakFlame count={header.streak} longest={header.longest} /><RankBadge /></div>
  </header>

  <nav class="sidenav" aria-label="Điều hướng chính">
    <a class="brand" href="#/"><span class="mark" aria-hidden="true">§</span><span class="name"> Luyện Luật</span></a>
    <button type="button" class="side-search" aria-label="Tìm kiếm" aria-keyshortcuts="/" onclick={() => (searchOpen = true)}>
      <Glyph name="search" size={20} /><span class="short">Tìm</span><span class="long">Tìm kiếm</span><kbd aria-hidden="true">/</kbd>
    </button>
    <ul>
      {#each NAV as n (n.name)}
        <li><a class="item" class:on={current === n.name} href={n.href} aria-current={current === n.name ? 'page' : undefined}>
          <span class="ico"><Icon name={n.name} /></span><span class="lbl">{n.label}</span></a></li>
      {/each}
    </ul>
    {#if sidenav.study}
      <div class="side-study"><p class="kicker">Đang học</p><p class="ss-subject" title={sidenav.study.subject}>{sidenav.study.subject}</p><p class="ss-lesson small muted">{sidenav.study.lesson}</p><a class="ss-go small" href={sidenav.study.href}>Học tiếp →</a></div>
    {/if}
    <!-- Tủ gọn: biển tên + chuỗi + kệ sách một hàng + tiến độ — một khối gỗ-kính, thấp ~230 px -->
    <div class="side-cab"><SideProfile /></div>
  </nav>

  <main class="content" id="main" tabindex="-1">
    {#if !storage.available}
      <p class="banner" role="alert"><Glyph name="warn" size={16} /> Trình duyệt đang chặn lưu trữ (chế độ riêng tư?). Bạn vẫn học được nhưng tiến độ sẽ mất khi đóng tab.</p>
    {/if}
    {#if hasParent}<button type="button" class="back-btn" class:has-crumbs={hasCrumbs} aria-label="Quay lại" onclick={() => goBack(route)}><Glyph name="back" size={16} /> Quay lại</button>{/if}
    {@render children()}
  </main>

  {#if Rail}
    <aside class="rail" aria-label="Thông tin thêm"><Rail {...railProps} /></aside>
  {/if}


  <SearchDialog bind:open={searchOpen} />

  <nav class="tabbar" aria-label="Điều hướng chính">
    {#each NAV as n (n.name)}
      <a class:on={current === n.name} href={n.href} aria-current={current === n.name ? 'page' : undefined}>
        <span class="ico"><Icon name={n.name} /></span><span class="lbl">{n.label}</span></a>
    {/each}
  </nav>
</div>
