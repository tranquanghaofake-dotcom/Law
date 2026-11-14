// Mọi trường CHUỖI mà engine/validate.js (SCHEMA) nhận cho một type thường phải hiện thành chữ trên slide khi dựng —
// trước 11/2026 có ~50 trường được kiểm hợp lệ rồi bị bỏ âm thầm (takeaway ở 28 type, pin, section.part / inside, chart.unit…).
// Ngoại lệ phải có lý do: trường chỉ dùng ở một biến thể (cần ảnh, cần toạ độ, kind khác), hoặc không phải chữ hiển thị.
const test = require("node:test"), assert = require("node:assert"), path = require("path");
process.env.SLIDE_CHUAN_NO_PREP = "1";
const R = path.join(__dirname, "..");
const { SCHEMA } = require("../engine/validate");
const { dungHtml } = require("../hinh/dung");
const T = require("../stage/templates");

// trường không phải chữ hiển thị (đường dẫn ảnh, mã, tên icon, chỉ dẫn bố cục…)
const KHONG_CHU = new Set(["icon", "photo", "photoAlt", "photoCredit", "photoSource", "photoStyle", "photoLayout", "photoMark", "cutout", "cutoutAlt", "alt", "url", "route", "side", "id", "emoji", "emoji2", "art", "frame", "kind", "tone", "go", "pick", "layout", "mode", "notes", "trans", "dur"]);
// có trong SCHEMA nhưng chỉ hiện ở biến thể khác với mẫu thử tối giản ở đây — kèm lý do; còn lại là việc tồn (ghi trong references/loi-da-biet-2026-11.md)
const NGOAI_LE = {
  "photo.photoMark.label": "chỉ khi có ảnh", "photo.callouts[0].label": "chỉ khi có ảnh", "split.photoMark.label": "chỉ khi có ảnh", "cover.photoMark.label": "chỉ khi có ảnh",
  "cover.mark": "bìa poster có ảnh", "cover.facts[0]": "bìa poster có ảnh",
  "map.places[0].name": "cần toạ độ / tỉnh hợp lệ", "map.places[0].label": "cần toạ độ / tỉnh hợp lệ", "map.places[0].note": "cần toạ độ / tỉnh hợp lệ", "map.groups[0].provinces[0]": "tên tỉnh, không phải chữ", "map.groups[0].note": "cần tỉnh hợp lệ",
  "chart.center": "chỉ kind donut", "chart.ends[0]": "chỉ kind slope", "chart.items[0].display2": "chỉ khi có value2", "chart.items[0].from": "kind gantt / span / slope", "chart.items[0].to": "kind gantt / span / slope",
  "chart.items[0].why": "chỉ kind column", "chart.markers[0].date": "chỉ kind span", "chart.markers[0].label": "chỉ kind span", "chart.bands[0].from": "chỉ kind column", "chart.bands[0].to": "chỉ kind column", "chart.bands[0].label": "chỉ kind column",
  "bignum.days[0]": "danh sách ngày (số)", "bignum.daysLabels[0]": "đi cùng days", "flow.edges[0].from": "mã nút", "flow.edges[0].to": "mã nút",
  "isotype.unit.short": "chỉ khi hàng không có display", "deadline.today": "dùng để tính, không in",
  "scene.timeline.ref": "mã tra deck.timelines, không phải chữ", "statement.artCaption": "chỉ khi slide mang hình lớn của da (mẫu thử có cutout) — test riêng ở dưới",
};
const ma = (p) => "QQ" + p.replace(/[^a-z0-9]/gi, "") + "ZZ";
function dien(sc, p, giu) {
  if (sc === "s" || sc === "s!") return giu === p ? ma(p) : "chữ";
  if (sc === "n" || sc === "n!") return 1; if (sc === "b") return true; if (sc === "icon") return "PiStar";
  if (sc && sc.enum) return sc.enum[0];
  if (Array.isArray(sc)) return [0, 1].map((i) => dien(sc[1], `${p}[${i}]`, giu));
  if (sc && typeof sc === "object") { const o = {}; for (const [k, v] of Object.entries(sc)) o[k] = dien(v, `${p}.${k}`, giu); return o; }
  return "chữ";
}
const truong = (sc, p, out) => { if (sc === "s" || sc === "s!") out.push(p); else if (Array.isArray(sc)) truong(sc[1], `${p}[0]`, out); else if (sc && typeof sc === "object" && !sc.enum) for (const [k, v] of Object.entries(sc)) truong(v, `${p}.${k}`, out); return out; };

