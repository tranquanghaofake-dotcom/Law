// Test tầng hình ảnh (hinh/): deck.json → PPTX thật có chữ sửa được, lớp ảnh, hiệu ứng và Morph gốc PowerPoint, font nhúng.
// Phần cần trình duyệt (dựng PPTX thật) tự bỏ qua nếu máy không có Playwright + Chromium.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const X = require("../hinh/xml");
const { dungHtml, dung } = require("../hinh/dung");
const { doiMau } = require("../hinh/bang_mau");
const canh = require("../hinh/canh");
const fontkit = require("fontkit");

// XML đúng cú pháp ở mức thẻ mở / đóng khớp nhau (đủ để bắt lỗi ghép chuỗi)
function wellFormed(xml) {
  const st = [];
  for (const m of xml.matchAll(/<(\/?)([\w:.-]+)((?:\s+[\w:.-]+="[^"<]*")*)\s*(\/?)>/g)) {
    if (m[1]) { if (st.pop() !== m[2]) return false; } else if (!m[4]) st.push(m[2]);
  }
  return st.length === 0 && !/<[^>]*</.test(xml.replace(/<\?xml[^>]*\?>/, ""));
}
const sample = () => JSON.parse(fs.readFileSync(path.join(ROOT, "examples/nghi-viec-hinh/deck.json"), "utf8"));
const sections = (html) => [...html.matchAll(/<section ([^>]*)>/g)].map((m) => m[1]);
const attr = (s, k) => (s.match(new RegExp(`${k}="([^"]*)"`)) || [])[1];

test("xml: Morph có phương án lùi cho bản không hiểu Morph; tự sang slide; chặn bấm", () => {
  const m = X.transition("morph", { dur: 900, auto: 0 });
  assert.ok(m.includes('<p159:morph option="byObject"/>') && m.includes("<mc:Fallback>") && m.includes("<p:fade/>"));
  assert.ok(m.includes('p14:dur="900"') && m.includes('advTm="0"'));
  assert.ok(wellFormed(m));
  assert.ok(X.transition("fade", { noClick: true }).includes('advClick="0"'));
  assert.strictEqual(X.transition("none"), "");
});

test("xml: chuỗi hiệu ứng — id không trùng, đủ mọi kiểu vào / ra / nhấn / đi, hộp chữ có bldP, nhóm theo lần bấm", () => {
  const all = ["appear", "fade", "wipe", "wipe-r", "up", "down", "stamp", "pop", "slam", "slide", "slide-r", "drop", "fall", "flip", "grow", "rise"];
  const fx = all.map((f, i) => ({ sp: String(10 + i), isText: i % 2 === 0, fx: f, at: i * 100 }));
  fx.push({ sp: "40", isText: true, fx: "appear", at: 50, out: 300 }, { sp: "41", isText: false, fx: "pop", at: 0, em: "teeter", emAt: 700 }, { sp: "42", isText: true, fx: "rise", at: 0, em: "pulse" },
    { sp: "43", isText: false, fx: "pop", at: 100, mv: { dx: 0.5, dy: 0, at: 400, dur: 1500 } }, { sp: "44", isText: true, fx: "wipe", at: 0, dur: 2000, lin: true, click: 1 });
  const t = X.timing(fx);
  assert.ok(wellFormed(t), "XML hiệu ứng phải khớp thẻ");
  const ids = [...t.matchAll(/<p:cTn id="(\d+)"/g)].map((m) => m[1]);
  assert.strictEqual(new Set(ids).size, ids.length, "id của cTn không được trùng");
  assert.ok(t.includes('presetClass="exit"') && t.includes('presetClass="emph"') && t.includes('presetClass="path"') && t.includes("<p:animMotion") && t.includes("<p:animRot"));
  assert.ok(t.includes('nodeType="clickEffect"') && t.includes('nodeType="afterEffect"'));
  assert.ok(t.includes('<p:bldP spid="10" grpId="0"') && t.includes('<p:bldP spid="40" grpId="1"') && !t.includes('<p:bldP spid="41"'), "chỉ hộp chữ mới cần bldP");
  assert.ok(/dur="2000"\/>/.test(t) || t.includes('dur="2000"'), "data-dur đổi được độ dài");
  assert.strictEqual(X.timing([]), "");
});

test("font: bốn họ độc lập, đều là kiểu Regular độ đậm 400, không khai họ chung — đúng cấu trúc đã chạy được khi nhúng", () => {
  const want = { "Anton-Regular.ttf": "Anton", "BeVietnamPro-Regular.ttf": "Be Vietnam Pro", "BeVietnam-Dam.ttf": "Be Vietnam Dam", "BeVietnam-Nang.ttf": "Be Vietnam Nang" };
  for (const [file, fam] of Object.entries(want)) {
    const f = fontkit.openSync(path.join(ROOT, "hinh/fonts", file));
    assert.strictEqual(f.familyName, fam); assert.strictEqual(f.subfamilyName, "Regular"); assert.strictEqual(f["OS/2"].usWeightClass, 400);
    assert.ok(!f.name.records.preferredFamily && !f.name.records.preferredSubfamily, `${file}: còn khai họ chung (name ID 16/17)`);
    for (const ch of "ẰẴậểỡữỵĐđ") assert.ok(f.hasGlyphForCodePoint(ch.codePointAt(0)), `${file} thiếu chữ ${ch}`);
  }
});

test("font nhúng: gói EOT giữ nguyên từng byte của file TTF, đầu file đúng đặc tả", () => {
  const ttf = fs.readFileSync(path.join(ROOT, "hinh/fonts/BeVietnam-Dam.ttf")), eot = X.ttfToEot(ttf);
  assert.ok(eot.subarray(eot.length - ttf.length).equals(ttf), "dữ liệu font phải trùng gốc");
  assert.strictEqual(eot.readUInt32LE(0), eot.length); assert.strictEqual(eot.readUInt32LE(4), ttf.length);
  assert.strictEqual(eot.readUInt32LE(8), 0x00020001); assert.strictEqual(eot.readUInt32LE(12), 0); assert.strictEqual(eot.readUInt16LE(34), 0x504c);
  const n = eot.readUInt16LE(82); assert.strictEqual(eot.subarray(84, 84 + n).toString("utf16le"), "Be Vietnam Dam");
});

test("bảng màu: đổi cả #hex lẫn rgba; tên sai thì báo các bảng có sẵn", () => {
  const f = doiMau("lam");
  assert.strictEqual(f("a:#0c1222;b:rgba(12, 18, 34, .3);c:rgba(12,18,34,.5)"), "a:#121a4b;b:rgba(18,26,75, .3);c:rgba(18,26,75,.5)");
  assert.strictEqual(doiMau("son")("#0c1222"), "#0c1222");
  assert.throws(() => doiMau("tim"), /son, luc, lam, nau/);
});

test("cảnh: tên lớp CSS không trùng bộ mẫu 65 type (trùng thì hai bên phá bố cục của nhau)", () => {
  const cls = (t) => new Set([...t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/url\([^)]*\)/g, "").matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));
  const A = cls(fs.readFileSync(path.join(ROOT, "stage/stage.css"), "utf8")), B = cls(canh.css);
  assert.deepStrictEqual([...B].filter((x) => A.has(x)).sort(), ["red", "s"]);
});

