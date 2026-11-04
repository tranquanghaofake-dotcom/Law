<script lang="ts">
  // Phần "tủ" của thẻ hồ sơ sidebar khi ≥ 1280 px: thẻ chuyên cần + biển tên/ma-nơ-canh của tủ trưng bày.
  // Tách riêng để SideProfile nạp lười — Portrait/GarmentFlat (~60 kB) không vào bundle chính.
  import StreakCard from '$lib/art/StreakCard.svelte';
  import Portrait from '$lib/art/Portrait.svelte';
  import { lookFor } from '$lib/game/looks';
  import { DEFAULT_AVATAR, sanitize, resolveOutfit, type Avatar } from '$lib/game/wardrobe';
  import { LuyenLuatDB } from '$lib/store/db';
  import { careerState, displayTitle } from '$lib/game/career';
  import { header } from './header.svelte';
  import { shelf } from './shelf.svelte';
  import { career } from './career.svelte';

  const cs = $derived(careerState(shelf.books));
  const title = $derived(displayTitle(cs, career.branch));
  const earned = $derived(shelf.books.filter((b) => b.level > 0));
  const look = $derived(lookFor(title.post?.id ?? null));
  let raw = $state<Avatar>({ ...DEFAULT_AVATAR });
  $effect(() => {
    (async () => { try { const db = typeof indexedDB === 'undefined' ? null : new LuyenLuatDB(); const row = await db?.settings.get('avatar'); if (row?.value) raw = { ...DEFAULT_AVATAR, ...(row.value as Avatar) }; } catch { /* bỏ qua */ } })();
  });
  const av = $derived(sanitize(raw, cs.achieved));
  const drawn = $derived<Avatar>({ ...av, outfit: resolveOutfit(av.outfit, title.post) });
</script>

<span class="me-card"><StreakCard count={header.streak} longest={header.longest} size="side" /></span>
<span class="me-fig"><Portrait avatar={drawn} {look} tier={title.tier} title={title.title} subtitle={`${earned.length} sách · ${earned.filter((b) => b.level === 3).length} cấp 3`} /></span>
