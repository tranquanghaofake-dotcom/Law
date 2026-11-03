<script lang="ts">
  // Bìa giáo trình v2 (spec phần nhìn đợt 4 §3.2, sửa theo bìa thật: Giáo trình ĐH Luật Hà Nội, Bộ luật NXB CTQG).
  // viewBox 120×160 (3:4). Lớp: ruột sách kem lệch 3 → bìa + gáy có khối → khối trên tint sáng màu kệ với mặt trống đồng
  // cách điệu → dải đỏ "GIÁO TRÌNH" có mép gấp → thân màu kệ, tên môn in hoa đậm tự co chữ (fitTitle) → huy hiệu số học phần
  // → đáy. Màu cố định như sách in (không đổi theo chế độ tối); ruột kem tách bìa khỏi nền tối. Không Quốc huy, không tên NXB
  // thật. Không id (không gradient/clipPath) để nhiều bìa trên một trang không đụng nhau. Toàn SVG aria-hidden; tên môn thật
  // nằm ở DOM bên ngoài.
  import { coverParts, fitTitle, TITLE_LINE_H } from '$lib/ui/bookCover';
  import { mixBlack, mixWhite } from '$lib/ui/shelves';
  import { ring, star } from './kit';
  let { title, color, percent = 0, state = 'new', w = 108, class: cls = '' }: {
    title: string; color: string; percent?: number; state?: 'new' | 'learning' | 'done'; w?: number; class?: string;
  } = $props();

  const GOLD = '#E2B23C';
  const RED = '#C8102E';
  const FONT = 'Be Vietnam Pro, system-ui, sans-serif';
  const CX = 62.5; // giữa phần bìa trước (sau gáy 2–9, mép phải 116)
  // charW 0,7: đo thật Be Vietnam Pro 800 in hoa có dấu ≈ 0,65–0,71 em/ký tự; vùng chữ 9,6–116 rộng ≈ 106.
  const FIT = { maxWidth: 102, maxLines: 3, maxSize: 17, minSize: 10, charW: 0.7, maxHeight: 52 };
  const parts = $derived(coverParts(title));
  const fit = $derived(fitTitle(parts.name, FIT));
  /** Bố cục dọc của thân: khối (dòng nhỏ + tên) căn giữa vùng 63–136, cùng một trục cho mọi bìa. */
  const layout = $derived.by(() => {
    const lineH = fit.size * TITLE_LINE_H;
    const kickerH = parts.kicker ? 13 : 0;
    const blockH = kickerH + fit.lines.length * lineH;
    const [top, bottom] = [63, 136];
    const mid = top + Math.max(0, (bottom - top - blockH) / 2);
    const y0 = parts.num ? Math.max(top, Math.min(mid, 117 - blockH)) : mid; // có huy hiệu: chừa góc dưới phải
    return { kickerY: y0 + 6.5, lines: fit.lines.map((l, i) => ({ text: l, y: y0 + kickerH + i * lineH + fit.size * 0.9 })) };
  });
  const kickerHalf = $derived(parts.kicker.length * 3.3 + 2.5);
  const tint = $derived(mixWhite(color, 0.82, '#FBF6EA'));
  const spine = $derived(mixBlack(color, 0.35));
  const shade = $derived(mixBlack(color, 0.5));
  const drum = { ring: ring(CX, 31, 7.2, 9.6, 16), star: star(CX, 31, 5, 2, 8) };
  const SCROLL = 'M24 52h-7c-2.2 0-3.4-1.4-3.4-2.8c0-1.3 1-2.2 2.2-2.2c1.1 0 1.8.8 1.8 1.7c0 .8-.6 1.3-1.3 1.3M17 52c-2.2 0-3.4 1.4-3.4 2.8c0 1.3 1 2.2 2.2 2.2c1.1 0 1.8-.8 1.8-1.7c0-.8-.6-1.3-1.3-1.3';
</script>

