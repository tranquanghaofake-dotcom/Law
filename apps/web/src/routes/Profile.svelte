<script lang="ts">
  import StreakPanel from '$lib/ui/StreakPanel.svelte';
  import StreakBadge from '$lib/art/StreakBadge.svelte';
  import Bookcase from '$lib/ui/Bookcase.svelte';
  import CareerPanel from '$lib/ui/CareerPanel.svelte';
  import OrgChart from '$lib/ui/OrgChart.svelte';
  import Glyph from '$lib/art/Glyph.svelte';
  // Hồ sơ: hai tab Tổng quan (#/toi) · Cài đặt (#/cai-dat) (spec §5.2).
  // Tổng quan = thẻ căn cước học tập (một khối gọn ở đầu) + các phần đóng/mở (accordion): Cây chức vụ · Tủ sách · Thẻ chuyên cần ·
  // Tủ trưng bày chức danh · Dữ liệu. Phần đang mở nhớ trong localStorage (chỉ tiện cho từng người xem, không phải dữ liệu học).
  import { tick } from 'svelte';
  import { repo } from '$lib/store/progress-repo';
  import { storage } from '$lib/store/status.svelte';
  import { stats, EMPTY_STREAK } from '$lib/store/stats';
  import { LuyenLuatDB } from '$lib/store/db';
  import { POSTS, TIER_NAMES, BRANCH_NAMES, careerState, displayTitle, promotionToCelebrate } from '$lib/game/career';
  import type { StreakState } from '$lib/game/streak';
  import { hashFor, route } from '$lib/router.svelte';
  import { shelf, refreshShelf } from '$lib/ui/shelf.svelte';
  import { career } from '$lib/ui/career.svelte';
  import { weekFlags, weekStart } from '$lib/ui/week';
  import Settings from './Settings.svelte';

  const onSettings = $derived(route.name === 'settings');
  let xp = $state(0);
  let streak = $state<StreakState>(EMPTY_STREAK);
  let byLevel = $state<number[]>([0, 0, 0, 0, 0, 0, 0]);
  let week = $state<boolean[]>(Array(7).fill(false));
  let msg = $state('');

  if (!shelf.ready) refreshShelf();
  const cs = $derived(careerState(shelf.books));
  const t = $derived(displayTitle(cs, career.branch));
  const nx = $derived(cs.next[career.branch]);
  const earned = $derived(shelf.books.filter((b) => b.level > 0).length);
  // tiến độ sách tới chức kế tiếp: mỗi điều kiện tính tối đa bằng số sách cần
  const nxNeed = $derived(nx ? nx.post.reqs.reduce((n, q) => n + q.count, 0) : 0);
  const nxHave = $derived(nx ? nx.post.reqs.reduce((n, q) => { const m = nx.missing.find((x) => x.req === q); return n + (m ? Math.min(m.have, q.count) : q.count); }, 0) : 0);

  async function load() {
    try {
      xp = await stats.xp();
      streak = await stats.streak();
      const all = await repo.all();
      const counts = [0, 0, 0, 0, 0, 0, 0];
      for (const p of all) counts[p.level] += 1;
      byLevel = counts;
      week = weekFlags(await repo.reviewDays(weekStart()));
    } catch (e) { msg = `Không tải được dữ liệu: ${(e as Error).message}`; }
  }
  $effect(() => { document.title = onSettings ? 'Cài đặt · Luyện Luật' : 'Hồ sơ · Luyện Luật'; });
  load();

  // Chức mới đạt mà chưa xem màn nhận chức (settings 'career-seen', cùng nguồn với CareerPanel): hiện lời mừng ở thẻ căn cước.
  function db() { try { return typeof indexedDB === 'undefined' ? null : new LuyenLuatDB(); } catch { return null; } }
  let seen = $state<string[] | null | undefined>(undefined);
  (async () => { try { const row = await db()?.settings.get('career-seen'); seen = (row?.value as string[] | undefined) ?? null; } catch { seen = null; } })();
  const fresh = $derived(seen === undefined || !shelf.ready ? null : promotionToCelebrate(cs.achieved, seen));
  // lần đầu (chưa từng lưu): ghi nhận chức hiện có để không mừng lại chức cũ — như CareerPanel, vì panel đó chỉ dựng khi mở phần
  $effect(() => { if (seen === null && shelf.ready) { const ids = [...cs.achieved]; seen = ids; db()?.settings.put({ key: 'career-seen', value: ids }).catch(() => {}); } });

  // ---- Các phần đóng/mở ----
  const SECTIONS = [
    { id: 'cay', title: 'Cây chức vụ' },
    { id: 'tu', title: 'Tủ sách' },
    { id: 'chuyen-can', title: 'Thẻ chuyên cần' },
    { id: 'trung-bay', title: 'Tủ trưng bày chức danh' },
    { id: 'du-lieu', title: 'Dữ liệu' },
  ] as const;
  type SecId = (typeof SECTIONS)[number]['id'];
  const LS_KEY = 'll-profile-open';
  function readOpen(): SecId[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const a = raw ? JSON.parse(raw) : null;
      if (Array.isArray(a)) return SECTIONS.map((s) => s.id).filter((id) => a.includes(id));
    } catch { /* chặn lưu trữ / dữ liệu hỏng: dùng mặc định */ }
    return ['cay'];
  }
  const initialOpen = readOpen();
  let openIds = $state<SecId[]>(initialOpen);
  let mounted = $state<SecId[]>([...initialOpen]); // đã từng mở: giữ nội dung để đóng có chuyển cảnh, chưa mở thì chưa dựng
  const isOpen = (id: SecId) => openIds.includes(id);
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(openIds)); } catch { /* bỏ qua */ } }
  function toggle(id: SecId) {
    openIds = isOpen(id) ? openIds.filter((x) => x !== id) : [...openIds, id];
    if (!mounted.includes(id)) mounted = [...mounted, id];
    save();
  }
  async function reveal(id: SecId) {
    if (!isOpen(id)) { openIds = [...openIds, id]; if (!mounted.includes(id)) mounted = [...mounted, id]; save(); }
    await tick();
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  const summary = $derived<Record<SecId, string>>({
    cay: `${cs.achieved.size}/${POSTS.length} chức`,
    tu: `${earned}/${shelf.books.length} sách`,
    'chuyen-can': `${streak.count} ngày`,
    'trung-bay': t.title,
    'du-lieu': 'Xuất · nhập',
  });

  async function exportData() {
    const json = await repo.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `luyen-luat-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(a.href);
  }
  async function importData(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    try { await repo.importAll(await f.text()); msg = 'Đã nhập dữ liệu.'; await load(); } catch { msg = 'File không hợp lệ.'; }
  }
</script>

{#snippet icon(id: SecId)}
  <svg class="acc-ico" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    {#if id === 'cay'}<rect x="8.5" y="3" width="7" height="4.5" rx="1" /><path d="M12 7.5V11M5 15.5V11h14v4.5" /><rect x="2.5" y="15.5" width="5" height="4.5" rx="1" /><rect x="16.5" y="15.5" width="5" height="4.5" rx="1" />
    {:else if id === 'tu'}<rect x="3.5" y="3.5" width="17" height="17" rx="1.5" /><path d="M3.5 12h17M8 12V7.5M11 12V6.5M14.5 12V8M8 20.5V16M12 20.5V15.5M15.5 20.5V16.5" />
    {:else if id === 'chuyen-can'}<rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M12 8.5v7M8.5 10.5h7M7 14l2 .8M17 14l-2 .8" />
    {:else if id === 'trung-bay'}<path d="M5 3.5h14v17H5zM9 7h6M9 17h6" /><circle cx="12" cy="11.5" r="2" />
    {:else}<ellipse cx="12" cy="6" rx="7" ry="2.8" /><path d="M5 6v6c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8V6M5 12v6c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8v-6" />{/if}
  </svg>
{/snippet}

<section class="idcard" class:compact={onSettings} aria-labelledby="idc-h1">
  <div class="idc-top">
    <span class="idc-seal" aria-hidden="true">§</span>
    <div class="idc-who">
      <h1 id="idc-h1" class="idc-eyebrow">Hồ sơ</h1>
      <p class="idc-title">{t.title}</p>
      <p class="idc-sub">{t.tier ? TIER_NAMES[t.tier] : 'Khởi đầu'} · {BRANCH_NAMES[career.branch]}</p>
    </div>
  </div>
  {#if !onSettings}
    <div class="idc-stats">
      <div class="idc-stat idc-streak">
        <StreakBadge count={streak.count} longest={streak.longest} size={36} />
        <p><b>{streak.count} ngày</b><span class="muted small">chuỗi · {xp} XP</span></p>
      </div>
      <div class="idc-stat">
        <svg class="idc-bookico" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7c-2.6-1.8-5.6-2.2-9-1.4V19c3.4-.8 6.4-.4 9 1.4c2.6-1.8 5.6-2.2 9-1.4V5.6c-3.4-.8-6.4-.4-9 1.4zM12 7v13.4" /></svg>
        <p><b>{earned}<span class="idc-of">/{shelf.books.length} sách</span></b><span class="muted small">đã nhận</span></p>
      </div>
    </div>
    <div class="idc-next">
      {#if nx}
        <p class="idc-nextline"><span class="kicker">Chức kế tiếp · {TIER_NAMES[nx.post.tier]}</span><b>{nx.post.title}</b></p>
        <div class="idc-bar" role="progressbar" aria-label="Sách tới chức kế tiếp" aria-valuemin="0" aria-valuemax={nxNeed} aria-valuenow={nxHave}><span style="width:{nxNeed ? (nxHave / nxNeed) * 100 : 0}%"></span></div>
        <p class="idc-nextfoot small"><span class="muted">{nxHave}/{nxNeed} sách</span><button type="button" class="idc-link" onclick={() => reveal('cay')}>Xem điều kiện →</button></p>
      {:else}
        <p class="idc-nextline"><b>Bạn đã đạt chức cao nhất của nhánh này.</b></p>
      {/if}
    </div>
    {#if fresh}
      <p class="idc-promo" role="status">Chúc mừng! Bạn vừa nhận chức mới: <b>{fresh.title}</b>. <button type="button" class="idc-link" onclick={() => reveal('trung-bay')}>Xem lễ nhận chức →</button></p>
    {/if}
  {/if}
  <div class="tabs idc-tabs" role="tablist" aria-label="Hồ sơ">
    <a role="tab" href={hashFor('profile')} aria-selected={!onSettings} class:on={!onSettings}>Tổng quan</a>
    <a role="tab" href={hashFor('settings')} aria-selected={onSettings} class:on={onSettings}><Glyph name="gear" size={16} /> Cài đặt</a>
  </div>
</section>

{#if onSettings}
  <div role="tabpanel"><Settings /></div>
{:else}
  <div role="tabpanel" class="acc-list">
    {#each SECTIONS as s (s.id)}
      {@const open = isOpen(s.id)}
      <section class="acc" class:open id="sec-{s.id}">
        <h2 class="acc-h">
          <button type="button" class="acc-btn" id="acc-btn-{s.id}" aria-expanded={open} aria-controls="acc-panel-{s.id}" onclick={() => toggle(s.id)}>
            {@render icon(s.id)}
            <span class="acc-t">{s.title}</span>
            <span class="acc-s">{summary[s.id]}</span>
            <svg class="acc-chev" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7.5l5 5l5-5" /></svg>
          </button>
        </h2>
        <div class="acc-panel" id="acc-panel-{s.id}" role="region" aria-labelledby="acc-btn-{s.id}" inert={!open}>
          <div class="acc-inner">
            {#if mounted.includes(s.id)}
              <div class="acc-body">
                {#if s.id === 'cay'}
                  <OrgChart />
                {:else if s.id === 'tu'}
                  <Bookcase />
                {:else if s.id === 'chuyen-can'}
                  <StreakPanel {streak} {xp} {week} {byLevel} />
                {:else if s.id === 'trung-bay'}
                  <CareerPanel />
                {:else}
                  <p class="muted small">Tiến độ lưu trong trình duyệt này. Xuất file để chuyển máy hoặc lưu dự phòng.</p>
                  <div class="row">
                    <button class="btn ghost plain" type="button" onclick={exportData}>Xuất dữ liệu</button>
                    <label class="btn ghost plain">Nhập dữ liệu<input type="file" accept="application/json" class="sr-only" onchange={importData} /></label>
                  </div>
                  {#if msg}<p role="status">{msg}</p>{/if}
                  {#if !storage.available}<p class="muted">⚠ Trình duyệt đang chặn lưu trữ: tiến độ sẽ mất khi đóng tab.</p>{/if}
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </section>
    {/each}
  </div>
{/if}
{#if msg && !isOpen('du-lieu')}<p role="status" class="muted small">{msg}</p>{/if}

<footer class="legal-note muted small">
  <p><strong>Thông tin pháp luật chung, không phải tư vấn pháp lý.</strong> Nội dung do Trần Quang Hào, sinh viên Luật Kinh tế, biên soạn từ văn bản pháp luật (hiện hành và đã hết hiệu lực), sử liệu và giáo trình; luôn đối chiếu nguyên văn và tình trạng hiệu lực trước khi áp dụng cho trường hợp cụ thể.</p>
</footer>