test("deck mẫu nghỉ việc: 11 slide deck.json → 20 slide PowerPoint, id không trùng, mọi liên kết có đích, không lộ giá trị rỗng", () => {
  const r = dungHtml(sample(), { deckDir: path.join(ROOT, "examples/nghi-viec-hinh") }), S = sections(r.html);
  assert.strictEqual(r.n, 20); assert.strictEqual(S.length, 20); assert.deepStrictEqual(r.generic, []);
  const ids = S.map((s) => attr(s, "data-id")); assert.strictEqual(new Set(ids).size, ids.length);
  for (const go of new Set([...r.html.matchAll(/data-go="([^"]+)"/g)].map((m) => m[1]))) assert.ok(ids.includes(go), `data-go="${go}" không trỏ tới slide nào`);
  // hình dán nhúng dạng data:…;base64 — bỏ phần mã hoá trước khi soát (chuỗi base64 có thể tình cờ chứa "NaN")
  assert.ok(!/\[object Object\]|undefined|NaN/.test(r.html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "").replace(/data:image\/svg\+xml;base64,[A-Za-z0-9+\/=]+/g, "")));
  assert.ok((r.html.match(/data:image\/svg\+xml;base64,/g) || []).length >= 30, "hình dán phải được nhúng từ kho hinh/emoji.json");
  // cảnh mở sách: 3 bước mở tự chạy + các bước soi tự chạy, bước cuối chờ bấm
  const auto = S.map((s) => attr(s, "data-auto")); assert.deepStrictEqual(auto.slice(0, 8), [undefined, "0", "0", "250", "290", "290", "290", undefined]);
  assert.strictEqual(attr(S[0], "data-trans"), "fade"); assert.ok(S.slice(1, 16).every((s) => attr(s, "data-trans") === "morph"));
  // vật đi xuyên slide
  for (const m of ["bia", "trang-trai", "kinh-mat", "do", "to-giay", "o-30", "hd-tear-off-calendar", "sach-nho", "ten-bai"]) assert.ok((r.html.match(new RegExp(`data-m="${m}"`, "g")) || []).length >= 2, `tên Morph "${m}" phải có ở ít nhất hai slide`);
  assert.ok(S.some((s) => /data-noclick/.test(s)), "slide trắc nghiệm phải chặn bấm sang slide");
});

test("cảnh: báo lỗi rõ khi điều cần tìm không có trong sách; chuyển cảnh và bảng màu đổi được", () => {
  const d = sample(); d.slides[0].find = 99;
  assert.throws(() => dungHtml(d), /find/);
  const d2 = sample(); d2.meta = { ...d2.meta, da: "none" };   // bảng màu (--mau) chỉ áp khi deck không dùng da; có da thì màu của da thắng
  const r = dungHtml(d2, { mau: "luc", chuyen: "fade" });
  assert.ok(r.html.includes("--ink: #0e2a22") && !/data-trans="morph"[^>]*data-tu/.test(r.html.split("</section>").slice(8).join("")));
});

test("65 type của bộ mẫu: mọi deck ví dụ dựng được HTML cho tầng hình ảnh, slide nào cũng được đánh dấu tự gắn nhãn", () => {
  for (const f of fs.readdirSync(path.join(ROOT, "examples")).filter((x) => x.endsWith(".json"))) {
    const d = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", f), "utf8")); if (!Array.isArray(d.slides)) continue;
    const r = dungHtml(d, { deckDir: path.join(ROOT, "examples") }), S = sections(r.html);
    assert.strictEqual(S.length, d.slides.length, f); assert.deepStrictEqual(r.generic, [], f);
    assert.ok(S.every((s) => /data-tu/.test(s) && attr(s, "data-id")), f);
  }
});

// ── dựng PPTX thật (cần Playwright + Chromium) ──
const chromiumPath = process.env.PW_CHROMIUM || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
let hasPw = true; try { require.resolve("playwright"); } catch { hasPw = false; }
test("dựng PPTX thật: chữ là hộp chữ sửa được, Morph và liên kết là tính năng gốc, font nhúng đủ, ảnh giống nhau chỉ lưu một lần", { skip: !hasPw && "không có Playwright", timeout: 240000 }, async () => {
  if (chromiumPath) process.env.PW_CHROMIUM = chromiumPath;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hinh-")), deckPath = path.join(dir, "thu.json");
  fs.writeFileSync(deckPath, JSON.stringify({ meta: { title: "Thử", short: "Bài thử" }, slides: [
    { type: "cover", id: "bia", title: "Bìa [thử] của bộ dựng, tiêu đề cố ý dài để phải xuống hai dòng", kicker: "Deck thử" },
    { type: "statement", id: "y", title: "Một ý [cốt lõi] duy nhất", sub: "Nền tối, không có hình trang trí; câu phụ này cố ý viết dài để chắc chắn phải xuống hai dòng trong hộp chữ của slide một ý duy nhất." },
    { type: "tiles", id: "cot", title: "Hai mức [báo trước]", cols: [{ n: 12, unit: "ngày", label: "Mức A", morph: true }, { n: 3, unit: "ngày", label: "Mức B" }] },
    { type: "strip", id: "dai", title: "Mười hai ngày", n: 12, marks: [{ head: "Bắt đầu", text: "Ngày một" }, { head: "Kết thúc", text: "Ngày mười hai" }] },
    { type: "quizgo", id: "hoi", title: "Mấy ngày?", options: [{ text: "Ba" }, { text: "Mười hai", ok: true }], right: { text: "Đúng là mười hai." }, next: "ml" },
    { type: "toc", id: "ml", title: "Mục lục", items: [{ go: "cot", text: "Cột" }, { go: "dai", text: "Dải ngày" }] },
  ] }));
  const quiet = console.log; console.log = () => {};
  let r; try { r = await dung({ deckPath, outPath: path.join(dir, "thu.pptx") }); } finally { console.log = quiet; }
  assert.strictEqual(r.slides, 8, "6 slide deck.json → 8 slide (trắc nghiệm nở thành 3)");
  const JSZip = require("jszip"), z = await JSZip.loadAsync(fs.readFileSync(r.outPath)), sl = async (n) => z.file(`ppt/slides/slide${n}.xml`).async("string"), rel = async (n) => z.file(`ppt/slides/_rels/slide${n}.xml.rels`).async("string");
  const s1 = await sl(1), s2 = await sl(2), s3 = await sl(3), s4 = await sl(4), s5 = await sl(5);
  for (const [x, words] of [[s1, ["Bìa", "thử"]], [s2, ["cốt lõi"]], [s3, ["12", "Mức A"]], [s4, ["Bắt đầu"]], [s5, ["Mười hai"]]]) for (const w of words) assert.ok(x.toLocaleLowerCase("vi").includes(w.toLocaleLowerCase("vi")), `chữ “${w}” phải nằm trong hộp chữ`);   // tiêu đề bìa được viết hoa
  for (const x of [s1, s2, s3, s4, s5]) assert.ok(wellFormed(x.replace(/<a:t>[^<]*<\/a:t>/g, "<a:t></a:t>")), "XML slide phải khớp thẻ");
  assert.ok(s3.includes("p159:morph") && s3.includes("<p:timing>"), "Morph và chuỗi hiệu ứng gốc");
  // hộp chữ MỘT dòng không tự xuống dòng (máy thiếu font → chữ rộng hơn nhưng con số không gãy đôi); hộp nhiều dòng vẫn tự xuống dòng để sửa chữ
  const boxes = (x) => [...x.matchAll(/<p:sp>[\s\S]*?<\/p:sp>/g)].map((m) => m[0]).filter((b) => b.includes("<a:t>"));
  const motDong = boxes(s2).find((b) => /cốt lõi/i.test(b)), coChu = (b) => Math.max(...[...b.matchAll(/ sz="(\d+)"/g)].map((m) => +m[1])), nhieuDong = [s1, s2, s3, s4, s5].flatMap(boxes).find((b) => (b.match(/<a:p>/g) || []).length > 1 && coChu(b) < 3300);
  assert.ok(motDong && /<a:bodyPr[^>]*wrap="none"/.test(motDong), "tiêu đề một dòng: wrap=none");
  assert.ok(nhieuDong && /<a:bodyPr[^>]*wrap="square"/.test(nhieuDong), "chữ thường nhiều dòng: wrap=square");
  const bia = boxes(s1).find((b) => /bìa/iu.test(b));
  assert.ok(bia && (bia.match(/<a:p>/g) || []).length > 1 && /<a:bodyPr[^>]*wrap="none"/.test(bia), "tiêu đề cỡ lớn nhiều dòng: wrap=none (dòng đã ngắt sẵn, không để trình mở file ngắt thêm)");
  for (let k = 1; k <= 12; k++) assert.ok(s3.includes(`name="!!o-${k}"`) && s4.includes(`name="!!o-${k}"`), `ô ${k} phải ghép Morph giữa cột và dải ngày`);
  assert.ok(s2.includes('name="!!td"') && s3.includes('name="!!td"') && s2.includes('name="!!ten-bai"'), "thanh tiến độ và tên bài chạy liền qua các slide");
  assert.ok((s5.match(/ppaction:\/\/hlinksldjump/g) || []).length >= 2 && /advClick="0"/.test(s5), "đáp án là liên kết nhảy slide; slide hỏi chặn bấm");
  // slide phản hồi "Chưa đúng" / "Chính xác!": tiêu đề hiện ra trùng nhau giữa các câu hỏi → tiêu đề ĐẦY ĐỦ đặt ngoài khung slide (cách Microsoft hướng dẫn), hộp chữ hiện giữ nguyên
  const s6 = await sl(6), s7 = await sl(7), tdAn = (x) => { const m = x.match(/<p:sp><p:nvSpPr><p:cNvPr id="\d+" name="Tiêu đề ẩn"[\s\S]*?<\/p:sp>/); return m ? m[0] : ""; };
  for (const [x, chu] of [[s6, "chưa đúng"], [s7, "chính xác"]]) { const t = tdAn(x);
    assert.ok(t && /<p:ph type="title"\/>/.test(t) && /<a:off x="\d+" y="-\d+"\/>/.test(t), "có tiêu đề ẩn nằm ngoài khung (y âm)");
    assert.ok(t.toLocaleLowerCase("vi").includes("mấy ngày?") && t.toLocaleLowerCase("vi").includes(chu), t.slice(0, 300));
    assert.equal((x.match(/<p:ph type="title"\/>/g) || []).length, 1, "chỉ một placeholder tiêu đề"); }
  // slide phản hồi là NHÁNH (chỉ nói khi người học chọn): tên slide trong PPTX ghi rõ — bản in ghi chú (scripts/ban_ghi_chu.py) không cộng giờ nhánh sai
  assert.match(s6, /<p:cSld name="Nhánh trắc nghiệm: sai[^"]*"/); assert.match(s7, /<p:cSld name="Nhánh trắc nghiệm: đúng[^"]*"/); assert.doesNotMatch(s5, /<p:cSld name="Nhánh/);
  // chữ Việt trong PowerPoint: font phụ Đông Á / phức hợp KHÔNG được mang bảng mã Trung Quốc (pptxgenjs mặc định GB2312 −122, Big5 −120 → PowerPoint
  // vẽ "ố, đ, ả, ư" bằng font Trung: ô vuông, chữ giãn); ngôn ngữ vi-VN (không gạch đỏ chính tả cả slide)
  for (let k = 1; k <= 8; k++) { const x = await sl(k);
    assert.doesNotMatch(x, /charset="-12[02]"/, `slide ${k}: còn bảng mã Trung Quốc ở font phụ`);
    assert.doesNotMatch(x, /lang="en-US"/, `slide ${k}: còn lang en-US`); assert.match(x, /lang="vi-VN"/); }
  const pres0 = await z.file("ppt/presentation.xml").async("string");
  assert.doesNotMatch(pres0, /lang="en-US"/, "kiểu chữ mặc định cũng vi-VN");
  assert.match(pres0, /<p:font typeface="[^"]+" panose="[0-9A-F]{20}" pitchFamily="\d+" charset="0"\/>/, "font nhúng khai họ + bảng mã để PowerPoint chọn font thay thế phương Tây nếu không nạp được");
  const pres = await z.file("ppt/presentation.xml").async("string"), emb = [...pres.matchAll(/<p:embeddedFont><p:font typeface="([^"]+)"/g)].map((m) => m[1]);
  const usedFaces = new Set(); for (let n = 1; n <= 8; n++) for (const m of (await sl(n)).matchAll(/<a:latin typeface="([^"]+)"/g)) usedFaces.add(m[1]);
  for (const f of usedFaces) assert.ok(emb.includes(f), `font “${f}” dùng mà không nhúng`);
  assert.ok(emb.length >= 2 && Object.keys(z.files).filter((k) => /^ppt\/fonts\/.*\.fntdata$/.test(k)).length === emb.length);
  // mọi quan hệ ảnh trỏ tới file có thật; 12 ô của một cột dùng chung MỘT ảnh
  for (let n = 1; n <= 8; n++) for (const m of (await rel(n)).matchAll(/Target="\.\.\/media\/([^"]+)"/g)) assert.ok(z.file("ppt/media/" + m[1]), `slide ${n}: thiếu ${m[1]}`);
  const r3 = Object.fromEntries([...(await rel(3)).matchAll(/Id="(rId\d+)"[^>]*Target="\.\.\/media\/([^"]+)"/g)].map((m) => [m[1], m[2]]));
  const tile = new Set([...s3.matchAll(/name="!!o-\d+"[\s\S]*?r:embed="(rId\d+)"/g)].map((m) => r3[m[1]])); assert.strictEqual(tile.size, 1, "các ô giống nhau phải dùng chung một ảnh");
  // hai nền khác nhau (bìa có hoạ tiết mờ, slide ý cốt lõi thì không) KHÔNG được gộp làm một
  const bg = async (n) => { const x = await sl(n), id = (x.match(/<p:bg>[\s\S]*?r:embed="(rId\d+)"/) || [])[1], rr = await rel(n); return (rr.match(new RegExp(`Id="${id}"[^>]*Target="\\.\\./media/([^"]+)"`)) || [])[1]; };
  assert.notStrictEqual(await bg(1), await bg(2), "nền hai slide khác nhau không được dùng chung ảnh");
});
