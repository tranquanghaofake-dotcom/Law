<script lang="ts">
  // Bìa giáo trình v3 (spec phần nhìn đợt 4 §3.2, bố cục theo bìa sách luật NXB Chính trị quốc gia Sự thật: Bộ luật Hình sự,
  // Tố tụng hình sự, Dân sự). viewBox 120×160 (3:4). Lớp: ruột sách kem lệch 3 → bìa + gáy có khối → khối trên đỏ cờ (chung
  // mọi môn) với mặt trống đồng cách điệu thay Quốc huy → nhãn kem "GIÁO TRÌNH" đè ranh giới, hoa văn cuộn vàng hai bên →
  // thân màu kệ, tên môn in hoa tự co chữ (fitTitle) + "(HỌC PHẦN n)" → đáy: ấn "LL" + dòng chữ ở chỗ tên NXB.
  // Không Quốc huy, không sao kiểu Quốc kỳ, không tên/logo NXB thật. Gradient dùng id riêng mỗi bìa ($props.id()).
  // Toàn SVG aria-hidden; tên môn thật nằm ở DOM bên ngoài.
  import { coverParts, fitTitle, TITLE_LINE_H } from '$lib/ui/bookCover';
  import { coverStyle, mixBlack } from '$lib/ui/shelves';
  import { ring, star } from './kit';
  let { title, color, percent = 0, state = 'new', w = 108, class: cls = '' }: {
    title: string; color: string; percent?: number; state?: 'new' | 'learning' | 'done'; w?: number; class?: string;
  } = $props();
  const uid = $props.id();

  const FLAG = '#D42B2B';
  const FLAG_DARK = '#8E1B1B';
  const GOLD = '#F2C14E';
  const FONT = 'Be Vietnam Pro, system-ui, sans-serif';
  const CX = 62.5; // giữa phần bìa trước (sau gáy 2–9, mép phải 116)
  const SPLIT = 62; // ranh giới khối trên / thân
  // charW 0,7: đo thật Be Vietnam Pro 800 in hoa có dấu ≈ 0,65–0,71 em/ký tự; vùng chữ 9,6–116 rộng ≈ 106.
  const FIT = { maxWidth: 100, maxLines: 3, maxSize: 16, minSize: 10, charW: 0.7, maxHeight: 50 };
  const parts = $derived(coverParts(title));
  const fit = $derived(fitTitle(parts.name, FIT));
  const look = $derived(coverStyle(color));
  const shade = $derived(mixBlack(color, 0.5));
  const spine = $derived(mixBlack(color, 0.35));
  /** Tên môn đặt ngay dưới nhãn như bìa thật; dòng phụ "(HỌC PHẦN n)" dưới tên. */
  const lines = $derived(fit.lines.map((text, i) => ({ text, y: 81.5 + i * fit.size * TITLE_LINE_H + fit.size * 0.9 })));
  const subY = $derived((lines.at(-1)?.y ?? 81.5) + 12);
  const drum = { ring: ring(CX, 32, 10.4, 13.6, 18), star: star(CX, 32, 6.4, 2.6, 12) };
  /** Hoa văn cuộn bên trái nhãn, gốc ở mép nhãn (x 0) trên ranh giới; bên phải lật gương. */
  const FLOURISH = 'M0 -1.2C-2.6-3.4-6.2-3.6-8.4-1.6C-10.2 0-9.2 2.4-7.2 1.9C-5.8 1.5-6 -.2-7.3-.1M-8.4-1.6C-10.4-3.6-12.6-3.2-13.6-1.4M-2.8-2.4C-3.4-4.8-1.6-5.8-.4-5M-4.6-3C-4.2-5.4-6-6.2-7-5.2';
</script>

