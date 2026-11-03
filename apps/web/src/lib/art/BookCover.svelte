<script lang="ts">
  // Bìa sách của môn (kế hoạch đợt 5 §1): mỗi môn một bìa cách điệu theo cuốn sách thật tương ứng (bảng `covers.ts`),
  // vẽ theo 5 khuôn — sách luật NXB bản mới (st-moi) / bản cũ (st-cu), Hiến pháp, giáo trình ĐH Luật Hà Nội (hlu),
  // giáo trình ĐH Luật TP.HCM (ulaw). viewBox 120×160 (3:4). Chung mọi khuôn: ruột sách kem lệch 3, gáy có khối, đáy
  // "ấn LL + LUYỆN LUẬT · GIÁO TRÌNH ĐIỆN TỬ" ở chỗ tên NXB, trạng thái (dải lụa + thanh tiến độ / dấu son "ĐẠT").
  // Không Quốc huy (thay bằng mặt trống đồng), không logo trường, không tên/logo NXB. Gradient/pattern dùng id riêng
  // mỗi bìa ($props.id()). Toàn SVG aria-hidden; tên môn thật nằm ở DOM bên ngoài.
  import { COVER_FIT, coverFor } from './covers';
  import { fitLines, TITLE_LINE_H } from '$lib/ui/bookCover';
  import { contrastRatio, mixBlack } from '$lib/ui/shelves';
  import { ring, star } from './kit';
  let { id, title, color, percent = 0, state = 'new', w = 108, class: cls = '' }: {
    id?: string; title: string; color: string; percent?: number; state?: 'new' | 'learning' | 'done'; w?: number; class?: string;
  } = $props();
  const uid = $props.id();

  const FONT = 'Be Vietnam Pro, system-ui, sans-serif';
  const SERIF = 'Noto Serif, Georgia, serif';
  const GOLD = '#F2C14E';
  const DRUM_RED = '#8E1B1B';
  const CX = 62.5; // giữa phần bìa trước (sau gáy 2–9, mép phải 116)

  const c = $derived(coverFor(id, title, color));
  const p = $derived(c.palette);
  const size = $derived(fitLines(c.title, COVER_FIT[c.kind]));
  const light = $derived(contrastRatio(p.body, '#000000') > 8);
  const shade = $derived(light ? '#FFFFFF' : mixBlack(p.body, 0.5)); // bóng chữ: sáng trên thân sáng (Thương mại), tối trên thân tối
  const fill = (key: string, plain: string, grad: string | undefined) => (grad ? `url(#${uid}-${key})` : plain);

  /** Mốc dọc theo khuôn: ranh giới khối trên/thân và đường chân dòng tên đầu tiên. */
  const SPLIT: Record<string, number> = { 'st-moi': 62, 'st-cu': 48, 'hien-phap': 62, 'giao-trinh-hlu': 60, 'giao-trinh-ulaw': 34 };
  const TITLE_TOP: Record<string, number> = { 'st-moi': 80, 'st-cu': 67, 'hien-phap': 70, 'giao-trinh-hlu': 69, 'giao-trinh-ulaw': 60 };
  const split = $derived(SPLIT[c.kind]);
  const lines = $derived.by(() => {
    const step = size * TITLE_LINE_H;
    let top = TITLE_TOP[c.kind];
    if (c.kind === 'giao-trinh-ulaw') top = 58 + Math.max(0, (46 - c.title.length * step) / 2); // giữa khung 56–102
    return c.title.map((text, i) => ({ text, y: top + i * step + size * 0.9 }));
  });
  const subY = $derived((lines.at(-1)?.y ?? 80) + (c.kind === 'giao-trinh-hlu' ? 12 : 11));

  // trống đồng cách điệu: tâm/bán kính theo khuôn
  const DRUM: Record<string, [number, number]> = { 'st-moi': [32, 15], 'st-cu': [24, 13.5], 'hien-phap': [33, 17] };
  const drum = $derived.by(() => {
    const d = DRUM[c.kind];
    if (!d) return null;
    const [cy, r] = d;
    return { cy, r, ring: ring(CX, cy, r * 0.69, r * 0.9, 18), star: star(CX, cy, r * 0.42, r * 0.17, 12) };
  });
  /** Nhãn kem bản mới: bề ngang theo số chữ. */
  const tagW = $derived(Math.min(80, c.label.length * 7.4 + 20));
  /** Hoa văn cuộn (bản mới), gốc ở mép nhãn, hướng ra ngoài bên trái; bên phải lật gương. */
  const FLOURISH = 'M0 -1.2C-2.6-3.4-6.2-3.6-8.4-1.6C-10.2 0-9.2 2.4-7.2 1.9C-5.8 1.5-6 -.2-7.3-.1M-8.4-1.6C-10.4-3.6-12.6-3.2-13.6-1.4M-2.8-2.4C-3.4-4.8-1.6-5.8-.4-5M-4.6-3C-4.2-5.4-6-6.2-7-5.2';
  const SCHOOL_HLU = 'TRƯỜNG ĐẠI HỌC LUẬT HÀ NỘI';