test("mọi trường chuỗi validate.js nhận đều hiện trên slide (trừ ngoại lệ có lý do)", () => {
  const mat = [];
  for (const [type, sc] of Object.entries(SCHEMA)) { if (!T.TYPES.includes(type)) continue;
    for (const p of truong(sc, "", [])) { const k = p.split(".").pop().replace(/\[\d\]$/, ""), ten = `${type}${p}`;
      if (KHONG_CHU.has(k) || NGOAI_LE[ten]) continue;
      const h = dungHtml({ meta: { da: "giay" }, slides: [{ type: "cover", title: "B" }, { type, ...dien(sc, "", p) }] }, { deckDir: R }).html.split("<section").slice(2).join("")
        .replace(/data-[a-z-]+="[^"]*"|aria-label="[^"]*"|alt="[^"]*"|title="[^"]*"/g, "");
      if (!h.includes(ma(p))) mat.push(ten); } }
  assert.deepEqual(mat, [], `trường nhận mà không vẽ (vẽ ra, hoặc thêm vào NGOAI_LE kèm lý do):\n  ${mat.join("\n  ")}`);
});

test("statement.artCaption: chú thích ngay dưới hình lớn của da", () => {
  const h = dungHtml({ meta: { da: "giay" }, slides: [{ type: "cover", title: "B" }, { type: "statement", title: "T", artCaption: "CHÚ THÍCH HÌNH" }] }, { deckDir: R }).html;
  assert.match(h, /class="da-artcap" style="left:1520px;top:352px;width:300px">CHÚ THÍCH HÌNH</);
});

