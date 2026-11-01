<script lang="ts">
  // Bảng chức danh ở Hồ sơ: chân dung + chức danh, chọn nhánh, điều kiện lên chức kế tiếp, lộ trình nhánh, tủ đồ.
  import Portrait from '$lib/art/Portrait.svelte';
  import { BRANCHES, BRANCH_NAMES, POSTS, TIER_NAMES, careerState, displayTitle, type Branch } from '$lib/game/career';
  import { FIELD_NAMES, type Field } from '$lib/game/fields';
  import { DEFAULT_AVATAR, NAMES, sanitize, unlocked, resolveOutfit, type Avatar } from '$lib/game/wardrobe';
  import type { ArtName } from '$lib/art/registry';
  import { shelf, refreshShelf } from './shelf.svelte';
  import { career, setBranch } from './career.svelte';
  import { LuyenLuatDB } from '$lib/store/db';

  if (!shelf.ready) refreshShelf();
  const cs = $derived(careerState(shelf.books));
  const t = $derived(displayTitle(cs, career.branch));
  const nx = $derived(cs.next[career.branch]);
  const ladder = $derived(POSTS.filter((p) => p.branch === career.branch));
  const SCENE: Record<string, ArtName> = { 'hanh-phap': 'tam-quan', 'lap-phap': 'quoc-hoi', 'xet-xu': 'toa-an', 'kiem-sat': 'toa-an' };
  const scene = $derived<ArtName>(t.post?.id === 'chu-tich-nuoc' ? 'quoc-hoi' : career.branch === 'hanh-phap' && t.tier && t.tier !== 'co-so' ? 'ngo-mon' : SCENE[career.branch]);

  const ACCENT: Record<string, string> = { 'hanh-phap': '#3f9e63', 'lap-phap': '#c0392b', 'xet-xu': '#2b3f74', 'kiem-sat': '#2c6fb7' };
  const accent = $derived(t.post?.id === 'chu-tich-nuoc' ? '#c99a2e' : ACCENT[career.branch]);
  let raw = $state<Avatar>({ ...DEFAULT_AVATAR });
  const av = $derived(sanitize(raw, cs.achieved));
  const drawn = $derived({ ...av, outfit: resolveOutfit(av.outfit, t.post) });
  const un = $derived(unlocked(cs.achieved));
  const ALL = { outfit: ['theo-chuc-vu', 'thuong-phuc', 'ao-dai'], hair: ['ngan', 'dai', 'buoc'], accessory: ['khong', 'kinh', 'but', 'so', 'cap', 'huy-hieu'], effect: ['khong', 'nang', 'trong-dong', 'khung-vang', 'hat-sang'] } as const;
  const GROUP: Record<keyof Avatar, string> = { outfit: 'Trang phục', hair: 'Tóc', accessory: 'Phụ kiện', effect: 'Nền' };
  function db() { try { return typeof indexedDB === 'undefined' ? null : new LuyenLuatDB(); } catch { return null; } }
  (async () => { try { const row = await db()?.settings.get('avatar'); if (row?.value) raw = { ...DEFAULT_AVATAR, ...(row.value as Avatar) }; } catch { /* bỏ qua */ } })();
  async function pick(k: keyof Avatar, v: string) { raw = { ...raw, [k]: v }; try { await db()?.settings.put({ key: 'avatar', value: $state.snapshot(raw) }); } catch { /* bỏ qua */ } }
  const fieldLabel = (f: Field | 'any') => (f === 'any' ? 'bất kỳ' : FIELD_NAMES[f]);
</script>

<section class="card wide career">
  <div class="career-grid">
    <div class="career-portrait">
      <Portrait avatar={drawn} {scene} {accent} />
      <div class="plaque">
        <p class="kicker">{t.tier ? TIER_NAMES[t.tier] : 'Khởi đầu'}</p>
        <p class="plaque-title">{t.title}</p>
        <p class="muted small">Chức danh mô phỏng trong trò chơi học tập, không phải chức vụ thật.</p>
      </div>
    </div>
    <div class="career-side">
      <p class="kicker">Nhánh thăng chức</p>
      <div class="filters" role="group" aria-label="Chọn nhánh thăng chức">
        {#each BRANCHES as b (b)}<button type="button" class="filter" aria-pressed={career.branch === b} onclick={() => setBranch(b as Branch)}>{BRANCH_NAMES[b]}</button>{/each}
      </div>
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
      <details class="ladder">
        <summary>Lộ trình nhánh ({ladder.filter((p) => cs.achieved.has(p.id)).length}/{ladder.length})</summary>
        <ol>
          {#each ladder as p (p.id)}
            <li class:done={cs.achieved.has(p.id)} class:cur={nx?.post.id === p.id}><span class="tier-tag">{TIER_NAMES[p.tier]}</span> {p.title} <span class="muted small">· {p.reqs.reduce((n, q) => n + q.count, 0)} sách</span></li>
          {/each}
        </ol>
        {#if cs.head}<p class="muted small">Đỉnh chung: <b>Chủ tịch nước</b> — cần đạt cấp Trung ương ở hai nhánh {cs.head.branchOk ? '✓' : ''} và {cs.head.post.reqs.reduce((n, q) => n + q.count, 0)} sách cấp 3.</p>{/if}
      </details>
    </div>
  </div>
  <details class="wardrobe">
    <summary>Tủ đồ chân dung</summary>
    {#each Object.keys(GROUP) as k (k)}
      {@const key = k as keyof Avatar}
      <p class="kicker">{GROUP[key]}</p>
      <div class="filters">
        {#each ALL[key] as v (v)}
          {@const open = (un[key] as string[]).includes(v)}
          <button type="button" class="filter" aria-pressed={av[key] === v} disabled={!open} title={open ? NAMES[v] : `${NAMES[v]} — chưa mở khoá`} onclick={() => pick(key, v)}>{open ? '' : '🔒 '}{NAMES[v]}</button>
        {/each}
      </div>
    {/each}
  </details>
</section>
