// Test: kiểu slide mới (flow, ledger), nền màu nhấn, hiệu ứng chuyển slide và kiểm tra "người nghe hiểu được gì".
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const { buildDeck, cover } = require("./helpers");

const flow = { type: "flow", title: "Ba bên nối nhau", nodes: [{ id: "A", name: "Bên A" }, { id: "B", name: "Bên B" }, { id: "C", name: "Bên C" }],
  edges: [{ from: "A", to: "B", label: "Bán" }, { from: "B", to: "A", label: "Trả tiền" }, { from: "B", to: "C", label: "Thế chấp" }] };
const ledger = { type: "ledger", title: "Người mua thiệt nhất", unit: "triệu", rows: [
  { name: "Người mua", steps: [{ label: "Trả", value: -850 }, { label: "Nhận", value: 500 }] },
  { name: "Người bán", steps: [{ label: "Nhận", value: 850 }] }] };

test("flow: edges trỏ tới id không có -> lỗi exit 2", () => {
  const r = buildDeck({ slides: [cover, Object.assign({}, flow, { edges: [{ from: "A", to: "Z", label: "x" }] })] });
  assert.strictEqual(r.code, 2, r.all); assert.ok(r.all.includes("edges[0].to") && r.all.includes('"Z"'), r.all);
});
test("ledger: value phải là số", () => {
  const r = buildDeck({ slides: [cover, { type: "ledger", title: "x y z", rows: [{ name: "A", steps: [{ label: "a", value: "-5" }] }] }] });
  assert.strictEqual(r.code, 2, r.all); assert.ok(r.all.includes("steps[0].value"), r.all);
});
test("mode a hợp lệ, mode lạ thì lỗi", () => {
  const r = buildDeck({ slides: [cover, Object.assign({ mode: "a" }, ledger)] });
  assert.strictEqual(r.code, 0, r.all); assert.ok(r.all.includes("duy nhất nền màu nhấn"), r.all); // hợp lệ nhưng một slide nhấn lẻ loi thì cảnh báo
  assert.strictEqual(buildDeck({ slides: [cover, Object.assign({ mode: "x" }, ledger)] }).code, 2);
});
test("tiêu đề là nhãn -> cảnh báo", () => {
  const r = buildDeck({ slides: [cover, Object.assign({}, ledger, { title: "Tổng quan" })] });
  assert.ok(r.all.includes("tiêu đề là nhãn"), r.all);
});
test("cụm đệm -> cảnh báo nêu đúng trường", () => {
  const r = buildDeck({ slides: [cover, Object.assign({}, ledger, { note: "Có thể thấy người mua thiệt" })] });
  assert.ok(r.all.includes("note") && r.all.includes("có thể thấy"), r.all);
});
test("slide quá nhiều tiếng -> cảnh báo", () => {
  const item = Array(40).fill("a").join(" "); // 3 x 40 tiếng + 4 tiếng tiêu đề = 124
  const r = buildDeck({ slides: [cover, { type: "agenda", title: "Ba câu hỏi chính", items: [item, item, item] }] });
  assert.ok(r.all.includes("124 tiếng trên slide"), r.all);
});
test("motif hợp lệ dựng được; motif lạ -> lỗi", () => {
  for (const m of ["none", "cadastral", "certificate", "landscape", "contour", "dots", "lines", "waves", "blobs", "grid"]) assert.strictEqual(buildDeck({ meta: { motif: m }, slides: [cover, ledger] }, ["--strict"]).code, 0, m);
  const r = buildDeck({ meta: { motif: "nui" }, slides: [cover] }); assert.strictEqual(r.code, 2); assert.ok(r.all.includes("meta.motif"), r.all);
});
test("motifLabel không đi với cadastral -> cảnh báo", () => {
  assert.ok(buildDeck({ meta: { motif: "landscape", motifLabel: "Thửa 1" }, slides: [cover] }).all.includes("motifLabel"));
});
test("chart: bar/donut/span dựng được; span sai ngày -> lỗi; thiếu insight -> cảnh báo", () => {
  const base = { type: "chart", title: "Người mua chờ gần năm năm", insight: { value: "59", text: "tháng tố tụng" } };
  const ok = [Object.assign({ kind: "bar", items: [{ label: "A", value: 3 }, { label: "B", value: 5, focus: true }] }, base),
    Object.assign({ kind: "donut", items: [{ label: "A", value: 3 }, { label: "B", value: 5 }] }, base),
    Object.assign({ kind: "span", items: [{ label: "Sơ thẩm", from: "23/9/2014", to: "20/11/2018" }], markers: [{ date: "01/01/2017", label: "Luật mới" }] }, base)];
  const r0 = buildDeck({ slides: [cover, ...ok] }, ["--strict"]); // biểu đồ đứng một mình (không cần bảng trước) vẫn qua --strict
  assert.strictEqual(r0.code, 0, r0.all);
  const bad = buildDeck({ slides: [cover, Object.assign({ kind: "span", items: [{ label: "A", from: "2014", to: "x" }] }, base)] });
  assert.strictEqual(bad.code, 2); assert.ok(bad.all.includes("items[0].from"), bad.all);
  const noIns = buildDeck({ slides: [cover, { type: "chart", kind: "bar", title: "So sánh hai khoản tiền", items: [{ label: "A", value: 1 }] }] });
  assert.ok(noIns.all.includes("insight"), noIns.all);
});
test("bignum days: vẽ lịch; quá 31 ngày -> cảnh báo", () => {
  const b = { type: "bignum", title: "Chỉ mười bốn ngày sau", num: "14", days: ["09/9/2014", "23/9/2014"], daysLabels: ["Có GCN", "Khởi kiện"] };
  assert.strictEqual(buildDeck({ slides: [cover, b] }, ["--strict"]).code, 0);
  assert.ok(buildDeck({ slides: [cover, Object.assign({}, b, { days: ["01/01/2014", "01/06/2014"] })] }).all.includes("2–31 ngày"));
});

