#!/usr/bin/env node
// Tạo bộ font của TẦNG HÌNH ẢNH trong hinh/fonts/ từ các file gốc ở stage/fonts/.
//   node hinh/tao_font.js
//
// Vì sao phải làm: PowerPoint nhúng font theo "họ". Hai file SemiBold và ExtraBold của Be Vietnam Pro tự khai trong bảng tên
// (name ID 16/17) rằng chúng CÙNG HỌ "Be Vietnam Pro" với bản thường, chỉ khác độ đậm. Windows gộp ba file thành một họ, nên khi
// PowerPoint tìm họ "Be Vietnam Pro SemiBold" thì có máy không thấy và thay bằng font mặc định.
// Cách xử lý: mỗi độ đậm thành MỘT HỌ ĐỘC LẬP, chỉ có kiểu Regular, đúng cấu trúc của Anton (font đã chạy tốt khi nhúng):
//   · đổi tên họ (ID 1, 3, 4, 6), bỏ ID 16/17, usWeightClass = 400, fsSelection = REGULAR, macStyle = 0;
//   · KHÔNG đụng tới nét chữ và mọi bảng khác — chỉ viết lại bảng `name`, sửa vài byte ở `OS/2` và `head`, tính lại checksum.
// Tên mới tránh các từ chỉ độ đậm tiếng Anh (Bold, SemiBold, Black…): Windows tự cắt các từ đó khỏi tên họ.
// Giấy phép: SIL OFL 1.1 cho phép sửa và phát hành lại; hai font không khai "Reserved Font Name". Giữ nguyên dòng bản quyền (ID 0)
// và giấy phép (ID 13, 14); ghi việc đã sửa ở ID 5 và trong hinh/fonts/GHI-CHU.txt.
const fs = require("fs"), path = require("path");
const SRC = path.join(__dirname, "..", "stage", "fonts"), OUT = path.join(__dirname, "fonts");

const JOBS = [
  { src: "Anton-Regular.ttf", out: "Anton-Regular.ttf" },                                              // giữ nguyên từng byte
  { src: "BeVietnamPro-Regular.ttf", out: "BeVietnamPro-Regular.ttf" },                                // giữ nguyên từng byte
  { src: "BeVietnamPro-SemiBold.ttf", out: "BeVietnam-Dam.ttf", family: "Be Vietnam Dam", ps: "BeVietnamDam" },      // đậm vừa (600)
  { src: "BeVietnamPro-ExtraBold.ttf", out: "BeVietnam-Nang.ttf", family: "Be Vietnam Nang", ps: "BeVietnamNang" }, // rất đậm (800)
];

const pad4 = (b) => (b.length % 4 ? Buffer.concat([b, Buffer.alloc(4 - (b.length % 4))]) : b);
const sum32 = (b) => { const p = pad4(b); let s = 0; for (let i = 0; i < p.length; i += 4) s = (s + p.readUInt32BE(i)) >>> 0; return s; };

function readSfnt(buf) {
  const n = buf.readUInt16BE(4), tables = [];
  for (let i = 0; i < n; i++) { const o = 12 + i * 16, off = buf.readUInt32BE(o + 8), len = buf.readUInt32BE(o + 12); tables.push({ tag: buf.toString("latin1", o, o + 4), data: Buffer.from(buf.subarray(off, off + len)) }); }
  return { version: buf.readUInt32BE(0), tables };
}
function writeSfnt({ version, tables }) {
  tables = tables.slice().sort((a, b) => (a.tag < b.tag ? -1 : 1));
  const n = tables.length, es = Math.floor(Math.log2(n)), sr = 2 ** es * 16;
  const head = Buffer.alloc(12 + n * 16); head.writeUInt32BE(version, 0); head.writeUInt16BE(n, 4); head.writeUInt16BE(sr, 6); head.writeUInt16BE(es, 8); head.writeUInt16BE(n * 16 - sr, 10);
  let off = head.length; const parts = [];
  tables.forEach((t, i) => {
    if (t.tag === "head") t.data.writeUInt32BE(0, 8);                    // checkSumAdjustment = 0 trước khi tính
    const o = 12 + i * 16; head.write(t.tag, o, "latin1"); head.writeUInt32BE(sum32(t.data), o + 4); head.writeUInt32BE(off, o + 8); head.writeUInt32BE(t.data.length, o + 12);
    const p = pad4(t.data); parts.push(p); t._off = off; off += p.length;
  });
  const file = Buffer.concat([head, ...parts]);
  const h = tables.find((t) => t.tag === "head"); file.writeUInt32BE((0xb1b0afba - sum32(file)) >>> 0, h._off + 8);
  return file;
}
function readNames(d) {
  const cnt = d.readUInt16BE(2), so = d.readUInt16BE(4), out = [];
  for (let i = 0; i < cnt; i++) { const o = 6 + i * 12, len = d.readUInt16BE(o + 8), of = d.readUInt16BE(o + 10);
    out.push({ pid: d.readUInt16BE(o), eid: d.readUInt16BE(o + 2), lid: d.readUInt16BE(o + 4), nid: d.readUInt16BE(o + 6), raw: Buffer.from(d.subarray(so + of, so + of + len)) }); }
  return out;
}
const be16 = (s) => Buffer.from(s, "utf16le").swap16();
function writeNames(recs) {
  recs = recs.slice().sort((a, b) => a.pid - b.pid || a.eid - b.eid || a.lid - b.lid || a.nid - b.nid);
  const hd = Buffer.alloc(6 + recs.length * 12); hd.writeUInt16BE(0, 0); hd.writeUInt16BE(recs.length, 2); hd.writeUInt16BE(hd.length, 4);
  let off = 0; const strs = [];
  recs.forEach((r, i) => { const o = 6 + i * 12; hd.writeUInt16BE(r.pid, o); hd.writeUInt16BE(r.eid, o + 2); hd.writeUInt16BE(r.lid, o + 4); hd.writeUInt16BE(r.nid, o + 6); hd.writeUInt16BE(r.raw.length, o + 8); hd.writeUInt16BE(off, o + 10); strs.push(r.raw); off += r.raw.length; });
  return Buffer.concat([hd, ...strs]);
}

