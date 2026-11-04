<script lang="ts">
  // Tủ trưng bày chức danh: chân dung + chức danh, xem trước chức người học chạm trên cây (OrgChart), điều kiện lên chức, tủ đồ.
  // LUÔN có chân dung (kể cả 0 sách: người mới thấy Công dân). Chức chưa mở: bóng mờ khoá + "cần x/y sách" + nút "Về chức hiện tại".
  // Bố cục 2 cột: chi tiết điều kiện hiện ngay trong khung (không cần hộp thoại). Hẹp (`stacked`): khung ảnh nhỏ ở trên cây, bấm để mở rộng.
  import Portrait from '$lib/art/Portrait.svelte';
  import { TIER_NAMES, careerState, displayTitle, promotionToCelebrate } from '$lib/game/career';
  import { FIELD_NAMES, type Field } from '$lib/game/fields';
  import { DEFAULT_AVATAR, NAMES, sanitize, unlocked, resolveOutfit, type Avatar } from '$lib/game/wardrobe';
  import { lookFor } from '$lib/game/looks';
  import { shelf, refreshShelf } from './shelf.svelte';
  import { schemeFor } from './shelf';
  import { career, setBranch } from './career.svelte';
  import type { OrgPost } from './orgTree';
  import { LuyenLuatDB } from '$lib/store/db';

  let { selected = null, stacked = false, expanded = $bindable(false), onreset }: { selected?: OrgPost | null; stacked?: boolean; expanded?: boolean; onreset?: () => void } = $props();

  if (!shelf.ready) refreshShelf();
  const cs = $derived(careerState(shelf.books));
  const t = $derived(displayTitle(cs, career.branch));
  const nx = $derived(cs.next[career.branch]);
  const earned = $derived(shelf.books.filter((b) => b.level > 0));
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];
  const display = $derived([...earned].sort((a, b) => b.level - a.level || (b.at ?? '').localeCompare(a.at ?? '')).slice(0, 10)
    .map((b) => ({ key: b.key, level: b.level, label: `${b.subjectShort} ${ROMAN[b.index] ?? b.index}`, scheme: schemeFor(b.subject, shelf.subjects.findIndex((x) => x.id === b.subject)) })));

  // ---- Xem trước ----
  const previewing = $derived(!!selected && selected.id !== (t.post?.id ?? null));
  const pv = $derived(previewing ? selected : null);
  const look = $derived(lookFor(pv ? pv.id : t.post?.id ?? null));
  const shownTier = $derived(pv ? pv.tier : t.tier);
  const locked = $derived(!!pv && pv.status !== 'done');
  const shownTitle = $derived(pv ? pv.title : t.title);
  const subtitle = $derived(pv ? (pv.status === 'done' ? 'Đã đạt' : `Cần ${pv.have}/${pv.need} sách`) : `${earned.length} sách · ${earned.filter((b) => b.level === 3).length} cấp 3`);

  // ---- Tủ đồ ----
  let raw = $state<Avatar>({ ...DEFAULT_AVATAR });
  const av = $derived(sanitize(raw, cs.achieved));
  const own = $derived<Avatar>({ ...av, outfit: resolveOutfit(av.outfit, t.post) });
  const drawn = $derived<Avatar>(pv ? { ...DEFAULT_AVATAR, outfit: look.outfit } : own);
  const un = $derived(unlocked(cs.achieved));
  const ALL = { outfit: ['theo-chuc-vu', 'thuong-phuc', 'ba-ba', 'tu-than', 'ao-dai', 'ao-dai-nam', 'nhat-binh'], hair: ['ngan', 'dai', 'buoc'], accessory: ['khong', 'kinh', 'but', 'so', 'cap', 'huy-hieu'], effect: ['khong', 'nang', 'trong-dong', 'khung-vang', 'hat-sang'] } as const;
  const GROUP: Partial<Record<keyof Avatar, string>> = { outfit: 'Trang phục', accessory: 'Phụ kiện trên bục', effect: 'Ánh sáng & khung' };
  function db() { try { return typeof indexedDB === 'undefined' ? null : new LuyenLuatDB(); } catch { return null; } }
  (async () => { try { const row = await db()?.settings.get('avatar'); if (row?.value) raw = { ...DEFAULT_AVATAR, ...(row.value as Avatar) }; } catch { /* bỏ qua */ } })();
  async function pick(k: keyof Avatar, v: string) { raw = { ...raw, [k]: v }; try { await db()?.settings.put({ key: 'avatar', value: $state.snapshot(raw) }); } catch { /* bỏ qua */ } }

  // ---- Màn nhận chức: chức mới đạt mà chưa xem (settings 'career-seen'); lần đầu chỉ ghi nhận, không mừng ----
  let seen = $state<string[] | null | undefined>(undefined);
  let replay = $state(false);
  (async () => { try { const row = await db()?.settings.get('career-seen'); seen = (row?.value as string[] | undefined) ?? null; } catch { seen = null; } })();
  const fresh = $derived(seen === undefined || !shelf.ready ? null : promotionToCelebrate(cs.achieved, seen));
  const celebrating = $derived((replay || !!fresh) && !pv);
  async function saveSeen(ids: string[]) { seen = ids; try { await db()?.settings.put({ key: 'career-seen', value: ids }); } catch { /* bỏ qua */ } }
  $effect(() => { if (seen === null && shelf.ready) saveSeen([...cs.achieved]); });
  function doneCelebrate() { replay = false; if (fresh) saveSeen([...cs.achieved]); }
  const fieldLabel = (f: Field | 'any') => (f === 'any' ? 'bất kỳ' : FIELD_NAMES[f]);

  const collapsed = $derived(stacked && !expanded);