<svg class="book-cover {state} {cls}" viewBox="0 0 120 160" width={w} height={w * 4 / 3} aria-hidden="true" focusable="false">
  <!-- ruột sách: khối giấy kem lệch 3 sang phải và xuống, vạch giả mép trang -->
  <rect x="5" y="3.5" width="114" height="155.5" rx="1.5" fill="#EFE6CF" stroke="#B5A98B" stroke-width=".6" />
  <path d="M117.1 7v149M118.1 8v148M8 156.9h108M9 157.9h107" stroke="#CFC3A5" stroke-width=".45" fill="none" />
  <!-- bìa: thân màu kệ -->
  <rect x="2" y=".5" width="114" height="155" rx="2" fill={color} stroke={shade} stroke-width=".8" />
  <!-- khối trên tint sáng -->
  <path d="M2 44V2.5a2 2 0 0 1 2-2h110a2 2 0 0 1 2 2V44z" fill={tint} />
  <text x={CX} y="14" text-anchor="middle" font-size="7" font-weight="800" letter-spacing="1.4" fill={color} font-family={FONT}>LUYỆN LUẬT</text>
  <!-- mặt trống đồng cách điệu -->
  <circle cx={CX} cy="31" r="10.6" fill={GOLD} fill-opacity=".6" stroke={color} stroke-width=".9" />
  <path d={drum.ring} fill={color} opacity=".85" />
  <circle cx={CX} cy="31" r="6.6" fill="none" stroke={color} stroke-width=".6" />
  <path d={drum.star} fill={color} />
  {#if state === 'done'}
    <!-- dấu son "ĐẠT" -->
    <g transform="rotate(-12 102 19)">
      <circle cx="102" cy="19" r="9.5" fill="#B3261E" stroke="#7A1A15" stroke-width=".6" />
      <circle cx="102" cy="19" r="7.8" fill="none" stroke="#fff" stroke-width=".6" opacity=".9" />
      <text x="102" y="21.4" text-anchor="middle" font-size="6.4" font-weight="800" fill="#fff" font-family={FONT}>ĐẠT</text>
    </g>
  {/if}
  <!-- gáy có khối: dải tối + vạch sáng mép + rãnh bản lề -->
  <path d="M9.2 .5H4a2 2 0 0 0-2 2v151a2 2 0 0 0 2 2h5.2z" fill={spine} />
  <path d="M3.4 2v151.5" stroke="#fff" stroke-width=".5" opacity=".22" />
  <path d="M9.7 .5v155" stroke="#fff" stroke-width=".6" opacity=".35" />
  <path d="M10.6 .5v155" stroke="#000" stroke-width=".6" opacity=".2" />
  <!-- dải đỏ "GIÁO TRÌNH", thò ra 2 mỗi bên, mép gấp tối phía dưới -->
  <path d="M0 60h2v2.6zM118 60h-2v2.6z" fill="#8E0B21" />
  <rect x="0" y="44" width="118" height="16" fill={RED} />
  <path d="M0 45h118M0 59h118" stroke={GOLD} stroke-width=".7" />
  <g stroke="#fff" stroke-width=".7" fill="none" stroke-linecap="round" opacity=".6">
    <path d={SCROLL} />
    <path d={SCROLL} transform="translate({CX * 2} 0) scale(-1 1)" />
  </g>
  <text x={CX} y="55.3" text-anchor="middle" font-size="9" font-weight="800" letter-spacing="1.1" fill="#fff" font-family={FONT}>GIÁO TRÌNH</text>
  <!-- thân: dòng nhỏ + tên môn in hoa có bóng -->
  {#if parts.kicker}
    <path d="M{CX - kickerHalf - 9} {layout.kickerY - 2.2}h8M{CX + kickerHalf + 1} {layout.kickerY - 2.2}h8" stroke={GOLD} stroke-width=".7" />
    <text x={CX} y={layout.kickerY} text-anchor="middle" font-size="6.5" font-weight="600" letter-spacing="2" fill="#fff" fill-opacity=".85" font-family={FONT}>{parts.kicker}</text>
  {/if}
  <g text-anchor="middle" font-size={fit.size} font-weight="800" font-family={FONT}>
    {#each layout.lines as l, i (i)}
      <text x={CX + 0.9} y={l.y + 0.9} fill={shade}>{l.text}</text>
      <text x={CX} y={l.y} fill="#fff">{l.text}</text>
    {/each}
  </g>
  {#if parts.num}
    <!-- huy hiệu số học phần: phân biệt Dân sự 1/2, Thương mại 1/2, Lao động 1/2 -->
    <circle cx="101" cy="127" r="8.5" fill={GOLD} stroke={shade} stroke-width=".7" />
    <circle cx="101" cy="127" r="6.9" fill="none" stroke={color} stroke-width=".5" opacity=".7" />
    <text x="101" y="131" text-anchor="middle" font-size="11.5" font-weight="800" fill={color} font-family={FONT}>{parts.num}</text>
  {/if}
  <!-- đáy -->
  <path d="M15 141.5h95" stroke={GOLD} stroke-width=".5" opacity=".85" />
  <text x={CX} y="148.6" text-anchor="middle" font-size="4.6" font-weight="600" letter-spacing=".3" fill="#fff" fill-opacity=".8" font-family={FONT}>LUYỆN LUẬT · GIÁO TRÌNH ĐIỆN TỬ</text>
  {#if state === 'learning'}
    <!-- thanh tiến độ + dải lụa đánh dấu thò mép dưới -->
    <rect x="15" y="151.2" width="88" height="2.5" rx="1" fill="#000" opacity=".3" />
    <rect x="15" y="151.2" width={Math.max(2.5, 88 * Math.min(100, percent) / 100)} height="2.5" rx="1" fill={GOLD} />
    <path d="M108.4 137v23l2.6-2.6l2.6 2.6v-23z" fill="#C0282A" stroke="#7A1A15" stroke-width=".5" />
  {/if}
</svg>
