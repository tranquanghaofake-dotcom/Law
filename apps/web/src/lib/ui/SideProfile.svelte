<script lang="ts">
  // Thẻ hồ sơ mini ở đáy sidebar: chuỗi (huy hiệu ngọn lửa theo màu chu kỳ), chức danh có ấn, tiến độ tới chức kế tiếp.
  // Cả khối là liên kết tới Hồ sơ. Số liệu chuỗi lấy từ streakView — cùng nguồn với rail Hôm nay và topbar.
  import StreakBadge from '$lib/art/StreakBadge.svelte';
  import StreakCard from '$lib/art/StreakCard.svelte';
  import Portrait from '$lib/art/Portrait.svelte';
  import { lookFor } from '$lib/game/looks';
  import { DEFAULT_AVATAR, sanitize, resolveOutfit, type Avatar } from '$lib/game/wardrobe';
  import { LuyenLuatDB } from '$lib/store/db';
  import { careerState, displayTitle } from '$lib/game/career';
  import { header } from './header.svelte';
  import { shelf } from './shelf.svelte';
  import { career } from './career.svelte';
  import { streakView, postProgress } from './streakView';

  const sv = $derived(streakView(header.streak, header.longest));
  const cs = $derived(careerState(shelf.books));
  const title = $derived(displayTitle(cs, career.branch));
  const pp = $derived(postProgress(cs.next[career.branch]));

  // ≥ 1280 px (sidebar đầy đủ): thẻ chuyên cần + biển tên/ma-nơ-canh của tủ trưng bày, cỡ cố định theo cột; hẹp hơn giữ thẻ mini.
  let wide = $state(typeof matchMedia !== 'undefined' && matchMedia('(min-width: 1280px)').matches);
  $effect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(min-width: 1280px)');
    const on = () => (wide = mq.matches);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  });
  const earned = $derived(shelf.books.filter((b) => b.level > 0));
  const look = $derived(lookFor(title.post?.id ?? null));
  let raw = $state<Avatar>({ ...DEFAULT_AVATAR });
  $effect(() => {
    if (!wide) return;
    (async () => { try { const db = typeof indexedDB === 'undefined' ? null : new LuyenLuatDB(); const row = await db?.settings.get('avatar'); if (row?.value) raw = { ...DEFAULT_AVATAR, ...(row.value as Avatar) }; } catch { /* bỏ qua */ } })();
  });
  const av = $derived(sanitize(raw, cs.achieved));
  const drawn = $derived<Avatar>({ ...av, outfit: resolveOutfit(av.outfit, title.post) });
</script>

<a class="me" class:cold={sv.count === 0} class:wide href="#/toi" style="--fire:{sv.flame}; --glow:{sv.glow}">
  {#if wide}
    <span class="me-card"><StreakCard count={header.streak} longest={header.longest} size="side" /></span>
    <span class="me-fig"><Portrait avatar={drawn} {look} tier={title.tier} title={title.title} subtitle={`${earned.length} sách · ${earned.filter((b) => b.level === 3).length} cấp 3`} /></span>
  {:else}
    <span class="me-streak">
      <span class="me-badge"><StreakBadge count={header.streak} longest={header.longest} size={44} /></span>
      <span class="me-days"><b><span class="sr-only">Chuỗi </span>{sv.count}</b><span class="me-unit">ngày</span><span class="me-tier">{sv.label}</span></span>
    </span>
    <span class="me-rank"><span class="seal" aria-hidden="true">§</span><span class="me-title">{title.title}</span></span>
  {/if}
  <span class="me-next">
    {#if pp}
      <span class="bar" aria-hidden="true"><span style="width:{pp.pct}%"></span></span>
      <span class="me-next-t">{pp.have}/{pp.need} sách · kế tiếp: {pp.title}</span>
    {:else}
      <span class="me-next-t">Đã đạt chức cao nhất của nhánh</span>
    {/if}
  </span>
</a>