</script>

<div class="career" class:stacked class:collapsed>
  <div class="career-fig">
    <Portrait avatar={drawn} {look} tier={shownTier} celebrate={celebrating} ondone={doneCelebrate} locked={locked} compact={collapsed} title={shownTitle} {subtitle} books={display} />
    {#if collapsed}
      <div class="career-mini">
        <p class="kicker">{pv ? 'Đang xem trước' : 'Chức hiện tại'}</p>
        <p class="career-mini-t">{shownTitle}</p>
        <p class="small muted">{locked ? `Chưa mở · cần ${pv!.have}/${pv!.need} sách` : subtitle}</p>
      </div>
    {/if}
  </div>
  {#if stacked}
    <button type="button" class="career-more" aria-expanded={expanded} onclick={() => (expanded = !expanded)}>{expanded ? 'Thu gọn tủ trưng bày' : 'Xem tủ trưng bày'}</button>
  {/if}
  {#if !collapsed}
    <div class="career-info">
      {#if pv}
        <p class="kicker">{pv.branch === 'nguyen-thu' ? 'Đỉnh chung' : TIER_NAMES[pv.tier]} · đang xem trước</p>
        <p class="career-title">{pv.title}</p>
        <p class="org-state" data-status={pv.status}>{pv.status === 'done' ? 'Đã đạt' : pv.status === 'next' ? 'Chức kế tiếp' : 'Chưa mở'}{#if pv.status === 'locked' && pv.prev} · cần đạt trước: <b>{pv.prev}</b>{/if}</p>
        {#if pv.status !== 'done'}<p class="career-need"><b>Cần {pv.have}/{pv.need} sách</b></p>{/if}
        <ul class="req-list">
          {#each pv.detail as d, i (i)}
            <li class:ok={d.have >= d.req.count} class:future={d.future}>
              <span class="req-name">{d.label}</span>
              <span class="bar" aria-hidden="true"><span style="width:{(Math.min(d.have, d.req.count) / d.req.count) * 100}%"></span></span>
              <span class="small muted">{Math.min(d.have, d.req.count)}/{d.req.count}{#if d.future} · chờ môn {fieldLabel(d.req.field as Field)}{/if}</span>
            </li>
          {/each}
        </ul>
        {#if pv.branchesNeeded}<p class="small">Cần đạt cấp <b>{TIER_NAMES[pv.branchesTier ?? 'trung-uong']}</b> ở {pv.branchesNeeded} nhánh — hiện {pv.branchesReached}/{pv.branchesNeeded}.</p>{/if}
        <div class="row">
          <button type="button" class="btn" onclick={() => onreset?.()}>Về chức hiện tại</button>
          {#if pv.branch !== 'nguyen-thu' && pv.branch !== career.branch}<button type="button" class="btn ghost" onclick={() => { if (pv.branch !== 'nguyen-thu') setBranch(pv.branch); }}>Theo nhánh này</button>{/if}
        </div>
      {:else}
        <div class="plaque">
          <p class="kicker">{t.tier ? TIER_NAMES[t.tier] : 'Khởi đầu'}</p>
          <p class="plaque-title">{t.title}</p>
          <p class="muted small">Chức danh mô phỏng trong trò chơi học tập, không phải chức vụ thật.</p>
          {#if fresh}<p class="promo-note" role="status">Chúc mừng! Bạn vừa nhận chức danh mới: <b>{fresh.title}</b>.</p>{/if}
          {#if t.post && !celebrating}<button type="button" class="filter replay" onclick={() => (replay = true)}>Xem lại lễ nhận chức</button>{/if}
        </div>
        {#if earned.length === 0}<p class="muted small career-hint">Học hết 1 chương để nhận cuốn sách đầu tiên · <a href="#/mon">Chọn môn →</a></p>{/if}
        {#if nx}
          <p class="kicker" style="margin-top:14px">Lên chức kế tiếp · {TIER_NAMES[nx.post.tier]}</p>
          <p class="next-post"><b>{nx.post.title}</b></p>
          <ul class="req-list">
            {#each nx.post.reqs as q, i (i)}
              {@const m = nx.missing.find((x) => x.req === q)}
              {@const have = m ? m.have : q.count}
              <li class:ok={!m} class:future={m?.future}>
                <span class="req-name">{q.count} sách {fieldLabel(q.field)} · cấp {q.level}+</span>
                <span class="bar" aria-hidden="true"><span style="width:{(Math.min(have, q.count) / q.count) * 100}%"></span></span>
                <span class="small muted">{have}/{q.count}{#if m?.future} · chờ môn {FIELD_NAMES[q.field as Field]}{/if}</span>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="muted">Bạn đã đạt chức cao nhất của nhánh này.</p>
        {/if}
      {/if}
      <details class="wardrobe">
        <summary>Tùy chỉnh tủ trưng bày</summary>
        {#if pv}<p class="muted small">Tủ đồ áp cho chức hiện tại của bạn; đang xem trước chức khác nên chưa áp.</p>{/if}
        {#each Object.keys(GROUP) as k (k)}
          {@const key = k as keyof Avatar}
          <p class="kicker">{GROUP[key] ?? ''}</p>
          <div class="filters">
            {#each ALL[key] as v (v)}
              {@const open = (un[key] as string[]).includes(v)}
              <button type="button" class="filter" aria-pressed={av[key] === v} disabled={!open} title={open ? NAMES[v] : `${NAMES[v]} — chưa mở khoá`} onclick={() => pick(key, v)}>{open ? '' : '🔒 '}{NAMES[v]}</button>
            {/each}
          </div>
        {/each}
      </details>
    </div>
  {/if}
</div>