test("bảng/biểu đồ: không đòi nguồn, 1 giá trị, bảng ít dữ liệu, bảng không chỉ chỗ nhìn, trùng dữ liệu liền kề -> cảnh báo", () => {
  const r = buildDeck({ slides: [cover, { type: "chart", kind: "bar", title: "So sánh hai khoản tiền", items: [{ label: "A", value: 1 }], insight: { value: "1" } }] });
  assert.ok(!r.all.includes('thiếu "source"') && r.all.includes("chỉ 1 giá trị"), r.all);
  assert.ok(!r.all.includes('phải đi sau một slide "table"'), "đã bỏ luật bắt buộc bảng trước biểu đồ");
  const tb = { type: "table", title: "Thời hạn thông báo thu hồi", cols: [{ label: "Loại" }, { label: "Trước" }, { label: "Sau" }], rows: [["Nông nghiệp", "90", "60"], ["Phi nông nghiệp", "180", "120"]] };
  const t1 = buildDeck({ slides: [cover, tb] });
  assert.ok(t1.all.includes("bảng chỉ 2 hàng") && t1.all.includes("không chỉ người đọc nhìn vào đâu"), t1.all);
  const slope = { type: "chart", kind: "slope", title: "Thời hạn giảm một phần ba", unit: "ngày", ends: ["Luật 2024", "NQ 254"],
    items: [{ label: "Nông nghiệp", value: 90, after: 60 }, { label: "Phi nông nghiệp", value: 180, after: 120 }], insight: { value: "−⅓", text: "Cả hai loại đất" } };
  const t2 = buildDeck({ slides: [cover, tb, slope] });
  assert.ok(t2.all.includes("trình bày cùng một dữ liệu hai lần"), t2.all);
});
test("closing phải trả lời đúng số câu hỏi của agenda; không chấm cuối tiêu đề", () => {
  const ag = { type: "agenda", title: "Hai câu hỏi", items: ["Mua hay vay?", "Ai thiệt?"] };
  const cl = { type: "closing", title: "Người mua thiệt nhất", rec: { title: "Kiến nghị", items: ["Hướng dẫn tiêu chí ngay tình"] } };
  const a = buildDeck({ slides: [cover, ag, cl] }); assert.ok(a.all.includes("kết luận không trả lời"), a.all);
  const b = buildDeck({ slides: [cover, ag, Object.assign({}, cl, { answers: [{ q: "Câu 01", a: "Vay trá hình" }] })] }); assert.ok(b.all.includes("1 câu trả lời nhưng mục lục có 2"), b.all);
  const ok = Object.assign({}, cl, { verdict: "Đúng kết quả, thiếu lập luận", answers: [{ q: "Câu 01 · Mua hay vay", a: "Vay trá hình — Điều 129 BLDS 33/2005/QH11" }, { q: "Câu 02 · Ai thiệt", a: "Người mua thiệt 350 triệu", tone: "bad" }] });
  const c = buildDeck({ slides: [cover, ag, ok] }, ["--strict"]); assert.strictEqual(c.code, 0, c.all);
  assert.ok(buildDeck({ slides: [cover, Object.assign({}, cl, { title: "Kết thúc." })] }).all.includes("dấu chấm"));
});
test("meta.motif: mảng 2 tên hợp lệ; 3 tên hoặc tên lạ -> lỗi", () => {
  assert.strictEqual(buildDeck({ meta: { motif: ["cadastral", "lines"] }, slides: [cover, ledger] }, ["--strict"]).code, 0);
  assert.strictEqual(buildDeck({ meta: { motif: ["dots", "lines", "grid"] }, slides: [cover] }).code, 2);
  assert.strictEqual(buildDeck({ meta: { motif: ["dots", "xyz"] }, slides: [cover] }).code, 2);
});
test("nhận định không có dẫn chứng -> cảnh báo; có điều luật/số liệu -> không", () => {
  const a = buildDeck({ slides: [cover, { type: "agenda", title: "x y z", items: ["a"] }, { type: "panelrows", title: "Cách xử lý này không hợp lý", rows: [{ head: "Lý do", text: "Toà làm vậy" }] }] });
  assert.ok(a.all.includes("không có dẫn chứng"), a.all);
  const b = buildDeck({ slides: [cover, { type: "panelrows", title: "Cách xử lý này không hợp lý", rows: [{ head: "Lý do", text: "Trái khoản 2 Điều 133 BLDS 2015" }] }] });
  assert.ok(!b.all.includes("không có dẫn chứng"), b.all);
});
test("bảng: ô vượt giới hạn ký tự bị cảnh báo đúng vị trí", () => {
  const r = buildDeck({ slides: [cover, { type: "table", title: "Bảng dữ liệu", cols: [{ label: "A" }], rows: [["x".repeat(40)]] }] });
  assert.ok(r.all.includes("rows[0][0]: 40/34"), r.all);
});
test("ký tự trang trí / ngoặc thẳng / -> bị cảnh báo", () => {
  const r = buildDeck({ slides: [cover, Object.assign({}, ledger, { note: "★ Kết quả -> \"thiệt\"" })] });
  assert.ok(r.all.includes('ký tự trang trí "★"') && r.all.includes('"→"') && r.all.includes("“ ”"), r.all);
});
test("icon Phosphor dùng được; tên lạ vẫn báo lỗi", () => {
  assert.strictEqual(buildDeck({ slides: [cover, { type: "cards", title: "Các bên liên quan", items: [{ icon: "PiBankDuotone", name: "Ngân hàng" }] }] }, ["--strict"]).code, 0);
  assert.strictEqual(buildDeck({ slides: [cover, { type: "cards", title: "x", items: [{ icon: "PiNope", name: "A" }] }] }).code, 2);
});
test("ảnh thật: thiếu file -> lỗi; thiếu thông tin ghi công -> cảnh báo; có photoCredit -> sạch", () => {
  const dir = require("./helpers").tmpdir(); fs.mkdirSync(require("path").join(dir, "images"));
  const sharp = require("sharp");
  return sharp({ create: { width: 1920, height: 1080, channels: 3, background: "#557766" } }).jpeg().toFile(require("path").join(dir, "images", "a.jpg")).then(() => {
    const miss = buildDeck({ slides: [cover, { type: "photo", title: "Lời kết ngắn gọn", photo: "images/khong-co.jpg" }] }, [], dir);
    assert.strictEqual(miss.code, 2, miss.all); assert.ok(miss.all.includes("không tìm thấy"), miss.all);
    const noCred = buildDeck({ slides: [cover, { type: "photo", title: "Lời kết ngắn gọn", photo: "images/a.jpg" }] }, [], dir);
    assert.ok(noCred.all.includes("thiếu thông tin ghi công"), noCred.all);
    const ok = buildDeck({ slides: [cover, { type: "photo", title: "Lời kết ngắn gọn", photo: "images/a.jpg", photoCredit: "Ảnh: Tác giả · CC BY 4.0 · Wikimedia Commons" }] }, ["--strict"], dir);
    assert.strictEqual(ok.code, 0, ok.all);
  });
});
test("fork: branches[].pick làm nổi cách được chọn", () => {
  const r = buildDeck({ slides: [cover, { type: "fork", title: "Hai cách đọc điều luật", branches: [{ tag: "Cách 1", head: "Điểm b", text: "Theo khoản 1 Điều 688 BLDS 91/2015/QH13" }, { tag: "Cách 2", head: "Điểm c", text: "Theo khoản 1 Điều 688", pick: true }] }] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
});
test("split / gallery / quoteDoc / imagePolicy", () => {
  const P = require("path"), dir = require("./helpers").tmpdir(); fs.mkdirSync(P.join(dir, "images"));
  const sharp = require("sharp"), mk = (f) => sharp({ create: { width: 1920, height: 1280, channels: 3, background: "#8899aa" } }).jpeg().toFile(P.join(dir, "images", f));
  return Promise.all([mk("a.jpg"), mk("b.jpg"), mk("c.jpg")]).then(() => {
    const cr = "Ảnh: Tác giả · CC BY 4.0 · Wikimedia Commons";
    const r = buildDeck({ slides: [cover,
      { type: "split", title: "Ngôi nhà vẫn có người ở", photo: "images/a.jpg", photoCredit: cr, photoStyle: "natural", photoMark: { x: 0.5, y: 0.5, label: "Ban công" }, items: [{ head: "Ý một", text: "Giải thích" }] },
      { type: "gallery", title: "Hiện trạng nhà đất", photos: [{ photo: "images/c.jpg", caption: "Mặt tiền", photoCredit: cr }, { photo: "images/b.jpg", caption: "Lối vào", photoCredit: cr, photoStyle: "bw" }] },
      { type: "evidence", title: "Toà xác định là vay", quoteDoc: "BẢN ÁN 142/2019/DS-PT", quote: "Thực chất là giao dịch giả tạo.", items: [{ head: "Chỉ 1 ngày" }] }] }, ["--strict"], dir);
    assert.strictEqual(r.code, 0, r.all);
    const web = { type: "photo", title: "Lời kết ngắn gọn", photo: "images/a.jpg", photoSource: "https://example.com/anh" };
    // "open" đặt rõ → ảnh web bị cảnh báo; mặc định (không ghi) = "classroom" → qua --strict
    assert.ok(buildDeck({ meta: { imagePolicy: "open" }, slides: [cover, web] }, [], dir).all.includes('imagePolicy = "classroom"'));
    const cls = buildDeck({ slides: [cover, web] }, ["--strict"], dir);
    assert.strictEqual(cls.code, 0, cls.all); assert.ok(cls.all.includes("KHÔNG đăng công khai"), cls.all);
  });
});

test("share + chart slope + photo callouts dựng được; pct ngoài (0,100) -> lỗi", () => {
  const share = { type: "share", title: "Đủ 75% đồng thuận thì thu hồi phần còn lại", pct: 75, legend: ["đã đồng ý", "chưa đồng ý"], items: [{ head: "Trên 75% diện tích", text: "đã thoả thuận" }] };
  const tbl = { type: "table", title: "Thời hạn thông báo thu hồi", cols: [{ label: "Loại đất" }, { label: "Trước" }, { label: "Sau" }], rows: [["Nông nghiệp", "90", "60"], ["Phi nông nghiệp", "180", "120"]] };
  const slope = { type: "chart", kind: "slope", title: "Thời hạn thông báo giảm một phần ba", unit: "ngày", ends: ["Luật 2024", "NQ 254"], items: [{ label: "Nông nghiệp", value: 90, after: 60 }, { label: "Phi nông nghiệp", value: 180, after: 120, focus: true }], insight: { value: "−⅓", text: "Cả hai loại đất" } };
  const r = buildDeck({ slides: [cover, share, slope] }, ["--strict"]); // biểu đồ slope đã ghi số hai đầu — không cần bảng trùng dữ liệu
  assert.strictEqual(r.code, 0, r.all);
  assert.strictEqual(buildDeck({ slides: [cover, Object.assign({}, share, { pct: 120 })] }).code, 2);
  const noAfter = buildDeck({ slides: [cover, tbl, Object.assign({}, slope, { items: [{ label: "a", value: 1 }] })] });
  assert.strictEqual(noAfter.code, 2, noAfter.all); assert.ok(noAfter.all.includes("items[0].after"), noAfter.all);
});
test("lint điều hướng: Phần thiếu slide mở đầu, mục lục lệch số phần, quá nhiều chỗ nhấn", () => {
  const c = (k, t) => ({ type: "cards", kicker: k, title: t, items: [{ name: "A", desc: "a" }, { name: "B", desc: "b" }, { name: "C", desc: "c" }] });
  const r = buildDeck({ slides: [cover, { type: "agenda", title: "Ba phần của bài", items: ["Một", "Hai", "Ba"] },
    { type: "section", num: "1", title: "Phần một" }, c("Phần 1 · A", "Ý thứ nhất của phần một"), c("Phần 2 · B", "Ý thứ nhất của phần hai"),
    Object.assign(c("Phần 2 · C", "Ý thứ hai của phần hai"), { items: [{ name: "A", desc: "[a] [b] [c]" }, { name: "B", desc: "b" }, { name: "C", desc: "c" }] })] });
  assert.ok(r.all.includes("Phần 2 không có slide mở đầu"), r.all);
  assert.ok(!r.all.includes("Phần 1 không có slide mở đầu"), r.all);
  assert.ok(r.all.includes("Mục lục (agenda) có 3 mục nhưng bài chia 2 phần"), r.all);
  assert.ok(r.all.includes("3 chỗ nhấn"), r.all);
});

test("chart column: chuỗi năm 2 series, số âm, dải giai đoạn dựng được --strict; bar với nhãn năm -> cảnh báo", () => {
  const yrs = ["2018", "2019", "2020", "2021", "2022", "2023", "2024"], vals = [70, 60, 39, 69, 152, -10, -19];
  const col = { type: "chart", kind: "column", title: "Quỹ đảo chiều từ năm 2023", unit: "nghìn tỷ", items: yrs.map((y, i) => ({ label: y, value: vals[i] })), bands: [{ from: "2020", to: "2021", label: "COVID-19" }],
    insight: { value: "−19", text: "Âm hai năm liền" } };
  const r = buildDeck({ slides: [cover, col] }, ["--strict"]); assert.strictEqual(r.code, 0, r.all);
  const two = Object.assign({}, col, { series: ["Bắt buộc", "Tự nguyện"], items: yrs.map((y, i) => ({ label: y, value: 12 + i, value2: 0.2 * i })) });
  assert.strictEqual(buildDeck({ slides: [cover, two] }, ["--strict"]).code, 0);
  assert.ok(buildDeck({ slides: [cover, Object.assign({}, two, { series: undefined })] }).all.includes('thiếu "series"'));
  const bar = buildDeck({ slides: [cover, Object.assign({}, col, { kind: "bar", items: col.items.slice(0, 5).map(it => ({ label: it.label, value: Math.abs(it.value) })) })] });
  assert.ok(bar.all.includes('dùng kind "column"'), bar.all);
});
test("share offTone muted dựng được", () => {
  const sh = { type: "share", title: "Cứ 100 người, 12 người tự nguyện", pct: 12, style: "grid", offTone: "muted", legend: ["tự nguyện", "bắt buộc"], items: [{ head: "Năm 2015: 2 người", text: "tăng gần 6 lần" }] };
  const r = buildDeck({ slides: [cover, sh] }, ["--strict"]); assert.strictEqual(r.code, 0, r.all);
  assert.strictEqual(buildDeck({ slides: [cover, Object.assign({}, sh, { offTone: "red" })] }).code, 2);
});
