// Bộ hàm vẽ chi tiết dùng chung cho tranh (trả về chuỗi path SVG). Toạ độ tuyệt đối trong viewBox của tranh.
const f = (n: number) => +n.toFixed(1);

/** Mạch gạch: hàng ngang + mạch đứng so le. */
export function bricks(x: number, y: number, w: number, h: number, rh = 8, bw = 18): string {
  let d = '';
  for (let yy = y + rh; yy < y + h - 0.5; yy += rh) d += `M${f(x)} ${f(yy)}h${f(w)}`;
  let r = 0;
  for (let yy = y; yy < y + h - 0.5; yy += rh, r++) {
    const hh = Math.min(rh, y + h - yy);
    for (let xx = x + (r % 2 ? bw / 2 : bw); xx < x + w - 1; xx += bw) d += `M${f(xx)} ${f(yy)}v${f(hh)}`;
  }
  return d;
}

/** Hàng ngói: vạch đứng từ y1 xuống y2, nghiêng toả ra hai bên theo khoảng cách tới tâm. */
export function tiles(x1: number, x2: number, y1: number, y2: number, step = 6, flare = 0.06): string {
  const cx = (x1 + x2) / 2;
  let d = '';
  for (let x = x1; x <= x2 + 0.1; x += step) d += `M${f(x)} ${f(y1)}L${f(x + (x - cx) * flare)} ${f(y2)}`;
  return d;
}

/** Vành răng cưa mặt trống đồng (tam giác quanh vòng). */
export function ring(cx: number, cy: number, r0: number, r1: number, n: number): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i * Math.PI * 2) / n, b = a + Math.PI / n, c = a + (Math.PI * 2) / n;
    d += `M${f(cx + Math.cos(a) * r0)} ${f(cy + Math.sin(a) * r0)}L${f(cx + Math.cos(b) * r1)} ${f(cy + Math.sin(b) * r1)}L${f(cx + Math.cos(c) * r0)} ${f(cy + Math.sin(c) * r0)}z`;
  }
  return d;
}

/** Ngôi sao nhiều cánh ở tâm mặt trống. */
export function star(cx: number, cy: number, ro: number, ri: number, n: number): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i * Math.PI * 2) / n - Math.PI / 2, b = a + Math.PI / n;
    d += `${i ? 'L' : 'M'}${f(cx + Math.cos(a) * ro)} ${f(cy + Math.sin(a) * ro)}L${f(cx + Math.cos(b) * ri)} ${f(cy + Math.sin(b) * ri)}`;
  }
  return d + 'z';
}

/** Tia toả từ tâm (cửa sổ tròn, bánh xe). */
export function spokes(cx: number, cy: number, r0: number, r1: number, n: number, rot = 0): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = rot + (i * Math.PI * 2) / n;
    d += `M${f(cx + Math.cos(a) * r0)} ${f(cy + Math.sin(a) * r0)}L${f(cx + Math.cos(a) * r1)} ${f(cy + Math.sin(a) * r1)}`;
  }
  return d;
}

/** Vị trí + góc của n điểm quanh vòng (chim lạc quanh mặt trống). */
export function around(cx: number, cy: number, r: number, n: number): { x: number; y: number; deg: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i * Math.PI * 2) / n - Math.PI / 2;
    return { x: f(cx + Math.cos(a) * r), y: f(cy + Math.sin(a) * r), deg: f((a * 180) / Math.PI + 90) };
  });
}

/** Hàng lan can: thanh ngang trên/dưới + con tiện. */
export function balustrade(x: number, y: number, w: number, h: number, gap = 7): string {
  let d = `M${f(x)} ${f(y)}h${f(w)}M${f(x)} ${f(y + h)}h${f(w)}`;
  for (let xx = x + gap / 2; xx < x + w; xx += gap) d += `M${f(xx)} ${f(y)}v${f(h)}`;
  return d;
}

/** Gợn nước: các đoạn ngắn rải theo hàng. */
export function ripples(x: number, y: number, w: number, rows: number, seed = 1): string {
  let d = '';
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let r = 0; r < rows; r++) {
    const yy = y + r * 9;
    for (let xx = x + rnd() * 30; xx < x + w - 20; xx += 40 + rnd() * 50) d += `M${f(xx)} ${f(yy)}h${f(12 + rnd() * 26)}`;
  }
  return d;
}