function rename(buf, family, ps) {
  const f = readSfnt(buf);
  f.tables = f.tables.filter((t) => t.tag !== "DSIG");                    // chữ ký số (rỗng) không còn khớp sau khi sửa: bỏ
  const nm = f.tables.find((t) => t.tag === "name"), os2 = f.tables.find((t) => t.tag === "OS/2"), head = f.tables.find((t) => t.tag === "head");
  let recs = readNames(nm.data).filter((r) => r.pid === 3 && ![16, 17, 21, 22].includes(r.nid));
  const ver = recs.find((r) => r.nid === 5), verStr = ver ? Buffer.from(ver.raw).swap16().toString("utf16le") : "Version 1.000";
  const set = (nid, s) => { recs = recs.filter((r) => r.nid !== nid); recs.push({ pid: 3, eid: 1, lid: 0x409, nid, raw: be16(s) }); };
  set(1, family); set(2, "Regular"); set(3, `${verStr.replace(/^Version\s*/, "").split(";")[0]};LUAT;${ps}-Regular`); set(4, family); set(6, `${ps}-Regular`);
  set(5, `${verStr}; family renamed for PowerPoint embedding (outlines unchanged)`);
  nm.data = writeNames(recs);
  os2.data.writeUInt16BE(400, 4);                                         // usWeightClass
  os2.data.writeUInt16BE((os2.data.readUInt16BE(62) & ~0x21) | 0x40, 62); // fsSelection: bỏ ITALIC (bit 0) và BOLD (bit 5), bật REGULAR (bit 6)
  head.data.writeUInt16BE(0, 44);                                         // macStyle
  return writeSfnt(f);
}

fs.mkdirSync(OUT, { recursive: true });
for (const j of JOBS) {
  const src = fs.readFileSync(path.join(SRC, j.src)), out = j.family ? rename(src, j.family, j.ps) : src;
  fs.writeFileSync(path.join(OUT, j.out), out);
  console.log(`✓ ${j.out} (${out.length} byte) ${j.family ? `— họ mới “${j.family}”, từ ${j.src}` : "— giữ nguyên bản gốc"}`);
}
for (const l of ["OFL-Anton.txt", "OFL-BeVietnamPro.txt"]) fs.copyFileSync(path.join(SRC, l), path.join(OUT, l));
fs.writeFileSync(path.join(OUT, "GHI-CHU.txt"), `Font của tầng hình ảnh (hinh/) — tạo bằng: node hinh/tao_font.js

Anton-Regular.ttf          Anton 2.116 — nguyên bản (SIL OFL 1.1, xem OFL-Anton.txt).
BeVietnamPro-Regular.ttf   Be Vietnam Pro 1.002 Regular — nguyên bản (SIL OFL 1.1, xem OFL-BeVietnamPro.txt).
BeVietnam-Dam.ttf          Be Vietnam Pro 1.002 SemiBold, ĐÃ SỬA: tên họ đổi thành "Be Vietnam Dam", bỏ tên họ chung (name ID 16/17),
                           độ đậm khai báo = 400, kiểu = Regular. Nét chữ và mọi bảng khác giữ nguyên.
BeVietnam-Nang.ttf         Be Vietnam Pro 1.002 ExtraBold, ĐÃ SỬA y như trên; tên họ "Be Vietnam Nang".

Lý do sửa: để PowerPoint coi mỗi độ đậm là một họ font độc lập khi nhúng vào file .pptx (xem ghi chú đầu file hinh/tao_font.js).
Bản sửa vẫn theo SIL OFL 1.1: giữ nguyên dòng bản quyền và giấy phép trong font; không bán riêng font.
`);
