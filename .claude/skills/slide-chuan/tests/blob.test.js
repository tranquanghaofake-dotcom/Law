const test = require("node:test"), assert = require("node:assert");
const { blob } = require("../scripts/blob");
test("blob: cùng hạt giống → cùng hình; khép kín; nằm trong khung ± lệch", () => {
  assert.strictEqual(blob(100, 100, 50, 40, { hat: 7 }), blob(100, 100, 50, 40, { hat: 7 }));
  assert.notStrictEqual(blob(100, 100, 50, 40, { hat: 7 }), blob(100, 100, 50, 40, { hat: 8 }));
  const d = blob(100, 100, 50, 40); assert.match(d, /^M[\d.]+ [\d.]+( C[\d. ]+)+Z$/);
  const so = d.match(/[\d.]+/g).map(Number); assert.ok(Math.max(...so) < 100 + 50 * 1.6 && Math.min(...so) > 100 - 50 * 1.6);
});
