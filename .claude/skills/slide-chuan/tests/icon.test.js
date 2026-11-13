// Bộ icon Phosphor (MIT) chép vào hinh/icons — hàm icon() tô màu nét + lớp nền hai tông, báo lỗi rõ khi gõ sai tên
const test = require("node:test"), assert = require("node:assert");
const { icon, coIcon } = require("../hinh/icon");

test("icon(): tô màu nét và lớp nền, có kích thước 100 %, gõ sai tên thì báo lỗi kèm gợi ý", () => {
  const s = icon("umbrella", { mau: "276a58", nen: "d8b35e" });
  assert.ok(s.startsWith("<svg") && s.includes('width="100%"') && s.includes('fill="#276a58"') && s.includes('fill="#d8b35e"'), s.slice(0, 200));
  assert.ok(!s.includes("currentColor"));
  assert.ok(coIcon("scales") && !coIcon("khong-co"));
  assert.throws(() => icon("umbrela"), /umbrella/);
});