<svg class="book-cover {state} {cls}" viewBox="0 0 120 160" width={w} height={w * 4 / 3} aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="{uid}-tag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E7B5" /><stop offset="1" stop-color="#F2D27A" /></linearGradient>
    {#if look.fadeTo}
      <linearGradient id="{uid}-body" x1="0" y1="0" x2="0" y2="1"><stop offset=".3" stop-color={color} /><stop offset="1" stop-color={look.fadeTo} /></linearGradient>
    {/if}
  </defs>
  <!-- ruột sách: khối giấy kem lệch 3 sang phải và xuống, vạch giả mép trang -->
  <rect x="5" y="3.5" width="114" height="155.5" rx="1.5" fill="#EFE6CF" stroke="#B5A98B" stroke-width=".6" />
  <path d="M117.1 7v149M118.1 8v148M8 156.9h108M9 157.9h107" stroke="#CFC3A5" stroke-width=".45" fill="none" />
  <!-- bìa: thân màu kệ (kệ Hiến pháp: phai sang cam) -->
  <rect x="2" y=".5" width="114" height="155" rx="2" fill={color} stroke={shade} stroke-width=".8" />
  {#if look.fadeTo}<path d="M2 {SPLIT}h114v91.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="url(#{uid}-body)" />{/if}
  <!-- khối trên đỏ cờ, vân đỏ sẫm nhẹ ở hai góc -->
  <path d="M2 {SPLIT}V2.5a2 2 0 0 1 2-2h110a2 2 0 0 1 2 2V{SPLIT}z" fill={FLAG} />
  <g fill="none" stroke={FLAG_DARK} stroke-width="1.6" opacity=".22">
    <path d="M2 18a16 16 0 0 0 16-17.5M2 28a26 26 0 0 0 26-27.5M2 38a36 36 0 0 0 36-37.5" />
    <path d="M116 18a16 16 0 0 1-16-17.5M116 28a26 26 0 0 1-26-27.5M116 38a36 36 0 0 1-36-37.5" />
  </g>
  <text x={CX} y="11.5" text-anchor="middle" font-size="6.5" font-weight="800" letter-spacing="1.4" fill={GOLD} font-family={FONT}>LUYỆN LUẬT</text>
  <!-- mặt trống đồng cách điệu (thay Quốc huy) -->
  <circle cx={CX} cy="32" r="15" fill={GOLD} stroke={FLAG_DARK} stroke-width=".8" />
  <path d={drum.ring} fill={FLAG_DARK} opacity=".85" />
  <circle cx={CX} cy="32" r="9.6" fill="none" stroke={FLAG_DARK} stroke-width=".7" />
  <circle cx={CX} cy="32" r="8.2" fill="none" stroke={FLAG_DARK} stroke-width=".4" stroke-dasharray="1 1.2" />
  <path d={drum.star} fill={FLAG_DARK} />
  <!-- gáy có khối: dải tối + vạch sáng mép + rãnh bản lề -->
  <path d="M9.2 .5H4a2 2 0 0 0-2 2v151a2 2 0 0 0 2 2h5.2z" fill={spine} />
  <path d="M9.2 .5H4a2 2 0 0 0-2 2V{SPLIT}h7.2z" fill={FLAG_DARK} />
  <path d="M3.4 2v151.5" stroke="#fff" stroke-width=".5" opacity=".22" />
  <path d="M9.7 .5v155" stroke="#fff" stroke-width=".6" opacity=".35" />
  <path d="M10.6 .5v155" stroke="#000" stroke-width=".6" opacity=".2" />
  <!-- ranh giới vàng + hoa văn cuộn + nhãn kem "GIÁO TRÌNH" -->
  <path d="M10.2 {SPLIT + 0.4}h105.8" stroke={GOLD} stroke-width=".8" />
  <g fill="none" stroke={GOLD} stroke-width=".8" stroke-linecap="round" opacity=".75">
    <path d={FLOURISH} transform="translate(22.5 {SPLIT - 1})" />
    <path d={FLOURISH} transform="translate(102.5 {SPLIT - 1}) scale(-1 1)" />
  </g>
  <rect x="24" y={SPLIT - 9} width="77" height="18" rx="2" fill="url(#{uid}-tag)" stroke="#D9A62A" stroke-width=".8" />
  <text x={CX} y={SPLIT + 3.7} text-anchor="middle" font-size="10.5" font-weight="800" letter-spacing=".4" fill="#C8102E" font-family={FONT}>GIÁO TRÌNH</text>
  <!-- thân: tên môn in hoa có bóng + dòng phụ học phần -->
  <g text-anchor="middle" font-family={FONT} font-weight="800">
    {#each lines as l, i (i)}
      <text x={CX + 0.9} y={l.y + 0.9} font-size={fit.size} fill={shade}>{l.text}</text>
      <text x={CX} y={l.y} font-size={fit.size} fill={look.ink}>{l.text}</text>
    {/each}
    {#if parts.num}
      <text x={CX} y={subY} font-size="7" font-weight="700" letter-spacing=".3" fill={look.ink}>(HỌC PHẦN {parts.num})</text>
    {/if}
  </g>
  <!-- đáy: ấn "LL" + dòng chữ ở chỗ tên NXB -->
  <circle cx="16.8" cy="146.6" r="4.6" fill="#fff" fill-opacity=".72" />
  <text x="16.8" y="148.4" text-anchor="middle" font-size="4.6" font-weight="800" fill={color} font-family={FONT}>LL</text>
  <text x="23.6" y="148.3" font-size="4.4" font-weight="600" fill="#fff" fill-opacity=".85" font-family={FONT}>LUYỆN LUẬT · GIÁO TRÌNH ĐIỆN TỬ</text>
  {#if state === 'done'}
    <!-- dấu son "ĐẠT", viền trắng để nổi trên mọi màu thân -->
    <g transform="rotate(-12 101 126)">
      <circle cx="101" cy="126" r="9.5" fill="#B3261E" stroke="#fff" stroke-width="1.1" />
      <circle cx="101" cy="126" r="7.4" fill="none" stroke="#fff" stroke-width=".5" opacity=".9" />
      <text x="101" y="128.4" text-anchor="middle" font-size="6.4" font-weight="800" fill="#fff" font-family={FONT}>ĐẠT</text>
    </g>
  {:else if state === 'learning'}
    <!-- thanh tiến độ + dải lụa đánh dấu thò mép dưới -->
    <rect x="12.5" y="151.6" width="91" height="2.3" rx="1" fill="#000" opacity=".3" />
    <rect x="12.5" y="151.6" width={Math.max(2.3, 91 * Math.min(100, percent) / 100)} height="2.3" rx="1" fill={GOLD} />
    <path d="M108.4 134v26l2.6-2.6l2.6 2.6v-26z" fill="#C0282A" stroke="#7A1A15" stroke-width=".5" />
  {/if}
</svg>
