// CSS dùng chung của bài — lấy từ hệ thống thiết kế đã duyệt ở bài Ch3 (hướng "tư vấn pháp lý — khối phẳng"); lớp riêng của bài thêm trong deck.js.
module.exports = (P) => `section.s{background:${P.nen};color:${P.muc}}section.s.dam{background:${P.x1};color:${P.nen}}
section.s > div, section.s > h1{position:absolute}
[data-t]{text-wrap:pretty}.td,.bia-td,.mp-t,.hoi-td{text-wrap:balance}
em{font-style:normal;color:${P.x2}}em.v{color:${P.v1}}.dam em,.anh em{color:${P.x3}}.anh em.v{color:${P.v3}}
section.s.anh{background:${P.x1}}.td.sang{color:${P.nen}}.so-trang.sang,.dan.sang{color:${P.x4}}.trich.sang{color:${P.nen}}.trich.sang mark{background:none;color:${P.v3}}.trich.sang mark.xanh{background:none;color:${P.x3}}
.giua{display:flex;align-items:center}
.chip{font:700 28px/1 'Be Vietnam Pro';letter-spacing:.08em;text-transform:uppercase;color:${P.nen};background:${P.x1};padding:11px 18px 10px;border-radius:6px;white-space:nowrap;width:auto !important}
.chip.vang{background:${P.v3};color:${P.muc}}.chip.cot{width:156px !important;text-align:center;padding:10px 0;letter-spacing:0;text-transform:none;font-size:26px}
.chip.nt{font-size:30px;letter-spacing:0;text-transform:none;padding:10px 16px 9px}
.chip.vien{background:${P.v4};color:${P.muc}}
.td{font:700 72px/1.1 'Lora';color:${P.muc}}.dan{font:400 34px/1.4 'Be Vietnam Pro';color:${P.phu}}
.so-trang{font:600 24px/1 'Be Vietnam Pro';color:${P.phu};text-align:right}
.nguon{font:400 26px/1.4 'Be Vietnam Pro';color:${P.phu}}
.the,.the-trang{background:${P.trang};border-radius:20px}.the-vang{background:${P.v4};border-radius:24px}.bong{background:${P.x3};border-radius:22px}
.the-noi{background:${P.trang};border-radius:20px;border:2px solid ${P.ke}}.noi-t{font:800 32px/1.2 'Be Vietnam Pro';color:${P.x1}}.noi-m{font:400 30px/1.3 'Be Vietnam Pro';color:${P.phu}}
.gach{background:${P.v2};border-radius:6px}.vach{height:2px;background:${P.ke}}
.bia-chuong{font:700 48px/1.2 'Lora';color:${P.v1}}.bia-td{position:absolute;font:700 132px/1.06 'Lora';color:${P.muc}}
.bia-mo{font:400 32px/1.45 'Be Vietnam Pro';color:${P.phu}}.bia-by{font:600 28px/1.4 'Be Vietnam Pro';color:${P.phu}}
.o-so{background:${P.v2};border-radius:24px}.mp-so{font:700 200px/1.15 'Lora';color:${P.x1};text-align:center}
.mp-t{position:absolute;font:700 88px/1.08 'Lora';color:${P.nen}}.mp-m{font:400 32px/1.45 'Be Vietnam Pro';color:${P.x4}}
.la-t{font:800 32px/1.25 'Be Vietnam Pro';color:${P.x1};text-align:center}.la-m{font:400 32px/1.35 'Be Vietnam Pro';color:${P.phu};text-align:center}
.cap > b,.cap > span{display:block}.cap > span{margin-top:8px}
.nhan-vang{font:800 36px/1.2 'Be Vietnam Pro';color:${P.v1}}.dk-vang{font:600 32px/1.3 'Be Vietnam Pro';color:${P.v1}}
.lich{border:3px solid ${P.x4}}.lich-so{font:700 80px/1.15 'Lora';color:${P.v3}}.lich-m{font:700 34px/1.3 'Be Vietnam Pro';color:${P.x4}}.lich-o{font:700 40px/1 'Lora';color:${P.nen}}.lich-o.toi{color:${P.x1}}.lich-nhan{font:800 32px/1.2 'Be Vietnam Pro';color:${P.x1}}.lich-nhan.vang{color:${P.v1}}
.tren-thanh{font:800 28px/1 'Be Vietnam Pro';color:${P.x1}}.tren-thanh.vang{color:${P.v1}}.vd-ct{font:600 32px/1.2 'Be Vietnam Pro';color:${P.muc}}.vd-ct b{color:${P.v1}}.vd-ct .d{color:${P.d0}}.vd-ct i{font-style:normal;font-weight:800;color:${P.x1}}
.nhan-do{font:800 36px/1.2 'Be Vietnam Pro';color:${P.d0}}.dk-do{font:600 32px/1.3 'Be Vietnam Pro';color:${P.d0}}
.so-to{font:700 330px/1 'Lora';color:${P.x1}}.don-vi{font:700 64px/1 'Lora';color:${P.v1}}
.dai{background:${P.x1};border-radius:0 0 24px 24px}.dai-t{font:600 30px/1.3 'Be Vietnam Pro';color:${P.nen}}
.dong-t{font:800 34px/1.25 'Be Vietnam Pro';color:${P.muc}}.dong-t.do{color:${P.d0}}.dong-m{font:400 32px/1.35 'Be Vietnam Pro';color:${P.phu}}
.bh{background:${P.x1};border-radius:14px 14px 0 0}.bh-t{font:600 30px/1.2 'Be Vietnam Pro';color:${P.nen}}
.hang{background:${P.trang};border-bottom:3px solid ${P.ke}}.hang.nhan{background:${P.v4}}
.tab-t{font:800 32px/1.15 'Be Vietnam Pro';color:${P.nen}}.o-t{font:400 34px/1.3 'Be Vietnam Pro';color:${P.muc}}.o-nhan{font:600 28px/1 'Be Vietnam Pro';color:${P.phu}}.o-mau{display:inline-block;width:34px;height:16px;border-radius:4px;margin:0 12px 0 22px}.o-mau.x{background:${P.x4};margin-left:0}.o-mau.v{background:${P.v2}}.o-mau.d{width:4px;height:30px;background:${P.d4}}.o-do{font:700 28px/1 'Be Vietnam Pro';color:${P.d0}}
.trich{font:700 42px/1.45 'Lora';color:${P.muc}}
.trich mark{background:${P.v4};color:${P.v1};padding:0 2px}.trich mark.xanh{background:${P.x4};color:${P.x1}}
.dau-xanh{background:${P.x1};border-radius:20px 20px 0 0}.dau-vang{background:${P.v2};border-radius:20px 20px 0 0}
.the-td{font:700 44px/1.15 'Lora';color:${P.nen}}.the-td.toi{color:${P.muc}}
.the-nhan{font:700 28px/1.2 'Be Vietnam Pro';letter-spacing:.06em;text-transform:uppercase;color:${P.x1}}.the-chu{font:400 34px/1.35 'Be Vietnam Pro';color:${P.muc}}
.hoi-so{font:700 160px/1 'Lora';color:${P.x1}}.hoi-td{position:absolute;font:700 60px/1.15 'Lora';color:${P.muc}}
.pa{background:${P.trang};border-radius:16px;border:2px solid ${P.ke}}.pa-o{border-radius:16px 0 0 16px;background:${P.x1}}
.vd{background:${P.x1};border-radius:30px}.vd-x{background:${P.x4};border-radius:12px}.vd-v{background:${P.v4};border-radius:12px}.vd-d{background:${P.d4};border-radius:12px}.vd-k{background:${P.v3};border-radius:12px}
.vd-t{font:700 26px/1 'Be Vietnam Pro';color:${P.nen};text-transform:uppercase;letter-spacing:.06em}.vd-x-t,.vd-v-t,.vd-k-t{font:800 32px/1 'Be Vietnam Pro';color:${P.muc}}.vd-d-t{font:800 32px/1 'Be Vietnam Pro';color:${P.d0}}
.pa-chu{font:700 60px/1.15 'Lora';color:${P.nen};text-align:center}.pa-t{font:600 36px/1.3 'Be Vietnam Pro';color:${P.muc}}

.hoi-td.dien{font-size:40px;line-height:1.35}
.cau-anh{position:absolute;font:700 84px/1.12 'Lora';color:${P.nen};text-wrap:balance}.anh .cau-anh em{color:${P.v3}}.cau-anh-phu{font:500 36px/1.4 'Be Vietnam Pro';color:${P.x4}}
.hang-mt{background:${P.trang};border-radius:18px}.hang-mt.le{background:${P.x4}}.mt-so{font:700 48px/1.4 'Lora';color:${P.v1}}.mt-v{font:800 36px/1.2 'Be Vietnam Pro';color:${P.x1}}.mt-m{font:400 34px/1.3 'Be Vietnam Pro';color:${P.muc}}
.kc-so{font:700 96px/1.1 'Lora';color:${P.v3}}.kc-so.toi{color:${P.x1}}.kc-t{font:700 40px/1.15 'Lora';color:${P.muc}}.kc-m{font:400 30px/1.35 'Be Vietnam Pro';color:${P.phu}}
.ls-nam{font:700 56px/1.1 'Lora';color:${P.x1}}.ls-nam.vang{color:${P.v1}}.vn-nam{font:700 64px/1.1 'Lora';color:${P.x1}}.vn-nam.nhat{color:${P.phu}}
.vn-the{background:${P.trang};border-radius:20px;border:2px solid ${P.ke}}.vn-the.dac{background:${P.x1};border-color:${P.x1}}.vn-t{font:800 30px/1.25 'Be Vietnam Pro';color:${P.x1}}.vn-t.sang{color:${P.nen}}.vn-m{font:400 28px/1.35 'Be Vietnam Pro';color:${P.phu}}.vn-m.sang{color:${P.x4}}
.chu-lon{font:600 34px/1.3 'Be Vietnam Pro';color:${P.muc}}.so-lon{font:700 200px/1 'Lora'}.so-lon.xanh,.so-vua.xanh{color:${P.x1}}.so-lon.do,.so-vua.do{color:${P.d1}}.so-vua{font:700 80px/1 'Lora'}
.dai-nhat{background:${P.x4};border-radius:16px}.chot{font:700 34px/1.3 'Be Vietnam Pro';color:${P.x1}}.ev-t{font:600 34px/1.25 'Be Vietnam Pro';color:${P.muc}}
.pill-co{background:${P.x4};border-radius:34px}.pill-khong{background:${P.d4};border-radius:34px}.pill-co-t{font:800 32px/1 'Be Vietnam Pro';color:${P.x1}}.pill-khong-t{font:800 32px/1 'Be Vietnam Pro';color:${P.d0}}
.q-t{font:800 36px/1.2 'Be Vietnam Pro';color:${P.muc}}.q-m{font:400 32px/1.3 'Be Vietnam Pro';color:${P.phu}}.chip.do{background:${P.d0};color:${P.nen}}
.trich-vua{font:700 38px/1.45 'Lora';color:${P.muc}}.trich-vua.sang{color:${P.nen}}.ct-dau.sang{color:${P.v3}}.la-t.sang{color:${P.v3}}.la-m.sang{color:${P.x4}}.gach-doc{background:${P.v2};border-radius:5px}.the-xanh-nhat{background:${P.x4};border-radius:20px}.the-xanh{background:${P.x1};border-radius:20px}
.dai-do{background:${P.d4};border-radius:16px}.dai-do-t{font:700 32px/1.3 'Be Vietnam Pro';color:${P.d0}}
.venn-t{font:800 32px/1.2 'Be Vietnam Pro';color:${P.x1};text-align:center}.venn-t.dac{color:${P.muc}}.venn-t.vang{color:${P.v1}}.venn-t.nho{font-size:30px}
.so-khong-lo{font:700 360px/1 'Lora';color:${P.v3};text-align:right}.cau-dam{position:absolute;font:700 76px/1.12 'Lora';color:${P.nen};text-wrap:balance}.cau-dam-phu{font:400 34px/1.4 'Be Vietnam Pro';color:${P.x4}}
.nen-xanh-nhat{background:${P.x4};border-radius:20px 20px 0 0}.nhom-t{font:700 42px/1.15 'Lora';color:${P.muc}}.nhom-m{font:400 32px/1.3 'Be Vietnam Pro';color:${P.phu}}
.giay{background:${P.trang};border-radius:14px;border:2px solid ${P.ke}}.giay-bong{background:${P.x4};border-radius:14px}.tl-nhom{font:700 36px/1.2 'Lora';color:${P.x1}}.tl-so{font:700 44px/1.3 'Lora';color:${P.v1}}.tl-t{font:600 32px/1.25 'Be Vietnam Pro';color:${P.muc}}
.ct-t{font:800 32px/1.2 'Be Vietnam Pro';color:${P.x1}}.ct-t.sang{color:${P.nen}}.ct-m{font:400 28px/1.35 'Be Vietnam Pro';color:${P.phu}}.ct-m.sang{color:${P.x4}}.vd-dong{font:600 32px/1.3 'Be Vietnam Pro';color:${P.muc}}.the-gia{font:800 36px/1.2 'Be Vietnam Pro';color:${P.muc}}
.thanh-t{font:800 34px/1.2 'Be Vietnam Pro';color:${P.muc}}.thanh-t.sang{color:${P.nen}}.thanh-m{font:400 30px/1.3 'Be Vietnam Pro';color:${P.phu}}
.ct-chu{font:700 200px/1.2 'Lora';color:${P.nen};text-align:center}.ct-chu.toi{color:${P.muc}}.ct-dau{font:700 160px/1.2 'Lora';color:${P.v1};text-align:center}.dinh-nghia{font:600 32px/1.3 'Be Vietnam Pro';color:${P.x1}}
.cs-t{font:700 48px/1 'Lora';color:${P.nen}}.nhan-xanh{font:800 32px/1.2 'Be Vietnam Pro';color:${P.x1}}.nhan-do-dam{font:800 32px/1.2 'Be Vietnam Pro';color:${P.d0}}
.chuoi-t{font:800 32px/1 'Be Vietnam Pro';color:${P.nen}}.chuoi-nhan{font:700 30px/1.2 'Be Vietnam Pro';color:${P.x4};text-align:center}.chuoi-nhan.vang{color:${P.v3}}.chip.dai-chip{text-transform:none;letter-spacing:0;font-size:30px;padding:16px 22px}
.buoc-t{font:800 34px/1.2 'Be Vietnam Pro';color:${P.muc}}.buoc-m{font:400 30px/1.35 'Be Vietnam Pro';color:${P.phu}}
.khoi-goc{background:${P.x1};border-radius:16px}.goc-t{font:700 40px/1 'Lora';color:${P.nen}}.khoi-xanh{background:${P.x2};border-radius:16px}.khoi-vang{background:${P.v2};border-radius:16px}.nhanh-t{font:700 40px/1 'Lora';color:${P.nen}}.nhanh-t.toi{color:${P.muc}}
.la-the{background:${P.trang};border-radius:16px;border:2px solid ${P.ke}}.dai-x{background:${P.x2};border-radius:16px 16px 0 0}.dai-v{background:${P.v2};border-radius:16px 16px 0 0}
.trai{text-align:left !important}.phai{text-align:right !important}.vong-so{font:700 48px/1.6 'Lora';color:${P.x1};text-align:center}
.de-nhan{font:800 32px/1.2 'Be Vietnam Pro';letter-spacing:.06em;text-transform:uppercase;color:${P.x1}}.de-chu{font:400 34px/1.4 'Be Vietnam Pro';color:${P.muc}}
.o-loai{background:${P.x1};border-radius:14px}.o-loai-t{font:700 44px/1 'Lora';color:${P.nen}}.so-cot{font:700 40px/1.5 'Lora';color:${P.nen};text-align:center}.so-cot.toi{color:${P.muc}}
.dong-t.xanh{color:${P.x1}}.dong-t.vang{color:${P.v1}}.thuoc{font:600 28px/1 'Be Vietnam Pro';color:${P.phu};text-align:center}.thuoc-don{font:600 28px/1 'Be Vietnam Pro';color:${P.phu}}
.cong-t{font:700 34px/1.2 'Be Vietnam Pro';color:${P.x1}}.nhan-den{font:800 30px/1.2 'Be Vietnam Pro';color:${P.muc}}.de-so{font:700 96px/1 'Lora';color:${P.v1}}.de-tai{font:700 40px/1.25 'Lora';color:${P.muc}}
.tk-the{background:${P.x1};border-radius:18px}.tk-so{font:700 48px/1.4 'Lora';color:${P.v3}}.tk-t{font:700 32px/1.25 'Be Vietnam Pro';color:${P.nen}}
.panel-nen{background:${P.x4};border-radius:28px}.panel-toi{background:${P.x2};border-radius:28px}.the-toi{background:${P.x2};border-radius:20px}.dai-vang{background:${P.v2};border-radius:0 0 20px 20px}.dai-vang-t{font:700 32px/1.3 'Be Vietnam Pro';color:${P.muc}}
.can{text-align:center !important}.de-nhan.sang{color:${P.v3}}.de-chu.sang,.de-tai.sang,.dong-t.sang{color:${P.nen}}.de-so.sang{color:${P.v3}}.dong-t.v3{color:${P.v3}}.dong-t.x3{color:${P.x3}}.nguon.sang{color:${P.x4}}.vach.toi{background:${P.x2}}.bh-t.phai{justify-content:flex-end}.so-o{font:600 32px/1 'Be Vietnam Pro';color:${P.muc};font-variant-numeric:tabular-nums}.so-o.dau{font-weight:800;color:${P.x1}}.hang.le{background:${P.x4}}
`;
