// Bộ vật 3D Fluent (MIT) — trả data URI PNG, gõ sai tên thì báo lỗi kèm gợi ý; có giấy phép đi kèm
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), path = require("path");
const { f3d, coF3d, danhSachF3d } = require("../hinh/f3d");

test("f3d(): data URI PNG, sai tên báo lỗi có gợi ý, có file giấy phép MIT", () => {
  assert.ok(f3d("can").startsWith("data:image/png;base64,"));
  assert.ok(coF3d("cong-nhan") && !coF3d("khong-co"));
  assert.throws(() => f3d("cann"), /can/);
  assert.ok(danhSachF3d().length >= 60);
  assert.ok(/MIT License/.test(fs.readFileSync(path.join(__dirname, "..", "hinh", "f3d", "LICENSE-fluentui-emoji.txt"), "utf8")));
});
