<script lang="ts">
  // Cây chức vụ: sơ đồ tổ chức bộ máy nhà nước dạng cây — gốc → 4 nhánh → các tầng (cơ sở → lãnh đạo) → chức; Chủ tịch nước ở đỉnh.
  // Dữ liệu chỉ từ lib/game/career.ts (qua orgTree). Nút: đã đạt (ấn son, màu đậm) · kế tiếp (viền cam nhấp nháy nhẹ) · khoá (mờ, ổ khoá).
  // Chạm/Enter một chức → hộp chi tiết điều kiện sách. Điện thoại: cây dọc thụt lề; ≥ 768 px: cây ngang, cuộn ngang trong khung.
  // Đường nối dựng bằng ul/li + pseudo-element (học cách dựng của các org chart CSS mã nguồn mở như dabeng/OrgChart, Treant.js — không dùng thư viện, tự viết).
  import { POSTS, TIER_NAMES, careerState } from '$lib/game/career';
  import { FIELD_NAMES, type Field } from '$lib/game/fields';
  import { shelf, refreshShelf } from './shelf.svelte';
  import { career, setBranch } from './career.svelte';
  import { orgTree, shortPostTitle, type OrgPost, type OrgStatus } from './orgTree';
  import Sheet from './Sheet.svelte';

  if (!shelf.ready) refreshShelf();
  const tree = $derived(orgTree(POSTS, careerState(shelf.books), shelf.books));
  const STATE_TEXT: Record<OrgStatus, string> = { done: 'Đã đạt', next: 'Chức kế tiếp', locked: 'Chưa mở' };
  let sel = $state<OrgPost | null>(null);
  let open = $state(false);
  function pick(p: OrgPost) { sel = p; open = true; }
  // còn nút trong tree khi dữ liệu đổi: tìm lại bản mới nhất của chức đang xem
  const cur = $derived(sel ? ([...tree.branches.flatMap((b) => b.tiers.flatMap((t) => t.posts)), ...(tree.head ? [tree.head] : [])].find((p) => p.id === sel!.id) ?? sel) : null);

  let scroller = $state<HTMLDivElement | null>(null);
  let scrollable = $state(false);
  let hint = $state(false); // chỉ nhắc "cuộn ngang" khi tràn đáng kể (> 24 px)
  let atEnd = $state(false);
  const measure = () => { if (!scroller) return; scrollable = scroller.scrollWidth > scroller.clientWidth + 1; hint = scroller.scrollWidth - scroller.clientWidth > 24; atEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 2; };
  $effect(() => {
    if (!scroller || typeof ResizeObserver === 'undefined') return;
    const el = scroller;
    const ro = new ResizeObserver(measure);
    ro.observe(el); if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  });
</script>

