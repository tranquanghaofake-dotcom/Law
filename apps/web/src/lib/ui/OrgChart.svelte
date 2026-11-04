<script lang="ts">
  // Cây chức vụ DỌC (sơ đồ tổ chức trên xuống dưới): Chủ tịch nước (đỉnh chung) → gốc "Nhà nước CHXHCN Việt Nam" → 4 nhánh;
  // trong mỗi nhánh tầng Lãnh đạo cấp cao ở trên, Cơ sở ở dưới, "xuất phát" (Công dân) ở đáy. Dữ liệu CHỈ từ lib/game/career.ts (qua orgTree/orgColumn).
  // Rộng (≥ 560 px khung): 4 cột cạnh nhau. Hẹp (kể cả khi nằm cột trái của bố cục 2 cột): chip chọn nhánh + một cột + dải tóm tắt 4 nhánh (container query).
  // Nút: đã đạt (ấn son) · kế tiếp (viền cam, nhịp phát sáng) · khoá (mờ, ổ khoá). Đường nối dọc tô màu nhánh từ đáy tới chức đã đạt;
  // đoạn tới chức kế tiếp có hạt sáng chạy lên. Chạm/Enter một chức: báo `onpick` (tủ trưng bày xem trước) và, nếu detail = 'sheet', mở hộp chi tiết điều kiện.
  // Mọi chuyển động trang trí (hạt sáng, nhịp, hiện dần) tắt khi giảm chuyển động.
  import { POSTS, TIER_NAMES, careerState, type Branch, type PostTier } from '$lib/game/career';
  import { FIELD_NAMES, type Field } from '$lib/game/fields';
  import { shelf, refreshShelf } from './shelf.svelte';
  import { career, setBranch } from './career.svelte';
  import { orgColumn, orgTree, shortPostTitle, type OrgPost, type OrgStatus } from './orgTree';
  import Sheet from './Sheet.svelte';
  import { LuyenLuatDB } from '$lib/store/db';

  let { selectedId = null, onpick, onshowcase, detail = 'sheet' }:
    { selectedId?: string | null; onpick?: (p: OrgPost) => void; onshowcase?: () => void; detail?: 'sheet' | 'none' } = $props();

  if (!shelf.ready) refreshShelf();
  const tree = $derived(orgTree(POSTS, careerState(shelf.books), shelf.books));
  const cols = $derived(tree.branches.map(orgColumn));
  // Chức vừa đạt mà chưa xem lễ nhận chức (settings 'career-seen', cùng nguồn với CareerPanel): ô toả vòng vàng ba nhịp (đợt 10).
  let seenIds = $state<string[] | null>(null);
  const db = () => { try { return typeof indexedDB === 'undefined' ? null : new LuyenLuatDB(); } catch { return null; } };
  (async () => { try { const row = await db()?.settings.get('career-seen'); seenIds = (row?.value as string[] | undefined) ?? null; } catch { /* bỏ qua */ } })();
  const isFresh = (p: OrgPost) => p.status === 'done' && seenIds !== null && !seenIds.includes(p.id);
  const STATE_TEXT: Record<OrgStatus, string> = { done: 'Đã đạt', next: 'Chức kế tiếp', locked: 'Chưa mở' };
  let sel = $state<OrgPost | null>(null);
  let open = $state(false);
  function pick(p: OrgPost) { onpick?.(p); if (detail === 'sheet') { sel = p; open = true; } }
  // dữ liệu đổi khi hộp đang mở: lấy lại bản mới nhất của chức đang xem
  const cur = $derived(sel ? ([...tree.branches.flatMap((b) => b.tiers.flatMap((t) => t.posts)), ...(tree.head ? [tree.head] : [])].find((p) => p.id === sel!.id) ?? sel) : null);

  const reduced = () => {
    if (typeof document === 'undefined') return true;
    const root = document.documentElement;
    if (root.classList.contains('reduced-motion')) return true;
    return !root.classList.contains('motion-on') && typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  };
  /** Nút hiện dần lần lượt khi cuộn vào khung (thuộc tính data-appear, không đụng class do Svelte quản). Không có IntersectionObserver / giảm chuyển động: hiện ngay. */
  function appear(node: HTMLElement, i: number) {
    if (typeof IntersectionObserver === 'undefined' || reduced()) return;
    node.style.setProperty('--i', String(i % 6));
    node.dataset.appear = 'pre';
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { node.dataset.appear = 'in'; io.disconnect(); } }, { threshold: 0.1 });
    io.observe(node);
    return { destroy: () => io.disconnect() };
  }

  let root = $state<HTMLDivElement | null>(null);
  /** Cuộn tới chức kế tiếp của nhánh đang theo (gọi khi mở phần Sự nghiệp). */
  export function scrollToNext(): void {
    const el = root?.querySelector<HTMLElement>(`.org-col.sel .org-node[data-status="next"]`) ?? root?.querySelector<HTMLElement>('.org-node[data-status="next"]');
    el?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
  }
  const fieldLabel = (f: Field | 'any') => (f === 'any' ? 'bất kỳ' : FIELD_NAMES[f]);
