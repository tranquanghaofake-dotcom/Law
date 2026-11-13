// Biểu đồ và bố cục ảnh của tầng hình ảnh — chuyển từ tầng Office cũ (11/2026).
const test = require("node:test"), assert = require("node:assert");
const { veBieuDo, KINDS } = require("../stage/bieu_do");
const { render } = require("../stage/templates");
const ctx = { img: (p) => (p ? "file:///anh/" + p : "") };
const R = (s) => render(s, { meta: {} }, ctx, 0, 1).html;

test("đủ 10 kind của tầng Office cũ, mỗi kind ra SVG", () => {
  for (const k of ["column", "bar", "line", "step", "waterfall", "gantt", "progress", "donut", "slope", "span"]) assert.ok(KINDS.includes(k), k);
  for (const k of KINDS) { const items = k === "span" ? [{ label: "A", from: "01/01/2015", to: "01/01/2017" }] : [{ label: "2020", value: 3, from: 0, to: 4, after: 5 }, { label: "2021", value: 5, from: 2, to: 6, after: 2 }];
    assert.match(veBieuDo({ kind: k, items }, 1200, 500).svg, /^<svg[\s\S]+<\/svg>$/, k); }
});

test("column: nguyên nhân tại năm thành hộp chữ thật đánh số, tối đa 4; số âm đi xuống màu xấu; dải giai đoạn có nhãn", () => {
  const items = [2015, 2016, 2017, 2018, 2019, 2020].map((y, i) => ({ label: String(y), value: i === 3 ? -2 : i + 1, why: i ? `lý do ${y}` : undefined }));
  const h = R({ type: "chart", kind: "column", title: "T", items, bands: [{ from: "2016", to: "2017", label: "COVID-19" }] });
  assert.equal((h.match(/class="card wy"/g) || []).length, 4, "chỉ 4 thẻ lý do");
  assert.ok(h.includes("lý do 2016") && !h.includes("lý do 2020"), "4 năm đầu có why");
  assert.ok(h.includes(">COVID-19<"), "nhãn dải giai đoạn");
  assert.ok(/<rect[^>]+fill="#e2402a"/.test(h), "cột âm màu xấu");
});

test("hatch = gạch chéo, annotate = vòng khoanh viết tay + câu", () => {
  const h = veBieuDo({ kind: "column", items: [{ label: "a", value: 2, hatch: true }, { label: "b", value: 3 }], annotate: { item: 0, text: "chưa chắc" } }, 1200, 500).svg;
  assert.ok(h.includes('fill="url(#gc)"') && h.includes('stroke-dasharray="14 9"'));
  assert.ok(h.includes(">chưa chắc<") && /<path d="M[^"]+" fill="#e2402a"/.test(h));
});

test("bố cục ảnh: bìa poster + thẻ dữ kiện, chương nền mờ / ảnh trong khung, số lớn trên ảnh, kết luận có ảnh, cảm ơn poster", () => {
  assert.ok(/class="s dark cover poster"[\s\S]*class="ph-full[\s\S]*class="facts"/.test(R({ type: "cover", title: "T", layout: "poster", photo: "a.jpg", facts: ["x", "y"] })));
  assert.ok(R({ type: "section", num: 1, title: "T", photo: "a.jpg", photoLayout: "backdrop" }).includes('class="ph-full ph-nhoe"'));
  const sk = R({ type: "section", num: 1, title: "T", photo: "a.jpg", frame: "arch" });
  assert.ok(/class="phk" data-in style="--i:\d+;[^"]*background-image:url\('file:\/\/\/anh\/a\.jpg'\);border-radius:999px/.test(sk), "khung vòm, một thuộc tính style");
  assert.ok(R({ type: "hero", num: "0,8", title: "T", photo: "a.jpg" }).includes('class="ph-full toi"'));
  assert.ok(R({ type: "closing", title: "T", answers: [{ q: "q", a: "a" }], photo: "a.jpg" }).includes('class="r rph"'));
  assert.ok(R({ type: "end", title: "Cảm ơn", photo: "a.jpg" }).includes('class="s dark end poster"'));
  assert.ok(R({ type: "agenda", title: "T", items: ["a"], photo: "a.jpg" }).includes('class="ag-ph"'));
});