{#snippet node(p: OrgPost, cls = '')}
  <button type="button" class="org-node {cls}" data-status={p.status} aria-haspopup="dialog" title={p.title} onclick={() => pick(p)}>
    <span class="org-mark" aria-hidden="true">
      {#if p.status === 'done'}<svg viewBox="0 0 20 20" width="20" height="20"><rect x="1.5" y="1.5" width="17" height="17" rx="2.5" /><path d="M5.5 10.5l3 3l6-7" /></svg>
      {:else if p.status === 'next'}<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="7.5" /><circle class="dot" cx="10" cy="10" r="3" /></svg>
      {:else}<svg viewBox="0 0 20 20" width="20" height="20"><rect x="4.5" y="9" width="11" height="8.5" rx="1.6" /><path d="M7 9V6.6a3 3 0 0 1 6 0V9" /></svg>{/if}
    </span>
    <span class="org-name">{shortPostTitle(p.title)}</span>
    <span class="org-meta">{p.status === 'done' ? 'Đã đạt' : p.status === 'next' ? `Kế tiếp · ${p.have}/${p.need} sách` : 'Chưa mở'}</span>
  </button>
{/snippet}

<div class="org">
  <ul class="org-legend" aria-label="Chú giải">
    <li><span class="org-key" data-status="done" aria-hidden="true"></span>Đã đạt</li>
    <li><span class="org-key" data-status="next" aria-hidden="true"></span>Kế tiếp</li>
    <li><span class="org-key" data-status="locked" aria-hidden="true"></span>Chưa mở</li>
    <li class="muted small org-tip">Chạm một chức để xem điều kiện sách.{#if hint}{' '}Cuộn ngang để xem tiếp các tầng →{/if}</li>
  </ul>
  <!-- vùng cuộn ngang được focus bằng bàn phím chỉ khi thật sự cuộn được -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="org-scroll" class:fade={scrollable && !atEnd} bind:this={scroller} onscroll={measure} role="region" aria-label="Sơ đồ cây chức vụ" tabindex={scrollable ? 0 : undefined}>
    <div class="org-tree">
      <div class="org-spine">
        <div class="org-stack">
          {#if tree.head}
            <div class="org-head">
              {@render node(tree.head, 'org-top')}
              <p class="org-headnote small muted">Đỉnh chung · cần cấp {TIER_NAMES[tree.head.branchesTier ?? 'trung-uong']} ở {tree.head.branchesNeeded} nhánh ({tree.head.branchesReached}/{tree.head.branchesNeeded})</p>
            </div>
            <span class="org-drop" aria-hidden="true"></span>
          {/if}
          <div class="org-root"><b>{tree.label}</b><span class="small">{tree.done}/{tree.total} chức</span></div>
        </div>
      </div>
      <ul class="org-branches">
        {#each tree.branches as b (b.branch)}
          <li class="org-branch" class:sel={career.branch === b.branch} style="--bc: var(--bc-{b.branch})">
            <button type="button" class="org-bnode" aria-pressed={career.branch === b.branch} onclick={() => setBranch(b.branch)}>
              <span class="org-bname">{b.label}</span>
              <span class="org-meta">{b.done}/{b.total} chức{career.branch === b.branch ? ' · đang theo' : ''}</span>
            </button>
            <ol class="org-tiers" aria-label="Các tầng của nhánh {b.label}">
              {#each b.tiers as t (t.tier)}
                <li class="org-tier">
                  <p class="org-tname">{t.label}</p>
                  <ul class="org-posts">
                    {#each t.posts as p (p.id)}<li>{@render node(p)}</li>{/each}
                  </ul>
                </li>
              {/each}
            </ol>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>

<Sheet bind:open title={cur?.title ?? ''} kicker={cur ? (cur.branch === 'nguyen-thu' ? 'Đỉnh chung' : `${TIER_NAMES[cur.tier]} · ${tree.branches.find((b) => b.branch === cur.branch)?.label ?? ''}`) : ''}>
  {#if cur}
    <p class="org-state" data-status={cur.status}>{STATE_TEXT[cur.status]}{#if cur.status === 'locked' && cur.prev} · cần đạt trước: <b>{cur.prev}</b>{/if}</p>
    <p class="kicker">Điều kiện sách · {cur.have}/{cur.need}</p>
    <ul class="req-list">
      {#each cur.detail as d, i (i)}
        <li class:ok={d.have >= d.req.count} class:future={d.future}>
          <span class="req-name">{d.label}</span>
          <span class="bar" aria-hidden="true"><span style="width:{(Math.min(d.have, d.req.count) / d.req.count) * 100}%"></span></span>
          <span class="small muted">{Math.min(d.have, d.req.count)}/{d.req.count}{#if d.future} · chờ môn {FIELD_NAMES[d.req.field as Field]}{/if}</span>
        </li>
      {/each}
    </ul>
    {#if cur.branchesNeeded}
      <p class="small">Điều kiện nhánh: đạt cấp <b>{TIER_NAMES[cur.branchesTier ?? 'trung-uong']}</b> ở {cur.branchesNeeded} nhánh — hiện {cur.branchesReached}/{cur.branchesNeeded}.</p>
    {/if}
    <p class="muted small">Chức danh mô phỏng trong trò chơi học tập, không phải chức vụ thật.</p>
    {#if cur.branch !== 'nguyen-thu' && cur.branch !== career.branch}
      <button type="button" class="btn ghost" onclick={() => { if (cur.branch !== 'nguyen-thu') setBranch(cur.branch); open = false; }}>Theo nhánh này</button>
    {/if}
  {/if}
</Sheet>
