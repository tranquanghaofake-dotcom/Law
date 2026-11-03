<!-- Bộ kit tranh (đợt 7): các gradient/bộ lọc dùng chung cho cảnh, tranh nhỏ và huy hiệu. Gắn MỘT lần ở App.
     Màu lấy từ token (một bảng màu sáng "Văn Miếu"). Ánh sáng chiếu từ góc trên-trái: mặt sáng ở trên-trái, tối dần xuống dưới-phải.
     kit.css dùng chúng qua `fill: url(#kg-…)` cho các lớp f-* trong `.art-lit`. -->
<svg class="kit-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">
  <defs>
    <!-- mặt phẳng sáng: trắng → xám ấm -->
    <linearGradient id="kg-card" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--card)" /><stop offset=".55" style="stop-color:var(--card)" /><stop offset="1" style="stop-color:var(--shade)" /></linearGradient>
    <linearGradient id="kg-cream" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--card) 70%, var(--cream))" /><stop offset=".6" style="stop-color:var(--cream)" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--cream) 75%, var(--ink))" /></linearGradient>
    <linearGradient id="kg-shade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--shade)" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--shade) 78%, var(--ink))" /></linearGradient>
    <linearGradient id="kg-seal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--seal) 80%, #fff)" /><stop offset=".5" style="stop-color:var(--seal)" /><stop offset="1" style="stop-color:var(--seal2)" /></linearGradient>
    <linearGradient id="kg-seal2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--seal2) 85%, #fff)" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--seal2) 82%, var(--ink))" /></linearGradient>
    <linearGradient id="kg-acc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--accent) 78%, #fff)" /><stop offset=".5" style="stop-color:var(--accent)" /><stop offset="1" style="stop-color:var(--acc2)" /></linearGradient>
    <linearGradient id="kg-acc2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--acc2) 85%, #fff)" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--acc2) 82%, var(--ink))" /></linearGradient>
    <linearGradient id="kg-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--gold) 70%, #fff)" /><stop offset=".5" style="stop-color:var(--gold)" /><stop offset="1" style="stop-color:var(--accent)" /></linearGradient>
    <linearGradient id="kg-leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--leaf) 80%, #fff)" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--leaf) 78%, var(--ink))" /></linearGradient>
    <linearGradient id="kg-leaf2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--leaf2) 75%, #fff)" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--leaf2) 82%, var(--ink))" /></linearGradient>
    <linearGradient id="kg-hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--hill)" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--hill) 70%, var(--hill2))" /></linearGradient>
    <linearGradient id="kg-hill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--hill2)" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--hill2) 82%, var(--ink))" /></linearGradient>
    <linearGradient id="kg-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--water) 70%, #fff)" /><stop offset="1" style="stop-color:var(--water)" /></linearGradient>
    <!-- ô cửa/khoảng tối: đáy ánh ấm của đèn bên trong -->
    <linearGradient id="kg-void" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--void)" /><stop offset=".7" style="stop-color:var(--void)" /><stop offset="1" style="stop-color:color-mix(in srgb, var(--void) 78%, var(--accent))" /></linearGradient>
    <linearGradient id="kg-lotus" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--lotus) 80%, #fff)" /><stop offset="1" style="stop-color:var(--lotus2)" /></linearGradient>
    <!-- mặt trời trống đồng: quầng sáng ở tâm -->
    <radialGradient id="kg-sun" cx="50%" cy="45%" r="62%"><stop offset="0" style="stop-color:color-mix(in srgb, var(--sun) 55%, #fff)" /><stop offset="1" style="stop-color:var(--sun)" /></radialGradient>
    <radialGradient id="kg-glow" cx="50%" cy="50%" r="50%"><stop offset="0" style="stop-color:var(--sun)" stop-opacity=".95" /><stop offset=".6" style="stop-color:var(--sun)" stop-opacity=".35" /><stop offset="1" style="stop-color:var(--sun)" stop-opacity="0" /></radialGradient>
    <radialGradient id="kg-haze" cx="50%" cy="50%" r="50%"><stop offset="0" style="stop-color:var(--hill2)" stop-opacity=".5" /><stop offset="1" style="stop-color:var(--hill2)" stop-opacity="0" /></radialGradient>
    <radialGradient id="kg-shadow" cx="50%" cy="50%" r="50%"><stop offset="0" style="stop-color:var(--ink)" stop-opacity=".2" /><stop offset="1" style="stop-color:var(--ink)" stop-opacity="0" /></radialGradient>
    <linearGradient id="kg-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--cream)" stop-opacity="0" /><stop offset=".55" style="stop-color:var(--cream)" stop-opacity=".85" /><stop offset="1" style="stop-color:var(--sun)" stop-opacity=".55" /></linearGradient>
    <linearGradient id="kg-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--hill2)" stop-opacity=".5" /><stop offset="1" style="stop-color:var(--hill)" stop-opacity=".1" /></linearGradient>
    <linearGradient id="kg-mid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--hill2)" stop-opacity=".62" /><stop offset="1" style="stop-color:var(--hill)" stop-opacity=".18" /></linearGradient>
    <linearGradient id="kg-sweepg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0" /><stop offset=".5" stop-color="#fff" stop-opacity=".28" /><stop offset="1" stop-color="#fff" stop-opacity="0" /></linearGradient>
    <linearGradient id="kg-edgeg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0" /><stop offset=".18" stop-color="#fff" /><stop offset=".82" stop-color="#fff" /><stop offset="1" stop-color="#fff" stop-opacity="0" /></linearGradient>
    <mask id="kg-edge" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="325"><rect width="520" height="325" fill="url(#kg-edgeg)" /></mask>
    <radialGradient id="kg-grainmask-g" cx="50%" cy="55%" r="50%"><stop offset=".5" stop-color="#fff" /><stop offset="1" stop-color="#fff" stop-opacity="0" /></radialGradient>
    <mask id="kg-grainmask" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="325"><rect width="520" height="325" fill="url(#kg-grainmask-g)" /></mask>
    <!-- vân giấy: nhiễu mịn, chỉ phủ vùng giữa tranh qua mặt nạ -->
    <filter id="kg-grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="7" /><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 -.18" /></filter>
  </defs>
</svg>
