<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Tủ trưng bày bộ đồ theo chức danh: biển đồng ghi chức danh, ô kính có ảnh bộ đồ treo (ảnh tạo bằng AI trong Figma,
  // lưu ở static/art/tu/), bục gỗ bày sách và phụ kiện. Ảnh không có quân hàm, cấp hiệu, Quốc huy hay huân chương thật;
  // cầu vai kiểm sát là dải đỏ trơn. `avatar.outfit` là trang phục đã giải theo chức danh.
  import type { Avatar } from '$lib/game/wardrobe';
  import BookSpine from './BookSpine.svelte';
  import type { BookScheme } from '$lib/ui/shelf';
  import type { BookLevel } from '$lib/game/books';
  import { ring } from './kit';
  type ShelfBook = { key: string; scheme: BookScheme; level: BookLevel; label: string };
  let { avatar, title = 'Công dân', subtitle = '', books = [] }:
    { avatar: Avatar; title?: string; subtitle?: string; accent?: string; books?: ShelfBook[]; medals?: number } = $props();
  const IMAGES = ['thuong-phuc', 'cong-so', 'vest-xanh', 'vest-den', 'ao-choang', 'ks-xuan-he', 'ks-thu-dong', 'ao-dai'];
  const base = import.meta.env.BASE_URL ?? '/';
  const src = $derived(`${base}art/tu/${IMAGES.includes(avatar.outfit) ? avatar.outfit : 'thuong-phuc'}.webp`);
  const uid = `pt${++seq}`;
  const sparks = [[22, 30], [78, 24], [16, 62], [84, 58], [50, 14], [30, 80], [70, 78]];
</script>

<figure class="showcase fx-{avatar.effect}">
  <header class="sc-head">
    <p class="sc-plaque" style="--len:{title.length}">{title}</p>
    {#if subtitle}<p class="sc-sub">{subtitle}</p>{/if}
  </header>
  <div class="sc-window">
    <img class="sc-photo" {src} alt="" width="600" height="800" loading="lazy" decoding="async" />
    {#if avatar.effect === 'trong-dong' || avatar.effect === 'khung-vang' || avatar.effect === 'hat-sang'}
      <svg class="sc-drum" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <g class="sun-spin"><path d={ring(100, 100, 84, 96, 48)} fill="#e9c77a" /><circle cx="100" cy="100" r="76" fill="none" stroke="#e9c77a" stroke-width="2" stroke-dasharray="1.5 6" /></g>
      </svg>
    {/if}
    {#if avatar.effect === 'hat-sang'}
      {#each sparks as [x, y], i (i)}<span class="sc-spark" style="left:{x}%;top:{y}%;animation-delay:{i * 0.35}s"></span>{/each}
    {/if}
    <span class="sc-glass" aria-hidden="true"></span>
  </div>
  <div class="sc-plinth">
    <span class="sc-acc left" aria-hidden="true">
      {#if avatar.accessory === 'kinh'}
        <svg viewBox="0 0 48 24"><g fill="none" stroke="#e3c27a" stroke-width="2.2"><circle cx="13" cy="14" r="8" /><circle cx="35" cy="14" r="8" /><path d="M21 13h6M5 10l-4-4M43 10l4-4" /></g></svg>
      {:else if avatar.accessory === 'cap'}
        <svg viewBox="0 0 48 32"><rect x="3" y="8" width="42" height="22" rx="3" fill="#7a5233" stroke="#2a1d14" stroke-width="1.5" /><path d="M17 8V4h14v4M3 17h42" fill="none" stroke="#2a1d14" stroke-width="1.5" /><rect x="20" y="14" width="8" height="6" rx="1" fill="#e3c27a" /></svg>
      {:else if avatar.accessory === 'so'}
        <svg viewBox="0 0 40 32"><rect x="6" y="4" width="28" height="26" rx="2" fill="#8c2f28" stroke="#2a1d14" stroke-width="1.5" /><path d="M10 4v26" stroke="#e3c27a" stroke-width="1.5" /><rect x="15" y="10" width="14" height="5" fill="#e3c27a" opacity=".8" /></svg>
      {:else if avatar.accessory === 'but'}
        <svg viewBox="0 0 48 16"><path d="M4 10l34-4l6 2l-6 3l-34 1z" fill="#1d1d22" stroke="#e3c27a" stroke-width="1.2" /><path d="M10 8.5l16-2" stroke="#e3c27a" stroke-width="1" /></svg>
      {:else if avatar.accessory === 'huy-hieu'}
        <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="#e3c27a" stroke="#7a5a26" stroke-width="1.5" /><circle cx="16" cy="16" r="6" fill="none" stroke="#7a5a26" stroke-width="1.2" /><path d="M16 11v10M12 16h8" stroke="#7a5a26" stroke-width="1.2" /></svg>
      {/if}
    </span>
    <ul class="sc-books" aria-hidden="true">
      {#each books as b (b.key)}<li><BookSpine scheme={b.scheme} level={b.level} label={b.label} w={22} h={74} /></li>{/each}
      {#each Array(Math.max(0, 6 - books.length)) as _, i (i)}<li class="ghost"><span></span></li>{/each}
    </ul>
    <span class="sc-acc right" aria-hidden="true">
      <svg viewBox="0 0 40 40"><defs><linearGradient id="{uid}-br" x1="0" x2="1"><stop offset="0" stop-color="#9c7a3c" /><stop offset=".5" stop-color="#f1d896" /><stop offset="1" stop-color="#9c7a3c" /></linearGradient></defs>
        <g fill="none" stroke="url(#{uid}-br)" stroke-width="2" stroke-linecap="round"><path d="M20 6v28M8 11h24M8 11l-5 10h10zM32 11l-5 10h10zM14 34h12" /></g><circle cx="20" cy="5" r="2.2" fill="#f1d896" /></svg>
    </span>
  </div>
</figure>
