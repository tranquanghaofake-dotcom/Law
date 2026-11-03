<script lang="ts">
  // Chức danh hiện tại (thay bậc khoa cử) — suy từ tủ sách và nhánh đang chọn.
  import { careerState, displayTitle } from '$lib/game/career';
  import { shelf, refreshShelf } from './shelf.svelte';
  import { career } from './career.svelte';
  let { href = '#/toi' }: { xp?: number; href?: string } = $props();
  if (!shelf.ready) refreshShelf();
  const t = $derived(displayTitle(careerState(shelf.books), career.branch));
</script>

<a class="rank" {href} title={`${t.title} · chức danh mô phỏng`} aria-label={`Chức danh mô phỏng: ${t.title}`}>
  <span class="seal" aria-hidden="true">§</span>
  <span class="rank-title">{t.title}</span>
</a>