</script>

{#snippet bicon(b: Branch | 'nguyen-thu')}
  <svg class="org-bico" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    {#if b === 'hanh-phap'}<path d="M3 21h18M4.5 9.5L12 4l7.5 5.5M6.5 10v9M10.5 10v9M13.5 10v9M17.5 10v9" />
    {:else if b === 'lap-phap'}<rect x="4" y="12" width="16" height="8.5" rx="1.6" /><path d="M9 12h6M8.5 3.5h7V9h-7zM10.3 6.2l1.3 1.3l2.2-2.6" />
    {:else if b === 'xet-xu'}<path d="M12 4v16M7 20h10M5 7.5h14M5 7.5L2.6 13.5a2.9 2.9 0 0 0 5.8 0zM19 7.5l-2.4 6a2.9 2.9 0 0 0 5.8 0z" />
    {:else if b === 'kiem-sat'}<circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5.5 5.5M8 10.5h5M10.5 8v5" />
    {:else}<path d="M12 3.5l1.9 4.2l4.6.5l-3.4 3.1l1 4.5L12 13.4l-4.1 2.4l1-4.5L5.5 8.2l4.6-.5z" />{/if}
  </svg>
{/snippet}

{#snippet tbadge(t: PostTier)}
  <svg class="org-tbadge" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    {#if t === 'co-so'}<path d="M8 14V8.4M8 8.4C8 5.8 6 4.2 3.4 4.2C3.4 6.8 5 8.4 8 8.4M8 9.4C8 7.4 9.6 6 12 6C12 8.2 10.6 9.4 8 9.4" />
    {:else if t === 'tinh'}<path d="M8 14V4M8 6.6C8 4.8 6.4 3.4 4.4 3.4C4.4 5.4 5.6 6.6 8 6.6M8 6.6C8 4.8 9.6 3.4 11.6 3.4C11.6 5.4 10.4 6.6 8 6.6M8 10.4C8 8.8 6.8 7.8 4.8 7.8M8 10.4C8 8.8 9.2 7.8 11.2 7.8" />
    {:else if t === 'trung-uong'}<path d="M1.8 7.2Q8 6.2 8 2.6Q8 6.2 14.2 7.2M3.6 7.4V13M12.4 7.4V13M2 13.4H14M6.6 9.4h2.8v4H6.6z" />
    {:else}<ellipse cx="8" cy="5.2" rx="5.4" ry="2" /><path d="M2.6 5.2Q3.8 9.4 2.8 13.4H13.2Q12.2 9.4 13.4 5.2M5.2 9.4h5.6M4.6 12h6.8" />{/if}
  </svg>
{/snippet}

{#snippet node(p: OrgPost, i: number, cls = '')}
  <button type="button" class="org-node {cls}" class:pv={selectedId === p.id} class:fresh={isFresh(p)} data-status={p.status} aria-pressed={selectedId === p.id} aria-haspopup={detail === 'sheet' ? 'dialog' : undefined} title={p.title} onclick={() => pick(p)} use:appear={i}>
    <span class="org-mark" aria-hidden="true">
      {#if p.status === 'done'}<svg viewBox="0 0 20 20" width="20" height="20"><rect x="1.5" y="1.5" width="17" height="17" rx="2.5" /><path d="M5.5 10.5l3 3l6-7" /></svg>
      {:else if p.status === 'next'}<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="7.5" /><circle class="dot" cx="10" cy="10" r="3" /></svg>
      {:else}<svg viewBox="0 0 20 20" width="20" height="20"><rect x="4.5" y="9" width="11" height="8.5" rx="1.6" /><path d="M7 9V6.6a3 3 0 0 1 6 0V9" /></svg>{/if}
    </span>
    <span class="org-name">{shortPostTitle(p.title)}</span>
    <span class="org-meta">{p.status === 'done' ? 'Đã đạt' : p.status === 'next' ? `Kế tiếp · ${p.have}/${p.need} sách` : 'Chưa mở'}</span>
  </button>
{/snippet}

<div class="org" bind:this={root}>
  <div class="org-root"><b>{tree.label}</b><span class="small">{tree.done}/{tree.total} chức</span></div>
  <ul class="org-legend" aria-label="Chú giải">
    <li><span class="org-key" data-status="done" aria-hidden="true"></span>Đã đạt</li>
    <li><span class="org-key" data-status="next" aria-hidden="true"></span>Kế tiếp</li>
    <li><span class="org-key" data-status="locked" aria-hidden="true"></span>Chưa mở</li>
    <li class="muted small org-tip">{detail === 'sheet' ? 'Chạm một chức để xem điều kiện sách.' : 'Chạm một chức để xem trước trong tủ trưng bày.'}</li>
  </ul>
  <!-- chỉ hiện khi khung hẹp: chip chọn nhánh -->
  <div class="org-chips" role="group" aria-label="Chọn nhánh">
    {#each cols as c (c.branch)}
      <button type="button" class="org-chip" style="--bc: var(--bc-{c.branch})" aria-pressed={career.branch === c.branch} onclick={() => setBranch(c.branch)}>
        {@render bicon(c.branch)}<span>{c.short}</span><small>{c.done}/{c.total}</small>
      </button>
    {/each}
  </div>
  {#if tree.head}
    <div class="org-head">
      {@render node(tree.head, 0, 'org-top')}
      <p class="org-headnote small muted">Đỉnh chung · cần cấp {TIER_NAMES[tree.head.branchesTier ?? 'trung-uong']} ở {tree.head.branchesNeeded} nhánh ({tree.head.branchesReached}/{tree.head.branchesNeeded})</p>
    </div>
  {/if}
  <ul class="org-cols">
    {#each cols as c, ci (c.branch)}
      <li class="org-col" class:sel={career.branch === c.branch} style="--bc: var(--bc-{c.branch})" data-branch={c.branch}>
        <button type="button" class="org-bnode" aria-pressed={career.branch === c.branch} title={c.label} onclick={() => setBranch(c.branch)}>
          {@render bicon(c.branch)}
          <span class="org-bname">{c.short}</span>
          <span class="org-meta">{c.done}/{c.total} chức{career.branch === c.branch ? ' · đang theo' : ''}</span>
        </button>
        <ol class="org-rows" aria-label="Các chức của nhánh {c.label}, từ cao xuống thấp">
          {#each c.rows as r, ri (r.kind === 'tier' ? `t-${r.tier}` : r.post.id)}
            {#if r.kind === 'tier'}
              <li class="org-trow" data-rail={r.rail} data-tier={r.tier}><span class="org-tpill">{@render tbadge(r.tier)}<span>{r.label}</span><small>{r.done}/{r.total}</small></span></li>
            {:else}
              <li class="org-prow" data-rail={r.rail}>{@render node(r.post, ci * 3 + ri)}</li>
            {/if}
          {/each}
          <li class="org-start" data-rail={c.start}><span>Công dân</span></li>
        </ol>
      </li>
    {/each}
  </ul>
  <!-- chỉ hiện khi khung hẹp: dải tóm tắt 4 nhánh -->
  <ul class="org-sum" aria-label="Tóm tắt các nhánh">
    {#each cols as c (c.branch)}
      <li style="--bc: var(--bc-{c.branch})" class:sel={career.branch === c.branch}>
        {@render bicon(c.branch)}<b>{c.short}</b><span class="small">{c.done}/{c.total} chức</span>
        <span class="org-sumbar" aria-hidden="true"><i style="width:{c.total ? (c.done / c.total) * 100 : 0}%"></i></span>
      </li>
    {/each}
  </ul>
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
          <span class="small muted">{Math.min(d.have, d.req.count)}/{d.req.count}{#if d.future} · chờ môn {fieldLabel(d.req.field as Field)}{/if}</span>
        </li>
      {/each}
    </ul>
    {#if cur.branchesNeeded}
      <p class="small">Điều kiện nhánh: đạt cấp <b>{TIER_NAMES[cur.branchesTier ?? 'trung-uong']}</b> ở {cur.branchesNeeded} nhánh — hiện {cur.branchesReached}/{cur.branchesNeeded}.</p>
    {/if}
    <p class="muted small">Chức danh mô phỏng trong trò chơi học tập, không phải chức vụ thật.</p>
    <div class="row">
      {#if onshowcase}<button type="button" class="btn ghost" onclick={() => { open = false; onshowcase?.(); }}>Xem trong tủ trưng bày</button>{/if}
      {#if cur.branch !== 'nguyen-thu' && cur.branch !== career.branch}
        <button type="button" class="btn ghost" onclick={() => { if (cur.branch !== 'nguyen-thu') setBranch(cur.branch); open = false; }}>Theo nhánh này</button>
      {/if}
    </div>
  {/if}
</Sheet>