</script>

<svg class="book-cover {state} {cls}" data-kind={c.kind} viewBox="0 0 120 160" width={w} height={w * 4 / 3} aria-hidden="true" focusable="false">
  <defs>
    {#if p.topTo}<linearGradient id="{uid}-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color={p.top} /><stop offset="1" stop-color={p.topTo} /></linearGradient>{/if}
    {#if p.bodyTo}<linearGradient id="{uid}-body" x1="0" y1="0" x2="0" y2="1"><stop offset=".25" stop-color={p.body} /><stop offset="1" stop-color={p.bodyTo} /></linearGradient>{/if}
    {#if c.kind === 'st-cu'}
      <linearGradient id="{uid}-lab" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color={p.label} /><stop offset=".5" stop-color={p.labelTo ?? p.label} /><stop offset="1" stop-color={p.label} /></linearGradient>
    {:else if c.kind === 'st-moi'}
      <linearGradient id="{uid}-lab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color={p.label} /><stop offset="1" stop-color="#F2D27A" /></linearGradient>
    {/if}
    {#if c.pattern === 'luoi-cham'}
      <pattern id="{uid}-dot" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".45" fill="#fff" opacity=".2" /></pattern>
    {/if}
  </defs>
  <!-- ruột sách: khối giấy kem lệch 3 sang phải và xuống, vạch giả mép trang -->
  <rect x="5" y="3.5" width="114" height="155.5" rx="1.5" fill="#EFE6CF" stroke="#B5A98B" stroke-width=".6" />
  <path d="M117.1 7v149M118.1 8v148M8 156.9h108M9 157.9h107" stroke="#CFC3A5" stroke-width=".45" fill="none" />
  <!-- thân -->
  <rect x="2" y=".5" width="114" height="155" rx="2" fill={fill('body', p.body, p.bodyTo)} stroke={mixBlack(p.body, 0.45)} stroke-width=".8" />
  {#if c.pattern === 'luoi-cham'}<rect x="2" y={split} width="114" height={155.5 - split} fill="url(#{uid}-dot)" />{/if}
  {#if c.pattern === 'vong-mo'}
    <g fill="none" stroke="#fff" stroke-width="1.4" opacity=".09"><circle cx="78" cy="112" r="18" /><circle cx="78" cy="112" r="27" /><circle cx="78" cy="112" r="36" /></g>
  {/if}
  <!-- khối trên -->
  <path d="M2 {split}V2.5a2 2 0 0 1 2-2h110a2 2 0 0 1 2 2V{split}z" fill={fill('top', p.top, p.topTo)} />

  {#if c.kind === 'st-moi'}
    <g fill="none" stroke={DRUM_RED} stroke-width="1.6" opacity=".22">
      <path d="M2 18a16 16 0 0 0 16-17.5M2 28a26 26 0 0 0 26-27.5M2 38a36 36 0 0 0 36-37.5" />
      <path d="M116 18a16 16 0 0 1-16-17.5M116 28a26 26 0 0 1-26-27.5M116 38a36 36 0 0 1-36-37.5" />
    </g>
    <text x={CX} y="11.5" text-anchor="middle" font-size="6.5" font-weight="800" letter-spacing="1.4" fill={GOLD} font-family={FONT}>LUYỆN LUẬT</text>
  {:else if c.kind === 'giao-trinh-hlu'}
    <text x={CX} y="15" text-anchor="middle" font-size="5.6" font-weight="700" fill={p.topText} font-family={FONT}>{SCHOOL_HLU}</text>
    <path d="M30 19.5h65" stroke={p.topText} stroke-width=".4" opacity=".45" />
  {:else if c.kind === 'giao-trinh-ulaw'}
    <text x={CX} y="14.5" text-anchor="middle" font-size="5.8" font-weight="700" fill={p.topText} font-family={FONT}>TRƯỜNG ĐẠI HỌC LUẬT</text>
    <text x={CX} y="22" text-anchor="middle" font-size="5.8" font-weight="700" fill={p.topText} font-family={FONT}>TP. HỒ CHÍ MINH</text>
    <path d="M2 {split}h114" stroke="#fff" stroke-width=".5" opacity=".35" />
    <text x={CX} y="48" text-anchor="middle" font-size="7.5" font-weight="600" letter-spacing="2.4" fill={p.title} font-family={FONT}>{c.label}</text>
    <rect x="14" y="56" width="97" height="46" rx="1" fill={p.label} stroke="#fff" stroke-opacity=".3" stroke-width=".6" />
  {/if}

  {#if drum}
    <!-- mặt trống đồng cách điệu (thay Quốc huy) -->
    <circle cx={CX} cy={drum.cy} r={drum.r} fill={GOLD} stroke={DRUM_RED} stroke-width=".8" />
    <path d={drum.ring} fill={DRUM_RED} opacity=".85" />
    <circle cx={CX} cy={drum.cy} r={drum.r * 0.64} fill="none" stroke={DRUM_RED} stroke-width=".7" />
    <circle cx={CX} cy={drum.cy} r={drum.r * 0.55} fill="none" stroke={DRUM_RED} stroke-width=".4" stroke-dasharray="1 1.2" />
    <path d={drum.star} fill={DRUM_RED} />
  {/if}

  <!-- gáy có khối: phủ tối + vạch sáng mép + rãnh bản lề -->
  <path d="M9.2 .5H4a2 2 0 0 0-2 2v151a2 2 0 0 0 2 2h5.2z" fill="#000" opacity=".3" />
  <path d="M3.4 2v151.5" stroke="#fff" stroke-width=".5" opacity=".22" />
  <path d="M9.7 .5v155" stroke="#fff" stroke-width=".6" opacity=".35" />
  <path d="M10.6 .5v155" stroke="#000" stroke-width=".6" opacity=".2" />

  {#if c.kind === 'st-moi'}
    <!-- ranh giới vàng + hoa văn cuộn + nhãn kem -->
    <path d="M10.2 {split + 0.4}h105.8" stroke={GOLD} stroke-width=".8" />
    <g fill="none" stroke={GOLD} stroke-width=".8" stroke-linecap="round" opacity=".75">
      <path d={FLOURISH} transform="translate({CX - tagW / 2 - 1.5} {split - 1})" />
      <path d={FLOURISH} transform="translate({CX + tagW / 2 + 1.5} {split - 1}) scale(-1 1)" />
    </g>
    <rect x={CX - tagW / 2} y={split - 9} width={tagW} height="18" rx="2" fill="url(#{uid}-lab)" stroke="#D9A62A" stroke-width=".8" />
    <text x={CX} y={split + 3.9} text-anchor="middle" font-size="11" font-weight="800" letter-spacing=".4" fill={p.labelText} font-family={FONT}>{c.label}</text>
  {:else if c.kind === 'st-cu'}
    <!-- ruy băng: hai đuôi khía chữ V nằm sau, mép gấp tối, dải chính gradient -->
    {#each [0, 1] as side (side)}
      <g transform={side ? 'translate(125 0) scale(-1 1)' : undefined}>
        <path d="M21 {split - 4}H7.2l3.4 7.5l-3.4 7.5H21z" fill={mixBlack(p.label, 0.22)} />
        <path d="M21 {split + 8.5}l3.6 2.5v-2.5z" fill={mixBlack(p.label, 0.55)} />
      </g>
    {/each}
    <rect x="21" y={split - 8.5} width="83" height="17" fill="url(#{uid}-lab)" />
    <path d="M21 {split - 7.9}h83" stroke="#fff" stroke-width=".6" opacity=".35" />
    <path d="M21 {split + 8}h83" stroke="#000" stroke-width=".6" opacity=".2" />
    <text x={CX} y={split + 4.3} text-anchor="middle" font-size="11.5" font-weight="800" letter-spacing=".6" fill={p.labelText} font-family={FONT}>{c.label}</text>
  {:else if c.kind === 'giao-trinh-hlu'}
    <!-- dải GIÁO TRÌNH: đoạn vàng bên trái + đoạn màu -->
    <rect x="2" y={split - 14} width="24" height="14" fill="#F2CF1D" />
    <rect x="26" y={split - 14} width="90" height="14" fill={p.label} />
    <text x="71" y={split - 3.6} text-anchor="middle" font-size="10" font-weight="800" letter-spacing=".5" fill={p.labelText} font-family={FONT}>{c.label}</text>
  {/if}

  <!-- tên sách in hoa (có bóng) + dòng phụ -->
  {#if c.kind === 'hien-phap'}
    {@const big = c.title}
    <g text-anchor="middle" font-family={FONT} font-weight="800">
      <text x={CX + 0.8} y={88.8} font-size={size} fill={shade}>{big[0]}</text>
      <text x={CX} y={88} font-size={size} fill={p.title}>{big[0]}</text>
      <text x={CX} y={98} font-size="5" font-weight="700" fill={p.title}>{c.subtitle}</text>
      <text x={CX + 0.8} y={117.8} font-size={size} fill={shade}>{big[1]}</text>
      <text x={CX} y={117} font-size={size} fill={p.title}>{big[1]}</text>
    </g>
    <path d="M40 125h45" stroke={p.title} stroke-width=".5" opacity=".6" />
  {:else}
    {@const serif = c.kind === 'giao-trinh-ulaw'}
    <g text-anchor="middle" font-family={serif ? SERIF : FONT} font-weight={serif ? 600 : 800}>
      {#each lines as l, i (i)}
        {#if !serif}<text x={CX + 0.8} y={l.y + 0.8} font-size={size} fill={shade}>{l.text}</text>{/if}
        <text x={CX} y={l.y} font-size={size} fill={p.title}>{l.text}</text>
      {/each}
      {#if c.subtitle}
        <text x={CX} y={subY} font-size={c.kind === 'giao-trinh-hlu' ? 8 : 7} font-weight={c.kind === 'giao-trinh-hlu' ? 700 : 600} font-family={c.kind === 'giao-trinh-hlu' ? SERIF : FONT} fill={p.title}>{c.subtitle}</text>
      {/if}
    </g>
  {/if}

  <!-- đáy: ấn "LL" + dòng chữ ở chỗ tên NXB -->
  <circle cx="16.8" cy="146.6" r="4.6" fill={p.title} fill-opacity=".8" />
  <text x="16.8" y="148.4" text-anchor="middle" font-size="4.6" font-weight="800" fill={p.body} font-family={FONT}>LL</text>
  <text x="23.6" y="148.3" font-size="4.4" font-weight="600" fill={p.title} fill-opacity=".85" font-family={FONT}>LUYỆN LUẬT · GIÁO TRÌNH ĐIỆN TỬ</text>
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
