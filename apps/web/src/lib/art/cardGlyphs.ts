// 27 doodle nét đơn về pháp luật cho nền thẻ chuyên cần (viewBox 64×64, chỉ nét, không tô). 9 ngành × 3 hình.
// Không Quốc huy, cờ, búa gỗ; con dấu chỉ là vòng tròn và vạch, không mô phỏng dấu thật.
const ring = (cx: number, cy: number, r: number, n: number, len: number) =>
  Array.from({ length: n }, (_, k) => {
    const a = (k / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    return `M${(cx + c * r).toFixed(1)} ${(cy + s * r).toFixed(1)}L${(cx + c * (r + len)).toFixed(1)} ${(cy + s * (r + len)).toFixed(1)}`;
  }).join('');
const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
const flower = (cx: number, cy: number) => `M${cx} ${cy}l-2-4M${cx} ${cy}v-5M${cx} ${cy}l2-4`;

export const CARD_GLYPHS: { field: string; name: string; d: string }[] = [
  // Hiến pháp
  { field: 'Hiến pháp', name: 'dấu đoạn §', d: 'M14 6h28l10 10v42H14zM42 6v10h10M38 22q-3-5-9-4q-5 1-4 5q1 3 7 5q8 2 7 8q-1 4-6 4M28 42q3 5 9 4q5-1 4-5q-1-3-7-5q-8-2-7-8q1-4 6-4M19 14h14M19 52h10' },
  { field: 'Hiến pháp', name: 'nghị trường', d: 'M6 58h52M9 54h46M12 50h40M14 32v18M22 32v18M30 32v18M38 32v18M46 32v18M10 32h44l-3-4H13zM20 28a12 12 0 0 1 24 0M32 16V9M29 9h6M27 22q5-3 10 0' },
  { field: 'Hiến pháp', name: 'hòm phiếu', d: 'M10 30h44v26H10zM10 30l6-6h32l6 6M24 27h16M27 27l-2-17h15l-2 17M29 18l3 3l5-6M22 40h20v8H22zM26 44h12' },
  // Hành chính
  { field: 'Hành chính', name: 'con dấu', d: `${circle(32, 11, 6)}M28 17l-2 15h12l-2-15M18 32h28v9H18zM18 36h28M14 54a18 5 0 1 0 36 0a18 5 0 1 0-36 0M22 54h20M26 51h12M26 57h12` },
  { field: 'Hành chính', name: 'trụ sở', d: 'M6 58h52M11 58V30h42v28M7 30l25-15l25 15zM32 15V8M28 58V46h8v12M15 35h7v6h-7zM42 35h7v6h-7zM15 46h7v6h-7zM42 46h7v6h-7zM28 34h8v6h-8zM29 24a3 3 0 1 0 6 0a3 3 0 1 0-6 0' },
  { field: 'Hành chính', name: 'hồ sơ một cửa', d: `M8 24h16l4 4h28v28H8zM14 24v-8h32v12M18 16v-5h22v5M16 38h22M16 44h16M16 50h18${circle(48, 44, 6)}M47 42l2-1v7` },
  // Dân sự
  { field: 'Dân sự', name: 'ngôi nhà', d: 'M6 32L32 10l26 22M12 27v29h40V27M28 56V42h8v14M17 34h8v7h-8zM39 34h8v7h-8zM21 34v7M43 34v7M42 18v-7h5v11M4 56h56M10 22h4M50 22h4' },
  { field: 'Dân sự', name: 'hợp đồng', d: 'M12 6h30l8 8v42H12zM42 6v8h8M18 16h16M18 22h24M18 28h24M18 34h18M18 48q4-7 6 0t6-2q3-5 5 1t8-3M44 58l12-14l3 3l-12 14l-4 1z' },
  { field: 'Dân sự', name: 'chìa khoá', d: `${circle(18, 32, 11)}${circle(18, 32, 4)}M29 32h28M50 32v8M56 32v6M43 32v5M8 18q-4-6 2-10q6-3 8 4` },
  // Hình sự
  { field: 'Hình sự', name: 'cán cân', d: `M32 10v42M22 58h20M26 54h12M10 20q22-6 44 0M10 20l-6 15M10 20l6 15M2 35q8 7 16 0zM54 20l-6 15M54 20l6 15M46 35q8 7 16 0z${circle(32, 8, 2.5)}M28 30q4 3 8 0` },
  { field: 'Hình sự', name: 'biên bản', d: 'M14 10h36v48H14zM24 6h16v8H24zM20 24h4v4h-4zM28 26h16M20 34h4v4h-4zM28 36h16M20 44h4v4h-4zM28 46h12M21 26l1 1l2-2M21 36l1 1l2-2' },
  { field: 'Hình sự', name: 'song sắt', d: 'M10 10h44v44H10zM14 14h36v36H14zM21 14v36M28 14v36M36 14v36M43 14v36M14 32h36M6 58h52M50 4l2 4l4 1l-4 1l-2 4l-2-4l-4-1l4-1z' },
  // Tố tụng
  { field: 'Tố tụng', name: 'toà án', d: 'M6 26l26-14l26 14zM6 26h52M10 30h44M14 30v20M24 30v20M40 30v20M50 30v20M8 50h48M5 54h54M2 58h60M32 16v6M27 19h10M27 19l-2 4h4zM37 19l-2 4h4z' },
  { field: 'Tố tụng', name: 'bục xét xử', d: 'M4 40h56v18H4zM20 32h24v8H20zM12 40V26q4-5 8 0v14M28 32V20q4-5 8 0v12M44 40V26q4-5 8 0v14M10 48h12M26 48h12M42 48h12M2 58h60' },
  { field: 'Tố tụng', name: 'hồ sơ vụ án', d: 'M10 14h44v42H10zM14 10h36v4M32 14v42M10 36h44M32 36l-7-5v10zM32 36l7-5v10zM15 20h12v7H15zM37 20h12M37 25h9' },
  // Lao động
  { field: 'Lao động', name: 'nhà máy', d: 'M4 58h56M8 58V36l12-8v8l12-8v8l12-8v30M48 58V14h7v44M51 10q-5-4 0-6q5-2 2-6M12 44h6v6h-6zM24 44h6v6h-6zM36 44h6v6h-6z' },
  { field: 'Lao động', name: 'mũ bảo hộ', d: 'M12 42a20 20 0 0 1 40 0M6 42h52q0 6-5 6H11q-5 0-5-6zM32 22v20M25 24v18M39 24v18M28 22a4 4 0 0 1 8 0M14 54h36' },
  { field: 'Lao động', name: 'phong bì lương', d: `M6 24h44v32H6zM6 24l22 17l22-17M6 56l16-14M50 56l-16-14${circle(48, 16, 9)}${circle(48, 16, 5)}M45 13h6` },
  // Thương mại
  { field: 'Thương mại', name: 'bắt tay', d: 'M2 28h12v16H2zM50 24h12v16H50zM14 30q8-6 16-2l12 7q3 3 0 6l-12-5M50 28q-8-4-17-1l-5 4M14 42q6 7 15 7q6 0 10-4l11-9M27 47l4-4M32 49l4-4M37 47l3-3' },
  { field: 'Thương mại', name: 'dấu doanh nghiệp', d: `${circle(32, 32, 24)}${circle(32, 32, 16)}${ring(32, 32, 17.5, 28, 4.5)}M24 30h16M26 36h12` },
  { field: 'Thương mại', name: 'biểu đồ nến', d: 'M8 6v50h50M18 18v28M15 24h6v14h-6zM30 24v24M27 30h6v12h-6zM42 12v28M39 16h6v16h-6zM14 50l12-9l10 5l18-20M48 26h6v6' },
  // Đất đai
  { field: 'Đất đai', name: 'ruộng bậc thang', d: `M2 56q15-6 30-2t30-4M2 46q15-6 30-2t30-4M2 36q15-6 30-2t30-4M6 26q13-5 26-1t26-4${circle(50, 10, 5)}${flower(14, 52)}${flower(38, 42)}${flower(20, 32)}` },
  { field: 'Đất đai', name: 'mầm cây', d: 'M8 52q24-9 48 0M14 58h36M32 50V26M32 36q-15-2-17-15q15 0 17 15zM32 30q13-2 15-14q-13 0-15 14zM24 26q4 2 8 6M40 20q-4 4-8 8M50 34v3M14 40v3' },
  { field: 'Đất đai', name: 'cột mốc', d: 'M24 54V20q8-9 16 0v34M22 54h20M8 58h48M28 30h8M28 36h8M28 42h8M12 58l2-6l2 6M48 58l2-6l2 6' },
  // Hôn nhân và gia đình
  { field: 'Hôn nhân', name: 'hai nhẫn', d: `${circle(25, 38, 13)}${circle(39, 38, 13)}M32 10l-6 7l6 6l6-6zM26 17h12M10 14l-3-3M54 14l3-3M32 4v3` },
  { field: 'Hôn nhân', name: 'mái ấm', d: 'M6 32L32 10l26 22M12 27v29h40V27M32 50c-11-6-11-15-5-16c3 0 5 2 5 5c0-3 2-5 5-5c6 1 6 10-5 16zM4 56h56' },
  { field: 'Hôn nhân', name: 'cây gia đình', d: `M32 60V38M32 42l-12-10M32 42l12-10M32 38V26M24 60q8-4 8-10M40 60q-8-4-8-10${circle(20, 28, 5)}${circle(44, 28, 5)}${circle(32, 20, 5)}${circle(10, 16, 4)}${circle(54, 16, 4)}${circle(32, 7, 4)}M17 24l-4-5M47 24l4-5M32 15v-4` },
];
