// 27 ký hoạ nét mảnh quanh huy hiệu thẻ chuyên cần (viewBox 24×24, chỉ nét). 9 ngành × 3 hình, theo thứ tự sáng dần.
export const CARD_GLYPHS: { field: string; name: string; d: string }[] = [
  // Hiến pháp
  { field: 'Hiến pháp', name: 'dấu đoạn §', d: 'M15 6.5c-1-1.6-5.2-2-5.8.4c-.7 2.8 6.6 2.9 6.4 6.3c-.2 3-6.4 2.8-6.6.2M9 17.5c1 1.6 5.2 2 5.8-.4c.7-2.8-6.6-2.9-6.4-6.3' },
  { field: 'Hiến pháp', name: 'nghị trường', d: 'M5 11h14M6 11a6 3 0 0 1 12 0M7 11v6M10 11v6M14 11v6M17 11v6M4 19h16' },
  { field: 'Hiến pháp', name: 'hòm phiếu', d: 'M5 12h14v8H5zM9 12V5h6v7M9.5 8.5l1.7 1.7l3-3.4M8 15h8' },
  // Hành chính
  { field: 'Hành chính', name: 'con dấu', d: 'M10 4h4v6h-4zM7 10h10v4H7zM5 18h14M6 14v4M18 14v4' },
  { field: 'Hành chính', name: 'trụ sở', d: 'M4 20h16M6 20V10h12v10M9 20v-5h6v5M5 10l7-5l7 5M12 7.5v.1' },
  { field: 'Hành chính', name: 'hồ sơ một cửa', d: 'M5 6h6l2 2h6v11H5zM8 12h8M8 15h5' },
  // Dân sự
  { field: 'Dân sự', name: 'ngôi nhà', d: 'M4 11l8-6l8 6M6 10v9h12v-9M10 19v-5h4v5' },
  { field: 'Dân sự', name: 'hợp đồng', d: 'M6 3h9l3 3v15H6zM15 3v3h3M9 9h6M9 12h6M9 18q1.5-2 3 0t3-1' },
  { field: 'Dân sự', name: 'chìa khoá', d: 'M9 9a3.5 3.5 0 1 0 .1 0zM11.5 11.5L19 19M16 16l2-2M17.8 17.8l1.5-1.5' },
  // Hình sự
  { field: 'Hình sự', name: 'cán cân', d: 'M12 4v15M6 7h12M6 7l-3 6h6zM18 7l-3 6h6zM9 19h6' },
  { field: 'Hình sự', name: 'biên bản', d: 'M6 4h12v16H6zM9 8h6M9 11h6M9 14h3M14 16.5a1.6 1.6 0 1 0 .1 0' },
  { field: 'Hình sự', name: 'song sắt', d: 'M5 5h14v14H5zM9 5v14M12 5v14M15 5v14M5 12h14' },
  // Tố tụng
  { field: 'Tố tụng', name: 'toà án', d: 'M4 9l8-5l8 5zM6 9v9M10 9v9M14 9v9M18 9v9M4 20h16' },
  { field: 'Tố tụng', name: 'bục xét xử', d: 'M4 13h16v6H4zM6 13V9h12v4M9 9V6h6v3M8 16h8' },
  { field: 'Tố tụng', name: 'hồ sơ vụ án', d: 'M5 7h14v12H5zM8 7V5h8v2M5 11h14M10 11v2h4v-2' },
  // Lao động
  { field: 'Lao động', name: 'nhà máy', d: 'M3 20V11l5-3v3l5-3v3l5-3v12zM19 20V5h2v15M7 15h2M12 15h2' },
  { field: 'Lao động', name: 'mũ bảo hộ', d: 'M4 16h16M5 16a7 7 0 0 1 14 0M12 9V7M10 9.5V12M14 9.5V12' },
  { field: 'Lao động', name: 'phong bì lương', d: 'M4 7h16v11H4zM4 7l8 6l8-6M10 15h4' },
  // Thương mại – doanh nghiệp
  { field: 'Thương mại', name: 'bắt tay', d: 'M3 12l4-4l3 2l3-2l3 1l5 4M7 13l3 3M10 12l3 3M13 11l3 3M3 12l3 3' },
  { field: 'Thương mại', name: 'dấu doanh nghiệp', d: 'M12 4a8 8 0 1 0 .1 0zM12 8a4 4 0 1 0 .1 0zM10 12h4' },
  { field: 'Thương mại', name: 'biểu đồ nến', d: 'M4 20h16M7 6v12M12 4v12M17 8v10M5.5 9h3v5h-3zM10.5 7h3v6h-3zM15.5 10h3v5h-3z' },
  // Đất đai – môi trường
  { field: 'Đất đai', name: 'ruộng bậc thang', d: 'M3 19h18M4 16q8-3 16 0M5 13q7-3 14 0M7 10q5-3 10 0' },
  { field: 'Đất đai', name: 'mầm cây', d: 'M12 20v-9M12 13c-4 0-6-3-5-6c3 0 5 2 5 6zM12 11c3-1 5-3 4-6c-3 1-4 3-4 6M8 20h8' },
  { field: 'Đất đai', name: 'cột mốc', d: 'M9 20V8l3-4l3 4v12zM7 20h10M11 11h2M11 14h2' },
  // Hôn nhân – gia đình
  { field: 'Hôn nhân', name: 'hai nhẫn', d: 'M9 10a5 5 0 1 0 .1 0zM15 10a5 5 0 1 0 .1 0zM8 5l1-2l1 2' },
  { field: 'Hôn nhân', name: 'mái ấm', d: 'M4 12l8-7l8 7M7 10v9h10v-9M12 17c-2.5-1.5-3-3.5-1.5-4.3c.8-.4 1.5.2 1.5.8c0-.6.7-1.2 1.5-.8c1.5.8 1 2.8-1.5 4.3z' },
  { field: 'Hôn nhân', name: 'cây gia đình', d: 'M12 20v-8M12 12l-5-4M12 12l5-4M12 15l-3-2M7 8a1.8 1.8 0 1 0 .1 0zM17 8a1.8 1.8 0 1 0 .1 0zM12 6a1.8 1.8 0 1 0 .1 0zM9 13a1.4 1.4 0 1 0 .1 0z' },
];
