<script lang="ts">
  // Phần "Sự nghiệp" của Hồ sơ: cây chức vụ dọc + tủ trưng bày gắn với cây. Chạm một chức trên cây → tủ trưng bày xem trước chức đó.
  // ≥ 1024 px: hai cột — trái cây, phải tủ trưng bày dính khi cuộn, chi tiết điều kiện ngay trong khung tủ (không hộp thoại).
  // Hẹp: tủ trưng bày thu gọn (khung ảnh nhỏ) ở trên cây; chạm chức vẫn mở hộp chi tiết (Sheet).
  import { tick } from 'svelte';
  import { POSTS, careerState } from '$lib/game/career';
  import OrgChart from '../OrgChart.svelte';
  import CareerPanel from '../CareerPanel.svelte';
  import { orgTree, type OrgPost } from '../orgTree';
  import { shelf, refreshShelf } from '../shelf.svelte';

  if (!shelf.ready) refreshShelf();
  let selId = $state<string | null>(null);
  let expanded = $state(false);
  let wide = $state(typeof matchMedia !== 'undefined' && matchMedia('(min-width: 1024px)').matches);
  $effect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(min-width: 1024px)');
    const on = () => (wide = mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  });
  const tree = $derived(orgTree(POSTS, careerState(shelf.books), shelf.books));
  const all = $derived<OrgPost[]>([...tree.branches.flatMap((b) => b.tiers.flatMap((t) => t.posts)), ...(tree.head ? [tree.head] : [])]);
  const selected = $derived(selId ? all.find((p) => p.id === selId) ?? null : null);

  let chart = $state<{ scrollToNext: () => void } | null>(null);
  let fig = $state<HTMLElement | null>(null);
  /** Phần được mở: cuộn tới chức kế tiếp (tôn trọng giảm chuyển động ở trong OrgChart). */
  export function scrollToNext(): void { chart?.scrollToNext(); }
  async function showcase() {
    expanded = true; await tick();
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    fig?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
</script>

<div class="career-sec" class:wide>
  <aside class="cs-show" bind:this={fig} aria-label="Tủ trưng bày chức danh">
    <CareerPanel {selected} stacked={!wide} bind:expanded onreset={() => (selId = null)} />
  </aside>
  <div class="cs-tree">
    <OrgChart bind:this={chart} selectedId={selId} onpick={(p) => (selId = p.id)} onshowcase={showcase} detail={wide ? 'none' : 'sheet'} />
  </div>
</div>
