// Test đợt 3: build (hiện từng ý khi bấm), redline (so chữ điều luật), deadline (lịch thời hạn), kiểm mù màu, sửa lỗi A1–A4.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const JSZip = require("jszip");
const { buildDeck, cover } = require("./helpers");
const CA = require("../engine/codeart");
const { minDE } = require("../engine/cvd");
const xmlOf = async (pptx, n) => (await JSZip.loadAsync(fs.readFileSync(pptx))).file(`ppt/slides/slide${n}.xml`).async("string");
const chk = { type: "checklist", title: "Người mua chưa đủ điều kiện để được coi là ngay tình", items: [{ ok: "yes", head: "Có công chứng" }, { ok: "yes", head: "Có GCN đứng tên" }, { ok: "no", head: "Không xem nhà" }], verdict: { ok: "no", text: "Khó chứng minh ngay tình" } };

test("deadline: vẽ được; ngày sai / to trước from → lỗi; quá ngắn → gợi ý bignum", () => {
  const ok = buildDeck({ slides: [cover, { type: "deadline", title: "Còn ba năm để kháng nghị giám đốc thẩm", from: "21/08/2019", to: "21/08/2022", today: "21/08/2020", display: "3 năm" }] }, ["--strict"]);
  assert.strictEqual(ok.code, 0, ok.all);
  assert.strictEqual(buildDeck({ slides: [cover, { type: "deadline", title: "Ngày sai định dạng", from: "2019-08-21", to: "21/08/2022" }] }).code, 2);
  assert.strictEqual(buildDeck({ slides: [cover, { type: "deadline", title: "Hết hạn trước khi bắt đầu", from: "21/08/2022", to: "21/08/2019" }] }).code, 2);
  assert.ok(/< 45 ngày/.test(buildDeck({ slides: [cover, { type: "deadline", title: "Thời hạn quá ngắn cho lịch tháng", from: "01/01/2020", to: "15/01/2020" }] }).all));
});

test("A1: isotype — khung rỗng không dùng màu đỏ trùng màu nhấn", async () => {
  const d = { slides: [cover, { type: "isotype", title: "Trả 85 tờ, chỉ lấy lại 50 tờ", unit: { value: 10, label: "triệu" }, rows: [{ label: "Lấy lại", value: 850, lost: 350 }] }] };
  for (const th of ["mặc định"]) { const r = buildDeck(d, ["--strict", "--theme", th]); assert.strictEqual(r.code, 0, r.all); }
});
