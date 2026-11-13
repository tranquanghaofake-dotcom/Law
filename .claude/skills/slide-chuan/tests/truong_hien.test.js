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