test("không thẻ nào mang hai thuộc tính style (cái sau bị bỏ → mất --i, khối hiện sai thứ tự)", () => {
  const fs = require("fs"); const ex = ["anh_va_chuong", "bai_tinh", "banan142", "bo_cuc_them", "bocuc_moi", "giay_to", "hub_pin", "kiemthu_con_lai", "khung_anh"];
  for (const n of ex) { const d = JSON.parse(fs.readFileSync(path.join(R, "examples", n + ".json"), "utf8"));
    const h = dungHtml(d, { deckDir: path.join(R, "examples") }).html.split("</style>").slice(-1)[0];
    const xau = (h.match(/<[a-zA-Z][^<>]*>/g) || []).filter((t) => (t.match(/\sstyle="/g) || []).length > 1);
    assert.deepEqual(xau.slice(0, 3), [], `${n}: thẻ có hai style`); }
});

test("quizgo.whyNot: mỗi phương án sai có slide phản hồi riêng nói vì sao sai; phương án thiếu lý do về slide chung", () => {
  const d = { meta: { da: "giay" }, slides: [{ type: "cover", title: "B" }, { type: "quizgo", id: "hoi", title: "Mấy ngày?",
    options: [{ text: "Ba" }, { text: "Mười hai", ok: true }, { text: "Bốn lăm" }], whyNot: ["LYDO_A là mức của hợp đồng dưới 12 tháng", null, null], wrong: { hint: "GOI_Y chung" } }] };
  const r = dungHtml(d, { deckDir: R }), h = r.html;
  assert.match(h, /data-go="hoi-sai-A"/, "đáp án A trỏ tới slide phản hồi riêng");
  assert.match(h, /data-go="hoi-sai"/, "đáp án C không có lý do → slide phản hồi chung");
  assert.ok(h.includes("LYDO_A"), "lý do của A phải hiện");
  assert.ok(!(r.khongDoc || []).some((k) => /whyNot/.test(k)), "whyNot không được báo là trường bị bỏ");
  assert.ok(h.indexOf("LYDO_A") < h.indexOf("GOI_Y chung"), "slide riêng đứng trước slide chung");
});

test("quizgo.whyNot: validate cảnh báo lý do đặt ở phương án đúng và lý do quá 3 dòng", () => {
  const { validate } = require("../engine/validate");
  const w = validate({ meta: {}, slides: [{ type: "cover", title: "B" }, { type: "quizgo", title: "Hỏi", options: [{ text: "a", ok: true }, { text: "b" }, { text: "c" }], whyNot: ["x", "y".repeat(140), "ngắn"] }] }, { extraTypes: ["quizgo"] }).warnings.filter((x) => /quizgo/.test(x));
  assert.equal(w.length, 2, w.join("\n"));
  assert.match(w[0], /whyNot\[0\] là phương án ĐÚNG/); assert.match(w[1], /whyNot\[1\] 140\/130/);
});

test("cảnh / bộ hình vẫn qua lint nội dung: quá 110 tiếng, tiêu đề là câu hỏi (trừ chương / bìa / slide hỏi), cụm đệm", () => {
  const { validate } = require("../engine/validate");
  const dai = Array.from({ length: 60 }, (_, k) => `chữ${k} thêm`).join(" ");
  const w = validate({ meta: {}, slides: [{ type: "cover", title: "B" },
    { type: "cases", title: "Bảy trường hợp nghỉ ngay", items: [{ text: dai }], source: "Nhìn chung là vậy" },
    { type: "chain", title: "Nghỉ ngang thì mất gì?" },
    { type: "bhchuong", title: "Ai phải đóng BHXH?" }, { type: "quizgo", title: "Báo trước bao lâu?" }, { type: "book", title: "Điều 35 nói gì về báo trước", items: [{ text: dai }] },
  ] }, { extraTypes: ["cases", "chain", "bhchuong", "quizgo", "book"] }).warnings;
  assert.ok(w.some((x) => /Slide 2 \(cases\): \d+ tiếng/.test(x)), "cases quá 110 tiếng phải bị báo");
  assert.ok(w.some((x) => /Slide 2 \(cases\).*nhìn chung/i.test(x)), "cụm đệm trong cảnh phải bị báo");
  assert.ok(w.some((x) => /Slide 3 \(chain\): tiêu đề là câu hỏi/.test(x)), "chain lấy câu hỏi làm tiêu đề phải bị báo");
  assert.ok(!w.some((x) => /Slide [45] /.test(x)), "chương bh và quizgo được hỏi ở tiêu đề");
  assert.ok(!w.some((x) => /Slide 6 \(book\): \d+ tiếng/.test(x)), "book là nguyên văn điều luật — không đếm tiếng");
});

test("bhhoi.whyNot: như quizgo — phương án sai có lý do được slide phản hồi riêng", () => {
  const d = { meta: { da: "so-bhxh" }, slides: [{ type: "bhbia", title: "B" }, { type: "bhhoi", id: "cau-hoi", title: "Nam đóng 15 năm được gì?",
    options: [{ text: "Rút một lần" }, { text: "Lương hưu 40%", ok: true }, { text: "Lương hưu 45%" }], whyNot: ["LYDO_A theo luật cũ", null, null], wrong: { title: "Chưa đúng", hint: "GOI_Y chung" } }, { type: "bhket", title: "K" }] };
  const r = dungHtml(d, { deckDir: R }), h = r.html;
  assert.match(h, /data-go="cau-hoi-sai-A"/); assert.match(h, /data-go="cau-hoi-sai"/);
  assert.ok(h.includes("LYDO_A") && h.includes("GOI_Y chung") && h.indexOf("LYDO_A") < h.indexOf("GOI_Y chung"));
  assert.ok(!(r.khongDoc || []).some((k) => /whyNot/.test(k)));
});

test("quizgo / bhhoi: chữ của slide phản hồi (whyNot, right, wrong) không cộng vào số tiếng của slide hỏi", () => {
  const { validate } = require("../engine/validate");
  const dai = Array.from({ length: 50 }, (_, k) => `từ${k}`).join(" ");
  for (const type of ["quizgo", "bhhoi"]) {
    const w = validate({ meta: {}, slides: [{ type: "cover", title: "B" }, { type, title: "Hỏi gì đó", options: [{ text: "a", ok: true }, { text: "b" }],
      whyNot: [null, "ngắn"], right: { text: dai }, wrong: { hint: dai } }] }, { extraTypes: [type] }).warnings;
    assert.ok(!w.some((x) => /tiếng trên slide/.test(x)), `${type}: ${w.join(" | ")}`); }
});

test("slide phản hồi của bhhoi / quizgo có ghi chú riêng (phương án vừa chọn + lý do / đáp án), không lặp ghi chú slide hỏi", () => {
  const ghi = (h, id) => { const m = h.match(new RegExp(`data-id="${id}"[^>]*data-notes="([^"]*)"`)); return m ? m[1] : ""; };
  const hoi = { id: "cau-hoi", title: "Nam đóng 15 năm được gì?", options: [{ text: "Rút một lần" }, { text: "Lương hưu 40%", ok: true }, { text: "Lương hưu 45%" }],
    whyNot: ["LYDO_A", null, null], wrong: { hint: "GOI_Y" }, right: { text: "GIAI_THICH" }, notes: "GHI_CHU_HOI" };
  for (const [da, type, bia, ket] of [["so-bhxh", "bhhoi", "bhbia", "bhket"], ["giay", "quizgo", "cover", "end"]]) {
    const h = dungHtml({ meta: { da }, slides: [{ type: bia, title: "B" }, { type, ...hoi }, { type: ket, title: "K" }] }, { deckDir: R }).html;
    assert.match(ghi(h, "cau-hoi"), /GHI_CHU_HOI/, `${type}: slide hỏi giữ ghi chú`);
    const a = ghi(h, "cau-hoi-sai-A"), s = ghi(h, "cau-hoi-sai"), d = ghi(h, "cau-hoi-dung");
    assert.ok(/A · Rút một lần/.test(a) && /LYDO_A/.test(a) && !/GHI_CHU_HOI/.test(a), `${type} sai-A: ${a}`);
    assert.ok(/GOI_Y/.test(s) && !/GHI_CHU_HOI/.test(s), `${type} sai: ${s}`);
    assert.ok(/B · Lương hưu 40%/.test(d) && /GIAI_THICH/.test(d) && !/GHI_CHU_HOI/.test(d), `${type} dung: ${d}`); }
});

test("slide hai bước (bh*): hai bước cùng tiêu đề hiện → tiêu đề ẩn '…' và '… (tiếp)' để không trùng tiêu đề slide", () => {
  const goc = require("../examples/so-bhxh/deck.json"), hai = goc.slides.find((s) => s.type === "bhrutngan");
  const q = console.log; console.log = () => {}; let h;
  try { h = dungHtml({ meta: { da: "so-bhxh" }, slides: [{ type: "bhbia", title: "B" }, hai, { type: "bhket", title: "K" }] }, { deckDir: path.join(R, "examples", "so-bhxh") }).html; } finally { console.log = q; }
  const an = [...h.matchAll(/data-tieu-de-an="([^"]*)"/g)].map((m) => m[1]), t = String(hai.title).replace(/[[\]]/g, "");
  assert.deepEqual(an, [t, `${t} (tiếp)`], an.join(" | "));
});
