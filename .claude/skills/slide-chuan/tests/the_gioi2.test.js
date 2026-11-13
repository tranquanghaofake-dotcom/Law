// Test 4 world đợt 2 + khối hình chính: hoa-don/receipt · sao-ke/statement · co-cau/captable · bien-ban/record.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const JSZip = require("jszip");
const { buildDeck } = require("./helpers");
const { validate } = require("../engine/validate");
const cover = { type: "cover", title: "Tiêu đề thử", notes: "Mở." };
const xmlOf = async (pptx, n) => (await JSZip.loadAsync(fs.readFileSync(pptx))).file(`ppt/slides/slide${n}.xml`).async("string");
const SL = {
  receipt: { type: "receipt", kicker: "Thuế cộng vào đâu?", title: "Thuế GTGT tính trên giá chưa thuế", head: "Hoá đơn minh hoạ", unit: "đồng",
    items: [{ label: "Bàn làm việc", display: "2.000.000" }, { label: "Ghế xoay", display: "1.000.000" }, { label: "Phí lắp đặt", display: "500.000", focus: true }],
    sub: { label: "Cộng tiền hàng", display: "3.500.000" }, tax: { label: "Thuế suất 10%", display: "350.000" }, total: { label: "Tổng thanh toán", display: "3.850.000" },
    points: [{ head: "Giá chưa thuế", text: "Là căn cứ tính thuế" }, { head: "Phí lắp đặt", text: "Cũng chịu thuế cùng hàng" }], notes: "x" },
  account: { type: "account", kicker: "Tiền đi đâu?", title: "Khoản trừ lớn nhất là phí trả nợ trước hạn", unit: "nghìn đồng", open: "50.000", close: "31.200",
    rows: [{ date: "01/03", desc: "Nhận lương", amount: 15000, balance: "65.000" }, { date: "05/03", desc: "Trả nợ gốc", amount: -20000, balance: "45.000" },
      { date: "05/03", desc: "Phí trả nợ trước hạn", amount: -13000, balance: "32.000", focus: true }, { date: "10/03", desc: "Phí dịch vụ", amount: -800, balance: "31.200" }], notes: "x" },
  captable: { type: "captable", kicker: "Nghị quyết cần bao nhiêu phiếu?", title: "Cổ đông A một mình thông qua được nghị quyết thường", company: "Công ty cổ phần X",
    holders: [{ name: "Cổ đông A", pct: 55, sub: "Sáng lập", focus: true }, { name: "Cổ đông B", pct: 25 }, { name: "Cổ đông C", pct: 12 }],
    thresholds: [{ pct: 50, label: "> 50%: nghị quyết thường" }, { pct: 65, label: "≥ 65%: vấn đề quan trọng" }], notes: "x" },
  record: { type: "record", kicker: "Biên bản có hiệu lực không?", title: "Người vi phạm từ chối ký thì phải ghi rõ lý do", head: "Biên bản (minh hoạ)",
    fields: [{ label: "Thời gian", value: "9 giờ, ngày 12/3" }, { label: "Địa điểm", value: "Trước số 10 đường A" }, { label: "Hành vi", value: "Đỗ xe trên vỉa hè" }, { label: "Lý do không ký", value: "Chưa ghi", tone: "bad" }],
    signs: [{ role: "Người lập", state: "signed" }, { role: "Người vi phạm", state: "refused" }, { role: "Người chứng kiến", state: "absent" }],
    points: [{ head: "Từ chối ký", text: "Ví dụ: ghi “không ký vì không đồng ý”" }], notes: "x" } };
const KIT = { receipt: "hoa-don", account: "sao-ke", captable: "co-cau", record: "bien-ban" };

test("khối hình đợt 2: chặn dữ liệu sai; gợi ý da theo đề tài; da lệch đề tài → gợi ý", () => {
  assert.ok(validate({ slides: [cover, Object.assign({}, SL.captable, { holders: [{ name: "A", pct: 70 }, { name: "B", pct: 40 }] })] }).errors.join().includes("holders"));
  assert.ok(validate({ slides: [cover, Object.assign({}, SL.captable, { thresholds: [{ pct: 120, label: "x" }] })] }).errors.join().includes("thresholds[0].pct"));
  assert.ok(validate({ slides: [cover, Object.assign({}, SL.receipt, { items: [{ label: "x", display: "1" }] })] }).errors.join().includes("items"));
  assert.ok(validate({ slides: [cover, Object.assign({}, SL.record, { signs: [{ role: "A", state: "maybe" }] })] }).errors.length);
  assert.ok(validate({ slides: [cover, Object.assign({}, SL.account, { rows: SL.account.rows.map(r => Object.assign({}, r, { focus: true })) })] }).warnings.join().includes("nhiều dòng focus"));
  for (const [kit, short] of [["hoa-don", "Luật Quản lý thuế"], ["sao-ke", "Hợp đồng tín dụng ngân hàng"], ["co-cau", "Cổ đông công ty cổ phần"], ["bien-ban", "Xử phạt vi phạm hành chính"]])
    assert.match(validate({ meta: { kind: "report", short }, slides: [Object.assign({}, cover, { title: short })] }).hints.join(), new RegExp(`hợp da "${kit}"`), short);
  assert.match(validate({ meta: { da: "hoa-don", short: "Giao thông đường bộ" }, slides: [cover] }).hints.join(), /Da "hoa-don" .* không hợp đề tài/);
  assert.doesNotMatch(validate({ meta: { da: "hoa-don", short: "Luật Quản lý thuế" }, slides: [cover] }).hints.join(), /không hợp đề tài/);
});

test("rà soát độc lập: tỉ lệ âm/>100 bị chặn; dấu display khác amount bị chặn; receipt bỏ sub/tax vẫn dựng; thiếu total bị chặn", () => {
  assert.ok(validate({ slides: [cover, Object.assign({}, SL.captable, { holders: [{ name: "A", pct: -50 }, { name: "B", pct: 140 }, { name: "C", pct: 0 }] })] }).errors.join().includes("holders[0].pct"));
  assert.ok(validate({ slides: [cover, Object.assign({}, SL.account, { rows: [Object.assign({}, SL.account.rows[0], { amount: 999, display: "−999" }), ...SL.account.rows.slice(1)] })] }).errors.join().includes("rows[0].display"));
  const bare = Object.assign({}, SL.receipt); delete bare.sub; delete bare.tax;
  const r = buildDeck({ slides: [cover, bare] }, ["--strict"]); assert.strictEqual(r.code, 0, r.all);
  const nt = Object.assign({}, SL.receipt); delete nt.total;
  assert.ok(validate({ slides: [cover, nt] }).errors.join().includes("total"));
});
